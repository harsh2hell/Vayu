import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Satellite as SatelliteDish, Sparkles, Upload, 
  RotateCcw, CheckCircle, ChevronRight,
  Crosshair, Waves, Wind, Activity, Layers, Compass,
  Play, Pause, Film, Globe, Eye, CloudRain, Clock, 
  RefreshCw, AlertTriangle, Check, FileImage, ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  detectCycloneFromImage, 
  classifyMorphologyPattern,
  fetchLiveSstGrid, 
  fetchLiveVerticalWindShear, 
  fetchRainViewerLiveFrames,
  getFormattedLastUpdated
} from '../services/api';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import DataUnavailableNotice from '../components/DataUnavailableNotice';

const SATELLITE_PRESETS = [
  {
    id: 'nasa-viirs-dana',
    name: 'NASA VIIRS TrueColor (Cyclone DANA)',
    satellite: 'Suomi NPP / VIIRS',
    band: 'TrueColor Optical (0.64, 0.55, 0.47 µm)',
    source: 'NASA EOSDIS GIBS',
    resolution: '250 m',
    dateStr: '2024-10-24',
    image: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=8,75,23,95&TIME=2024-10-24&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  },
  {
    id: 'nasa-modis-biparjoy',
    name: 'NASA MODIS Optical (Cyclone BIPARJOY)',
    satellite: 'Aqua / MODIS',
    band: 'Visible TrueColor (0.65 µm)',
    source: 'NASA EOSDIS GIBS',
    resolution: '250 m',
    dateStr: '2023-06-14',
    image: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=MODIS_Aqua_CorrectedReflectance_TrueColor&BBOX=15,62,26,75&TIME=2023-06-14&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  }
];

