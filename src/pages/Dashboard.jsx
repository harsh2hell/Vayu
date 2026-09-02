import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, Target, Wind, ChevronRight, 
  Download, RefreshCw, TrendingUp, Layers, MapPin, 
  CheckCircle, Radio, Compass, ShieldAlert, FileText, 
  Maximize2, Minimize2, Eye, Gauge, Globe, Check,
  ChevronDown, ArrowUpRight, Sparkles, Upload, Play,
  Sliders, Cpu, ShieldCheck, Zap, SlidersHorizontal,
  CloudRain, Droplets, Waves, Info
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { 
  predictCycloneTrack, 
  detectCycloneFromImage, 
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

// Custom Leaflet Animated Pulse Marker Icon
const createPulseIcon = (isHighRisk) => L.divIcon({
  className: 'custom-cyclone-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full ${isHighRisk ? 'bg-red-500/40' : 'bg-amber-500/40'} animate-ping absolute"></div>
      <div class="w-7 h-7 rounded-full ${isHighRisk ? 'bg-red-600' : 'bg-amber-600'} border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
        🌀
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Custom Landfall Target Icon
const createLandfallIcon = () => L.divIcon({
  className: 'custom-landfall-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full bg-red-600/30 animate-ping absolute"></div>
      <div class="w-6 h-6 rounded-full bg-red-700 border-2 border-white shadow-lg flex items-center justify-center text-white text-[11px] font-bold">
        🎯
      </div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Map Tile Providers
const MAP_PROVIDERS = [
  {
    id: 'esri-satellite',
    name: 'Esri Satellite (HD)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  {
    id: 'carto-voyager',
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  },
  {
    id: 'carto-dark',
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  }
];

// Helper to smoothly fly map to new coordinates
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Map Click Listener to pick custom coordinate
const MapClickHandler = ({ onLocationSelect, enabled }) => {
  useMapEvents({
    click(e) {
      if (enabled) {
        onLocationSelect(parseFloat(e.latlng.lat.toFixed(2)), parseFloat(e.latlng.lng.toFixed(2)));
      }
    },
  });
  return null;
};

const PRESET_SYSTEMS = [
  {
    id: 'alpha',
    name: 'Cyclone ALPHA (TC-2026-ALPHA)',
    basin: 'Bay of Bengal',
    lat: 15.4,
    lon: 87.8,
    wind: 85,
    pressure: 980,
    category: 'Severe Cyclonic Storm',
    dvorak: 'T3.5',
    sst: 29.5,
    shear: 12.0
  },
  {
    id: 'dana',
    name: 'Severe Cyclone DANA',
    basin: 'Bay of Bengal',
    lat: 18.2,
    lon: 88.5,
    wind: 110,
    pressure: 970,
    category: 'Very Severe Cyclonic Storm',
    dvorak: 'T4.5',
    sst: 30.2,
    shear: 9.5
  },
  {
    id: 'biparjoy',
    name: 'Cyclone BIPARJOY',
    basin: 'Arabian Sea',
    lat: 19.5,
    lon: 67.2,
    wind: 125,
    pressure: 960,
    category: 'Extremely Severe Cyclonic Storm',
    dvorak: 'T5.0',
    sst: 31.0,
    shear: 14.0
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Pipeline Mode: 'automatic' | 'manual'
  const [ingestionMode, setIngestionMode] = useState('automatic');
  const [selectedPreset, setSelectedPreset] = useState('alpha');
  const [activeIntelligenceTab, setActiveIntelligenceTab] = useState('forecast');
  const [chartSubTab, setChartSubTab] = useState('wind');
  
  const [isMapClickPickerActive, setIsMapClickPickerActive] = useState(false);
  const [selectedMapProvider, setSelectedMapProvider] = useState(MAP_PROVIDERS[0]);
  const [isMapProviderDropdownOpen, setIsMapProviderDropdownOpen] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Layer toggles
  const [showCone, setShowCone] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  const [showRadarClouds, setShowRadarClouds] = useState(true);

  // Manual Ingestion Form State
  const [inputName, setInputName] = useState('Cyclone ALPHA (TC-2026-ALPHA)');
  const [inputBasin, setInputBasin] = useState('Bay of Bengal');
  const [inputLat, setInputLat] = useState(15.4);
  const [inputLon, setInputLon] = useState(87.8);
  const [inputWind, setInputWind] = useState(85.0);
  const [inputMslp, setInputMslp] = useState(980.0);
  const [inputSst, setInputSst] = useState(29.5);
  const [inputShear, setInputShear] = useState(12.0);
  const [uploadedImage, setUploadedImage] = useState(null);

  // Active Prediction State (Output of AI/ML Model)
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
    sst: 29.5,
    shear: 12.0,
    movement: 'North-West @ 16 km/h',
    landfall: {
      location: 'Gopalpur-Kalingapatnam Coastal Corridor (Odisha/AP)',
      lat: 18.2,
      lon: 85.6,
      window: 'T+24 Hours (Tomorrow 14:30 IST)',
      surge: '2.5 – 3.2 meters'
    },
    trajectory: [
      { time: 'NOW', lead_hours: 0, lat: 15.4, lon: 87.8, speed: 85, pressure: 980, upper: 95, lower: 75, stage: 'Initial Fix' },
      { time: '+6h', lead_hours: 6, lat: 16.1, lon: 87.1, speed: 93, pressure: 974, upper: 104, lower: 82, stage: 'Intensifying' },
      { time: '+12h', lead_hours: 12, lat: 16.9, lon: 86.5, speed: 103, pressure: 966, upper: 115, lower: 91, stage: 'Severe Cyclonic Storm' },
      { time: '+24h', lead_hours: 24, lat: 18.2, lon: 85.6, speed: 115, pressure: 955, upper: 128, lower: 102, stage: 'Peak Landfall Window' },
      { time: '+48h', lead_hours: 48, lat: 20.1, lon: 84.2, speed: 100, pressure: 964, upper: 112, lower: 88, stage: 'Post-Landfall Weakening' },
      { time: '+72h', lead_hours: 72, lat: 22.0, lon: 83.0, speed: 80, pressure: 972, upper: 90, lower: 70, stage: 'Depression Dissipation' },
    ],
    track_polyline: [
      [15.4, 87.8], [16.1, 87.1], [16.9, 86.5], [18.2, 85.6], [20.1, 84.2], [22.0, 83.0]
    ],
    cone_polygon: [
      [15.4, 87.8], [16.8, 88.4], [19.5, 88.0], [23.0, 85.5],
      [22.5, 80.5], [19.0, 82.0], [16.0, 85.5], [15.4, 87.8]
    ],
    strike_districts: [
      { district: 'Gopalpur (Ganjam, Odisha)', state: 'Odisha', strike_prob_pct: 82, surge_height_m: '2.5 - 3.2m', rainfall_24h_mm: 240, threat_level: 'RED ALERT' },
      { district: 'Kalingapatnam (Srikakulam, AP)', state: 'Andhra Pradesh', strike_prob_pct: 68, surge_height_m: '1.8 - 2.4m', rainfall_24h_mm: 180, threat_level: 'RED ALERT' },
      { district: 'Puri & Jagatsinghpur (Odisha)', state: 'Odisha', strike_prob_pct: 55, surge_height_m: '1.5 - 2.0m', rainfall_24h_mm: 140, threat_level: 'ORANGE ALERT' },
      { district: 'Visakhapatnam (AP)', state: 'Andhra Pradesh', strike_prob_pct: 42, surge_height_m: '1.0 - 1.5m', rainfall_24h_mm: 90, threat_level: 'YELLOW ALERT' },
    ]
  });

  const handlePresetSelect = (presetId) => {
    setSelectedPreset(presetId);
    const p = PRESET_SYSTEMS.find(x => x.id === presetId);
    if (p) {
      setInputName(p.name);
      setInputBasin(p.basin);
      setInputLat(p.lat);
      setInputLon(p.lon);
      setInputWind(p.wind);
      setInputMslp(p.pressure);
      setInputSst(p.sst);
      setInputShear(p.shear);
    }
  };

  // Handler: Automatic Real-Time Satellite Feed Ingestion
  const handleSyncLiveSatellite = async () => {
    setIsProcessing(true);
    try {
      const liveRes = await syncLiveSatelliteStream('insat-3dr-ir', inputBasin);
      if (liveRes && liveRes.trajectory_forecast) {
        const tf = liveRes.trajectory_forecast;
        const traj = tf.trajectory_forecast?.map(s => ({
          time: s.time,
          lead_hours: s.lead_hours,
          lat: s.lat,
          lon: s.lon,
          speed: s.wind,
          pressure: s.pressure,
          upper: s.upper_wind || Math.round(s.wind * 1.12),
          lower: s.lower_wind || Math.round(s.wind * 0.88),
          stage: s.stage
        })) || aiPrediction.trajectory;

        setAiPrediction({
          name: `Live INSAT-3DR Stream (${liveRes.frame_timestamp.split(' ')[1] || 'Latest'})`,
          basin: inputBasin,
          current_lat: tf.initial_fix?.latitude || 15.4,
          current_lon: tf.initial_fix?.longitude || 87.8,
          current_wind: tf.initial_fix?.wind_kmh || 85,
          current_pressure: tf.initial_fix?.pressure_hpa || 980,
          category: tf.classification?.category || 'Severe Cyclonic Storm',
          dvorak_t: tf.classification?.dvorak_t_number || 'T3.5',
          severity: tf.classification?.severity_level || 'HIGH THREAT',
          sst: inputSst,
          shear: inputShear,
          movement: inputBasin === 'Bay of Bengal' ? 'North-West @ 16 km/h' : 'North @ 14 km/h',
          landfall: {
            location: tf.landfall_prediction?.target_sector || 'Odisha-AP Coastal Corridor',
            lat: tf.landfall_prediction?.lat || 18.2,
            lon: tf.landfall_prediction?.lon || 85.6,
            window: tf.landfall_prediction?.window || 'T+24 Hours',
            surge: tf.landfall_prediction?.surge_estimate || '2.2 – 3.0 meters'
          },
          trajectory: traj,
          track_polyline: tf.track_polyline || traj.map(s => [s.lat, s.lon]),
          cone_polygon: tf.cone_polygon || aiPrediction.cone_polygon,
          strike_districts: tf.coastal_strike_probabilities || aiPrediction.strike_districts
        });
      }
    } catch (err) {
      console.error('Error syncing live stream:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Run AI Inference on Manual Data / Image Input
  const handleRunAiInference = async () => {
    setIsProcessing(true);
    try {
      const result = await predictCycloneTrack({
        lat: inputLat,
        lon: inputLon,
        wind: inputWind,
        mslp: inputMslp,
        sst: inputSst,
        shear: inputShear,
        basin: inputBasin
      });

      if (result && result.trajectory_forecast) {
        const traj = result.trajectory_forecast.map(s => ({
          time: s.time,
          lead_hours: s.lead_hours,
          lat: s.lat,
          lon: s.lon,
          speed: s.wind,
          pressure: s.pressure,
          upper: s.upper_wind || Math.round(s.wind * 1.12),
          lower: s.lower_wind || Math.round(s.wind * 0.88),
          stage: s.stage
        }));

        setAiPrediction({
          name: inputName,
          basin: inputBasin,
          current_lat: inputLat,
          current_lon: inputLon,
          current_wind: inputWind,
          current_pressure: inputMslp,
          category: result.classification?.category || 'Severe Cyclonic Storm',
          dvorak_t: result.classification?.dvorak_t_number || 'T3.5',
          severity: result.classification?.severity_level || 'HIGH THREAT',
          sst: inputSst,
          shear: inputShear,
          movement: inputBasin === 'Bay of Bengal' ? 'North-West @ 16 km/h' : 'North @ 14 km/h',
          landfall: {
            location: result.landfall_prediction?.target_sector || 'East Coast Sector',
            lat: result.landfall_prediction?.lat || traj[3]?.lat || 18.2,
            lon: result.landfall_prediction?.lon || traj[3]?.lon || 85.6,
            window: result.landfall_prediction?.window || 'T+24 Hours',
            surge: result.landfall_prediction?.surge_estimate || '2.2 – 3.0 meters'
          },
          trajectory: traj,
          track_polyline: result.track_polyline || traj.map(s => [s.lat, s.lon]),
          cone_polygon: result.cone_polygon || aiPrediction.cone_polygon,
          strike_districts: result.coastal_strike_probabilities || aiPrediction.strike_districts
        });
      }
    } catch (err) {
      console.error('Error running inference:', err);
    } finally {
      setIsProcessing(false);
      setIsMapClickPickerActive(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setIsProcessing(true);
      try {
        const detectRes = await detectCycloneFromImage(file, inputBasin);
        if (detectRes) {
          setInputLat(detectRes.coordinates?.latitude || inputLat);
          setInputLon(detectRes.coordinates?.longitude || inputLon);
          setInputWind(detectRes.dvorak_classification?.estimated_wind_speed_kmh || inputWind);
          setInputMslp(detectRes.dvorak_classification?.central_mslp_hpa || inputMslp);
        }
      } catch (err) {
        console.warn('Vision detection error:', err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const mapCenter = [aiPrediction.current_lat, aiPrediction.current_lon];

  return (
    <div className="space-y-5 max-w-[1550px] mx-auto pb-12">
      
      {/* 1. Header Hero Bar: System Switcher & Telemetry Pipeline Control */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Active System Pill & Preset Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Target System:
            </span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs">
            {PRESET_SYSTEMS.map((sys) => (
              <button
                key={sys.id}
                onClick={() => handlePresetSelect(sys.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedPreset === sys.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {sys.name.split(' (')[0]}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-300 hidden md:inline">|</span>
          
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{aiPrediction.basin}</span>
            <span>•</span>
            <span>Fix: {aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E</span>
          </div>
        </div>

        {/* Right: Ingestion Mode & Trigger Action */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70 text-xs font-medium">
            <button
              onClick={() => setIngestionMode('automatic')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                ingestionMode === 'automatic'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Live Feed</span>
            </button>
            
            <button
              onClick={() => {
                setIngestionMode('manual');
                setActiveIntelligenceTab('simulate');
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                ingestionMode === 'manual'
                  ? 'bg-white text-sky-600 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
              <span>AI Simulator</span>
            </button>
          </div>

          {ingestionMode === 'automatic' ? (
            <button
              onClick={handleSyncLiveSatellite}
              disabled={isProcessing}
              className="btn-primary text-xs py-2 px-4 shadow-sm shadow-sky-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Ingesting Stream...' : 'Sync Live Satellite Stream'}</span>
            </button>
          ) : (
            <button
              onClick={handleRunAiInference}
              disabled={isProcessing}
              className="btn-primary text-xs py-2 px-4 shadow-sm shadow-sky-500/20 disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isProcessing ? 'Running AI Inference...' : 'Run 72h Forecast'}</span>
            </button>
          )}
        </div>

      </div>

      {/* 2. Top Executive KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Maximum Sustained Wind', 
            val: `${aiPrediction.current_wind} km/h`, 
            sub: `${Math.round(aiPrediction.current_wind / 1.852)} knots • Dvorak ${aiPrediction.dvorak_t}`, 
            badge: aiPrediction.category,
            badgeClass: 'badge-red',
            icon: Wind,
            iconColor: 'text-red-500 bg-red-50'
          },
          { 
            label: 'Central Atmospheric Pressure', 
            val: `${aiPrediction.current_pressure} hPa`, 
            sub: `Pressure Deficit: -${Math.round(1008 - aiPrediction.current_pressure)} hPa`, 
            badge: aiPrediction.severity,
            badgeClass: 'badge-orange',
            icon: Gauge,
            iconColor: 'text-orange-500 bg-orange-50'
          },
          { 
            label: 'Projected Landfall Window', 
            val: 'T+24 Hours', 
            sub: aiPrediction.landfall.location.split('(')[0], 
            badge: 'Target Corridor',
            badgeClass: 'badge-amber',
            icon: Target,
            iconColor: 'text-amber-500 bg-amber-50'
          },
          { 
            label: 'BiLSTM Track Confidence', 
            val: '94.2%', 
            sub: `SST: ${aiPrediction.sst}°C • Shear: ${aiPrediction.shear} kt`, 
            badge: 'High Precision',
            badgeClass: 'badge-green',
            icon: ShieldCheck,
            iconColor: 'text-emerald-500 bg-emerald-50'
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="card p-4 space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <span className={`badge ${kpi.badgeClass}`}>
                  {kpi.badge}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">{kpi.val}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[190px]">{kpi.sub}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${kpi.iconColor} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Interactive 4D Geospatial Radar Map Canvas */}
      <div className={`card overflow-hidden flex flex-col transition-all ${
        isMapFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
      }`}>
        
        {/* Map Header Toolbar */}
        <div className="px-4 py-3 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-tight">
              4D Geospatial Trajectory HUD
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (Vector: {aiPrediction.movement})
            </span>
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            
            {/* Map Click Picker Switcher */}
            {ingestionMode === 'manual' && (
              <button
                onClick={() => setIsMapClickPickerActive(!isMapClickPickerActive)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  isMapClickPickerActive 
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isMapClickPickerActive ? 'Click Map to Set Point' : 'Pick Lat/Lon'}</span>
              </button>
            )}

            {/* Provider Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsMapProviderDropdownOpen(!isMapProviderDropdownOpen)}
                className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>{selectedMapProvider.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isMapProviderDropdownOpen && (
                <div className="absolute right-0 top-9 w-48 bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-[1000] space-y-0.5 animate-in fade-in duration-100">
                  {MAP_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedMapProvider(provider);
                        setIsMapProviderDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedMapProvider.id === provider.id 
                          ? 'bg-slate-100 text-slate-900 font-semibold' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{provider.name}</span>
                      {selectedMapProvider.id === provider.id && <Check className="w-3.5 h-3.5 text-sky-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layer Toggles */}
            <button 
              onClick={() => setShowRadarClouds(!showRadarClouds)}
              className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
                showRadarClouds ? 'bg-sky-50 border-sky-200 text-sky-700 font-semibold' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-500" /> Radar
            </button>

            <button 
              onClick={() => setShowCone(!showCone)}
              className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
                showCone ? 'bg-orange-50 border-orange-200 text-orange-700 font-semibold' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 70% Cone
            </button>

            <button 
              onClick={() => setShowSurge(!showSurge)}
              className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all flex items-center gap-1.5 ${
                showSurge ? 'bg-red-50 border-red-200 text-red-700 font-semibold' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Surge Zone
            </button>

            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors"
              title={isMapFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
            >
              {isMapFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

        {/* Real Leaflet Map Canvas */}
        <div className="relative w-full h-[520px] bg-slate-100">
          
          <MapContainer 
            center={mapCenter} 
            zoom={6} 
            scrollWheelZoom={true} 
            className="w-full h-full"
          >
            <MapController center={mapCenter} zoom={6} />
            <MapClickHandler 
              enabled={isMapClickPickerActive} 
              onLocationSelect={(lat, lon) => {
                setInputLat(lat);
                setInputLon(lon);
              }} 
            />

            {/* Selected Tile Layer */}
            <TileLayer
              attribution={selectedMapProvider.attribution}
              url={selectedMapProvider.url}
            />

            {/* Live Weather Cloud Radar Overlay */}
            {showRadarClouds && (
              <TileLayer
                attribution='Radar &copy; RainViewer'
                url="https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png"
                opacity={0.65}
              />
            )}

            {/* 70% Confidence Cone of Uncertainty */}
            {showCone && aiPrediction.cone_polygon && (
              <Polygon 
                positions={aiPrediction.cone_polygon} 
                pathOptions={{ 
                  color: '#F97316', 
                  fillColor: '#F97316', 
                  fillOpacity: 0.16, 
                  weight: 2, 
                  dashArray: '5,5' 
                }} 
              />
            )}

            {/* Landfall Surge Impact Circle */}
            {showSurge && aiPrediction.landfall && (
              <Circle 
                center={[aiPrediction.landfall.lat, aiPrediction.landfall.lon]} 
                radius={220000} 
                pathOptions={{ 
                  color: '#DC2626', 
                  fillColor: '#DC2626', 
                  fillOpacity: 0.12, 
                  weight: 2, 
                  dashArray: '4,4' 
                }} 
              />
            )}

            {/* BiLSTM Trajectory Line */}
            {aiPrediction.track_polyline && (
              <Polyline 
                positions={aiPrediction.track_polyline} 
                pathOptions={{ color: '#EF4444', weight: 3.5, dashArray: '6,6' }} 
              />
            )}

            {/* Starting Fix Marker */}
            <Marker 
              position={[aiPrediction.current_lat, aiPrediction.current_lon]}
              icon={createPulseIcon(aiPrediction.current_wind >= 100)}
            >
              <Popup>
                <div className="p-1 space-y-1 font-sans text-xs text-slate-800">
                  <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>{aiPrediction.name}</span>
                    <span className="badge badge-red text-[10px]">Fix</span>
                  </div>
                  <div><strong>Position:</strong> {aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E</div>
                  <div><strong>Intensity:</strong> {aiPrediction.current_wind} km/h (Dvorak {aiPrediction.dvorak_t})</div>
                  <div><strong>Pressure:</strong> {aiPrediction.current_pressure} hPa</div>
                  <div className="pt-1 text-red-600 font-semibold border-t border-slate-100">
                    {aiPrediction.category}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Projected Landfall Marker */}
            {aiPrediction.landfall && (
              <Marker 
                position={[aiPrediction.landfall.lat, aiPrediction.landfall.lon]}
                icon={createLandfallIcon()}
              >
                <Popup>
                  <div className="font-sans text-xs space-y-1">
                    <strong className="text-red-700 block text-xs">AI Projected Landfall Sector</strong>
                    <span className="font-semibold text-slate-800">{aiPrediction.landfall.location}</span><br />
                    <span className="text-slate-600 text-[11px]">Timing: {aiPrediction.landfall.window}</span><br />
                    <span className="text-red-600 font-bold text-[11px]">Estimated Surge: {aiPrediction.landfall.surge}</span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Floating High-Tech Inspection Panel */}
          <div className="absolute top-3 right-3 z-[400] max-w-xs w-full hidden md:block">
            <div className="glass-panel rounded-xl p-3.5 shadow-xl space-y-3 text-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <h3 className="font-bold text-xs text-slate-900 truncate">
                    {aiPrediction.name.split(' (')[0]}
                  </h3>
                </div>
                <span className="badge badge-blue text-[10px]">
                  {aiPrediction.dvorak_t}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-500">Center Fix:</span>
                  <span className="font-semibold text-slate-800">{aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-500">Steering Vector:</span>
                  <span className="font-semibold text-slate-800">{aiPrediction.movement}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-500">Sea Surface Temp:</span>
                  <span className="font-semibold text-orange-600">{aiPrediction.sst}°C</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-500">Vertical Wind Shear:</span>
                  <span className="font-semibold text-sky-600">{aiPrediction.shear} knots</span>
                </div>
              </div>

              {/* Coastal Strike Probability Quick View */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">District Strike Risk:</span>
                <div className="space-y-1 text-[11px]">
                  {aiPrediction.strike_districts.slice(0, 3).map((dist, dIdx) => (
                    <div key={dIdx} className="flex items-center justify-between">
                      <span className="text-slate-700 truncate max-w-[160px]">{dist.district.split('(')[0]}</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        dist.strike_prob_pct >= 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {dist.strike_prob_pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Left Legend */}
          <div className="absolute bottom-3 left-3 z-[400] glass-panel rounded-lg px-3 py-2 text-xs shadow-md space-y-1">
            <div className="font-bold text-[10px] text-slate-900 uppercase tracking-wider">HUD Overlays</div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="w-3 h-0.5 bg-red-600 rounded inline-block" /> 72h BiLSTM Track
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="w-2.5 h-2.5 bg-orange-400/30 border border-orange-400 rounded-xs inline-block" /> 70% Confidence Cone
            </div>
          </div>

        </div>
      </div>

      {/* 4. Tabbed Intelligence Deck (Decluttering all widgets into clean, focused tabs) */}
      <div className="card overflow-hidden">
        
        {/* Tab Header Bar */}
        <div className="border-b border-slate-200/80 px-4 py-2 bg-slate-50/60 flex items-center justify-between flex-wrap gap-2">
          
          <div className="flex items-center gap-1">
            {[
              { id: 'forecast', label: '72h Forecast Curves', icon: TrendingUp },
              { id: 'risk', label: 'Coastal Strike & Risk Matrix', icon: ShieldAlert },
              { id: 'simulate', label: 'AI Simulation Studio', icon: SlidersHorizontal },
              { id: 'bulletin', label: 'Official IMD Bulletin & Export', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveIntelligenceTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeIntelligenceTab === tab.id
                      ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>AI Multi-Horizon Intelligence</span>
          </div>

        </div>

        {/* Tab Contents */}
        <div className="p-5">
          
          {/* TAB 1: 72h Forecast Curves */}
          {activeIntelligenceTab === 'forecast' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    BiLSTM Neural Network Intensity & Pressure Lifecycle
                  </h4>
                  <p className="text-xs text-slate-500">
                    Multi-horizon trajectory forecast with 90% confidence uncertainty bounds
                  </p>
                </div>

                {/* Sub-tab switcher */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium border border-slate-200">
                  <button
                    onClick={() => setChartSubTab('wind')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      chartSubTab === 'wind' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                    }`}
                  >
                    Wind Speed (km/h)
                  </button>
                  <button
                    onClick={() => setChartSubTab('pressure')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      chartSubTab === 'pressure' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                    }`}
                  >
                    Central Pressure (hPa)
                  </button>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartSubTab === 'wind' ? (
                    <AreaChart data={aiPrediction.trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGradWindAI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284C7" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" km/h" width={65} domain={[30, 'dataMax + 20']} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08)' }} />
                      <ReferenceLine x="+24h" stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'LANDFALL (+24h)', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="upper" stroke="none" fill="#F0F9FF" name="90% Upper Bound" />
                      <Area type="monotone" dataKey="lower" stroke="none" fill="#FFFFFF" name="10% Lower Bound" />
                      <Area 
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#0284C7" 
                        strokeWidth={3} 
                        fill="url(#chartGradWindAI)" 
                        dot={{ r: 4, fill: '#fff', stroke: '#0284C7', strokeWidth: 2 }} 
                        name="BiLSTM Forecast Speed" 
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart data={aiPrediction.trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGradPressureAI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" hPa" width={65} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }} />
                      <ReferenceLine x="+24h" stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Lowest MSLP', fill: '#EF4444', fontSize: 10 }} />
                      <Area 
                        type="monotone" 
                        dataKey="pressure" 
                        stroke="#EF4444" 
                        strokeWidth={3} 
                        fill="url(#chartGradPressureAI)" 
                        dot={{ r: 4, fill: '#fff', stroke: '#EF4444', strokeWidth: 2 }} 
                        name="Predicted MSLP" 
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: Coastal Strike & Risk Matrix */}
          {activeIntelligenceTab === 'risk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    District-Wise Strike Probability & Marine Impact Matrix
                  </h4>
                  <p className="text-xs text-slate-500">
                    High-resolution impact matrix calculated via GIS spatial buffering and storm surge modeling
                  </p>
                </div>
                <span className="badge badge-red text-xs">
                  Red Alert Triggered
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 font-semibold text-slate-600">Coastal Sector / District</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">State</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Strike Probability</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Projected Surge</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">24h Rainfall</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Advisory Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {aiPrediction.strike_districts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.district}</td>
                        <td className="px-4 py-3 text-slate-600">{item.state}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${item.strike_prob_pct >= 70 ? 'bg-red-500' : item.strike_prob_pct >= 50 ? 'bg-amber-500' : 'bg-sky-500'}`} 
                                style={{ width: `${item.strike_prob_pct}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800">{item.strike_prob_pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">{item.surge_height_m}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">{item.rainfall_24h_mm} mm</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${
                            item.threat_level.includes('RED') ? 'badge-red' :
                            item.threat_level.includes('ORANGE') ? 'badge-orange' : 'badge-amber'
                          }`}>
                            {item.threat_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AI Simulation Studio */}
          {activeIntelligenceTab === 'simulate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Interactive Meteorological Parameter Sandbox
                  </h4>
                  <p className="text-xs text-slate-500">
                    Adjust environmental inputs (SST, wind shear, central MSLP) or upload custom satellite imagery
                  </p>
                </div>
                <button
                  onClick={handleRunAiInference}
                  disabled={isProcessing}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Neural Forecast</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">System Name:</label>
                  <input
                    type="text"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Basin:</label>
                  <select
                    value={inputBasin}
                    onChange={(e) => setInputBasin(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                  >
                    <option>Bay of Bengal</option>
                    <option>Arabian Sea</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Initial Latitude (°N):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputLat}
                    onChange={(e) => setInputLat(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Initial Longitude (°E):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputLon}
                    onChange={(e) => setInputLon(parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Wind Velocity ({inputWind} km/h):</label>
                  <input
                    type="range"
                    min="40"
                    max="250"
                    value={inputWind}
                    onChange={(e) => setInputWind(parseFloat(e.target.value))}
                    className="w-full accent-sky-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Central MSLP ({inputMslp} hPa):</label>
                  <input
                    type="range"
                    min="900"
                    max="1010"
                    value={inputMslp}
                    onChange={(e) => setInputMslp(parseFloat(e.target.value))}
                    className="w-full accent-red-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Sea Surface Temp ({inputSst}°C):</label>
                  <input
                    type="range"
                    min="25"
                    max="34"
                    step="0.1"
                    value={inputSst}
                    onChange={(e) => setInputSst(parseFloat(e.target.value))}
                    className="w-full accent-orange-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Upload Satellite Frame:</label>
                  <label className="w-full bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer truncate transition-colors">
                    <Upload className="w-3.5 h-3.5 text-sky-600" />
                    <span>{uploadedImage ? 'Satellite Frame Loaded' : 'Browse Satellite PNG/GeoTIFF'}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: Official IMD Bulletin & Export */}
          {activeIntelligenceTab === 'bulletin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Official National Disaster Management Advisory Bulletin
                  </h4>
                  <p className="text-xs text-slate-500">
                    Automated CAP ITU-T X.1303 formatted bulletin compiled for MoES, NDMA, and State EOCs
                  </p>
                </div>

                <button 
                  onClick={() => downloadOfficialBulletinPdf({
                    name: aiPrediction.name,
                    basin: aiPrediction.basin,
                    classification: aiPrediction.category,
                    lat: aiPrediction.current_lat,
                    lon: aiPrediction.current_lon,
                    windSpeed: aiPrediction.current_wind,
                    pressure: aiPrediction.current_pressure
                  })}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official PDF Bulletin</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs font-mono">
                <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-slate-500">
                  <span>BULLETIN NO.: VAYU-AI-2026/04</span>
                  <span>ISSUED BY: RSMC / IMD NEW DELHI</span>
                </div>
                <div className="text-slate-800 space-y-1 leading-relaxed">
                  <p><strong>SUBJECT:</strong> {aiPrediction.category.toUpperCase()} '{aiPrediction.name.toUpperCase()}' OVER {aiPrediction.basin.toUpperCase()}</p>
                  <p><strong>CURRENT LOCATION:</strong> LATITUDE {aiPrediction.current_lat}°N, LONGITUDE {aiPrediction.current_lon}°E (ESTIMATED DVORAK {aiPrediction.dvorak_t})</p>
                  <p><strong>MAXIMUM SUSTAINED WIND:</strong> {aiPrediction.current_wind} KM/H GUSTING TO {Math.round(aiPrediction.current_wind * 1.15)} KM/H</p>
                  <p><strong>ESTIMATED LANDFALL:</strong> {aiPrediction.landfall.location.toUpperCase()} AROUND {aiPrediction.landfall.window.toUpperCase()}</p>
                  <p><strong>STORM SURGE WARNING:</strong> INUNDATION OF {aiPrediction.landfall.surge} ABOVE ASTRONOMICAL TIDE EXPECTED OVER LOW-LYING COASTAL SECTORS</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
