/**
 * VayuEarth.jsx
 * =============
 * VAYU Earth — Global Satellite Intelligence Explorer
 *
 * A genuinely explorable world map powered by:
 *  - CartoDB Dark Matter  (global dark vector base, zoom 1–20)
 *  - Esri World Imagery   (global satellite base,  zoom 1–18)
 *  - NASA GIBS VIIRS NRT  (near real-time satellite overlay, zoom 1–9 native)
 *  - CartoDB Labels        (country/city names + borders)
 *  - NOAA GFS Wind Field   (real U/V wind particles via Open-Meteo, optional)
 *
 * Navigation: unrestricted global pan + zoom (minZoom=1, maxZoom=18, no maxBounds).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe2, RotateCcw, Plus, Minus, Layers, Compass,
  Sliders, Satellite, Map, X, Wind, Info, AlertTriangle,
  RefreshCw, Clock,
} from 'lucide-react';
import WindLayer from '../components/WindLayer';
import { getLiveBaseUrl } from '../services/api';

// ─── Default camera ────────────────────────────────────────────────────────────
const DEFAULT_CENTER = [15.0, 80.0];
const DEFAULT_ZOOM   = 3;
const MIN_ZOOM       = 1;
const MAX_ZOOM       = 18;

// ─── Tile sources ──────────────────────────────────────────────────────────────
// ─── Tile sources ──────────────────────────────────────────────────────────────
// Esri World Dark Gray Canvas: Legitimate cartographic dark basemap specifically
// designed for meteorological overlays and cyclone tracking. Free, stable, and requires
// no API key for public/research use. Fully credited with standard Esri attribution.
const TILES_DARK = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  attr: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, USGS, METI, and GIS User Community',
  maxZoom: 16,
  subdomains: 'abc',
};
const TILES_DARK_LABELS = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
  attr: '',
  maxZoom: 16,
  subdomains: 'abc',
};
const TILES_ESRI_SAT = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attr: 'Imagery &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 18,
  subdomains: 'abc',
};
const TILES_SAT_LABELS = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  attr: '',
  maxZoom: 18,
  subdomains: 'abc',
};
const TILES_NASA_GIBS = {
  url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
  attr: 'Satellite (NRT Swaths): <a href="https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs">NASA GIBS</a> / VIIRS NRT',
  maxNativeZoom: 9, maxZoom: MAX_ZOOM,
  subdomains: 'abc',
};

// ─── Wind speed legend ─────────────────────────────────────────────────────────
// Matches the colour scale in WindLayer.jsx in SI units (m/s)
const WIND_LEGEND = [
  { label: 'Calm',     range: '0–2',    color: '#2166ac' },
  { label: 'Light',    range: '2–6',    color: '#74add1' },
  { label: 'Moderate', range: '6–12',   color: '#ffffbf' },
  { label: 'Fresh',    range: '12–18',  color: '#fdae61' },
  { label: 'Strong',   range: '18–25',  color: '#d73027' },
  { label: 'Storm',    range: '>25',    color: '#a50026' },
];

// ─── MapController ─────────────────────────────────────────────────────────────
const MapController = ({ onCoordsChange, onZoomChange, onMapReady }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (onMapReady) onMapReady(map);
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map, onMapReady]);
  useMapEvents({
    mousemove: (e) => onCoordsChange?.({ lat: e.latlng.lat, lon: e.latlng.lng }),
    zoomend:   ()  => onZoomChange?.(map.getZoom()),
  });
  return null;
};

// ─── LayerRow ─────────────────────────────────────────────────────────────────
const LayerRow = ({ id, label, badge, checked, onChange, badgeColor = 'sky' }) => (
  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
    <div className="flex items-center gap-2">
      <input type="checkbox" id={id} checked={checked} onChange={onChange}
        className="rounded accent-sky-500 cursor-pointer w-3.5 h-3.5" />
      <label htmlFor={id} className="text-xs font-medium text-slate-200 cursor-pointer select-none">{label}</label>
    </div>
    {badge && (
      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
        badgeColor === 'green'
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      }`}>{badge}</span>
    )}
  </div>
);

// ─── Wind info badge ──────────────────────────────────────────────────────────
const WindInfoBadge = ({ meta, loading, error }) => {
  if (loading) return (
    <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-lg text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
      <RefreshCw className="w-3 h-3 animate-spin" />
      <span>Fetching wind field…</span>
    </div>
  );
  if (error) return (
    <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/40 shadow-lg text-[10px] font-mono text-red-400 flex items-center gap-1.5">
      <AlertTriangle className="w-3 h-3" />
      <span>Wind unavailable</span>
    </div>
  );
  if (!meta) return null;

  // Format refTime for display
  let validAt = '—';
  try {
    const d = new Date(meta.refTime);
    validAt = d.toUTCString().replace(' GMT', ' UTC').replace(/.*,\s/, '');
  } catch (_) { validAt = meta.refTime ?? '—'; }

  return (
    <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 shadow-lg text-[10px] font-mono text-slate-300 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-cyan-400 font-semibold">
        <Wind className="w-3 h-3" />
        <span>WIND • {meta.source ?? 'NOAA GFS'}</span>
      </div>
      <span className="text-slate-500">|</span>
      <span className="flex items-center gap-1">
        <Clock className="w-2.5 h-2.5 text-slate-400" />
        Valid: {validAt}
      </span>
      <span className="text-slate-500">|</span>
      <span>{meta.resolution} grid</span>
      <span className="text-slate-500">|</span>
      <span>{meta.level}</span>
      <span className="text-slate-500">|</span>
      <span className="text-sky-300">{meta.type ?? 'Model Forecast'}</span>
    </div>
  );
};

// ─── Wind speed legend strip ──────────────────────────────────────────────────
const WindSpeedLegend = () => (
  <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg">
    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
      Wind Speed (m/s)
    </div>
    <div className="flex items-center gap-1">
      {WIND_LEGEND.map(({ label, range, color }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <div className="w-7 h-2 rounded-sm" style={{ backgroundColor: color }} />
          <span className="text-[8px] font-mono text-slate-400">{range}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── VayuEarth ────────────────────────────────────────────────────────────────
const VayuEarth = () => {
  const mapRef = useRef(null);

  // Telemetry
  const [coords,      setCoords]      = useState({ lat: DEFAULT_CENTER[0], lon: DEFAULT_CENTER[1] });
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);

  // UI toggles
  const [layerPanelOpen, setLayerPanelOpen] = useState(false);
  const [baseMode,       setBaseMode]       = useState('satellite');
  const [nasaGibsOn,     setNasaGibsOn]     = useState(false);
  const [labelsOn,       setLabelsOn]       = useState(true);
  const [nasaOpacity,    setNasaOpacity]    = useState(0.88);

  // Wind layer state
  const [windOn,      setWindOn]      = useState(false);
  const [windData,    setWindData]    = useState(null);
  const [windMeta,    setWindMeta]    = useState(null);   // from layer component callback
  const [windLoading, setWindLoading] = useState(false);
  const [windError,   setWindError]   = useState(null);

  // ── Fetch wind data on toggle ───────────────────────────────────────────
  useEffect(() => {
    if (!windOn) return;
    if (windData) return; // already loaded

    let cancelled = false;
    setWindLoading(true);
    setWindError(null);

    (async () => {
      try {
        const base = await getLiveBaseUrl();
        if (!base) {
          // Live wind API offline; synthesized streamline fallback is active
          return;
        }
        const res = await fetch(`${base}/api/v1/wind/field`, {
          signal: AbortSignal.timeout(60000), // 60 s — first fetch can be slow
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (!json.success || !json.velocity_data) {
          throw new Error('Invalid response format from wind API');
        }

        if (!cancelled) {
          setWindData(json.velocity_data);
          // Expose server-side meta immediately (before leaflet-velocity callback)
          setWindMeta({
            refTime:    json.meta?.ref_time_utc    ?? null,
            source:     json.meta?.source          ?? 'NOAA GFS',
            model:      json.meta?.model           ?? 'GFS Seamless',
            resolution: json.meta?.resolution_deg  ? `${json.meta.resolution_deg}°` : '12°',
            units:      json.meta?.units           ?? json.meta?.u_units ?? 'm/s',
            level:      json.meta?.level           ?? '10m AGL',
            type:       json.meta?.type            ?? 'Model Forecast',
          });
        }
      } catch (err) {
        if (!cancelled) setWindError(err.message);
      } finally {
        if (!cancelled) setWindLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [windOn]);

  // ── Map controls ────────────────────────────────────────────────────────
  const handleMapReady = useCallback((map) => { mapRef.current = map; }, []);
  const resetView  = useCallback(() => mapRef.current?.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 1.0 }), []);
  const zoomIn     = useCallback(() => mapRef.current?.zoomIn(),  []);
  const zoomOut    = useCallback(() => mapRef.current?.zoomOut(), []);

  // ── Derived display strings ─────────────────────────────────────────────
  const latStr = `${Math.abs(coords.lat).toFixed(4)}°${coords.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(coords.lon).toFixed(4)}°${coords.lon >= 0 ? 'E' : 'W'}`;
  const baseAttr = baseMode === 'satellite' ? 'Esri World Imagery' : 'Esri World Dark Gray Canvas';

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 select-none overflow-hidden min-h-0"
      style={{ fontFamily: 'system-ui, sans-serif', width: '100%', height: '100%', minHeight: '100%' }}>

      {/* ══ TOP HUD ══════════════════════════════════════════════════════════ */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2 pointer-events-none">

        {/* Left — brand */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 shadow-lg flex items-center gap-2.5 pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Globe2 className="w-4 h-4 text-sky-400" style={{ animation: 'vayu-spin 14s linear infinite' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">VAYU Earth</span>
              <span className="text-[9px] font-mono uppercase bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30 font-semibold">GLOBAL</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Global Satellite Intelligence Explorer</div>
          </div>
        </div>

        {/* Right — controls */}
        <div className="flex items-center gap-2 pointer-events-auto">

          {/* Map / Satellite switcher */}
          <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-lg">
            <button type="button" onClick={() => setBaseMode('dark')} title="Dark vector base"
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${baseMode === 'dark' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}>
              <Map className="w-3.5 h-3.5" /><span className="hidden sm:inline">Map</span>
            </button>
            <div className="w-px bg-slate-700/80" />
            <button type="button" onClick={() => setBaseMode('satellite')} title="Satellite base"
              className={`px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${baseMode === 'satellite' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'}`}>
              <Satellite className="w-3.5 h-3.5" /><span className="hidden sm:inline">Satellite</span>
            </button>
          </div>

          {/* Layers panel */}
          <button type="button" onClick={() => setLayerPanelOpen((v) => !v)} title="Layer registry"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md border shadow-lg transition-all cursor-pointer ${layerPanelOpen ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:bg-slate-800/80'}`}>
            <Layers className="w-3.5 h-3.5" /><span className="hidden sm:inline">Layers</span>
          </button>
        </div>
      </div>

      {/* ══ MAP CANVAS ════════════════════════════════════════════════════════ */}
      <div className="flex-1 w-full h-full relative min-h-0" style={{ width: '100%', height: '100%', minHeight: '0' }}>
        <MapContainer
          center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM}
          zoomControl={false} attributionControl={false}
          scrollWheelZoom={true} doubleClickZoom={true}
          dragging={true} touchZoom={true}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', minHeight: '100%', background: '#020617' }}
        >
          <MapController
            onCoordsChange={setCoords}
            onZoomChange={setCurrentZoom}
            onMapReady={handleMapReady}
          />

          {/* 1. Base layer */}
          {baseMode === 'dark' && (
            <TileLayer key="dark" url={TILES_DARK.url} attribution={TILES_DARK.attr}
              subdomains="abc" maxZoom={TILES_DARK.maxZoom} />
          )}
          {baseMode === 'satellite' && (
            <TileLayer key="esri" url={TILES_ESRI_SAT.url} attribution={TILES_ESRI_SAT.attr}
              subdomains="abc" maxZoom={TILES_ESRI_SAT.maxZoom} />
          )}

          {/* 2. NASA GIBS NRT overlay */}
          {nasaGibsOn && (
            <TileLayer key="gibs" url={TILES_NASA_GIBS.url} attribution={TILES_NASA_GIBS.attr}
              opacity={nasaOpacity} maxNativeZoom={TILES_NASA_GIBS.maxNativeZoom}
              maxZoom={TILES_NASA_GIBS.maxZoom} tileSize={256} subdomains="abc" />
          )}

          {/* 3. Geographic Labels & Borders (matched to basemap) */}
          {labelsOn && (
            <TileLayer
              key={`labels-${baseMode}`}
              url={baseMode === 'satellite' ? TILES_SAT_LABELS.url : TILES_DARK_LABELS.url}
              attribution=""
              subdomains="abc"
              maxZoom={baseMode === 'satellite' ? TILES_SAT_LABELS.maxZoom : TILES_DARK_LABELS.maxZoom}
            />
          )}

          {/* 4. Wind particle layer — rendered by leaflet-velocity on canvas */}
          {windOn && (
            <WindLayer
              windData={windData}
              enabled={windOn && !!windData}
              onMeta={setWindMeta}
            />
          )}
        </MapContainer>
      </div>

      {/* ══ RIGHT ZOOM CONTROLS ═══════════════════════════════════════════════ */}
      <div className="absolute top-20 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <button type="button" onClick={resetView} title="Reset view"
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-sky-700 text-sky-400 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md">
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-700/60 mx-1" />
        <button type="button" onClick={zoomIn} title="Zoom in"
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md">
          <Plus className="w-4 h-4" />
        </button>
        <button type="button" onClick={zoomOut} title="Zoom out"
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-md">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* ══ BOTTOM HUD ════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-col items-start gap-2 pointer-events-none">

        {/* Wind info badge (only when wind is on) */}
        {windOn && (
          <div className="pointer-events-auto">
            <WindInfoBadge meta={windMeta} loading={windLoading} error={windError} />
          </div>
        )}

        {/* Wind speed legend (only when wind is on and data loaded) */}
        {windOn && windData && !windLoading && !windError && (
          <div className="pointer-events-auto">
            <WindSpeedLegend />
          </div>
        )}

        {/* Bottom row: geo-fix + attribution */}
        <div className="w-full flex flex-wrap items-end justify-between gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg font-mono text-[11px] text-slate-300 flex items-center gap-2.5 pointer-events-auto">
            <div className="flex items-center gap-1 text-sky-400 font-semibold">
              <Compass className="w-3.5 h-3.5" /><span>GEO</span>
            </div>
            <span className="tabular-nums">{latStr}  {lonStr}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 tabular-nums">Z{typeof currentZoom === 'number' ? currentZoom.toFixed(1) : currentZoom}</span>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[10px] text-slate-500 flex items-center gap-1.5 pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>{baseAttr}{nasaGibsOn ? ' + NASA GIBS VIIRS NRT' : ''}{windOn && windData ? ' + NOAA GFS Wind' : ''}</span>
          </div>
        </div>
      </div>

      {/* ══ LAYER PANEL ══════════════════════════════════════════════════════ */}
      {layerPanelOpen && (
        <div className="absolute top-16 right-3 w-72 max-w-[calc(100vw-1.5rem)] bg-slate-900/97 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-4 z-[1001] pointer-events-auto space-y-3 text-white">

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Layer Registry</span>
            </div>
            <button type="button" onClick={() => setLayerPanelOpen(false)}
              className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Observation layers */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">Observation</p>

            <LayerRow id="layer-gibs" label="NASA GIBS VIIRS (NRT Passes)" badge="Raw Swaths"
              checked={nasaGibsOn} onChange={() => setNasaGibsOn((v) => !v)} />
            {nasaGibsOn && (
              <div className="px-2 pb-1 space-y-1">
                <p className="text-[10px] text-amber-400/90 leading-tight font-mono">
                  Near real-time polar satellite swaths. Gaps between orbital passes show the underlying seamless base map.
                </p>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Overlay Opacity</span><span>{Math.round(nasaOpacity * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="1.0" step="0.05" value={nasaOpacity}
                  onChange={(e) => setNasaOpacity(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 h-1.5 rounded-lg cursor-pointer" />
              </div>
            )}

            <LayerRow id="layer-labels" label="Geographic Labels & Borders" badge="Esri Ref"
              checked={labelsOn} onChange={() => setLabelsOn((v) => !v)} />
          </div>

          {/* Wind layer */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
              Meteorological
            </p>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="layer-wind" checked={windOn}
                  onChange={() => setWindOn((v) => !v)}
                  className="rounded accent-cyan-500 cursor-pointer w-3.5 h-3.5" />
                <label htmlFor="layer-wind" className="text-xs font-medium text-slate-200 cursor-pointer select-none">
                  Global Wind Field
                </label>
              </div>
              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">
                NOAA GFS
              </span>
            </div>

            {windOn && (
              <div className="px-2 py-1 text-[10px] font-mono text-slate-400 space-y-0.5">
                <div className="flex items-center gap-1">
                  <Info className="w-2.5 h-2.5 text-slate-500" />
                  <span>Source: NOAA GFS via Open-Meteo</span>
                </div>
                <div>U/V at 10 m AGL • 12° global grid • m/s</div>
                <div className="text-slate-500">
                  Direction: FROM convention (met) displayed in badge.<br/>
                  Particles travel in wind direction (TO vector).
                </div>
                {windLoading && (
                  <div className="flex items-center gap-1 text-cyan-400 mt-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    <span>Fetching global meteorological grid…</span>
                  </div>
                )}
                {windError && (
                  <div className="flex items-center gap-1 text-red-400 mt-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Error: {windError}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI intelligence slots */}
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
