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

// Import leaflet-velocity as a side-effect; it extends L.velocityLayer
// The CSS is minimal (only hides the default display panel we override)
import 'leaflet-velocity/dist/leaflet-velocity.min.css';
import 'leaflet-velocity';

// ─── Particle colour scale ─────────────────────────────────────────────────────
// 12-stop spectrum: calm (cool blue) → strong (red/magenta)
// Mapped against maxVelocity in km/h via leaflet-velocity interpolation.
const WIND_COLOR_SCALE = [
  '#1a3e6c',  //  0–7  km/h  calm
  '#2166ac',  //  7–14
  '#4393c3',  // 14–21
  '#74add1',  // 21–28
  '#abd9e9',  // 28–36
  '#e0f3f8',  // 36–43
  '#ffffbf',  // 43–54
  '#fee090',  // 54–65
  '#fdae61',  // 65–80
  '#f46d43',  // 80–100
  '#d73027',  // 100–120
  '#a50026',  // >120  km/h  extreme
];

// ─── Particle options ──────────────────────────────────────────────────────────
const VELOCITY_OPTIONS = {
  displayValues: false,     // We render our own HUD badge; suppress plugin's overlay
  maxVelocity: 120,         // km/h — top of colour scale
  velocityScale: 0.0045,    // particle speed multiplier (visual, not wind speed)
  particleAge: 80,          // frames a particle lives before reset
  lineWidth: 1.2,           // canvas line width for particle trails
  particleMultiplier: 0.0035, // density (lower = fewer particles)
  frameRate: 20,            // target FPS for animation loop
  colorScale: WIND_COLOR_SCALE,
};

// ─── Component ─────────────────────────────────────────────────────────────────
const WindLayer = ({ windData, enabled = true, onMeta }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    // Remove any existing wind layer first
    if (layerRef.current) {
      try { map.removeLayer(layerRef.current); } catch (_) { /* already gone */ }
      layerRef.current = null;
    }

    // Do not mount if disabled or no data
    if (!enabled || !windData || windData.length < 2) return;

    // Verify the data structure expected by leaflet-velocity
    const uLayer = windData.find((d) => d?.header?.parameterNumber === 2);
    const vLayer = windData.find((d) => d?.header?.parameterNumber === 3);
    if (!uLayer || !vLayer || !uLayer.data || !vLayer.data) {
      console.warn('[WindLayer] Invalid velocity data format — U or V layer missing.');
      return;
    }

    try {
      // L.velocityLayer is added to the global L object by the import above
      layerRef.current = L.velocityLayer({
        data: windData,
        ...VELOCITY_OPTIONS,
      });

      map.addLayer(layerRef.current);

      // Report metadata to parent for display in the HUD badge
      if (onMeta) {
        const header = uLayer.header;
        onMeta({
          refTime:    header.refTime    ?? null,
          source:     header.source     ?? 'NOAA GFS',
          model:      header.model      ?? 'GFS',
          resolution: header.dx != null ? `${header.dx}°` : '5°',
          units:      header.units      ?? 'km/h',
          level:      header.level      ?? '10m AGL',
        });
      }
    } catch (err) {
      console.error('[WindLayer] Failed to create leaflet-velocity layer:', err);
    }

    return () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current); } catch (_) { /* already gone */ }
        layerRef.current = null;
      }
    };
  }, [map, windData, enabled]);   // re-create whenever data or enabled state changes

  return null; // No DOM output — the canvas is managed by leaflet-velocity
};

export default WindLayer;
