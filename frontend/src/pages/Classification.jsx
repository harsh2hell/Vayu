import React, { useState } from 'react';
import { 
  Layers, Upload, Sparkles, AlertTriangle, 
  ChevronRight, Info, CheckCircle, ShieldAlert,
  Flame, Wind, Eye, Compass, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classifyMorphologyPattern } from '../services/api';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import InfoCallout from '../components/InfoCallout';

const SATELLITE_PRESETS = [
  {
    id: 'dana-2024',
    name: 'Cyclone DANA (2024)',
    date: '2024-10-24',
    basin: 'Bay of Bengal',
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=8,75,23,95&TIME=2024-10-24&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  },
  {
    id: 'biparjoy-2023',
    name: 'Cyclone BIPARJOY (2023)',
    date: '2023-06-12',
    basin: 'Arabian Sea',
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=12,58,26,76&TIME=2023-06-12&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  }
];

const DEFAULT_SUPPORTED_CLASSES = [
  { class_id: 'eye_pattern', class_name: 'Eye Pattern (Warm Core)', probability_pct: 0.0 },
  { class_id: 'curved_band', class_name: 'Curved Band Pattern', probability_pct: 0.0 },
  { class_id: 'shear_pattern', class_name: 'Shear Pattern', probability_pct: 0.0 },
  { class_id: 'ambient_calm', class_name: 'Calm Baseline', probability_pct: 0.0 }
];

