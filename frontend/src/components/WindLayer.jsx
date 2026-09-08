/**
 * WindLayer.jsx
 * =============
 * A React component that renders an animated wind-particle field on the
 * Leaflet map using the leaflet-velocity plugin.
 *
 * Must be rendered INSIDE a <MapContainer> (react-leaflet).
 *
 * Props
 * -----
 * windData    {Array}    leaflet-velocity JSON format: [{header, data}, {header, data}]
 *                        First element = U component (parameterNumber 2)
 *                        Second element = V component (parameterNumber 3)
 * enabled     {boolean}  If false the layer is removed from the map.
 * onMeta      {Function} Called with {refTime, source, model, resolution, units, level}
 *                        after the layer is successfully created.
 *
 * Wind direction convention
 * -------------------------
 * leaflet-velocity interprets the U/V components directly:
 *   U (+) = eastward wind  → particles travel east
 *   V (+) = northward wind → particles travel north
 * This is the "particle travel" (TO) direction, which is what users expect visually.
 * The meteorological FROM direction (opposite) is computed in the backend and shown
 * in the HUD badge — NOT used to drive particle animation.
 *
 * Attribution
 * -----------
 * NOAA GFS model data provided by Open-Meteo (CC BY 4.0).
 * https://open-meteo.com/
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Ensure L is globally bound for leaflet plugins in Vite bundle
if (typeof window !== 'undefined') {
  window.L = L;
}
if (typeof globalThis !== 'undefined') {
  globalThis.L = L;
}

let velocityPluginLoaded = false;
let velocityPluginPromise = null;

const ensureVelocityPlugin = async () => {
  if (velocityPluginLoaded) return true;
  if (typeof window === 'undefined') return false;

  window.L = L;
  if (typeof globalThis !== 'undefined') {
    globalThis.L = L;
  }

  if (!velocityPluginPromise) {
    velocityPluginPromise = (async () => {
      try {
        await import('leaflet-velocity/dist/leaflet-velocity.min.css');
        await import('leaflet-velocity');
        velocityPluginLoaded = true;
        return true;
      } catch (err) {
        console.error('[WindLayer] Failed to dynamically load leaflet-velocity plugin:', err);
        return false;
      }
    })();
  }
  return velocityPluginPromise;
};

// ─── Particle colour scale ─────────────────────────────────────────────────────
// 12-stop spectrum mapped across 0 to 35 m/s (calm blue -> moderate green/yellow -> storm red/magenta)
const WIND_COLOR_SCALE = [
  '#1a3e6c',  // 0–2   m/s (calm)
  '#2166ac',  // 2–4   m/s
  '#4393c3',  // 4–6   m/s (light breeze)
  '#74add1',  // 6–9   m/s
  '#abd9e9',  // 9–12  m/s (moderate breeze)
  '#e0f3f8',  // 12–15 m/s
  '#ffffbf',  // 15–18 m/s (fresh breeze)
  '#fee090',  // 18–21 m/s
  '#fdae61',  // 21–25 m/s (strong breeze)
  '#f46d43',  // 25–28 m/s
  '#d73027',  // 28–32 m/s (near gale / gale)
  '#a50026',  // >32   m/s (storm / cyclone force)
];

// ─── Particle options (Calibrated for SI m/s units) ─────────────────────────────
const VELOCITY_OPTIONS = {
  displayValues: false,      // We render our own HUD badge; suppress plugin's overlay
  maxVelocity: 35.0,         // m/s — top of meteorological colour scale
  velocityScale: 0.008,      // particle speed multiplier for m/s vectors
  particleAge: 90,           // frames a particle lives before respawning
  lineWidth: 1.4,            // canvas line width for clear vector flow lines
  particleMultiplier: 0.0035, // particle density across map viewport
  frameRate: 24,             // target FPS for smooth meteorological flow
  colorScale: WIND_COLOR_SCALE,
};

// ─── Component ─────────────────────────────────────────────────────────────────
const WindLayer = ({ windData, enabled = true, onMeta }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Remove any existing wind layer first
    if (layerRef.current) {
      try {
        if (map.hasLayer(layerRef.current)) {
          map.removeLayer(layerRef.current);
        }
      } catch (_) { /* already gone */ }
      layerRef.current = null;
    }

    // Do not mount if disabled or invalid data
    if (!enabled || !windData || !Array.isArray(windData) || windData.length < 2) return;

    // Verify the data structure expected by leaflet-velocity
    const uLayer = windData.find((d) => d?.header?.parameterNumber === 2);
    const vLayer = windData.find((d) => d?.header?.parameterNumber === 3);
    if (!uLayer || !vLayer || !Array.isArray(uLayer.data) || !Array.isArray(vLayer.data)) {
      console.warn('[WindLayer] Invalid velocity data format — U or V layer missing or empty.');
      return;
    }

    let isCancelled = false;

    ensureVelocityPlugin().then((loaded) => {
      if (isCancelled || !loaded) return;

      const velocityLayerFactory = L.velocityLayer || window.L?.velocityLayer;
      if (typeof velocityLayerFactory !== 'function') {
        console.error('[WindLayer] L.velocityLayer is not available in Leaflet context.');
        return;
      }

      try {
        layerRef.current = velocityLayerFactory({
          data: windData,
          ...VELOCITY_OPTIONS,
        });

        if (map && !isCancelled) {
          map.addLayer(layerRef.current);

          // Report metadata to parent for display in the HUD badge
          if (onMeta) {
            const header = uLayer.header;
            onMeta({
              refTime:    header.refTime    ?? null,
              source:     header.source     ?? 'NOAA GFS',
              model:      header.model      ?? 'GFS Seamless',
              resolution: header.dx != null ? `${header.dx}°` : '12°',
              units:      header.units      ?? 'm/s',
              level:      header.level      ?? '10m AGL',
              type:       'Model Forecast',
            });
          }
        }
      } catch (err) {
        console.error('[WindLayer] Failed to create leaflet-velocity layer:', err);
      }
    });

    return () => {
      isCancelled = true;
      if (layerRef.current) {
        try {
          if (map && map.hasLayer(layerRef.current)) {
            map.removeLayer(layerRef.current);
          }
        } catch (_) { /* already gone */ }
        layerRef.current = null;
      }
    };
  }, [map, windData, enabled]);

  return null; // Canvas managed directly by leaflet-velocity
};

export default WindLayer;
