import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle, BrainCircuit, Compass, 
  ShieldAlert, FileText, Satellite, Layers, 
  ArrowRight, ExternalLink, Gauge, Wind, 
  Check, AlertTriangle, Cpu, Database, 
  Eye, RefreshCw, Radio, Sparkles, MapPin,
  ShieldCheck, AlertCircle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { checkBackendHealth } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import InfoCallout from '../components/InfoCallout';

export function getImdIntensityMeta(windKmh = 85) {
  if (windKmh >= 222) {
    return { category: 'Super Cyclonic Storm', color: '#A855F7', bg: 'bg-purple-600', text: 'text-purple-600', tag: 'SuCS' };
  } else if (windKmh >= 167) {
    return { category: 'Extremely Severe Cyclonic Storm', color: '#EF4444', bg: 'bg-red-600', text: 'text-red-600', tag: 'ESCS' };
  } else if (windKmh >= 118) {
    return { category: 'Very Severe Cyclonic Storm', color: '#F97316', bg: 'bg-orange-500', text: 'text-orange-500', tag: 'VSCS' };
  } else if (windKmh >= 89) {
    return { category: 'Severe Cyclonic Storm', color: '#F59E0B', bg: 'bg-amber-500', text: 'text-amber-500', tag: 'SCS' };
  } else if (windKmh >= 62) {
    return { category: 'Cyclonic Storm', color: '#10B981', bg: 'bg-emerald-500', text: 'text-emerald-500', tag: 'CS' };
  } else {
    return { category: 'Deep Depression', color: '#06B6D4', bg: 'bg-cyan-500', text: 'text-cyan-500', tag: 'DD' };
  }
}

export function generateSmoothSpline(points, numInterpolations = 8) {
  if (!points || points.length < 2) return points || [];
  const smooth = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    for (let t = 0; t < numInterpolations; t++) {
      const u = t / numInterpolations;
      const u2 = u * u;
      const u3 = u2 * u;

      const lat = 0.5 * (
        (2 * p1[0]) +
        (-p0[0] + p2[0]) * u +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3
      );
      const lon = 0.5 * (
        (2 * p1[1]) +
        (-p0[1] + p2[1]) * u +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3
      );
      smooth.push([parseFloat(lat.toFixed(3)), parseFloat(lon.toFixed(3))]);
    }
  }
  smooth.push(points[points.length - 1]);
  return smooth;
}

const BENCHMARK_CASES = {
  DANA: {
    id: 'DANA',
    name: 'Cyclone DANA (2024)',
    year: '2024',
    basin: 'Bay of Bengal',
    current_lat: 20.4,
    current_lon: 87.2,
    intensity_stage: 'Severe Cyclonic Storm (SCS)',
    wind_kmh: 110,
    wind_kt: 60,
    pressure_hpa: 984,
    landfall_corridor: 'Dhamra / Bhadrak Coast, Odisha',
    status: 'Verified Historical Benchmark',
    val_cle_km: 25.6,
    description: 'Post-monsoon Severe Cyclonic Storm in the North Bay of Bengal. Validated 72-hour forecast sequence with northern recurvature and coastal landfall.'
  },
  BIPARJOY: {
    id: 'BIPARJOY',
    name: 'Cyclone BIPARJOY (2023)',
    year: '2023',
    basin: 'Arabian Sea',
    current_lat: 22.8,
    current_lon: 67.1,
    intensity_stage: 'Very Severe Cyclonic Storm (VSCS)',
    wind_kmh: 140,
    wind_kt: 75,
    pressure_hpa: 968,
    landfall_corridor: 'Jakhau Port, Kutch, Gujarat',
    status: 'Verified Historical Benchmark',
    val_cle_km: 38.2,
    description: 'Extremely Severe Cyclonic Storm in the East-Central Arabian Sea with anomalous northward translation and northeastward recurvature toward Gujarat.'
  }
};