const Classification = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(SATELLITE_PRESETS[0]);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);

  // Real inference state
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const activeImageSrc = customPreview || selectedPreset?.url;
  const activeBasin = customFile ? 'Bay of Bengal' : selectedPreset.basin;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCustomPreview(objectUrl);
    setClassificationResult(null);
    setErrorMsg(null);

    const img = new Image();
    img.onload = () => {
      setFileMeta({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'image/png',
        dimensions: `${img.naturalWidth} × ${img.naturalHeight} px`
      });
    };
    img.src = objectUrl;
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCustomFile(null);
    setCustomPreview(null);
    setFileMeta(null);
    setClassificationResult(null);
    setErrorMsg(null);
  };

  const handleRunClassification = async () => {
    setIsClassifying(true);
    setErrorMsg(null);

    try {
      let fileToSend = customFile;

      if (!fileToSend && selectedPreset) {
        // Fetch preset image bytes directly so real backend model processes actual pixels
        const response = await fetch(selectedPreset.url);
        if (!response.ok) throw new Error('Failed to load preset satellite image frame.');
        const blob = await response.blob();
        fileToSend = new File([blob], `${selectedPreset.id}.png`, { type: 'image/png' });
      }

      if (!fileToSend) {
        throw new Error('No satellite frame available. Please upload a frame or choose a preset.');
      }

      const res = await classifyMorphologyPattern(fileToSend, activeBasin, 12.0);

      if (res && res.success) {
        setClassificationResult(res);
        if (res.class_probability_distribution && res.class_probability_distribution.length > 0) {
          setSelectedClassId(res.class_probability_distribution[0].class_id);
        }
      } else {
        setErrorMsg(res?.message || 'Classification failed: Neural backend returned an error.');
      }
    } catch (err) {
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
        categoryColor="blue"
        modelBadge="ResNet18 (11.25M Params)"
        title="AI Cyclone Pattern Classification"
        subtitle="Deep Residual Convolutional Network (ResNet-18) classifying Eye Pattern, Curved Band, Shear Pattern, and Calm Baseline with Autograd Grad-CAM attention."
        actions={
          <>
            <span className="text-[11px] text-amber-800 bg-amber-50 font-mono px-2 py-0.5 rounded border border-amber-200 hidden sm:inline-block">
              Prototype: 14 training frames across 4 classes
            </span>
            <label className="btn-secondary text-xs sm:text-sm py-2 px-3 gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Frame</span>
              <input 
                type="file" 
                accept="image/png,image/jpeg,image/jpg,image/webp,image/tiff" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>
            <button 
              onClick={handleRunClassification}
              disabled={isClassifying || !activeImageSrc}
              className="btn-primary text-xs sm:text-sm py-2 px-4 gap-2 shadow-xs"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isClassifying ? 'animate-spin' : ''}`} />
              <span>{isClassifying ? 'Classifying ResNet18...' : 'Run Morphological Classifier'}</span>
            </button>
          </>
        }
      />

      {/* Frame Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-700">Select Input Frame:</span>
          {SATELLITE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs border ${
                !customFile && selectedPreset?.id === p.id
                  ? 'bg-[#003087] text-white border-[#003087] shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p.name}
            </button>
          ))}
          {customFile && (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
              Custom: {customFile.name}
            </span>
          )}
        </div>

        {fileMeta && (
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-3">
            <span>Dimensions: {fileMeta.dimensions}</span>
            <span>Size: {fileMeta.size}</span>
            <span>Format: {fileMeta.type}</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-red-900">ANALYSIS FAILED</h4>
            <p className="text-red-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main 3-Column Inspection Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: Satellite Pattern & Dynamic Grad-CAM Overlays (5 Cols) */}
        <div className="xl:col-span-5 card overflow-hidden flex flex-col">
          <div className="card-header bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#003087]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Grad-CAM Visual Attention Hotspots
              </h3>
            </div>
            {classificationResult ? (
              <span className="badge badge-amber text-[10px]">Autograd Backprop</span>
            ) : isClassifying ? (
              <span className="badge badge-yellow animate-pulse text-[10px]">Classifying...</span>
            ) : (
              <span className="badge badge-red font-mono text-[10px]">NO INFERENCE EXECUTED</span>
            )}
          </div>
          
          <div className="bg-slate-950 relative min-h-[380px] max-h-[480px] flex items-center justify-center overflow-hidden">
            {activeImageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={activeImageSrc}
                  alt="Cyclone Pattern View"
                  className="w-full h-full object-contain filter brightness-95 contrast-110"
                />

                {/* Source and Lifecycle Watermarks */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border backdrop-blur-md shadow-sm ${
                    customFile 
                      ? 'bg-amber-950/85 text-amber-300 border-amber-500/50' 
                      : 'bg-slate-900/85 text-sky-300 border-white/20'
                  }`}>
                    {customFile ? 'USER-UPLOADED IMAGE • IN-SESSION ANALYSIS' : `BENCHMARK FRAME: ${selectedPreset.name}`}
                  </span>
                  {!classificationResult && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-red-950/90 text-red-300 border border-red-500/50 backdrop-blur-md shadow-sm">
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
                      className="rounded-full border-2 border-amber-400 bg-amber-500/20 animate-pulse flex items-center justify-center"
                      style={{
                        width: `${Math.max(48, Math.round((focus.intensity_weight || 0.8) * 80))}px`,
                        height: `${Math.max(48, Math.round((focus.intensity_weight || 0.8) * 80))}px`,
                      }}
                    >
                      <div className="w-3 h-3 rounded-full bg-red-600 border border-white shadow" />
                    </div>
                    <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/90 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap border border-amber-500/30">
                      {focus.description || `Focus #${idx + 1}`} ({(focus.intensity_weight * 100).toFixed(0)}%)
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                <p className="text-xs font-bold text-white uppercase">NO SATELLITE FRAME AVAILABLE</p>
                <p className="text-[11px] text-slate-400">Please upload a frame or select a preset.</p>
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/85 text-cyan-300 font-mono text-[10px] px-2.5 py-1 rounded border border-white/10">
              Backbone: ResNet-18 (11.2M Params)
            </div>

            {classificationResult?.inference_time_ms && (
              <div className="absolute bottom-3 right-3 bg-black/85 text-emerald-400 font-mono text-[10px] px-2.5 py-1 rounded border border-white/10">
                Latency: {classificationResult.inference_time_ms} ms
              </div>
            )}
          </div>

          <div className="p-4 space-y-2 text-xs border-t border-slate-100 bg-slate-50">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Predicted Morphology:</span>
              <span className="font-bold text-slate-900">{topPattern}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Model Confidence:</span>
              <span className="font-bold font-mono text-slate-800">
                {classificationResult ? `${topConf.toFixed(1)}%` : 'NO INFERENCE EXECUTED'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">Output Nature:</span>
              <span className="font-bold text-slate-800">Visual Morphology Class</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Grad-CAM Attention Foci:</span>
              <span className="font-semibold text-amber-700">
                {classificationResult && gradcamFoci.length > 0 ? `${gradcamFoci.length} Hotspots Localized` : (classificationResult ? '0 Hotspots' : 'NO INFERENCE EXECUTED')}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: 4 Supported Classes Softmax Probability Distribution (4 Cols) */}
        <div className="xl:col-span-4 card overflow-hidden flex flex-col">
          <div className="card-header bg-white flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              4-Class Softmax Probability Distribution
            </h3>
            <span className="badge badge-blue text-[10px]">Active Classes</span>
          </div>

          <div className="p-5 space-y-3 flex-1">
            {classesList.map((cat, idx) => {
              const isSelected = selectedClassId === cat.class_id || (cat.probability_pct === topConf && topConf > 0);
              return (
                <div
                  key={cat.class_id || idx}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#003087] bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-[#003087]' : 'text-slate-800'}`}>
                      {cat.class_name}
                    </span>
                    <span className={`text-xs font-bold font-mono ${isSelected ? 'text-[#003087]' : 'text-slate-600'}`}>
                      {cat.probability_pct ? `${cat.probability_pct.toFixed(1)}%` : '0.0%'}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill bg-[#003087]" 
                      style={{ width: `${Math.min(100, Math.max(2, cat.probability_pct || 0))}%` }} 
                    />
                  </div>
                </div>
              );
            })}

            {/* Explicit Notice for Retired Classes */}
            <div className="mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-amber-800">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Insufficient Training Representation</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-snug">
                <strong>CDO (Central Dense Overcast)</strong> and <strong>Embedded Center</strong> patterns have been retired from model inference due to insufficient training representation in the North Indian Ocean dataset.
              </p>
            </div>
          </div>

          <div className="mx-5 mb-5 p-4 bg-[#003087] rounded-xl text-white">
            <p className="text-[10px] text-blue-200 mb-0.5 uppercase tracking-wider font-mono">
              Predicted Morphology Class
            </p>
            <h3 className="text-base font-bold mb-1">{topPattern}</h3>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs text-emerald-300 font-medium">
                {classificationResult ? `Confidence: ${topConf.toFixed(1)}% (ResNet-18)` : 'Inference not run on this frame'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Radiometric Indicators & Next Steps (3 Cols) */}
        <div className="xl:col-span-3 card overflow-hidden flex flex-col justify-between">
          <div>
            <div className="card-header bg-white">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Radiometric & Kinematic Indicators
              </h3>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Min Convective Cloud Top Temp</span>
                <span className="font-mono font-bold text-sm text-sky-800">
                  {radiometric?.min_cloud_temp_c ? `${radiometric.min_cloud_temp_c.toFixed(1)}°C` : '–58.0°C (Baseline)'}
                </span>
                <span className="text-[10px] text-slate-400 block">Thermal IR 10.8µm Equivalent</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Spiral Band Curvature Angle</span>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {radiometric?.spiral_curvature_deg ? `${radiometric.spiral_curvature_deg.toFixed(0)}°` : '180° Logarithmic Arc'}
                </span>
                <span className="text-[10px] text-slate-400 block">Logarithmic Spiral Fit</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Convective Cloud Ratio</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {radiometric?.convective_cloud_ratio ? `${(radiometric.convective_cloud_ratio * 100).toFixed(0)}%` : '48% Fraction'}
                </span>
                <span className="text-[10px] text-slate-400 block">Deep Convection Index</span>
              </div>

              {/* Intensity Assessment - Scientific Limitation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold font-mono tracking-wider block text-slate-500">
                  Intensity Assessment
                </span>
                <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 block">
                  NOT AVAILABLE FROM SINGLE-FRAME MODEL
                </span>
                <p className="text-[10px] text-slate-500 leading-tight pt-0.5">
                  Operational intensity estimation requires temporal satellite observations and synoptic meteorological data.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 pt-0">
            <button 
              onClick={() => navigate('/dashboard/trajectory')} 
              className="btn-primary w-full text-xs py-2.5 justify-center gap-1.5"
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
