import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar, { applyGlobalFontScale } from '../components/PublicNavbar';
import IOSGlassCard from '../components/IOSGlassCard';
import { useLiveClock } from '../utils/liveDateTime';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ReferenceLine
} from 'recharts';
import {
  CloudRain, Droplets, Activity, AlertTriangle, CheckCircle2,
  RefreshCw, ArrowLeft, Info, Database, MapPin, Radio,
  TrendingUp, TrendingDown, Gauge, Wind, Thermometer,
  Eye, ShieldAlert, Clock, BarChart2, Waves, Satellite,
  ArrowRight, ChevronRight, Zap, Bell
} from 'lucide-react';
import {
  MapContainer, TileLayer, CircleMarker, Popup
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ── Demo Data ──────────────────────────────────────────────────────────────────
const LAST_24H_TREND = [
  { time: '00:00', rainfall: 0, cumulative: 0 },
  { time: '02:00', rainfall: 3, cumulative: 3 },
  { time: '04:00', rainfall: 8, cumulative: 11 },
  { time: '06:00', rainfall: 22, cumulative: 33 },
  { time: '08:00', rainfall: 35, cumulative: 68 },
  { time: '10:00', rainfall: 48, cumulative: 116 },
  { time: '12:00', rainfall: 62, cumulative: 178 },
  { time: '14:00', rainfall: 45, cumulative: 223 },
  { time: '16:00', rainfall: 31, cumulative: 254 },
  { time: '18:00', rainfall: 18, cumulative: 272 },
  { time: '20:00', rainfall: 9, cumulative: 281 },
  { time: '22:00', rainfall: 4, cumulative: 285 },
];

const MONTHLY_CLIMATOLOGY = [
  { month: 'Jan', normal: 12, observed: 10 },
  { month: 'Feb', normal: 15, observed: 18 },
  { month: 'Mar', normal: 20, observed: 14 },
  { month: 'Apr', normal: 35, observed: 42 },
  { month: 'May', normal: 95, observed: 112 },
  { month: 'Jun', normal: 280, observed: 265 },
  { month: 'Jul', normal: 410, observed: 388 },
  { month: 'Aug', normal: 395, observed: 421 },
  { month: 'Sep', normal: 275, observed: 312 },
  { month: 'Oct', normal: 185, observed: 194 },
  { month: 'Nov', normal: 45, observed: 52 },
  { month: 'Dec', normal: 18, observed: 20 },
];

const AWS_STATIONS = [
  { id: 1, name: 'Dhamra Port', state: 'Odisha', lat: 20.47, lon: 86.90, rainfall24h: 185, status: 'extreme', trend: 'up' },
  { id: 2, name: 'Paradip', state: 'Odisha', lat: 20.32, lon: 86.61, rainfall24h: 162, status: 'very_heavy', trend: 'up' },
  { id: 3, name: 'Gopalpur', state: 'Odisha', lat: 19.27, lon: 84.90, rainfall24h: 138, status: 'very_heavy', trend: 'stable' },
  { id: 4, name: 'Visakhapatnam Port', state: 'Andhra Pradesh', lat: 17.70, lon: 83.30, rainfall24h: 124, status: 'heavy', trend: 'up' },
  { id: 5, name: 'Kakinada', state: 'Andhra Pradesh', lat: 16.98, lon: 82.24, rainfall24h: 112, status: 'heavy', trend: 'stable' },
  { id: 6, name: 'Machilipatnam', state: 'Andhra Pradesh', lat: 16.17, lon: 81.14, rainfall24h: 98, status: 'heavy', trend: 'down' },
  { id: 7, name: 'Chennai Meenambakkam', state: 'Tamil Nadu', lat: 12.98, lon: 80.17, rainfall24h: 88, status: 'heavy', trend: 'stable' },
  { id: 8, name: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.77, lon: 79.84, rainfall24h: 75, status: 'moderate', trend: 'down' },
  { id: 9, name: 'Kolkata Airport', state: 'West Bengal', lat: 22.65, lon: 88.45, rainfall24h: 68, status: 'moderate', trend: 'up' },
  { id: 10, name: 'Sagar Island', state: 'West Bengal', lat: 21.65, lon: 88.07, rainfall24h: 155, status: 'very_heavy', trend: 'up' },
  { id: 11, name: 'Digha', state: 'West Bengal', lat: 21.63, lon: 87.50, rainfall24h: 142, status: 'very_heavy', trend: 'stable' },
  { id: 12, name: 'Puri', state: 'Odisha', lat: 19.80, lon: 85.85, rainfall24h: 95, status: 'heavy', trend: 'down' },
  { id: 13, name: 'Mangaluru', state: 'Karnataka', lat: 12.86, lon: 74.85, rainfall24h: 52, status: 'moderate', trend: 'stable' },
  { id: 14, name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.48, lon: 76.95, rainfall24h: 45, status: 'moderate', trend: 'down' },
  { id: 15, name: 'Kochi', state: 'Kerala', lat: 9.93, lon: 76.26, rainfall24h: 38, status: 'light', trend: 'stable' },
];

const ACTIVE_ALERTS = [
  {
    id: 1,
    level: 'red',
    title: 'Extreme Rainfall Warning',
    description: 'Isolated extremely heavy rainfall (≥204mm) expected over coastal Odisha and West Bengal.',
    districts: ['Kendrapara', 'Jagatsinghpur', 'Balasore', 'South 24 Parganas'],
    validUntil: '06 Sep 2026, 08:30 IST',
    issuedBy: 'IMD Bhubaneswar',
  },
  {
    id: 2,
    level: 'orange',
    title: 'Very Heavy Rainfall Warning',
    description: 'Very heavy rainfall (115–204mm) likely over coastal Andhra Pradesh and adjoining coastal districts.',
    districts: ['Srikakulam', 'Vizianagaram', 'Visakhapatnam', 'East Godavari'],
    validUntil: '06 Sep 2026, 17:30 IST',
    issuedBy: 'IMD Hyderabad',
  },
  {
    id: 3,
    level: 'yellow',
    title: 'Heavy Rainfall Advisory',
    description: 'Heavy rainfall (64–115mm) over coastal Tamil Nadu and Puducherry due to prevailing cyclonic circulation.',
    districts: ['Chennai', 'Chengalpattu', 'Kancheepuram', 'Viluppuram', 'Cuddalore'],
    validUntil: '06 Sep 2026, 05:30 IST',
    issuedBy: 'IMD Chennai',
  },
  {
    id: 4,
    level: 'yellow',
    title: 'Flash Flood Watch',
    description: 'Low-lying areas along Mahanadi and Krishna river deltas under flash flood watch due to sustained heavy rainfall upstream.',
    districts: ['Cuttack', 'Khordha', 'Krishna', 'Guntur'],
    validUntil: '07 Sep 2026, 02:30 IST',
    issuedBy: 'IMD / CWC Joint Advisory',
  },
];

const AI_INSIGHTS = [
  {
    title: 'Convergence Zone Active',
    detail: 'Low-level jet stream (850 hPa) is channeling moisture from Bay of Bengal into the coastal belt of Odisha, sustaining the heavy rainfall event. The LLJ is expected to persist for the next 18–24 hours.',
    confidence: 87,
    model: 'VayuSat Atmospheric Pattern Engine v2.1'
  },
  {
    title: 'Doppler Composite Analysis',
    detail: 'The IMD S-band Doppler radar at Paradip is detecting a bright-band signature at 5.2 km altitude, indicating stratiform rain with embedded convective cells. Peak reflectivity observed at 48 dBZ.',
    confidence: 94,
    model: 'CycloneVision Radar Fusion v1.8'
  },
  {
    title: 'Orographic Enhancement',
    detail: 'Terrain-induced orographic lifting along the Eastern Ghats foothills is amplifying precipitation by an estimated 25–40% in the Koraput-Rayagada sector. Watch for landslide potential.',
    confidence: 78,
    model: 'VayuSat Terrain Precipitation Model'
  },
];

const DATA_SOURCES = [
  { name: 'ISRO MOSDAC', desc: 'Kalpana-1 & INSAT-3DR Satellite', url: 'https://mosdac.gov.in', icon: '🛰️' },
  { name: 'IMD AWS Network', desc: '850+ Automatic Weather Stations', url: 'https://mausam.imd.gov.in', icon: '🌡️' },
  { name: 'GPM IMERG', desc: 'NASA Global Precipitation Measurement', url: 'https://gpm.nasa.gov', icon: '🌧️' },
  { name: 'IMD Doppler Radar', desc: 'S-band DWR Network (24 sites)', url: 'https://mausam.imd.gov.in', icon: '📡' },
  { name: 'INCOIS', desc: 'Indian Ocean Observing System', url: 'https://incois.gov.in', icon: '🌊' },
];

const STATUS_CONFIG = {
  extreme: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-950/50', border: 'border-red-300 dark:border-red-800', dot: 'bg-red-500', label: 'Extreme' },
  very_heavy: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-950/50', border: 'border-orange-300 dark:border-orange-800', dot: 'bg-orange-500', label: 'Very Heavy' },
  heavy: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/50', border: 'border-amber-300 dark:border-amber-800', dot: 'bg-amber-500', label: 'Heavy' },
  moderate: { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-950/50', border: 'border-sky-300 dark:border-sky-800', dot: 'bg-sky-500', label: 'Moderate' },
  light: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/50', border: 'border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500', label: 'Light' },
};

const ALERT_CONFIG = {
  red: { border: 'border-red-300 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-950/30', icon: 'text-red-600 dark:text-red-400', badge: 'bg-red-500 text-white', label: 'RED ALERT' },
  orange: { border: 'border-orange-300 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-950/30', icon: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500 text-white', label: 'ORANGE ALERT' },
  yellow: { border: 'border-yellow-300 dark:border-yellow-800', bg: 'bg-yellow-50 dark:bg-yellow-950/30', icon: 'text-yellow-600 dark:text-yellow-400', badge: 'bg-yellow-500 text-slate-900', label: 'YELLOW ADVISORY' },
};

const DemoBadge = ({ type = 'demo', label = 'DEMO BENCHMARK' }) => (
  <DataTypeBadge type={type} label={label} />
);

const CircleMarkerRainfall = ({ station }) => {
  const color = station.status === 'extreme' ? '#EF4444' : station.status === 'very_heavy' ? '#F97316' : station.status === 'heavy' ? '#F59E0B' : station.status === 'moderate' ? '#0284C7' : '#10B981';
  const radius = Math.max(5, Math.min(22, station.rainfall24h / 10));
  return (
    <CircleMarker center={[station.lat, station.lon]} radius={radius} pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 1.5 }}>
      <Popup>
        <div className="text-xs font-semibold">{station.name}, {station.state}</div>
        <div className="text-xs text-slate-500">24h Rainfall: <strong>{station.rainfall24h} mm</strong></div>
        <div className="text-[10px] text-slate-400 mt-0.5">Status: {STATUS_CONFIG[station.status]?.label}</div>
      </Popup>
    </CircleMarker>
  );
};

export default function RainfallIntelligence() {
  const navigate = useNavigate();
  const liveClock = useLiveClock(1000);

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try { return parseInt(localStorage.getItem('vayu_font_offset') ?? '0', 10); } catch { return 0; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeStationTab, setActiveStationTab] = useState('all');
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const filteredStations = activeStationTab === 'all' ? AWS_STATIONS : AWS_STATIONS.filter(s => s.status === activeStationTab);
  const sortedStations = [...filteredStations].sort((a, b) => b.rainfall24h - a.rainfall24h);

  const totalActive = AWS_STATIONS.length;
  const peakRainfall = Math.max(...AWS_STATIONS.map(s => s.rainfall24h));
  const alertCount = ACTIVE_ALERTS.filter(a => a.level === 'red' || a.level === 'orange').length;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs shadow-lg">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value} mm</p>
          ))}
        </div>
      );
    }
    return null;
  };

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
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <DataTypeBadge type="live" label="IMD DWR DOPPLER GRID" />
                <DataTypeBadge type="demo" label="RADAR SIMULATION" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-slate-950 dark:text-white">Rainfall Intelligence</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Precipitation estimates &amp; 850+ coastal automatic weather stations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <LastUpdatedBadge timestamp={liveClock.observationStr} source="IMD DWR & AWS Network" />
            <button className="ml-1 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer" title="Refresh">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isLoading ? (
          /* ── Skeleton Loading ───────────────────────────────────────── */
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ── Key Metrics Row ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Peak 24h Rainfall', value: `${peakRainfall} mm`, sub: 'Dhamra Port, Odisha', icon: CloudRain, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
                { label: 'Active Stations', value: `${totalActive}/856`, sub: '98.4% telemetry uptime', icon: Radio, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Active Alerts', value: alertCount, sub: `${ACTIVE_ALERTS.length} total advisories`, icon: Bell, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
                { label: 'Basin Avg. 24h', value: '87.4 mm', sub: '+42% above normal', icon: BarChart2, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
              ].map((m, i) => (
                <IOSGlassCard key={i} className="p-4 rounded-2xl">
                  <div className={`inline-flex p-2 rounded-xl ${m.bg} mb-2`}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-heading font-black ${m.color}`}>{m.value}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{m.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{m.sub}</div>
                </IOSGlassCard>
              ))}
            </div>

            {/* ── Active Alerts ────────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Active Alerts &amp; Warnings</h2>
                <DataTypeBadge type="live" label="IMD CAP Warning Feed" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ACTIVE_ALERTS.map(alert => {
                  const cfg = ALERT_CONFIG[alert.level];
                  return (
                    <div key={alert.id} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${cfg.icon} shrink-0`} />
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</span>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">{alert.description}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {alert.districts.map(d => (
                          <span key={d} className="text-[10px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/10 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium">{d}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Valid: {alert.validUntil}</span>
                        <span>Issued by: {alert.issuedBy}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Interactive Rainfall Map + 24h Trend ─────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Map */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-sky-500" />
                    <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">AWS Rainfall Map</h2>
                    <DemoBadge />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Extreme</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Very Heavy</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Heavy</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> Moderate</span>
                  </div>
                </div>
                <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                  <div className="h-80 sm:h-96">
                    <MapContainer center={[16.5, 82]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={true}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      {AWS_STATIONS.map(station => (
                        <CircleMarkerRainfall key={station.id} station={station} />
                      ))}
                    </MapContainer>
                  </div>
                </IOSGlassCard>
              </div>

              {/* 24h Trend */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-sky-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">24-Hour Trend</h2>
                  <DemoBadge />
                </div>
                <IOSGlassCard className="p-4 rounded-2xl h-80 sm:h-96 flex flex-col">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">Hourly rainfall intensity (Paradip composite)</div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={LAST_24H_TREND} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                        <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#94a3b8' }} interval={2} />
                        <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} unit=" mm" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="rainfall" name="Hourly Rain" stroke="#0284C7" fill="url(#rainGrad)" strokeWidth={2} />
                        <Line type="monotone" dataKey="cumulative" name="Cumulative" stroke="#F97316" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-sky-500 inline-block rounded" /> Hourly (mm)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block rounded border-dashed" /> Cumulative (mm)</span>
                  </div>
                </IOSGlassCard>
              </div>
            </div>

            {/* ── AWS Station Table ─────────────────────────────────────── */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">AWS Station Report</h2>
                  <DataTypeBadge type="live" label="Coastal AWS Network" />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['all', 'extreme', 'very_heavy', 'heavy', 'moderate'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveStationTab(tab)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer capitalize ${activeStationTab === tab ? 'bg-sky-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-400'}`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                        {['#', 'Station', 'State', '24h Rainfall', 'Status', 'Trend'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStations.slice(0, 10).map((s, idx) => {
                        const cfg = STATUS_CONFIG[s.status];
                        return (
                          <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-4 py-2.5 text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
                            <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{s.name}</td>
                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.state}</td>
                            <td className="px-4 py-2.5">
                              <span className={`font-black ${cfg.color}`}>{s.rainfall24h} mm</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {s.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-red-500" /> : s.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-emerald-500" /> : <span className="w-3.5 h-0.5 bg-slate-300 dark:bg-slate-600 inline-block rounded" />}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── Monthly Climatology Chart ─────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-sky-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Monthly Climatological Context</h2>
                <DataTypeBadge type="historical" label="IMD 30-Yr LPA Normal" />
              </div>
              <IOSGlassCard className="p-5 rounded-2xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Monthly rainfall (mm) — Observed vs. Long Period Average (LPA)</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_CLIMATOLOGY} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} unit=" mm" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="normal" name="LPA Normal" fill="#CBD5E1" radius={[3,3,0,0]} />
                      <Bar dataKey="observed" name="Observed" fill="#0284C7" radius={[3,3,0,0]} opacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-300 dark:bg-slate-500 inline-block" /> LPA Normal</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" /> Observed 2026</span>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── AI Insights ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">AI</span>
                </div>
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">AI-Generated Insights</h2>
                <DataTypeBadge type="ai" label="CycloneVision AI Fusion" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_INSIGHTS.map((ins, i) => (
                  <IOSGlassCard key={i} className="p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">{ins.title}</h3>
                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{ins.confidence}% conf.</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{ins.detail}</p>
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Model: {ins.model}</span>
                    </div>
                  </IOSGlassCard>
                ))}
              </div>
            </div>

            {/* ── Data Sources ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-slate-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Data Sources &amp; Attribution</h2>
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
                ⚠️ All data shown on this page is <strong>demonstration / sample data</strong> for the SIH 2026 project. Not for operational use. Live integration with IMD APIs pending.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
