import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar, { applyGlobalFontScale } from '../components/PublicNavbar';
import IOSGlassCard from '../components/IOSGlassCard';
import { useLiveClock } from '../utils/liveDateTime';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import {
  Wind, ArrowLeft, RefreshCw, Clock, Database, Activity, Info,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Thermometer,
  Gauge, Droplets, Layers, MapPin, Eye, ArrowUpRight, Compass,
  BarChart2, Satellite, ChevronRight, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ── Demo Data ──────────────────────────────────────────────────────────────────
const PRESSURE_SYSTEMS = [
  { id: 1, type: 'low', name: 'Bay Low', lat: 15.4, lon: 88.5, pressure: 1000, label: 'L\n1000 hPa' },
  { id: 2, type: 'low', name: 'BoB Depression', lat: 13.2, lon: 84.0, pressure: 1004, label: 'L\n1004 hPa' },
  { id: 3, type: 'high', name: 'Arabian Sea High', lat: 18.0, lon: 68.0, pressure: 1016, label: 'H\n1016 hPa' },
  { id: 4, type: 'high', name: 'NW India High', lat: 28.0, lon: 73.0, pressure: 1012, label: 'H\n1012 hPa' },
  { id: 5, type: 'trough', name: 'Monsoon Trough', lat: 23.0, lon: 80.0, pressure: 1006, label: 'TROUGH' },
];

const UPPER_AIR_DATA = [
  { level: '925 hPa', wind: '28 kts', dir: 'SSW', temp: '29.2°C', rh: '88%', vorticity: '+4.2×10⁻⁵' },
  { level: '850 hPa', wind: '42 kts', dir: 'SW', temp: '22.8°C', rh: '82%', vorticity: '+6.8×10⁻⁵' },
  { level: '700 hPa', wind: '35 kts', dir: 'WSW', temp: '12.4°C', rh: '65%', vorticity: '+3.1×10⁻⁵' },
  { level: '500 hPa', wind: '28 kts', dir: 'W', temp: '-5.8°C', rh: '42%', vorticity: '+1.4×10⁻⁵' },
  { level: '300 hPa', wind: '68 kts', dir: 'WNW', temp: '-38.2°C', rh: '18%', vorticity: '-2.2×10⁻⁵' },
  { level: '200 hPa', wind: '92 kts', dir: 'W', temp: '-52.4°C', rh: '8%', vorticity: '-4.5×10⁻⁵' },
];

const MONSOON_PROGRESS = [
  { week: 'W1 Jun', progress: 25 }, { week: 'W2 Jun', progress: 45 }, { week: 'W3 Jun', progress: 68 },
  { week: 'W4 Jun', progress: 82 }, { week: 'W1 Jul', progress: 100 }, { week: 'W2 Jul', progress: 100 },
  { week: 'W3 Jul', progress: 100 }, { week: 'W4 Jul', progress: 100 },
  { week: 'W1 Aug', progress: 100 }, { week: 'W2 Aug', progress: 100 },
  { week: 'W3 Aug', progress: 100 }, { week: 'W4 Aug', progress: 100 },
  { week: 'W1 Sep', progress: 100 }, { week: 'W2 Sep', progress: 100 },
];

const WIND_SHEAR_TREND = [
  { date: '25 Aug', shear850_200: 14, shear500_200: 22 },
  { date: '26 Aug', shear850_200: 12, shear500_200: 18 },
  { date: '27 Aug', shear850_200: 10, shear500_200: 15 },
  { date: '28 Aug', shear850_200: 8, shear500_200: 12 },
  { date: '29 Aug', shear850_200: 7, shear500_200: 10 },
  { date: '30 Aug', shear850_200: 9, shear500_200: 13 },
  { date: '31 Aug', shear850_200: 11, shear500_200: 16 },
  { date: '01 Sep', shear850_200: 8, shear500_200: 11 },
  { date: '02 Sep', shear850_200: 6, shear500_200: 9 },
  { date: '03 Sep', shear850_200: 5, shear500_200: 8 },
  { date: '04 Sep', shear850_200: 6, shear500_200: 9 },
  { date: '05 Sep', shear850_200: 7, shear500_200: 10 },
  { date: '06 Sep', shear850_200: 8, shear500_200: 11 },
];

const ENV_CONDITIONS = [
  { name: 'SST Bay of Bengal', value: '30.5°C', anomaly: '+0.8°C', status: 'favorable', icon: Thermometer },
  { name: 'CAPE Index', value: '2840 J/kg', anomaly: 'High Instability', status: 'favorable', icon: Zap },
  { name: 'Mid-Tropospheric RH', value: '78%', anomaly: '+12% above avg', status: 'favorable', icon: Droplets },
  { name: 'Wind Shear (850–200 hPa)', value: '8 kts', anomaly: 'Low (favorable)', status: 'favorable', icon: Wind },
  { name: 'Outflow (200 hPa)', value: 'Divergent', anomaly: 'Active anti-cyclone', status: 'favorable', icon: Compass },
  { name: 'Ocean Heat Content', value: '98 kJ/cm²', anomaly: '+8 kJ/cm² above avg', status: 'moderate', icon: Activity },
];

const CYCLONE_GENESIS_INDEX = [
  { factor: 'Low Wind Shear', score: 85 },
  { factor: 'Warm SST', score: 90 },
  { factor: 'High Humidity', score: 78 },
  { factor: 'Low Pressure', score: 88 },
  { factor: 'Vorticity', score: 72 },
  { factor: 'Outflow', score: 80 },
];

const AI_INSIGHTS = [
  { title: 'Monsoon Trough Displacement', detail: 'The ITCZ/monsoon trough is displaced southward to 18°N over central Bay of Bengal, creating a confluence zone that is enhancing cyclogenesis potential in the 12–18°N belt.', confidence: 91 },
  { title: 'Low-Level Jet Strengthening', detail: 'The 850 hPa cross-equatorial jet (Somali Jet) has intensified to 42 knots over the southwest Bay, channeling enhanced moisture flux. PWAT values above 60 mm indicate exceptional atmospheric moisture loading.', confidence: 88 },
  { title: 'Sub-Seasonal Oscillation Signal', detail: 'Active phase of the Madden-Julian Oscillation (MJO) in Phase 3–4 is enhancing convective activity across the Bay of Bengal. This typically results in 20–35% increase in cyclogenesis probability.', confidence: 84 },
];

const DATA_SOURCES = [
  { name: 'NCMRWF', desc: 'Numerical Weather Prediction Models', icon: '🖥️' },
  { name: 'IMD SFC Analysis', desc: 'Synoptic Surface Analysis Charts', icon: '🗺️' },
  { name: 'ECMWF ERA5', desc: 'European Reanalysis Dataset', icon: '🌍' },
  { name: 'NOAA GFS', desc: 'Global Forecast System 0.25°', icon: '🛰️' },
  { name: 'IMD Radiosonde', desc: 'Upper Air Sounding Network', icon: '🎈' },
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

export default function AtmosphericPatterns() {
  const navigate = useNavigate();
  const liveClock = useLiveClock(1000);

  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try { return parseInt(localStorage.getItem('vayu_font_offset') ?? '0', 10); } catch { return 0; }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('synoptic');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const genesisTotal = Math.round(CYCLONE_GENESIS_INDEX.reduce((a, b) => a + b.score, 0) / CYCLONE_GENESIS_INDEX.length);

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
                <DataTypeBadge type="live" label="IMD SYNOPTIC CHARTS" />
                <DataTypeBadge type="ai" label="NWP & AI CIRCULATION" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-slate-950 dark:text-white">Atmospheric &amp; Monsoon Patterns</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Seasonal circulation, pressure patterns &amp; environmental conditions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <LastUpdatedBadge timestamp={liveClock.observationStr} source="NCMRWF & IMD Synoptic" />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <>
            {/* ── Key Metrics Row ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Seasonal Circulation', value: 'Active Trough', sub: 'NLM & Bay pulse', icon: Wind, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Pressure Gradient', value: '1004 hPa', sub: 'Low-pressure anomaly detected', icon: Gauge, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10' },
                { label: 'Wind Shear 850–200', value: '8 kts', sub: 'Low — favorable for genesis', icon: Layers, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'SST Bay of Bengal', value: '30.5°C', sub: '+0.8°C anomaly above avg', icon: Thermometer, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-500/10' },
              ].map((m, i) => (
                <IOSGlassCard key={i} className="p-4 rounded-2xl">
                  <div className={`inline-flex p-2 rounded-xl ${m.bg} mb-2`}>
                    <m.icon className={`w-4 h-4 ${m.color}`} />
                  </div>
                  <div className={`text-lg sm:text-xl font-heading font-black ${m.color}`}>{m.value}</div>
                  <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{m.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{m.sub}</div>
                </IOSGlassCard>
              ))}
            </div>

            {/* ── Synoptic Map + Genesis Index ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Pressure Map */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Pressure Systems Map</h2>
                  <DataTypeBadge type="live" label="IMD Synoptic Surface" />
                </div>
                <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                  <div className="h-80 sm:h-96">
                    <MapContainer center={[16, 80]} zoom={4} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                      {PRESSURE_SYSTEMS.map(sys => (
                        <CircleMarker
                          key={sys.id}
                          center={[sys.lat, sys.lon]}
                          radius={sys.type === 'trough' ? 8 : 16}
                          pathOptions={{
                            color: sys.type === 'low' ? '#EF4444' : sys.type === 'high' ? '#3B82F6' : '#F59E0B',
                            fillColor: sys.type === 'low' ? '#EF4444' : sys.type === 'high' ? '#3B82F6' : '#F59E0B',
                            fillOpacity: 0.3,
                            weight: 2
                          }}
                        >
                          <Popup>
                            <div className="text-xs font-semibold">{sys.name}</div>
                            <div className="text-xs text-slate-500">Pressure: {sys.pressure} hPa</div>
                            <div className="text-[10px] text-slate-400">Type: {sys.type.toUpperCase()}</div>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-4 text-[10px] flex-wrap">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500/30 border-2 border-red-500 inline-block" /> Low Pressure (L)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500/30 border-2 border-blue-500 inline-block" /> High Pressure (H)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500/30 border-2 border-amber-500 inline-block" /> Trough/Shear Zone</span>
                  </div>
                </IOSGlassCard>
              </div>

              {/* Genesis Potential Index */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Cyclogenesis Potential</h2>
                  <DemoBadge />
                </div>
                <IOSGlassCard className="p-5 rounded-2xl h-80 sm:h-96 flex flex-col">
                  <div className="text-center mb-4">
                    <div className={`text-4xl font-heading font-black ${genesisTotal >= 80 ? 'text-red-500' : genesisTotal >= 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {genesisTotal}%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Overall Genesis Potential Index</div>
                    <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mt-2 ${genesisTotal >= 80 ? 'bg-red-500/10 text-red-600 dark:text-red-400' : genesisTotal >= 60 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                      {genesisTotal >= 80 ? '⚠ HIGH RISK' : genesisTotal >= 60 ? '⚠ MODERATE RISK' : '✓ LOW RISK'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {CYCLONE_GENESIS_INDEX.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{item.factor}</span>
                          <span className="font-bold text-slate-800 dark:text-white">{item.score}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${item.score >= 80 ? 'bg-red-500' : item.score >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </IOSGlassCard>
              </div>
            </div>

            {/* ── Wind Shear Trend ─────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Vertical Wind Shear Trend (13 Days)</h2>
                <DemoBadge />
              </div>
              <IOSGlassCard className="p-5 rounded-2xl">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">Vertical wind shear (knots) — Low shear favors cyclone development</div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={WIND_SHEAR_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} unit=" kts" />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine y={15} stroke="#EF4444" strokeDasharray="4 2" label={{ value: 'High Shear', fontSize: 9, fill: '#EF4444' }} />
                      <ReferenceLine y={8} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: 'Threshold', fontSize: 9, fill: '#F59E0B' }} />
                      <Line type="monotone" dataKey="shear850_200" name="850–200 hPa Shear" stroke="#F59E0B" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="shear500_200" name="500–200 hPa Shear" stroke="#0284C7" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px]">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-amber-500 inline-block" /> 850–200 hPa Shear</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-sky-500 inline-block" style={{ borderTop: '2px dashed' }} /> 500–200 hPa Shear</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-red-500 inline-block" style={{ borderTop: '1px dashed' }} /> High Shear Threshold (15 kts)</span>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── Upper Air Analysis Table ─────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-amber-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Upper Air Sounding Analysis</h2>
                <DataTypeBadge type="live" label="Radiosonde / RSMC" />
              </div>
              <IOSGlassCard interactive={false} className="rounded-2xl overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/60">
                        {['Pressure Level', 'Wind Speed', 'Direction', 'Temperature', 'Rel. Humidity', 'Vorticity'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {UPPER_AIR_DATA.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                          <td className="px-4 py-2.5 font-black text-amber-600 dark:text-amber-400">{row.level}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-100">{row.wind}</td>
                          <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{row.dir}</td>
                          <td className="px-4 py-2.5 text-slate-700 dark:text-slate-200">{row.temp}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                                <div className="h-full bg-sky-500 rounded-full" style={{ width: row.rh }} />
                              </div>
                              <span className="text-sky-600 dark:text-sky-400 font-semibold shrink-0">{row.rh}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-2.5 font-mono text-[10px] ${row.vorticity.startsWith('+') ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>{row.vorticity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </IOSGlassCard>
            </div>

            {/* ── Environmental Conditions Grid ────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-amber-500" />
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">Environmental Conditions Matrix</h2>
                <DataTypeBadge type="ai" label="Genesis Diagnostics" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ENV_CONDITIONS.map((cond, i) => (
                  <IOSGlassCard key={i} className="p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${cond.status === 'favorable' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                        <cond.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cond.status === 'favorable' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                        {cond.status === 'favorable' ? '✓ FAVORABLE' : '~ MODERATE'}
                      </span>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white">{cond.value}</div>
                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{cond.name}</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">{cond.anomaly}</div>
                  </IOSGlassCard>
                ))}
              </div>
            </div>

            {/* ── AI Insights ──────────────────────────────────────────── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-[9px] font-black">AI</span>
                </div>
                <h2 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">AI Synoptic Interpretation</h2>
                <DataTypeBadge type="ai" label="AI Synoptic Reasoning" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {AI_INSIGHTS.map((ins, i) => (
                  <IOSGlassCard key={i} className="p-4 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-white">{ins.title}</h3>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{ins.confidence}%</span>
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
