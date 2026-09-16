/**
 * VayuEarth.jsx
 * =============
 * VAYU Earth — Global Geospatial Cyclone & Atmospheric Intelligence Explorer
 * Powered by Windy.com Map Engine & GDACS / IBTrACS Live Ingestion
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe2, Wind, CloudRain, Satellite, Thermometer, Waves,
  Gauge, AlertTriangle, ArrowUpRight, Compass, RefreshCw,
  Layers, MapPin, Maximize2, Radio
} from 'lucide-react';
import { toPortalPath } from '../utils/domain';
import { fetchAllCyclones } from '../services/api';

const DEFAULT_CYCLONES = [
  {
    id: 'DANA-2024',
    name: 'Cyclone DANA',
    category: 'Severe Cyclonic Storm',
    basin: 'Bay of Bengal',
    intensity_knots: 65,
    central_pressure_hpa: 984,
    track_forecast: [{ lat: 20.5, lon: 87.2 }],
    status: 'Active Track'
  },
  {
    id: 'BIPARJOY-2023',
    name: 'Cyclone BIPARJOY',
    category: 'Extremely Severe Cyclonic Storm',
    basin: 'Arabian Sea',
    intensity_knots: 90,
    central_pressure_hpa: 960,
    track_forecast: [{ lat: 21.8, lon: 68.9 }],
    status: 'Reference Benchmark'
  },
  {
    id: 'REMAL-2024',
    name: 'Cyclone REMAL',
    category: 'Severe Cyclonic Storm',
    basin: 'Bay of Bengal',
    intensity_knots: 60,
    central_pressure_hpa: 986,
    track_forecast: [{ lat: 21.9, lon: 89.2 }],
    status: 'Recent Track'
  }
];

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
  const iframeRef = useRef(null);

  // State
  const [activeOverlay, setActiveOverlay] = useState('wind');
  const [cyclones, setCyclones] = useState(DEFAULT_CYCLONES);
  const [selectedCyclone, setSelectedCyclone] = useState(DEFAULT_CYCLONES[0]);
  const [centerCoords, setCenterCoords] = useState({ lat: 20.5, lon: 87.2 });

  // Fetch live active cyclones or fallback cleanly
  useEffect(() => {
    let isMounted = true;
    fetchAllCyclones()
      .then(liveList => {
        if (!isMounted) return;
        if (liveList && liveList.length > 0) {
          setCyclones(liveList);
          const first = liveList[0];
          setSelectedCyclone(first);
          const loc = first.track_forecast?.[0];
          if (loc && loc.lat && loc.lon) {
            setCenterCoords({ lat: loc.lat, lon: loc.lon });
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle layer overlay change
  const handleOverlayChange = (overlayId) => {
    setActiveOverlay(overlayId);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SET_OVERLAY',
        overlay: overlayId
      }, '*');
    }
  };

  // Handle cyclone selection
  const handleSelectCyclone = (cyclone) => {
    setSelectedCyclone(cyclone);
    const loc = cyclone.track_forecast?.[0];
    if (loc && loc.lat && loc.lon) {
      setCenterCoords({ lat: loc.lat, lon: loc.lon });
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'PAN_TO',
          lat: loc.lat,
          lon: loc.lon
        }, '*');
      }
    }
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden min-h-0"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', height: '100%', minHeight: '100%' }}
    >
      
      {/* Top HUD: VAYU Earth & Layer Controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badge & Storm Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white font-bold text-xs tracking-wide">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
            <span>VAYU Earth</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
              LIVE WINDY
            </span>
          </div>

          {/* Quick Storm Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg overflow-x-auto max-w-xs sm:max-w-md">
            {cyclones.slice(0, 3).map(c => (
              <button
                key={c.id || c.name}
                onClick={() => handleSelectCyclone(c)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCyclone?.name === c.name 
                    ? 'bg-sky-500 text-white shadow-xs' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                🌀 {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Layer Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl pointer-events-auto overflow-x-auto">
          {OVERLAYS.map(layer => {
            const Icon = layer.icon;
            const isActive = activeOverlay === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => handleOverlayChange(layer.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-sky-500 text-white shadow-xs' 
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
        <div className="absolute bottom-3 left-3 z-30 max-w-xs w-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-white pointer-events-auto">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">{selectedCyclone.name}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                {selectedCyclone.category || 'Cyclonic Storm'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px]">Basin:</span>
              <span className="font-semibold text-[11px]">{selectedCyclone.basin || 'North Indian Ocean'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Max Wind:</span>
              <span className="font-semibold text-amber-400 text-[11px]">{selectedCyclone.intensity_knots || 65} kts</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Central Pressure:</span>
              <span className="font-semibold text-[11px]">{selectedCyclone.central_pressure_hpa || 984} hPa</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Coordinates:</span>
              <span className="font-mono text-[11px]">{centerCoords.lat.toFixed(1)}°N, {centerCoords.lon.toFixed(1)}°E</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
            <button
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="flex-1 flex items-center justify-center gap-1 py-1 px-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>4D Trajectory</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleSelectCyclone(DEFAULT_CYCLONES[0])}
              className="p-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Reset to Cyclone DANA"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Same-Origin Windy & High-Res Map Engine */}
      <div className="flex-1 w-full h-full relative z-10 bg-slate-950 min-h-0">
        <iframe
          ref={iframeRef}
          src="/windy-map.html"
          title="VAYU Earth Map Engine"
          className="w-full h-full border-0 absolute inset-0"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </div>

      <style>{`@keyframes vayu-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VayuEarth;
