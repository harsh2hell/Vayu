/**
 * VayuEarth.jsx
 * =============
 * VAYU Earth — Global Geospatial Cyclone & Atmospheric Intelligence Explorer
 * Powered by Windy.com Live Weather Engine & GDACS / IBTrACS Ingestion
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe2, Wind, CloudRain, Satellite, Thermometer, Waves,
  Gauge, AlertTriangle, Eye, ArrowUpRight, Compass, RefreshCw,
  Layers, MapPin, Radio
} from 'lucide-react';
import { toPortalPath } from '../utils/domain';

const WINDY_API_KEY = "h8RC1gtsg6HRNS4Ig1VW0J25sYgQd0re";

const OVERLAYS = [
  { id: 'wind', label: 'Wind Particles', icon: Wind },
  { id: 'radar', label: 'Rain & Radar', icon: CloudRain },
  { id: 'satellite', label: 'Satellite IR', icon: Satellite },
  { id: 'waves', label: 'Ocean Waves', icon: Waves },
  { id: 'temp', label: 'Temperature', icon: Thermometer },
  { id: 'pressure', label: 'Pressure Isolines', icon: Gauge },
];

const VayuEarth = () => {
  const navigate = useNavigate();

  // State
  const [activeOverlay, setActiveOverlay] = useState('wind');
  const [cyclones, setCyclones] = useState([]);
  const [selectedCyclone, setSelectedCyclone] = useState(null);
  const [centerCoords, setCenterCoords] = useState({ lat: 18.5, lon: 84.5 });
  const [zoomLevel, setZoomLevel] = useState(4);
  const [loading, setLoading] = useState(true);

  // Fetch live active cyclones from backend (GDACS + IBTrACS)
  useEffect(() => {
    fetch('/api/v1/cyclones/all')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cyclones && data.cyclones.length > 0) {
          setCyclones(data.cyclones);
          // Set first cyclone as default selected
          const first = data.cyclones[0];
          setSelectedCyclone(first);
          const loc = first.track_forecast?.[0];
          if (loc && loc.lat && loc.lon) {
            setCenterCoords({ lat: loc.lat, lon: loc.lon });
          }
        }
      })
      .catch(err => {
        console.warn('[VAYU Earth] Could not fetch cyclone data:', err);
      });
  }, []);

  // Handle cyclone selection to center Windy
  const handleSelectCyclone = (cyclone) => {
    setSelectedCyclone(cyclone);
    const loc = cyclone.track_forecast?.[0];
    if (loc && loc.lat && loc.lon) {
      setCenterCoords({ lat: loc.lat, lon: loc.lon });
      setZoomLevel(6);
    }
  };

  // Build Windy Embed URL safely without clobbering DOM or conflicting with Leaflet
  const windyEmbedUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=${zoomLevel}&overlay=${activeOverlay}&product=ecmwf&level=surface&lat=${centerCoords.lat}&lon=${centerCoords.lon}&message=true&key=${WINDY_API_KEY}`;

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden min-h-0"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', height: '100%', minHeight: '100%' }}
    >
      
      {/* Top HUD: VAYU Earth & Layer Controls */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Badge & Storm Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white font-bold text-xs tracking-wide">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
            <span>VAYU Earth</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
              LIVE WINDY
            </span>
          </div>

          {/* Quick Storm Tabs */}
          {cyclones.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-lg">
              {cyclones.slice(0, 3).map(c => (
                <button
                  key={c.id || c.name}
                  onClick={() => handleSelectCyclone(c)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedCyclone?.name === c.name 
                      ? 'bg-sky-500 text-white shadow-sm' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  🌀 {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Layer Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl pointer-events-auto overflow-x-auto">
          {OVERLAYS.map(layer => {
            const Icon = layer.icon;
            const isActive = activeOverlay === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveOverlay(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-sky-500 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{layer.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Selected Cyclone Floating Telemetry Card */}
      {selectedCyclone && (
        <div className="absolute bottom-4 left-4 z-20 max-w-xs sm:max-w-sm w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">{selectedCyclone.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                {selectedCyclone.category || 'Cyclonic Storm'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Basin:</span>
              <span className="font-semibold">{selectedCyclone.basin || 'North Indian Ocean'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Max Wind:</span>
              <span className="font-semibold text-amber-400">{selectedCyclone.intensity_knots || 65} kts</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Central Pressure:</span>
              <span className="font-semibold">{selectedCyclone.central_pressure_hpa || 988} hPa</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Coordinates:</span>
              <span className="font-mono text-[11px]">{centerCoords.lat.toFixed(1)}°N, {centerCoords.lon.toFixed(1)}°E</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
            <button
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>View Full 4D AI Trajectory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Windy.com Live Embedded Map Engine */}
      <div className="flex-1 w-full h-full relative z-10 bg-slate-950 min-h-0">
        <iframe
          key={`${activeOverlay}-${centerCoords.lat}-${centerCoords.lon}-${zoomLevel}`}
          src={windyEmbedUrl}
          title="Windy.com Global Satellite & Weather Stream"
          className="w-full h-full border-0 absolute inset-0"
          style={{ width: '100%', height: '100%', border: 0 }}
          onLoad={() => setLoading(false)}
        />
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-mono text-xs z-20 bg-slate-950 pointer-events-none">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span>Connecting to Windy.com Satellite Stream...</span>
          </div>
        )}
      </div>

      <style>{`@keyframes vayu-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VayuEarth;
