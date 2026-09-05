import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import PublicNavbar, { applyGlobalFontScale } from '../components/PublicNavbar';
import IOSGlassCard from '../components/IOSGlassCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import {
  Target, Cpu, Layers, Satellite, Compass, Radio, Activity,
  TrendingUp, Sparkles, Sliders, ShieldCheck, Eye, RefreshCw,
  Wind, Thermometer, Droplets, AlertTriangle, CheckCircle2,
  BarChart2, ArrowRight, ChevronRight, Info, Database,
  ExternalLink, MapPin, Gauge, Waves, ShieldAlert, Zap,
  FileText, ArrowUpRight, HelpCircle, Check, Play, RotateCcw
} from 'lucide-react';
import {
  DATA_PROVENANCE,
  CURRENT_VORTEX_IDENTIFICATION,
  STOCK_CYCLONES,
  CYCLONE_PATTERN_CLASSES,
  CYCLONE_LIFECYCLE_STAGES,
  MULTI_SOURCE_FEEDS,
  TRAJECTORY_72H_FORECAST,
  HISTORICAL_BENCHMARKS,
  MODEL_ACCURACY_BENCHMARKS
} from '../data/sihCycloneData';
import { detectCycloneFromImage, classifyMorphologyPattern } from '../services/api';
import { useLiveClock } from '../utils/liveDateTime';

