import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar, { applyGlobalFontScale } from '../components/PublicNavbar';
import IOSGlassCard from '../components/IOSGlassCard';
import { useLiveClock } from '../utils/liveDateTime';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, BarChart, Bar
} from 'recharts';
import {
  ArrowLeft, RefreshCw, Clock, Database, Activity, AlertTriangle,
  TrendingUp, TrendingDown, Thermometer, Gauge, Droplets, MapPin,
  Eye, BarChart2, Layers, ChevronRight, Zap, Sun, Waves, Wind,
  Globe, ArrowUpRight, Info
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ── Demo Data ──────────────────────────────────────────────────────────────────

const NINO34_TREND = [
  { month: 'Jan 25', index: -1.2 }, { month: 'Feb 25', index: -1.0 }, { month: 'Mar 25', index: -0.8 },
  { month: 'Apr 25', index: -0.6 }, { month: 'May 25', index: -0.4 }, { month: 'Jun 25', index: -0.2 },
  { month: 'Jul 25', index: 0.0 }, { month: 'Aug 25', index: 0.1 }, { month: 'Sep 25', index: 0.2 },
  { month: 'Oct 25', index: 0.3 }, { month: 'Nov 25', index: 0.2 }, { month: 'Dec 25', index: 0.1 },
  { month: 'Jan 26', index: 0.0 }, { month: 'Feb 26', index: -0.1 }, { month: 'Mar 26', index: -0.2 },
  { month: 'Apr 26', index: -0.3 }, { month: 'May 26', index: -0.3 }, { month: 'Jun 26', index: -0.2 },
  { month: 'Jul 26', index: -0.1 }, { month: 'Aug 26', index: 0.0 }, { month: 'Sep 26', index: 0.1 },
];

const IOD_TREND = [
  { month: 'Jan 25', index: -0.8 }, { month: 'Feb 25', index: -0.6 }, { month: 'Mar 25', index: -0.3 },
  { month: 'Apr 25', index: 0.0 }, { month: 'May 25', index: 0.2 }, { month: 'Jun 25', index: 0.15 },
  { month: 'Jul 25', index: 0.05 }, { month: 'Aug 25', index: -0.1 }, { month: 'Sep 25', index: -0.2 },
  { month: 'Oct 25', index: 0.1 }, { month: 'Nov 25', index: 0.3 }, { month: 'Dec 25', index: 0.2 },
  { month: 'Jan 26', index: 0.1 }, { month: 'Feb 26', index: 0.08 }, { month: 'Mar 26', index: 0.05 },
  { month: 'Apr 26', index: 0.1 }, { month: 'May 26', index: 0.12 }, { month: 'Jun 26', index: 0.1 },
  { month: 'Jul 26', index: 0.08 }, { month: 'Aug 26', index: 0.11 }, { month: 'Sep 26', index: 0.12 },
];

const SST_POINTS = [
  { lat: 20.0, lon: 88.5, sst: 30.8, anomaly: +1.2, region: 'North BoB' },
  { lat: 17.5, lon: 86.0, sst: 30.5, anomaly: +0.9, region: 'Central BoB' },
  { lat: 15.0, lon: 84.5, sst: 30.2, anomaly: +0.7, region: 'South BoB' },
  { lat: 12.5, lon: 82.0, sst: 29.8, anomaly: +0.4, region: 'SE BoB' },
  { lat: 10.0, lon: 79.0, sst: 29.5, anomaly: +0.3, region: 'Gulf of Mannar' },
  { lat: 18.0, lon: 72.0, sst: 28.8, anomaly: +0.1, region: 'NE Arabian Sea' },
  { lat: 14.0, lon: 68.0, sst: 27.9, anomaly: -0.3, region: 'West Arabian Sea' },
  { lat: 22.0, lon: 65.0, sst: 27.2, anomaly: -0.6, region: 'NW Arabian Sea' },
  { lat: 8.0, lon: 76.0, sst: 29.1, anomaly: +0.2, region: 'Lakshadweep' },
  { lat: 6.0, lon: 92.0, sst: 29.4, anomaly: +0.5, region: 'Andaman Sea' },
];

const TELECONNECTION_TABLE = [
  { enso: 'El Niño', iod: 'Positive', cycloneActivity: '↓ Below Normal (−30%)', indiaRainfall: 'Deficit (−15 to −25%)', note: 'Suppressed genesis over BoB' },
  { enso: 'El Niño', iod: 'Negative', cycloneActivity: '↓↓ Well Below Normal (−50%)', indiaRainfall: 'Very Deficient (−25 to −40%)', note: 'Strongly suppressed conditions' },
  { enso: 'La Niña', iod: 'Positive', cycloneActivity: '↑↑ Well Above Normal (+40%)', indiaRainfall: 'Excess (+20 to +30%)', note: 'Most active cyclone seasons on record' },
  { enso: 'La Niña', iod: 'Negative', cycloneActivity: '↑ Above Normal (+20%)', indiaRainfall: 'Excess (+10 to +20%)', note: '2024 pattern: Fengal & Dana' },
  { enso: 'ENSO-Neutral', iod: 'Positive', cycloneActivity: '~ Normal (+10%)', indiaRainfall: 'Near Normal to Excess', note: 'Moderate enhancement' },
  { enso: 'ENSO-Neutral', iod: 'Neutral', cycloneActivity: '~ Normal (±5%)', indiaRainfall: 'Near Normal', note: '2026 current regime ★', current: true },
  { enso: 'ENSO-Neutral', iod: 'Negative', cycloneActivity: '↓ Below Normal (−10%)', indiaRainfall: 'Near Normal to Deficit', note: 'Moderate suppression' },
];

const SEASONAL_OUTLOOK = [
  { month: 'Sep 26', anomaly: +0.8, cyclone: 2, normal: 1.5, confidence: 'Medium–High' },
  { month: 'Oct 26', anomaly: +1.0, cyclone: 3, normal: 2.2, confidence: 'Medium' },
  { month: 'Nov 26', anomaly: +0.6, cyclone: 2, normal: 2.0, confidence: 'Low–Medium' },
  { month: 'Dec 26', anomaly: -0.2, cyclone: 1, normal: 0.8, confidence: 'Low' },
];

const OCEAN_HEAT = [
  { depth: '0–25m', temp: 30.5, anomaly: +1.2 },
  { depth: '25–50m', temp: 29.8, anomaly: +1.0 },
  { depth: '50–75m', temp: 28.4, anomaly: +0.8 },
  { depth: '75–100m', temp: 26.1, anomaly: +0.5 },
  { depth: '100–150m', temp: 22.8, anomaly: +0.2 },
  { depth: '150–200m', temp: 18.4, anomaly: -0.1 },
];

const AI_INSIGHTS = [
  { title: 'ENSO-Neutral Regime Analysis', detail: 'The current ENSO-Neutral state (Niño 3.4 = +0.12°C) with a developing La Niña tendency (POAMA ensemble: 60% probability by Dec 2026) is statistically associated with near-to-above normal tropical cyclone activity over the Bay of Bengal during the Oct–Nov peak season.', confidence: 85 },
  { title: 'IOD Impact on Current Season', detail: 'The near-neutral IOD (DMI = +0.12°C) has minimal direct teleconnection impact, but the anomalously warm SSTs (+0.8°C above climatology) in the northern Bay of Bengal are the primary driver of enhanced cyclone potential for the current Sep–Oct window.', confidence: 89 },
  { title: '26°C Isotherm Depth & OHC', detail: 'The 26°C isotherm in the north Bay of Bengal has deepened to 85–95m (normal: 70–75m), indicating elevated Ocean Heat Content (~98 kJ/cm²). This increases the potential for rapid intensification (RI; ≥35 kts/24h) of any organized system in this region.', confidence: 92 },
];

const DATA_SOURCES = [
  { name: 'NOAA CPC', desc: 'ENSO Monitoring & Forecasts', icon: '🌐' },
  { name: 'IITM Pune', desc: 'Indian Ocean Dipole Research', icon: '🔬' },
  { name: 'INCOIS', desc: 'Indian Ocean SST & OHC', icon: '🌊' },
  { name: 'ECMWF SEAS5', desc: 'Seasonal Climate Forecast', icon: '🖥️' },
  { name: 'JAMSTEC SINTEX', desc: 'IOD & Coupled Ocean Model', icon: '🗺️' },
];

const DemoBadge = ({ type = 'demo', label = 'DEMO BENCHMARK' }) => (
  <DataTypeBadge type={type} label={label} />
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const SSTMarker = ({ point }) => {
  const anomColor = point.anomaly > 0.8 ? '#EF4444' : point.anomaly > 0.4 ? '#F97316' : point.anomaly > 0 ? '#F59E0B' : point.anomaly > -0.3 ? '#10B981' : '#0284C7';
  const radius = Math.max(8, Math.min(20, Math.abs(point.anomaly) * 14 + 6));
  return (
    <CircleMarker center={[point.lat, point.lon]} radius={radius} pathOptions={{ color: anomColor, fillColor: anomColor, fillOpacity: 0.55, weight: 1.5 }}>
      <Popup>
        <div className="text-xs font-bold">{point.region}</div>
        <div className="text-xs">SST: <strong>{point.sst}°C</strong></div>
        <div className="text-xs" style={{ color: anomColor }}>Anomaly: {point.anomaly > 0 ? '+' : ''}{point.anomaly}°C</div>
      </Popup>
    </CircleMarker>
  );
};

export default function ClimateOceanAnomalies() {
  const navigate = useNavigate();
  const liveClock = useLiveClock(1000);

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try { return parseInt(localStorage.getItem('vayu_font_offset') ?? '0', 10); } catch { return 0; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('enso');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  const currentNino = NINO34_TREND[NINO34_TREND.length - 1].index;
  const currentIOD = IOD_TREND[IOD_TREND.length - 1].index;
  const avgSST = (SST_POINTS.reduce((a, b) => a + b.sst, 0) / SST_POINTS.length).toFixed(1);
  const avgAnom = (SST_POINTS.reduce((a, b) => a + b.anomaly, 0) / SST_POINTS.length).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col">
      <PublicNavbar
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={(v) => { setFontSizeOffset(v); applyGlobalFontScale(v); }}
        isHindi={false}
        setIsHindi={() => {}}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <DataTypeBadge type="live" label="NOAA CPC & INCOIS SST" />
                <DataTypeBadge type="ai" label="SEAS5 CLIMATE MODEL" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-slate-950 dark:text-white">Climate &amp; Ocean Anomalies</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ENSO, IOD, sea surface temperature anomalies and their influence on tropical cyclogenesis</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <LastUpdatedBadge timestamp={liveClock.observationStr} source="NOAA CPC & INCOIS" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <>
            {/* ── Key Indicator Cards ──────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* ENSO */}
              <IOSGlassCard className="p-5 rounded-2xl border border-rose-300/40 dark:border-rose-700/30 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-rose-500/10 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">ENSO Status</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-700/40 font-bold">ENSO-NEUTRAL</span>
                  </div>
                  <div className="text-3xl font-heading font-black text-rose-600 dark:text-rose-400">{currentNino > 0 ? '+' : ''}{currentNino.toFixed(2)}°C</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Niño 3.4 Index</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Threshold: &gt;+0.5°C = El Niño | &lt;−0.5°C = La Niña</div>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Seasonal Outlook (CPC/IRI Consensus)</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">La Niña possible by Nov–Dec 2026 (60% prob.)</div>
                  </div>
                  <div className="mt-2 text-[10px] font-medium text-rose-600 dark:text-rose-400">
                    ↑ Cyclone impact: Near-normal to slightly above-normal activity
                  </div>
                </div>
              </IOSGlassCard>

              {/* IOD */}
              <IOSGlassCard className="p-5 rounded-2xl border border-purple-300/40 dark:border-purple-700/30 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">IOD Status</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">NEUTRAL</span>
                  </div>
                  <div className="text-3xl font-heading font-black text-purple-600 dark:text-purple-400">+{currentIOD.toFixed(2)}°C</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Dipole Mode Index (DMI)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Threshold: &gt;+0.4°C = Positive | &lt;−0.4°C = Negative</div>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">West BoB SSTA vs East BoB SSTA</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200">WEIO: +0.32°C | EEIO: +0.20°C | DMI: +0.12°C</div>
                  </div>
                  <div className="mt-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    → Minimal direct cyclone modulation in current neutral phase
                  </div>
                </div>
              </IOSGlassCard>

              {/* SST Anomaly */}
              <IOSGlassCard className="p-5 rounded-2xl border border-red-300/40 dark:border-red-700/30 relative overflow-hidden">
                <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-red-500/10 blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">SST Anomaly</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300/40 dark:border-red-700/40 font-bold">WARM</span>
                  </div>
                  <div className="text-3xl font-heading font-black text-red-600 dark:text-red-400">{avgSST}°C</div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1">Avg. SST — Indian Ocean</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Anomaly: +{avgAnom}°C above 1991–2020 climatology</div>
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">Peak SST — North Bay of Bengal</div>
                    <div className="text-xs font-bold text-red-600 dark:text-red-400">30.8°C (+1.2°C above normal)</div>
                  </div>
                  <div className="mt-2 text-[10px] font-medium text-red-600 dark:text-red-400">
                    ↑ High cyclone potential — well above 26°C genesis threshold
                  </div>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── ENSO/IOD Trend Charts + SST Map ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Charts */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">ENSO &amp; IOD Index Trends (21 Months)</h2>
                  <DataTypeBadge type="live" label="NOAA Monthly Observations" />
                </div>
                <IOSGlassCard className="p-5 rounded-2xl">
                  <div className="flex gap-2 mb-4">
                    {[
                      { id: 'enso', label: 'Niño 3.4 (ENSO)', color: 'rose' },
                      { id: 'iod', label: 'DMI (IOD)', color: 'purple' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveChart(tab.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${activeChart === tab.id ? `bg-${tab.color}-600 text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        style={activeChart === tab.id ? { backgroundColor: tab.color === 'rose' ? '#E11D48' : '#9333EA' } : {}}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={activeChart === 'enso' ? NINO34_TREND : IOD_TREND}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="warmGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="coolGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#94a3b8' }} interval={3} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} unit="°C" />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={activeChart === 'enso' ? 0.5 : 0.4} stroke="#EF4444" strokeDasharray="4 2" label={{ value: activeChart === 'enso' ? 'El Niño' : '+IOD', fontSize: 9, fill: '#EF4444' }} />
                        <ReferenceLine y={activeChart === 'enso' ? -0.5 : -0.4} stroke="#0284C7" strokeDasharray="4 2" label={{ value: activeChart === 'enso' ? 'La Niña' : '−IOD', fontSize: 9, fill: '#0284C7' }} />
                        <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
                        <Area
                          type="monotone"
                          dataKey="index"
                          name={activeChart === 'enso' ? 'Niño 3.4 Index' : 'DMI'}
                          stroke={activeChart === 'enso' ? '#E11D48' : '#9333EA'}
                          fill={`url(#${activeChart === 'enso' ? 'warmGrad' : 'coolGrad'})`}
                          strokeWidth={2.5}
                          unit="°C"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                    {activeChart === 'enso'
                      ? 'Niño 3.4 region (5°N–5°S, 170–120°W) 3-month running mean SST anomaly. Data: NOAA CPC.'
                      : 'Dipole Mode Index (WEIO SST anomaly minus EEIO SST anomaly). Data: NOAA/JAMSTEC.'}
                  </p>
                </IOSGlassCard>
              </div>

              {/* SST Map */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">SST Anomaly Map</h2>
                  <DataTypeBadge type="live" label="INCOIS Buoy & Satellite SST" />
                </div>
                <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                  <div className="h-72 sm:h-80">
                    <MapContainer center={[14, 80]} zoom={4} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                      {SST_POINTS.map((pt, i) => <SSTMarker key={i} point={pt} />)}
                    </MapContainer>
                  </div>
                  <div className="p-2.5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">SST Anomaly Scale:</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> +1.0°C</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> +0.5°C</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> +0.2°C</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> ~Normal</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> −0.3°C</span>
                  </div>
                </IOSGlassCard>
              </div>
            </div>

            {/* ── Ocean Heat Content ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Waves className="w-4 h-4 text-rose-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Ocean Heat Content Profile</h2>
                  <DataTypeBadge type="live" label="INCOIS Argo Float Grid" />
                </div>
                <IOSGlassCard className="p-5 rounded-2xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Depth-integrated temperature &amp; anomaly — North Bay of Bengal (15–20°N, 85–92°E)</p>
                  <div className="space-y-3">
                    {OCEAN_HEAT.map((layer, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 w-24 shrink-0 font-mono">{layer.depth}</span>
                        <div className="flex-1 relative h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg transition-all duration-700"
                            style={{
                              width: `${(layer.temp / 32) * 100}%`,
                              background: layer.temp > 28 ? '#EF4444' : layer.temp > 24 ? '#F97316' : layer.temp > 20 ? '#F59E0B' : '#0284C7'
                            }}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-white">{layer.temp}°C</span>
                        </div>
                        <span className={`text-[10px] font-bold w-16 shrink-0 text-right ${layer.anomaly > 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {layer.anomaly > 0 ? '+' : ''}{layer.anomaly}°C
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-300/40 dark:border-rose-700/40">
                    <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-0.5">OHC Summary</div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Total OHC: <strong>98 kJ/cm²</strong> (above 26°C isotherm). The 26°C isotherm depth is at <strong>87m</strong> (normal: 72m), indicating elevated energy reservoir that can sustain or rapidly intensify any passing tropical system.
                    </p>
                  </div>
                </IOSGlassCard>
              </div>

              {/* Seasonal Outlook */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Seasonal Cyclone Outlook</h2>
                  <DataTypeBadge type="ai" label="Probabilistic AI Ensemble" />
                </div>
                <IOSGlassCard className="p-5 rounded-2xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Projected cyclone count &amp; SST anomaly — Oct–Dec 2026 (probabilistic, not deterministic)</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SEASONAL_OUTLOOK} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="normal" name="Climatological Normal" fill="#CBD5E1" radius={[3,3,0,0]} />
                        <Bar dataKey="cyclone" name="Forecast Count" fill="#E11D48" radius={[3,3,0,0]} opacity={0.8} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {SEASONAL_OUTLOOK.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{s.month}</span>
                        <span className={`font-bold ${s.cyclone > s.normal ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{s.cyclone} systems</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">SST: +{s.anomaly}°C</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.confidence.includes('High') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : s.confidence.includes('Medium') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          {s.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </IOSGlassCard>
              </div>
            </div>

            {/* ── Teleconnection Impact Matrix ──────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-rose-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">ENSO–IOD Teleconnection Impact Matrix</h2>
                <DataTypeBadge type="historical" label="50-Yr Climatology Archive" />
              </div>
              <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-rose-500/10 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-900/60">
                        {['ENSO Phase', 'IOD Phase', 'Bay Cyclone Activity', 'India Rainfall', 'Key Note'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TELECONNECTION_TABLE.map((row, idx) => (
                        <tr key={idx} className={`border-b border-slate-100 dark:border-slate-800/60 transition-colors ${row.current ? 'bg-rose-50/60 dark:bg-rose-950/20' : 'hover:bg-rose-50/30 dark:hover:bg-rose-950/10'}`}>
                          <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{row.enso}</td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{row.iod}</td>
                          <td className={`px-4 py-2.5 font-bold ${row.cycloneActivity.includes('↑↑') ? 'text-red-600 dark:text-red-400' : row.cycloneActivity.includes('↑') ? 'text-orange-600 dark:text-orange-400' : row.cycloneActivity.includes('↓↓') ? 'text-blue-600 dark:text-blue-400' : row.cycloneActivity.includes('↓') ? 'text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {row.cycloneActivity}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{row.indiaRainfall}</td>
                          <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                            {row.note}
                            {row.current && <span className="ml-1.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500 text-white">CURRENT 2026</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── AI Insights ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">AI</span>
                </div>
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">AI Climate Interpretation</h2>
                <DataTypeBadge type="ai" label="AI Teleconnection Reasoning" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_INSIGHTS.map((ins, i) => (
                  <IOSGlassCard key={i} className="p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">{ins.title}</h3>
                      <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">{ins.confidence}%</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ins.detail}</p>
                  </IOSGlassCard>
                ))}
              </div>
            </div>

            {/* ── Data Sources ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-slate-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Data Sources</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {DATA_SOURCES.map((src, i) => (
                  <IOSGlassCard key={i} className="p-3.5 rounded-xl text-center">
                    <div className="text-2xl mb-1.5">{src.icon}</div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white">{src.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{src.desc}</div>
                  </IOSGlassCard>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center">
                ⚠️ All data shown is <strong>demonstration / sample data</strong> for the SIH 2026 project. Not for operational use.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
