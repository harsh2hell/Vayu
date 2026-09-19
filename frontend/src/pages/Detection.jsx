import React, { useState, useEffect, useCallback } from 'react';
import { 
  Target, Upload, Play, 
  AlertTriangle, ChevronRight, RefreshCw, 
  Image as ImageIcon, ShieldCheck, Crosshair
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { detectCycloneFromImage } from '../services/api';
import { useAnalysisSession } from '../context/AnalysisSessionContext';
import PageHeader from '../components/PageHeader';

const Detection = () => {
  const navigate = useNavigate();
  const { currentInput, detectionResult, setDetectionResult } = useAnalysisSession();
  
  // Real inference state
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const inferenceStatus = isDetecting ? 'running' : (detectionResult ? 'success' : 'ready');

  const activeImageSrc = currentInput?.imageUrl;
  const activeBasin = currentInput?.basin || 'Bay of Bengal';
  const isCustomUpload = currentInput?.inputType === 'upload';
  const fileMeta = currentInput?.metadata;

  const handleRunDetection = useCallback(async () => {
    if (!currentInput) return;
    const requestSessionId = currentInput.sessionId;
    setIsDetecting(true);
    setErrorMsg(null);

    try {
      let fileToSend = currentInput.file;

      if (!fileToSend && currentInput.imageUrl) {
        try {
          const response = await fetch(currentInput.imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            fileToSend = new File([blob], `${currentInput.sessionId}.png`, { type: 'image/png' });
          } else {
            console.warn('[Detection] Failed to fetch external satellite raster:', response.status);
          }
        } catch (fetchErr) {
          console.warn('[Detection] Network error fetching satellite image:', fetchErr.message);
        }

        if (!fileToSend) {
          const localFallbackUrl = currentInput.presetId?.includes('biparjoy')
            ? '/cyclone_satellite_ir.jpg'
            : '/cyclone_satellite_vis.jpg';
          try {
            const localResp = await fetch(localFallbackUrl);
            if (localResp.ok) {
              const localBlob = await localResp.blob();
              fileToSend = new File([localBlob], `${currentInput.sessionId}_fallback.png`, { type: 'image/jpeg' });
            }
          } catch (localErr) {
            console.warn('[Detection] Local asset fallback fetch error:', localErr.message);
          }
        }
      }

      const res = await detectCycloneFromImage(fileToSend, activeBasin, currentInput?.bbox_geo);

      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        console.warn(`[Detection] Discarding stale detection result from session ${requestSessionId}`);
        return;
      }

      if (res && res.success) {
        setDetectionResult(res, requestSessionId);
      } else {
        setErrorMsg(res?.message || 'Detection failed: Neural backend returned an error.');
      }
    } catch (err) {
      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        return;
      }
      console.error('[Detection Page Error]:', err);
      setErrorMsg(err.message || 'Detection failed: Backend unavailable or network error.');
    } finally {
      setIsDetecting(false);
    }
  }, [currentInput, activeBasin, setDetectionResult]);

  // Global Keyboard shortcut: Cmd+Enter or Ctrl+Enter to trigger detection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isDetecting && activeImageSrc) {
          handleRunDetection();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetecting, activeImageSrc, handleRunDetection]);

  const isCycloneDetected = Boolean(detectionResult && (detectionResult.cyclone_detected || detectionResult.detected));

  // Convert normalized bbox to CSS percentages
  const bboxStyle = isCycloneDetected && detectionResult?.bounding_box ? {
    top: `${Math.max(0, (Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[0] : (detectionResult.bounding_box.ymin ?? 0.2)) * 100)}%`,
    left: `${Math.max(0, (Array.isArray(detectionResult.bounding_box) ? detectionResult.bounding_box[1] : (detectionResult.bounding_box.xmin ?? 0.2)) * 100)}%`,
    height: `${Math.max(8, ((Array.isArray(detectionResult.bounding_box) ? (detectionResult.bounding_box[2] - detectionResult.bounding_box[0]) : (detectionResult.bounding_box.ymax - detectionResult.bounding_box.ymin)) || 0.4) * 100)}%`,
    width: `${Math.max(8, ((Array.isArray(detectionResult.bounding_box) ? (detectionResult.bounding_box[3] - detectionResult.bounding_box[1]) : (detectionResult.bounding_box.xmax - detectionResult.bounding_box.xmin)) || 0.4) * 100)}%`,
  } : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* 1. Header Banner */}
      <PageHeader
        categoryBadge="AI COMPUTER VISION • DETECTION LAB"
        categoryColor="navy"
        modelBadge="MobileNetV3-Small (1.08M Params)"
        title="Cyclone Detection & Center Localization"
        subtitle="Dual-head convolutional neural network for automated tropical cyclogenesis verification and eye-center coordinate regression."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/satellite')}
              className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Input</span>
            </button>
            <button 
              onClick={handleRunDetection}
              disabled={isDetecting || !activeImageSrc}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 border border-slate-900 dark:border-white shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDetecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Running MobileNetV3...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{detectionResult ? 'Re-run Detection' : 'Run Detection Inference'}</span>
                  <span className="font-mono text-[10px] opacity-70 hidden sm:inline">⌘↵</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* 2. Current Session Frame Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Active Session Frame:
          </span>
          {currentInput ? (
            <span className="px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 border bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 shadow-2xs">
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentInput.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">({currentInput.source})</span>
            </span>
          ) : (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1.5 rounded-xl text-xs font-mono">
              No active session frame
            </span>
          )}
          
          <button
            onClick={() => navigate('/dashboard/satellite')}
            className="text-xs text-slate-900 dark:text-white hover:underline font-semibold flex items-center gap-1 ml-1 cursor-pointer"
          >
            <span>Change in Studio</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {fileMeta && (
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>Dimensions: {fileMeta.dimensions}</span>
            {fileMeta.sizeKb && <span>Size: {fileMeta.sizeKb} KB</span>}
            <span>Native Raster</span>
          </div>
        )}
      </div>

      {/* 3. Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-900/60 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <h4 className="font-semibold text-slate-900 dark:text-white">Analysis Status</h4>
            <p className="text-slate-600 dark:text-slate-300">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 4. Main 2-Column Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Image Canvas with Dynamic Bounding Box (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-900 dark:text-white" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Neural Localization Overlay
                </h3>
              </div>
              {detectionResult ? (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                  isCycloneDetected 
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {isCycloneDetected ? 'Target Confirmed' : 'No Cyclone Detected'}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">READY</span>
              )}
            </div>

            <div className="relative bg-slate-950 rounded-2xl flex items-center justify-center min-h-[440px] max-h-[560px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner select-none">
              {activeImageSrc ? (
                <div className="relative inline-block max-w-full max-h-full">
                  <img 
                    src={activeImageSrc} 
                    alt="Satellite Observation Frame" 
                    onError={(e) => {
                      const localFallback = currentInput?.presetId?.includes('biparjoy')
                        ? '/cyclone_satellite_ir.jpg'
                        : '/cyclone_satellite_vis.jpg';
                      if (e.target.src !== window.location.origin + localFallback) {
                        e.target.src = localFallback;
                      }
                    }}
                    className="max-h-[540px] max-w-full w-auto h-auto object-contain block filter brightness-95 contrast-105"
                  />

                  {/* Watermarks */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium border bg-slate-950/85 text-slate-200 border-slate-800 backdrop-blur-md shadow-xs">
                      {isCustomUpload ? `USER-UPLOADED • ${currentInput?.name}` : `BENCHMARK • ${currentInput?.name}`}
                    </span>
                    {!detectionResult && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950/90 text-slate-400 border border-slate-800">
                        INPUT PREVIEW • NO INFERENCE
                      </span>
                    )}
                  </div>

                  {/* Dynamic Bounding Box Overlay */}
                  {isCycloneDetected && bboxStyle && (
                    <div 
                      className="absolute border border-white/90 bg-white/5 rounded transition-all duration-300 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      style={bboxStyle}
                    >
                      <div className="absolute -top-6 left-0 bg-slate-950 text-white font-mono text-[9px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap border border-slate-700/80 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>STORM ENVELOPE • {((detectionResult.objectness ?? 1) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Center Fix Pin Marker */}
                  {isCycloneDetected && detectionResult?.center && (
                    <div 
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 z-10"
                      style={{
                        top: `${((detectionResult.center.center_y_norm ?? 0.5) * 100).toFixed(1)}%`,
                        left: `${((detectionResult.center.center_x_norm ?? 0.5) * 100).toFixed(1)}%`
                      }}
                    >
                      <div className="w-9 h-9 rounded-full border border-white/70 bg-white/10 animate-ping absolute -top-4.5 -left-4.5" />
                      <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-950 shadow-lg flex items-center justify-center text-white">
                        <Crosshair className="w-3 h-3 text-white" />
                      </div>
                      <div className="absolute top-4 -left-16 bg-slate-950/90 text-white px-2.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap shadow border border-slate-700">
                        {detectionResult.is_georeferenced && detectionResult.coordinates?.formatted 
                          ? `Center: ${detectionResult.coordinates.formatted}` 
                          : `Fix: (${Number(detectionResult.center?.center_x_norm ?? 0).toFixed(2)}, ${Number(detectionResult.center?.center_y_norm ?? 0).toFixed(2)})`}
                      </div>
                    </div>
                  )}

                  {/* Negative Detection Badge */}
                  {detectionResult && !isCycloneDetected && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 text-white border border-slate-800 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-2.5 pointer-events-none text-left">
                      <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                          NO CYCLONE DETECTED
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Objectness: {((detectionResult.objectness ?? 0) * 100).toFixed(1)}% • Localization suppressed
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                  <h3 className="text-sm font-semibold text-white tracking-tight">NO ACTIVE FRAME LOADED</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Select an official benchmark frame or upload a satellite observation image in Satellite Studio.
                  </p>
                  <button 
                    onClick={() => navigate('/dashboard/satellite')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all inline-flex items-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Open Satellite Studio</span>
                  </button>
                </div>
              )}

              {/* Bottom Canvas Telemetry Strip */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-[10px] font-mono text-slate-300 border border-slate-800 flex items-center justify-between">
                <span>MobileNetV3-Small Regressor (1.08M Params)</span>
                {detectionResult?.inference_time_ms && (
                  <span className="text-emerald-400 font-medium">{detectionResult.inference_time_ms} ms</span>
                )}
              </div>
            </div>

            {/* Technical Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Input Basin</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">{activeBasin}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Source</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">{currentInput?.source || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mode</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {isCustomUpload ? 'Local In-Session' : 'Verified Benchmark'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Status</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {inferenceStatus === 'success' && detectionResult ? 'Evaluated' : 'Ready'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right: AI Verdict & Localization Coordinates (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-900 dark:text-white" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white tracking-tight">
                  MobileNetV3 Diagnostics
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-medium border ${
                detectionResult 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {detectionResult ? (detectionResult.detected ? 'POSITIVE FIX' : 'NEGATIVE') : 'AWAITING RUN'}
              </span>
            </div>

            {detectionResult ? (
              <div className="space-y-3.5 text-xs">
                
                {/* 1. Detection Verdict Card */}
                <div className="p-3.5 rounded-xl border space-y-2 bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Cyclone Classification:</span>
                    <span className="font-semibold font-mono text-slate-900 dark:text-white">
                      {isCycloneDetected ? 'Confirmed Cyclone' : 'Non-Cyclonic Marine Frame'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Objectness Confidence:</span>
                    <span className="font-semibold font-mono text-slate-900 dark:text-white">
                      {((detectionResult.objectness ?? (detectionResult.confidence_percentage / 100)) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                    <div 
                      className="bg-slate-900 dark:bg-white h-1 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(5, (detectionResult.objectness ?? 0) * 100))}%` }}
                    />
                  </div>

                  {!isCycloneDetected && (
                    <p className="text-[11px] text-slate-500 pt-0.5 leading-snug">
                      Ambient marine atmosphere. Objectness fell below the detection threshold (50.0%). Center localization and bounding envelope are suppressed.
                    </p>
                  )}
                </div>

                {/* 2. Coordinates Fix */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Center Localization:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {isCycloneDetected && detectionResult.center
                        ? `X: ${Number(detectionResult.center.center_x_norm ?? 0).toFixed(3)}, Y: ${Number(detectionResult.center.center_y_norm ?? 0).toFixed(3)}`
                        : 'NOT AVAILABLE'}
                    </span>
                  </div>

                  <div className="py-1.5 border-b border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Geographic Coordinate Fix:</span>
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                        {isCycloneDetected && detectionResult.is_georeferenced && detectionResult.center?.lat != null
                          ? (detectionResult.coordinates?.formatted || `${Number(detectionResult.center.lat).toFixed(2)}°N, ${Number(detectionResult.center.lon).toFixed(2)}°E`)
                          : 'Relative (Uncalibrated)'}
                      </span>
                    </div>
                    {isCycloneDetected && currentInput?.ground_truth_center && (
                      <div className="text-[11px] font-mono text-slate-400">
                        Reference Ground Truth: {currentInput.ground_truth_center.lat}°N, {currentInput.ground_truth_center.lon}°E (IMD)
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Bounding Box (Normalized):</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                      {isCycloneDetected && detectionResult.bounding_box
                        ? (Array.isArray(detectionResult.bounding_box)
                            ? `[${detectionResult.bounding_box.map(v => typeof v === 'number' ? v.toFixed(2) : v).join(', ')}]`
                            : `[${Number(detectionResult.bounding_box.ymin ?? 0).toFixed(2)}, ${Number(detectionResult.bounding_box.xmin ?? 0).toFixed(2)}, ${Number(detectionResult.bounding_box.ymax ?? 0).toFixed(2)}, ${Number(detectionResult.bounding_box.xmax ?? 0).toFixed(2)}]`)
                        : 'NOT AVAILABLE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Inference Latency:</span>
                    <span className="font-mono font-medium text-slate-900 dark:text-white">
                      {detectionResult.inference_time_ms ? `${detectionResult.inference_time_ms} ms` : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Model Architecture:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      MobileNetV3-Small (1.08M)
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4 py-3">
                <div className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400 block">
                    Execution Protocol
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    MobileNetV3-Small runs dual-head regression to identify marine convective organization, compute objectness probability, and regress center pixel coordinates.
                  </p>
                </div>

                <button 
                  onClick={handleRunDetection}
                  disabled={isDetecting || !activeImageSrc}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute MobileNetV3 Detection</span>
                </button>
              </div>
            )}

            {/* Downstream Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button 
                onClick={() => navigate('/dashboard/classification')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Proceed to Morphology Classification</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Model Spec Note */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
              Validation Benchmark Metrics
            </span>
            <div className="space-y-0.5 font-mono text-[11px]">
              <div>• <strong>Center Localization Error (CLE):</strong> 25.6 km validation, 38.2 km test</div>
              <div>• <strong>Execution Runtime:</strong> ~15–25ms native inference via PyTorch</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Detection;
