import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Satellite as SatelliteDish, Sparkles, Upload, 
  RotateCcw, CheckCircle, ChevronRight,
  Crosshair, Waves, Wind, Activity, Layers, Compass,
  Play, Pause, Film, Globe, Eye, CloudRain, Clock, 
  RefreshCw, AlertTriangle, Check, FileImage, ShieldCheck,
  Target, Info, ArrowUpRight
} from 'lucide-react';
import { 
  detectCycloneFromImage, 
  classifyMorphologyPattern,
  getFormattedLastUpdated
} from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import InfoCallout from '../components/InfoCallout';

const SATELLITE_PRESETS = [
  {
    id: 'nasa-viirs-dana',
    name: 'Cyclone DANA (2024)',
    satellite: 'Suomi NPP / VIIRS Corrected Reflectance',
    band: 'TrueColor Optical (0.64, 0.55, 0.47 µm)',
    source: 'NASA EOSDIS GIBS',
    resolution: '250 m',
    basin: 'Bay of Bengal',
    dateStr: '2024-10-24',
    image: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=8,75,23,95&TIME=2024-10-24&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  },
  {
    id: 'nasa-modis-biparjoy',
    name: 'Cyclone BIPARJOY (2023)',
    satellite: 'Aqua / MODIS Corrected Reflectance',
    band: 'Visible TrueColor (0.65 µm)',
    source: 'NASA EOSDIS GIBS',
    resolution: '250 m',
    basin: 'Arabian Sea',
    dateStr: '2023-06-14',
    image: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Aqua_CorrectedReflectance_TrueColor&BBOX=15,62,26,75&TIME=2023-06-14&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  }
];

