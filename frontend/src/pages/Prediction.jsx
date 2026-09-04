import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  LineChart, Line, ReferenceLine, ReferenceArea, Legend 
} from 'recharts';
import { 
  BrainCircuit, MapPin, Wind, TrendingUp, 
  Info, CheckCircle, ShieldCheck, Gauge, 
  Sliders, Activity, Cpu, Sparkles, AlertTriangle, 
  RotateCcw, ArrowUpRight, Compass, ShieldAlert, Zap
} from 'lucide-react';
import { INTENSITY_FORECAST, PRESSURE_FORECAST } from '../data/mockData';

const FEATURE_IMPORTANCE = [
  { feature: 'Sea Surface Temp (SST)', weight: 34, color: '#DC2626', sub: 'High oceanic thermal energy pool (>28.5°C)' },
  { feature: 'Vertical Wind Shear (200-850hPa)', weight: 26, color: '#2563EB', sub: 'Low shear (<15 kt) enabling vertical cloud chimney' },
  { feature: 'Mid-Tropospheric Humidity (700hPa)', weight: 18, color: '#059669', sub: 'High moisture feed prevents dry air entrainment' },
  { feature: 'Past 12h Steering Velocity Vector', weight: 14, color: '#D97706', sub: 'Subtropical ridge steering NW towards Odisha coast' },
  { feature: 'Dvorak Pattern Embedding Vector', weight: 8, color: '#7C3AED', sub: 'ResNet-50 latent morphological embedding' },
];

const MODEL_BENCHMARK_DATA = [
  { lead: '+12h', CycloneAI: 18.2, IMD_Official: 24.5, ECMWF_IFS: 22.0, NCEP_GFS: 28.4 },
  { lead: '+24h', CycloneAI: 32.4, IMD_Official: 48.0, ECMWF_IFS: 41.5, NCEP_GFS: 54.0 },
  { lead: '+48h', CycloneAI: 68.5, IMD_Official: 86.2, ECMWF_IFS: 76.0, NCEP_GFS: 94.2 },
  { lead: '+72h', CycloneAI: 112.0, IMD_Official: 138.4, ECMWF_IFS: 124.0, NCEP_GFS: 149.0 },
];

