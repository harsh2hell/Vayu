import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Upload, ChevronRight, RefreshCw, AlertTriangle,
  Target, Layers, Eye, Crosshair, ShieldCheck,
  Image as ImageIcon, X
} from 'lucide-react';
import { 
  detectCycloneFromImage, 
  classifyMorphologyPattern
} from '../services/api';
import PageHeader from '../components/PageHeader';
import { useAnalysisSession } from '../context/AnalysisSessionContext';

const SATELLITE_PRESETS = [
  {
    id: 'dana-2024',
    name: 'Cyclone DANA (2024)',
    satellite: 'Suomi NPP / VIIRS Corrected Reflectance',
    band: 'TrueColor Optical (0.64, 0.55, 0.47 µm)',
    source: 'NASA EOSDIS GIBS',
    resolution: '250 m',
    basin: 'Bay of Bengal',
    dateStr: '2024-10-24',
    bbox_geo: [8.0, 75.0, 23.0, 95.0],
    image: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=8,75,23,95&TIME=2024-10-24&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  },
  {
    id: 'biparjoy-2023',
    name: 'Cyclone BIPARJOY (2023)',
    satellite: 'Aqua / MODIS Corrected Reflectance',
    band: 'Visible TrueColor (0.65 µm)',
    source: 'NASA EOSDIS GIBS',
    resolution: '250 m',
    basin: 'Arabian Sea',
    dateStr: '2023-06-12',
    bbox_geo: [12.0, 58.0, 26.0, 76.0],
    image: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Aqua_CorrectedReflectance_TrueColor&BBOX=12,58,26,76&TIME=2023-06-12&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  }
];

