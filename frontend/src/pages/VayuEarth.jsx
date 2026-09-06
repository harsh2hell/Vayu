import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  useMap, 
  useMapEvents 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Globe, 
  RotateCcw, 
  Plus, 
  Minus, 
  Layers, 
  Compass, 
  Info, 
  Eye, 
  Sliders, 
  ShieldCheck, 
  Activity,
  Maximize2
} from 'lucide-react';

// Operational default coordinates: Central Bay of Bengal / North Indian Ocean
const BASIN_DEFAULT_CENTER = [16.0, 82.0];
const BASIN_DEFAULT_ZOOM = 4.8;

// NASA GIBS WMTS Remote Web Mercator (EPSG:3857) Tile Endpoint
// Near Real-Time (NRT) True Color Corrected Reflectance from VIIRS (Suomi NPP)
const NASA_GIBS_VIIRS_URL = 
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';

// Standard high-resolution geographic base tile underlay (Esri / CartoDB)
const BASEMAP_TILE_URL = 
  'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';

const BASEMAP_LABELS_URL = 
  'https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}';

const SATELLITE_ATTRIBUTION = 'Satellite imagery: NASA GIBS / NASA Earthdata';
const BASEMAP_ATTRIBUTION = 'Esri, GEBCO, NOAA, National Geographic, Garmin, HERE, Geonames.org';

/**
 * Controller subcomponent handling programmatic camera control and telemetry updates.
 */
const MapController = ({ center, zoom, onCoordinatesChange, onZoomChange }) => {
  const map = useMap();

  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true, duration: 0.6 });
    }
  }, [center, zoom, map]);

  useMapEvents({
    mousemove: (e) => {
      if (onCoordinatesChange) {
        onCoordinatesChange({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
    zoomend: () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom());
      }
    }
  });

  return null;
};

