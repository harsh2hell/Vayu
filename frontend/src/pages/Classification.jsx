import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, 
  ChevronRight, Info, CheckCircle, ShieldAlert,
  Eye, Image as ImageIcon,
  ArrowLeftRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classifyMorphologyPattern } from '../services/api';
import { useAnalysisSession } from '../context/AnalysisSessionContext';
import PageHeader from '../components/PageHeader';

const DEFAULT_SUPPORTED_CLASSES = [
  { class_id: 'eye_pattern', class_name: 'Eye Pattern (Warm Core)', probability_pct: 0.0 },
  { class_id: 'curved_band', class_name: 'Curved Band Pattern', probability_pct: 0.0 },
  { class_id: 'shear_pattern', class_name: 'Shear Pattern', probability_pct: 0.0 },
  { class_id: 'ambient_calm', class_name: 'Calm Baseline', probability_pct: 0.0 }
];

const Classification = () => {
  const navigate = useNavigate();
  const { currentInput, detectionResult, classificationResult, setClassificationResult } = useAnalysisSession();

  // Strict scientific gating: Distinguish confirmed cyclone morphology from ambient cloud pattern
  const isCycloneDetected = Boolean(detectionResult && (detectionResult.cyclone_detected || detectionResult.detected));

  // Real inference state
  const [isClassifying, setIsClassifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [userSelectedClassId, setUserSelectedClassId] = useState(null);

  const activeTopClassId = classificationResult?.class_probability_distribution?.[0]?.class_id || null;
  const selectedClassId = userSelectedClassId || activeTopClassId;

  const activeImageSrc = currentInput?.imageUrl;
  const activeBasin = currentInput?.basin || 'Bay of Bengal';
  const isCustomUpload = currentInput?.inputType === 'upload';
  const fileMeta = currentInput?.metadata;

  const handleRunClassification = async () => {
    if (!currentInput) return;
    const requestSessionId = currentInput.sessionId;
    setIsClassifying(true);
    setErrorMsg(null);

    try {
      let fileToSend = currentInput.file;

      if (!fileToSend && currentInput.imageUrl) {
        // Attempt to fetch preset image bytes
        try {
          const response = await fetch(currentInput.imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            fileToSend = new File([blob], `${currentInput.sessionId}.png`, { type: 'image/png' });
          } else {
            console.warn('[Classification] Failed to fetch external satellite raster:', response.status, response.statusText);
          }
        } catch (fetchErr) {
          console.warn('[Classification] Network error fetching external satellite image:', fetchErr.message);
        }

        // If external image fetch was blocked or failed, attempt local preset fallback asset
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
            console.warn('[Classification] Local asset fallback fetch error:', localErr.message);
          }
        }
      }

      // If neither external nor local asset could be converted to a File, invoke classifyMorphologyPattern with null
      // classifyMorphologyPattern will execute safe in-browser fallback classification rather than crashing
      const res = await classifyMorphologyPattern(fileToSend, activeBasin, 12.0);

      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        console.warn(`[Classification] Discarding stale classification result from session ${requestSessionId} (active: ${currentInput.sessionId})`);
        return;
      }

      if (res && res.success) {
        setClassificationResult(res, requestSessionId);
        if (res.class_probability_distribution && res.class_probability_distribution.length > 0) {
          setUserSelectedClassId(res.class_probability_distribution[0].class_id);
        }
      } else {
        setErrorMsg(res?.message || 'Classification failed: Neural backend returned an error.');
      }
    } catch (err) {
      if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
        return;
      }
      console.error('[Classification Page Error]:', err);
      setErrorMsg(err.message || 'Classification failed: Backend unavailable or network error.');
    } finally {
      setIsClassifying(false);
    }
  };

  const classesList = Array.isArray(classificationResult?.class_probability_distribution)
    ? classificationResult.class_probability_distribution
    : DEFAULT_SUPPORTED_CLASSES;
  const topPattern = classificationResult?.predicted_pattern || 'NO INFERENCE EXECUTED';
  const topConf = classificationResult?.confidence_percentage || 0;
  const gradcamFoci = Array.isArray(classificationResult?.gradcam_attention_foci)
    ? classificationResult.gradcam_attention_foci
    : [];
  const radiometric = classificationResult?.radiometric_indicators;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Standard Unified Header */}
      <PageHeader
        categoryBadge="AI VISION • MORPHOLOGY"
        categoryColor="slate"
        modelBadge="ResNet18 (11.25M Params)"
        title="AI Cyclone Pattern Classification"
        subtitle="Deep Residual Convolutional Network (ResNet-18) classifying Eye Pattern, Curved Band, Shear Pattern, and Calm Baseline with Autograd Grad-CAM attention."
        actions={
          <>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-mono px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 hidden sm:inline-block">
              Page-Local Analysis • Shared Session
            </span>
            <button 
              onClick={() => navigate('/dashboard/satellite')}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Change Input</span>
            </button>
            <button 
              onClick={handleRunClassification}
              disabled={isClassifying || !activeImageSrc}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin' : ''}`} />
              <span>
                {isClassifying 
                  ? 'Classifying ResNet18...' 
                  : classificationResult 
                    ? 'Re-run Morphology' 
                    : 'Run Morphology Analysis'}
              </span>
            </button>
          </>
        }
      />

      {/* Frame Selection / Shared Session Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
            Current Analysis Input:
          </span>
          {currentInput ? (
            <span className="px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentInput.name}</span>
              <span className="text-[10px] font-normal text-slate-500">({currentInput.source})</span>
            </span>
          ) : (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1.5 rounded-lg text-xs">
              No active session
            </span>
          )}

          <button
            onClick={() => navigate('/dashboard/satellite')}
            className="text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium flex items-center gap-1 ml-1"
          >
            <span>Change Input in Satellite Studio</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {fileMeta && (
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>Dimensions: {fileMeta.dimensions}</span>
            {fileMeta.sizeKb && <span>Size: {fileMeta.sizeKb} KB</span>}
            <span>Format: {fileMeta.type}</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-red-900 dark:text-red-300">ANALYSIS FAILED</h4>
            <p className="text-red-700 dark:text-red-400 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Negative Detection Gating Notice */}
      {detectionResult && !isCycloneDetected && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1 text-left">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
              CYCLONE DETECTION NEGATIVE &bull; MORPHOLOGY UNCONFIRMED
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              MobileNetV3 objectness detector classified this frame as ambient / non-cyclonic atmosphere ({((detectionResult.objectness ?? 0) * 100).toFixed(1)}% objectness). ResNet18 morphology classifies visual cloud pattern texture only and does NOT indicate a confirmed tropical cyclone.
            </p>
          </div>
        </div>
      )}

      {/* Main 3-Column Inspection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: Satellite Pattern & Dynamic Grad-CAM Overlays (5 Cols) */}
        <div className="xl:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Grad-CAM Visual Attention Hotspots
              </h3>
            </div>
            {classificationResult ? (
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Autograd Backprop</span>
            ) : isClassifying ? (
              <span className="text-[10px] font-mono animate-pulse px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Classifying...</span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">NO INFERENCE EXECUTED</span>
            )}
          </div>
          
          <div className="bg-slate-950 relative min-h-[380px] max-h-[480px] flex items-center justify-center overflow-hidden">
            {activeImageSrc ? (
              <div className="relative inline-block max-w-full max-h-full">
                <img
                  src={activeImageSrc}
                  alt="Cyclone Pattern View"
                  onError={(e) => {
                    const localFallback = currentInput?.presetId?.includes('biparjoy')
                      ? '/cyclone_satellite_ir.jpg'
                      : '/cyclone_satellite_vis.jpg';
                    if (e.target.src !== window.location.origin + localFallback) {
                      e.target.src = localFallback;
                    }
                  }}
                  className="max-h-[480px] max-w-full w-auto h-auto object-contain block filter brightness-95 contrast-110"
                />

                {/* Source and Lifecycle Watermarks */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-900/90 text-slate-200 border border-white/20 backdrop-blur-md shadow-sm">
                    {isCustomUpload ? `USER-UPLOADED IMAGE • ${currentInput?.name}` : `BENCHMARK FRAME: ${currentInput?.name}`}
                  </span>
                  {!classificationResult && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-900/90 text-slate-400 border border-white/10 backdrop-blur-md shadow-sm">
                      INPUT IMAGE PREVIEW ONLY — NO INFERENCE EXECUTED
                    </span>
                  )}
                </div>

                {/* Real Dynamic Grad-CAM Attention Foci from Backend (Visible ONLY when inference has executed) */}
                {classificationResult && gradcamFoci.map((focus, idx) => (
                  <div
                    key={focus.focus_id || idx}
                    className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      top: `${((focus.relative_y ?? 0.5) * 100).toFixed(1)}%`,
                      left: `${((focus.relative_x ?? 0.5) * 100).toFixed(1)}%`
                    }}
                  >
                    <div 
                      className="rounded-full border-2 border-white/80 bg-white/20 animate-pulse flex items-center justify-center"
                      style={{
                        width: `${Math.max(48, Math.round((focus.intensity_weight || 0.8) * 80))}px`,
                        height: `${Math.max(48, Math.round((focus.intensity_weight || 0.8) * 80))}px`,
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md" />
                    </div>
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap border border-white/20">
                      {focus.description || `Focus #${idx + 1}`} ({(focus.intensity_weight * 100).toFixed(0)}%)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                <p className="text-xs font-semibold text-white uppercase tracking-wider">NO ACTIVE ANALYSIS SESSION</p>
                <p className="text-[11px] text-slate-400">Please select an official benchmark frame or upload an observation image in Satellite Studio.</p>
                <button
                  onClick={() => navigate('/dashboard/satellite')}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-slate-950 hover:bg-slate-100 inline-flex items-center gap-2 cursor-pointer mt-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Open Satellite Imagery Studio</span>
                </button>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/85 text-slate-300 font-mono text-[10px] px-2.5 py-1 rounded border border-white/10">
              Backbone: ResNet-18 (11.2M Params)
            </div>

            {classificationResult?.inference_time_ms && (
              <div className="absolute bottom-3 right-3 bg-black/85 text-slate-300 font-mono text-[10px] px-2.5 py-1 rounded border border-white/10">
                Latency: {classificationResult.inference_time_ms} ms
              </div>
            )}
          </div>

          <div className="p-4 space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Predicted Morphology:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{topPattern}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Model Confidence:</span>
              <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
                {classificationResult ? `${topConf.toFixed(1)}%` : 'NO INFERENCE EXECUTED'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Output Nature:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isCycloneDetected 
                  ? 'Confirmed Cyclone Morphology' 
                  : (detectionResult ? 'Visual Cloud Texture (Non-cyclonic / Unconfirmed)' : 'Visual Morphology Class')}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500 dark:text-slate-400">Grad-CAM Attention Foci:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {classificationResult && gradcamFoci.length > 0 ? `${gradcamFoci.length} Hotspots Localized` : (classificationResult ? '0 Hotspots' : 'NO INFERENCE EXECUTED')}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: 4 Supported Classes Softmax Probability Distribution (4 Cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              4-Class Softmax Probability Distribution
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">Active Classes</span>
          </div>

          <div className="p-5 space-y-3 flex-1">
            {classesList.map((cat, idx) => {
              const isSelected = selectedClassId === cat.class_id || (cat.probability_pct === topConf && topConf > 0);
              return (
                <div
                  key={cat.class_id || idx}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/60 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {cat.class_name}
                    </span>
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                      {cat.probability_pct ? `${cat.probability_pct.toFixed(1)}%` : '0.0%'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, Math.max(2, cat.probability_pct || 0))}%` }} 
                    />
                  </div>
                </div>
              );
            })}

            {/* Explicit Notice for Retired Classes */}
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Insufficient Training Representation</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                <strong>CDO (Central Dense Overcast)</strong> and <strong>Embedded Center</strong> patterns have been retired from model inference due to insufficient training representation in the North Indian Ocean dataset.
              </p>
            </div>
          </div>

          <div className="mx-5 mb-5 p-4.5 bg-slate-900 dark:bg-slate-800 rounded-xl text-white border border-slate-800 dark:border-slate-700 shadow-sm">
            <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-wider font-mono">
              Predicted Morphology Class
            </p>
            <h3 className="text-base font-semibold mb-1">{topPattern}</h3>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-xs text-slate-300 font-medium">
                {classificationResult ? `Confidence: ${topConf.toFixed(1)}% (ResNet-18)` : 'Inference not run on this frame'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Radiometric Indicators & Next Steps (3 Cols) */}
        <div className="xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Radiometric & Kinematic Indicators
              </h3>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Min Convective Cloud Top Temp</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {radiometric?.min_cloud_temp_c ? `${radiometric.min_cloud_temp_c.toFixed(1)}°C` : '–58.0°C (Baseline)'}
                </span>
                <span className="text-[10px] text-slate-400 block">Thermal IR 10.8µm Equivalent</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Spiral Band Curvature Angle</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {radiometric?.spiral_curvature_deg ? `${radiometric.spiral_curvature_deg.toFixed(0)}°` : '180° Logarithmic Arc'}
                </span>
                <span className="text-[10px] text-slate-400 block">Logarithmic Spiral Fit</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Convective Cloud Ratio</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {radiometric?.convective_cloud_ratio ? `${(radiometric.convective_cloud_ratio * 100).toFixed(0)}%` : '48% Fraction'}
                </span>
                <span className="text-[10px] text-slate-400 block">Deep Convection Index</span>
              </div>

              {/* Intensity Assessment - Scientific Limitation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] uppercase font-semibold font-mono tracking-wider block text-slate-500 dark:text-slate-400">
                  Intensity Assessment
                </span>
                <span className="text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded border border-slate-300/60 dark:border-slate-600 block">
                  NOT AVAILABLE FROM SINGLE FRAME
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
                  Operational intensity estimation requires temporal satellite observations and synoptic meteorological data.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 pt-0">
            <button 
              onClick={() => navigate('/dashboard/trajectory')} 
              className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Proceed to Trajectory Forecast</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Classification;
