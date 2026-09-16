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

const WINDY_KEY = 'h8RC1gtsg6HRNS4Ig1VW0J25sYgQd0re';

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

const MAP_SRC_DOC = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VAYU Earth Map Engine</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.4.0/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"></script>
  <script src="https://api.windy.com/assets/map-forecast/libBoot.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body, #windy, #fallback-map {
      width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #020617; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #fallback-map { display: none; position: absolute; inset: 0; z-index: 5; }
    .status-toast {
      position: absolute; top: 12px; right: 12px; z-index: 9999;
      background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px);
      border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8;
      padding: 6px 12px; border-radius: 20px; font-size: 11px; font-family: monospace;
      display: flex; align-items: center; gap: 6px; pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    }
    .dot { width: 6px; height: 6px; background: #38bdf8; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="windy"></div>
  <div id="fallback-map"></div>
  <div id="status-toast" class="status-toast">
    <div class="dot"></div>
    <span id="status-text">Loading Windy.com Live Weather...</span>
  </div>
  <script>
    const WINDY_KEY = '${WINDY_KEY}';
    let isWindyActive = false;
    let windyStore = null;
    let mapInstance = null;
    let activeMarkers = [];

    function updateToast(text, color) {
      const toast = document.getElementById('status-toast');
      const label = document.getElementById('status-text');
      if (toast && label) {
        label.innerText = text;
        if (color) {
          toast.style.borderColor = color;
          toast.style.color = color;
          const dot = toast.querySelector('.dot');
          if (dot) dot.style.background = color;
        }
      }
    }

    function addBasemapAndCyclone(map) {
      if (!map) return;
      try {
        // High-resolution Esri World Imagery Basemap
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          zIndex: 1
        }).addTo(map);

        // Reference Boundaries & Labels
        L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18,
          opacity: 0.85,
          zIndex: 3
        }).addTo(map);

        // Cyclone DANA Animated Pulse Marker
        const cycloneHtml = \`
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; inset:0; border-radius:50%; background:#ef4444; opacity:0.4; animation:pulse 1.5s infinite;"></div>
            <div style="position:absolute; inset:6px; border-radius:50%; background:#ef4444; border:2px solid white; box-shadow:0 0 12px #ef4444; display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">
              🌀
            </div>
          </div>
        \`;
        const cycloneIcon = L.divIcon({
          className: 'cyclone-marker-vayu',
          html: cycloneHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        const dana = L.marker([20.5, 87.2], { icon: cycloneIcon, zIndexOffset: 1000 }).addTo(map);
        dana.bindPopup(\`
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif; min-width:190px; padding:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px;">
              <strong style="font-size:14px; color:#0f172a;">Cyclone DANA</strong>
              <span style="font-size:10px; background:#ef444415; color:#ef4444; font-weight:bold; padding:2px 6px; border-radius:99px; border:1px solid #ef444430;">Severe</span>
            </div>
            <div style="font-size:11px; color:#475569; line-height:1.6;">
              <div><b>Basin:</b> Bay of Bengal</div>
              <div><b>Intensity:</b> 65 kts (120 km/h)</div>
              <div><b>Pressure:</b> 984 hPa</div>
              <div><b>Fix:</b> 20.50°N, 87.20°E</div>
            </div>
          </div>
        \`).openPopup();
        activeMarkers.push(dana);

      } catch (e) {
        console.warn('Basemap/marker error:', e);
      }
    }

    function activateFallbackMap(reason) {
      if (isWindyActive) return;
      console.warn('Activating VAYU Live Earth Imagery:', reason);
      updateToast('VAYU Live Earth Active', '#34d399');
      document.getElementById('windy').style.display = 'none';
      const fb = document.getElementById('fallback-map');
      fb.style.display = 'block';

      try {
        const map = L.map('fallback-map', {
          center: [20.5, 87.2],
          zoom: 5,
          zoomControl: true,
          attributionControl: false
        });
        mapInstance = map;

        addBasemapAndCyclone(map);

        // RainViewer Live Weather Radar
        fetch('https://api.rainviewer.com/public/weather-maps.json')
          .then(res => res.json())
          .then(data => {
            if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
              const latest = data.radar.past[data.radar.past.length - 1];
              L.tileLayer('https://tilecache.rainviewer.com/v2/radar/' + latest.path + '/256/{z}/{x}/{y}/2/1_1.png', {
                opacity: 0.75,
                zIndex: 10
              }).addTo(map);
            }
          })
          .catch(function() {});

      } catch (err) {
        console.error('Fallback error:', err);
      }
    }

    function initWindy() {
      if (typeof windyInit !== 'function') {
        activateFallbackMap('windyInit script missing');
        return;
      }

      const options = {
        key: WINDY_KEY,
        lat: 20.5,
        lon: 87.2,
        zoom: 5,
        overlay: 'wind',
        verbose: false
      };

      try {
        windyInit(options, function(windyAPI) {
          isWindyActive = true;
          mapInstance = windyAPI.map;
          windyStore = windyAPI.store;

          updateToast('Windy.com API Live', '#38bdf8');
          console.log('Windy Map Initialized successfully with key:', WINDY_KEY);

          try {
            windyStore.set('overlay', 'wind');
          } catch(e) {}

          addBasemapAndCyclone(mapInstance);

          window.addEventListener('message', function(e) {
            if (!e.data) return;
            if (e.data.type === 'SET_OVERLAY' && windyStore) {
              try { windyStore.set('overlay', e.data.overlay); } catch (err) {}
            }
            if (e.data.type === 'PAN_TO' && mapInstance) {
              try { mapInstance.panTo([e.data.lat, e.data.lon]); } catch (err) {}
            }
          });
        });
      } catch (err) {
        activateFallbackMap(err.message);
      }
    }

    setTimeout(function() {
      if (!isWindyActive) {
        activateFallbackMap('Windy API timeout / domain restriction');
      }
    }, 3500);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initWindy);
    } else {
      initWindy();
    }
  </script>
</body>
</html>`;

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
      
      {/* Top HUD: Layer Controls & Storm Selector */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badge & Storm Selector */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-white font-bold text-xs tracking-wide">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
            <span>VAYU Earth</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold">
              LIVE
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

      {/* Embedded Map Canvas */}
      <div className="flex-1 w-full h-full relative z-10 bg-slate-950 min-h-0">
        <iframe
          ref={iframeRef}
          srcDoc={MAP_SRC_DOC}
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