const VayuEarth = () => {
  const mapRef = useRef(null);
  const [coords, setCoords] = useState({ lat: BASIN_DEFAULT_CENTER[0], lon: BASIN_DEFAULT_CENTER[1] });
  const [currentZoom, setCurrentZoom] = useState(BASIN_DEFAULT_ZOOM);
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const [satelliteOpacity, setSatelliteOpacity] = useState(0.95);

  // Modular Layer Registry Architecture for future capability additions
  const [layerState, setLayerState] = useState({
    baseMap: true,
    satellite: true,
    stormTracks: false,      // Slot: Multi-storm historical & synoptic tracks
    cycloneFix: false,       // Slot: Current active cyclone center & eye fix
    aiForecast: false,       // Slot: VAYU AI GRU 72h track forecast
    uncertaintyCone: false,  // Slot: Monte Carlo 25-pass dropout probability cone
    impactLandfall: false,   // Slot: Coastal hazard & strike radius matrix
  });

  const handleResetHome = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView(BASIN_DEFAULT_CENTER, BASIN_DEFAULT_ZOOM, { animate: true, duration: 0.8 });
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const toggleLayer = (layerKey) => {
    setLayerState((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  return (
    <div className="relative w-full h-full flex-1 flex flex-col bg-slate-950 select-none overflow-hidden font-sans">
      
      {/* Top Floating Operational HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none gap-2">
        
        {/* Left Console Title & Basin Status */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2.5 pointer-events-auto text-white">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Globe className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white">VAYU Earth</span>
              <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                NRT Live
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <span>North Indian Ocean • Bay of Bengal & Arabian Sea</span>
            </div>
          </div>
        </div>

        {/* Right Tools: Layers Toggle & Quick Action */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsLayerPanelOpen((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all cursor-pointer ${
              isLayerPanelOpen
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
            }`}
            title="Layer Registry & Opacity Controls"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>
        </div>
      </div>

      {/* Primary Interactive Map-First Canvas */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={BASIN_DEFAULT_CENTER}
          zoom={BASIN_DEFAULT_ZOOM}
          minZoom={3}
          maxZoom={9} // Level 9 aligns with NASA GIBS GoogleMapsCompatible resolution limit
          zoomControl={false}
          attributionControl={false}
          ref={(instance) => {
            mapRef.current = instance;
          }}
          className="w-full h-full z-0"
          style={{ width: '100%', height: '100%', backgroundColor: '#020617' }}
        >
          <MapController
            center={BASIN_DEFAULT_CENTER}
            zoom={BASIN_DEFAULT_ZOOM}
            onCoordinatesChange={setCoords}
            onZoomChange={setCurrentZoom}
          />

          {/* 1. BASE MAP LAYER */}
          {layerState.baseMap && (
            <TileLayer
              url={BASEMAP_TILE_URL}
              attribution={BASEMAP_ATTRIBUTION}
              maxZoom={9}
              minZoom={3}
              tileSize={256}
            />
          )}

          {/* 2. REMOTE NASA GIBS SATELLITE TILES (EPSG:3857 WMTS) */}
          {layerState.satellite && (
            <TileLayer
              url={NASA_GIBS_VIIRS_URL}
              attribution={SATELLITE_ATTRIBUTION}
              opacity={satelliteOpacity}
              maxNativeZoom={9}
              maxZoom={9}
              minZoom={3}
              tileSize={256}
              noWrap={false}
            />
          )}

          {/* 3. REFERENCE BOUNDARIES & COASTAL LABELS */}
          {layerState.baseMap && (
            <TileLayer
              url={BASEMAP_LABELS_URL}
              maxZoom={9}
              minZoom={3}
              tileSize={256}
              opacity={0.85}
            />
          )}

          {/* ARCHITECTURE LAYER SLOTS (Planned for upcoming stages) */}
          {/* Slot: STORM TRACKS */}
          {layerState.stormTracks && null}

          {/* Slot: CURRENT CYCLONE FIX */}
          {layerState.cycloneFix && null}

          {/* Slot: VAYU AI FORECAST */}
          {layerState.aiForecast && null}

          {/* Slot: MODEL UNCERTAINTY */}
          {layerState.uncertaintyCone && null}

          {/* Slot: IMPACT / LANDFALL */}
          {layerState.impactLandfall && null}
        </MapContainer>
      </div>

      {/* Floating Operational Map Controls (+, -, Home) */}
      <div className="absolute top-20 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        {/* Reset to Operational Basin View */}
        <button
          type="button"
          onClick={handleResetHome}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition cursor-pointer backdrop-blur-md"
          title="Reset to Indian Ocean Basin View"
        >
          <RotateCcw className="w-4 h-4 text-sky-400" />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition cursor-pointer font-bold backdrop-blur-md"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition cursor-pointer font-bold backdrop-blur-md"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Telemetry HUD Bar & Official Attribution */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Telemetry / Cursor Coordinates Badge */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[11px] font-mono text-slate-300 flex items-center gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-1 text-sky-400 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>GEO-FIX:</span>
          </div>
          <span>
            {coords.lat >= 0 ? `${coords.lat.toFixed(2)}° N` : `${Math.abs(coords.lat).toFixed(2)}° S`},{' '}
            {coords.lon >= 0 ? `${coords.lon.toFixed(2)}° E` : `${Math.abs(coords.lon).toFixed(2)}° W`}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Zoom {typeof currentZoom === 'number' ? currentZoom.toFixed(1) : currentZoom}</span>
        </div>

        {/* Official Public Satellite Data Attribution */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[10px] text-slate-400 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{SATELLITE_ATTRIBUTION}</span>
        </div>
      </div>

      {/* Operational Layer Management Drawer (Collapsible) */}
      {isLayerPanelOpen && (
        <div className="absolute top-16 right-3 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-3.5 z-[1001] pointer-events-auto space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Layer Registry</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLayerPanelOpen(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          {/* Active Observation Layers */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              Observation Layers
            </div>

            {/* NASA GIBS Satellite Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="layer-satellite"
                  checked={layerState.satellite}
                  onChange={() => toggleLayer('satellite')}
                  className="rounded accent-sky-500 cursor-pointer"
                />
                <label htmlFor="layer-satellite" className="text-xs font-medium text-slate-200 cursor-pointer">
                  NASA GIBS VIIRS
                </label>
              </div>
              <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                NRT TrueColor
              </span>
            </div>

            {/* Satellite Opacity Slider */}
            {layerState.satellite && (
              <div className="px-2 pt-1 pb-2 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Opacity</span>
                  <span>{Math.round(satelliteOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={satelliteOpacity}
                  onChange={(e) => setSatelliteOpacity(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Base Map Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="layer-basemap"
                  checked={layerState.baseMap}
                  onChange={() => toggleLayer('baseMap')}
                  className="rounded accent-sky-500 cursor-pointer"
                />
                <label htmlFor="layer-basemap" className="text-xs font-medium text-slate-200 cursor-pointer">
                  Ocean Bathymetry & Coast
                </label>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Base</span>
            </div>
          </div>

          {/* AI Cyclone Intelligence Layer Architecture (Prepared Slots) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
              AI Forecast Integration
            </div>
            
            {[
              { id: 'stormTracks', label: 'Synoptic Storm Tracks' },
              { id: 'cycloneFix', label: 'Vortex Eye Fix (MobileNetV3)' },
              { id: 'aiForecast', label: 'GRU 72h Track Forecast' },
              { id: 'uncertaintyCone', label: 'MC Dropout Probability Cone' },
              { id: 'impactLandfall', label: 'Impact & Surge Hazard Zone' }
            ].map((slot) => (
              <div 
                key={slot.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-slate-800 text-slate-400"
              >
                <span className="text-xs font-medium">{slot.label}</span>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                  STANDBY
                </span>
              </div>
            ))}
          </div>

          {/* Attribution Note */}
          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed font-mono">
            VAYU Earth • Remote Tiled Satellite Intelligence System
          </div>

        </div>
      )}

    </div>
  );
};

export default VayuEarth;
