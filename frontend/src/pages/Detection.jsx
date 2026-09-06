import React, { useState } from 'react';
import { 
  Target, Cpu, Upload, Play, CheckCircle2, 
  AlertTriangle, ChevronRight, RefreshCw, Layers, 
  Eye, Image as ImageIcon, ShieldCheck, HelpCircle, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { detectCycloneFromImage } from '../services/api';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';

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

const Detection = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(SATELLITE_PRESETS[0]);
  const [customFile, setCustomFile] = useState(null);
  const [customPreview, setCustomPreview] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  
  // Real inference state
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const activeImageSrc = customPreview || selectedPreset?.url;
  const activeBasin = customFile ? 'Bay of Bengal' : selectedPreset.basin;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCustomPreview(objectUrl);
    setDetectionResult(null);
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
    setDetectionResult(null);
    setErrorMsg(null);
  };

  const handleRunDetection = async () => {
    setIsDetecting(true);
    setErrorMsg(null);

    try {
      let fileToSend = customFile;

      if (!fileToSend && selectedPreset) {
        // Fetch preset image bytes directly so real backend CNN processes actual pixels
        const response = await fetch(selectedPreset.url);
        if (!response.ok) throw new Error('Failed to load satellite preset image frame.');
        const blob = await response.blob();
        fileToSend = new File([blob], `${selectedPreset.id}.png`, { type: 'image/png' });
      }

      if (!fileToSend) {
        throw new Error('No satellite frame available. Please upload a frame or select a preset.');
      }

      const res = await detectCycloneFromImage(fileToSend, activeBasin);

      if (res && res.success) {
        setDetectionResult(res);
      } else {
        setErrorMsg(res?.message || 'Detection failed: Neural backend returned an error.');
      }
    } catch (err) {
      console.error('[Detection Page Error]:', err);
      setErrorMsg(err.message || 'Detection failed: Backend unavailable or network error.');
    } finally {
      setIsDetecting(false);
    }
  };

  // Convert normalized bbox [ymin, xmin, ymax, xmax] to CSS percentages
  const bboxStyle = detectionResult?.bounding_box ? {
    top: `${Math.max(0, detectionResult.bounding_box[0] * 100)}%`,
    left: `${Math.max(0, detectionResult.bounding_box[1] * 100)}%`,
    height: `${Math.max(5, (detectionResult.bounding_box[2] - detectionResult.bounding_box[0]) * 100)}%`,
    width: `${Math.max(5, (detectionResult.bounding_box[3] - detectionResult.bounding_box[1]) * 100)}%`,
  } : null;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Target className="w-6 h-6 text-[#003087]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Deep Learning Detection Lab</h1>
            <span className="badge badge-navy">MobileNetV3-Small (1.08M Params)</span>
            <DataTypeBadge type="ai" label="REAL AI INFERENCE" size="xs" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Convolutional neural network for automated tropical cyclogenesis identification & eye center localization.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded border border-slate-200">
              Checkpoint: vayu_detector_mobilenetv3_p3b.pt
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              In-session analysis • Not persisted to database
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <LastUpdatedBadge source="MobileNetV3 CenterFix" size="xs" />
          
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
            onClick={handleRunDetection}
            disabled={isDetecting || !activeImageSrc}
            className="btn-primary text-xs sm:text-sm py-2 px-4 gap-2 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Running MobileNetV3...' : 'Run Detection Inference'}</span>
          </button>
        </div>
      </div>

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

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Image Canvas with Dynamic Bounding Box (7 Cols) */}
        <div className="lg:col-span-7 card overflow-hidden flex flex-col">
          <div className="card-header bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#003087]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Satellite Imagery & Neural Localization Overlay
              </h3>
            </div>
            {detectionResult?.detected && (
              <span className="badge badge-green text-[10px]">Target Confirmed</span>
            )}
          </div>

          <div className="relative bg-slate-950 flex items-center justify-center min-h-[460px] max-h-[560px] overflow-hidden">
            {activeImageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={activeImageSrc} 
                  alt="Satellite Observation Frame" 
                  className="w-full h-full object-contain filter brightness-95 contrast-110"
                />

                {/* Real Dynamic Bounding Box Overlay */}
                {detectionResult?.detected && bboxStyle && (
                  <div 
                    className="absolute border-2 border-red-500 bg-red-500/15 rounded transition-all duration-500 pointer-events-none"
                    style={bboxStyle}
                  >
                    <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                      <span>CYCLONE EYE REGRESSION</span>
                      <span>({(detectionResult.objectness * 100).toFixed(1)}%)</span>
                    </div>
                  </div>
                )}

                {/* Center Fix Pin Marker */}
                {detectionResult?.detected && detectionResult?.center && (
                  <div 
                    className="absolute w-4 h-4 rounded-full border-2 border-amber-300 bg-red-600 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                    style={{
                      top: `${((detectionResult.center.center_y_norm ?? 0.5) * 100).toFixed(1)}%`,
                      left: `${((detectionResult.center.center_x_norm ?? 0.5) * 100).toFixed(1)}%`
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <ImageIcon className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">NO SATELLITE FRAME AVAILABLE</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Please upload a satellite observation frame (PNG/JPG) or choose an official NASA snapshot preset to run inference.
                </p>
                <label className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-2 cursor-pointer mt-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Satellite Frame</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            )}

            {/* Backbone Spec Stamp */}
            <div className="absolute bottom-3 left-3 bg-black/85 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
              Model: MobileNetV3-Small Dual-Head Regressor (1,075,431 Params)
            </div>

            {detectionResult?.inference_time_ms && (
              <div className="absolute bottom-3 right-3 bg-black/85 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
                Inference Latency: {detectionResult.inference_time_ms} ms
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Input Basin:</strong> {activeBasin} • <strong>Source:</strong> {customFile ? 'User In-Session Frame' : selectedPreset?.name}
            </span>
            {detectionResult && (
              <span className="font-mono text-[11px] text-slate-500">
                Inference Status: COMPLETE
              </span>
            )}
          </div>
        </div>

        {/* Right: Real AI Verdict & Localization Coordinates (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">
          
          <div className="card p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">MobileNetV3 Inference Verdict</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <DataTypeBadge type="ai" size="xs" />
                {detectionResult ? (
                  <span className={`badge ${detectionResult.detected ? 'badge-green' : 'badge-red'}`}>
                    {detectionResult.detected ? 'Positive Fix' : 'Negative'}
                  </span>
                ) : (
                  <span className="badge badge-gray">Awaiting Inference</span>
                )}
              </div>
            </div>

            {detectionResult ? (
              <div className="space-y-4">
                <div className={`border rounded-xl p-4 space-y-2 ${
                  detectionResult.detected ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Cyclone Target Detected:</span>
                    <span className={`text-xs font-mono font-extrabold ${
                      detectionResult.detected ? 'text-emerald-800' : 'text-slate-600'
                    }`}>
                      {detectionResult.detected ? 'YES — CYCLONE IDENTIFIED' : 'NO — AMBIENT / NON-CYCLONIC'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Objectness Score:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {(detectionResult.objectness * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar bg-slate-200">
                    <div 
                      className={`progress-fill ${detectionResult.detected ? 'bg-emerald-600' : 'bg-slate-400'}`} 
                      style={{ width: `${Math.min(100, Math.max(5, detectionResult.objectness * 100))}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Eye Center Coordinates:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {detectionResult.center?.lat?.toFixed(2)}°N, {detectionResult.center?.lon?.toFixed(2)}°E
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Bounding Box [ymin, xmin, ymax, xmax]:</span>
                    <span className="font-mono text-[11px] text-slate-800">
                      [{detectionResult.bounding_box?.map(v => v.toFixed(3)).join(', ')}]
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Inference Latency:</span>
                    <span className="font-bold font-mono text-emerald-700">
                      {detectionResult.inference_time_ms} ms
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Architecture Backbone:</span>
                    <span className="font-semibold text-slate-800">
                      MobileNetV3-Small Dual-Head
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Parameter Count:</span>
                    <span className="font-mono text-slate-800">
                      1,075,431 parameters
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500 font-medium">Empirical Benchmark:</span>
                    <span className="font-mono text-slate-700 text-right">
                      25.6 km Val CLE • 38.2 km Test CLE
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 space-y-2">
                <Target className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-xs font-medium">No inference executed yet for this frame.</p>
                <p className="text-[11px] text-slate-400">
                  Click <strong>Run Detection Inference</strong> to execute the MobileNetV3 model on this frame.
                </p>
              </div>
            )}

            <div className="pt-2">
              <button 
                onClick={() => navigate('/dashboard/classification')}
                className="btn-primary w-full text-xs py-2.5 justify-center gap-1.5"
              >
                <span>Proceed to Pattern Classification Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Model Specification Card */}
          <div className="card p-4 bg-slate-50 border-slate-200 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Scientific Verification Protocol
            </h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div>• <strong>Model:</strong> MobileNetV3-Small Dual-Head (Objectness + Localization)</div>
              <div>• <strong>Held-out Benchmark:</strong> 100% objectness accuracy on held-out benchmark set</div>
              <div>• <strong>Center Localization Error:</strong> 25.6 km validation CLE, 38.2 km test CLE</div>
              <div>• <strong>Execution Mode:</strong> PyTorch Native CPU/MPS inference via FastAPI</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Detection;
