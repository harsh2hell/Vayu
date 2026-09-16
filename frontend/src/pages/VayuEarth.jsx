/**
 * VayuEarth.jsx
 * =============
 * VAYU Earth — Global Satellite Intelligence Explorer
 * Powered by Windy Map API and GDACS Live Cyclone Data
 */

import React, { useEffect, useRef, useState } from 'react';
import { Globe2, Layers, Map, Satellite, AlertTriangle } from 'lucide-react';

const WINDY_API_KEY = "YOUR_WINDY_API_KEY"; // Replace with your actual Windy API key

const VayuEarth = () => {
  const windyContainerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [cyclones, setCyclones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Initialize Windy Map
    if (window.windyInit && windyContainerRef.current && !mapReady) {
      const options = {
        key: WINDY_API_KEY,
        lat: 15.0,
        lon: 80.0,
        zoom: 3,
      };

      try {
        window.windyInit(options, windyAPI => {
          const { map } = windyAPI;
          
          // 2. Fetch Active Cyclones from backend (GDACS + IBTrACS)
          fetch('/api/v1/cyclones/all')
            .then(res => res.json())
            .then(data => {
              if (data.success && data.cyclones) {
                setCyclones(data.cyclones);
                
                // Plot each cyclone on the Windy/Leaflet map
                data.cyclones.forEach(cyclone => {
                  const currentLoc = cyclone.track_forecast?.[0];
                  if (currentLoc && currentLoc.lat && currentLoc.lon) {
                    // Use standard Leaflet (L) which Windy makes available globally
                    if (window.L) {
                      const marker = window.L.marker([currentLoc.lat, currentLoc.lon]).addTo(map);
                      marker.bindPopup(`
                        <div style="font-family: sans-serif;">
                          <strong>${cyclone.name}</strong><br/>
                          ${cyclone.category}<br/>
                          Basin: ${cyclone.basin}
                        </div>
                      `);
                    }
                  }
                });
              }
            })
            .catch(err => {
              console.error("Failed to fetch cyclones:", err);
              setError("Could not load live cyclone data.");
            });

          setMapReady(true);
        });
      } catch (err) {
        console.error("Windy API init failed:", err);
        setError("Failed to initialize Windy Map. Check API Key.");
      }
    }
  }, [mapReady]);

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden min-h-0"
      style={{ fontFamily: 'system-ui, sans-serif', width: '100%', height: '100%', minHeight: '100%' }}>
      
      {/* HUD - Top Left */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg text-white font-bold text-[13px] tracking-wide">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
            <span>VAYU Earth</span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="absolute top-16 left-3 z-[1000] bg-rose-500/90 text-white px-4 py-2 rounded-xl backdrop-blur text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Windy Map Container */}
      <div 
        id="windy" 
        ref={windyContainerRef} 
        className="flex-1 w-full h-full relative min-h-0 z-0"
        style={{ width: '100%', height: '100%', minHeight: '0', background: '#020617' }}
      >
        {!mapReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono text-sm">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
            Loading Windy Map...
          </div>
        )}
      </div>

      <style>{`@keyframes vayu-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VayuEarth;
