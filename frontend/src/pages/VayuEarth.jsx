import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe2,
  RotateCcw,
  Plus,
  Minus,
  Layers,
  Compass,
  Sliders,
  Satellite,
  Map,
  X,
} from 'lucide-react';

// ─── Default camera ────────────────────────────────────────────────────────────
// Zoom 3 gives a wide Indian-Ocean-centred view while still showing the whole
// Eastern hemisphere. User can freely zoom / pan anywhere on Earth from here.
const DEFAULT_CENTER = [15.0, 80.0];
const DEFAULT_ZOOM   = 3;
const MIN_ZOOM       = 1;   // Full-globe view (whole Earth on screen)
const MAX_ZOOM       = 18;  // Street-level detail

// ─── Tile Sources ──────────────────────────────────────────────────────────────
// All free / public-domain services — no API key required.

const TILES_DARK_BASE = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
    'contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 20,
};

const TILES_ESRI_SAT = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 18,
};

const TILES_NASA_GIBS = {
  url:
    'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/' +
    'VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/' +
    'GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
  attribution:
    'Satellite (NRT): <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs">NASA GIBS</a> / VIIRS Suomi NPP',
  maxNativeZoom: 9,
  maxZoom: MAX_ZOOM,
};

const TILES_LABELS = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
  attribution: '',
  subdomains: 'abcd',
  maxZoom: 20,
};

// ─── MapController ─────────────────────────────────────────────────────────────
const MapController = ({ onCoordsChange, onZoomChange, onMapReady }) => {
  const map = useMap();

  React.useEffect(() => {
    if (map && onMapReady) onMapReady(map);
  }, [map, onMapReady]);

  useMapEvents({
    mousemove: (e) =>
      onCoordsChange?.({ lat: e.latlng.lat, lon: e.latlng.lng }),
    zoomend: () => onZoomChange?.(map.getZoom()),
  });

  return null;
};

// ─── LayerRow helper ─────────────────────────────────────────────────────────
const LayerRow = ({ id, label, badge, checked, onChange }) => (
  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="rounded accent-sky-500 cursor-pointer w-3.5 h-3.5"
      />
      <label
        htmlFor={id}
        className="text-xs font-medium text-slate-200 cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
    {badge && (
      <span className="text-[9px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/20">
        {badge}
      </span>
    )}
  </div>
);