const Satellite = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);
  
  // Shared Analysis Session Context
  const {
    currentInput,
    detectionResult,
    classificationResult,
    setInputFromUpload,
    setInputFromPreset,
    setFullPipelineResults
  } = useAnalysisSession();

  // On new session or refresh, start with an empty upload stage by default
  const [hasSelectedFrame, setHasSelectedFrame] = useState(() => {
    return Boolean(currentInput?.inputType === 'upload' && currentInput?.file);
  });

  // Active Preset matching session or default
  const selectedPreset = SATELLITE_PRESETS.find(p => p.id === currentInput?.presetId) || SATELLITE_PRESETS[0];
  const isCustomUpload = currentInput?.inputType === 'upload';
  const customFile = isCustomUpload ? currentInput.file : null;

  // Real AI Inference State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState('');
  const [analysisError, setAnalysisError] = useState(null);

  // Visualization Modes & Toggles
  const [visualMode, setVisualMode] = useState('overlay'); // 'overlay' | 'original'
  const [showCenterReticle, setShowCenterReticle] = useState(true);
  const [showBboxOverlay, setShowBboxOverlay] = useState(true);
  const [showGradCamFoci, setShowGradCamFoci] = useState(true);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Process file upload helper
  const processSelectedFile = useCallback((file) => {
    if (!file) return;
    setAnalysisError(null);

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setInputFromUpload(file, objectUrl, {
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`,
        sizeKb: (file.size / 1024).toFixed(1),
        type: file.type || 'image/png'
      }, 'Bay of Bengal');
      setHasSelectedFrame(true);
    };
    img.src = objectUrl;
  }, [setInputFromUpload]);

  // Handle local image file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processSelectedFile(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processSelectedFile(file);
    }
  };

  // Switch to a verified historical preset
  const handleSelectPreset = (preset) => {
    setAnalysisError(null);
    setInputFromPreset({
      id: preset.id,
      name: preset.name,
      url: preset.image,
      basin: preset.basin,
      bbox_geo: preset.bbox_geo
    });
    setHasSelectedFrame(true);
  };

  // Reset/Clear active frame to empty upload view
  const handleClearFrame = () => {
    setHasSelectedFrame(false);
    setFullPipelineResults({ detectionResult: null, classificationResult: null });
  };

  // Run Real End-to-End AI Analysis: MobileNetV3 + ResNet18 + Grad-CAM
  const handleRunAIAnalysis = useCallback(async () => {
    if (isAnalyzing || !hasSelectedFrame) return;
    const requestSessionId = currentInput?.sessionId;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let imageBlob = currentInput?.file;

      if (!imageBlob && currentInput?.imageUrl) {
        setAnalysisProgressStep('Ingesting high-resolution satellite raster...');
        const fetchRes = await fetch(currentInput.imageUrl);
        if (!fetchRes.ok) throw new Error('Failed to retrieve satellite frame raster.');
        imageBlob = await fetchRes.blob();
      } else {
        setAnalysisProgressStep('Preprocessing uploaded raster frame...');
      }

      // 1. Run MobileNetV3-Small Detection
      setAnalysisProgressStep('Running MobileNetV3-Small cyclone localization...');
      const detRes = await detectCycloneFromImage(imageBlob, currentInput?.basin || 'Bay of Bengal', currentInput?.bbox_geo);
      if (!detRes || !detRes.success) {
        throw new Error(detRes?.message || 'MobileNetV3 detection inference failed.');
      }

      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        console.warn(`[Satellite] Discarding stale detection from session ${requestSessionId} (active: ${currentInput.sessionId})`);
        return;
      }

      if (detRes.cyclone_detected === false) {
        setAnalysisProgressStep('Ambient marine frame identified (No cyclone).');
        setFullPipelineResults({ detectionResult: detRes, classificationResult: null }, requestSessionId);
        return;
      }

      // 2. Run ResNet18 Morphology Classification + Grad-CAM
      setAnalysisProgressStep('Running ResNet18 morphological classification...');
      const clsRes = await classifyMorphologyPattern(imageBlob, currentInput?.basin || 'Bay of Bengal', 12.0);
      if (!clsRes || !clsRes.success) {
        throw new Error(clsRes?.message || 'ResNet18 morphological classification failed.');
      }

      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        console.warn(`[Satellite] Discarding stale classification from session ${requestSessionId} (active: ${currentInput.sessionId})`);
        return;
      }

      setFullPipelineResults({
        detectionResult: detRes,
        classificationResult: clsRes
      }, requestSessionId);
      setAnalysisProgressStep('Generating Grad-CAM spatial heatmaps...');

      // Smooth scroll to results once completed
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    } catch (err) {
      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        return;
      }
      console.error('AI Analysis Error:', err);
      setAnalysisError(err.message || 'AI analysis failed: Check connection to local inference server.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, hasSelectedFrame, currentInput, setFullPipelineResults]);

  // Global Keyboard shortcut: Cmd+Enter or Ctrl+Enter to trigger analysis
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isAnalyzing && hasSelectedFrame) {
          handleRunAIAnalysis();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalyzing, hasSelectedFrame, handleRunAIAnalysis]);

  const activeImageSource = currentInput?.imageUrl || selectedPreset.image;
  const isCycloneDetected = Boolean(detectionResult && (detectionResult.cyclone_detected || detectionResult.detected));

  // Normalized bbox [ymin, xmin, ymax, xmax] mapping to CSS
  const bboxStyle = isCycloneDetected && detectionResult?.bounding_box ? {
    top: `${Math.max(0, (Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[0] : (detectionResult.bounding_box.ymin ?? 0.2)) * 100)}%`,
    left: `${Math.max(0, (Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[1] : (detectionResult.bounding_box.xmin ?? 0.2)) * 100)}%`,
    height: `${Math.max(8, ((Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[2] - detectionResult.bounding_box[0] : (detectionResult.bounding_box.ymax - detectionResult.bounding_box.ymin) || 0.4)) * 100)}%`,
    width: `${Math.max(8, ((Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[3] - detectionResult.bounding_box[1] : (detectionResult.bounding_box.xmax - detectionResult.bounding_box.xmin) || 0.4)) * 100)}%`
  } : null;

  // Normalized center coordinates mapping
  const centerStyle = isCycloneDetected && detectionResult?.center ? {
    top: `${((detectionResult.center.center_y_norm ?? 0.5) * 100).toFixed(1)}%`,
    left: `${((detectionResult.center.center_x_norm ?? 0.5) * 100).toFixed(1)}%`
  } : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 font-sans">
      
      {/* 1. Header Banner */}
      <PageHeader
        categoryBadge="AI COMPUTER VISION"
        categoryColor="navy"
        title="Satellite Imagery Studio"
        subtitle="Ingest multi-spectral satellite imagery or select benchmark observations for neural cyclone detection, eye center localization, and morphology classification."
        modelBadge="MobileNetV3 + ResNet18"
      />

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff" 
        onChange={handleFileSelect} 
        className="hidden" 
      />

      {/* 2. Primary Workspace Section: Empty Upload Dropzone OR Image Preview with Start Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
              {hasSelectedFrame ? 'Active Satellite Observation Frame' : 'Ingest Satellite Observation Frame'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {hasSelectedFrame 
                ? 'Review frame preview below and execute neural pipeline.' 
                : 'Upload your own satellite frame or choose an official NASA GIBS benchmark snapshot.'}
            </p>
          </div>

          {/* Quick Actions / Preset Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{hasSelectedFrame ? 'Upload Different Frame' : 'Browse Local Files'}</span>
            </button>

            {hasSelectedFrame && (
              <button
                type="button"
                onClick={handleClearFrame}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                title="Clear image"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* CONDITION A: EMPTY STATE (Default on new/refresh) */}
        {!hasSelectedFrame ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[380px] max-h-[480px] flex flex-col items-center justify-center p-8 text-center cursor-pointer group select-none ${
              isDraggingOver
                ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800 scale-[0.995]'
                : 'border-slate-300 dark:border-slate-700/80 bg-slate-50/50 hover:bg-slate-100/60 dark:bg-slate-900/40 dark:hover:bg-slate-800/40 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-7 h-7 text-slate-700 dark:text-slate-200" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
              Upload Satellite Observation Frame
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
              Drag & drop a multi-spectral satellite raster (PNG, JPG, WebP, GeoTIFF) here or click to browse from local files.
            </p>

            <div className="mt-5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Select Frame from Computer</span>
              </button>
            </div>

            {/* Benchmark Samples Quick Loader */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800 w-full max-w-lg flex flex-col sm:flex-row items-center justify-center gap-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                Or test benchmark snapshot:
              </span>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {SATELLITE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPreset(p);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* CONDITION B: IMAGE PREVIEW WITH PROMINENT START ANALYSIS BUTTON */
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl overflow-hidden border transition-all duration-300 bg-slate-950 min-h-[380px] max-h-[520px] flex items-center justify-center shadow-inner select-none ${
              isDraggingOver 
                ? 'border-slate-400 dark:border-white ring-2 ring-slate-400/30 scale-[0.995]' 
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Drag Overlay Feedback */}
            {isDraggingOver && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white space-y-2">
                <Upload className="w-9 h-9 animate-bounce text-slate-300" />
                <p className="text-sm font-semibold">Drop new image to replace frame</p>
                <p className="text-xs text-slate-400">Accepts GeoTIFF, PNG, JPG, WebP</p>
              </div>
            )}

            {/* Frame Image Display */}
            <img
              src={activeImageSource}
              alt={currentInput?.name || selectedPreset?.name || 'Satellite Frame Preview'}
              className="max-h-[500px] max-w-full w-auto h-auto object-contain block select-none"
              crossOrigin="anonymous"
            />

            {/* Top Left Tag */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none">
              <span className="px-3 py-1 rounded-xl text-[11px] font-mono font-medium border bg-slate-950/85 text-slate-200 border-slate-800 backdrop-blur-md shadow-xs flex items-center gap-1.5">
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>{customFile ? `Uploaded Frame: ${customFile.name}` : selectedPreset.name}</span>
              </span>
            </div>

            {/* Floating Central Action Overlay (Start Analysis Button) */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {currentInput?.metadata?.dimensions || '1024 × 768 px'} • {customFile ? 'Local In-Session' : `${selectedPreset.source} (250m)`}
                </span>
              </div>

              <button 
                type="button"
                onClick={handleRunAIAnalysis}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 border border-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing Neural Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Start AI Analysis</span>
                    <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded">⌘↵</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Live Execution Status Notice */}
        {isAnalyzing && (
          <div className="p-3.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 border border-slate-800 dark:border-slate-200 text-xs font-mono flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-400 dark:text-slate-600 shrink-0" />
              <span className="font-semibold tracking-wide">{analysisProgressStep}</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono hidden sm:inline">Executing MobileNetV3 & ResNet18</span>
          </div>
        )}

        {/* Error Notice */}
        {analysisError && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Analysis Status</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{analysisError}</p>
            </div>
          </div>
        )}

      </div>

      {/* 3. Results Section: Revealed Upon Analysis Completion */}
      {detectionResult && (
        <div ref={resultsRef} className="space-y-6 pt-2 animate-fadeIn">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Step 2: AI Neural Diagnostics & Visual Inspection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluation results generated by MobileNetV3-Small (Center Localization) and ResNet18 (Morphology).
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>INFERENCE COMPLETE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Visual AI Inspection Canvas (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                
                {/* Visual Mode & Layer Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      <span>Neural Analysis Overlay</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                        isCycloneDetected 
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}>
                        {isCycloneDetected ? 'Cyclone Identified' : 'No Cyclone'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {isCycloneDetected ? 'Bounding envelope & center localization mapped' : 'Ambient non-cyclonic marine frame'}
                    </p>
                  </div>

                  {/* Layer Toggles & Mode Switcher */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0 self-start sm:self-auto">
                    {visualMode === 'overlay' && isCycloneDetected && (
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-mono">
                        <button
                          type="button"
                          onClick={() => setShowCenterReticle(v => !v)}
                          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                            showCenterReticle
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-2xs'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                          title="Toggle Center Reticle"
                        >
                          Eye Fix
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBboxOverlay(v => !v)}
                          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                            showBboxOverlay
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-2xs'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                          title="Toggle Bounding Box"
                        >
                          Perimeter
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGradCamFoci(v => !v)}
                          className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                            showGradCamFoci
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold shadow-2xs'
                              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                          title="Toggle Grad-CAM Foci"
                        >
                          Heatmap
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/70 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setVisualMode('overlay')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          visualMode === 'overlay'
                            ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold shadow-2xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Overlay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisualMode('original')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                          visualMode === 'original'
                            ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold shadow-2xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Raw</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Overlaid Satellite Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 min-h-[420px] max-h-[540px] flex items-center justify-center shadow-inner select-none">
                  <div className="relative inline-block max-w-full max-h-full">
                    <img
                      src={activeImageSource}
                      alt="Analyzed Satellite Frame"
                      className="max-h-[520px] max-w-full w-auto h-auto object-contain block select-none"
                      crossOrigin="anonymous"
                    />

                    {/* AI Overlays */}
                    {visualMode === 'overlay' && isCycloneDetected && (
                      <>
                        {/* Bounding Box Overlay */}
                        {showBboxOverlay && bboxStyle && (
                          <div 
                            className="absolute border border-white/90 bg-white/5 rounded transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                            style={bboxStyle}
                          >
                            <div className="absolute -top-6 left-0 bg-slate-950 text-white font-mono text-[9px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap border border-slate-700/80 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              <span>STORM ENVELOPE • MobileNetV3</span>
                            </div>
                          </div>
                        )}

                        {/* Center Fix Pin Marker */}
                        {showCenterReticle && centerStyle && (
                          <div 
                            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 z-10"
                            style={centerStyle}
                          >
                            <div className="w-9 h-9 rounded-full border border-white/70 bg-white/10 animate-ping absolute -top-4.5 -left-4.5" />
                            <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-950 shadow-lg flex items-center justify-center text-white">
                              <Crosshair className="w-3 h-3 text-white" />
                            </div>
                            <div className="absolute top-4 -left-16 bg-slate-950/90 text-white px-2.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap shadow border border-slate-700">
                              {detectionResult.is_georeferenced && detectionResult.coordinates?.formatted 
                                ? `Center: ${detectionResult.coordinates.formatted}` 
                                : `Center Fix: (${Number(detectionResult.center?.center_x_norm ?? 0).toFixed(2)}, ${Number(detectionResult.center?.center_y_norm ?? 0).toFixed(2)})`}
                            </div>
                          </div>
                        )}

                        {/* Grad-CAM Attention Foci Overlays */}
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
                              className="rounded-full border border-white/50 bg-white/15 animate-pulse"
                              style={{
                                width: `${Math.max(28, (focus.activation_intensity ?? focus.intensity_weight ?? 0.7) * 56)}px`,
                                height: `${Math.max(28, (focus.activation_intensity ?? focus.intensity_weight ?? 0.7) * 56)}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                            <div className="absolute top-2 -left-12 bg-slate-950/90 text-slate-200 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-mono whitespace-nowrap shadow">
                              {focus.label || focus.description || `Hotspot #${fIdx + 1}`} ({(((focus.activation_intensity ?? focus.intensity_weight) || 0.8) * 100).toFixed(0)}%)
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Ambient / Negative Badge */}
                    {visualMode === 'overlay' && !isCycloneDetected && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 text-white border border-slate-800 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2.5 pointer-events-none text-left">
                        <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                            NON-CYCLONIC MARINE FRAME
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Objectness: {((detectionResult.objectness ?? 0) * 100).toFixed(1)}% • Ambient Atmosphere
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Platform</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {customFile ? 'Custom File' : (selectedPreset.satellite.split('/')[0] || 'Suomi NPP')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Band</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {customFile ? 'Optical RGB' : 'TrueColor Optical'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Resolution</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {customFile ? 'Raster Native' : selectedPreset.resolution}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Basin</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                      {currentInput?.basin || selectedPreset.basin}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Neural Diagnostic Report (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-900 dark:text-white" />
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                      NEURAL DIAGNOSTICS
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Total: {((detectionResult.inference_time_ms || 18) + (classificationResult?.inference_time_ms || 24))}ms
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  
                  {/* 1. MobileNetV3 Detection Results */}
                  <div className="p-3.5 rounded-xl border space-y-2 bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400">
                        Detection (MobileNetV3-Small)
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{detectionResult.inference_time_ms || 18}ms</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Verdict:</span>
                        <span className="font-semibold font-mono text-slate-900 dark:text-white">
                          {isCycloneDetected ? 'Confirmed Cyclone' : 'Non-Cyclonic Marine Frame'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Confidence:</span>
                        <span className="font-semibold font-mono text-slate-900 dark:text-white">
                          {((detectionResult.objectness ?? (detectionResult.confidence_percentage / 100)) * 100).toFixed(1)}%
                        </span>
                      </div>

                      {isCycloneDetected && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400">Eye Center (Normalized):</span>
                            <span className="font-mono font-medium text-slate-900 dark:text-white">
                              X: {Number(detectionResult.center?.center_x_norm ?? 0).toFixed(3)}, Y: {Number(detectionResult.center?.center_y_norm ?? 0).toFixed(3)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 dark:text-slate-400">Geographic Coordinate Fix:</span>
                            <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                              {detectionResult.is_georeferenced && detectionResult.center?.lat != null
                                ? (detectionResult.coordinates?.formatted || `${detectionResult.center.lat.toFixed(2)}°N, ${detectionResult.center.lon.toFixed(2)}°E`)
                                : 'Relative (No Geo-metadata)'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 2. ResNet18 Morphology Results */}
                  {isCycloneDetected && classificationResult && (
                    <div className="p-3.5 rounded-xl border space-y-2 bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400">
                          Morphology (ResNet18)
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{classificationResult.inference_time_ms || 24}ms</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400">Pattern:</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{classificationResult.predicted_pattern}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 dark:text-slate-400">Pattern Confidence:</span>
                          <span className="font-semibold font-mono text-slate-900 dark:text-white">
                            {classificationResult.confidence_percentage?.toFixed(1)}%
                          </span>
                        </div>

                        {/* Probability Bars */}
                        {classificationResult.class_probability_distribution && (
                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Class Distribution
                            </span>
                            {classificationResult.class_probability_distribution.map((item, idx) => (
                              <div key={item.class_id || idx} className="space-y-0.5">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-600 dark:text-slate-300">{item.class_name}</span>
                                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{item.probability_pct?.toFixed(1)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700/70 rounded-full h-1 overflow-hidden">
                                  <div 
                                    className="bg-slate-900 dark:bg-white h-1 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(100, Math.max(1, item.probability_pct || 0))}%` }} 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Grad-CAM Hotspots */}
                  {isCycloneDetected && (
                    <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400 block">
                          Grad-CAM Explainability
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 block">
                          Convective Attention Hotspots
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {classificationResult?.gradcam_attention_foci?.length 
                          ? `${classificationResult.gradcam_attention_foci.length} Hotspots` 
                          : 'Active'}
                      </span>
                    </div>
                  )}

                </div>

                {/* Downstream Investigation Workflow */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400 block mb-1">
                    Downstream Actions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/classification')}
                      className="py-2 px-3 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>Morphology Deep Dive</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/detection')}
                      className="py-2 px-3 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span>Detection Matrix</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <span>← Back to Command Overview</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Satellite;