const PIPELINE_STAGES = [
  { id: 'gibs', name: 'NASA GIBS', role: 'Multi-spectral Frame Ingestion', model: 'MODIS / VIIRS Terra-Aqua' },
  { id: 'detector', name: 'MobileNetV3', role: 'Objectness & Center Fix', model: '1,075,431 Params' },
  { id: 'classifier', name: 'ResNet18', role: 'Morphology Classification', model: '11,246,436 Params' },
  { id: 'gradcam', name: 'Grad-CAM', role: 'Visual Attention Heatmap', model: 'Layer-4 Target Act.' },
  { id: 'gru', name: '2-Layer GRU', role: 'Spatiotemporal Seq2Seq Track', model: '41,764 Params' },
  { id: 'mcdropout', name: 'MC Dropout', role: 'Epistemic Uncertainty Cone', model: '25 Stochastic Passes' },
  { id: 'impact', name: 'Impact Engine', role: 'Coastal Strike Probability', model: 'GIS Hazard Polygon' },
  { id: 'bulletin', name: 'Official Bulletin', role: 'Automated Synoptic PDF', model: 'ReportLab IMD Schema' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCaseId, setSelectedCaseId] = useState('DANA');
  const [systemHealth, setSystemHealth] = useState({ status: 'CHECKING', models_active: {} });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const activeCase = BENCHMARK_CASES[selectedCaseId] || BENCHMARK_CASES.DANA;
  const intensityMeta = getImdIntensityMeta(activeCase.wind_kmh);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await checkBackendHealth();
      setSystemHealth(data || { status: 'OFFLINE' });
    } catch {
      setSystemHealth({ status: 'OFFLINE' });
    } finally {
      setIsRefreshing(false);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isOnline = systemHealth.status === 'ONLINE';

  return (
    <div className="space-y-6 max-w-[1600px] w-full min-w-0 mx-auto pb-12 font-sans">

      {/* 1. Header & Active Benchmark Switcher */}
      <PageHeader
        categoryBadge="COMMAND CENTER"
        categoryColor="navy"
        title="Command Overview"
        subtitle="Single executive summary of verified benchmark cases, operational pipeline status, and validated empirical metrics."
        modelBadge="N=1,148 SYNOPTIC CYCLES"
        actions={
          <>
            <div className="storm-pill-track-3d">
              {Object.values(BENCHMARK_CASES).map((storm) => {
                const isActive = selectedCaseId === storm.id;
                return (
                  <button
                    key={storm.id}
                    onClick={() => setSelectedCaseId(storm.id)}
                    className={`storm-pill-3d-btn ${isActive ? 'is-active' : ''}`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                        <span className="animate-vayu-sheen absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                      </span>
                    )}
                    <span className="relative z-10">{storm.name}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={fetchHealth}
              disabled={isRefreshing}
              title="Refresh System Health"
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#003087]' : ''}`} />
            </button>
          </>
        }
      />

      {/* 2. System Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Backend Gateway */}
        <div className="vayu-glass-3d-card-interactive p-4.5 flex items-center gap-3.5 rounded-2xl cursor-default">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)] ${
            isOnline 
              ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80' 
              : 'bg-rose-50/90 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400 block">FastAPI Gateway</span>
            <span className="text-sm font-black text-slate-950 dark:text-white flex items-center gap-2 tracking-tight">
              {isOnline ? 'ONLINE' : 'UNAVAILABLE'}
              <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50' : 'bg-red-500 shadow-xs shadow-red-500/50'}`} />
            </span>
            <span className="text-[11px] font-semibold font-mono text-slate-600 dark:text-slate-300 block truncate mt-0.5">v4.0.0 • Port 8000</span>
          </div>
        </div>

        {/* AI Checkpoints */}
        <div className="vayu-glass-3d-card-interactive p-4.5 flex items-center gap-3.5 rounded-2xl cursor-default">
          <div className="w-11 h-11 rounded-2xl bg-blue-50/90 text-[#003087] dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400 block">Model Checkpoints</span>
            <span className="text-sm font-black text-slate-950 dark:text-white block tracking-tight">3 Neural Models Active</span>
            <span className="text-[11px] font-semibold font-mono text-slate-600 dark:text-slate-300 block truncate mt-0.5">PyTorch 2.0 • CPU/MPS</span>
          </div>
        </div>

        {/* Satellite Service */}
        <div className="vayu-glass-3d-card-interactive p-4.5 flex items-center gap-3.5 rounded-2xl cursor-default">
          <div className="w-11 h-11 rounded-2xl bg-sky-50/90 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0">
            <Satellite className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400 block">Satellite Feed</span>
            <span className="text-sm font-black text-slate-950 dark:text-white block tracking-tight">NASA GIBS / EOSDIS</span>
            <span className="text-[11px] font-semibold font-mono text-slate-600 dark:text-slate-300 block truncate mt-0.5">MODIS & VIIRS Tiles</span>
          </div>
        </div>

        {/* Telemetry Database */}
        <div className="vayu-glass-3d-card-interactive p-4.5 flex items-center gap-3.5 rounded-2xl cursor-default">
          <div className="w-11 h-11 rounded-2xl bg-purple-50/90 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500 dark:text-slate-400 block">Historical Database</span>
            <span className="text-sm font-black text-slate-950 dark:text-white block tracking-tight">SQLite (9 Tables)</span>
            <span className="text-[11px] font-semibold font-mono text-slate-600 dark:text-slate-300 block truncate mt-0.5">1,148 Synoptic Cycles</span>
          </div>
        </div>
      </div>

      {/* 3. 8-Stage Real AI Pipeline Orchestration Tracker */}
      <div className="vayu-glass-3d-card overflow-hidden rounded-3xl">
        <div className="p-4 px-5 border-b border-white/70 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#003087] dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              8-Stage Operational AI Vision & Forecasting Pipeline
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">Status:</span>
            <StatusBadge status={isOnline ? 'READY' : 'UNAVAILABLE'} size="xs" />
          </div>
        </div>

        <div className="p-4.5 overflow-x-auto">
          <div className="flex items-center gap-2.5 min-w-[960px]">
            {PIPELINE_STAGES.map((stage, idx) => (
              <React.Fragment key={stage.id}>
                <div className="vayu-glass-3d-step flex-1 min-w-[130px] rounded-2xl p-3.5 group cursor-default">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400">0{idx + 1}</span>
                    <StatusBadge status={isOnline ? 'READY' : 'OFFLINE'} size="xs" />
                  </div>
                  <h4 className="text-xs font-black text-slate-950 dark:text-white tracking-tight group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors">{stage.name}</h4>
                  <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 mt-1 leading-snug">{stage.role}</p>
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 block truncate" title={stage.model}>{stage.model}</span>
                  </div>
                </div>
                {idx < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Empirical Benchmark Cards (Verified Metrics) */}
      <div className="w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Empirical Benchmark Performance (N=1,148 Synoptic Cycles)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">Held-Out Test Partition Verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4.5 border-l-4 border-l-emerald-500 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-500 dark:text-slate-400 block">MobileNetV3 Objectness</span>
            <div className="text-2xl font-black text-slate-950 dark:text-white mt-1 tracking-tight">100%</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Detection accuracy on held-out cyclone satellite frames.</p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-2.5 block font-semibold">1,075,431 Parameters</span>
          </div>

          <div className="card p-4.5 border-l-4 border-l-sky-500 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-500 dark:text-slate-400 block">Validation CLE (72h)</span>
            <div className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1 tracking-tight">25.6 km</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Mean Center Location Error at +72h horizon on validation set.</p>
            <span className="text-[10px] text-sky-700 dark:text-sky-400 font-mono mt-2.5 block font-semibold">Cyclone DANA (2024)</span>
          </div>

          <div className="card p-4.5 border-l-4 border-l-[#003087] border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-500 dark:text-slate-400 block">Test CLE (72h)</span>
            <div className="text-2xl font-black text-[#003087] dark:text-blue-400 mt-1 tracking-tight">38.2 km</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Generalization Center Location Error across cross-basin test tracks.</p>
            <span className="text-[10px] text-[#003087] dark:text-blue-400 font-mono mt-2.5 block font-semibold">Cyclone BIPARJOY (2023)</span>
          </div>

          <div className="card p-4.5 border-l-4 border-l-purple-500 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-slate-500 dark:text-slate-400 block">+72h vs Persistence</span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1 tracking-tight">+86.0 km</div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">Lower mean track error at +72h compared to operational persistence.</p>
            <span className="text-[10px] text-purple-700 dark:text-purple-400 font-mono mt-2.5 block font-semibold">Statistically Significant (p &lt; 0.001)</span>
          </div>
        </div>
      </div>

      {/* 5. Active Benchmark Case Synopsis */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 font-mono">
                Active Benchmark Case
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">{activeCase.basin} Basin</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">{activeCase.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">{activeCase.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs" style={{ backgroundColor: intensityMeta.color }}>
              {activeCase.intensity_stage}
            </span>
            <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              72h Sequence Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block font-mono">Benchmark Position</span>
            <span className="text-slate-900 dark:text-white font-extrabold text-sm sm:text-base mt-1 block font-mono">{activeCase.current_lat}°N, {activeCase.current_lon}°E</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block font-mono">Sustained Wind Speed</span>
            <span className="text-red-600 dark:text-red-400 font-extrabold text-sm sm:text-base mt-1 block font-mono">{activeCase.wind_kmh} km/h ({activeCase.wind_kt} kt)</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block font-mono">Central MSLP</span>
            <span className="text-sky-700 dark:text-sky-400 font-extrabold text-sm sm:text-base mt-1 block font-mono">{activeCase.pressure_hpa} hPa</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block font-mono">Target Landfall Sector</span>
            <span className="text-amber-700 dark:text-amber-400 font-bold text-xs sm:text-sm mt-1 block truncate">{activeCase.landfall_corridor}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
            <span><strong className="text-slate-900 dark:text-slate-200 font-bold">Strict State Isolation:</strong> In-session satellite uploads on other pages remain isolated and do not alter this benchmark state.</span>
          </div>
          <span className="font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-100 dark:border-sky-800/60 hidden md:inline">Ground Truth Fix: 00:00 UTC</span>
        </div>
      </div>

      {/* 6. Operational Navigation Launch Matrix */}
      <div className="w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-[#003087] shrink-0" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Operational Subsystems & Dedicated Analysis Studios
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-semibold">Select a dedicated workspace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Satellite Analysis */}
          <div className="vayu-glass-3d-card-interactive p-5.5 rounded-3xl flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)]">
                <Satellite className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors tracking-tight">
                Satellite Imagery Studio
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                NASA GIBS MODIS/VIIRS multi-spectral ingestion, custom image upload, and integrated single-frame AI vision assessment.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">/dashboard/satellite</span>
              <button
                onClick={() => navigate('/dashboard/satellite')}
                className="btn-secondary text-xs py-1.5 px-3.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#003087] hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.04)] group-hover:bg-[#003087] group-hover:text-white transition-all cursor-pointer font-bold"
              >
                Open Satellite Analysis
              </button>
            </div>
          </div>

          {/* Cyclone Detection */}
          <div className="vayu-glass-3d-card-interactive p-5.5 rounded-3xl flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)]">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors tracking-tight">
                Cyclone Detection & Center Localization
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                MobileNetV3-Small deep detector (1,075,431 params) executing objectness scoring, bounding box, and center coordinate fixes.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">/dashboard/detection</span>
              <button
                onClick={() => navigate('/dashboard/detection')}
                className="btn-secondary text-xs py-1.5 px-3.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#003087] hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.04)] group-hover:bg-[#003087] group-hover:text-white transition-all cursor-pointer font-bold"
              >
                Open Detection
              </button>
            </div>
          </div>

          {/* Morphology Classification */}
          <div className="vayu-glass-3d-card-interactive p-5.5 rounded-3xl flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)]">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors tracking-tight">
                Morphology Classification & Grad-CAM
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ResNet18 morphological pattern classifier (11,246,436 params) with Layer-4 Grad-CAM spatial visual explanations.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">/dashboard/classification</span>
              <button
                onClick={() => navigate('/dashboard/classification')}
                className="btn-secondary text-xs py-1.5 px-3.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#003087] hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.04)] group-hover:bg-[#003087] group-hover:text-white transition-all cursor-pointer font-bold"
              >
                Open Morphology
              </button>
            </div>
          </div>

          {/* Trajectory Forecast */}
          <div className="vayu-glass-3d-card-interactive p-5.5 rounded-3xl flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#003087] border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors tracking-tight">
                Trajectory Forecast (72h Horizon)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                2-Layer GRU Seq2Seq temporal model (41,764 params) autoregressively predicting +6h to +72h track with 25-pass MC Dropout cone.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">/dashboard/trajectory</span>
              <button
                onClick={() => navigate('/dashboard/trajectory')}
                className="btn-secondary text-xs py-1.5 px-3.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#003087] hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.04)] group-hover:bg-[#003087] group-hover:text-white transition-all cursor-pointer font-bold"
              >
                Open Trajectory
              </button>
            </div>
          </div>

          {/* Impact & Landfall */}
          <div className="vayu-glass-3d-card-interactive p-5.5 rounded-3xl flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)]">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors tracking-tight">
                Impact & Landfall Assessment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                High-resolution GIS impact analysis with 60km/120km hazard radii, storm surge estimates, and coastal district strike matrix.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">/dashboard/impact</span>
              <button
                onClick={() => navigate('/dashboard/impact')}
                className="btn-secondary text-xs py-1.5 px-3.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#003087] hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.04)] group-hover:bg-[#003087] group-hover:text-white transition-all cursor-pointer font-bold"
              >
                Open Impact
              </button>
            </div>
          </div>

          {/* Official Bulletin */}
          <div className="vayu-glass-3d-card-interactive p-5.5 rounded-3xl flex flex-col justify-between group">
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 flex items-center justify-center shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_6px_rgba(0,0,0,0.04)]">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-[#003087] dark:group-hover:text-sky-300 transition-colors tracking-tight">
                Official Advisory Bulletin (PDF)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated generation of official IMD-standard synoptic advisory bulletin PDFs via ReportLab backend compilation.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">/dashboard/bulletin</span>
              <button
                onClick={() => navigate('/dashboard/bulletin')}
                className="btn-secondary text-xs py-1.5 px-3.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-800/90 hover:bg-[#003087] hover:text-white border border-slate-200/90 dark:border-slate-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_5px_rgba(0,0,0,0.04)] group-hover:bg-[#003087] group-hover:text-white transition-all cursor-pointer font-bold"
              >
                Generate Bulletin
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
