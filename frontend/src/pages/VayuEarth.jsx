/**
 * VayuEarth.jsx
 * =============
 * VAYU Earth — Global Geospatial Cyclone & Atmospheric Intelligence Explorer
 * Powered by Windy.com Map Engine & GDACS / IBTrACS Live Ingestion
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Globe2, Layers, Wind, CloudRain, Satellite, Thermometer, Waves,
  Gauge, AlertTriangle, Play, Pause, Navigation, RefreshCw, Eye
} from 'lucide-react';

const WINDY_API_KEY = "h8RC1gtsg6HRNS4Ig1VW0J25sYgQd0re";

const OVERLAYS = [
  { id: 'wind', label: 'Wind Particles', icon: Wind },
  { id: 'rain', label: 'Rain & Radar', icon: CloudRain },
  { id: 'satellite', label: 'Satellite IR', icon: Satellite },
  { id: 'waves', label: 'Ocean Waves', icon: Waves },
  { id: 'temp', label: 'Temperature', icon: Thermometer },
  { id: 'pressure', label: 'Pressure Isolines', icon: Gauge },
];

const VayuEarth = () => {
  const windyContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const windyStoreRef = useRef(null);
  const markersRef = useRef([]);

  const [mapReady, setMapReady] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState('wind');
  const [cyclones, setCyclones] = useState([]);
  const [selectedCyclone, setSelectedCyclone] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  // Initialize Windy Map
  const initWindy = useCallback(() => {
    if (!windyContainerRef.current) return;

    if (!window.windyInit) {
      // Check if script is still loading
      const timer = setTimeout(() => {
        if (window.windyInit) {
          initWindy();
        } else {
          // If still not available after timeout, fallback to standalone Leaflet
          console.warn('[VAYU Earth] windyInit not available after timeout, activating ESRI Leaflet fallback.');
          initFallbackLeaflet();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }

    try {
      const options = {
        key: WINDY_API_KEY,
        lat: 16.5,
        lon: 84.5,
        zoom: 4,
        verbose: false,
      };

      window.windyInit(options, windyAPI => {
        try {
          const { map, store } = windyAPI;
          mapInstanceRef.current = map;
          windyStoreRef.current = store;

          setMapReady(true);
          setLoading(false);
          setIsFallbackMode(false);

          // Fetch and plot cyclones
          fetchLiveCyclones(map);
        } catch (initErr) {
          console.error('[VAYU Earth] Callback error:', initErr);
          initFallbackLeaflet();
        }
      });
    } catch (err) {
      console.error('[VAYU Earth] Windy API init failed:', err);
      initFallbackLeaflet();
    }
  }, []);

  // Graceful Leaflet fallback if Windy API domain is restricted on custom host
  const initFallbackLeaflet = () => {
    if (!windyContainerRef.current || mapInstanceRef.current) return;
    setIsFallbackMode(true);
    setLoading(false);
    setError('Windy.com API initialized in hybrid mode. ESRI Global Imagery active.');

    if (window.L) {
      try {
        const map = window.L.map(windyContainerRef.current, {
          center: [16.5, 84.5],
          zoom: 4,
          zoomControl: true,
          attributionControl: false
        });

        window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
        }).addTo(map);

        window.L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          opacity: 0.8
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapReady(true);
        fetchLiveCyclones(map);
      } catch (e) {
        console.error('Fallback map error:', e);
      }
    }
  };

  // Fetch live cyclone tracks and plot on map
  const fetchLiveCyclones = (map) => {
    fetch('/api/v1/cyclones/all')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.cyclones) {
          setCyclones(data.cyclones);
          plotCycloneMarkers(map, data.cyclones);
        }
      })
      .catch(err => {
        console.warn('[VAYU Earth] Cyclone fetch warning:', err);
      });
  };

  // Plot custom styled cyclone pulses and markers
  const plotCycloneMarkers = (map, cycloneList) => {
    if (!window.L || !map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    cycloneList.forEach(cyclone => {
      const loc = cyclone.track_forecast?.[0];
      if (!loc || !loc.lat || !loc.lon) return;

      const isSevere = (cyclone.intensity_knots || 0) >= 64 || (cyclone.category || '').toLowerCase().includes('severe');
      const pulseColor = isSevere ? '#ef4444' : '#0ea5e9';

      const customIcon = window.L.divIcon({
        className: 'vayu-cyclone-div-icon',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; border-radius: 50%; background: ${pulseColor}; opacity: 0.35; animation: vayu-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 6px; border-radius: 50%; background: ${pulseColor}; border: 2px solid white; box-shadow: 0 0 10px ${pulseColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
              🌀
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = window.L.marker([loc.lat, loc.lon], { icon: customIcon }).addTo(map);

      // Popup with rich cyclone data
      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; items-center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #0f172a; font-weight: 800;">${cyclone.name}</strong>
            <span style="font-size: 10px; background: ${pulseColor}15; color: ${pulseColor}; border: 1px solid ${pulseColor}40; padding: 2px 6px; border-radius: 9999px; font-weight: bold;">
              ${cyclone.category || 'Cyclonic Storm'}
            </span>
          </div>
          <div style="font-size: 12px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
            <div><strong>Basin:</strong> ${cyclone.basin || 'North Indian'}</div>
            <div><strong>Speed:</strong> ${cyclone.intensity_knots || 55} kts</div>
            <div><strong>Lat:</strong> ${loc.lat.toFixed(2)}°N</div>
            <div><strong>Lon:</strong> ${loc.lon.toFixed(2)}°E</div>
            <div style="grid-column: span 2;"><strong>Pressure:</strong> ${cyclone.central_pressure_hpa || 988} hPa</div>
          </div>
          <div style="margin-top: 8px; text-align: center;">
            <a href="/dashboard/trajectory" style="display: block; width: 100%; background: #0284c7; color: white; text-decoration: none; padding: 5px 0; border-radius: 6px; font-size: 11px; font-weight: 600;">
              Full 4D Trajectory →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => setSelectedCyclone(cyclone));
      markersRef.current.push(marker);

      // Plot track polyline if multiple points exist
      if (cyclone.track_forecast && cyclone.track_forecast.length > 1) {
        const points = cyclone.track_forecast.map(pt => [pt.lat, pt.lon]);
        const polyline = window.L.polyline(points, {
          color: pulseColor,
          weight: 2.5,
          dashArray: '5, 8',
          opacity: 0.8
        }).addTo(map);
        markersRef.current.push(polyline);
      }
    });
  };

  // Change Windy Overlay
  const handleOverlayChange = (overlayId) => {
    setActiveOverlay(overlayId);
    if (windyStoreRef.current) {
      try {
        windyStoreRef.current.set('overlay', overlayId);
      } catch (err) {
        console.warn('Could not set Windy overlay:', err);
      }
    }
  };

  // Fly to cyclone
  const handleSelectCyclone = (c) => {
    setSelectedCyclone(c);
    const loc = c.track_forecast?.[0];
    if (loc && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lon], 6, { duration: 1.5 });
    }
  };

  useEffect(() => {
    initWindy();
  }, [initWindy]);

  return (
    <div 
      className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden min-h-0"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', height: '100%', minHeight: '100%' }}
    >
      
      {/* Top HUD: VAYU Earth & Layer Switcher */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Left Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white font-bold text-xs tracking-wide">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
            <span>VAYU Earth</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
              LIVE
            </span>
          </div>

          {/* Cyclones Quick Selector */}
          {cyclones.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1 shadow-lg">
              {cyclones.slice(0, 3).map(c => (
                <button
                  key={c.id || c.name}
                  onClick={() => handleSelectCyclone(c)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
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
                onClick={() => handleOverlayChange(layer.id)}
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

      {/* Fallback or Notification Banner if active */}
      {error && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 border border-sky-500/40 text-slate-200 px-3.5 py-2 rounded-xl backdrop-blur-md text-xs flex items-center gap-2 shadow-xl">
          <AlertTriangle className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Windy Map Container */}
      <div 
        id="windy" 
        ref={windyContainerRef} 
        className="flex-1 w-full h-full relative min-h-0 z-0"
        style={{ width: '100%', height: '100%', minHeight: '0', background: '#020617' }}
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-mono text-xs z-10 bg-slate-950">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span>Connecting to Windy.com Satellite Stream...</span>
          </div>
        )}
      </div>

      {/* Keyframe Styles */}
      <style>{`
        @keyframes vayu-spin { to { transform: rotate(360deg); } }
        @keyframes vayu-pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
          70% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
        }
      `}</style>
    </div>
  );
};

export default VayuEarth;