const AICycloneIntelligence = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabParam = useMemo(() => new URLSearchParams(location.search).get('tab'), [location.search]);
  const liveClock = useLiveClock(1000);

  // Global Theme & Preferences
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [isHindi, setIsHindi] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try {
      const s = localStorage.getItem('vayu_font_offset');
      return s !== null ? parseInt(s, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Sync Dark Mode class with root document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Active Module Tab State
  // 'identification' | 'classification' | 'multisource' | 'prediction' | 'benchmarks'
  const [activeTab, setActiveTab] = useState(tabParam || 'identification');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Module 1: AI Vortex Identification States & Stock Cyclone Datasets
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

  // Module 2: Pattern Classification States
  const [selectedPatternId, setSelectedPatternId] = useState('cdo_pattern');
  const selectedPattern = useMemo(() => {
    return CYCLONE_PATTERN_CLASSES.find(p => p.id === selectedPatternId) || CYCLONE_PATTERN_CLASSES[2];
  }, [selectedPatternId]);

  // Module 4: Trajectory & Sensitivity Simulator States
  const [simSst, setSimSst] = useState(29.5); // Sea Surface Temp (°C)
  const [simShear, setSimShear] = useState(12.0); // Vertical Wind Shear (knots)
  const [simHumidity, setSimHumidity] = useState(85); // Mid-Tropospheric RH (%)

  // Dynamic Intensity Curve Derived from Sensitivity Simulator
  const dynamicIntensityData = useMemo(() => {
    // Atmospheric & oceanic physics delta
    const sstDelta = (simSst - 28.0) * 8.2;
    const shearPenalty = Math.max(0, (simShear - 12.0) * 2.5);
    const humidityBonus = (simHumidity - 70) * 0.35;
    const netWindDelta = Math.round(sstDelta - shearPenalty + humidityBonus);

    return TRAJECTORY_72H_FORECAST.map((step, idx) => {
      let multiplier = 0;
      if (idx === 1) multiplier = 0.25;
      if (idx === 2) multiplier = 0.6;
      if (idx === 3) multiplier = 1.0; // Peak Landfall window
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

  // Simulation Reset
  const handleResetSimulation = () => {
    setSimSst(29.5);
    setSimShear(12.0);
    setSimHumidity(85);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col transition-colors duration-500 w-full">
      {/* 1. TOP NAVBAR WITH 3D GLASS TILT & SEAMLESS CONTROLS */}
      <PublicNavbar
        isHindi={isHindi}
        setIsHindi={setIsHindi}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={setFontSizeOffset}
        isScrolled={false}
      />

      {/* 2. SIH PROBLEM STATEMENT & AUTHENTICITY HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white border-b border-white/10 py-4 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Luminous background aura */}
        <div className="pointer-events-none absolute -top-24 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>SIH 2026 AI/ML CYCLONE INTELLIGENCE SYSTEM</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-sky-400">
                Team Chakravat Crew (Problem ID: SIH-2026-AI)
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-white leading-tight">
              {isHindi
                ? 'बहु-स्रोत उपग्रह डेटा आधारित उष्णकटिबंधीय चक्रवात पहचान, वर्गीकरण एवं पूर्वानुमान'
                : 'AI-Based Tropical Cyclone Identification, Classification & Trajectory Prediction'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              {isHindi
                ? 'इसरो (INSAT-3D/3DR, ओशनसैट-3) और वैश्विक उपग्रहों के बहु-स्पेक्ट्रल डेटा का उपयोग करके स्वचालित चक्रवात पहचान (CycloneVision-CNN), 5-स्तरीय आकारिकी वर्गीकरण (PatternNet-ViT), और 72 घंटे का द्वि-दिशात्मक एलएसटीएम प्रक्षेपवक्र पूर्वानुमान।'
                : 'Operational deep learning framework utilizing multi-source satellite streams (INSAT-3D/3DR, Oceansat-3, GPM) for automated vortex identification (CycloneVision-CNN), 5-class morphological Dvorak classification (PatternNet-ViT), and 72-hour Bi-LSTM spatiotemporal trajectory prediction.'}
            </p>
          </div>

          {/* Provenance Transparency Legend */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-3.5 space-y-2 shrink-0 lg:max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 border-b border-white/10 pb-1.5">
              <span>{isHindi ? 'डेटा प्रमाणिकता संकेतक' : 'Data Provenance Legend'}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-semibold text-emerald-300">Live Satellite Telemetry</span>
                <span className="text-slate-400 text-[9px]">(ISRO MOSDAC)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                <span className="font-semibold text-indigo-300">AI Model Inference</span>
                <span className="text-slate-400 text-[9px]">(Neural Engine)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="font-semibold text-amber-300">Historical Benchmark</span>
                <span className="text-slate-400 text-[9px]">(IMD Best-Track)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE 5-MODULE TAB NAVIGATION BAR */}
      <div className="sticky top-16 z-40 bg-white/85 dark:bg-black/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {[
              {
                id: 'identification',
                icon: Target,
                label: '1. AI Identification & Confidence',
                labelHindi: '1. एआई पहचान व विश्वसनीयता',
                provenance: 'AI_INFERENCE'
              },
              {
                id: 'classification',
                icon: Layers,
                label: '2. Pattern Classification (5 Stages)',
                labelHindi: '2. पैटर्न वर्गीकरण (5 अवस्थाएं)',
                provenance: 'AI_INFERENCE'
              },
              {
                id: 'multisource',
                icon: Satellite,
                label: '3. Multi-Source Satellites',
                labelHindi: '3. बहु-स्रोत उपग्रह डेटा',
                provenance: 'LIVE_STREAM'
              },
              {
                id: 'prediction',
                icon: TrendingUp,
                label: '4. 72h Track & Intensity Forecast',
                labelHindi: '4. 72 घंटे का ट्रैक व तीव्रता पूर्वानुमान',
                provenance: 'AI_INFERENCE'
              },
              {
                id: 'benchmarks',
                icon: Database,
                label: '5. Historical Benchmarks & Validation',
                labelHindi: '5. ऐतिहासिक तूफान सत्यापन',
                provenance: 'HISTORICAL_BENCHMARK'
              }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-sky-500/15 dark:bg-sky-400/15 border-sky-500 dark:border-sky-400 text-sky-700 dark:text-sky-300 shadow-xs'
                      : 'bg-white/60 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-white/[0.08]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>{isHindi ? tab.labelHindi : tab.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MAIN WORKFLOW CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-8">

        {/* =========================================================================
             MODULE 1: AI VORTEX IDENTIFICATION & CONFIDENCE SCORING
             ========================================================================= */}
        {activeTab === 'identification' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Module Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-400/30">
                    MODULE 1: COMPUTER VISION IDENTIFICATION
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Model: CycloneVision-CNN v2.1
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white mt-1">
                  {isHindi ? 'स्वचालित चक्रवात पहचान एवं भंवर केंद्र निर्धारण' : 'Automated Cyclone Identification & Vortex Fixation'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'थर्मल इन्फ्रारेड उपग्रह इमेजरी पर रेसनेट-50 बैकबोन द्वारा आंख के निर्देशांक, केंद्रीय ओवरकास्ट और संवहनी कोर का विश्लेषण।'
                    : 'Deep convolutional neural network localizing the circulation center, estimating confidence, and extracting core thermal radiometry.'}
                </p>
              </div>

              {/* Live Inference Refresh Action */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setIsRefreshingVortex(true);
                    setTimeout(() => setIsRefreshingVortex(false), 800);
                  }}
                  disabled={isRefreshingVortex}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingVortex ? 'animate-spin' : ''}`} />
                  <span>{isHindi ? 'मॉडल अनुमान रीफ्रेश' : 'Rerun CNN Inference'}</span>
                </button>
              </div>
            </div>

            {/* Main Visualizer & Telemetry Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Satellite Frame & AI Layer Overlay (7 Cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
                {/* Stock Cyclone Dataset Selector Bar */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Database className="w-3.5 h-3.5 text-sky-500" />
                    <span>{isHindi ? 'स्टॉक चक्रवात डेटा:' : 'Stock Cyclone Data:'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                    {STOCK_CYCLONES.map((sc) => {
                      const isSelected = selectedStockCycloneId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => setSelectedStockCycloneId(sc.id)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-sky-500 text-white border-sky-400 shadow-xs ring-1 ring-sky-300 dark:ring-sky-600'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-sky-400'}`} />
                          <span>{isHindi ? sc.nameHindi.split(' ')[0] : sc.name.split(' ')[0]} {sc.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feed Info & Layer Switching Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isHindi ? activeStockCyclone.satelliteChannelHindi : activeStockCyclone.satelliteChannel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{liveClock.utcStr}</span>
                  </div>

                  {/* Layer Switching Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageLayer('raw')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        imageLayer === 'raw'
                          ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isHindi ? 'उपग्रह चित्र' : 'Satellite Frame'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageLayer('gradcam')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        imageLayer === 'gradcam'
                          ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Grad-CAM
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageLayer('bbox')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        imageLayer === 'bbox'
                          ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isHindi ? 'कोर बॉक्स' : 'Eye Box & Center'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageLayer('radar')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        imageLayer === 'radar'
                          ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Radar dBZ
                    </button>
                  </div>
                </div>

                {/* Satellite Frame Canvas Representation with Authentic Stock Cyclone Imagery */}
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800 group select-none shadow-2xl">
                  {/* Stock Satellite Image Feed */}
                  <img
                    src={imageLayer === 'raw' ? (activeStockCyclone.visImage || activeStockCyclone.image) : activeStockCyclone.image}
                    alt={activeStockCyclone.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 select-none pointer-events-none"
                  />

                  {/* Atmospheric and Scanline Visual Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(2,6,23,0.7)_100%)] pointer-events-none" />

                  {/* Top Overlay Badge with Stock Cyclone Telemetry */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-black/80 backdrop-blur-md text-cyan-300 border border-cyan-400/40 font-mono shadow-xs flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      {activeStockCyclone.name} ({activeStockCyclone.basin})
                    </span>
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/40 hidden sm:inline-block">
                      {isHindi ? activeStockCyclone.categoryHindi : activeStockCyclone.category}
                    </span>
                  </div>

                  {/* Grad-CAM Attention Layer */}
                  {imageLayer === 'gradcam' && (
                    <div 
                      className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(239,68,68,0.75) 0%, rgba(245,158,11,0.55) 25%, rgba(59,130,246,0.35) 50%, transparent 75%)`,
                        mixBlendMode: 'screen'
                      }}
                    />
                  )}

                  {/* Doppler Radar dBZ Overlay Layer */}
                  {imageLayer === 'radar' && (
                    <div className="absolute inset-0 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
                      <div 
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(from 45deg at 50% 50%, rgba(220,38,38,0.55) 0deg, rgba(234,88,12,0.45) 60deg, rgba(234,179,8,0.35) 120deg, rgba(34,197,94,0.25) 180deg, transparent 270deg, rgba(220,38,38,0.55) 360deg)`,
                          mixBlendMode: 'color-dodge'
                        }}
                      />
                      {/* Doppler Radar Range Rings */}
                      <div className="w-[30%] h-[30%] border border-emerald-400/40 rounded-full absolute" />
                      <div className="w-[60%] h-[60%] border border-emerald-400/30 rounded-full absolute" />
                      <div className="w-[90%] h-[90%] border border-emerald-400/20 rounded-full absolute" />
                      <div className="absolute top-2 right-2 bg-black/75 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400 border border-emerald-500/30">
                        MAX 55 dBZ
                      </div>
                    </div>
                  )}

                  {/* Bounding Box & Eye Fixation Layer */}
                  {(imageLayer === 'bbox' || imageLayer === 'gradcam' || imageLayer === 'radar') && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      {/* Bounding Box representing predicted cyclone core */}
                      <div 
                        className="border-2 border-dashed border-sky-400 rounded-2xl relative animate-pulse shadow-[0_0_24px_rgba(56,189,248,0.4)] transition-all duration-500"
                        style={{
                          width: activeStockCyclone.boxWidth || '60%',
                          height: activeStockCyclone.boxHeight || '60%'
                        }}
                      >
                        {/* Label Badge */}
                        <div className="absolute -top-3 left-3 bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap">
                          <span>TROPICAL CYCLONE VORTEX CORE ({activeStockCyclone.confidence}%)</span>
                        </div>
                        {/* Eyewall radius circle */}
                        <div className="absolute inset-4 border border-rose-500/80 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-rose-500/40 animate-ping" />
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)]" />
                        </div>
                        {/* Crosshairs */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-cyan-400/50" />
                          <div className="h-full w-px bg-cyan-400/50 absolute" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bottom HUD Data Overlay on Frame */}
                  <div className="absolute bottom-3 inset-x-3 bg-black/85 backdrop-blur-md rounded-xl p-2.5 border border-white/10 flex items-center justify-between text-white text-xs flex-wrap gap-2 z-20">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-sky-400 shrink-0" />
                      <span className="font-mono font-bold text-sky-300">
                        FIX: {activeStockCyclone.vortexFixFormatted}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        (Radius: ±{activeStockCyclone.fixationErrorRadiusKm} km)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-amber-400 font-mono text-[11px] font-bold hidden sm:inline">
                        💨 {activeStockCyclone.dvorakPreliminary.estimatedWindKmh} km/h • 📉 {activeStockCyclone.dvorakPreliminary.centralPressureHpa} hPa
                      </span>
                      <span className="text-emerald-400 font-bold font-mono text-[11px]">
                        LATENCY: {activeStockCyclone.inferenceLatencyMs} ms
                      </span>
                    </div>
                  </div>
                </div>

                {/* Layer Description */}
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    {imageLayer === 'raw' && (isHindi ? 'उच्च-रिज़ॉल्यूशन दृश्य व थर्मल उपग्रह फ्रेम।' : 'High-resolution multispectral meteorological satellite frame.')}
                    {imageLayer === 'gradcam' && (isHindi ? 'Grad-CAM अटेंशन: गहरे संवहनी बादलों पर मॉडल का ध्यान।' : 'Grad-CAM Attention: Deep convective spiral banding activation.')}
                    {imageLayer === 'bbox' && (isHindi ? 'ResNet-50 बाउंडिंग रिग्रेसर द्वारा अनुमानित केंद्र निर्देशांक।' : 'ResNet-50 bounding regressor predicting circulation center with Smooth-L1 loss.')}
                    {imageLayer === 'radar' && (isHindi ? 'डॉप्लर रडार परावर्तन (dBZ) सर्पिल संवहनी रिंग।' : 'Doppler radar reflectivity (dBZ) composite spiral rainband rings.')}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">FP16 TensorRT • ISRO MOSDAC</span>
                </div>
              </div>

              {/* Right Column: Key Confidence Metrics & Telemetry (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Confidence Card */}
                <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {isHindi ? 'चक्रवात पहचान निश्चितता' : 'Cyclone Identification Confidence'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                      HIGH CERTAINTY
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl sm:text-5xl font-heading font-black text-slate-950 dark:text-white">
                      {vortexData.cyclonePresenceConfidence}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Softmax Activation
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${vortexData.cyclonePresenceConfidence}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                    {isHindi
                      ? 'गहन संवहनी सर्पिल पैटर्न और 240 किमी सीडीओ व्यास के आधार पर सिस्टम ने पुष्टि की है कि यह एक सक्रिय गहरा अवदाब है।'
                      : 'High-confidence vortex signature with deep convective spiral coiling and negative cloud-top temperatures confirming tropical system status.'}
                  </p>
                </div>

                {/* Radiometric Feature Extractor Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isHindi ? 'न्यूनतम बादल तापमान' : 'Min Cloud-Top Temp'}</span>
                    </div>
                    <span className="text-xl font-heading font-black text-slate-950 dark:text-white">
                      {vortexData.radiometry.cloudTopMinTempFormatted}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Violent Convective Core
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Gauge className="w-3.5 h-3.5 text-sky-500" />
                      <span>{isHindi ? 'सीडीओ व्यास' : 'CDO Diameter'}</span>
                    </div>
                    <span className="text-xl font-heading font-black text-slate-950 dark:text-white">
                      {vortexData.radiometry.cdoDiameterFormatted}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Symmetric Overcast
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Wind className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isHindi ? 'अनुमानित हवा' : 'Est. Wind Speed'}</span>
                    </div>
                    <span className="text-xl font-heading font-black text-slate-950 dark:text-white">
                      {vortexData.dvorakPreliminary.estimatedWindKmh} km/h
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {vortexData.dvorakPreliminary.tNumber} Dvorak
                    </span>
                  </div>

                  <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <Compass className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{isHindi ? 'सर्पिल घुमाव' : 'Spiral Curvature'}</span>
                    </div>
                    <span className="text-xl font-heading font-black text-slate-950 dark:text-white">
                      {vortexData.radiometry.spiralCurvatureFormatted}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Tight Cyclonic Inflow
                    </span>
                  </div>
                </div>

                {/* Model Metadata Box */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Backbone Architecture:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">ResNet-50 + SPP</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Inference Cadence:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">15-Minute Synchronous</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Training Sample Space:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">42,500 Calibrated Frames</strong>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
             MODULE 2: MORPHOLOGICAL PATTERN CLASSIFICATION & STAGE PROGRESSION
             ========================================================================= */}
        {activeTab === 'classification' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/30">
                    MODULE 2: PATTERN CLASSIFICATION & STAGES
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Model: PatternNet-ViT v1.8
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white mt-1">
                  {isHindi ? '5 चक्रवात आकारिकी पैटर्न एवं विकास चरण' : '5 Cyclone Morphological Patterns & Lifecycle Stages'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'ड्वोरक तकनीक अनुसार 5 मुख्य आकारों (कर्व्ड बैंड, शीयर, सीडीओ, आई, एम्बेडेड सेंटर) का विज़न ट्रांसफार्मर वर्गीकरण।'
                    : 'Vision Transformer (ViT) multi-class classifier categorizing structural morphology and Dvorak T-number intensities.'}
                </p>
              </div>

              {/* Dominant Prediction Badge */}
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl px-4 py-2 text-right">
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 block uppercase">
                  ACTIVE DOMINANT PATTERN
                </span>
                <span className="text-sm font-black font-heading text-slate-950 dark:text-white">
                  Central Dense Overcast (68.5%)
                </span>
              </div>
            </div>

            {/* 5-Class Interactive Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {CYCLONE_PATTERN_CLASSES.map((pattern) => {
                const isSelected = selectedPatternId === pattern.id;
                return (
                  <IOSGlassCard
                    key={pattern.id}
                    onClick={() => setSelectedPatternId(pattern.id)}
                    wrapperClassName="h-full"
                    className={`rounded-3xl p-4 cursor-pointer flex flex-col justify-between h-full ${
                      isSelected
                        ? '!bg-sky-500/15 dark:!bg-sky-400/15 !border-sky-400 shadow-[0_12px_28px_rgba(2,132,199,0.25)] -translate-y-1 ring-2 ring-sky-400/40'
                        : 'hover:!border-sky-300 dark:hover:!border-sky-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {pattern.code}
                        </span>
                        <span className="text-xs font-black text-sky-600 dark:text-sky-400">
                          {pattern.probability}%
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-heading font-black text-slate-900 dark:text-white leading-tight">
                        {isHindi ? pattern.nameHindi : pattern.name}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {isHindi ? pattern.descriptionHindi : pattern.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Dvorak:</span>
                        <strong className="text-slate-900 dark:text-white">{pattern.dvorakRange}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Winds:</span>
                        <strong className="text-slate-900 dark:text-white">{pattern.intensityRange}</strong>
                      </div>
                    </div>
                  </IOSGlassCard>
                );
              })}
            </div>

            {/* Selected Pattern Detailed Inspection Card */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-400/30">
                    INSPECTED CLASS: {selectedPattern.code}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    Dvorak Scale: {selectedPattern.dvorakRange}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-heading font-black text-slate-950 dark:text-white">
                  {isHindi ? selectedPattern.nameHindi : selectedPattern.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isHindi ? selectedPattern.descriptionHindi : selectedPattern.description}
                </p>

                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    {isHindi ? 'मुख्य नैदानिक लक्षण (Key Diagnostic Features):' : 'Key Diagnostic Features:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {(isHindi ? selectedPattern.featuresHindi : selectedPattern.keyFeatures).map((feat, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Class Probability Distribution Chart (4 Cols) */}
              <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2 uppercase tracking-wider">
                  ViT Probability Distribution
                </span>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={CYCLONE_PATTERN_CLASSES}
                      layout="vertical"
                      margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                    >
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        dataKey="code"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'ViT Probability']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backgroundColor: 'rgba(15,23,42,0.95)',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="probability" fill="#0284c7" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Lifecycle Stages Step Progression Timeline */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black font-heading text-slate-950 dark:text-white uppercase tracking-wide">
                    {isHindi ? 'उष्णकटिबंधीय चक्रवात विकास जीवन चक्र (Lifecycle Progression)' : 'Tropical Cyclone Development Lifecycle Stages'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Stage-by-stage evolution from initial low pressure cluster to mature severe cyclonic storm and landfall decay.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                  ACTIVE STAGE: DEEP DEPRESSION
                </span>
              </div>

              {/* Steps Progress Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {CYCLONE_LIFECYCLE_STAGES.map((stage) => {
                  const isActiveStage = stage.status === 'ACTIVE_STAGE';
                  const isCompleted = stage.status === 'COMPLETED';

                  return (
                    <div
                      key={stage.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                        isActiveStage
                          ? 'bg-amber-500/15 dark:bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/40 shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black font-mono text-slate-500">
                            STEP {stage.stageNumber}
                          </span>
                          {isActiveStage ? (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                          ) : isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-400">Forecast</span>
                          )}
                        </div>

                        <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          {isHindi ? stage.nameHindi : stage.name}
                        </strong>

                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-1">
                          {stage.windRange} ({stage.dvorak})
                        </span>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500">
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
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                    MODULE 3: MULTI-SOURCE DATA FUSION
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Constellation Status: 6 Feeds Live
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white mt-1">
                  {isHindi ? 'बहु-स्रोत उपग्रह एवं तटीय रडार एकीकरण' : 'Multi-Source Satellite & Radar Telemetry Fusion'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'इसरो (INSAT, ओशनसैट) और नासा/नोआ उपग्रहों तथा आईएमडी डॉपलर रडार से वास्तविक समय सेंसर स्ट्रीम और डेटा गुणवत्ता।'
                    : 'Real-time telemetry feeds ingested into the multi-spectral feature tensor for deep learning inference.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ALL CONSTELLATIONS ONLINE</span>
                </span>
              </div>
            </div>

            {/* 6 Connected Data Source Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MULTI_SOURCE_FEEDS.map((feed) => (
                <IOSGlassCard
                  key={feed.id}
                  wrapperClassName="h-full"
                  className="rounded-3xl p-4.5 shadow-xs space-y-3.5 h-full flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block font-mono">
                        {feed.agency}
                      </span>
                      <h3 className="text-sm font-heading font-black text-slate-900 dark:text-white mt-0.5">
                        {isHindi ? feed.nameHindi : feed.name}
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{feed.status}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Spectral Band:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">{feed.spectralBand}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Spatial Resolution:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">{feed.spatialResolution}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Cadence / Interval:</span>
                      <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">{feed.cadence}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Stream Latency:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">{feed.latency}</strong>
                    </div>
                  </div>

                  {/* Quality Progress Bar */}
                  <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Data Quality Index</span>
                      <span className="font-bold text-slate-900 dark:text-white">{feed.quality}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full"
                        style={{ width: `${feed.quality}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {isHindi ? feed.fusionRoleHindi : feed.fusionRole}
                  </p>
                </IOSGlassCard>
              ))}
            </div>

            {/* AI Multi-Source Data Fusion Engine Architecture Diagram */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 block font-mono">
                  SPATIAL-TEMPORAL TENSOR CONCATENATION
                </span>
                <h3 className="text-lg sm:text-xl font-heading font-black">
                  AI Multi-Source Data Fusion Architecture
                </h3>
                <p className="text-xs text-slate-300">
                  How multi-spectral, microwave, scatterometer, and radar streams align in space and time.
                </p>
              </div>

              {/* Interactive Pipeline Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center space-y-1">
                  <span className="text-[10px] text-sky-300 font-mono uppercase block">Stage 1</span>
                  <strong className="text-xs sm:text-sm font-bold block">1. Calibrated Ingestion</strong>
                  <p className="text-[10px] text-slate-300">
                    Level-1B radiance normalization & geostationary grid re-projection.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center space-y-1">
                  <span className="text-[10px] text-sky-300 font-mono uppercase block">Stage 2</span>
                  <strong className="text-xs sm:text-sm font-bold block">2. Spatial Alignment</strong>
                  <p className="text-[10px] text-slate-300">
                    Bilinear interpolation to unified 224×224 km storm-centered grid.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center space-y-1">
                  <span className="text-[10px] text-sky-300 font-mono uppercase block">Stage 3</span>
                  <strong className="text-xs sm:text-sm font-bold block">3. Multi-Channel Fusion</strong>
                  <p className="text-[10px] text-slate-300">
                    Concatenates IR, WV, scatterometer winds & radar into 6-channel tensor.
                  </p>
                </div>

                <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-400/40 text-center space-y-1">
                  <span className="text-[10px] text-emerald-300 font-mono uppercase block">Stage 4</span>
                  <strong className="text-xs sm:text-sm font-bold block text-emerald-200">4. Neural Inference</strong>
                  <p className="text-[10px] text-slate-300">
                    Inference dispatched to CNN, ViT, and Bi-LSTM models in &lt;150ms.
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
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30">
                    MODULE 4: SPATIOTEMPORAL PREDICTION
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Model: CycloneForecast-BiLSTM v3.0
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white mt-1">
                  {isHindi ? '72-घंटे का एआई प्रक्षेपवक्र एवं तीव्रता पूर्वानुमान' : '72-Hour AI Trajectory & Intensity Prediction Studio'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'अनिश्चितता शंकु के साथ समयबद्ध पवन गति एवं केंद्रीय दबाव पूर्वानुमान, तथा संवेदनशील सिमुलेटर।'
                    : 'Spatiotemporal recurrent neural network predicting future track coordinates, wind velocities, and landfall timing with AI uncertainty cones.'}
                </p>
              </div>

              {/* Landfall Forecast Pill */}
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl px-4 py-2 text-right">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                  PROJECTED LANDFALL SECTOR
                </span>
                <span className="text-sm font-black font-heading text-slate-950 dark:text-white">
                  Gopalpur – Puri Coast, Odisha (+24h)
                </span>
              </div>
            </div>

            {/* Interactive "What-If" Sensitivity Simulator */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-500" />
                  <h3 className="text-xs sm:text-sm font-black font-heading uppercase tracking-wide text-slate-900 dark:text-white">
                    {isHindi ? 'इंटरैक्टिव पर्यावरण संवेदनशीलता सिमुलेटर' : 'Interactive Environmental Sensitivity Simulator ("What-If" Lab)'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Adjust sliders to test how the AI updates forecast curves in real-time
                  </span>
                  <button
                    onClick={handleResetSimulation}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-1">
                {/* Slider 1: Sea Surface Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Sea Surface Temp (SST):
                    </span>
                    <strong className="text-rose-600 dark:text-rose-400 font-mono text-sm">{simSst.toFixed(1)} °C</strong>
                  </div>
                  <input
                    type="range"
                    min="27.0"
                    max="32.0"
                    step="0.1"
                    value={simSst}
                    onChange={(e) => setSimSst(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>27.0°C (Baseline)</span>
                    <span>32.0°C (Extremely Warm)</span>
                  </div>
                </div>

                {/* Slider 2: Vertical Wind Shear */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Vertical Wind Shear:
                    </span>
                    <strong className="text-sky-600 dark:text-sky-400 font-mono text-sm">{simShear.toFixed(1)} kt</strong>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="35.0"
                    step="0.5"
                    value={simShear}
                    onChange={(e) => setSimShear(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 kt (Favorable)</span>
                    <span>35 kt (Hostile Shear)</span>
                  </div>
                </div>

                {/* Slider 3: Mid-Tropospheric Humidity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Mid-Level Moisture (RH):
                    </span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{simHumidity} %</strong>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="1"
                    value={simHumidity}
                    onChange={(e) => setSimHumidity(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>60% (Dry Air)</span>
                    <span>95% (Saturated)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid: Wind Speed with Uncertainty Cone & Barometric Pressure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Wind Speed Forecast & AI Confidence Cone */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Wind Speed Forecast (km/h) & Confidence Cone
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Shaded area represents AI uncertainty envelope (upper/lower bounds)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 font-mono">
                    Peak: {dynamicIntensityData[3].windSpeedKmh} km/h
                  </span>
                </div>

                <div className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicIntensityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="lead" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['dataMin - 15', 'dataMax + 15']} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backgroundColor: 'rgba(15,23,42,0.95)',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="windUpperKmh"
                        stroke="transparent"
                        fill="#38bdf8"
                        fillOpacity={0.18}
                        name="Upper Confidence Cone"
                      />
                      <Area
                        type="monotone"
                        dataKey="windSpeedKmh"
                        stroke="#0284c7"
                        strokeWidth={3}
                        fill="url(#windGrad)"
                        name="AI Predicted Wind (km/h)"
                      />
                      <ReferenceLine x="+24h" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Landfall Window', fill: '#ef4444', fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Central Barometric Pressure Drop (hPa) */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Central Barometric Pressure (MSLP in hPa)
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Lowest pressure indicates peak intensity before terrain dissipation
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                    Min: {dynamicIntensityData[3].pressureHpa} hPa
                  </span>
                </div>

                <div className="h-64 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dynamicIntensityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="lead" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[940, 990]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.2)',
                          backgroundColor: 'rgba(15,23,42,0.95)',
                          color: '#fff',
                          fontSize: '11px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pressureHpa"
                        stroke="#e11d48"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#e11d48' }}
                        name="Central Pressure (hPa)"
                      />
                      <ReferenceLine x="+24h" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Peak Drop (955 hPa)', fill: '#ef4444', fontSize: 10 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Spatiotemporal Waypoint Forecast Table */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-black font-heading text-slate-900 dark:text-white uppercase tracking-wider">
                    72-Hour Spatiotemporal Trajectory Waypoints
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Derived from Bi-LSTM spatiotemporal model coupling ocean steering vectors
                  </span>
                </div>
                <span className="text-[10px] font-mono text-indigo-500 font-bold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  AI INFERENCE ENGINE
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Lead Time</th>
                      <th className="py-3 px-4">Valid Timestamp</th>
                      <th className="py-3 px-4">Coordinates (Fix)</th>
                      <th className="py-3 px-4">Wind Velocity</th>
                      <th className="py-3 px-4">Pressure</th>
                      <th className="py-3 px-4">Movement Vector</th>
                      <th className="py-3 px-4">Stage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {dynamicIntensityData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          row.isLandfallWindow ? 'bg-rose-50/50 dark:bg-rose-950/20 font-bold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                          {row.lead}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {row.timestamp}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {row.latLonStr}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-rose-600 dark:text-rose-400">{row.windSpeedKmh} km/h</span>
                          <span className="text-slate-400 text-[10px] block">({row.windKnots} kt)</span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {row.pressureHpa} hPa
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {row.direction} @ {row.speedKmh} km/h
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                            row.isLandfallWindow
                              ? 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-400/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                    MODULE 5: HISTORICAL VALIDATION & ACCURACY
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Ground Truth: IMD / RSMC Best Track Archive
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white mt-1">
                  {isHindi ? 'ऐतिहासिक चक्रवात सत्यापन एवं मॉडल सटीकता' : 'Historical Cyclone Ground-Truth Benchmarking'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {isHindi
                    ? 'फानी, अम्फान, बिपरजॉय और दाना जैसे भीषण तूफानों पर एआई मॉडल के ट्रैक एवं तीव्रता त्रुटि का आधिकारिक सत्यापन।'
                    : 'Validating AI model predictions against official IMD best-track archives to demonstrate superior lead-time accuracy.'}
                </p>
              </div>

              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                OFFICIAL RSMC ARCHIVE DATA
              </span>
            </div>

            {/* Historical Storm Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HISTORICAL_BENCHMARKS.map((storm) => {
                const isSelected = selectedBenchmarkId === storm.id;
                return (
                  <IOSGlassCard
                    key={storm.id}
                    onClick={() => setSelectedBenchmarkId(storm.id)}
                    wrapperClassName="h-full"
                    className={`rounded-3xl p-4 cursor-pointer flex flex-col justify-between h-full ${
                      isSelected
                        ? '!bg-amber-500/15 dark:!bg-amber-400/15 !border-amber-400 ring-2 ring-amber-400/40 shadow-[0_12px_28px_rgba(245,158,11,0.25)] -translate-y-1'
                        : 'hover:!border-amber-300 dark:hover:!border-amber-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {storm.year}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          {storm.basin}
                        </span>
                      </div>
                      <h3 className="text-sm font-heading font-black text-slate-900 dark:text-white leading-tight">
                        {isHindi ? storm.nameHindi : storm.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Landfall: {storm.landfallLocation}
                      </span>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Peak Wind:</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-black">{storm.peakWindKmh} km/h</strong>
                    </div>
                  </IOSGlassCard>
                );
              })}
            </div>

            {/* Selected Storm Detailed Case Study */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block font-mono">
                    VALIDATION DOSSIER: {selectedBenchmark.name}
                  </span>
                  <h3 className="text-lg font-heading font-black text-slate-900 dark:text-white mt-0.5">
                    {isHindi ? selectedBenchmark.nameHindi : selectedBenchmark.name} ({selectedBenchmark.year})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Pattern:</span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                    {selectedBenchmark.morphologyPattern}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedBenchmark.narrative}
              </p>

              {/* Error Metrics Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">12h Track Error</span>
                  <span className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.lead12hTrackErrorKm} km
                  </span>
                  <span className="text-[10px] text-slate-400">vs 24.5 km IMD Baseline</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">24h Track Error</span>
                  <span className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.lead24hTrackErrorKm} km
                  </span>
                  <span className="text-[10px] text-slate-400">vs 48.0 km IMD Baseline</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">48h Track Error</span>
                  <span className="text-xl font-heading font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.lead48hTrackErrorKm} km
                  </span>
                  <span className="text-[10px] text-slate-400">vs 86.2 km IMD Baseline</span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Intensity Error (MAE)</span>
                  <span className="text-xl font-heading font-black text-sky-600 dark:text-sky-400 block mt-0.5">
                    {selectedBenchmark.aiAccuracy.intensityErrorKmh} km/h
                  </span>
                  <span className="text-[10px] text-slate-400">Mean Absolute Error</span>
                </div>
              </div>
            </div>

            {/* Benchmark Lead-Time Error Comparison Chart */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Model Accuracy Benchmark vs Global Numerical Weather Prediction (NWP)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Mean Track Error (km) across lead times — Lower is better
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  AI Outperforms NWP by ~32%
                </span>
              </div>

              <div className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MODEL_ACCURACY_BENCHMARKS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#f1f5f9'} />
                    <XAxis dataKey="lead" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" km" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(15,23,42,0.95)',
                        color: '#fff',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="CycloneAI" fill="#0284c7" radius={[4, 4, 0, 0]} name="CycloneAI (Our Model)" />
                    <Bar dataKey="IMD_Official" fill="#94a3b8" radius={[4, 4, 0, 0]} name="IMD Official Consensus" />
                    <Bar dataKey="ECMWF_IFS" fill="#64748b" radius={[4, 4, 0, 0]} name="ECMWF IFS Model" />
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
