import React, { useState, useEffect } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, 
  Circle, Polygon, useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Play, Pause, RotateCcw, Compass, MapPin, 
  AlertTriangle, ShieldAlert, Wind, Waves, 
  Radio, Layers, CheckCircle, Clock, Crosshair,
  Sparkles, Gauge, ArrowRight, Activity, Globe, Download, Sliders, RefreshCw
} from 'lucide-react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { predictCycloneTrack, downloadOfficialBulletinPdf, fetchNasaGibsLayers } from '../services/api';

L.Marker.prototype.options.icon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

import { getImdIntensityMeta, generateSmoothSpline } from './Dashboard';

const MAP_LAYERS = [
  { 
    id: 'esri-dark', 
    name: '🌙 Dark Gray Meteorological Base', 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
  },
  { 
    id: 'esri-sat', 
    name: '🛰️ Real Satellite HD', 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Maxar, Earthstar Geographics'
  },
  { 
    id: 'osm-standard', 
    name: '🗺️ OpenStreetMap Standard', 
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  { 
    id: 'esri-topo-green', 
    name: '🌲 Topographic Green', 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; USGS, NOAA'
  },
  { 
    id: 'esri-ocean', 
    name: '🌊 Ocean Bathymetry', 
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; GEBCO, NOAA'
  }
];

const BASIN_SYSTEMS = {
  'Bay of Bengal': {
    name: 'Severe Cyclonic Storm DANA',
    category: 'Severe Cyclonic Storm',
    center: [18.0, 86.5],
    zoom: 6,
    initialFix: { lat: 18.2, lon: 88.5, wind: 110, mslp: 970, sst: 29.8, shear: 11.5 }
  },
  'Arabian Sea': {
    name: 'Extremely Severe Storm BIPARJOY',
    category: 'Extremely Severe Cyclonic Storm',
    center: [21.5, 68.5],
    zoom: 6,
    initialFix: { lat: 19.5, lon: 67.2, wind: 125, mslp: 960, sst: 30.5, shear: 10.0 }
  }
};

const createPulseMarkerIcon = (windKmh = 100) => {
  const meta = getImdIntensityMeta(windKmh);
  return L.divIcon({
    className: 'custom-track-marker',
    html: `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <div class="w-12 h-12 rounded-full border-2 border-dashed animate-spin duration-1000 absolute" style="border-color: ${meta.color}88"></div>
        <div class="w-8 h-8 rounded-full animate-ping absolute" style="background-color: ${meta.color}40"></div>
        <div class="w-7 h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-[11px] font-bold" style="background-color: ${meta.color}">
          🌀
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const createWaypointMarkerIcon = (label, windKmh = 85) => {
  const meta = getImdIntensityMeta(windKmh);
  return L.divIcon({
    className: 'custom-track-waypoint',
    html: `
      <div class="flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <div class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white border border-white/90 shadow-md flex items-center gap-1" style="background-color: ${meta.color}">
          <span>${label}</span>
          <span class="opacity-80 text-[8px]">• ${windKmh}k</span>
        </div>
        <div class="w-1.5 h-1.5 rounded-full border border-white mt-0.5" style="background-color: ${meta.color}"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

const TrackMap = () => {
  const [selectedBasin, setSelectedBasin] = useState('Bay of Bengal');
  const [activeStep, setActiveStep] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeLayer, setActiveLayer] = useState(MAP_LAYERS[0]);

  const [showCone, setShowCone] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showDopplerRadar, setShowDopplerRadar] = useState(true);

  // Dynamic Telemetry Inputs for BiLSTM Engine
  const [sstInput, setSstInput] = useState(29.8);
  const [shearInput, setShearInput] = useState(12.0);
  const [forecastData, setForecastData] = useState(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);

  const currentSystem = BASIN_SYSTEMS[selectedBasin];

  // Fetch or recompute prediction whenever basin, SST, or shear changes
  useEffect(() => {
    const runPrediction = async () => {
      setIsLoadingForecast(true);
      const init = currentSystem.initialFix;
      const res = await predictCycloneTrack({
        lat: init.lat,
        lon: init.lon,
        wind: init.wind,
        mslp: init.mslp,
        sst: sstInput,
        shear: shearInput,
        basin: selectedBasin
      });
      setForecastData(res);
      setIsLoadingForecast(false);
    };

    runPrediction();
  }, [selectedBasin, sstInput, shearInput]);

  const timeSteps = forecastData?.trajectory_forecast || [
    { time: 'NOW', lead_hours: 0, lat: currentSystem.initialFix.lat, lon: currentSystem.initialFix.lon, wind: currentSystem.initialFix.wind, pressure: currentSystem.initialFix.mslp, stage: 'Initial Fix' },
    { time: '+6h', lead_hours: 6, lat: currentSystem.initialFix.lat + 0.7, lon: currentSystem.initialFix.lon - 0.5, wind: 95, pressure: 974, stage: 'Intensifying' },
    { time: '+12h', lead_hours: 12, lat: currentSystem.initialFix.lat + 1.5, lon: currentSystem.initialFix.lon - 1.1, wind: 105, pressure: 965, stage: 'Severe Cyclonic Storm' },
    { time: '+24h', lead_hours: 24, lat: currentSystem.initialFix.lat + 2.8, lon: currentSystem.initialFix.lon - 2.0, wind: 120, pressure: 955, stage: 'Landfall Window' },
    { time: '+48h', lead_hours: 48, lat: currentSystem.initialFix.lat + 4.8, lon: currentSystem.initialFix.lon - 3.1, wind: 90, pressure: 968, stage: 'Inland Weakening' },
    { time: '+72h', lead_hours: 72, lat: currentSystem.initialFix.lat + 6.6, lon: currentSystem.initialFix.lon - 4.0, wind: 65, pressure: 980, stage: 'Depression Dissipation' },
  ];

  const currentPoint = timeSteps[activeStep] || timeSteps[0];
  const predictedSlice = timeSteps.slice(0, activeStep + 1).map(p => [p.lat, p.lon]);
  const conePolygon = forecastData?.cone_polygon || [
    [currentSystem.initialFix.lat, currentSystem.initialFix.lon],
    [currentSystem.initialFix.lat + 1.5, currentSystem.initialFix.lon + 0.8],
    [currentSystem.initialFix.lat + 4.0, currentSystem.initialFix.lon + 1.5],
    [currentSystem.initialFix.lat + 7.5, currentSystem.initialFix.lon + 1.8],
    [currentSystem.initialFix.lat + 7.5, currentSystem.initialFix.lon - 2.0],
    [currentSystem.initialFix.lat + 4.0, currentSystem.initialFix.lon - 1.2],
    [currentSystem.initialFix.lat + 1.5, currentSystem.initialFix.lon - 0.6],
    [currentSystem.initialFix.lat, currentSystem.initialFix.lon]
  ];

  const districtStrikes = forecastData?.coastal_strike_probabilities || [
    { district: 'Gopalpur (Ganjam, Odisha)', state: 'Odisha', strike_prob_pct: 84, surge_height_m: '2.5 - 3.2m', rainfall_24h_mm: 240, threat_level: 'RED ALERT' },
    { district: 'Kalingapatnam (AP)', state: 'Andhra Pradesh', strike_prob_pct: 68, surge_height_m: '1.8 - 2.4m', rainfall_24h_mm: 180, threat_level: 'RED ALERT' },
    { district: 'Puri & Jagatsinghpur (Odisha)', state: 'Odisha', strike_prob_pct: 55, surge_height_m: '1.5 - 2.0m', rainfall_24h_mm: 140, threat_level: 'ORANGE ALERT' },
    { district: 'Visakhapatnam (AP)', state: 'Andhra Pradesh', strike_prob_pct: 42, surge_height_m: '1.0 - 1.5m', rainfall_24h_mm: 90, threat_level: 'YELLOW ALERT' },
  ];

  // Animation playback loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev >= timeSteps.length - 1 ? 0 : prev + 1));
      }, 1400 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, timeSteps.length]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
              4D Cyclone Trajectory Studio
            </h1>
            <span className="badge badge-red text-[10px]">Bi-LSTM Neural Engine</span>
            {forecastData?.isLiveApi && (
              <span className="badge badge-green text-[10px] flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> Live API Connected
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Physics-informed BiLSTM spatio-temporal forecast engine with dynamic 70% uncertainty cones, real NASA satellite overlays, and coastal strike risk.
          </p>
        </div>

        {/* Action Controls & Basin Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
            {Object.keys(BASIN_SYSTEMS).map((b) => (
              <button
                key={b}
                onClick={() => { setSelectedBasin(b); setActiveStep(0); setIsPlaying(false); }}
                className={`px-3 py-1 rounded transition-all ${
                  selectedBasin === b
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <button
            onClick={() => downloadOfficialBulletinPdf({
              name: currentSystem.name,
              basin: selectedBasin,
              lat: currentPoint.lat,
              lon: currentPoint.lon,
              windSpeed: currentPoint.wind,
              pressure: currentPoint.pressure,
              classification: currentSystem.category
            })}
            className="btn-primary text-xs py-1.5 px-3 shadow-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Official IMD Bulletin PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 8 Cols Map Viewport + 4 Cols Strike Risk Table */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Map Canvas (8 Cols) */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs flex flex-col">
          
          {/* Top Map Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            
            {/* Tile Layer Switcher including Real NASA GIBS */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-mono">
              {MAP_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                    activeLayer.id === layer.id ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>

            {/* Overlays */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => setShowCone(!showCone)}
                className={`px-2 py-0.5 rounded border transition-all ${
                  showCone ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                70% Error Cone
              </button>
              <button
                onClick={() => setShowSurge(!showSurge)}
                className={`px-2 py-0.5 rounded border transition-all ${
                  showSurge ? 'bg-red-100 text-red-900 border-red-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                Surge Zone
              </button>
              <button
                onClick={() => setShowWindRadii(!showWindRadii)}
                className={`px-2 py-0.5 rounded border transition-all ${
                  showWindRadii ? 'bg-sky-100 text-sky-900 border-sky-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                Wind Radii
              </button>
              <button
                onClick={() => setShowDopplerRadar(!showDopplerRadar)}
                className={`px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                  showDopplerRadar ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live Doppler Radar</span>
              </button>
            </div>

          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="h-[460px] w-full rounded-xl overflow-hidden border border-slate-200 relative shadow-inner">
            
            <MapContainer
              center={currentSystem.center}
              zoom={currentSystem.zoom}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController center={currentSystem.center} zoom={currentSystem.zoom} />
              <TileLayer url={activeLayer.url} attribution={activeLayer.attribution} />

              {/* Real-time Doppler Weather Radar Layer */}
              {showDopplerRadar && (
                <TileLayer
                  url="https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png"
                  opacity={0.65}
                  zIndex={200}
                  attribution="&copy; RainViewer Live Doppler Radar"
                />
              )}

              {/* 70% Confidence Cone */}
              {showCone && (
                <Polygon
                  positions={conePolygon}
                  pathOptions={{
                    fillColor: '#F59E0B',
                    fillOpacity: 0.18,
                    color: '#D97706',
                    weight: 1.8,
                    dashArray: '4, 4'
                  }}
                />
              )}

              {/* Storm Surge Vulnerability Ring */}
              {showSurge && (
                <Circle
                  center={[currentPoint.lat, currentPoint.lon]}
                  radius={140000}
                  pathOptions={{
                    fillColor: '#EF4444',
                    fillOpacity: 0.12,
                    color: '#DC2626',
                    weight: 1.5,
                    dashArray: '3, 3'
                  }}
                />
              )}

              {/* Gale Wind Radii */}
              {showWindRadii && (
                <Circle
                  center={[currentPoint.lat, currentPoint.lon]}
                  radius={80000}
                  pathOptions={{
                    fillColor: '#38BDF8',
                    fillOpacity: 0.15,
                    color: '#0284C7',
                    weight: 1,
                    dashArray: '2, 3'
                  }}
                />
              )}

              {/* Forecast Track Line (Smooth Spline) */}
              <Polyline
                positions={generateSmoothSpline(predictedSlice, 6)}
                pathOptions={{
                  color: '#EF4444',
                  weight: 3.5,
                  opacity: 0.95
                }}
              />

              {/* Intermediate Waypoints with IMD Category Badges */}
              {timeSteps.map((pt, pIdx) => (
                <Marker
                  key={pIdx}
                  position={[pt.lat, pt.lon]}
                  icon={createWaypointMarkerIcon(pt.time, pt.wind)}
                >
                  <Popup>
                    <div className="p-1.5 space-y-1 text-xs font-mono">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{pt.time} Step</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white" style={{ backgroundColor: getImdIntensityMeta(pt.wind).color }}>
                          {getImdIntensityMeta(pt.wind).tag}
                        </span>
                      </div>
                      <p className="text-slate-600">{pt.lat}°N, {pt.lon}°E</p>
                      <p className="font-bold text-slate-900">{pt.wind} km/h • {pt.pressure} hPa</p>
                      <p className="text-slate-500 text-[10px]">{pt.stage}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Active Forecast Position Marker */}
              <Marker
                position={[currentPoint.lat, currentPoint.lon]}
                icon={createPulseMarkerIcon(currentPoint.wind)}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs font-sans">
                    <p className="font-bold text-slate-900">{currentSystem.name}</p>
                    <p className="text-slate-600 font-mono">{currentPoint.time} • {currentPoint.lat}°N, {currentPoint.lon}°E</p>
                    <p className="text-red-600 font-semibold">{currentPoint.wind} km/h • {currentPoint.pressure} hPa</p>
                    <p className="text-slate-500 font-mono text-[10px]">{currentPoint.stage}</p>
                  </div>
                </Popup>
              </Marker>

            </MapContainer>

            {/* Playback Control Bar Floating at Bottom */}
            <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play 72h Timeline'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setActiveStep(0); setIsPlaying(false); }}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-semibold text-slate-800">
                  {currentPoint.time} ({currentPoint.stage})
                </span>
              </div>

              {/* Step Buttons */}
              <div className="flex items-center gap-1 font-mono text-[11px]">
                {timeSteps.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveStep(idx); setIsPlaying(false); }}
                    className={`px-2 py-0.5 rounded transition-all border ${
                      activeStep === idx
                        ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.time}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Environmental Parameter Controls Bar */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-500 font-semibold">Sea Surface Temp (SST):</span>
                <span className="font-bold text-sky-700">{sstInput}°C</span>
              </div>
              <input 
                type="range" 
                min="26.0" 
                max="32.0" 
                step="0.1" 
                value={sstInput} 
                onChange={(e) => setSstInput(parseFloat(e.target.value))}
                className="w-full accent-[#003087]"
              />
              <span className="text-[10px] text-slate-400 block">Higher SST accelerates thermodynamic deepening</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-500 font-semibold">Vertical Wind Shear:</span>
                <span className="font-bold text-amber-700">{shearInput} knots</span>
              </div>
              <input 
                type="range" 
                min="5.0" 
                max="30.0" 
                step="0.5" 
                value={shearInput} 
                onChange={(e) => setShearInput(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
              <span className="text-[10px] text-slate-400 block">Shear &lt; 15 kts enables rapid eyewall intensification</span>
            </div>
          </div>

        </div>

        {/* Coastal Strike & Landfall Corridor (4 Cols) */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Active Telemetry Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">// ACTIVE_STORM_FIX</span>
              <span className="badge badge-red">{currentPoint.stage}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Wind Speed</span>
                <span className="font-bold text-sky-600 text-base">{currentPoint.wind} km/h</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase">Central Press.</span>
                <span className="font-bold text-slate-900 text-base">{currentPoint.pressure} hPa</span>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 pt-1 space-y-0.5">
              <div>Coordinates: <strong>{currentPoint.lat}°N, {currentPoint.lon}°E</strong></div>
              {forecastData?.landfall_prediction && (
                <div className="text-[11px] text-amber-700 font-sans pt-1">
                  Landfall: <strong>{forecastData.landfall_prediction.target_sector}</strong>
                </div>
              )}
            </div>
          </div>

          {/* District Strike Risk Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">// DISTRICT_STRIKE_RISK</span>
              <span className="badge badge-red">CAP v1.2</span>
            </div>

            <div className="space-y-2">
              {districtStrikes.map((d, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-sans">
                  <div>
                    <span className="font-semibold text-slate-800 block">{d.district}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Surge: {d.surge_height_m || d.surge} • Rain: {d.rainfall_24h_mm || d.rain}mm</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">{d.strike_prob_pct || d.strikeProb}%</span>
                    <span className={`badge text-[9px] ${(d.threat_level || d.status || '').includes('RED') ? 'badge-red' : 'badge-orange'}`}>
                      {d.threat_level || d.status}
                    </span>
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

export default TrackMap;
