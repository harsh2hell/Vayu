import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, Target, Wind, ChevronRight, 
  Download, RefreshCw, TrendingUp, Layers, MapPin, 
  CheckCircle, Radio, Compass, ShieldAlert, FileText, 
  Maximize2, Minimize2, Eye, Gauge, Globe, Check,
  ChevronDown, ArrowUpRight, Sparkles, Upload, Play,
  Sliders, Cpu, ShieldCheck, Zap, SlidersHorizontal,
  CloudRain, Droplets, Waves, Info, Satellite, GitBranch,
  ExternalLink, ArrowRight, Shield
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { 
  predictCycloneTrack, 
  downloadOfficialBulletinPdf,
  syncLiveSatelliteStream
} from '../services/api';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

const createPulseIcon = (isHighRisk) => L.divIcon({
  className: 'custom-cyclone-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full ${isHighRisk ? 'bg-red-500/30' : 'bg-amber-500/30'} animate-ping absolute"></div>
      <div class="w-6 h-6 rounded-full ${isHighRisk ? 'bg-red-600' : 'bg-amber-600'} border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
        🌀
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

const PRESET_SYSTEMS = [
  {
    id: 'alpha',
    name: 'Cyclone ALPHA',
    fullName: 'TC-2026-ALPHA (Severe Cyclonic Storm)',
    basin: 'Bay of Bengal',
    lat: 15.4,
    lon: 87.8,
    wind: 85,
    pressure: 980,
    category: 'Severe Cyclonic Storm',
    dvorak: 'T3.5',
  },
  {
    id: 'dana',
    name: 'Severe Cyclone DANA',
    fullName: 'TC-DANA (Very Severe Cyclonic Storm)',
    basin: 'Bay of Bengal',
    lat: 18.2,
    lon: 88.5,
    wind: 110,
    pressure: 970,
    category: 'Very Severe Cyclonic Storm',
    dvorak: 'T4.5',
  },
  {
    id: 'biparjoy',
    name: 'Cyclone BIPARJOY',
    fullName: 'TC-BIPARJOY (Extremely Severe Cyclonic Storm)',
    basin: 'Arabian Sea',
    lat: 19.5,
    lon: 67.2,
    wind: 125,
    pressure: 960,
    category: 'Extremely Severe Cyclonic Storm',
    dvorak: 'T5.0',
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState('alpha');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCone, setShowCone] = useState(true);

  // Active Prediction State
  const [aiPrediction, setAiPrediction] = useState({
    name: 'Cyclone ALPHA (TC-2026-ALPHA)',
    basin: 'Bay of Bengal',
    current_lat: 15.4,
    current_lon: 87.8,
    current_wind: 85,
    current_pressure: 980,
    category: 'Severe Cyclonic Storm',
    dvorak_t: 'T3.5',
    severity: 'HIGH THREAT',
    movement: 'North-West @ 16 km/h',
    landfall: {
      location: 'Gopalpur-Kalingapatnam Coastal Corridor (Odisha/AP)',
      lat: 18.2,
      lon: 85.6,
      window: 'T+24 Hours (Tomorrow 14:30 IST)',
      surge: '2.5 – 3.2 meters'
    },
    trajectory: [
      { time: '00:00', lead_hours: 0, total_runs: 85, success: 85, failed: 0, speed: 85, pressure: 980 },
      { time: '04:00', lead_hours: 4, total_runs: 92, success: 91, failed: 1, speed: 90, pressure: 976 },
      { time: '08:00', lead_hours: 8, total_runs: 98, success: 98, failed: 0, speed: 96, pressure: 972 },
      { time: '12:00', lead_hours: 12, total_runs: 106, success: 105, failed: 1, speed: 104, pressure: 965 },
      { time: '16:00', lead_hours: 16, total_runs: 115, success: 114, failed: 1, speed: 115, pressure: 955 },
      { time: '20:00', lead_hours: 20, total_runs: 96, success: 96, failed: 0, speed: 98, pressure: 966 },
      { time: '24:00', lead_hours: 24, total_runs: 78, success: 78, failed: 0, speed: 80, pressure: 974 },
    ],
    track_polyline: [
      [15.4, 87.8], [16.1, 87.1], [16.9, 86.5], [18.2, 85.6], [20.1, 84.2], [22.0, 83.0]
    ],
    cone_polygon: [
      [15.4, 87.8], [16.8, 88.4], [19.5, 88.0], [23.0, 85.5],
      [22.5, 80.5], [19.0, 82.0], [16.0, 85.5], [15.4, 87.8]
    ],
    strike_districts: [
      { district: 'Gopalpur (Ganjam, Odisha)', state: 'Odisha', strike_prob_pct: 82, surge_height_m: '2.5 - 3.2m', rainfall_24h_mm: 240, threat_level: 'RED' },
      { district: 'Kalingapatnam (Srikakulam, AP)', state: 'Andhra Pradesh', strike_prob_pct: 68, surge_height_m: '1.8 - 2.4m', rainfall_24h_mm: 180, threat_level: 'RED' },
      { district: 'Puri & Jagatsinghpur (Odisha)', state: 'Odisha', strike_prob_pct: 55, surge_height_m: '1.5 - 2.0m', rainfall_24h_mm: 140, threat_level: 'ORANGE' },
      { district: 'Visakhapatnam (AP)', state: 'Andhra Pradesh', strike_prob_pct: 42, surge_height_m: '1.0 - 1.5m', rainfall_24h_mm: 90, threat_level: 'YELLOW' },
    ]
  });

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    const p = PRESET_SYSTEMS.find(x => x.id === presetId);
    if (p) {
      if (presetId === 'dana') {
        setAiPrediction({
          ...aiPrediction,
          name: p.fullName,
          basin: p.basin,
          current_lat: p.lat,
          current_lon: p.lon,
          current_wind: p.wind,
          current_pressure: p.pressure,
          category: p.category,
          dvorak_t: p.dvorak,
          track_polyline: [
            [18.2, 88.5], [19.1, 87.8], [20.0, 87.3], [21.2, 86.2], [22.5, 85.0]
          ],
          cone_polygon: [
            [18.2, 88.5], [19.5, 89.2], [21.0, 88.5], [24.0, 86.5],
            [23.5, 82.5], [20.5, 84.5], [18.8, 87.0], [18.2, 88.5]
          ]
        });
      } else if (presetId === 'biparjoy') {
        setAiPrediction({
          ...aiPrediction,
          name: p.fullName,
          basin: p.basin,
          current_lat: p.lat,
          current_lon: p.lon,
          current_wind: p.wind,
          current_pressure: p.pressure,
          category: p.category,
          dvorak_t: p.dvorak,
          track_polyline: [
            [19.5, 67.2], [20.3, 67.6], [21.2, 68.0], [22.4, 68.4], [24.1, 70.2]
          ],
          cone_polygon: [
            [19.5, 67.2], [20.8, 68.5], [23.0, 70.0], [26.5, 74.0],
            [25.5, 69.5], [22.5, 67.0], [20.2, 66.0], [19.5, 67.2]
          ]
        });
      } else {
        setAiPrediction({
          ...aiPrediction,
          name: p.fullName,
          basin: p.basin,
          current_lat: p.lat,
          current_lon: p.lon,
          current_wind: p.wind,
          current_pressure: p.pressure,
          category: p.category,
          dvorak_t: p.dvorak,
          track_polyline: [
            [15.4, 87.8], [16.1, 87.1], [16.9, 86.5], [18.2, 85.6], [20.1, 84.2], [22.0, 83.0]
          ],
          cone_polygon: [
            [15.4, 87.8], [16.8, 88.4], [19.5, 88.0], [23.0, 85.5],
            [22.5, 80.5], [19.0, 82.0], [16.0, 85.5], [15.4, 87.8]
          ]
        });
      }
    }
  };

  const handleSyncFeed = async () => {
    setIsProcessing(true);
    try {
      await syncLiveSatelliteStream('insat-3dr-ir', aiPrediction.basin);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* VAYU Welcome Hero Header in Autonex Aesthetic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
              Welcome to VAYU AI
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
              SIH 2026 PRO
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Monitor continuous multi-spectral cyclone detections, live satellite feeds, and 72h trajectory predictions across the North Indian Ocean basin.
          </p>
        </div>

        {/* Sync Feed+ Pill Button in Autonex Style */}
        <button
          onClick={handleSyncFeed}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300/80 bg-amber-50/60 text-amber-900 hover:bg-amber-100 transition-colors text-xs font-semibold shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{isProcessing ? 'Syncing...' : 'Sync Satellite Feed+'}</span>
        </button>
      </div>

      {/* 4 VAYU Metric Cards (Exact Autonex DATA_01 to DATA_04 Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Cyclones */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600">
                <Wind className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="text-xs font-medium text-slate-700">Active Cyclones</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">// DATA_01</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
              1 / 2
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
            <span>Bay of Bengal</span>
            <div className="w-16 h-px bg-slate-200"></div>
          </div>
        </div>

        {/* Card 2: AI Detection Precision */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-emerald-600">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-700">Detection Precision</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">// DATA_02</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
              94.8%
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
            <span>CNN Vision v2.1</span>
            {/* Green SVG Wave Sparkline */}
            <svg className="w-16 h-4 text-emerald-500" viewBox="0 0 64 16" fill="none">
              <path d="M0 12 L16 12 L28 6 L44 8 L64 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Card 3: Satellite Ingest Streams */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600">
                <Satellite className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <span className="text-xs font-medium text-slate-700">Satellite Feeds</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">// DATA_03</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
              4 / 4
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
            <span>INSAT-3DR & NOAA</span>
            {/* Step SVG Line */}
            <svg className="w-16 h-4 text-slate-300" viewBox="0 0 64 16" fill="none">
              <path d="M0 14 L32 14 L48 4 L64 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Card 4: 24h Track Lead Error */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-slate-600">
                <Compass className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-700">24h Track Error</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">// DATA_04</span>
          </div>

          <div className="space-y-0.5">
            <p className="text-3xl font-heading font-bold text-slate-900 tracking-tight">
              ±38 km
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
            <span>BiLSTM Engine</span>
            <div className="w-16 h-px bg-slate-200"></div>
          </div>
        </div>

      </div>

      {/* Main Autonex Section: // 72H_TRAJECTORY_INTENSITY_TRENDS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 shadow-2xs">
        
        {/* Section Header with Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider block">
              // 72H_INTENSITY_AND_PRESSURE_TREND_ANALYSIS
            </span>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Interactive timeline monitoring sustained wind speeds (km/h) and central atmospheric pressure (hPa).
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-sans text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Sustained Wind (km/h)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Track Reliability</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Pressure Deficit</span>
            </span>
          </div>
        </div>

        {/* Clean Light-Mode Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aiPrediction.trajectory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-mono)' }} 
                axisLine={{ stroke: '#E2E8F0' }}
                tickLine={false}
              />
              <YAxis 
                domain={[50, 130]}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl text-xs font-mono space-y-1">
                        <p className="font-bold text-sky-400">{label} UTC Forecast</p>
                        <p>Wind Speed: {data.speed} km/h</p>
                        <p className="text-slate-300">Central Pressure: {data.pressure} hPa</p>
                        <p className="text-emerald-400">Reliability: {data.success}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="speed" 
                stroke="#0284C7" 
                strokeWidth={2} 
                fill="url(#runsGrad)" 
                dot={{ fill: '#0284C7', r: 3, strokeWidth: 1.5, stroke: '#FFFFFF' }}
              />
              <Area 
                type="monotone" 
                dataKey="success" 
                stroke="#10B981" 
                strokeWidth={2} 
                fill="url(#successGrad)" 
                dot={{ fill: '#10B981', r: 3, strokeWidth: 1.5, stroke: '#FFFFFF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Geospatial HUD Map Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider block">
              // REALTIME_GEOSPATIAL_TRACK_HUD
            </span>
            <p className="text-xs text-slate-500 font-normal">
              Continuous live tracking of active cyclone trajectory fixes, 70% cone of uncertainty, and landfall corridor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {PRESET_SYSTEMS.map((sys) => (
              <button
                key={sys.id}
                onClick={() => handlePresetSelect(sys.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all border ${
                  selectedPreset === sys.id
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {sys.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="h-80 w-full rounded-lg overflow-hidden border border-slate-200 relative">
          <MapContainer
            center={[aiPrediction.current_lat, aiPrediction.current_lon]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController center={[aiPrediction.current_lat, aiPrediction.current_lon]} zoom={6} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="&copy; CartoDB"
            />
            {showCone && (
              <Polygon
                positions={aiPrediction.cone_polygon}
                pathOptions={{
                  fillColor: '#F59E0B',
                  fillOpacity: 0.15,
                  color: '#D97706',
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            )}
            <Polyline
              positions={aiPrediction.track_polyline}
              pathOptions={{
                color: '#EF4444',
                weight: 3,
              }}
            />
            <Marker
              position={[aiPrediction.current_lat, aiPrediction.current_lon]}
              icon={createPulseIcon(true)}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <p className="font-bold text-slate-900">{aiPrediction.name}</p>
                  <p className="text-slate-600">Fix: {aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E</p>
                  <p className="text-red-600 font-semibold">{aiPrediction.current_wind} km/h • {aiPrediction.current_pressure} hPa</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

      </div>

      {/* Bottom 2-Column Grid: Coastal Strike Districts + AI Model Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coastal Strike Districts */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider block">
                // COASTAL_EARLY_WARNING_AND_STRIKE_DISTRICTS
              </span>
              <p className="text-xs text-slate-500 font-normal">Ranked coastal sectors in the 72h landfall corridor.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold">
              CAP v1.2
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono text-[11px]">
                  <th className="pb-2 font-medium">District & State</th>
                  <th className="pb-2 font-medium">Strike Prob.</th>
                  <th className="pb-2 font-medium">Est. Surge</th>
                  <th className="pb-2 font-medium">24h Rain</th>
                  <th className="pb-2 font-medium text-right">Warning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aiPrediction.strike_districts.map((d, dIdx) => (
                  <tr key={dIdx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-800">
                      {d.district}
                      <span className="block text-[10px] text-slate-400 font-normal">{d.state}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-red-500 h-full rounded-full" 
                            style={{ width: `${d.strike_prob_pct}%` }} 
                          />
                        </div>
                        <span className="font-bold text-slate-800">{d.strike_prob_pct}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-slate-600">{d.surge_height_m}</td>
                    <td className="py-2.5 font-mono text-slate-600">{d.rainfall_24h_mm} mm</td>
                    <td className="py-2.5 text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        d.threat_level === 'RED' ? 'bg-red-50 text-red-700 border border-red-200' :
                        d.threat_level === 'ORANGE' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {d.threat_level} ALERT
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Model Pipeline Verification */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-mono font-bold text-slate-800 uppercase tracking-wider block">
                // AI_PIPELINE_ORCHESTRATION
              </span>
              <p className="text-xs text-slate-500 font-normal">Active neural pipelines and bulletin dispatches.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              Operational
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-800">INSAT-3DR Telemetry Stream</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">4K Thermal IR</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-800">CNN Eye Center Localization</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">&lt; 18km Error</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-800">ResNet-50 Dvorak Classifier</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">T3.5 (85 km/h)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-800">BiLSTM 72h Recurrent Engine</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">6 Interval Fixes</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => downloadOfficialBulletinPdf(aiPrediction.name, { ...aiPrediction, timestamp: new Date().toISOString() })}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Official IMD / NDMA Bulletin (PDF)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
