import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Compass, RotateCcw, Plus, Minus, Layers, Info } from 'lucide-react';

// Default operational center: North Indian Ocean & Bay of Bengal Basin
const DEFAULT_CENTER = [15.0, 85.0];
const DEFAULT_ZOOM = 5;

// NASA GIBS WMTS Web Mercator (EPSG:3857) Remote Satellite Layer
// Near Real-Time (NRT) True Color corrected reflectance
const NASA_GIBS_VIIRS_SNPP_URL = 
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';

const NASA_GIBS_ATTRIBUTION = 'Satellite imagery: NASA GIBS';

/**
 * Controller subcomponent to handle programmatic camera navigation & events.
 */
const MapViewController = ({ center, zoom, onMoveEnd, onMouseMoveCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true, duration: 0.6 });
    }
  }, [center, zoom, map]);

  useMapEvents({
    moveend: () => {
      if (onMoveEnd) {
        const c = map.getCenter();
        onMoveEnd({ lat: c.lat, lon: c.lng, zoom: map.getZoom() });
      }
    },
    mousemove: (e) => {
      if (onMouseMoveCoords) {
        onMouseMoveCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    }
  });

  return null;
};

/**
 * Custom operational control bar with Home/Reset, Zoom In, Zoom Out, and Source Badge.
 * Styled in VAYU's clean government operational aesthetic.
 */
const OperationalControlBar = ({ onResetHome, onZoomIn, onZoomOut }) => {
  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
      {/* Reset / Home View */}
      <button
        type="button"
        onClick={onResetHome}
        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#003087] dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
        title="Reset to Operational Basin View (Bay of Bengal / Indian Ocean)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#003087] dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-[#003087] dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer font-bold"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
};

/**
 * Reusable foundational geographic map component for VAYU.
 * 
 * Props:
 * - center: [lat, lon] (defaults to North Indian Ocean / Bay of Bengal [15.0, 85.0])
 * - zoom: number (defaults to 5)
 * - minZoom: number (defaults to 3)
 * - maxZoom: number (defaults to 12)
 * - height: string (defaults to '100%')
 * - className: string
 * - children: ReactNode (future tracks, forecast polygons, markers, uncertainty cones)
 * - onMapReady: function(mapInstance)
 * - showCoordinatesHUD: boolean (defaults to true)
 */
const VayuCycloneMap = ({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  minZoom = 3,
  maxZoom = 12,
  height = '100%',
  className = '',
  children,
  onMapReady,
  showCoordinatesHUD = true,
  ...rest
}) => {
  const mapRef = useRef(null);
  const [currentCoords, setCurrentCoords] = useState({ lat: center[0], lon: center[1] });
  const [mapCenterState, setMapCenterState] = useState(center);
  const [mapZoomState, setMapZoomState] = useState(zoom);

  // Sync external center/zoom updates
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2) {
      setMapCenterState(center);
    }
  }, [center]);

  useEffect(() => {
    if (typeof zoom === 'number') {
      setMapZoomState(zoom);
    }
  }, [zoom]);

  // Clean teardown on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, []);

  // Control handlers
  const handleResetHome = () => {
    if (mapRef.current) {
      mapRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: true, duration: 0.8 });
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  return (
    <div 
      className={`relative w-full overflow-hidden bg-slate-950 font-sans select-none ${className}`}
      style={{ height }}
    >
      <MapContainer
        center={mapCenterState}
        zoom={mapZoomState}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomControl={false} // Managed via VAYU operational control bar
        attributionControl={false} // Handled via clean operational attribution badge
        ref={(instance) => {
          mapRef.current = instance;
          if (instance && onMapReady) onMapReady(instance);
        }}
        style={{ width: '100%', height: '100%' }}
        {...rest}
      >
        <MapViewController
          center={mapCenterState}
          zoom={mapZoomState}
          onMoveEnd={(info) => {
            setMapCenterState([info.lat, info.lon]);
            setMapZoomState(info.zoom);
          }}
          onMouseMoveCoords={(coords) => setCurrentCoords(coords)}
        />

        {/* Real remote satellite imagery base layer (NASA GIBS) */}
        <TileLayer
          url={NASA_GIBS_VIIRS_SNPP_URL}
          attribution={NASA_GIBS_ATTRIBUTION}
          maxNativeZoom={9}
          maxZoom={maxZoom}
          minZoom={minZoom}
          tileSize={256}
          noWrap={false}
        />

        {/* Mount future / external layer children (tracks, forecast cones, fixes) */}
        {children}
      </MapContainer>

      {/* Operational Control Bar (Home / Zoom In / Zoom Out) */}
      <OperationalControlBar
        onResetHome={handleResetHome}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
      />

      {/* Operational Attribution & Coordinate Telemetry HUD */}
      <div className="absolute bottom-2.5 left-3 z-[1000] flex flex-wrap items-center gap-2 pointer-events-none">
        {/* Source indicator */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 shadow-sm text-[10px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>{NASA_GIBS_ATTRIBUTION}</span>
        </div>

        {/* Live Coordinate Cursor HUD */}
        {showCoordinatesHUD && (
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 shadow-sm text-[10px] font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span>
              {currentCoords.lat >= 0 ? `${currentCoords.lat.toFixed(2)}°N` : `${Math.abs(currentCoords.lat).toFixed(2)}°S`},{' '}
              {currentCoords.lon >= 0 ? `${currentCoords.lon.toFixed(2)}°E` : `${Math.abs(currentCoords.lon).toFixed(2)}°W`}
            </span>
            <span className="text-slate-400">|</span>
            <span>Zoom {mapZoomState}</span>
          </div>
        )}
      </div>

      {/* Basin Coverage Label */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 shadow-sm text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-[#003087] dark:text-sky-400" />
          <span>North Indian Ocean • Bay of Bengal</span>
        </div>
      </div>
    </div>
  );
};

export default VayuCycloneMap;
export { DEFAULT_CENTER, DEFAULT_ZOOM, NASA_GIBS_ATTRIBUTION, NASA_GIBS_VIIRS_SNPP_URL };