const Satellite = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imagePreviewRef = useRef(null);

  // Active view tab: 'upload-lab' (default for SIH testing) or 'live-radar-loop'
  const [activeTab, setActiveTab] = useState('upload-lab');

  // Selected Preset or Uploaded File
  const [selectedPreset, setSelectedPreset] = useState(SATELLITE_PRESETS[0]);
  const [customFile, setCustomFile] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const [imageMetadata, setImageMetadata] = useState({
    name: SATELLITE_PRESETS[0].name,
    sizeKb: null,
    dimensions: '1024 × 768',
    type: 'image/png'
  });

  // Real AI Inference State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState(''); // 'satellite', 'detection', 'classification', 'gradcam'
  const [detectionResult, setDetectionResult] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Display Overlays Toggle
  const [showCenterFix, setShowCenterFix] = useState(true);
  const [showGradCam, setShowGradCam] = useState(true);

  // Live Animated Radar Loop State (Secondary Tab)
  const [liveFramesData, setLiveFramesData] = useState(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlayingStream, setIsPlayingStream] = useState(true);
  const [streamType, setStreamType] = useState('satellite'); // 'satellite' or 'radar'
  const [streamSpeed, setStreamSpeed] = useState(1);
  const [isLoadingStream, setIsLoadingStream] = useState(false);

  // Fetch RainViewer loops for secondary tab
  useEffect(() => {
    if (activeTab === 'live-radar-loop' && !liveFramesData) {
      const loadLoop = async () => {
        setIsLoadingStream(true);
        const data = await fetchRainViewerLiveFrames();
        if (data) {
          setLiveFramesData(data);
          const frames = streamType === 'satellite' ? data.satelliteFrames : data.radarFrames;
          if (frames?.length) setCurrentFrameIndex(frames.length - 1);
        }
        setIsLoadingStream(false);
      };
      loadLoop();
    }
  }, [activeTab, liveFramesData, streamType]);

  // Frame animation loop
  useEffect(() => {
    let interval;
    const frames = streamType === 'satellite' ? liveFramesData?.satelliteFrames : liveFramesData?.radarFrames;
    if (isPlayingStream && frames && frames.length > 0 && activeTab === 'live-radar-loop') {
      interval = setInterval(() => {
        setCurrentFrameIndex(prev => (prev >= frames.length - 1 ? 0 : prev + 1));
      }, 1200 / streamSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlayingStream, liveFramesData, streamType, streamSpeed, activeTab]);

  // Handle local image file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset previous AI outputs
    setDetectionResult(null);
    setClassificationResult(null);
    setAnalysisError(null);

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
    setAnalysisError(null);
    setDetectionResult(null);
    setClassificationResult(null);

    try {
      let imageBlob = customFile;

      // If user is analyzing a preset without uploading, download preset image bytes
      if (!imageBlob) {
        setAnalysisProgressStep('SATELLITE: Fetching satellite frame raster...');
        const fetchRes = await fetch(selectedPreset.image);
        if (!fetchRes.ok) throw new Error('Failed to retrieve preset satellite frame.');
        imageBlob = await fetchRes.blob();
      } else {
        setAnalysisProgressStep('SATELLITE: Loading uploaded frame in-session...');
      }

      // 1. Run MobileNetV3-Small Detection
      setAnalysisProgressStep('DETECTION: Running MobileNetV3 dual-head model...');
      const detRes = await detectCycloneFromImage(imageBlob, selectedPreset?.basin || 'Bay of Bengal');
      if (!detRes || !detRes.success) {
        throw new Error(detRes?.message || 'MobileNetV3 detection inference failed.');
      }
      setDetectionResult(detRes);

      // 2. Run ResNet18 Morphology Classification + Grad-CAM
      setAnalysisProgressStep('CLASSIFICATION: Running ResNet18 morphology + Grad-CAM...');
      const clsRes = await classifyMorphologyPattern(imageBlob, selectedPreset?.basin || 'Bay of Bengal', 12.0);
      if (!clsRes || !clsRes.success) {
        throw new Error(clsRes?.message || 'ResNet18 morphological classification failed.');
      }
      setClassificationResult(clsRes);

      setAnalysisProgressStep('EXPLAINABILITY: Grad-CAM attention foci generated.');
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setAnalysisError(err.message || 'AI ANALYSIS FAILED: Backend connection required.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeImageSource = customImageUrl || selectedPreset.image;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <DataTypeBadge type="ai" label="REAL PYTORCH INGESTION LAB" />
            <LastUpdatedBadge timestamp={getFormattedLastUpdated()} source="NASA GIBS & PyTorch Engine" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
              <SatelliteDish className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Satellite AI Ingestion &amp; Vision Lab</h1>
                <span className="badge badge-navy">MobileNetV3 + ResNet18</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload any satellite frame (PNG/JPG/TIFF/WEBP) or select verified NASA GIBS benchmarks for real PyTorch center fix &amp; Grad-CAM analysis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* File Upload Trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Upload Satellite Frame</span>
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff" 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          {/* Run Real AI Analysis Button */}
          <button 
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
                <span>Running AI Models...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run AI Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200/90 w-fit">
        <button
          onClick={() => setActiveTab('upload-lab')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'upload-lab'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <SatelliteDish className="w-3.5 h-3.5 text-sky-400" />
          <span>Upload &amp; Frame Ingestion Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('live-radar-loop')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'live-radar-loop'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-emerald-400" />
          <span>RainViewer Live Radar Motion</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* VIEW 1: SATELLITE UPLOAD & MULTI-SPECTRAL LAB */}
      {activeTab === 'upload-lab' && (
        <div className="space-y-6">

          {/* Preset Selector or Custom Upload Indicator */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider block">
                Active Satellite Target
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                {customFile 
                  ? 'Custom user-uploaded satellite frame active. Analyzed in-session.' 
                  : 'Select a verified NASA GIBS polar observation or upload your own raster frame.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {SATELLITE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                    !customFile && selectedPreset.id === p.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>🛰️</span>
                  <span>{p.name.split(' (')[0]}</span>
                </button>
              ))}

              {customFile && (
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                  <span>📁</span>
                  <span className="truncate max-w-[140px]">{customFile.name}</span>
                </span>
              )}
            </div>
          </div>

          {/* Sequential Live Analysis Progress Tracker */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs font-mono text-sky-900 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
              <span>{analysisProgressStep}</span>
            </div>
          )}

          {/* Analysis Error Display */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">ANALYSIS FAILED</p>
                <p>{analysisError}</p>
                <button 
                  onClick={handleRunAIAnalysis}
                  className="mt-2 px-3 py-1 bg-white border border-rose-300 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
            </div>
          )}

          {/* Main Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Image Preview + Center Fix & Grad-CAM Overlays */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {customFile ? 'Uploaded Satellite Frame' : 'Satellite Observation'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {customFile ? 'In-session local memory • Not persisted to cloud database' : `${selectedPreset.satellite} • ${selectedPreset.dateStr}`}
                    </p>
                  </div>

                  {/* Overlays Toggle */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <button
                      onClick={() => setShowCenterFix(!showCenterFix)}
                      className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        showCenterFix ? 'bg-sky-100 text-sky-900 border-sky-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      Center Fix [ {showCenterFix ? 'ON' : 'OFF'} ]
                    </button>
                    <button
                      onClick={() => setShowGradCam(!showGradCam)}
                      className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        showGradCam ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-white text-slate-500 border-slate-200'
                      }`}
                    >
                      Grad-CAM [ {showGradCam ? 'ON' : 'OFF'} ]
                    </button>
                  </div>
                </div>

                {/* Satellite Frame Canvas */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/3] group shadow-inner flex items-center justify-center">
                  <img
                    ref={imagePreviewRef}
                    src={activeImageSource}
                    alt={imageMetadata.name}
                    className="w-full h-full object-cover select-none"
                    crossOrigin="anonymous"
                  />

                  {/* MobileNetV3 Detected Center Fix Overlay */}
                  {showCenterFix && detectionResult?.bounding_box && (
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
                      style={{
                        left: `${(detectionResult.bounding_box.center_x_norm ?? 0.5) * 100}%`,
                        top: `${(detectionResult.bounding_box.center_y_norm ?? 0.5) * 100}%`
                      }}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-sky-400 bg-sky-500/20 animate-ping absolute -top-5 -left-5" />
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-sky-600 shadow-lg flex items-center justify-center -top-3 -left-3 text-white text-[10px] font-bold">
                        🎯
                      </div>
                      <div className="absolute top-4 -left-16 bg-slate-900/90 backdrop-blur-md text-white px-2 py-0.5 rounded text-[9px] font-mono whitespace-nowrap shadow border border-sky-400/50">
                        MobileNetV3 Fix: {detectionResult.coordinates?.formatted}
                      </div>
                    </div>
                  )}

                  {/* ResNet18 Grad-CAM Attention Foci Overlay */}
                  {showGradCam && classificationResult?.gradcam_attention_foci?.map((focus, fIdx) => (
                    <div
                      key={fIdx}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
                      style={{
                        left: `${focus.x_norm * 100}%`,
                        top: `${focus.y_norm * 100}%`
                      }}
                    >
                      <div 
                        className="rounded-full border border-amber-300 bg-amber-400/25 animate-pulse"
                        style={{
                          width: `${Math.max(24, focus.activation_intensity * 48)}px`,
                          height: `${Math.max(24, focus.activation_intensity * 48)}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                      <div className="absolute top-2 -left-12 bg-amber-950/90 text-amber-200 border border-amber-400/60 px-1.5 py-0.5 rounded text-[8px] font-mono whitespace-nowrap shadow">
                        {focus.label} ({(focus.activation_intensity * 100).toFixed(0)}%)
                      </div>
                    </div>
                  ))}

                  {/* Frame Provenance Watermark */}
                  <div className="absolute top-2.5 left-2.5 z-10 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-white border border-white/20">
                    <span>{customFile ? 'User Ingestion Frame' : selectedPreset.satellite}</span>
                  </div>

                  {detectionResult && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 bg-slate-900/85 backdrop-blur-md p-2 rounded-xl text-[10px] font-mono text-slate-300 border border-white/10 flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">Cyclone Detected: YES</span>
                      <span className="text-amber-300">ResNet18 Attention Mapped</span>
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
                    <span className="font-bold text-slate-800">{imageMetadata.sizeKb ? `${imageMetadata.sizeKb} KB` : 'GeoTIFF / PNG'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Persistence</span>
                    <span className="font-bold text-slate-500">In-Session Only</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: AI Detection & Classification Results */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Detection Diagnostic (MobileNetV3-Small) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                      MobileNetV3-Small Detection
                    </h3>
                  </div>
                  {detectionResult && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {detectionResult.inference_time_ms} ms Latency
                    </span>
                  )}
                </div>

                {detectionResult ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-mono block">Cyclone Presence</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {detectionResult.cyclone_detected ? 'YES (Confirmed)' : 'NO'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-mono block">Objectness Confidence</span>
                        <span className="text-sm font-bold text-slate-900">
                          {detectionResult.confidence_percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Detected Center Fix:</span>
                        <span className="font-bold text-sky-700">{detectionResult.coordinates?.formatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Basin Location:</span>
                        <span className="text-slate-800">{detectionResult.coordinates?.basin}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 font-mono space-y-2">
                    <p>Click "Run AI Analysis" to trigger MobileNetV3 center localization.</p>
                  </div>
                )}
              </div>

              {/* Morphology Diagnostic (ResNet18) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                    <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                      ResNet18 Morphology
                    </h3>
                  </div>
                  {classificationResult && (
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {classificationResult.inference_time_ms} ms Latency
                    </span>
                  )}
                </div>

                {classificationResult ? (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Pattern</span>
                        <span className="font-bold text-violet-700 text-sm">
                          {classificationResult.predicted_pattern}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        {classificationResult.pattern_description}
                      </p>
                    </div>

                    {/* 4-Class Probability Distribution */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                        4-Class Softmax Distribution:
                      </span>
                      {classificationResult.class_probability_distribution?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">{item.class_name}</span>
                          <div className="flex items-center gap-2 font-mono">
                            <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-violet-600 h-full rounded-full" 
                                style={{ width: `${Math.min(100, item.probability_pct)}%` }} 
                              />
                            </div>
                            <span className="w-10 text-right text-slate-800 font-semibold">
                              {item.probability_pct}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900">
                      * Note: CDO and Embedded Center patterns are unsupported prediction classes due to insufficient training representation in polar archive.
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400 font-mono space-y-2">
                    <p>Click "Run AI Analysis" to trigger ResNet18 Dvorak morphology classification.</p>
                  </div>
                )}
              </div>

              {/* Trajectory Transition Notice */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <span className="font-bold text-slate-800 block">Scientific Rollout Note:</span>
                <p className="text-[11px] text-slate-500">
                  Trajectory forecasting requires at least 4 consecutive historical fixes (9 hours of track history) to compute kinematic momentum vectors. To run the 72-hour GRU forecast and landfall impact, navigate to the Command Overview or Trajectory Studio.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                  <span>Open Command Overview Trajectory</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* VIEW 2: RAINVIEWER LIVE DOPPLER RADAR LOOP */}
      {activeTab === 'live-radar-loop' && (
        <div className="card bg-white p-5 space-y-4 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-sm text-slate-900">
                  {streamType === 'satellite' ? 'Geostationary Infrared Cloud Motion Loop' : 'Live Doppler Weather Radar Loop'}
                </h3>
                <span className="badge badge-green text-[10px]">LIVE BROADCAST</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Streaming real-time cloud dynamics and precipitation radar over the North Indian Ocean via RainViewer.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setStreamType('satellite')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  streamType === 'satellite' ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Infrared Cloud Loop
              </button>
              <button
                onClick={() => setStreamType('radar')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  streamType === 'radar' ? 'bg-slate-900 text-white font-bold' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Doppler Radar Loop
              </button>
            </div>
          </div>

          <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
            <MapContainer center={[17.5, 84.0]} zoom={5} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
              />
              {liveFramesData && (
                <TileLayer
                  key={currentFrameIndex}
                  url={
                    streamType === 'satellite'
                      ? liveFramesData.satelliteFrames?.[currentFrameIndex]?.tileUrl
                      : liveFramesData.radarFrames?.[currentFrameIndex]?.tileUrl
                  }
                  opacity={0.85}
                  zIndex={200}
                  attribution="&copy; RainViewer Open API"
                />
              )}
            </MapContainer>

            {/* Animation Controls Overlay */}
            <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-200 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlayingStream(!isPlayingStream)}
                  className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isPlayingStream ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <span className="font-bold text-slate-800">
                  Frame {currentFrameIndex + 1} / {streamType === 'satellite' ? liveFramesData?.satelliteFrames?.length || 1 : liveFramesData?.radarFrames?.length || 1}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setStreamSpeed(spd)}
                    className={`px-2 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                      streamSpeed === spd ? 'bg-sky-600 text-white font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Satellite;
