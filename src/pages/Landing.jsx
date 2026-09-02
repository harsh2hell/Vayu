import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wind, ArrowRight, Target, Activity, ShieldCheck, History, 
  ExternalLink, Satellite, Play, CheckCircle, AlertTriangle, 
  Cpu, Layers, BarChart3, ChevronRight, ShieldAlert, Sparkles,
  Compass, Radio, Users, Building2, Eye, RefreshCw, Gauge, Zap,
  Navigation, MapPin, Sliders, Globe, Shield, Terminal, ArrowUpRight
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [selectedBasin, setSelectedBasin] = useState('Bay of Bengal');
  const [simulating, setSimulating] = useState(false);
  const [activeBand, setActiveBand] = useState('IR');
  const [forecastStep, setForecastStep] = useState(2); // 0: 0h, 1: 12h, 2: 24h, 3: 48h, 4: 72h

  // Simulation Datasets
  const simulationData = {
    'Bay of Bengal': {
      cyclone: 'TC-2026-ALPHA',
      name: 'Severe Cyclonic Storm "ALPHA"',
      basin: 'West-Central Bay of Bengal',
      coords: '15.4°N, 87.8°E',
      eyeFix: '15.38°N, 87.82°E (Sub-km Accurate)',
      category: 'Severe Cyclonic Storm (Cat 2)',
      dvorak: 'T3.5',
      intensity: '85 km/h',
      gusts: '105 km/h',
      pressure: '980 hPa',
      speed: '14 km/h',
      heading: 'North-Northwest (330°)',
      landfall: 'Gopalpur-Kalingapatnam (Odisha/AP)',
      eta: 'T+24 Hours (02 Sep 18:00 UTC)',
      confidence: '96.4%',
      riskLevel: 'HIGH',
      trackSteps: [
        { time: 'T+0h', coords: '15.4°N, 87.8°E', wind: '85 km/h', pres: '980 hPa', status: 'Current Fix' },
        { time: 'T+12h', coords: '16.7°N, 86.9°E', wind: '95 km/h', pres: '974 hPa', status: 'Intensifying' },
        { time: 'T+24h', coords: '18.1°N, 85.8°E', wind: '110 km/h', pres: '965 hPa', status: 'Peak / Landfall' },
        { time: 'T+48h', coords: '20.2°N, 84.5°E', wind: '55 km/h', pres: '992 hPa', status: 'Inland Weakening' },
        { time: 'T+72h', coords: '22.0°N, 83.8°E', wind: '35 km/h', pres: '1004 hPa', status: 'Well Marked Low' },
      ]
    },
    'Arabian Sea': {
      cyclone: 'TC-2026-BETA',
      name: 'Very Severe Cyclonic Storm "BETA"',
      basin: 'East-Central Arabian Sea',
      coords: '18.2°N, 68.4°E',
      eyeFix: '18.22°N, 68.39°E (Sub-km Accurate)',
      category: 'Very Severe Cyclonic Storm (Cat 3)',
      dvorak: 'T4.0',
      intensity: '120 km/h',
      gusts: '145 km/h',
      pressure: '964 hPa',
      speed: '18 km/h',
      heading: 'North-Northeast (025°)',
      landfall: 'Saurashtra Coast (Gujarat / Porbandar)',
      eta: 'T+36 Hours (03 Sep 06:00 UTC)',
      confidence: '94.8%',
      riskLevel: 'CRITICAL',
      trackSteps: [
        { time: 'T+0h', coords: '18.2°N, 68.4°E', wind: '120 km/h', pres: '964 hPa', status: 'Current Fix' },
        { time: 'T+12h', coords: '19.5°N, 69.1°E', wind: '130 km/h', pres: '958 hPa', status: 'Peak Intensity' },
        { time: 'T+24h', coords: '20.8°N, 69.8°E', wind: '125 km/h', pres: '962 hPa', status: 'Approaching Coast' },
        { time: 'T+48h', coords: '22.4°N, 71.2°E', wind: '70 km/h', pres: '988 hPa', status: 'Post-Landfall' },
        { time: 'T+72h', coords: '24.1°N, 72.8°E', wind: '40 km/h', pres: '1002 hPa', status: 'Depression' },
      ]
    }
  };

  const currentSim = simulationData[selectedBasin];

  const handleBasinSwitch = (basin) => {
    if (basin === selectedBasin) return;
    setSimulating(true);
    setSelectedBasin(basin);
    setTimeout(() => {
      setSimulating(false);
    }, 400);
  };

  const benchmarks = [
    { label: 'Eye Center Precision', value: '< 18 km', sub: 'Mean Distance vs. Radar Ground Truth', icon: Target, badge: 'CNN Eye Fix' },
    { label: '24h Forecast Lead', value: '94.8%', sub: 'Trajectory & Intensity Reliability', icon: Activity, badge: 'BiLSTM Engine' },
    { label: 'Multi-Spectral Channels', value: '4 Feeds', sub: 'IR, VIS, WV, Microwave (INSAT/NOAA)', icon: Satellite, badge: 'Real-Time Ingestion' },
    { label: 'Historical Baseline', value: '1,250+', sub: '15-Year RSMC & IBTrACS Validated', icon: History, badge: 'Training Dataset' },
  ];

  const modules = [
    {
      title: 'Multi-Spectral Satellite Ingestion',
      category: 'Data Engineering',
      desc: 'Real-time telemetry ingestion from INSAT-3DR (VIS/TIR1/TIR2/WV) and NOAA polar orbiters with automated radiometric calibration.',
      route: '/dashboard/satellite',
      icon: Satellite,
      tag: '4K Telemetry Pipeline',
      stat: '15-min cadence'
    },
    {
      title: 'Deep Learning Vision Detection',
      category: 'Computer Vision',
      desc: 'Convolutional neural networks detecting cyclonic curvature, spiral banding, and sub-kilometer center coordinates from cloud top brightness.',
      route: '/dashboard/detection',
      icon: Target,
      tag: 'YOLOv8 + ResNet',
      stat: '94.2% mAP'
    },
    {
      title: 'Automated Dvorak Classification',
      category: 'Meteorological AI',
      desc: 'Morphological pattern recognition classifying systems from Deep Depression to Super Cyclone with exact T-numbers and pressure estimations.',
      route: '/dashboard/classification',
      icon: Layers,
      tag: 'T1.0 – T8.0 Scale',
      stat: 'IMD Standard'
    },
    {
      title: 'BiLSTM 72h Trajectory Prediction',
      category: 'Time-Series Neural Net',
      desc: 'Recurrent sequence network forecasting storm track coordinates, translation speed, central pressure, and intensity at 6h to 72h horizons.',
      route: '/dashboard/prediction',
      icon: Compass,
      tag: 'Spatio-Temporal Net',
      stat: '±38 km @ 24h'
    },
    {
      title: 'Interactive 4D Track & Cone Visualizer',
      category: 'Geospatial HUD',
      desc: 'High-performance interactive map featuring historical storm fixes, predicted trajectory cones, isobar overlays, and coastal impact zones.',
      route: '/dashboard/track',
      icon: Radio,
      tag: 'Leaflet + GIS HUD',
      stat: 'Live Simulation'
    },
    {
      title: 'CAP Multi-Agency Warning Dispatch',
      category: 'Disaster Operations',
      desc: 'Automated ITU-T X.1303 Common Alerting Protocol dispatches and PDF bulletins for NDMA, Coast Guard, Fishery, and State EOCs.',
      route: '/dashboard/alerts',
      icon: ShieldAlert,
      tag: 'CAP v1.2 / ITU-T',
      stat: 'Instant Dispatches'
    }
  ];

  const pipelineStages = [
    { num: '01', title: 'Telemetry Ingestion', desc: 'INSAT-3DR & NOAA multi-spectral radiometric calibration', tech: 'HDF5 / GeoTIFF' },
    { num: '02', title: 'Feature Extraction', desc: 'Deep CNN filters detect eye wall & cloud curvature bands', tech: 'Custom PyTorch CNN' },
    { num: '03', title: 'Dvorak Intensity', desc: 'Automated T-number estimation and central pressure deficit', tech: 'ResNet-50 + Dvorak' },
    { num: '04', title: '72h Spatio-Temporal', desc: 'BiLSTM forecasting track coordinates & wind speed', tech: 'BiLSTM + Attention' },
    { num: '05', title: 'Disaster Early Warning', desc: 'Dispatches CAP alerts & coastal impact zone maps', tech: 'ITU-T X.1303 Protocol' },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Subtle National Identity Line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-sky-400 to-emerald-500" />

      {/* Top Institutional Bar */}
      <div className="bg-[#050811] border-b border-slate-800/80 py-2 px-4 sm:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-sky-500/10 border border-sky-400/30 flex items-center justify-center font-mono font-bold text-[10px] text-sky-400">
              IND
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-slate-200">Government of India</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 hidden sm:inline">Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-sky-950/80 text-sky-300 border border-sky-500/30 px-2.5 py-0.5 rounded-full font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Smart India Hackathon 2026 Initiative
            </span>
          </div>
        </div>
      </div>

      {/* Live Warning Ticker */}
      <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-red-950/90 border-b border-red-500/30 px-4 sm:px-8 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 truncate">
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex-shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              LIVE EARLY WARNING
            </span>
            <p className="truncate text-slate-200 font-medium text-xs">
              <span className="text-red-400 font-semibold font-mono">TC-2026-ALPHA:</span> Active in West-Central Bay of Bengal (15.4°N, 87.8°E). Peak Sustained Winds 85 km/h. Landfall expected near Gopalpur in T-24h.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold text-xs hover:underline ml-auto flex-shrink-0"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="bg-[#090E1A]/90 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 border border-cyan-300/30">
              <Wind className="w-5 h-5 text-slate-950 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl text-white tracking-tight">VAYU <span className="text-cyan-400">AI</span></span>
                <span className="text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-mono font-bold uppercase">v2.1</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-tight">National Tropical Cyclone Intelligence & Prediction Platform</p>
            </div>
          </div>

          {/* Quick Nav & Launch Button */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard/track')}
              className="hidden lg:inline-flex text-xs font-medium text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              4D Visualizer
            </button>
            <button 
              onClick={() => navigate('/dashboard/architecture')}
              className="hidden sm:inline-flex text-xs font-medium text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              Architecture
            </button>
            <button 
              onClick={() => navigate('/dashboard/alerts')}
              className="hidden md:inline-flex text-xs font-medium text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              CAP Bulletins
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-xs py-2 px-4.5 shadow-lg shadow-sky-500/25"
            >
              <span>Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-radar-grid bg-radial-vortex border-b border-slate-800/80">
        
        {/* Atmospheric Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Next-Gen Meteorological Deep Learning</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                AI-Powered Cyclone <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">Detection & 72h Trajectory</span> Forecasting
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                VAYU integrates INSAT-3DR and NOAA multi-spectral satellite telemetry with deep CNN vision models and BiLSTM neural networks to deliver sub-kilometer eye fixes and actionable early warning intelligence across the North Indian Ocean basin.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary text-sm py-3 px-6 shadow-xl shadow-cyan-500/20"
                >
                  <Activity className="w-4 h-4 text-slate-950" />
                  <span>Launch Live AI Command Center</span>
                </button>
                <button
                  onClick={() => navigate('/dashboard/track')}
                  className="btn-secondary text-sm py-3 px-5"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Explore 4D Visualizer</span>
                </button>
              </div>

              {/* Verified Badges */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>IMD Dvorak T-Number Standard</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>ITU-T X.1303 CAP Protocol</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Sub-km Eye Localization</span>
                </div>
              </div>

            </div>

            {/* Hero Right: Interactive Live AI Telemetry Sandbox */}
            <div className="lg:col-span-6">
              <div className="glass-panel-card p-6 rounded-2xl border-slate-700/60 shadow-2xl relative overflow-hidden space-y-5 bg-[#0D1527]/90">
                
                {/* Sandbox Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="font-heading font-bold text-sm text-white">Live AI Inference Sandbox</h3>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    CycloneForecast-LSTM v2.1
                  </span>
                </div>

                {/* Basin Selector Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">Active Basin:</span>
                    <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700/80 text-xs font-mono">
                      <button
                        onClick={() => handleBasinSwitch('Bay of Bengal')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          selectedBasin === 'Bay of Bengal' 
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Bay of Bengal
                      </button>
                      <button
                        onClick={() => handleBasinSwitch('Arabian Sea')}
                        className={`px-3 py-1 rounded-md transition-all ${
                          selectedBasin === 'Arabian Sea' 
                            ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' 
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Arabian Sea
                      </button>
                    </div>
                  </div>

                  {/* Satellite Band Selector */}
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    {['IR', 'VIS', 'WV'].map((band) => (
                      <button
                        key={band}
                        onClick={() => setActiveBand(band)}
                        className={`px-2 py-0.5 rounded border ${
                          activeBand === band 
                            ? 'bg-slate-800 text-cyan-300 border-cyan-500/40 font-bold' 
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {band}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Telemetry Box */}
                <div className="bg-[#090E1A] rounded-xl p-4.5 border border-slate-800/90 space-y-4">
                  {simulating ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                      <RefreshCw className="w-7 h-7 animate-spin text-cyan-400" />
                      <span className="text-xs font-mono font-medium text-cyan-300">Executing Deep CNN & BiLSTM Inference...</span>
                    </div>
                  ) : (
                    <>
                      {/* Storm Headline & Severity Badge */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-heading font-bold text-sm text-white">{currentSim.name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{currentSim.basin} • {currentSim.coords}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-red">{currentSim.dvorak}</span>
                          <span className="badge badge-cyan">{currentSim.confidence} Conf</span>
                        </div>
                      </div>

                      {/* 4 Metric Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Sustained Wind</span>
                          <span className="font-bold text-cyan-400 text-sm">{currentSim.intensity}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Central Press.</span>
                          <span className="font-bold text-white text-sm">{currentSim.pressure}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Storm Motion</span>
                          <span className="font-bold text-amber-400 text-xs truncate block">{currentSim.speed} {currentSim.heading.split(' ')[0]}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 block uppercase">Landfall ETA</span>
                          <span className="font-bold text-rose-400 text-xs truncate block">{currentSim.eta.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* 72h Step-Through Trajectory Slider */}
                      <div className="space-y-2 pt-1 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-400">72h Trajectory Step:</span>
                          <span className="text-cyan-300 font-bold">
                            {currentSim.trackSteps[forecastStep].time} ({currentSim.trackSteps[forecastStep].status})
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-1.5 font-mono text-[11px]">
                          {currentSim.trackSteps.map((step, idx) => (
                            <button
                              key={idx}
                              onClick={() => setForecastStep(idx)}
                              className={`py-1.5 px-1 rounded text-center transition-all border ${
                                forecastStep === idx
                                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              {step.time}
                            </button>
                          ))}
                        </div>

                        <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 text-[11px] font-mono flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-slate-300">Coords: <strong>{currentSim.trackSteps[forecastStep].coords}</strong></span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">Wind: <strong className="text-cyan-400">{currentSim.trackSteps[forecastStep].wind}</strong></span>
                            <span className="text-slate-400">Press: <strong className="text-slate-200">{currentSim.trackSteps[forecastStep].pres}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Direct Link */}
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                        <span>Sector: <strong className="text-slate-200">{currentSim.landfall}</strong></span>
                        <button
                          onClick={() => navigate('/dashboard')}
                          className="text-cyan-400 font-semibold hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        >
                          <span>Full AI Analysis</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Key Performance Benchmarks Grid */}
      <section className="py-12 bg-[#090E1A] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benchmarks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="glass-panel-card p-5 rounded-xl border-slate-800 space-y-2 bg-[#0D1527]/60">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="badge badge-cyan text-[10px]">{item.badge}</span>
                  </div>
                  <div>
                    <span className="text-xs font-mono text-slate-400 block">{item.label}</span>
                    <p className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">{item.value}</p>
                    <p className="text-[11px] text-slate-400 font-sans">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5-Stage Neural Architecture Pipeline */}
      <section className="py-16 bg-[#070B14] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Stage Deep Learning Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              From Raw Satellite Telemetry to Actionable Warnings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              VAYU chains state-of-the-art computer vision and recurrent neural sequence networks into an end-to-end meteorological pipeline.
            </p>
          </div>

          {/* Pipeline Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pipelineStages.map((stage, sIdx) => (
              <div 
                key={sIdx}
                className="glass-panel-card p-5 rounded-xl border-slate-800/90 relative group hover:border-cyan-500/40 transition-all bg-[#0B1222]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xl font-black text-cyan-400/60 group-hover:text-cyan-400 transition-colors">
                    {stage.num}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    {stage.tech}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-white group-hover:text-cyan-300 transition-colors mb-1.5">
                  {stage.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {stage.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Feature Capabilities Suite Grid */}
      <section className="py-20 bg-[#090E1A] flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Operational Modules</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                Complete AI & GIS Intelligence Suite
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                Explore individual specialized modules engineered for meteorologists, disaster management authorities, and defense commanders.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-xs py-2.5 px-5 self-start md:self-auto"
            >
              <span>Launch Unified Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((feat, fIdx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={fIdx} 
                  onClick={() => navigate(feat.route)}
                  className="glass-panel-card p-6 rounded-2xl cursor-pointer hover:border-cyan-500/50 transition-all group space-y-4 bg-[#0D1527]/80"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-cyan-950/90 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="badge badge-cyan text-[10px]">
                      {feat.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-cyan-400 block uppercase tracking-wider">{feat.category}</span>
                    <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal">
                      {feat.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80">
                    <span className="text-slate-500">{feat.stat}</span>
                    <div className="flex items-center gap-1 text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Open Module</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050811] text-slate-400 py-12 px-4 sm:px-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center text-slate-950 font-bold text-sm">
                V
              </div>
              <span className="font-heading font-bold text-white text-base">VAYU Meteorological AI</span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                System Active
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Developed for Smart India Hackathon 2026 • Ministry of Earth Sciences & India Meteorological Department
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <button onClick={() => navigate('/dashboard/architecture')} className="hover:text-cyan-300 transition-colors">
              AI Architecture
            </button>
            <button onClick={() => navigate('/dashboard/performance')} className="hover:text-cyan-300 transition-colors">
              Model Benchmarks
            </button>
            <button onClick={() => navigate('/dashboard/alerts')} className="hover:text-cyan-300 transition-colors">
              Disaster Bulletins
            </button>
            <button onClick={() => navigate('/dashboard')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1">
              <span>Command Center</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;
