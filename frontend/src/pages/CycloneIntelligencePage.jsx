import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar, { applyGlobalFontScale } from '../components/PublicNavbar';
import IOSGlassCard from '../components/IOSGlassCard';
import InfoTooltip from '../components/InfoTooltip';
import { useLiveClock } from '../utils/liveDateTime';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, BarChart, Bar
} from 'recharts';
import {
  Wind, ArrowLeft, RefreshCw, Clock, Database, Activity, AlertTriangle,
  CheckCircle2, TrendingUp, Thermometer, Gauge, Droplets, MapPin,
  Eye, Satellite, Navigation2, Zap, ShieldAlert, Bell, Target,
  Layers, ChevronRight, ArrowRight, BarChart2, Radio
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ── Demo Cyclone Track Data ─────────────────────────────────────────────────
const INVEST_92B = {
  name: 'Invest 92B',
  lat: 13.5,
  lon: 88.5,
  wind: 42,
  gusts: 55,
  pressure: 1004,
  movement: 'NNW',
  speed: 12,
  sst: 30.5,
  shear: 8,
  category: 'Low Pressure Area',
  dvorakCI: 'T1.5 / 35 kts',
};

const PAST_TRACK = [
  [11.2, 90.5], [11.8, 90.1], [12.4, 89.7], [12.9, 89.3], [13.5, 88.5],
];

const FORECAST_TRACK = [
  [13.5, 88.5], [14.2, 88.0], [15.0, 87.4], [15.9, 86.5], [16.8, 85.4], [17.8, 84.0],
];

const INTENSITY_TIMELINE = [
  { time: '−48h', wind: 28, pressure: 1008, label: 'Depression forming' },
  { time: '−36h', wind: 34, pressure: 1006, label: 'Deep Depression' },
  { time: '−24h', wind: 38, pressure: 1005, label: 'Cyclonic Storm' },
  { time: '−12h', wind: 40, pressure: 1004, label: 'Track forecast' },
  { time: 'Now', wind: 42, pressure: 1004, label: 'Current fix' },
  { time: '+12h', wind: 48, pressure: 1002, label: 'Intensification' },
  { time: '+24h', wind: 58, pressure: 999, label: 'Severe CS' },
  { time: '+36h', wind: 72, pressure: 994, label: 'Very Severe CS' },
  { time: '+48h', wind: 88, pressure: 988, label: 'Near landfall' },
  { time: '+60h', wind: 78, pressure: 992, label: 'Weakening' },
  { time: '+72h', wind: 62, pressure: 996, label: 'Post-landfall' },
];

const GENESIS_PROBABILITY = [
  { window: '24h', probability: 35, color: '#F59E0B' },
  { window: '48h', probability: 68, color: '#F97316' },
  { window: '72h', probability: 82, color: '#EF4444' },
];

const RISK_MATRIX = [
  { district: 'Srikakulam, AP', category: 'High', surge: '2–3 m', wind: '90–110 km/h', rain: '200–300 mm', evac: 'Recommended' },
  { district: 'Vizianagaram, AP', category: 'High', surge: '2–4 m', wind: '80–100 km/h', rain: '150–250 mm', evac: 'Advisory' },
  { district: 'Visakhapatnam, AP', category: 'Very High', surge: '3–5 m', wind: '100–120 km/h', rain: '250–350 mm', evac: 'Mandatory' },
  { district: 'Kendrapara, OD', category: 'Moderate', surge: '1–2 m', wind: '60–80 km/h', rain: '100–150 mm', evac: 'Watch' },
  { district: 'Jagatsinghpur, OD', category: 'Moderate', surge: '1–2 m', wind: '55–75 km/h', rain: '80–120 mm', evac: 'Watch' },
  { district: 'Ganjam, OD', category: 'Low–Moderate', surge: '<1 m', wind: '45–65 km/h', rain: '60–100 mm', evac: 'Standby' },
];

const SATELLITE_LAYERS = [
  { id: 'ir', label: 'IR (Infrared)', desc: 'INSAT-3DR Thermal IR, 10.8 µm. Cold cloud tops indicate deep convection. Cloud top temperature < −60°C observed in core convection around the circulation center.', temp: '−62°C', coverage: '85%' },
  { id: 'wv', label: 'WV (Water Vapour)', desc: '6.8 µm Water Vapour channel showing upper tropospheric moisture distribution. Dry slot visible to the west indicating upper-level divergence and outflow enhancement.', temp: '—', coverage: '92%' },
  { id: 'mw', label: 'Microwave', desc: 'SSMIS 91 GHz Microwave imagery showing precipitation structure. Banding features and a warm core signature are visible, consistent with a strengthening tropical cyclone.', temp: '—', coverage: '78%' },
  { id: 'vis', label: 'VIS (Visible)', desc: 'Daytime visible 0.65 µm channel showing cloud morphology. Curved banding pattern is consistent with Dvorak T-number T1.5, indicating tropical storm intensity.', temp: '—', coverage: '100%' },
];

const ACTIVE_WARNINGS = [
  { level: 'orange', title: 'Cyclone Watch: North Andhra Pradesh Coast', desc: 'A Cyclone Watch has been issued for north Andhra Pradesh coast from Kalingapatnam to Machilipatnam. Winds of 90–110 km/h expected.', validUntil: '07 Sep 2026, 05:30 IST', agency: 'IMD Hyderabad / RSMC Delhi' },
  { level: 'yellow', title: 'Heavy to Very Heavy Rainfall Alert', desc: 'Isolated heavy to very heavy rainfall very likely over Srikakulam, Vizianagaram, Visakhapatnam districts in the next 24–48 hours.', validUntil: '07 Sep 2026, 08:30 IST', agency: 'IMD Hyderabad' },
  { level: 'yellow', title: 'Fishermen Advisory — Do Not Venture', desc: 'Squally winds (45–55 km/h) with rough to very rough seas. All fishermen are advised not to venture into north Bay of Bengal and along Andhra Pradesh coast.', validUntil: '08 Sep 2026, 05:30 IST', agency: 'IMD / Coast Guard' },
];

const HISTORICAL_ANALOGUES = [
  { name: 'Cyclone Titli', year: 2018, peak: 'Extremely Severe (175 km/h)', track: 'NW → Andhra–Odisha Border', similarity: 92 },
  { name: 'Cyclone Phailin', year: 2013, peak: 'Extremely Severe (215 km/h)', track: 'NNW → Odisha Coast (Gopalpur)', similarity: 78 },
  { name: 'Cyclone Hudhud', year: 2014, peak: 'Extremely Severe (195 km/h)', track: 'NNW → Visakhapatnam', similarity: 85 },
  { name: 'Cyclone Fani', year: 2019, peak: 'Extremely Severe (240 km/h)', track: 'NNW → Puri, Odisha', similarity: 71 },
];

const AI_PREDICTIONS = [
  { title: '48h Intensification Forecast', value: '68%', detail: 'ViT CNN model ensemble indicates a 68% probability of intensification to Severe Cyclonic Storm category within 48 hours, given the current SST (30.5°C), low shear (8 kts), and high OHC (98 kJ/cm²).', model: 'CycloneVision ViT-L v2.1', conf: 87 },
  { title: 'Track Consensus (72h)', value: 'NNW at 14 km/h', detail: 'Track consensus from ECMWF, GFS, and IMD NWP models shows 92% agreement on NNW movement. The most likely landfall location is near Visakhapatnam–Srikakulam corridor with a ±120 km uncertainty radius.', model: 'VayuSat Track Ensemble', conf: 91 },
  { title: 'Landfall Intensity Estimate', value: '90–110 km/h', detail: 'Intensity at landfall is estimated at 90–110 km/h sustained winds (Severe Cyclonic Storm category) unless further intensification occurs over the 30.5°C SST region in the next 36h.', model: 'Statistical-Dynamical SHIPS', conf: 79 },
];

const DATA_SOURCES = [
  { name: 'INSAT-3DR', desc: 'IR/WV Satellite Imagery', icon: '🛰️' },
  { name: 'Oceansat-3', desc: 'Scatterometer & Ocean Color', icon: '🌊' },
  { name: 'IMD Doppler Radar', desc: 'Coastal DWR Network', icon: '📡' },
  { name: 'ECMWF / GFS', desc: 'Numerical Track Models', icon: '🖥️' },
  { name: 'INCOIS GODAS', desc: 'Ocean Data Assimilation', icon: '🌡️' },
];

const DemoBadge = () => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-400">
    🔬 DEMO DATA — Not Live
  </span>
);