const IMD_CATEGORIES = [
  { label: 'Deep Depression', maxWind: 61, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { label: 'Cyclonic Storm', maxWind: 88, color: 'text-cyan-700', bg: 'bg-cyan-50 border-cyan-200' },
  { label: 'Severe Cyclonic Storm', maxWind: 117, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { label: 'Very Severe Cyclone', maxWind: 165, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  { label: 'Super Cyclonic Storm', maxWind: 250, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
];

const Prediction = () => {
  const [chartMode, setChartMode] = useState('intensity'); // 'intensity' | 'pressure' | 'ensemble'
  const [selectedTimeStep, setSelectedTimeStep] = useState(3); // Default to +24h (landfall)
  
  // Interactive "What-If" Sensitivity Simulator States
  const [simSst, setSimSst] = useState(29.5);
  const [simShear, setSimShear] = useState(12.0);
  const [simHumidity, setSimHumidity] = useState(85);

  // Dynamic Intensity Curve Adjusted by Simulation Sliders
  const simulatedIntensityData = useMemo(() => {
    // Delta factors: Higher SST + Lower Shear = Higher Peak Intensification
    const sstBonus = (simSst - 28.0) * 8.5;
    const shearPenalty = Math.max(0, (simShear - 12.0) * 2.2);
    const humidityFactor = (simHumidity - 70) * 0.3;
    const netDelta = Math.round(sstBonus - shearPenalty + humidityFactor);

    return INTENSITY_FORECAST.map((item, idx) => {
      let multiplier = 0;
      if (idx === 1) multiplier = 0.25;
      if (idx === 2) multiplier = 0.6;
      if (idx === 3) multiplier = 1.0; // Peak at +24h
      if (idx === 4) multiplier = 0.7;
      if (idx === 5) multiplier = 0.3;

      const dynamicSpeed = Math.max(45, Math.round(item.speed + netDelta * multiplier));
      const dynamicUpper = Math.round(dynamicSpeed * 1.12);
      const dynamicLower = Math.round(dynamicSpeed * 0.88);

      return {
        ...item,
        speed: dynamicSpeed,
        upper: dynamicUpper,
        lower: dynamicLower,
        controlMember: Math.round(dynamicSpeed * 0.96),
        highShearScenario: Math.round(dynamicSpeed * 0.84),
        gfsBaseline: Math.round(dynamicSpeed * 1.08)
      };
    });
  }, [simSst, simShear, simHumidity]);

  const peakForecast = simulatedIntensityData[3];

  const getCategoryBadge = (speed) => {
    if (speed >= 166) return { name: 'Super Cyclone', badge: 'bg-red-100 text-red-800 border-red-300' };
    if (speed >= 118) return { name: 'Very Severe CS', badge: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (speed >= 89) return { name: 'Severe Cyclone', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (speed >= 62) return { name: 'Cyclonic Storm', badge: 'bg-cyan-100 text-cyan-800 border-cyan-300' };
    return { name: 'Deep Depression', badge: 'bg-blue-100 text-blue-800 border-blue-300' };
  };

  const TRACK_TABLE_DATA = [
    { time: 'NOW', lead: '0h', lat: '15.4°N', lon: '87.8°E', wind: simulatedIntensityData[0]?.speed || 85, pressure: 980, dir: 'NW 15km/h', stage: 'Active Fix' },
    { time: '+6h', lead: '6h', lat: '16.1°N', lon: '87.1°E', wind: simulatedIntensityData[1]?.speed || 92, pressure: 974, dir: 'NW 16km/h', stage: 'Intensifying' },
    { time: '+12h', lead: '12h', lat: '16.9°N', lon: '86.5°E', wind: simulatedIntensityData[2]?.speed || 101, pressure: 966, dir: 'NW 17km/h', stage: 'Severe Cyclone' },
    { time: '+24h', lead: '24h', lat: '18.2°N', lon: '85.6°E', wind: simulatedIntensityData[3]?.speed || 115, pressure: 955, dir: 'NNW 18km/h', stage: 'Landfall Window' },
    { time: '+48h', lead: '48h', lat: '20.1°N', lon: '84.2°E', wind: simulatedIntensityData[4]?.speed || 105, pressure: 962, dir: 'N 14km/h', stage: 'Inland Weakening' },
    { time: '+72h', lead: '72h', lat: '22.0°N', lon: '83.0°E', wind: simulatedIntensityData[5]?.speed || 90, pressure: 970, dir: 'NE 10km/h', stage: 'Depression Decay' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  AI Spatiotemporal Prediction & Trajectory Engine
                </h1>
                <span className="badge badge-navy">BiLSTM v3.0</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                15-Year RSMC Archive Training • Multi-Horizon 72h Intensity & Track Forecasting
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Scorecard */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              24h Track MAE Error
            </span>
            <span className="text-base font-black text-emerald-900">32.4 km</span>
            <span className="text-[10px] text-emerald-600 block">32% Lower than NWP</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] font-bold text-[#003087] uppercase tracking-wider block">
              Peak Intensity (+24h)
            </span>
            <span className="text-base font-black text-[#003087]">{peakForecast?.speed} km/h</span>
            <span className="text-[10px] text-blue-600 block">Landfall Window</span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Forecasting Studio (8 Cols) + Interactive Sensitivity Simulator & Table (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Forecasting Studio (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Main Interactive Forecast Curve Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#003087]" />
                  <h3 className="font-bold text-sm text-slate-900">BiLSTM Intensity & Pressure Projections</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic ensemble spread with IMD wind classification threshold zones
                </p>
              </div>

              {/* Mode Toggles */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setChartMode('intensity')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMode === 'intensity' ? 'bg-white text-[#003087] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Intensity Curve
                </button>
                <button
                  onClick={() => setChartMode('ensemble')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMode === 'ensemble' ? 'bg-white text-[#003087] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Multi-Model Spread
                </button>
                <button
                  onClick={() => setChartMode('pressure')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMode === 'pressure' ? 'bg-white text-[#003087] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  MSLP Pressure (hPa)
                </button>
              </div>
            </div>

            {/* High-Resolution Area/Line Chart */}
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'intensity' ? (
                  <AreaChart data={simulatedIntensityData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradBiLSTM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#003087" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#003087" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748B' }} 
                      axisLine={false} 
                      tickLine={false} 
                      unit=" km/h" 
                      domain={[40, 160]} 
                      width={70} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: 14, 
                        border: '1px solid #E2E8F0', 
                        fontSize: 12, 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '10px 14px' 
                      }} 
                    />
                    
                    {/* Landfall Reference Marker Line at +24h */}
                    <ReferenceLine x="+24h" stroke="#DC2626" strokeDasharray="4 4" strokeWidth={2} label={{ value: '🚨 LANDFALL WINDOW (+24h)', position: 'top', fill: '#DC2626', fontSize: 11, fontWeight: 'bold' }} />
                    
                    {/* IMD Category Reference Lines */}
                    <ReferenceLine y={118} stroke="#F97316" strokeDasharray="3 3" label={{ value: 'Very Severe Threshold (118 km/h)', fill: '#EA580C', fontSize: 10 }} />
                    <ReferenceLine y={89} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Severe Cyclone Threshold (89 km/h)', fill: '#D97706', fontSize: 10 }} />

                    {/* Uncertainty 90% Confidence Envelope */}
                    <Area type="monotone" dataKey="upper" stroke="none" fill="#DBEAFE" name="90% Upper Bound" />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#FFFFFF" name="10% Lower Bound" />
                    
                    {/* Primary Prediction Curve */}
                    <Area 
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#003087" 
                      strokeWidth={3.5} 
                      fill="url(#gradBiLSTM)" 
                      dot={{ r: 5, fill: '#FFFFFF', stroke: '#003087', strokeWidth: 2.5 }} 
                      activeDot={{ r: 7, fill: '#003087' }}
                      name="BiLSTM Forecast (km/h)" 
                    />
                  </AreaChart>
                ) : chartMode === 'ensemble' ? (
                  <LineChart data={simulatedIntensityData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" km/h" domain={[40, 160]} width={70} />
                    <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <ReferenceLine x="+24h" stroke="#DC2626" strokeDasharray="4 4" strokeWidth={2} />
                    
                    <Line type="monotone" dataKey="speed" stroke="#003087" strokeWidth={3.5} dot={{ r: 4 }} name="CycloneAI (BiLSTM Ensemble Mean)" />
                    <Line type="monotone" dataKey="controlMember" stroke="#059669" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Control Ensemble Member" />
                    <Line type="monotone" dataKey="highShearScenario" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="High-Shear Scenario" />
                    <Line type="monotone" dataKey="gfsBaseline" stroke="#7C3AED" strokeWidth={2} strokeDasharray="2 2" dot={{ r: 3 }} name="NCEP GFS NWP Baseline" />
                  </LineChart>
                ) : (
                  <AreaChart data={PRESSURE_FORECAST} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradPressureDrop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" hPa" domain={['dataMin - 5', 'dataMax + 5']} width={70} />
                    <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0', fontSize: 12 }} />
                    <ReferenceLine x="+24h" stroke="#DC2626" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Lowest MSLP (955 hPa)', fill: '#DC2626', fontSize: 11 }} />
                    <Area 
                      type="monotone" 
                      dataKey="pressure" 
                      stroke="#DC2626" 
                      strokeWidth={3.5} 
                      fill="url(#gradPressureDrop)" 
                      dot={{ r: 5, fill: '#FFFFFF', stroke: '#DC2626', strokeWidth: 2.5 }} 
                      name="Central MSLP (hPa)" 
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Bottom Chart Legend Guide */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-[#003087] rounded inline-block" /> BiLSTM Projected Trend
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-blue-100 border border-blue-300 rounded-xs inline-block" /> 90% Confidence Spread
                </span>
                <span className="flex items-center gap-1.5 text-red-600 font-bold">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500 inline-block" /> Landfall Target (+24h)
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Step: 6h intervals (0 to 72h)</span>
            </div>

          </div>

          {/* Model Accuracy Benchmark Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Track Error (MAE in km) Benchmark vs Operational NWP</h3>
                <p className="text-xs text-slate-500">Comparing CycloneAI BiLSTM against IMD Official, ECMWF IFS, and NCEP GFS models</p>
              </div>
              <span className="badge badge-green">32% Error Reduction at 24h</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MODEL_BENCHMARK_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="lead" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" km" width={65} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar dataKey="CycloneAI" fill="#003087" radius={[4, 4, 0, 0]} name="CycloneAI (BiLSTM)" />
                  <Bar dataKey="IMD_Official" fill="#94A3B8" radius={[4, 4, 0, 0]} name="IMD Official Benchmark" />
                  <Bar dataKey="ECMWF_IFS" fill="#60A5FA" radius={[4, 4, 0, 0]} name="ECMWF (IFS Global)" />
                  <Bar dataKey="NCEP_GFS" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="NCEP GFS" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: "What-If" Sensitivity Simulator & 72h Trajectory Table (4 Cols) */}
        <div className="xl:col-span-4 space-y-6 flex flex-col">
          
          {/* Interactive "What-If" Atmospheric Simulator Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#002266] text-white rounded-2xl p-5 shadow-xl border border-slate-700 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Atmospheric Sensitivity Simulator</h3>
              </div>
              <button 
                onClick={() => { setSimSst(29.5); setSimShear(12.0); setSimHumidity(85); }}
                className="text-xs text-blue-300 hover:text-white flex items-center gap-1 font-semibold"
                title="Reset simulation parameters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            <p className="text-[11px] text-blue-200/80 leading-relaxed">
              Adjust thermodynamic variables to simulate rapid intensification or weakening scenarios dynamically in real-time.
            </p>

            {/* Sliders */}
            <div className="space-y-3.5 text-xs">
              
              {/* SST Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Sea Surface Temp (SST):</span>
                  <span className="font-mono font-bold text-amber-300">{simSst}°C</span>
                </div>
                <input 
                  type="range" 
                  min="26.0" 
                  max="31.5" 
                  step="0.1" 
                  value={simSst} 
                  onChange={(e) => setSimSst(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>26.0°C (Marginal)</span>
                  <span>31.5°C (Superheated)</span>
                </div>
              </div>

              {/* Vertical Wind Shear Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Vertical Wind Shear (200-850hPa):</span>
                  <span className="font-mono font-bold text-cyan-300">{simShear} knots</span>
                </div>
                <input 
                  type="range" 
                  min="4.0" 
                  max="28.0" 
                  step="0.5" 
                  value={simShear} 
                  onChange={(e) => setSimShear(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>4 kt (Favorable)</span>
                  <span>28 kt (Hostile/Decay)</span>
                </div>
              </div>

              {/* Mid-Level Humidity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-medium">Mid-Tropospheric Humidity (700hPa):</span>
                  <span className="font-mono font-bold text-emerald-300">{simHumidity}%</span>
                </div>
                <input 
                  type="range" 
                  min="45" 
                  max="95" 
                  step="1" 
                  value={simHumidity} 
                  onChange={(e) => setSimHumidity(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

            </div>

            {/* Dynamic Forecast Outcome Box */}
            <div className="bg-white/10 border border-white/15 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-200 block">Simulated Landfall Max Wind</span>
                <span className="text-xl font-black text-white">{peakForecast?.speed} km/h</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getCategoryBadge(peakForecast?.speed).badge}`}>
                {getCategoryBadge(peakForecast?.speed).name}
              </span>
            </div>

          </div>

          {/* 72-Hour Detailed Trajectory Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#003087]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">72-Hour Spatiotemporal Table</h3>
              </div>
              <span className="badge badge-red font-mono">TC-2026-ALPHA</span>
            </div>

            <div className="overflow-x-auto">
              <table className="table text-xs">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Coord</th>
                    <th>Wind</th>
                    <th>Pressure</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {TRACK_TABLE_DATA.map((row, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedTimeStep(idx)}
                      className={`cursor-pointer transition-colors ${
                        idx === 3 
                          ? 'bg-red-50/80 font-bold border-l-4 border-l-red-600' 
                          : selectedTimeStep === idx
                          ? 'bg-blue-50/70 font-semibold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="font-bold text-[#003087]">{row.time}</td>
                      <td className="font-mono text-slate-600 text-[11px]">{row.lat}, {row.lon}</td>
                      <td className={`font-black ${row.wind >= 115 ? 'text-red-600' : 'text-slate-800'}`}>
                        {row.wind}
                      </td>
                      <td className="font-mono text-slate-500 text-[11px]">{row.pressure} hPa</td>
                      <td>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getCategoryBadge(row.wind).badge}`}>
                          {row.stage}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Atmospheric Feature Weights & Importance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#003087]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">Atmospheric Feature Weights</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Attention Head-4</span>
            </div>

            <div className="space-y-3">
              {FEATURE_IMPORTANCE.map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{feat.feature}</span>
                      <span className="block text-[10px] text-slate-400">{feat.sub}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 font-mono">{feat.weight}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${feat.weight}%`, backgroundColor: feat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Prediction;