const Satellite = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Selected Preset or Uploaded File
  const [selectedPreset, setSelectedPreset] = useState(SATELLITE_PRESETS[0]);
  const [customFile, setCustomFile] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const [imageMetadata, setImageMetadata] = useState({
    name: SATELLITE_PRESETS[0].name,
    sizeKb: null,
    dimensions: '1024 × 768 px',
    type: 'NASA GIBS Tile Snapshot'
  });

  // Real AI Inference State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inferenceStatus, setInferenceStatus] = useState('ready'); // 'ready' | 'running' | 'success' | 'error'
  const [analysisProgressStep, setAnalysisProgressStep] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Visualization View: 'overlay' | 'original'
  const [visualMode, setVisualMode] = useState('overlay');
  const [showCenterPin, setShowCenterPin] = useState(true);
  const [showBbox, setShowBbox] = useState(true);
  const [showGradCamFoci, setShowGradCamFoci] = useState(true);

  // Handle local image file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous AI outputs immediately
    setDetectionResult(null);
    setClassificationResult(null);
    setAnalysisError(null);
    setInferenceStatus('ready');

    const objectUrl = URL.createObjectURL(file);
    setCustomImageUrl(objectUrl);
    setCustomFile(file);

    // Read natural image dimensions
    const img = new Image();
    img.onload = () => {
      setImageMetadata({
        name: file.name,
        sizeKb: (file.size / 1024).toFixed(1),
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        type: file.type || 'image/png'
      });
    };
    img.src = objectUrl;
  };

  // Switch to a verified historical preset
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomFile(null);
    setCustomImageUrl(null);
    setDetectionResult(null);
    setClassificationResult(null);
    setAnalysisError(null);
    setInferenceStatus('ready');

    setImageMetadata({
      name: preset.name,
      sizeKb: null,
      dimensions: '1024 × 768 px',
      type: 'NASA GIBS Tile Snapshot'
    });
  };

  // Run Real End-to-End AI Analysis: MobileNetV3 + ResNet18 + Grad-CAM
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setInferenceStatus('running');
    setAnalysisError(null);
    setDetectionResult(null);
    setClassificationResult(null);

    try {
      let imageBlob = customFile;

      // If analyzing a preset without custom upload, download preset image bytes
      if (!imageBlob) {
        setAnalysisProgressStep('SATELLITE: Loading satellite snapshot raster...');
        const fetchRes = await fetch(selectedPreset.image);
        if (!fetchRes.ok) throw new Error('Failed to retrieve preset satellite frame.');
        imageBlob = await fetchRes.blob();
      } else {
        setAnalysisProgressStep('SATELLITE: Processing uploaded frame in-session...');
      }

      // 1. Run MobileNetV3-Small Detection
      setAnalysisProgressStep('DETECTION: Running MobileNetV3-Small...');
      const detRes = await detectCycloneFromImage(imageBlob, selectedPreset?.basin || 'Bay of Bengal');
      if (!detRes || !detRes.success) {
        throw new Error(detRes?.message || 'MobileNetV3 detection inference failed.');
      }
      setDetectionResult(detRes);

      // If no cyclone detected, do not run downstream morphology
      if (detRes.cyclone_detected === false) {
        setAnalysisProgressStep('DETECTION: Non-cyclonic frame identified.');
        setInferenceStatus('success');
        return;
      }

      // 2. Run ResNet18 Morphology Classification + Grad-CAM
      setAnalysisProgressStep('CLASSIFICATION: Running ResNet18 Morphology...');
      const clsRes = await classifyMorphologyPattern(imageBlob, selectedPreset?.basin || 'Bay of Bengal', 12.0);
      if (!clsRes || !clsRes.success) {
        throw new Error(clsRes?.message || 'ResNet18 morphological classification failed.');
      }
      setClassificationResult(clsRes);
      setInferenceStatus('success');

      setAnalysisProgressStep('EXPLAINABILITY: Generating Grad-CAM attention foci...');
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setAnalysisError(err.message || 'AI ANALYSIS FAILED: Backend connection required.');
      setInferenceStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeImageSource = customImageUrl || selectedPreset.image;

  // Normalized bbox [ymin, xmin, ymax, xmax] mapping to CSS
  const bboxStyle = detectionResult?.bounding_box ? {
    top: `${Math.max(0, (Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[0] : (detectionResult.bounding_box.ymin ?? 0.2)) * 100)}%`,
    left: `${Math.max(0, (Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[1] : (detectionResult.bounding_box.xmin ?? 0.2)) * 100)}%`,
    height: `${Math.max(8, ((Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[2] - detectionResult.bounding_box[0] : (detectionResult.bounding_box.ymax - detectionResult.bounding_box.ymin) || 0.4)) * 100)}%`,
    width: `${Math.max(8, ((Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[3] - detectionResult.bounding_box[1] : (detectionResult.bounding_box.xmax - detectionResult.bounding_box.xmin) || 0.4)) * 100)}%`
  } : null;

  // Normalized center coordinates mapping
  const centerStyle = detectionResult?.center ? {
    top: `${((detectionResult.center.center_y_norm ?? 0.5) * 100).toFixed(1)}%`,
    left: `${((detectionResult.center.center_x_norm ?? 0.5) * 100).toFixed(1)}%`
  } : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* 1. Header Banner */}
      <PageHeader
        categoryBadge="AI COMPUTER VISION"
        categoryColor="blue"
        title="Satellite Imagery Studio"
        subtitle="Ingest multi-spectral NASA GIBS MODIS/VIIRS polar snapshots or upload custom frames for neural detection, center coordinates, and morphology classification."
        modelBadge="MobileNetV3 + ResNet18"
        actions={
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-xs"
            >
              <Upload className="w-4 h-4 text-[#003087]" />
              <span>Upload Frame</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff" 
              onChange={handleFileSelect} 
              className="hidden" 
            />

            <button 
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="btn-primary text-xs font-bold"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 text-sky-300 animate-spin" />
                  <span>Processing Models...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Run AI Analysis</span>
                </>
              )}
            </button>
          </>
        }
      />

      {/* 2. Target Preset Selector or Custom Upload Indicator */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider block">
            Active Satellite Observation Target
          </span>
          <p className="text-xs text-slate-500 mt-0.5">
            {customFile 
              ? 'Custom user-uploaded satellite frame active. Analyzed in-session (Not persisted).' 
              : 'Select an official NASA GIBS polar benchmark snapshot or upload your own frame.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {SATELLITE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                !customFile && selectedPreset.id === p.id
                  ? 'bg-[#003087] text-white border-[#003087] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>🛰️</span>
              <span>{p.name}</span>
            </button>
          ))}

          {customFile && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
              <span>📁</span>
              <span className="truncate max-w-[160px]">{customFile.name}</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Sequential Progress Banner */}
      {isAnalyzing && (
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono text-sky-900 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
          <span className="font-bold">{analysisProgressStep}</span>
        </div>
      )}

      {/* 4. Analysis Error Display */}
      {analysisError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">ANALYSIS FAILED</p>
            <p>{analysisError}</p>
          </div>
        </div>
      )}

      {/* 5. Main 2-Column Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Satellite Image Canvas & Dual Overlay (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {customFile ? 'Uploaded Satellite Frame' : selectedPreset.name}
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {customFile ? 'In-session local memory • Not persisted to database' : `${selectedPreset.satellite} • ${selectedPreset.dateStr}`}
                </p>
              </div>

              {/* View Switcher: AI Overlay vs Original */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
                <button
                  onClick={() => setVisualMode('overlay')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    visualMode === 'overlay'
                      ? 'bg-white text-[#003087] font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AI Analysis Overlay
                </button>
                <button
                  onClick={() => setVisualMode('original')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    visualMode === 'original'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Original Satellite Image
                </button>
              </div>
            </div>

            {/* Satellite Frame Canvas */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/3] flex items-center justify-center shadow-inner">
              <img
                src={activeImageSource}
                alt={imageMetadata.name}
                className="w-full h-full object-contain select-none"
                crossOrigin="anonymous"
              />

              {/* AI Overlay Layer (Visible only when in 'overlay' mode) */}
              {visualMode === 'overlay' && detectionResult?.cyclone_detected && (
                <>
                  {/* Bounding Box Overlay */}
                  {showBbox && bboxStyle && (
                    <div 
                      className="absolute border-2 border-red-500 bg-red-500/15 rounded transition-all duration-300 pointer-events-none"
                      style={bboxStyle}
                    >
                      <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                        CYCLONE EYE BBOX • MobileNetV3
                      </div>
                    </div>
                  )}

                  {/* Detected Center Fix Pin Marker */}
                  {showCenterPin && centerStyle && (
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 z-10"
                      style={centerStyle}
                    >
                      <div className="w-9 h-9 rounded-full border-2 border-amber-300 bg-amber-400/25 animate-ping absolute -top-4.5 -left-4.5" />
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-red-600 shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                        🎯
                      </div>
                      <div className="absolute top-4 -left-16 bg-slate-900/90 text-white px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap shadow border border-amber-300/40">
                        {detectionResult.coordinates?.formatted || 'Eye Center'}
                      </div>
                    </div>
                  )}

                  {/* ResNet18 Grad-CAM Attention Foci Overlays */}
                  {showGradCamFoci && classificationResult?.gradcam_attention_foci?.map((focus, fIdx) => (
                    <div
                      key={fIdx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                      style={{
                        left: `${(focus.x_norm ?? focus.relative_x ?? 0.5) * 100}%`,
                        top: `${(focus.y_norm ?? focus.relative_y ?? 0.5) * 100}%`
                      }}
                    >
                      <div 
                        className="rounded-full border border-amber-400 bg-amber-400/20 animate-pulse"
                        style={{
                          width: `${Math.max(28, (focus.activation_intensity ?? focus.intensity_weight ?? 0.7) * 56)}px`,
                          height: `${Math.max(28, (focus.activation_intensity ?? focus.intensity_weight ?? 0.7) * 56)}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                      <div className="absolute top-2 -left-12 bg-amber-950/90 text-amber-200 border border-amber-400/60 px-1.5 py-0.5 rounded text-[8px] font-mono whitespace-nowrap shadow">
                        {focus.label || focus.description || `Focus #${fIdx + 1}`} ({(((focus.activation_intensity ?? focus.intensity_weight) || 0.8) * 100).toFixed(0)}%)
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Source & Inference Lifecycle Watermarks */}
              <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border backdrop-blur-md shadow-sm ${
                  customFile 
                    ? 'bg-amber-950/85 text-amber-300 border-amber-500/50' 
                    : 'bg-slate-900/85 text-sky-300 border-white/20'
                }`}>
                  {customFile ? 'USER-UPLOADED IMAGE • IN-SESSION ANALYSIS' : `BENCHMARK FRAME: ${selectedPreset.name}`}
                </span>
                {!detectionResult && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-red-950/90 text-red-300 border border-red-500/50 backdrop-blur-md shadow-sm">
                    INPUT IMAGE PREVIEW ONLY — NO INFERENCE EXECUTED
                  </span>
                )}
              </div>

              {/* Status Stamp */}
              {detectionResult ? (
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-slate-900/85 backdrop-blur-md p-2 rounded-xl text-[10px] font-mono text-slate-300 border border-white/10 flex items-center justify-between">
                  <span className={detectionResult.cyclone_detected ? "text-emerald-400 font-bold" : "text-slate-400"}>
                    {detectionResult.cyclone_detected ? "Cyclone Detected: YES" : "NO CYCLONE DETECTED"}
                  </span>
                  {classificationResult && (
                    <span className="text-amber-300">
                      ResNet18: {classificationResult.predicted_pattern}
                    </span>
                  )}
                </div>
              ) : (
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-slate-900/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-400 border border-white/10 flex items-center justify-between">
                  <span>Input Raster Loaded ({imageMetadata.dimensions})</span>
                  <span className="text-amber-400 font-semibold">NO INFERENCE EXECUTED</span>
                </div>
              )}
            </div>

            {/* Image Technical Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Filename</span>
                <span className="font-bold text-slate-800 truncate block" title={imageMetadata.name}>
                  {imageMetadata.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Dimensions</span>
                <span className="font-bold text-slate-800">{imageMetadata.dimensions}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Format / Size</span>
                <span className="font-bold text-slate-800">
                  {imageMetadata.sizeKb ? `${imageMetadata.sizeKb} KB` : 'GeoTIFF / PNG'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Persistence</span>
                <span className="font-bold text-slate-500">In-Session Only</span>
              </div>
            </div>

          </div>

          {/* Scientific Trajectory Protocol Notice */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
              <Info className="w-4 h-4 text-[#003087]" />
              <span>Scientific Sequence Protocol</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Trajectory forecasting requires a valid temporal storm sequence. A single uploaded frame legitimately supports visual detection, center localization, morphology classification, and Grad-CAM explainability.
            </p>
          </div>
        </div>

        {/* Right Column: AI IMAGE ASSESSMENT CARD (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#003087]" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  AI IMAGE ASSESSMENT
                </h3>
              </div>
              {detectionResult ? (
                <span className="badge badge-green text-[10px]">Analysis Complete</span>
              ) : isAnalyzing ? (
                <span className="badge badge-yellow animate-pulse text-[10px]">Processing Pipeline...</span>
              ) : (
                <span className="badge badge-red font-mono text-[10px]">NO INFERENCE EXECUTED</span>
              )}
            </div>

            {detectionResult ? (
              <div className="space-y-3.5 text-xs">
                
                {/* 1. DETECTION (MobileNetV3-Small) */}
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  detectionResult.cyclone_detected 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider block text-slate-500">
                    Detection (MobileNetV3-Small)
                  </span>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Cyclone Detected:</span>
                    <span className={`font-bold font-mono ${
                      detectionResult.cyclone_detected ? 'text-emerald-800' : 'text-slate-600'
                    }`}>
                      {detectionResult.cyclone_detected ? 'YES' : 'NO CYCLONE DETECTED'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Objectness Confidence:</span>
                    <span className="font-bold font-mono">
                      {((detectionResult.objectness ?? (detectionResult.confidence_percentage / 100)) * 100).toFixed(1)}%
                    </span>
                  </div>
                  {detectionResult.cyclone_detected && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Center Coordinates:</span>
                        <span className="font-bold font-mono text-sky-800">
                          {detectionResult.coordinates?.formatted || `${detectionResult.center?.lat?.toFixed(2)}°N, ${detectionResult.center?.lon?.toFixed(2)}°E`}
                        </span>
                      </div>
                      {detectionResult.bounding_box && (
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">Bounding Box:</span>
                          <span className="font-mono text-slate-700 font-medium">
                            {Array.isArray(detectionResult.bounding_box)
                              ? `[${detectionResult.bounding_box.map(n => typeof n === 'number' ? n.toFixed(2) : n).join(', ')}]`
                              : `[${detectionResult.bounding_box.ymin?.toFixed(2)}, ${detectionResult.bounding_box.xmin?.toFixed(2)}, ${detectionResult.bounding_box.ymax?.toFixed(2)}, ${detectionResult.bounding_box.xmax?.toFixed(2)}]`}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* If no cyclone detected */}
                {!detectionResult.cyclone_detected && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs space-y-1">
                    <p className="font-bold text-slate-800">NO CYCLONE DETECTED</p>
                    <p className="text-[11px] text-slate-500">
                      The MobileNetV3 detector classified this frame as ambient / non-cyclonic marine atmosphere. Downstream tropical cyclone morphology and trajectory forecasting are omitted.
                    </p>
                  </div>
                )}

                {/* 2. MORPHOLOGY (ResNet18) - Only if cyclone detected */}
                {detectionResult.cyclone_detected && classificationResult && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-wider block text-slate-500">
                      Morphology (ResNet18)
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Predicted Pattern:</span>
                      <span className="font-bold text-violet-800">{classificationResult.predicted_pattern}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Classifier Confidence:</span>
                      <span className="font-bold font-mono text-slate-800">
                        {classificationResult.confidence_percentage?.toFixed(1)}%
                      </span>
                    </div>

                    {/* Class Distribution without Dvorak T-numbers */}
                    {classificationResult.class_probability_distribution && (
                      <div className="pt-1.5 border-t border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Class Distribution
                        </span>
                        {classificationResult.class_probability_distribution.map((item, idx) => (
                          <div key={item.class_id || idx} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-700">{item.class_name}</span>
                              <span className="font-mono font-semibold text-slate-800">{item.probability_pct?.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-[#003087] h-1.5 rounded-full" 
                                style={{ width: `${Math.min(100, Math.max(1, item.probability_pct || 0))}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. EXPLAINABILITY (Grad-CAM) - Only if cyclone detected */}
                {detectionResult.cyclone_detected && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-wider block text-slate-500">
                      Explainability (Grad-CAM)
                    </span>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Attention Foci:</span>
                      <span className="font-bold text-amber-700 font-mono">
                        {classificationResult?.gradcam_attention_foci?.length 
                          ? `${classificationResult.gradcam_attention_foci.length} Hotspots Localized` 
                          : (classificationResult ? 'Available' : 'Pending')}
                      </span>
                    </div>
                    {classificationResult?.gradcam_attention_foci?.length > 0 && (
                      <div className="pt-1 space-y-1">
                        {classificationResult.gradcam_attention_foci.map((focus, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600">
                            <span>{focus.label || focus.description || `Focus #${idx + 1}`}</span>
                            <span className="font-mono font-medium text-amber-700">
                              {focus.activation_intensity ? `${(focus.activation_intensity * 100).toFixed(0)}%` : 'Active'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. INTENSITY ASSESSMENT - Scientific Status Disclosure */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider block text-slate-500">
                    Intensity Assessment
                  </span>
                  <div className="flex items-start gap-1.5">
                    <span className="text-xs font-semibold text-slate-700 shrink-0">Status:</span>
                    <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 leading-tight">
                      NOT AVAILABLE FROM CURRENT SINGLE-FRAME VISION MODEL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-0.5">
                    Operational cyclone intensity estimation requires temporal satellite observations and additional meteorological observations. The current VAYU vision pipeline focuses on cyclone detection, center localization, morphology classification and visual explainability.
                  </p>
                </div>

                {/* 5. INFERENCE */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider block text-slate-500">
                    Inference Latency
                  </span>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600">Detection (MobileNetV3-Small):</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {detectionResult.inference_time_ms} ms
                    </span>
                  </div>
                  {classificationResult && (
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-600">Classification (ResNet18):</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {classificationResult.inference_time_ms} ms
                      </span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <EmptyState
                icon={Target}
                title="NO INFERENCE EXECUTED"
                description="This is an input raster preview. Click 'Run AI Analysis' above to execute MobileNetV3 detection and ResNet18 morphology."
                action={
                  <button
                    onClick={handleRunAIAnalysis}
                    disabled={isAnalyzing}
                    className="btn-primary text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run AI Analysis</span>
                  </button>
                }
              />
            )}

            {/* Downstream Navigation */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate('/dashboard/detection')}
                  className="btn-primary text-xs py-2 justify-center gap-1"
                >
                  <span>Cyclone Detection</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => navigate('/dashboard/classification')}
                  className="btn-primary text-xs py-2 justify-center gap-1"
                >
                  <span>Morphology</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary w-full text-xs py-2 justify-center gap-1.5"
              >
                <span>Return to Command Overview</span>
              </button>
              <p className="text-[10px] text-slate-400 font-mono text-center leading-tight">
                Command Overview evaluates official benchmark cases (DANA & BIPARJOY). In-session uploads remain strictly isolated to this page.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Satellite;
