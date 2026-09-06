import React, { useState, useEffect } from 'react';
import { 
  Cpu, Database, CheckCircle, AlertCircle, RefreshCw, 
  Layers, Compass, ShieldCheck, Target, Eye, Activity, 
  Binary, Zap, ArrowRight, ShieldAlert, FileText, Check
} from 'lucide-react';
import { checkBackendHealth, fetchModelBenchmarks } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const ModelTraining = () => {
  const [activeTab, setActiveTab] = useState('models'); // 'models', 'schema', 'benchmarks'
  const [backendHealth, setBackendHealth] = useState(null);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const health = await checkBackendHealth();
      setBackendHealth(health);
    } catch (e) {
      console.warn('Health fetch error:', e);
    }

    try {
      const bData = await fetchModelBenchmarks();
      setBenchmarkData(bData);
    } catch (e) {
      console.warn('Benchmark fetch error:', e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isLive = backendHealth && (backendHealth.status === 'ONLINE' || backendHealth.status === 'ok');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Standard Unified Header */}
      <PageHeader
        categoryBadge="AI SYSTEM • MODEL INTELLIGENCE"
        categoryColor="blue"
        modelBadge={isLive ? "PyTorch Checkpoints Active" : "Backend Disconnected"}
        title="AI Model Intelligence"
        subtitle="Production AI inference pipeline, deep model architectures, and empirical held-out benchmarks across satellite vision and trajectory forecasting."
        actions={
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="btn-secondary text-xs sm:text-sm py-2 px-3.5 gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Checking...' : 'Refresh Telemetry'}</span>
          </button>
        }
      />

      {/* Production Model Summary Overview KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Production Models</span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">3 Dedicated</p>
          <p className="text-[11px] text-slate-500">Detector + Classifier + Forecaster</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trainable Weights</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Binary className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">12.36M</p>
          <p className="text-[11px] text-slate-500">Parameters active across checkpoints</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forecast Horizon</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">+72 Hours</p>
          <p className="text-[11px] text-slate-500">3-hourly multi-step trajectory</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4.5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MC Uncertainty</span>
            <span className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 font-heading">25 Passes</p>
          <p className="text-[11px] text-slate-500">Epistemic Dropout (p=0.20)</p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'models'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Production Model Architectures (3)
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          10-Feature Kinematic Schema
        </button>
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'benchmarks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Empirical Benchmark Protocols
        </button>
      </div>

      {/* TAB 1: 3 PRODUCTION MODELS */}
      {activeTab === 'models' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MODEL 1: Cyclone Detection */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  DETECTOR
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">MobileNetV3-Small</h3>
                <p className="text-xs text-slate-500 font-mono">MobileNetV3-Small-CenterFix</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Dual-head deep convolutional network for instantaneous binary cyclone identification and geographic center coordinate localization on single-frame satellite raster feeds.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs font-mono border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parameters:</span>
                  <span className="font-bold text-slate-900">1,075,431 (1.08M)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Input Dimensions:</span>
                  <span className="text-slate-800">224 × 224 RGB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dual Heads:</span>
                  <span className="text-slate-800">Objectness + Center</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Checkpoint:</span>
                  <span className="text-slate-800 text-[10px] truncate max-w-[140px]" title="vayu_detector_mobilenetv3_p3b.pt">vayu_detector_...p3b.pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SHA Prefix:</span>
                  <span className="text-slate-700 text-[10px]">ace2239bf27ef171</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Verified Benchmark Metrics</span>
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>100% objectness accuracy on current held-out benchmark</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 pl-5">
                    Validation CLE: <strong>25.6 km</strong> • Test CLE: <strong>38.2 km</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Inference Latency: ~35–45 ms (CPU)
            </div>
          </div>

          {/* MODEL 2: Morphology Classification */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 flex items-center justify-center font-bold text-xs">
                  02
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200">
                  CLASSIFIER
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">ResNet18 Morphology</h3>
                <p className="text-xs text-slate-500 font-mono">ResNet18-Dvorak-Morphology</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Convolutional residual classifier mapping cloud structure into 4 validated Dvorak morphological patterns with PyTorch Autograd Grad-CAM explainability activation maps.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs font-mono border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parameters:</span>
                  <span className="font-bold text-slate-900">11,246,436 (11.2M)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Input Dimensions:</span>
                  <span className="text-slate-800">224 × 224 RGB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validated Classes:</span>
                  <span className="text-slate-800">4 Supported Patterns</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Checkpoint:</span>
                  <span className="text-slate-800 text-[10px] truncate max-w-[140px]" title="vayu_morph_resnet18_p3b.pt">vayu_morph_...p3b.pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SHA Prefix:</span>
                  <span className="text-slate-700 text-[10px]">e28e013e579bd256</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">4 Supported Dvorak Classes</span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-700">
                  <span className="p-1.5 rounded bg-slate-50 border border-slate-100">1. Eye Pattern</span>
                  <span className="p-1.5 rounded bg-slate-50 border border-slate-100">2. Curved Band</span>
                  <span className="p-1.5 rounded bg-slate-50 border border-slate-100">3. Shear Pattern</span>
                  <span className="p-1.5 rounded bg-slate-50 border border-slate-100">4. Calm Baseline</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[10px] text-amber-900 space-y-0.5 mt-2">
                  <p className="font-semibold">Validation Accuracy: 50.0% (N=14 train frames)</p>
                  <p className="text-amber-800">
                    * Scientific note: Training representation is limited. CDO and Embedded Center patterns are NOT supported prediction classes due to insufficient NIO annotations.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Inference Latency: ~65–85 ms (CPU)
            </div>
          </div>

          {/* MODEL 3: Trajectory Forecasting */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold text-xs">
                  03
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  FORECASTER
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">2-Layer GRU Seq2Seq</h3>
                <p className="text-xs text-slate-500 font-mono">CycloneTrajectoryGRU-Seq2Seq</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Sequence-to-sequence recurrent neural network with 10 kinematic features, predicting 3-hourly coordinate progression and barometric intensity with 25-pass MC Dropout uncertainty.
              </p>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs font-mono border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parameters:</span>
                  <span className="font-bold text-slate-900">41,764 (41.8K)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Feature Schema:</span>
                  <span className="text-slate-800">10 Canonical Features</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Observation Step:</span>
                  <span className="text-slate-800">3-Hourly Intervals</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Checkpoint:</span>
                  <span className="text-slate-800 text-[10px] truncate max-w-[140px]" title="vayu_track_gru_p3b.pt">vayu_track_...p3b.pt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SHA Prefix:</span>
                  <span className="text-slate-700 text-[10px]">560fb5650d23</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Verified Benchmark Advantage</span>
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[11px] text-emerald-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>At +72h: 86.0 km lower mean error vs persistence on benchmark</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 pl-5">
                    25-pass MC Dropout (p=0.20) directional epistemic uncertainty cone.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
              Inference Latency: ~15–25 ms (CPU, 25 passes)
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: 10-FEATURE KINEMATIC SCHEMA */}
      {activeTab === 'schema' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Canonical 10-Feature Trajectory Schema</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The 2-Layer GRU Seq2Seq model strictly operates on this normalized kinematic and environmental feature vector at each 3-hourly sequence step.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold font-mono text-[11px]">
                  <th className="pb-2.5">Index</th>
                  <th className="pb-2.5">Feature Name</th>
                  <th className="pb-2.5">Physical Dimension / Unit</th>
                  <th className="pb-2.5">Role in GRU Rollout</th>
                  <th className="pb-2.5">Source Feed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">0</td>
                  <td className="py-2.5 text-sky-700 font-semibold">latitude</td>
                  <td className="py-2.5">Degrees North (°N)</td>
                  <td className="py-2.5 font-sans text-xs">Geographic meridional position</td>
                  <td className="py-2.5 text-slate-500">IMD Best-Track / MobileNetV3</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">1</td>
                  <td className="py-2.5 text-sky-700 font-semibold">longitude</td>
                  <td className="py-2.5">Degrees East (°E)</td>
                  <td className="py-2.5 font-sans text-xs">Geographic zonal position</td>
                  <td className="py-2.5 text-slate-500">IMD Best-Track / MobileNetV3</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">2</td>
                  <td className="py-2.5 text-sky-700 font-semibold">delta_lat</td>
                  <td className="py-2.5">Degrees / 3 hours</td>
                  <td className="py-2.5 font-sans text-xs">Meridional translation velocity</td>
                  <td className="py-2.5 text-slate-500">Kinematic First Difference</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">3</td>
                  <td className="py-2.5 text-sky-700 font-semibold">delta_lon</td>
                  <td className="py-2.5">Degrees / 3 hours</td>
                  <td className="py-2.5 font-sans text-xs">Zonal translation velocity</td>
                  <td className="py-2.5 text-slate-500">Kinematic First Difference</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">4</td>
                  <td className="py-2.5 text-sky-700 font-semibold">speed_knots</td>
                  <td className="py-2.5">Knots (kts)</td>
                  <td className="py-2.5 font-sans text-xs">Sustained maximum 1-min wind</td>
                  <td className="py-2.5 text-slate-500">Synoptic Observation / Dvorak</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">5</td>
                  <td className="py-2.5 text-sky-700 font-semibold">pressure_hpa</td>
                  <td className="py-2.5">Hectopascals (hPa)</td>
                  <td className="py-2.5 font-sans text-xs">Central barometric minimum</td>
                  <td className="py-2.5 text-slate-500">Surface Synoptic Analysis</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">6</td>
                  <td className="py-2.5 text-sky-700 font-semibold">sst_c</td>
                  <td className="py-2.5">Celsius (°C)</td>
                  <td className="py-2.5 font-sans text-xs">Underlying thermal fuel energy</td>
                  <td className="py-2.5 text-slate-500">NOAA OISST / INCOIS Buoys</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">7</td>
                  <td className="py-2.5 text-sky-700 font-semibold">vertical_shear_kts</td>
                  <td className="py-2.5">Knots (kts)</td>
                  <td className="py-2.5 font-sans text-xs">850-200 hPa Deep-layer shear</td>
                  <td className="py-2.5 text-slate-500">ERA5 / Reanalysis Wind Grid</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">8</td>
                  <td className="py-2.5 text-sky-700 font-semibold">coriolis_f</td>
                  <td className="py-2.5">s⁻¹ (2Ω sin φ)</td>
                  <td className="py-2.5 font-sans text-xs">Planetary vorticity deflection</td>
                  <td className="py-2.5 text-slate-500">Computed from Latitude</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">9</td>
                  <td className="py-2.5 text-sky-700 font-semibold">heading_degrees</td>
                  <td className="py-2.5">Azimuth Degrees (0–360°)</td>
                  <td className="py-2.5 font-sans text-xs">Instantaneous vector course</td>
                  <td className="py-2.5 text-slate-500">Cartesian Heading Trigonometry</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EMPIRICAL BENCHMARK PROTOCOLS */}
      {activeTab === 'benchmarks' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">Held-Out Empirical Benchmark Horizons</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Held-out test evaluation against persistence baseline on verified historical cyclones over the North Indian Ocean.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="pb-2.5">Horizon</th>
                  <th className="pb-2.5">GRU Seq2Seq Error (MAE)</th>
                  <th className="pb-2.5">Persistence Baseline Error</th>
                  <th className="pb-2.5">Lead Benchmark Advantage</th>
                  <th className="pb-2.5">Evaluation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">+6h</td>
                  <td className="py-2.5">68.9 km</td>
                  <td className="py-2.5">25.5 km</td>
                  <td className="py-2.5 text-slate-500 font-sans">Persistence dominant in ultra-short horizon</td>
                  <td className="py-2.5 text-slate-600">Within normal kinematic regime</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">+12h</td>
                  <td className="py-2.5">114.9 km</td>
                  <td className="py-2.5">54.0 km</td>
                  <td className="py-2.5 text-slate-500 font-sans">Persistence dominant in short horizon</td>
                  <td className="py-2.5 text-slate-600">Synoptic transition</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">+18h</td>
                  <td className="py-2.5">158.9 km</td>
                  <td className="py-2.5">82.8 km</td>
                  <td className="py-2.5 text-slate-500 font-sans">Persistence baseline</td>
                  <td className="py-2.5 text-slate-600">Intermediate rollout</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">+24h</td>
                  <td className="py-2.5">197.7 km</td>
                  <td className="py-2.5">110.9 km</td>
                  <td className="py-2.5 text-slate-500 font-sans">Persistence baseline</td>
                  <td className="py-2.5 text-slate-600">Day 1 forecast</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-900">+48h</td>
                  <td className="py-2.5">278.7 km</td>
                  <td className="py-2.5">251.4 km</td>
                  <td className="py-2.5 text-slate-500 font-sans">Errors converge as persistence degrades</td>
                  <td className="py-2.5 text-slate-600">Day 2 forecast</td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td className="py-3 font-bold text-emerald-950">+72h</td>
                  <td className="py-3 font-bold text-emerald-700">311.9 km</td>
                  <td className="py-3 text-slate-700">397.9 km</td>
                  <td className="py-3 font-bold text-emerald-700 font-sans">
                    +86.0 km lower mean error than persistence
                  </td>
                  <td className="py-3 text-emerald-800 font-bold">
                    GRU Benchmark Winner
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-sans">
            <span className="font-bold text-slate-800 block">Scientific Truth Statement:</span>
            <p>
              VAYU reports genuine held-out evaluation numbers without inflation. GRU Seq2Seq models outperform persistence significantly at long lead times (+72 hours) where straight-line extrapolation breaks down due to track recurvature, land interaction, and atmospheric steering.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ModelTraining;