// ─── VayuEarth ─────────────────────────────────────────────────────────────────
const VayuEarth = () => {
  const mapRef = useRef(null);

  const [coords, setCoords]           = useState({ lat: DEFAULT_CENTER[0], lon: DEFAULT_CENTER[1] });
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [baseMode, setBaseMode]       = useState('dark');
  const [nasaGibsOn,  setNasaGibsOn]  = useState(true);
  const [labelsOn,    setLabelsOn]     = useState(true);
  const [nasaOpacity, setNasaOpacity]  = useState(0.88);

  const handleMapReady = useCallback((map) => { mapRef.current = map; }, []);
  const resetView = useCallback(() => {
    mapRef.current?.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.0 });
  }, []);
  const zoomIn  = useCallback(() => mapRef.current?.zoomIn(),  []);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  const latStr = `${Math.abs(coords.lat).toFixed(4)}°${coords.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(coords.lon).toFixed(4)}°${coords.lon >= 0 ? 'E' : 'W'}`;
  const attributionText = baseMode === 'satellite' ? 'Esri World Imagery' : 'CartoDB / OpenStreetMap';

  return (
    <div
      className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden"
      style={{ fontFamily: 'system-ui, sans-serif' }}
    >
      {/* ── TOP HUD ── */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2 pointer-events-none">

        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2.5 pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">VAYU Earth</span>
              <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">LIVE</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Global Satellite Intelligence Explorer</div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
            <button type="button" onClick={() => setBaseMode('dark')} title="Dark vector base map"
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${baseMode === 'dark' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <div className="w-px bg-slate-700/80" />
            <button type="button" onClick={() => setBaseMode('satellite')} title="Esri World Imagery satellite base"
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${baseMode === 'satellite' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Satellite</span>
            </button>
          </div>

          <button type="button" onClick={() => setLayerPanelOpen((v) => !v)} title="Layer registry"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all cursor-pointer ${layerPanelOpen ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800/80'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>
        </div>
      </div>

      {/* ── MAP CANVAS ── */}
      <div className="flex-1 w-full h-full relative">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          zoomControl={false}
          attributionControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', background: '#020617' }}
        >
          <MapController onCoordsChange={setCoords} onZoomChange={setCurrentZoom} onMapReady={handleMapReady} />

          {/* Base layer */}
          {baseMode === 'dark' && (
            <TileLayer key="dark-base" url={TILES_DARK_BASE.url} attribution={TILES_DARK_BASE.attribution} subdomains={TILES_DARK_BASE.subdomains} maxZoom={TILES_DARK_BASE.maxZoom} />
          )}
          {baseMode === 'satellite' && (
            <TileLayer key="esri-sat" url={TILES_ESRI_SAT.url} attribution={TILES_ESRI_SAT.attribution} maxZoom={TILES_ESRI_SAT.maxZoom} />
          )}

          {/* NASA GIBS NRT overlay */}
          {nasaGibsOn && (
            <TileLayer key="nasa-gibs" url={TILES_NASA_GIBS.url} attribution={TILES_NASA_GIBS.attribution} opacity={nasaOpacity} maxNativeZoom={TILES_NASA_GIBS.maxNativeZoom} maxZoom={TILES_NASA_GIBS.maxZoom} tileSize={256} />
          )}

          {/* Labels overlay */}
          {labelsOn && (
            <TileLayer key="labels" url={TILES_LABELS.url} attribution={TILES_LABELS.attribution} subdomains={TILES_LABELS.subdomains} maxZoom={TILES_LABELS.maxZoom} />
          )}
        </MapContainer>
      </div>

      {/* ── RIGHT CONTROLS ── */}
      <div className="absolute top-20 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <button type="button" onClick={resetView} title="Reset to Indian Ocean view"
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-sky-700 text-sky-400 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
        ><RotateCcw className="w-4 h-4" /></button>
        <div className="h-px bg-slate-700/60 mx-1" />
        <button type="button" onClick={zoomIn} title="Zoom in"
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
        ><Plus className="w-4 h-4" /></button>
        <button type="button" onClick={zoomOut} title="Zoom out"
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
        ><Minus className="w-4 h-4" /></button>
      </div>

      {/* ── BOTTOM HUD ── */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-end justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg font-mono text-[11px] text-slate-300 flex items-center gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-1 text-sky-400 font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>GEO</span>
          </div>
          <span className="tabular-nums">{latStr}  {lonStr}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 tabular-nums">Z{typeof currentZoom === 'number' ? currentZoom.toFixed(1) : currentZoom}</span>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[10px] text-slate-500 flex items-center gap-1.5 pointer-events-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>{attributionText}{nasaGibsOn ? ' + NASA GIBS VIIRS NRT' : ''}</span>
        </div>
      </div>

      {/* ── LAYER PANEL ── */}
      {layerPanelOpen && (
        <div className="absolute top-16 right-3 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900/97 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-[1001] pointer-events-auto space-y-3 text-white">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Layer Registry</span>
            </div>
            <button type="button" onClick={() => setLayerPanelOpen(false)} className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Observation</p>
            <LayerRow id="layer-gibs" label="NASA GIBS VIIRS (NRT)" badge="Satellite NRT" checked={nasaGibsOn} onChange={() => setNasaGibsOn((v) => !v)} />
            {nasaGibsOn && (
              <div className="px-2 pb-1 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Opacity</span><span>{Math.round(nasaOpacity * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="1.0" step="0.05" value={nasaOpacity}
                  onChange={(e) => setNasaOpacity(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            )}
            <LayerRow id="layer-labels" label="Geographic Labels & Borders" badge="OSM" checked={labelsOn} onChange={() => setLabelsOn((v) => !v)} />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">AI Intelligence (Upcoming)</p>
            {['Synoptic Storm Tracks', 'Vortex Eye Fix (MobileNetV3)', 'GRU 72h Track Forecast', 'MC Dropout Probability Cone', 'Impact & Surge Hazard Zone'].map((label) => (
              <div key={label} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/30 border border-slate-800">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-600">STANDBY</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-600 font-mono">
            VAYU Earth • Global Satellite Intelligence Explorer
          </div>
        </div>
      )}

      <style>{`@keyframes vayu-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default VayuEarth;
