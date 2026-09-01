import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, Target, Wind, ChevronRight, 
  Download, RefreshCw, TrendingUp, Layers, MapPin, 
  CheckCircle, Radio, Compass, ShieldAlert, FileText, 
  Maximize2, Minimize2, Eye, Gauge, Globe, Check,
  ChevronDown, ArrowUpRight, Sparkles, Upload, Play,
  Sliders, Cpu, ShieldCheck, Zap
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
  syncLiveSatelliteStream,
  processManualSatelliteData
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
      <div class="w-8 h-8 rounded-full ${isHighRisk ? 'bg-red-500/30' : 'bg-amber-500/30'} animate-ping absolute"></div>
      <div class="w-6 h-6 rounded-full ${isHighRisk ? 'bg-red-600' : 'bg-amber-600'} border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-bold">
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
      <div class="w-7 h-7 rounded-full bg-red-600/20 animate-ping absolute"></div>
      <div class="w-5 h-5 rounded-full bg-red-700 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
        🎯
      </div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Map Tile Providers
const MAP_PROVIDERS = [
  {
    id: 'esri-satellite',
    name: 'Esri Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
  },
  {
    id: 'carto-voyager',
    name: 'CartoDB Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  {
    id: 'carto-dark',
    name: 'CartoDB Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
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

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Pipeline Mode: 'automatic' | 'manual'
  const [ingestionMode, setIngestionMode] = useState('automatic');
  const [isMapClickPickerActive, setIsMapClickPickerActive] = useState(false);
  const [selectedMapProvider, setSelectedMapProvider] = useState(MAP_PROVIDERS[0]);
  const [isMapProviderDropdownOpen, setIsMapProviderDropdownOpen] = useState(false);
  const [chartTab, setChartTab] = useState(0);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Layer toggles
  const [showCone, setShowCone] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  const [showRadarClouds, setShowRadarClouds] = useState(true);

  // Manual Ingestion Form State
  const [inputName, setInputName] = useState('Cyclone MONITORED-01');
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
          name: `Live INSAT-3DR Stream (${liveRes.frame_timestamp.split(' ')[1]})`,
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
    <div className="space-y-5 max-w-[1500px] mx-auto pb-10 font-sans">
      
      {/* 1. Ingestion Control Strip: Automatic Feed vs Manual AI Studio */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Dual Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setIngestionMode('automatic')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                ingestionMode === 'automatic'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Automatic Live Telemetry Feed</span>
            </button>
            
            <button
              onClick={() => setIngestionMode('manual')}
              className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
                ingestionMode === 'manual'
                  ? 'bg-white text-[#003087] shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#003087]" />
              <span>Manual Input & AI Simulator Workbench</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {ingestionMode === 'automatic' 
              ? 'Real-time telemetry stream synced via ISRO MOSDAC & NOAA' 
              : 'Enter custom coordinates, wind, pressure or upload satellite image'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {ingestionMode === 'manual' && (
            <button
              onClick={() => setIsMapClickPickerActive(!isMapClickPickerActive)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                isMapClickPickerActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isMapClickPickerActive ? 'Click on Map to Set Center' : 'Pick Lat/Lon on Map'}</span>
            </button>
          )}

          {ingestionMode === 'automatic' ? (
            <button
              onClick={handleSyncLiveSatellite}
              disabled={isProcessing}
              className="bg-[#003087] hover:bg-[#001f5b] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : 'text-amber-300'}`} />
              <span>{isProcessing ? 'Syncing Satellite Stream...' : 'Fetch & Process Live Satellite Frame'}</span>
            </button>
          ) : (
            <button
              onClick={handleRunAiInference}
              disabled={isProcessing}
              className="bg-[#003087] hover:bg-[#001f5b] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isProcessing ? 'Processing AI Pipeline...' : 'Run AI Model Inference'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Manual Input Drawer (Rendered when Ingestion Mode is 'manual') */}
      {ingestionMode === 'manual' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#003087]" />
              AI/ML Telemetry Input Parameters
            </span>
            <span className="text-[11px] text-slate-400">CycloneForecast-LSTM & CycloneVision-CNN Pipeline</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
            
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">System Name:</label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">Ocean Basin:</label>
              <select
                value={inputBasin}
                onChange={(e) => setInputBasin(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
              >
                <option>Bay of Bengal</option>
                <option>Arabian Sea</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">Latitude (°N):</label>
              <input
                type="number"
                step="0.1"
                value={inputLat}
                onChange={(e) => setInputLat(parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">Longitude (°E):</label>
              <input
                type="number"
                step="0.1"
                value={inputLon}
                onChange={(e) => setInputLon(parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">Initial Wind (km/h):</label>
              <input
                type="number"
                step="1"
                value={inputWind}
                onChange={(e) => setInputWind(parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">Central MSLP (hPa):</label>
              <input
                type="number"
                step="1"
                value={inputMslp}
                onChange={(e) => setInputMslp(parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">Upload Satellite Frame:</label>
              <label className="w-full bg-white hover:bg-slate-100 border border-dashed border-slate-300 rounded px-2 py-1 text-xs text-slate-600 flex items-center justify-center gap-1 cursor-pointer truncate">
                <Upload className="w-3 h-3 text-[#003087]" />
                <span>{uploadedImage ? 'Image Loaded' : 'Browse PNG'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

          </div>
        </div>
      )}

      {/* 2. Top Executive AI Prediction KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'AI-Identified System', 
            val: aiPrediction.name, 
            sub: `${aiPrediction.basin} • Fix: ${aiPrediction.current_lat}°N, ${aiPrediction.current_lon}°E`, 
            badge: aiPrediction.category,
            badgeClass: aiPrediction.current_wind >= 115 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200',
            icon: Compass
          },
          { 
            label: 'Current Intensity', 
            val: `${aiPrediction.current_wind} km/h`, 
            sub: `Dvorak CI: ${aiPrediction.dvorak_t} • ${Math.round(aiPrediction.current_wind / 1.852)} knots`, 
            badge: aiPrediction.severity,
            badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
            icon: Wind
          },
          { 
            label: 'Central Sea-Level Pressure', 
            val: `${aiPrediction.current_pressure} hPa`, 
            sub: `Pressure Deficit: -${Math.round(1008 - aiPrediction.current_pressure)} hPa`, 
            badge: 'Model Estimate',
            badgeClass: 'bg-red-50 text-red-700 border-red-200',
            icon: Gauge
          },
          { 
            label: 'Predicted Landfall Corridor', 
            val: aiPrediction.landfall.location.split('(')[0], 
            sub: `${aiPrediction.landfall.window} • Surge: ${aiPrediction.landfall.surge}`, 
            badge: 'T+24h Landfall',
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: Target
          },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">{kpi.label}</span>
              <span className={`text-[10px] font-semibold border px-1.5 py-0.2 rounded ${kpi.badgeClass}`}>
                {kpi.badge}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-slate-900 tracking-tight">{kpi.val}</p>
            </div>
            <p className="text-xs text-slate-400 font-normal truncate">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Real Interactive Map Canvas with Dynamic AI Trajectory */}
      <div className={`bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col ${
        isMapFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
      }`}>
        
        {/* Map Header Toolbar */}
        <div className="px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              Dynamic AI Trajectory & Strike Visualizer
            </span>
            <span className="text-[11px] text-slate-400">
              (Origin: {aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E)
            </span>
          </div>

          {/* Layer Controls & Provider Switcher */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            
            {/* Real Map Layer Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsMapProviderDropdownOpen(!isMapProviderDropdownOpen)}
                className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md font-medium text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>{selectedMapProvider.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isMapProviderDropdownOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-slate-200 p-1 z-[1000] space-y-0.5">
                  {MAP_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedMapProvider(provider);
                        setIsMapProviderDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedMapProvider.id === provider.id 
                          ? 'bg-slate-100 text-slate-900 font-semibold' 
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{provider.name}</span>
                      {selectedMapProvider.id === provider.id && <Check className="w-3.5 h-3.5 text-[#003087]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Layer Toggles */}
            <button 
              onClick={() => setShowRadarClouds(!showRadarClouds)}
              className={`px-2.5 py-1 rounded-md font-medium border transition-colors flex items-center gap-1.5 ${
                showRadarClouds ? 'bg-blue-50 border-blue-200 text-[#003087]' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Radar Clouds
            </button>

            <button 
              onClick={() => setShowCone(!showCone)}
              className={`px-2.5 py-1 rounded-md font-medium border transition-colors flex items-center gap-1.5 ${
                showCone ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500" /> 70% Cone
            </button>

            <button 
              onClick={() => setShowSurge(!showSurge)}
              className={`px-2.5 py-1 rounded-md font-medium border transition-colors flex items-center gap-1.5 ${
                showSurge ? 'bg-red-50 border-red-200 text-red-800' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> Landfall Surge Zone
            </button>

            <button
              onClick={() => setIsMapFullscreen(!isMapFullscreen)}
              className="p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-slate-600 shadow-2xs"
              title={isMapFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isMapFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

        {/* Real Map Canvas */}
        <div className="relative w-full h-[560px] bg-slate-100">
          
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

            {/* Selected Map Tile Provider */}
            <TileLayer
              attribution={selectedMapProvider.attribution}
              url={selectedMapProvider.url}
            />

            {/* Live Weather Clouds Overlay */}
            {showRadarClouds && (
              <TileLayer
                attribution='Radar &copy; RainViewer'
                url="https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png"
                opacity={0.65}
              />
            )}

            {/* AI Generated 70% Confidence Cone of Uncertainty Polygon */}
            {showCone && aiPrediction.cone_polygon && (
              <Polygon 
                positions={aiPrediction.cone_polygon} 
                pathOptions={{ 
                  color: '#F97316', 
                  fillColor: '#F97316', 
                  fillOpacity: 0.14, 
                  weight: 1.5, 
                  dashArray: '5,5' 
                }} 
              />
            )}

            {/* Landfall Threat Zone Circle */}
            {showSurge && aiPrediction.landfall && (
              <Circle 
                center={[aiPrediction.landfall.lat, aiPrediction.landfall.lon]} 
                radius={200000} 
                pathOptions={{ 
                  color: '#DC2626', 
                  fillColor: '#DC2626', 
                  fillOpacity: 0.1, 
                  weight: 1.5, 
                  dashArray: '4,4' 
                }} 
              />
            )}

            {/* AI BiLSTM Predicted 72h Trajectory Line */}
            {aiPrediction.track_polyline && (
              <Polyline 
                positions={aiPrediction.track_polyline} 
                pathOptions={{ color: '#DC2626', weight: 3.5, dashArray: '6,6' }} 
              />
            )}

            {/* Starting Fix Marker with Animated Pulse */}
            <Marker 
              position={[aiPrediction.current_lat, aiPrediction.current_lon]}
              icon={createPulseIcon(aiPrediction.current_wind >= 100)}
            >
              <Popup>
                <div className="p-1 space-y-1 font-sans text-xs text-slate-800">
                  <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                    <span>{aiPrediction.name}</span>
                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">Fix</span>
                  </div>
                  <div><strong>Position:</strong> {aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E</div>
                  <div><strong>Estimated Wind:</strong> {aiPrediction.current_wind} km/h</div>
                  <div><strong>Central Pressure:</strong> {aiPrediction.current_pressure} hPa</div>
                  <div><strong>Dvorak T-Number:</strong> {aiPrediction.dvorak_t}</div>
                  <div className="pt-1 text-red-600 font-semibold border-t border-slate-100">
                    {aiPrediction.category}
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Projected Landfall Marker Point */}
            {aiPrediction.landfall && (
              <Marker 
                position={[aiPrediction.landfall.lat, aiPrediction.landfall.lon]}
                icon={createLandfallIcon()}
              >
                <Popup>
                  <div className="font-sans text-xs space-y-1">
                    <strong className="text-red-700 block text-xs">AI Projected Landfall Point</strong>
                    <span className="font-semibold text-slate-800">{aiPrediction.landfall.location}</span><br />
                    <span className="text-slate-600 text-[11px]">Timing: {aiPrediction.landfall.window}</span><br />
                    <span className="text-red-600 font-bold text-[11px]">Surge: {aiPrediction.landfall.surge}</span>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Clean Vercel-Style Floating Inspection Sheet */}
          <div className="absolute top-3 right-3 z-[400] max-w-xs w-full">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-3.5 shadow-lg space-y-3 text-slate-800">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <h3 className="font-semibold text-xs text-slate-900 truncate">
                    {aiPrediction.name}
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                  {aiPrediction.dvorak_t}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Center Fix:</span>
                  <span className="font-semibold text-slate-800">{aiPrediction.current_lat}°N, {aiPrediction.current_lon}°E</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Steering Vector:</span>
                  <span className="font-semibold text-slate-800">{aiPrediction.movement}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sea Surface Temp:</span>
                  <span className="font-semibold text-orange-600">{aiPrediction.sst}°C</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Vertical Wind Shear:</span>
                  <span className="font-semibold text-blue-600">{aiPrediction.shear} knots</span>
                </div>
              </div>

              {/* Coastal Strike Chances */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Coastal Strike Probability:</span>
                <div className="space-y-1 text-[11px]">
                  {aiPrediction.strike_districts.slice(0, 3).map((dist, dIdx) => (
                    <div key={dIdx} className="flex items-center justify-between">
                      <span className="text-slate-700 truncate max-w-[170px]">{dist.district.split('(')[0]}</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        dist.strike_prob_pct >= 70 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {dist.strike_prob_pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projected Landfall Banner */}
              <div className="bg-red-50 border border-red-200 rounded-md p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-red-700 block">Landfall Window</span>
                  <span className="text-xs font-semibold text-red-900 truncate max-w-[170px] block">
                    {aiPrediction.landfall.location}
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-medium text-red-700 hover:text-red-900 underline flex items-center gap-0.5 flex-shrink-0"
                >
                  Details →
                </button>
              </div>

            </div>
          </div>

          {/* Bottom Left Clean Legend */}
          <div className="absolute bottom-3 left-3 z-[400] bg-white/90 backdrop-blur-xs text-slate-700 text-xs rounded-md p-2.5 border border-slate-200 shadow-sm space-y-1">
            <div className="font-semibold text-[11px] text-slate-900 mb-1">AI Trajectory Forecast</div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-1 bg-[#DC2626] rounded inline-block" /> 72h BiLSTM Projected Path
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2.5 h-2.5 bg-orange-400/30 border border-orange-400 rounded-xs inline-block" /> 70% Confidence Strike Cone
            </div>
          </div>

        </div>
      </div>

      {/* 4. Multi-Horizon Forecast Curves vs Official Advisory Dispatch */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Forecast Progression Curve (8 Cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#003087]" />
                <h3 className="font-semibold text-sm text-slate-900">
                  AI Intensity & MSLP Lifecycle Projections
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-horizon BiLSTM neural network forecast with 90% confidence uncertainty envelopes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-md text-xs font-medium border border-slate-200">
                <button
                  onClick={() => setChartTab(0)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    chartTab === 0 ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                  }`}
                >
                  Wind Velocity (km/h)
                </button>
                <button
                  onClick={() => setChartTab(1)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    chartTab === 1 ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500'
                  }`}
                >
                  MSLP Pressure (hPa)
                </button>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartTab === 0 ? (
                <AreaChart data={aiPrediction.trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradWindAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003087" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#003087" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" km/h" width={65} domain={[30, 'dataMax + 20']} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} />
                  <ReferenceLine x="+24h" stroke="#DC2626" strokeDasharray="4 4" label={{ value: 'LANDFALL (+24h)', fill: '#DC2626', fontSize: 10, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="#EFF6FF" name="90% Upper Bound" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="#FFFFFF" name="10% Lower Bound" />
                  <Area 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="#003087" 
                    strokeWidth={2.5} 
                    fill="url(#chartGradWindAI)" 
                    dot={{ r: 4, fill: '#fff', stroke: '#003087', strokeWidth: 2 }} 
                    name="BiLSTM Forecast Speed" 
                  />
                </AreaChart>
              ) : (
                <AreaChart data={aiPrediction.trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradPressureAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" hPa" width={65} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <ReferenceLine x="+24h" stroke="#DC2626" strokeDasharray="4 4" label={{ value: 'Lowest MSLP', fill: '#DC2626', fontSize: 10 }} />
                  <Area 
                    type="monotone" 
                    dataKey="pressure" 
                    stroke="#DC2626" 
                    strokeWidth={2.5} 
                    fill="url(#chartGradPressureAI)" 
                    dot={{ r: 4, fill: '#fff', stroke: '#DC2626', strokeWidth: 2 }} 
                    name="Predicted MSLP" 
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Directives & PDF Generator (4 Cols) */}
        <div className="xl:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">AI Early Warning Directives</h3>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                {aiPrediction.severity}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-red-50 border-l-4 border-red-600 rounded-r-md space-y-1 text-red-900">
                <strong className="block text-xs font-semibold">1. Landfall Impact Corridor</strong>
                <p className="text-[11px] text-red-800 leading-relaxed font-normal">
                  Projected landfall near {aiPrediction.landfall.location} around {aiPrediction.landfall.window}. Estimated storm surge: {aiPrediction.landfall.surge}.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-md space-y-1 text-amber-900">
                <strong className="block text-xs font-semibold">2. District Preparedness Directives</strong>
                <p className="text-[11px] text-amber-800 leading-relaxed font-normal">
                  Immediate marine operations suspension advised across {aiPrediction.basin}. Cyclone shelters and emergency evacuations prioritized for high strike probability sectors.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
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
              className="w-full bg-[#003087] hover:bg-[#001f5b] text-white py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Official AI Bulletin (PDF)</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Compiled via Python ReportLab API with official IMD meteorological format
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
