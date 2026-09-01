import React, { useState } from 'react';
import { 
  Target, Cpu, Server, FileImage, CheckCircle, 
  ChevronRight, Play, RotateCcw, Activity, Eye, 
  Layers, Sliders, Sparkles, BarChart2, ShieldCheck, 
  ArrowRight, Box
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PIPELINE_STAGES = [
  {
    step: 1,
    title: 'Multi-Band Input Ingestion',
    short: 'Input & Resize',
    icon: FileImage,
    tensor: 'Tensor [B, 3, 224, 224]',
    desc: 'Calibrated INSAT-3DR Thermal IR (10.8µm) & Water Vapour channels normalized and aligned to standard 224x224 input grid.',
    params: 'Mean: 0.485, Std: 0.229',
    latency: '12ms'
  },
  {
    step: 2,
    title: 'Cloud Top Thresholding & Pre-Processing',
    short: 'Pre-Processing',
    icon: Server,
    tensor: 'Tensor [B, 1, 224, 224]',
    desc: 'Adaptive Otsu thresholding & Gaussian blur filter isolating convective cloud tops colder than -40°C.',
    params: 'Kernel: 5x5, Sigma: 1.4',
    latency: '24ms'
  },
  {
    step: 3,
    title: 'Gradient Spiral Feature Extraction',
    short: 'Feature Extraction',
    icon: Cpu,
    tensor: 'Tensor [B, 512, 14, 14]',
    desc: 'VGG-16 / ResNet-50 convolutional backbones extracting spiral band curvature, CDO diameter, and eye wall gradient flows.',
    params: 'Filters: 512, Stride: 2',
    latency: '85ms'
  },
  {
    step: 4,
    title: 'CNN Inference & Bounding Regression',
    short: 'CNN Inference',
    icon: Target,
    tensor: 'Tensor [B, 6] (Class + BBox)',
    desc: 'Dense classification head detecting cyclone presence, regression head predicting central eye coordinates [ymin, xmin, ymax, xmax].',
    params: 'Softmax + Smooth L1 Loss',
    latency: '42ms'
  },
  {
    step: 5,
    title: 'Automated Dvorak & Intensity Output',
    short: 'Output Dossier',
    icon: CheckCircle,
    tensor: 'Final Metadata JSON',
    desc: 'Converts deep feature embeddings into automated Dvorak T-numbers, central pressure (MSLP), and maximum sustained wind velocity.',
    params: 'Lookup: Empirical Dvorak Matrix',
    latency: '8ms'
  }
];

const Detection = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(4); // Default to final stage
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [viewMode, setViewMode] = useState('cam'); // 'raw', 'cam', 'edges'

  const handleRunFullPipeline = () => {
    setIsRunningPipeline(true);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 5) {
          clearInterval(stepInterval);
          setIsRunningPipeline(false);
          return 5;
        }
        return prev + 1;
      });
    }, 600);
  };

  const activeStage = PIPELINE_STAGES[currentStep - 1];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#003087]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Deep Learning Detection Lab</h1>
            <span className="badge badge-navy">CycloneVision-CNN v2.1</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-to-end computer vision pipeline for automated tropical cyclogenesis identification & eye localization
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={handleRunFullPipeline}
            disabled={isRunningPipeline}
            className="btn-primary text-xs sm:text-sm py-2 px-4 gap-2 shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunningPipeline ? 'animate-spin' : ''}`} />
            <span>{isRunningPipeline ? `Executing Stage ${currentStep}/5...` : 'Run Complete Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Step-by-Step Pipeline Stepper */}
      <div className="card overflow-hidden">
        <div className="card-header bg-white">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#003087]" />
            <h3 className="text-sm font-bold text-slate-900">Pipeline Execution Architecture</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Total Execution Latency: ~173ms</span>
        </div>

        <div className="p-5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            {PIPELINE_STAGES.map((stage) => {
              const isPassed = stage.step < currentStep;
              const isCurrent = stage.step === currentStep;

              return (
                <button
                  key={stage.step}
                  onClick={() => setCurrentStep(stage.step)}
                  className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all ${
                    isCurrent 
                      ? 'border-[#003087] bg-blue-50/70 shadow-xs' 
                      : isPassed
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-colors ${
                    isCurrent 
                      ? 'bg-[#003087] text-white shadow-md' 
                      : isPassed 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isPassed ? <CheckCircle className="w-5 h-5" /> : stage.step}
                  </div>
                  
                  <span className="font-bold text-xs text-slate-800 line-clamp-1">{stage.short}</span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">{stage.latency}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Visual Output Window (7 Cols) */}
        <div className="lg:col-span-7 card overflow-hidden flex flex-col">
          
          <div className="card-header bg-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Stage {activeStage.step}: {activeStage.title}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{activeStage.tensor}</p>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {[
                { id: 'raw', label: 'Raw IR Band' },
                { id: 'cam', label: 'Grad-CAM Attention' },
                { id: 'edges', label: 'Spiral Flow' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    viewMode === mode.id ? 'bg-white text-[#003087] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Canvas Area */}
          <div className="relative bg-slate-950 flex items-center justify-center min-h-[460px] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2074&auto=format&fit=crop" 
              alt="Model Inference View" 
              className={`w-full h-full object-cover filter transition-all duration-300 ${
                viewMode === 'raw' 
                  ? 'brightness-90 contrast-110 saturate-50' 
                  : viewMode === 'cam'
                  ? 'brightness-75 contrast-150 hue-rotate-180 saturate-200'
                  : 'brightness-120 contrast-200 invert'
              }`}
            />

            {/* Grad-CAM Heatmap Radial Overlay */}
            {viewMode === 'cam' && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(239,68,68,0.4)_0%,_rgba(234,179,8,0.2)_30%,_transparent_70%)] pointer-events-none" />
            )}

            {/* Stage-Specific Graphic Overlays */}
            {currentStep >= 3 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                
                {/* Spiral Streamline Curves */}
                <div className="w-72 h-72 rounded-full border-2 border-dashed border-cyan-400/60 animate-spin" style={{ animationDuration: '30s' }} />
                
                {/* Bounding Box at Step 4 & 5 */}
                {currentStep >= 4 && (
                  <div className="absolute w-56 h-56 border-2 border-red-500 rounded-lg flex items-start justify-between p-2 bg-red-500/10">
                    <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
                      CYCLONE_CENTER • 96.4%
                    </span>
                    <span className="text-[10px] bg-black/80 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      15.4°N, 87.8°E
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tensor Spec Stamp */}
            <div className="absolute bottom-3 left-3 bg-black/80 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
              Layer: conv5_block3_out | Gradient: Norm-L2
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span><strong>Layer Description:</strong> {activeStage.desc}</span>
          </div>

        </div>

        {/* Right: Detailed Tensor Metrics & Class Output (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col">
          
          {/* Classification Confidence Output Card */}
          <div className="card p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">AI Inference Verdict</h3>
              </div>
              <span className="badge badge-green">Inference Confirmed</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Cyclone Target Detected:</span>
                <span className="text-xs font-mono font-extrabold text-emerald-800">POSITIVE (1)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-700">Classification Confidence:</span>
                <span className="font-bold text-emerald-900">96.4%</span>
              </div>
              <div className="progress-bar bg-emerald-200/60">
                <div className="progress-fill bg-emerald-600" style={{ width: '96.4%' }}></div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Identified Eye Center', val: '15.4°N, 87.8°E (West-Central Bay of Bengal)' },
                { label: 'Estimated CDO Diameter', val: '240 km' },
                { label: 'Automated Dvorak Number', val: 'T3.0 (Severe Cyclone Potential)' },
                { label: 'Minimum Central Pressure', val: '980 hPa (± 3 hPa error margin)' },
                { label: 'Maximum Sustained Winds', val: '85 km/h (46 knots)' },
                { label: 'Convolution Backbone', val: 'ResNet-50 + Spatial Pyramid Pooling' },
                { label: 'Dataset Benchmark', val: 'MOSDAC 40,000+ IR Historical Archive' }
              ].map((row, idx) => (
                <div key={idx} className="flex justify-between items-start py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-slate-500 font-medium">{row.label}:</span>
                  <span className="font-semibold text-slate-800 text-right ml-2">{row.val}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => navigate('/dashboard/classification')}
                className="btn-primary w-full text-xs py-2.5 justify-center"
              >
                <span>Proceed to Pattern Classification Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hyperparameters & Model Specs Card */}
          <div className="card p-4 bg-slate-50 border-slate-200 space-y-2.5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Active Stage Hyperparameters</h4>
            <div className="space-y-1 font-mono text-[11px]">
              <div>• <strong>Input Tensor:</strong> {activeStage.tensor}</div>
              <div>• <strong>Hyperparameters:</strong> {activeStage.params}</div>
              <div>• <strong>Hardware Engine:</strong> CUDA TensorRT Accelerated (1.2 ms/frame)</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Detection;
