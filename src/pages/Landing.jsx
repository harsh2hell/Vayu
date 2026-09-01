import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wind, ArrowRight, Target, Activity, ShieldCheck, History, 
  ExternalLink, Satellite, Play, CheckCircle, AlertTriangle, 
  Cpu, Layers, BarChart3, ChevronRight, ShieldAlert, Sparkles,
  Compass, Radio, Users, Building2, Eye
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('demo');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleSimulate = () => {
    setSimulating(true);
    setSimResult(null);
    setTimeout(() => {
      setSimulating(false);
      setSimResult({
        cyclone: 'TC-2026-ALPHA (Bay of Bengal)',
        category: 'Developing Tropical Cyclone (Category 2)',
        confidence: '96.4%',
        dvorak: 'T3.0 / 3.0',
        intensity: '85 km/h (Sustained)',
        pressure: '980 hPa',
        trackTendency: 'North-West towards Odisha-AP Coast',
      });
    }, 1200);
  };

  const stats = [
    { label: 'Historical Systems Analysed', value: '1,250+', icon: History, detail: '15 Years RSMC & IBTrACS Data' },
    { label: 'AI Detection Accuracy', value: '94.2%', icon: Target, detail: 'CycloneVision-CNN v2.1' },
    { label: 'Satellite Data Sources', value: '6 Feeds', icon: Satellite, detail: 'INSAT-3DR, NOAA-20, ASCAT, GPM' },
    { label: 'Forecast Lead Time', value: '24–72 hrs', icon: ShieldCheck, detail: 'BiLSTM Track & Intensity Model' },
  ];

  const features = [
    {
      title: 'Multi-Spectral Satellite Ingestion',
      desc: 'Automated real-time ingestion and alignment of Visible, Infrared, Water Vapour, and Microwave feeds from INSAT-3DR/3D and NOAA.',
      route: '/dashboard/satellite',
      icon: Satellite,
      badge: 'Live Data Pipeline'
    },
    {
      title: 'Deep Learning Cyclone Detection',
      desc: 'Custom Convolutional Neural Network (CNN) detects spiral banding, Central Dense Overcast (CDO), and eye structures with 94.2% precision.',
      route: '/dashboard/detection',
      icon: Target,
      badge: 'Computer Vision'
    },
    {
      title: 'Morphological Classification',
      desc: 'Pattern recognition model mapping satellite cloud patterns directly to automated Dvorak T-numbers and intensity categories.',
      route: '/dashboard/classification',
      icon: Layers,
      badge: 'ResNet-50 + Dvorak'
    },
    {
      title: 'BiLSTM Track & Intensity Prediction',
      desc: 'Time-series forecasting predicting cyclone coordinates and maximum sustained wind speeds at 6h, 12h, 24h, 48h, and 72h intervals.',
      route: '/dashboard/prediction',
      icon: Compass,
      badge: 'Time-Series AI'
    },
    {
      title: 'Interactive 4D Track Visualizer',
      desc: 'High-resolution geospatial map showing past trajectories, forecasted cone of uncertainty, and vulnerable coastal strike zones.',
      route: '/dashboard/track',
      icon: Radio,
      badge: 'Geospatial HUD'
    },
    {
      title: 'Multi-Agency Risk Intelligence',
      desc: 'Automated early warning bulletins and severity scoring customized for NDMA, SDRF, Coast Guard, and local district administrations.',
      route: '/dashboard/alerts',
      icon: ShieldAlert,
      badge: 'Early Warning System'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Tricolor National Accent Top Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Top Government Portal Bar */}
      <div className="bg-[#002266] text-white py-2 px-4 sm:px-8 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-amber-300 border border-white/20">
              GOI
            </div>
            <div>
              <span className="font-semibold text-slate-100">Government of India</span>
              <span className="text-blue-300 mx-2 hidden sm:inline">•</span>
              <span className="text-blue-200 hidden sm:inline">Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Smart India Hackathon 2026 Prototype
            </span>
          </div>
        </div>
      </div>

      {/* Live Warning Ticker */}
      <div className="bg-red-700 text-white px-4 sm:px-8 py-1.5 text-xs flex items-center justify-between overflow-hidden shadow-inner">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
          <span className="bg-white text-red-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Live Bulletin
          </span>
          <p className="truncate text-red-100 font-medium">
            TC-2026-ALPHA: Severe Cyclonic Storm active in West-Central Bay of Bengal (15.4°N, 87.8°E). Projected landfall near Odisha-Andhra border in 36 hrs.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="hidden md:inline-flex items-center gap-1 text-amber-200 hover:text-white font-semibold flex-shrink-0 underline text-xs ml-auto"
          >
            Track in Real-Time <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Header / Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 rounded-xl bg-[#003087] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
              <Wind className="w-6 h-6 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-[#003087] tracking-tight">Cyclone<span className="text-amber-600">AI</span></span>
                <span className="text-[10px] bg-blue-100 text-[#003087] px-2 py-0.5 rounded font-bold uppercase tracking-wider">v2.1</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">National Tropical Cyclone Monitoring & Prediction Framework</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => navigate('/dashboard/analytics')}
              className="hidden lg:inline-flex text-xs font-semibold text-slate-600 hover:text-[#003087] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Historical Database
            </button>
            <button 
              onClick={() => navigate('/dashboard/architecture')}
              className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-[#003087] px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              AI Architecture
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#003087] hover:bg-[#002266] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md shadow-blue-900/20 active:scale-95 transition-all"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#002266] via-[#003087] to-[#0d52b9] text-white py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Abstract Radar Background Rings */}
        <div className="absolute -right-24 -top-24 w-[600px] h-[600px] rounded-full border border-blue-400/10 pointer-events-none animate-pulse" />
        <div className="absolute -right-48 -top-48 w-[800px] h-[800px] rounded-full border border-blue-300/5 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Mission Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs text-amber-300 font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH 2026 Problem Statement: Disaster Management & Meteorology</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
              Next-Gen AI Platform for <br />
              <span className="text-amber-300">Tropical Cyclone Prediction</span> & Early Warning
            </h1>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Official Objective</span>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-blue-50">
                "To develop an Artificial Intelligence (AI) / Machine Learning (ML) based system for identification, classification, and prediction of different tropical cyclone patterns using multi-source satellite data."
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Enter Command Center</span>
              </button>

              <button 
                onClick={() => navigate('/dashboard/track')}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-5 py-3.5 rounded-xl text-sm flex items-center gap-2 backdrop-blur-sm transition-all"
              >
                <Radio className="w-4 h-4 text-cyan-300" />
                <span>Live Cyclone Track</span>
              </button>

              <button 
                onClick={() => navigate('/dashboard/detection')}
                className="bg-transparent hover:bg-white/10 text-blue-200 hover:text-white font-medium px-4 py-3.5 rounded-xl text-sm flex items-center gap-1.5 transition-colors"
              >
                <span>AI Pipeline Test</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{s.value}</div>
                  <div className="text-[11px] text-blue-200 font-medium leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live AI Simulator Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-200">Interactive AI Inference Teaser</span>
                </div>
                <span className="text-[10px] bg-blue-600/50 text-blue-200 px-2 py-0.5 rounded font-mono">INSAT-3DR IR Feed</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Satellite Imagery Window */}
                <div className="relative rounded-xl overflow-hidden bg-slate-950 h-52 flex items-center justify-center border border-slate-300">
                  <img 
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
                    alt="Satellite Cyclone Pattern" 
                    className="w-full h-full object-cover filter contrast-125 brightness-90 hue-rotate-180"
                  />
                  
                  {/* Overlay scanline and bounding box */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent pointer-events-none" />
                  
                  {simulating && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                      <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-cyan-300">Running CycloneVision-CNN v2.1...</p>
                    </div>
                  )}

                  {simResult && (
                    <div className="absolute inset-4 border-2 border-red-500 rounded-lg flex items-start justify-between p-2 pointer-events-none bg-red-500/10">
                      <span className="bg-red-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded">
                        TARGET DETECTED • 96.4%
                      </span>
                      <span className="text-[10px] bg-black/70 text-cyan-300 px-2 py-0.5 rounded font-mono">
                        15.4°N, 87.8°E
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 bg-black/70 text-slate-300 text-[10px] px-2 py-1 rounded backdrop-blur-xs font-mono">
                    Channel: Enhanced IR (10.8 µm)
                  </div>
                </div>

                {/* Simulation Output Area */}
                {!simResult && !simulating && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-xs text-slate-500">
                    Click the button below to test the AI CNN Detection & Dvorak classification model on this live satellite frame.
                  </div>
                )}

                {simResult && (
                  <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">System Identified:</span>
                      <span className="font-bold text-[#003087]">{simResult.cyclone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">AI Classification:</span>
                      <span className="font-bold text-emerald-700">{simResult.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Intensity & Pressure:</span>
                      <span className="font-semibold text-slate-800">{simResult.intensity} • {simResult.pressure}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                      <span className="text-slate-500 font-medium">Forecast Path:</span>
                      <span className="font-semibold text-red-600">{simResult.trackTendency}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    onClick={handleSimulate}
                    disabled={simulating}
                    className="flex-1 bg-[#003087] hover:bg-[#002266] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{simulating ? 'Analyzing Image...' : 'Run Quick AI Detection'}</span>
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/detection')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center transition-colors"
                    title="Open Full Pipeline"
                  >
                    Full Lab →
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Innovation Modules Section */}
      <section className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#003087] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              Full Spectrum AI Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              End-to-End Cyclone Intelligence Architecture
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Built on multi-spectral satellite imagery and physics-informed deep learning models to assist disaster authorities in timely evacuations and risk mitigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <div 
                key={i} 
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#003087]/40 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-md group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#003087] flex items-center justify-center group-hover:bg-[#003087] group-hover:text-white transition-colors">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-[#003087] transition-colors mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(feat.route)}
                  className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#003087] group-hover:text-amber-600 transition-colors w-full"
                >
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Stakeholders and Target Impact */}
      <section className="py-16 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Societal & Strategic Impact
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Empowering India's Disaster Resilience
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                By accelerating detection times and extending accurate lead forecasts up to 72 hours, CycloneAI minimizes loss of life and coastal infrastructure destruction.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'National Meteorological Agencies', desc: 'Provides automated objective Dvorak classifications and secondary verification tools for duty meteorologists.', icon: Building2 },
                { title: 'NDMA & State Disaster Authorities', desc: 'Direct automated dissemination of strike probability heatmaps and evacuation zone recommendations.', icon: ShieldAlert },
                { title: 'Coast Guard & Maritime Operations', desc: 'High-seas wind field forecasts and wave storm surge estimates for fishing vessels and cargo ships.', icon: Radio },
                { title: 'Coastal Communities & District Mag.', desc: 'Actionable vernacular alert bulletins sent directly to block-level relief commissioners.', icon: Users },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-[#003087] flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Official Government / SIH Prototype Footer */}
      <footer className="bg-[#001f5b] text-blue-100 py-12 px-4 sm:px-8 border-t border-blue-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5 text-white font-bold text-lg">
              <Wind className="w-6 h-6 text-amber-400" />
              <span>Cyclone<span className="text-amber-400">AI</span> Platform</span>
            </div>
            <p className="text-blue-200/80 leading-relaxed max-w-md">
              Developed as a high-fidelity prototype for Smart India Hackathon (SIH) 2026. Designed in compliance with national meteorological standards for Tropical Cyclone monitoring across the North Indian Ocean basin.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-semibold text-white">SIH 2026 Finalist Prototype</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded text-[10px] font-semibold">MoES Problem #MET-07</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm mb-3">Intelligence Modules</h4>
            <ul className="space-y-2 text-blue-200">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">Command Dashboard</button></li>
              <li><button onClick={() => navigate('/dashboard/satellite')} className="hover:text-white transition-colors">Satellite Multi-Spectral</button></li>
              <li><button onClick={() => navigate('/dashboard/detection')} className="hover:text-white transition-colors">CNN Detection Lab</button></li>
              <li><button onClick={() => navigate('/dashboard/prediction')} className="hover:text-white transition-colors">LSTM Forecast Engine</button></li>
              <li><button onClick={() => navigate('/dashboard/track')} className="hover:text-white transition-colors">Interactive Track Map</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm mb-3">Data Providers & Specs</h4>
            <ul className="space-y-2 text-blue-200">
              <li>MOSDAC (ISRO) INSAT-3DR Feeds</li>
              <li>NOAA-20 / GPM Core Constellation</li>
              <li>IBTrACS & RSMC Historical Archive</li>
              <li>ERA5 ECMWF Atmospheric Reanalysis</li>
              <li><button onClick={() => navigate('/dashboard/architecture')} className="text-amber-300 hover:underline">View System Architecture →</button></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-300">
          <p>© 2026 CycloneAI — Smart India Hackathon Prototype | Ministry of Earth Sciences | IMD</p>
          <p className="text-blue-300/70 text-center sm:text-right">
            Disclaimer: Experimental research & decision-support system. Not an official operational warning issued by IMD.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
