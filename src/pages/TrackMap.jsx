import React, { useState, useEffect } from 'react';
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, 
  Circle, Polygon 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Play, Pause, RotateCcw, Compass, MapPin, 
  AlertTriangle, ShieldAlert, Wind, Waves, 
  Radio, Layers, CheckCircle, Clock
} from 'lucide-react';
import { TRACK_HISTORY, TRACK_PREDICTED } from '../data/mockData';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

L.Marker.prototype.options.icon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

const TIME_STEPS = [
  { step: 0, label: 'NOW', lat: 15.4, lon: 87.8, wind: 85, pressure: 980, stage: 'Cyclonic Storm', eta: 'Current Position' },
  { step: 1, label: '+6h', lat: 16.1, lon: 87.1, wind: 92, pressure: 974, stage: 'Severe Cyclonic Storm', eta: 'T + 6 hours' },
  { step: 2, label: '+12h', lat: 16.9, lon: 86.5, wind: 101, pressure: 966, stage: 'Severe Cyclonic Storm', eta: 'T + 12 hours' },
  { step: 3, label: '+24h', lat: 18.2, lon: 85.6, wind: 115, pressure: 955, stage: 'Very Severe Cyclonic Storm', eta: 'Landfall Window' },
  { step: 4, label: '+48h', lat: 20.1, lon: 84.2, wind: 105, pressure: 962, stage: 'Inland Weakening', eta: 'Post-Landfall' },
  { step: 5, label: '+72h', lat: 22.0, lon: 83.0, wind: 90, pressure: 970, stage: 'Deep Depression', eta: 'Dissipation' },
];

const COASTAL_DISTRICTS_RISK = [
  { district: 'Ganjam (Gopalpur)', state: 'Odisha', strikeProb: '82%', surge: '2.5 - 3.2 m', rain: 'Extremely Heavy (250mm)', status: 'RED ALERT' },
  { district: 'Srikakulam', state: 'Andhra Pradesh', strikeProb: '68%', surge: '1.8 - 2.4 m', rain: 'Heavy to Very Heavy (180mm)', status: 'RED ALERT' },
  { district: 'Puri & Jagatsinghpur', state: 'Odisha', strikeProb: '55%', surge: '1.5 - 2.0 m', rain: 'Heavy Rainfall (140mm)', status: 'ORANGE ALERT' },
  { district: 'Visakhapatnam', state: 'Andhra Pradesh', strikeProb: '42%', surge: '1.0 - 1.5 m', rain: 'Moderate to Heavy (90mm)', status: 'YELLOW ALERT' },
];

const CONE_POLYGON = [
  [15.4, 87.8],
  [16.8, 88.4], 
  [19.5, 88.0], 
  [23.0, 85.5],
  [22.5, 80.5], 
  [19.0, 82.0], 
  [16.0, 85.5],
  [15.4, 87.8],
];

