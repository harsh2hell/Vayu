import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicNavbar, { applyGlobalFontScale } from '../components/PublicNavbar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ReferenceLine, Cell
} from 'recharts';
import {
  Target, Cpu, Layers, Satellite, Compass, Radio, Activity,
  TrendingUp, Sliders, RefreshCw, Wind, Thermometer,
  CheckCircle2, ArrowRight, Database, Gauge, Check,
  Clock, ShieldCheck, Waves, MapPin
} from 'lucide-react';
import {
  STOCK_CYCLONES,
  CYCLONE_PATTERN_CLASSES,
  CYCLONE_LIFECYCLE_STAGES,
  MULTI_SOURCE_FEEDS,
  TRAJECTORY_72H_FORECAST,
  HISTORICAL_BENCHMARKS,
  MODEL_ACCURACY_BENCHMARKS
} from '../data/sihCycloneData';
import { useLiveClock } from '../utils/liveDateTime';

const AICycloneIntelligence = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabParam = useMemo(() => new URLSearchParams(location.search).get('tab'), [location.search]);
  const liveClock = useLiveClock(1000);

  // Global Theme & Preferences (Light mode enforced)
  const [isHindi, setIsHindi] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try {
      const s = localStorage.getItem('vayu_font_offset');
      return s !== null ? parseInt(s, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Enforce Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    try { localStorage.removeItem('theme'); } catch {}
  }, []);

  // Active Tab State
  const [activeTab, setActiveTab] = useState(tabParam || 'identification');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Module 1: AI Vortex Identification States
  const [selectedStockCycloneId, setSelectedStockCycloneId] = useState('invest_92b');
  const activeStockCyclone = useMemo(() => {
    return STOCK_CYCLONES.find(c => c.id === selectedStockCycloneId) || STOCK_CYCLONES[0];
  }, [selectedStockCycloneId]);

  const [imageLayer, setImageLayer] = useState('bbox'); // 'raw' | 'gradcam' | 'bbox' | 'radar'
  const [isRefreshingVortex, setIsRefreshingVortex] = useState(false);
  const [vortexData, setVortexData] = useState(activeStockCyclone);

  useEffect(() => {
    setVortexData(activeStockCyclone);
  }, [activeStockCyclone]);

  // Safe confidence score
  const confidenceScore = useMemo(() => {
    const val = vortexData?.cyclonePresenceConfidence ?? vortexData?.confidence ?? 99.4;
    return typeof val === 'number' ? val.toFixed(1) : '99.4';
  }, [vortexData]);

  // Module 2: Pattern Classification States
  const [selectedPatternId, setSelectedPatternId] = useState('cdo_pattern');
  const selectedPattern = useMemo(() => {
    return CYCLONE_PATTERN_CLASSES.find(p => p.id === selectedPatternId) || CYCLONE_PATTERN_CLASSES[2];
  }, [selectedPatternId]);

  // Module 4: Trajectory & Sensitivity Simulator States
  const [simSst, setSimSst] = useState(29.5); // Sea Surface Temp (°C)
  const [simShear, setSimShear] = useState(12.0); // Vertical Wind Shear (knots)
  const [simHumidity, setSimHumidity] = useState(85); // Mid-Tropospheric RH (%)

  // Dynamic Intensity Curve
  const dynamicIntensityData = useMemo(() => {
    const sstDelta = (simSst - 28.0) * 8.2;
    const shearPenalty = Math.max(0, (simShear - 12.0) * 2.5);
    const humidityBonus = (simHumidity - 70) * 0.35;
    const netWindDelta = Math.round(sstDelta - shearPenalty + humidityBonus);

    return TRAJECTORY_72H_FORECAST.map((step, idx) => {
      let multiplier = 0;
      if (idx === 1) multiplier = 0.25;
      if (idx === 2) multiplier = 0.6;
      if (idx === 3) multiplier = 1.0;
      if (idx === 4) multiplier = 0.7;
      if (idx === 5) multiplier = 0.3;

      const adjustedSpeed = Math.max(45, Math.round(step.windSpeedKmh + netWindDelta * multiplier));
      const adjustedUpper = Math.round(adjustedSpeed * 1.14);
      const adjustedLower = Math.round(adjustedSpeed * 0.86);
      const adjustedPressure = Math.round(step.pressureHpa - (netWindDelta * multiplier * 0.38));

      return {
        ...step,
        windSpeedKmh: adjustedSpeed,
        windUpperKmh: adjustedUpper,
        windLowerKmh: adjustedLower,
        pressureHpa: adjustedPressure
      };
    });
  }, [simSst, simShear, simHumidity]);

  // Module 5: Historical Benchmark States
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState('fani_2019');
  const selectedBenchmark = useMemo(() => {
    return HISTORICAL_BENCHMARKS.find(b => b.id === selectedBenchmarkId) || HISTORICAL_BENCHMARKS[0];
  }, [selectedBenchmarkId]);

  const handleResetSimulation = () => {
    setSimSst(29.5);
    setSimShear(12.0);
    setSimHumidity(85);
  };

  const navTabs = [
    { id: 'identification', icon: Target, label: 'Vortex Identification', labelHindi: 'भंवर केंद्र पहचान', color: 'blue' },
    { id: 'classification', icon: Layers, label: 'Pattern Classification', labelHindi: 'आकारिकी वर्गीकरण', color: 'violet' },
    { id: 'multisource', icon: Satellite, label: 'Satellite Feeds', labelHindi: 'उपग्रह डेटा फीड', color: 'emerald' },
    { id: 'prediction', icon: TrendingUp, label: '72h Forecast', labelHindi: '72h पूर्वानुमान', color: 'rose' },
    { id: 'benchmarks', icon: Database, label: 'Benchmarks', labelHindi: 'ऐतिहासिक सत्यापन', color: 'amber' }
  ];

  // Pattern colors for chart and cards
  const patternColors = {
    curved_band: '#3b82f6',
    shear_pattern: '#f59e0b',
    cdo_pattern: '#8b5cf6',
    eye_pattern: '#f43f5e',
    incipient: '#06b6d4'
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* 1. Global Navigation Bar */}
      <PublicNavbar
        isHindi={isHindi}
        setIsHindi={setIsHindi}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={(v) => { setFontSizeOffset(v); applyGlobalFontScale(v); }}
        isScrolled={false}
      />

      {/* 2. Sleek Header with Tasteful Color Accents */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Title & Subtitle */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  VAYU AI STUDIO
                </span>
                <span className="text-[11px] font-mono text-slate-600 font-semibold">SIH-2026-AI</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight leading-tight">
                <span className="text-slate-950">
                  {isHindi ? 'बहु-स्रोत उपग्रह डेटा आधारित ' : 'AI-Based Tropical Cyclone '}
                </span>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {isHindi ? 'पहचान, वर्गीकरण एवं पूर्वानुमान' : 'Identification, Classification & Trajectory Prediction'}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {isHindi
                  ? 'स्वचालित भंवर केंद्र पहचान, 4-स्तरीय ड्वोरक आकारिकी वर्गीकरण और 72-घंटे का न्यूरल प्रक्षेपवक्र पूर्वानुमान।'
                  : 'Multi-source satellite deep learning for cyclone vortex fixation, 4-stage Dvorak classification, and 72-hour spatiotemporal forecasting.'}
              </p>

              {/* Colorful Architecture Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-blue-50/80 text-blue-800 border border-blue-200/70">
                  <Target className="w-3 h-3 text-blue-600" />
                  <strong>MobileNetV3:</strong> Center Fix (RMSE 0.003°)
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-violet-50/80 text-violet-800 border border-violet-200/70">
                  <Layers className="w-3 h-3 text-violet-600" />
                  <strong>ResNet18:</strong> 4-Pattern + Grad-CAM
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-50/80 text-emerald-800 border border-emerald-200/70">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                  <strong>GRU Seq2Seq:</strong> 72h Track Cone
                </span>
              </div>
            </div>

            {/* Right: Telemetry Status Strip with Harmonious Colors */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 sm:p-3 space-y-2 shrink-0 lg:max-w-sm shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold pb-1.5 border-b border-slate-200/60">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Radio className="w-3 h-3 text-indigo-600" />
                  Telemetry & Provenance
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  3/3 SYNCED
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                  <div className="text-[9px] font-mono text-emerald-600 font-semibold uppercase truncate">Live Stream</div>
                  <div className="font-bold text-slate-900 truncate">INSAT-3DR</div>
                  <div className="text-[9px] text-emerald-600 font-mono mt-0.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    MOSDAC
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-blue-100 shadow-2xs">
                  <div className="text-[9px] font-mono text-blue-600 font-semibold uppercase truncate">AI Model</div>
                  <div className="font-bold text-slate-900 truncate">Dual-Head</div>
                  <div className="text-[9px] text-blue-600 font-mono mt-0.5">14.8 ms</div>
                </div>

                <div className="p-2 rounded-xl bg-white border border-amber-100 shadow-2xs">
                  <div className="text-[9px] font-mono text-amber-600 font-semibold uppercase truncate">Ground Truth</div>
                  <div className="font-bold text-slate-900 truncate">IMD Archive</div>
                  <div className="text-[9px] text-amber-600 font-mono mt-0.5">1982–2025</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 3. Colorful Minimal Tab Navigation */}
      <nav className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{isHindi ? tab.labelHindi : tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 4. Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1 space-y-5">

        {/* =========================================================================
             MODULE 1: AI VORTEX IDENTIFICATION & CONFIDENCE SCORING
             ========================================================================= */}
        {activeTab === 'identification' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-heading font-black text-slate-950">
                    {isHindi ? 'स्वचालित भंवर केंद्र निर्धारण' : 'Automated Cyclone Vortex Fixation'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isHindi ? 'संवहनी कोर व आंख निर्देशांक का स्वचालित निर्धारण' : 'Circulation center localization & core thermal radiometry'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsRefreshingVortex(true);
                    setTimeout(() => setIsRefreshingVortex(false), 700);
                  }}
                  disabled={isRefreshingVortex}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshingVortex ? 'animate-spin' : ''}`} />
                  <span>{isHindi ? 'पुनः अनुमान' : 'Rerun Inference'}</span>
                </button>
              </div>
            </div>

            {/* Main Visualizer & Radiometry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Satellite Frame & AI Layer Overlay (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
                
                {/* Stock Cyclone Selector Segment */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    Storm:
                  </span>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {STOCK_CYCLONES.map((sc) => {
                      const isSelected = selectedStockCycloneId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => setSelectedStockCycloneId(sc.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                        >
                          {sc.name.split(' ')[0]} ({sc.code})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Layer Switching Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      {activeStockCyclone.satelliteChannel}
                    </span>
                    <span className="text-[10px] text-slate-600 font-mono font-medium hidden sm:inline">{liveClock.utcStr}</span>
                  </div>

                  {/* Mode Toggles with Subtle Colors */}
                  <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setImageLayer('raw')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageLayer === 'raw'
                          ? 'bg-white text-slate-950 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-950'
                      }`}
                    >
                      Satellite
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageLayer('gradcam')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageLayer === 'gradcam'
                          ? 'bg-amber-500 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-amber-700'
                      }`}
                    >
                      Grad-CAM
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageLayer('bbox')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageLayer === 'bbox'
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-blue-700'
                      }`}
                    >
                      Eye Box
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageLayer('radar')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        imageLayer === 'radar'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      Radar dBZ
                    </button>
                  </div>
                </div>

                {/* Satellite Canvas View */}
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 select-none shadow-sm">
                  <img
                    src={imageLayer === 'raw' ? (activeStockCyclone.visImage || activeStockCyclone.image) : activeStockCyclone.image}
                    alt={activeStockCyclone.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all select-none pointer-events-none"
                  />

                  {/* Top Meta Pill */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-400/30 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {activeStockCyclone.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/30 hidden sm:inline-block">
                      {activeStockCyclone.category}
                    </span>
                  </div>

                  {/* Grad-CAM Attention Layer */}
                  {imageLayer === 'gradcam' && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(239,68,68,0.7) 0%, rgba(245,158,11,0.5) 25%, rgba(59,130,246,0.3) 50%, transparent 75%)`,
                        mixBlendMode: 'screen'
                      }}
                    />
                  )}

                  {/* Doppler Radar dBZ Overlay Layer */}
                  {imageLayer === 'radar' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(from 45deg at 50% 50%, rgba(220,38,38,0.5) 0deg, rgba(234,88,12,0.4) 60deg, rgba(234,179,8,0.3) 120deg, rgba(34,197,94,0.2) 180deg, transparent 270deg, rgba(220,38,38,0.5) 360deg)`,
                          mixBlendMode: 'color-dodge'
                        }}
                      />
                      <div className="w-[30%] h-[30%] border border-emerald-400/40 rounded-full absolute" />
                      <div className="w-[60%] h-[60%] border border-emerald-400/30 rounded-full absolute" />
                      <div className="w-[90%] h-[90%] border border-emerald-400/20 rounded-full absolute" />
                      <div className="absolute top-2.5 right-2.5 bg-black/75 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                        MAX 55 dBZ
                      </div>
                    </div>
                  )}

                  {/* Bounding Box & Eye Fixation Layer */}
                  {(imageLayer === 'bbox' || imageLayer === 'gradcam' || imageLayer === 'radar') && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div 
                        className="border border-dashed border-sky-400 rounded-xl relative transition-all duration-300"
                        style={{
                          width: activeStockCyclone.boxWidth || '60%',
                          height: activeStockCyclone.boxHeight || '60%'
                        }}
                      >
                        <div className="absolute -top-2.5 left-2.5 bg-blue-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap">
                          <span>VORTEX CORE ({confidenceScore}%)</span>
                        </div>
                        <div className="absolute inset-4 border border-rose-500/60 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-cyan-400/40" />
                          <div className="h-full w-px bg-cyan-400/40 absolute" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Telemetry HUD */}
                  <div className="absolute bottom-2.5 inset-x-2.5 bg-black/80 backdrop-blur-md rounded-xl p-2 border border-white/10 flex items-center justify-between text-white text-xs flex-wrap gap-2 z-20">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-mono font-bold text-[11px] text-blue-200">
                        {activeStockCyclone.vortexFixFormatted}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        (±{activeStockCyclone.fixationErrorRadiusKm} km)
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] font-mono">
                      <span className="text-amber-300 font-semibold">
                        {activeStockCyclone.dvorakPreliminary.estimatedWindKmh} km/h • {activeStockCyclone.dvorakPreliminary.centralPressureHpa} hPa
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {activeStockCyclone.inferenceLatencyMs} ms
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Key Confidence Metrics & Radiometry Grid (5 Cols) */}
              <div className="lg:col-span-5 space-y-3.5">
                
                {/* Confidence Card with Color-Duo Progress Bar */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-4.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Identification Confidence
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      HIGH CERTAINTY
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-heading font-black text-slate-950 tracking-tight">
                      {confidenceScore}%
                    </span>
                    <span className="text-xs font-semibold text-blue-600">
                      Softmax Activation
                    </span>
                  </div>

                  {/* Gradient Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${confidenceScore}%` }}
                    />
                  </div>
                </div>

                {/* 4 Radiometric Feature Cards with Tasteful Colors */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* 1. Min Cloud-Top Temp (Rose) */}
                  <div className="bg-white rounded-xl border border-rose-100/90 p-3 shadow-2xs hover:border-rose-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-500">Min Temp</span>
                      <div className="p-1 rounded-md bg-rose-50 text-rose-600">
                        <Thermometer className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-lg font-heading font-black text-rose-600">
                      {vortexData.radiometry.cloudTopMinTempFormatted}
                    </span>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-rose-50 text-rose-700">
                      Convective Core
                    </span>
                  </div>

                  {/* 2. CDO Diameter (Sky) */}
                  <div className="bg-white rounded-xl border border-sky-100/90 p-3 shadow-2xs hover:border-sky-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-500">CDO Diameter</span>
                      <div className="p-1 rounded-md bg-sky-50 text-sky-600">
                        <Gauge className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-lg font-heading font-black text-sky-600">
                      {vortexData.radiometry.cdoDiameterFormatted}
                    </span>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-sky-50 text-sky-700">
                      Symmetric Overcast
                    </span>
                  </div>

                  {/* 3. Est. Wind Speed (Amber) */}
                  <div className="bg-white rounded-xl border border-amber-100/90 p-3 shadow-2xs hover:border-amber-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-500">Est. Wind</span>
                      <div className="p-1 rounded-md bg-amber-50 text-amber-600">
                        <Wind className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-lg font-heading font-black text-amber-600">
                      {vortexData.dvorakPreliminary.estimatedWindKmh} km/h
                    </span>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-50 text-amber-800">
                      {vortexData.dvorakPreliminary.tNumber} Dvorak
                    </span>
                  </div>

                  {/* 4. Spiral Curvature (Violet) */}
                  <div className="bg-white rounded-xl border border-violet-100/90 p-3 shadow-2xs hover:border-violet-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-500">Spiral Angle</span>
                      <div className="p-1 rounded-md bg-violet-50 text-violet-600">
                        <Compass className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="text-lg font-heading font-black text-violet-600">
                      {vortexData.radiometry.spiralCurvatureFormatted}
                    </span>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-medium bg-violet-50 text-violet-700">
                      Cyclonic Inflow
                    </span>
                  </div>
                </div>

                {/* Minimalist Model Specs Tag Row */}
                <div className="bg-slate-50 rounded-xl border border-slate-200/70 p-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">MobileNetV3 Dual-Head</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-emerald-700 font-mono font-semibold">37.8 ms Latency</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-slate-500 font-mono">ISRO MOSDAC Stream</span>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
             MODULE 2: MORPHOLOGICAL PATTERN CLASSIFICATION & STAGE PROGRESSION
             ========================================================================= */}
        {activeTab === 'classification' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-heading font-black text-slate-950">
                    {isHindi ? 'चक्रवात आकारिकी वर्गीकरण' : 'Cyclone Morphological Pattern Classification'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    ResNet18-Dvorak multi-class pattern classification
                  </p>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-1 text-right shrink-0">
                <span className="text-[9px] font-mono font-semibold text-violet-700 block uppercase">
                  ACTIVE DOMINANT
                </span>
                <span className="text-xs font-bold text-violet-900">
                  Central Dense Overcast (68.5%)
                </span>
              </div>
            </div>

            {/* 5-Class Interactive Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {CYCLONE_PATTERN_CLASSES.map((pattern) => {
                const isSelected = selectedPatternId === pattern.id;
                const patternColor = patternColors[pattern.id] || '#3b82f6';
                return (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => setSelectedPatternId(pattern.id)}
                    className={`text-left rounded-xl p-3.5 transition-all cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-white shadow-sm ring-2'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                    style={{
                      borderColor: isSelected ? patternColor : undefined,
                      ['--tw-ring-color']: isSelected ? `${patternColor}50` : undefined
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {pattern.code}
                        </span>
                        <span className="text-xs font-bold" style={{ color: patternColor }}>
                          {pattern.probability}%
                        </span>
                      </div>

                      <h3 className="text-xs font-heading font-bold text-slate-900 leading-snug">
                        {isHindi ? pattern.nameHindi : pattern.name}
                      </h3>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-0.5 text-[10px] text-slate-500 w-full">
                      <div className="flex justify-between">
                        <span>Dvorak:</span>
                        <span className="font-semibold text-slate-800">{pattern.dvorakRange}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Winds:</span>
                        <span className="font-semibold text-slate-800">{pattern.intensityRange}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Pattern Detailed Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    CLASS: {selectedPattern.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Dvorak Scale: {selectedPattern.dvorakRange}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-heading font-black text-slate-950">
                  {isHindi ? selectedPattern.nameHindi : selectedPattern.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {isHindi ? selectedPattern.descriptionHindi : selectedPattern.description}
                </p>

                {/* Diagnostic Feature Pills */}
                <div className="pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(isHindi ? selectedPattern.featuresHindi : selectedPattern.keyFeatures).map((feat, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200/70 text-xs text-slate-800 flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-violet-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Class Probability Distribution Chart with Multi-Colors */}
              <div className="lg:col-span-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-mono font-semibold text-slate-500 block mb-2 uppercase tracking-wider">
                  Model Probability Distribution
                </span>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={CYCLONE_PATTERN_CLASSES}
                      layout="vertical"
                      margin={{ top: 0, right: 15, left: 5, bottom: 0 }}
                    >
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="code"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'Probability']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                        {CYCLONE_PATTERN_CLASSES.map((entry) => (
                          <Cell key={entry.id} fill={patternColors[entry.id] || '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Lifecycle Stages Stepper */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-heading font-bold text-slate-950 uppercase tracking-wide">
                  Lifecycle Progression Stages
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  ACTIVE: DEEP DEPRESSION
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-0.5">
                {CYCLONE_LIFECYCLE_STAGES.map((stage) => {
                  const isActiveStage = stage.status === 'ACTIVE_STAGE';
                  const isCompleted = stage.status === 'COMPLETED';

                  return (
                    <div
                      key={stage.id}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isActiveStage
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                          : 'bg-slate-50/60 border-slate-200/60 text-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[9px] font-mono font-bold ${isActiveStage ? 'text-amber-100' : 'text-slate-400'}`}>
                            STEP {stage.stageNumber}
                          </span>
                          {isActiveStage ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <span className="text-[9px] text-slate-400">Forecast</span>
                          )}
                        </div>

                        <strong className={`text-xs font-bold block leading-tight ${isActiveStage ? 'text-white' : 'text-slate-900'}`}>
                          {isHindi ? stage.nameHindi : stage.name}
                        </strong>

                        <span className={`text-[10px] font-mono block mt-0.5 ${isActiveStage ? 'text-amber-100' : 'text-slate-500'}`}>
                          {stage.windRange}
                        </span>
                      </div>

                      <div className={`pt-1.5 mt-1.5 border-t text-[9px] ${isActiveStage ? 'border-white/20 text-amber-100' : 'border-slate-200/60 text-slate-400'}`}>
                        {stage.detectedAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
             MODULE 3: MULTI-SOURCE SATELLITE & SENSOR INGESTION MATRIX
             ========================================================================= */}
        {activeTab === 'multisource' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-heading font-black text-slate-950">
                    {isHindi ? 'बहु-स्रोत उपग्रह एवं रडार एकीकरण' : 'Multi-Source Satellite & Radar Feeds'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    6 live telemetry streams for spatial-temporal tensor fusion
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-xl text-xs font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>6 FEEDS ONLINE</span>
              </div>
            </div>

            {/* 6 Connected Data Source Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MULTI_SOURCE_FEEDS.map((feed) => {
                const agencyColor = feed.agency.includes('ISRO') ? 'amber' : feed.agency.includes('IMD') ? 'blue' : 'purple';
                return (
                  <div
                    key={feed.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                            agencyColor === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            agencyColor === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>
                            {feed.agency}
                          </span>
                          <h3 className="text-xs font-heading font-black text-slate-900 mt-1">
                            {feed.name}
                          </h3>
                        </div>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          {feed.status}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs pt-2">
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Band:</span>
                          <span className="text-slate-900 font-mono font-semibold">{feed.spectralBand}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Resolution:</span>
                          <span className="text-slate-900 font-mono font-semibold">{feed.spatialResolution}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[11px]">
                          <span>Latency:</span>
                          <span className="text-emerald-700 font-mono font-semibold">{feed.latency}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quality Progress Bar */}
                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-500">Quality</span>
                        <span className="font-mono font-bold text-slate-900">{feed.quality}%</span>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${feed.quality}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spatial-Temporal Tensor Concatenation Architecture with 4 Colors */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-sm font-heading font-bold text-slate-950 uppercase tracking-wide">
                4-Stage Tensor Concatenation Pipeline
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-blue-700 uppercase">Stage 1</span>
                  <strong className="text-xs font-bold text-slate-900 block">Calibrated Ingestion</strong>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Radiance normalization & geostationary grid re-projection.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-200/70 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-sky-700 uppercase">Stage 2</span>
                  <strong className="text-xs font-bold text-slate-900 block">Spatial Alignment</strong>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Bilinear interpolation to unified 224×224 km storm grid.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-violet-50/50 border border-violet-200/70 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-violet-700 uppercase">Stage 3</span>
                  <strong className="text-xs font-bold text-slate-900 block">Multi-Channel Fusion</strong>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Concatenates IR, WV, winds & radar into 6-channel tensor.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                  <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase">Stage 4</span>
                  <strong className="text-xs font-bold text-slate-900 block">Neural Inference</strong>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Executed across MobileNetV3, ResNet18 & GRU in ~95–178 ms.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
             MODULE 4: 72-HOUR AI TRACK & INTENSITY PREDICTION STUDIO
             ========================================================================= */}
        {activeTab === 'prediction' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-heading font-black text-slate-950">
                    {isHindi ? '72-घंटे का प्रक्षेपवक्र व तीव्रता पूर्वानुमान' : '72-Hour Spatiotemporal Trajectory & Intensity'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recurrent neural network (GRU Seq2Seq) with uncertainty cone
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-1 text-right shrink-0">
                <span className="text-[9px] font-mono font-semibold text-rose-700 block uppercase">
                  PROJECTED LANDFALL
                </span>
                <span className="text-xs font-bold text-rose-950 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-600" />
                  Gopalpur – Puri Coast, Odisha (+24h)
                </span>
              </div>
            </div>

            {/* Environmental Sensitivity Simulator ("What-If" Controls) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wide text-slate-900">
                    Environmental Sensitivity Simulator ("What-If" Controls)
                  </h3>
                </div>
                <button
                  onClick={handleResetSimulation}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Slider 1: SST (Rose) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Sea Surface Temp (SST):</span>
                    <strong className="text-rose-600 font-mono">{simSst.toFixed(1)} °C</strong>
                  </div>
                  <input
                    type="range"
                    min="27.0"
                    max="32.0"
                    step="0.1"
                    value={simSst}
                    onChange={(e) => setSimSst(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-rose-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-medium">
                    <span>27.0°C</span>
                    <span>32.0°C</span>
                  </div>
                </div>

                {/* Slider 2: Wind Shear (Sky) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Vertical Wind Shear:</span>
                    <strong className="text-sky-600 font-mono">{simShear.toFixed(1)} kt</strong>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="35.0"
                    step="0.5"
                    value={simShear}
                    onChange={(e) => setSimShear(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-1.5 bg-sky-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-medium">
                    <span>5 kt (Favorable)</span>
                    <span>35 kt (Hostile)</span>
                  </div>
                </div>

                {/* Slider 3: Humidity (Emerald) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Mid-Level RH:</span>
                    <strong className="text-emerald-600 font-mono">{simHumidity} %</strong>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="1"
                    value={simHumidity}
                    onChange={(e) => setSimHumidity(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-emerald-100 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-slate-600 font-medium">
                    <span>60% (Dry)</span>
                    <span>95% (Saturated)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid: Wind Speed & Pressure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Chart 1: Wind Speed Forecast */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wide">
                    Wind Speed (km/h) & Uncertainty Cone
                  </h4>
                  <span className="text-xs font-mono font-bold text-blue-600">
                    Peak: {dynamicIntensityData[3].windSpeedKmh} km/h
                  </span>
                </div>

                <div className="h-52 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicIntensityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="windGradColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="lead" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['dataMin - 15', 'dataMax + 15']} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #bfdbfe',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontSize: '11px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="windUpperKmh"
                        stroke="transparent"
                        fill="#93c5fd"
                        fillOpacity={0.3}
                        name="Upper Bound"
                      />
                      <Area
                        type="monotone"
                        dataKey="windSpeedKmh"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#windGradColor)"
                        name="Predicted Wind"
                      />
                      <ReferenceLine x="+24h" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Landfall', fill: '#ef4444', fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Central Barometric Pressure Drop (hPa) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wide">
                    Central Pressure (MSLP in hPa)
                  </h4>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    Min: {dynamicIntensityData[3].pressureHpa} hPa
                  </span>
                </div>

                <div className="h-52 pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dynamicIntensityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="lead" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[940, 990]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #fecdd3',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          fontSize: '11px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pressureHpa"
                        stroke="#e11d48"
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: '#e11d48' }}
                        name="Pressure (hPa)"
                      />
                      <ReferenceLine x="+24h" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Peak Drop', fill: '#ef4444', fontSize: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Spatiotemporal Waypoint Forecast Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider">
                  72-Hour Waypoints Forecast
                </h4>
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  GRU SEQ2SEQ
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4 font-mono">Lead</th>
                      <th className="py-2.5 px-4">Valid Time</th>
                      <th className="py-2.5 px-4">Coordinates</th>
                      <th className="py-2.5 px-4">Wind Velocity</th>
                      <th className="py-2.5 px-4">Pressure</th>
                      <th className="py-2.5 px-4">Movement</th>
                      <th className="py-2.5 px-4">Stage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {dynamicIntensityData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          row.isLandfallWindow ? 'bg-rose-50/70 border-l-4 border-l-rose-500 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-blue-700">
                          {row.lead}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {row.timestamp}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          {row.latLonStr}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-900">{row.windSpeedKmh} km/h</span>
                          <span className="text-slate-400 text-[10px] ml-1">({row.windKnots} kt)</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-700">
                          {row.pressureHpa} hPa
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {row.direction} @ {row.speedKmh} km/h
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold inline-block ${
                            row.isLandfallWindow
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {row.stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
             MODULE 5: HISTORICAL CYCLONE BENCHMARKS & MODEL VALIDATION
             ========================================================================= */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Sub-Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-heading font-black text-slate-950">
                    {isHindi ? 'ऐतिहासिक चक्रवात सत्यापन' : 'Historical Cyclone Ground-Truth Benchmarking'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Official IMD / RSMC best-track validation against historic NIO storms
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 shrink-0">
                OFFICIAL RSMC ARCHIVE
              </span>
            </div>

            {/* Historical Storm Selector Cards with Color Accents */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HISTORICAL_BENCHMARKS.map((storm) => {
                const isSelected = selectedBenchmarkId === storm.id;
                return (
                  <button
                    key={storm.id}
                    type="button"
                    onClick={() => setSelectedBenchmarkId(storm.id)}
                    className={`text-left rounded-xl p-3.5 transition-all cursor-pointer flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-white border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {storm.year}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {storm.basin}
                        </span>
                      </div>
                      <h3 className="text-xs font-heading font-black text-slate-900 mt-0.5">
                        {isHindi ? storm.nameHindi : storm.name}
                      </h3>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Landfall: {storm.landfallLocation}
                      </span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-100 text-xs flex items-center justify-between w-full">
                      <span className="text-slate-400 text-[10px]">Peak Wind:</span>
                      <strong className="text-rose-600 font-bold font-mono">{storm.peakWindKmh} km/h</strong>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Storm Detailed Case Study */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-wider block">
                    VALIDATION DOSSIER: {selectedBenchmark.name}
                  </span>
                  <h3 className="text-base font-heading font-black text-slate-900 mt-0.5">
                    {selectedBenchmark.name} ({selectedBenchmark.year})
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Pattern:</span>
                  <span className="font-semibold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {selectedBenchmark.morphologyPattern}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedBenchmark.narrative}
              </p>

              {/* 4 Error Metrics Highlights with Harmonious Colors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/70 text-center">
                  <span className="text-[10px] text-emerald-800 block uppercase font-semibold">12h Track Error</span>
                  <span className="text-lg font-heading font-black text-emerald-700 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.lead12hTrackErrorKm} km
                  </span>
                  <span className="text-[9px] text-slate-500">vs 24.5 km Baseline</span>
                </div>

                <div className="bg-teal-50/50 p-3 rounded-xl border border-teal-200/70 text-center">
                  <span className="text-[10px] text-teal-800 block uppercase font-semibold">24h Track Error</span>
                  <span className="text-lg font-heading font-black text-teal-700 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.lead24hTrackErrorKm} km
                  </span>
                  <span className="text-[9px] text-slate-500">vs 48.0 km Baseline</span>
                </div>

                <div className="bg-sky-50/50 p-3 rounded-xl border border-sky-200/70 text-center">
                  <span className="text-[10px] text-sky-800 block uppercase font-semibold">48h Track Error</span>
                  <span className="text-lg font-heading font-black text-sky-700 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.lead48hTrackErrorKm} km
                  </span>
                  <span className="text-[9px] text-slate-500">vs 86.2 km Baseline</span>
                </div>

                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-200/70 text-center">
                  <span className="text-[10px] text-indigo-800 block uppercase font-semibold">Intensity MAE</span>
                  <span className="text-lg font-heading font-black text-indigo-700 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.intensityErrorKmh} km/h
                  </span>
                  <span className="text-[9px] text-slate-500">Mean Absolute Error</span>
                </div>
              </div>
            </div>

            {/* Benchmark Lead-Time Error Comparison Chart with Color Legend */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wide">
                  Model Accuracy vs Baseline (Held-out Test Storms DANA & BIPARJOY)
                </h4>
                <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  GRU beats persistence by 86 km at +72h
                </span>
              </div>

              <div className="h-52 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MODEL_ACCURACY_BENCHMARKS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="lead" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} unit=" km" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="VAYU" fill="#2563eb" radius={[3, 3, 0, 0]} name="VAYU AI (GRU)" />
                    <Bar dataKey="Persistence" fill="#cbd5e1" radius={[3, 3, 0, 0]} name="Linear Persistence" />
                    <Bar dataKey="IMD_Official" fill="#f59e0b" radius={[3, 3, 0, 0]} name="IMD Climatological Ref" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default AICycloneIntelligence;