const ALERT_CONFIG = {
  red: { border: 'border-red-300 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600 dark:text-red-400', badge: 'bg-red-500 text-white', label: 'RED ALERT' },
  orange: { border: 'border-orange-300 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500 text-white', label: 'ORANGE ALERT' },
  yellow: { border: 'border-yellow-300 dark:border-yellow-800', bg: 'bg-yellow-50 dark:bg-yellow-950/30', icon: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-500 text-slate-900', label: 'YELLOW ADVISORY' },
};

const RISK_COLORS = {
  'Very High': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800',
  'High': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800',
  'Moderate': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800',
  'Low–Moderate': 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-800',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-lg">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}{p.unit || ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CycloneIntelligencePage() {
  const navigate = useNavigate();
  const liveClock = useLiveClock(1000);

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try { return parseInt(localStorage.getItem('vayu_font_offset') ?? '0', 10); } catch { return 0; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSatLayer, setActiveSatLayer] = useState('ir');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const activeSat = SATELLITE_LAYERS.find(l => l.id === activeSatLayer);

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
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">VORTEX INTELLIGENCE</span>
                <DemoBadge />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-slate-950 dark:text-white">Cyclone Intelligence</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Multi-spectral satellite tracks, storm surge hydrodynamics &amp; AI genesis prediction</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" /></span>
              <span className="font-bold">Active Disturbance</span>
            </span>
            <Clock className="w-3.5 h-3.5 ml-1" />
            <span>{liveClock.observationStr}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <>
            {/* ── Active System Telemetry ──────────────────────────────── */}
            <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-900/15 via-teal-900/10 to-sky-900/15 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/40 backdrop-blur-2xl border border-emerald-400/30 dark:border-emerald-500/20">
              <div className="pointer-events-none absolute -top-16 -left-12 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -right-12 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active System — Bay of Bengal</span>
                    <h2 className="text-2xl font-heading font-black text-slate-900 dark:text-white">{INVEST_92B.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{INVEST_92B.category} | 13.5°N, 88.5°E | Moving {INVEST_92B.movement} at {INVEST_92B.speed} km/h</p>
                  </div>
                  <button
                    onClick={() => navigate('/ai-cyclone')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <span>Open AI Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Sustained Wind', term: 'sustained_wind', value: `${INVEST_92B.wind} km/h`, sub: `Gusts ${INVEST_92B.gusts} km/h`, color: 'text-amber-600 dark:text-amber-400' },
                    { label: 'Central Pressure', term: 'central_pressure', value: `${INVEST_92B.pressure} hPa`, sub: 'Barometric Fix', color: 'text-sky-600 dark:text-sky-400' },
                    { label: 'SST', term: 'sst', value: `${INVEST_92B.sst}°C`, sub: '+0.8°C anomaly', color: 'text-red-500 dark:text-red-400' },
                    { label: 'Wind Shear', term: 'shear', value: `${INVEST_92B.shear} kts`, sub: 'Low — favorable', color: 'text-emerald-600 dark:text-emerald-400' },
                  ].map((m, i) => (
                    <IOSGlassCard key={i} className="p-3.5 rounded-2xl">
                      <div className={`text-xl sm:text-2xl font-heading font-black ${m.color}`}>{m.value}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{m.label}</span>
                        <InfoTooltip term={m.term} />
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{m.sub}</div>
                    </IOSGlassCard>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Track Map + Satellite Analysis ───────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Track Map */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation2 className="w-4 h-4 text-emerald-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Cyclone Track &amp; Forecast Cone</h2>
                  <DemoBadge />
                </div>
                <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                  <div className="h-80 sm:h-96">
                    <MapContainer center={[14.5, 87.5]} zoom={5} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                      {/* Past Track */}
                      <Polyline positions={PAST_TRACK} pathOptions={{ color: '#6B7280', weight: 2.5, dashArray: '6 3' }} />
                      {/* Forecast Track */}
                      <Polyline positions={FORECAST_TRACK} pathOptions={{ color: '#10B981', weight: 3, dashArray: '0' }} />
                      {/* Current position */}
                      <CircleMarker center={[13.5, 88.5]} radius={12} pathOptions={{ color: '#EF4444', fillColor: '#EF4444', fillOpacity: 0.7, weight: 2 }}>
                        <Popup><div className="text-xs font-bold">Invest 92B — Current</div><div className="text-xs">42 km/h | 1004 hPa</div></Popup>
                      </CircleMarker>
                      {/* Track points */}
                      {PAST_TRACK.slice(0,-1).map((pt, i) => (
                        <CircleMarker key={i} center={pt} radius={5} pathOptions={{ color: '#6B7280', fillColor: '#6B7280', fillOpacity: 0.5, weight: 1 }} />
                      ))}
                      {/* Forecast cone (uncertainty circle at last point) */}
                      <Circle center={[17.8, 84.0]} radius={120000} pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.08, weight: 1.5, dashArray: '5 3' }} />
                      {/* Likely landfall */}
                      <CircleMarker center={[17.8, 84.0]} radius={9} pathOptions={{ color: '#F97316', fillColor: '#F97316', fillOpacity: 0.7, weight: 2 }}>
                        <Popup><div className="text-xs font-bold">Projected Landfall</div><div className="text-xs">~72h | Visakhapatnam–Srikakulam corridor</div></Popup>
                      </CircleMarker>
                    </MapContainer>
                  </div>
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4 text-[10px] flex-wrap">
                    <span className="flex items-center gap-1.5"><span className="inline-block w-6 border border-dashed border-slate-400" /> Past Track</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-6 border-2 border-emerald-500" /> 72h Forecast Track</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Current Position</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Projected Landfall</span>
                  </div>
                </IOSGlassCard>
              </div>

              {/* Satellite Analysis */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Satellite className="w-4 h-4 text-emerald-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Satellite Analysis</h2>
                  <DemoBadge />
                </div>
                <IOSGlassCard className="p-4 rounded-2xl h-80 sm:h-96 flex flex-col">
                  {/* Layer Tabs */}
                  <div className="flex gap-1.5 mb-4 flex-wrap">
                    {SATELLITE_LAYERS.map(layer => (
                      <button
                        key={layer.id}
                        onClick={() => setActiveSatLayer(layer.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${activeSatLayer === layer.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400'}`}
                      >
                        {layer.label}
                      </button>
                    ))}
                  </div>
                  {/* Satellite Image Placeholder */}
                  <div className="flex-1 rounded-xl overflow-hidden relative bg-slate-900 dark:bg-black flex items-center justify-center">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Satellite className="w-12 h-12 opacity-30" />
                      <span className="text-[10px] text-center px-4">
                        {activeSat?.label} — Live imagery integration pending<br />
                        <span className="text-[9px] opacity-60">Source: ISRO MOSDAC / EUMETSAT</span>
                      </span>
                    </div>
                    <span className="absolute top-2 left-2 text-[9px] bg-black/70 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                      {activeSat?.label}
                    </span>
                    {activeSat?.temp !== '—' && (
                      <span className="absolute top-2 right-2 text-[9px] bg-black/70 text-sky-400 px-2 py-0.5 rounded-full font-mono">
                        Top Temp: {activeSat?.temp}
                      </span>
                    )}
                  </div>
                  {/* Dvorak + Analysis */}
                  <div className="mt-3 space-y-2">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-300/40 dark:border-emerald-700/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Dvorak Intensity</span>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-300">{INVEST_92B.dvorakCI}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">{activeSat?.desc}</p>
                    </div>
                    {activeSat?.coverage && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400">Orbital coverage:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{activeSat.coverage}</span>
                      </div>
                    )}
                  </div>
                </IOSGlassCard>
              </div>
            </div>

            {/* ── Intensity Timeline Chart ─────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-emerald-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Intensity Timeline (−48h to +72h)</h2>
                <DemoBadge />
              </div>
              <IOSGlassCard className="p-5 rounded-2xl">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">Wind speed (km/h) and central pressure (hPa) — actual &amp; AI ensemble forecast</div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={INTENSITY_TIMELINE} margin={{ top: 5, right: 15, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis yAxisId="wind" tick={{ fontSize: 9, fill: '#94a3b8' }} unit=" km/h" domain={[20, 120]} />
                      <YAxis yAxisId="pressure" orientation="right" tick={{ fontSize: 9, fill: '#94a3b8' }} unit=" hPa" domain={[980, 1015]} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine yAxisId="wind" x="Now" stroke="#EF4444" strokeWidth={2} label={{ value: 'NOW', fontSize: 9, fill: '#EF4444' }} />
                      <ReferenceLine yAxisId="wind" x="+48h" stroke="#F97316" strokeDasharray="4 2" label={{ value: 'Landfall', fontSize: 9, fill: '#F97316' }} />
                      <Area yAxisId="wind" type="monotone" dataKey="wind" name="Wind Speed" stroke="#10B981" fill="url(#windGrad)" strokeWidth={2.5} unit=" km/h" />
                      <Line yAxisId="pressure" type="monotone" dataKey="pressure" name="Pressure" stroke="#0284C7" strokeWidth={1.5} dot={false} unit=" hPa" strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-500 inline-block" /> Wind Speed (km/h)</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-sky-500 inline-block" /> Central Pressure (hPa)</span>
                  <span className="text-slate-400 dark:text-slate-500">← Observed | Forecast →</span>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── Genesis Probability + AI Predictions ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI Predictions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white text-[9px] font-black">AI</span>
                  </div>
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">AI Predictions</h2>
                  <DemoBadge />
                </div>
                <div className="space-y-3">
                  {AI_PREDICTIONS.map((p, i) => (
                    <IOSGlassCard key={i} className="p-4 rounded-2xl">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">{p.title}</h3>
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">{p.conf}% conf.</span>
                      </div>
                      <div className="text-lg font-heading font-black text-emerald-600 dark:text-emerald-400 mb-1">{p.value}</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{p.detail}</p>
                      <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">Model: {p.model}</div>
                    </IOSGlassCard>
                  ))}
                </div>
              </div>

              {/* Genesis Probability + Warnings */}
              <div className="space-y-4">
                {/* Genesis Probability */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-emerald-500" />
                    <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Genesis Probability</h2>
                    <DemoBadge />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {GENESIS_PROBABILITY.map((g, i) => (
                      <IOSGlassCard key={i} className="p-4 rounded-2xl text-center">
                        <div className="text-2xl font-heading font-black" style={{ color: g.color }}>{g.probability}%</div>
                        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Next {g.window}</div>
                        <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${g.probability}%`, background: g.color }} />
                        </div>
                      </IOSGlassCard>
                    ))}
                  </div>
                </div>

                {/* Active Warnings */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-4 h-4 text-red-500" />
                    <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Active Warnings</h2>
                  </div>
                  <div className="space-y-2.5">
                    {ACTIVE_WARNINGS.map((w, i) => {
                      const cfg = ALERT_CONFIG[w.level];
                      return (
                        <div key={i} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className={`w-3.5 h-3.5 ${cfg.icon} shrink-0`} />
                              <span className="font-bold text-xs text-slate-900 dark:text-white">{w.title}</span>
                            </div>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-1.5">{w.desc}</p>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex justify-between">
                            <span>Valid until: {w.validUntil}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── District Risk Matrix ──────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">District Landfall Risk Matrix</h2>
                <DemoBadge />
              </div>
              <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-emerald-500/10 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/60">
                        {['District / State', 'Risk Level', 'Storm Surge', 'Winds', 'Expected Rainfall', 'Evacuation Status'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RISK_MATRIX.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors">
                          <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{row.district}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${RISK_COLORS[row.category] || 'text-slate-600 bg-slate-100 border-slate-300'}`}>{row.category}</span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{row.surge}</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{row.wind}</td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{row.rain}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[10px] font-bold ${row.evac === 'Mandatory' ? 'text-red-600 dark:text-red-400' : row.evac === 'Recommended' ? 'text-orange-600 dark:text-orange-400' : row.evac === 'Advisory' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'}`}>{row.evac}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── Historical Analogues ──────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Historical Track Analogues</h2>
                <DemoBadge />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {HISTORICAL_ANALOGUES.map((c, i) => (
                  <IOSGlassCard key={i} className="p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{c.name}</span>
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{c.similarity}% match</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Year:</span> {c.year}</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Peak:</span> {c.peak}</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Track:</span> {c.track}</div>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.similarity}%` }} />
                    </div>
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