const TrackMap = () => {
  const [activeStep, setActiveStep] = useState(3); // Default to +24h landfall
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCone, setShowCone] = useState(true);
  const [showSurge, setShowSurge] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);

  // Play animation loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev >= TIME_STEPS.length - 1 ? 0 : prev + 1));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentPoint = TIME_STEPS[activeStep];
  const predictedPathSlice = TIME_STEPS.slice(0, activeStep + 1).map(p => [p.lat, p.lon]);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-[#003087]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">4D Interactive Cyclone Track & Strike Visualizer</h1>
            <span className="badge badge-red">Landfall Window: T+24h</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            BiLSTM spatiotemporal trajectory propagation with multi-district strike probability modeling
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`btn-primary text-xs sm:text-sm py-2 px-4 gap-2 shadow-sm ${
              isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#003087]'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause Simulation' : 'Play Track Animation'}</span>
          </button>
          
          <button 
            onClick={() => { setActiveStep(0); setIsPlaying(false); }}
            className="btn-secondary text-xs sm:text-sm py-2 px-3 gap-1.5"
            title="Reset to initial position"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Geospatial Map Viewport (8 Cols) + Coastal District Vulnerability Panel (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Geospatial Map Canvas (8 Cols) */}
        <div className="xl:col-span-8 card overflow-hidden flex flex-col" style={{ minHeight: 600 }}>
          
          {/* Top Control Bar */}
          <div className="card-header bg-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            
            {/* Timeline Step Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TIME_STEPS.map((t) => (
                <button
                  key={t.step}
                  onClick={() => { setActiveStep(t.step); setIsPlaying(false); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeStep === t.step 
                      ? 'bg-[#003087] text-white shadow-xs scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Layer Toggles */}
            <div className="flex items-center gap-1.5 text-xs">
              <button 
                onClick={() => setShowCone(!showCone)}
                className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  showCone ? 'bg-orange-50 border-orange-300 text-orange-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                70% Cone
              </button>

              <button 
                onClick={() => setShowSurge(!showSurge)}
                className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  showSurge ? 'bg-red-50 border-red-300 text-red-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                Storm Surge Zone
              </button>

              <button 
                onClick={() => setShowWindRadii(!showWindRadii)}
                className={`px-2.5 py-1 rounded-md font-medium border transition-colors ${
                  showWindRadii ? 'bg-blue-50 border-blue-300 text-[#003087]' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                Gale Radii (R50)
              </button>
            </div>
          </div>

          {/* Leaflet Map Body */}
          <div className="flex-1 relative bg-slate-100 min-h-[500px]">
            <MapContainer 
              center={[17.5, 86.0]} 
              zoom={5.5} 
              scrollWheelZoom={true} 
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Confidence Cone */}
              {showCone && (
                <Polygon 
                  positions={CONE_POLYGON} 
                  pathOptions={{ 
                    color: '#F97316', 
                    fillColor: '#F97316', 
                    fillOpacity: 0.12, 
                    weight: 1.5, 
                    dashArray: '5,5' 
                  }} 
                />
              )}

              {/* Storm Surge Vulnerability Zone */}
              {showSurge && (
                <Circle 
                  center={[18.8, 85.0]} 
                  radius={180000} 
                  pathOptions={{ 
                    color: '#DC2626', 
                    fillColor: '#DC2626', 
                    fillOpacity: 0.15, 
                    weight: 1.5, 
                    dashArray: '4,4' 
                  }} 
                />
              )}

              {/* Observed Past Track */}
              <Polyline 
                positions={TRACK_HISTORY} 
                pathOptions={{ color: '#2563EB', weight: 3.5 }} 
              />

              {/* Dynamic Animated Forecast Track up to activeStep */}
              <Polyline 
                positions={predictedPathSlice} 
                pathOptions={{ color: '#DC2626', weight: 3.5, dashArray: '6,6' }} 
              />

              {/* Gale Wind Radii Circle around Current Point */}
              {showWindRadii && (
                <Circle 
                  center={[currentPoint.lat, currentPoint.lon]} 
                  radius={currentPoint.wind * 1500} 
                  pathOptions={{ 
                    color: '#003087', 
                    fillColor: '#003087', 
                    fillOpacity: 0.08, 
                    weight: 1.5 
                  }} 
                />
              )}

              {/* Origin Marker */}
              <Marker position={[15.4, 87.8]}>
                <Popup>
                  <div className="font-sans text-xs">
                    <strong>TC-2026-ALPHA (Initial Fix)</strong><br />
                    Lat: 15.4°N, Lon: 87.8°E<br />
                    Wind: 85 km/h
                  </div>
                </Popup>
              </Marker>

              {/* Active Step Target Marker */}
              <Marker position={[currentPoint.lat, currentPoint.lon]}>
                <Popup>
                  <div className="p-1 space-y-1 font-sans text-xs text-slate-800">
                    <div className="font-bold text-sm text-[#003087]">{currentPoint.label} Simulated Position</div>
                    <div><strong>Classification:</strong> {currentPoint.stage}</div>
                    <div><strong>Coordinates:</strong> {currentPoint.lat}°N, {currentPoint.lon}°E</div>
                    <div><strong>Estimated Intensity:</strong> {currentPoint.wind} km/h</div>
                    <div><strong>Central Pressure:</strong> {currentPoint.pressure} hPa</div>
                    <div className="text-red-600 font-semibold">{currentPoint.eta}</div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Time Step State Stamp */}
            <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="font-bold text-xs text-slate-900">Current Forecast Frame: {currentPoint.label}</span>
              </div>
              <div className="text-xs text-slate-600 font-mono">
                {currentPoint.lat}°N, {currentPoint.lon}°E • {currentPoint.wind} km/h • {currentPoint.pressure} hPa
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Coastal Vulnerability Matrix & Time Slider Details (4 Cols) */}
        <div className="xl:col-span-4 space-y-5 flex flex-col">
          
          {/* Active Frame Intelligence Dossier */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#003087]" />
                <h3 className="font-bold text-sm text-slate-900">Frame Telemetry ({currentPoint.label})</h3>
              </div>
              <span className="badge badge-navy">{currentPoint.eta}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Projected Stage:</span>
                <span className="font-bold text-[#003087]">{currentPoint.stage}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Sustained Wind Speed:</span>
                <span className="font-bold text-red-600">{currentPoint.wind} km/h</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Central Surface Pressure:</span>
                <span className="font-semibold text-slate-800">{currentPoint.pressure} hPa</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Estimated 50kt Gale Radius:</span>
                <span className="font-semibold text-slate-800">120 km from Eye</span>
              </div>
            </div>
          </div>

          {/* Coastal Strike Probability Matrix */}
          <div className="card p-5 space-y-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-slate-900">Vulnerable Coastal Districts</h3>
              </div>
              <span className="badge badge-red">Landfall Strike Index</span>
            </div>

            <div className="space-y-3">
              {COASTAL_DISTRICTS_RISK.map((dist, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{dist.district}</h4>
                      <p className="text-[10px] text-slate-400">{dist.state}</p>
                    </div>
                    <span className={`badge ${
                      dist.status === 'RED ALERT' ? 'badge-red' : dist.status === 'ORANGE ALERT' ? 'badge-orange' : 'badge-amber'
                    }`}>
                      {dist.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Strike Prob:</span>
                      <span className="font-bold text-red-600">{dist.strikeProb}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Storm Surge:</span>
                      <span className="font-semibold text-slate-800">{dist.surge}</span>
                    </div>
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
