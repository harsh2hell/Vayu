import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  BrainCircuit, TrendingUp, ShieldCheck, 
  Activity, AlertTriangle, Compass, ShieldAlert, 
  Navigation, ArrowRight
} from 'lucide-react';
import { 
  Marker, Popup, Polyline, Polygon 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import VayuCycloneMap from '../components/VayuCycloneMap';
import { useNavigate } from 'react-router-dom';
import { predictCycloneTrack } from '../services/api';
import { useAnalysisSession } from '../context/AnalysisSessionContext';
import PageHeader from '../components/PageHeader';

const VERIFIED_STORMS = [
  {
    id: 'DANA',
    name: 'Cyclone DANA (2024)',
    basin: 'Bay of Bengal',
    initial_lat: 18.3,
    initial_lon: 88.4,
    description: 'Post-Monsoon Severe Cyclonic Storm with landfall over northern Odisha / West Bengal seaboard.'
  },
  {
    id: 'BIPARJOY',
    name: 'Cyclone BIPARJOY (2023)',
    basin: 'Arabian Sea',
    initial_lat: 20.5,
    initial_lon: 67.2,
    description: 'Extremely Severe Cyclonic Storm in Arabian Sea with historic recurvature towards Gujarat Saurashtra.'
  }
];

const createWaypointIcon = (isNow, isLandfall) => L.divIcon({
  className: 'custom-wp-icon',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-5 h-5 rounded-full ${isNow ? 'bg-red-500/40 animate-ping' : isLandfall ? 'bg-amber-500/40' : 'bg-sky-500/30'} absolute"></div>
      <div class="w-3.5 h-3.5 rounded-full ${isNow ? 'bg-red-600 ring-2 ring-white' : isLandfall ? 'bg-amber-600' : 'bg-sky-700'} border border-white shadow flex items-center justify-center text-[7px] text-white font-bold">
        ${isNow ? '●' : '○'}
      </div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

const Prediction = () => {
  const navigate = useNavigate();
  const { currentInput, setTrajectoryResult, setLandfallPrediction, setStormPreset } = useAnalysisSession();
  const [selectedStormId, setSelectedStormId] = useState(
    currentInput?.presetId === 'biparjoy-2023' ? 'BIPARJOY' : 'DANA'
  );
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [chartMetric, setChartMetric] = useState('wind'); // 'wind' | 'pressure'

  const isCustomUpload = currentInput?.inputType === 'upload';

  const activeStorm = VERIFIED_STORMS.find(s => s.id === selectedStormId) || VERIFIED_STORMS[0];

  // Sync selectedStormId if session preset changes externally
  useEffect(() => {
    if (currentInput?.presetId === 'biparjoy-2023' && selectedStormId !== 'BIPARJOY') {
      setSelectedStormId('BIPARJOY');
    } else if (currentInput?.presetId === 'dana-2024' && selectedStormId !== 'DANA') {
      setSelectedStormId('DANA');
    }
  }, [currentInput?.presetId]);

  const handleSelectStorm = (stormId) => {
    setSelectedStormId(stormId);
    if (setStormPreset) {
      setStormPreset(stormId === 'DANA' ? 'dana-2024' : 'biparjoy-2023');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const requestSessionId = currentInput?.sessionId;

    const fetchForecast = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      try {
        const res = await predictCycloneTrack({
          storm_id: activeStorm.id,
          basin: activeStorm.basin,
          lat: activeStorm.initial_lat,
          lon: activeStorm.initial_lon
        });

        if (!isMounted) return;

        // Session guard: Discard response if user switched session during async call
        if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
          console.warn(`[Prediction] Discarding stale trajectory prediction from session ${requestSessionId} (active: ${currentInput.sessionId})`);
          return;
        }

        if (res && res.success) {
          setForecastData(res);
          setTrajectoryResult(res, requestSessionId);
          if (res.landfall_prediction) {
            setLandfallPrediction(res.landfall_prediction, requestSessionId);
          }
        } else {
          setErrorMsg(res?.message || 'Trajectory prediction service returned an error.');
        }
      } catch (err) {
        if (!isMounted) return;
        if (requestSessionId && currentInput?.sessionId && requestSessionId !== currentInput.sessionId) {
          return;
        }
        console.error('[Trajectory Page Error]:', err);
        setErrorMsg('Failed to connect to AI Trajectory prediction backend.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchForecast();

    return () => {
      isMounted = false;
    };
  }, [selectedStormId, currentInput?.sessionId]);

  const trajectoryList = forecastData?.trajectory_forecast || [];
  const conePolygon = forecastData?.cone_polygon || [];
  const landfall = forecastData?.landfall_prediction;

  // Trajectory polyline coordinates: [[lat, lon], ...]
  const polylineCoords = trajectoryList.map(pt => [pt.lat, pt.lon]);

  // Map center
  const mapCenter = trajectoryList.length > 0 
    ? [trajectoryList[0].lat, trajectoryList[0].lon]
    : [activeStorm.initial_lat, activeStorm.initial_lon];

  // Chart data formatting
  const chartData = trajectoryList.map(pt => ({
    time: pt.time,
    wind_kmh: Math.round(pt.wind * 1.852), // knots to km/h
    wind_kt: Math.round(pt.wind),
    pressure_hpa: Math.round(pt.pressure),
    uncertainty_km: Math.round(pt.uncertainty_radius_km || 0)
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      
      {/* Standard Unified Header */}
      <PageHeader
        categoryBadge="FORECAST • TRAJECTORY"
        categoryColor="slate"
        modelBadge="2-Layer GRU Seq2Seq (41,764 Params)"
        title="AI Spatiotemporal Trajectory Studio"
        subtitle="10-feature kinematic schema • Multi-Horizon 72h Spatiotemporal Trajectory Forecasting with 25-pass MC Dropout"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Storm:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              {VERIFIED_STORMS.map((storm) => (
                <button
                  key={storm.id}
                  onClick={() => handleSelectStorm(storm.id)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedStormId === storm.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {storm.name}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Uploaded Image Temporal Sequence Scientific Disclosure */}
      {isCustomUpload ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 uppercase">
                Temporal Sequence Required
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                CURRENT ANALYSIS IMAGE: {currentInput?.name}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Trajectory forecasting requires a valid temporal track sequence. A single uploaded satellite frame cannot provide the historical sequence required by the GRU. Showing verified historical benchmark sequence below.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Select Storm:</span>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {VERIFIED_STORMS.map((storm) => (
                <button
                  key={storm.id}
                  onClick={() => setSelectedStormId(storm.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    selectedStormId === storm.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {storm.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Trajectory Kinematics Protocol:</span>
            <span>Deep GRU Seq2Seq autoregression requires historical track sequence data (IBTrACS 3-hourly fixes). Active: <strong className="text-slate-900 dark:text-white font-mono">{activeStorm.name}</strong></span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-red-900 dark:text-red-300">FORECAST GENERATION FAILED</h4>
            <p className="text-red-700 dark:text-red-400 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 2. Main Grid: GIS Leaflet Trajectory Map & Telemetry Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: GIS Leaflet Spatiotemporal Trajectory Map (7 Cols) */}
        <div className="xl:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xs">
          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Predicted 72-Hour Spatiotemporal Trajectory & MC Uncertainty
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 dark:bg-white" /> Fix
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> GRU Forecast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-slate-400/30 border border-slate-500" /> MC Uncertainty
              </span>
            </div>
          </div>

          <div className="h-[480px] w-full relative bg-slate-950">
            {isLoading ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-white space-y-3">
                <BrainCircuit className="w-8 h-8 text-slate-300 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Executing 2-Layer GRU Seq2Seq & 25-Pass MC Dropout...</span>
              </div>
            ) : (
              <VayuCycloneMap
                key={`${selectedStormId}-${trajectoryList.length}`}
                center={mapCenter}
                zoom={6}
                height="100%"
              >
                {/* Real 25-pass MC Dropout Uncertainty Polygon from Backend */}
                {conePolygon.length > 2 && (
                  <Polygon
                    positions={conePolygon}
                    pathOptions={{
                      color: '#64748B',
                      fillColor: '#94A3B8',
                      fillOpacity: 0.25,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                )}

                {/* Trajectory Forecast Track Line */}
                {polylineCoords.length > 1 && (
                  <Polyline
                    positions={polylineCoords}
                    pathOptions={{
                      color: '#0F172A',
                      weight: 3,
                      opacity: 0.95
                    }}
                  />
                )}

                {/* Individual Waypoints with Popups */}
                {trajectoryList.map((pt, idx) => {
                  const isNow = pt.time === 'NOW' || idx === 0;
                  const isLandfall = pt.time === '+24h' || (landfall && Math.abs(pt.lat - landfall.lat) < 0.3);

                  return (
                    <Marker
                      key={pt.time || idx}
                      position={[pt.lat, pt.lon]}
                      icon={createWaypointIcon(isNow, isLandfall)}
                    >
                      <Popup>
                        <div className="p-1 text-xs space-y-1 font-sans">
                          <p className="font-bold text-slate-900">{pt.time}: {pt.stage || 'Forecast Position'}</p>
                          <p className="text-slate-600 font-mono text-[10px]">
                            {pt.lat.toFixed(2)}°N, {pt.lon.toFixed(2)}°E
                          </p>
                          <p className="text-slate-900 font-semibold text-[11px]">
                            Wind: {Math.round(pt.wind * 1.852)} km/h ({Math.round(pt.wind)} kt)
                          </p>
                          <p className="text-slate-500 text-[10px]">
                            Pressure: {pt.pressure} hPa • MC Radius: ±{Math.round(pt.uncertainty_radius_km || 0)} km
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </VayuCycloneMap>
            )}

            {/* Scientific Notice overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-black/85 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
              Uncertainty: 25-pass MC Dropout (p=0.20) • Epistemic uncertainty estimate
            </div>
          </div>

          <div className="p-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>
              <strong>Basin:</strong> {activeStorm.basin} • <strong>Storm:</strong> {activeStorm.name}
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Held-Out Benchmark: +72h GRU has 86.0 km lower mean error than persistence
            </span>
          </div>
        </div>

        {/* Right: Kinematic Sequence Telemetry & Dedicated Impact Bridge (5 Cols) */}
        <div className="xl:col-span-5 space-y-5 flex flex-col justify-between">
          
          {/* Kinematic Sequence Telemetry */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Kinematic Sequence Metrics</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">72h Autoregressive</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">Initial Fix (NOW)</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 block font-mono">
                  {trajectoryList[0] ? `${trajectoryList[0].lat.toFixed(2)}°N, ${trajectoryList[0].lon.toFixed(2)}°E` : `${activeStorm.initial_lat}°N, ${activeStorm.initial_lon}°E`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {trajectoryList[0] ? `${Math.round(trajectoryList[0].wind * 1.852)} km/h • ${trajectoryList[0].pressure} hPa` : 'Initial synoptic fix'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">+72h Predicted Fix</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 block font-mono">
                  {trajectoryList.length > 0 ? `${trajectoryList[trajectoryList.length - 1].lat.toFixed(2)}°N, ${trajectoryList[trajectoryList.length - 1].lon.toFixed(2)}°E` : '--'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                  {trajectoryList.length > 0 ? `${Math.round(trajectoryList[trajectoryList.length - 1].wind * 1.852)} km/h • ${trajectoryList[trajectoryList.length - 1].pressure} hPa` : '72h target horizon'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">Epistemic Radius (+72h)</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 block font-mono">
                  ±{trajectoryList.length > 0 ? Math.round(trajectoryList[trajectoryList.length - 1].uncertainty_radius_km || 0) : 0} km
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">25-Pass MC Dropout</span>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">Step Discretization</span>
                <span className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5 block font-mono">3-Hour Intervals</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">24 Timesteps to +72h</span>
              </div>
            </div>
          </div>

          {/* Model Specification & Empirical Benchmarks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Verified Empirical Benchmark Scope
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold">
                P &lt; 0.001
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Model Architecture:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">2-Layer GRU Seq2Seq (41,764 params)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Canonical Feature Schema:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">10 Kinematic Features</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Validation CLE (+72h):</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">25.6 km (Cyclone DANA)</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span>Test CLE (+72h):</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">38.2 km (Cyclone BIPARJOY)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Skill vs Persistence (+72h):</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">+86.0 km lower mean error</span>
              </div>
            </div>
          </div>

          {/* Dedicated Impact Analysis Bridge */}
          <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 text-white border border-slate-800 dark:border-slate-700 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-slate-300" />
              <div>
                <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                  Impact & Landfall Assessment
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Analyze high-resolution GIS coastal district impact polygons, storm surge projections, and CAP alert matrices for this trajectory.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard/impact')}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-white text-slate-950 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Proceed to Impact & Landfall Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. Trajectory Sequence Table (+6h to +72h) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Autoregressive 3-Hourly Forecast Trajectory Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Horizons: NOW, +6h, +12h, +18h, +24h, +48h, +72h</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4 font-medium">Forecast Horizon</th>
                <th className="py-3 px-4 font-medium">Lead Time</th>
                <th className="py-3 px-4 font-medium">Latitude</th>
                <th className="py-3 px-4 font-medium">Longitude</th>
                <th className="py-3 px-4 font-medium">Max Winds</th>
                <th className="py-3 px-4 font-medium">Central MSLP</th>
                <th className="py-3 px-4 font-medium">MC Uncertainty Radius</th>
                <th className="py-3 px-4 font-medium">Evolutionary Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {trajectoryList.map((pt, idx) => {
                const isNow = pt.time === 'NOW' || idx === 0;
                return (
                  <tr key={idx} className={isNow ? 'bg-slate-100/60 dark:bg-slate-800/60 font-semibold' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'}>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white font-semibold">{pt.time}</td>
                    <td className="py-2.5 px-4 text-slate-500">{pt.lead_hours}h</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{pt.lat.toFixed(2)}°N</td>
                    <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">{pt.lon.toFixed(2)}°E</td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-white font-semibold">
                      {Math.round(pt.wind * 1.852)} km/h ({Math.round(pt.wind)} kt)
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{pt.pressure} hPa</td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300">
                      {pt.uncertainty_radius_km ? `±${Math.round(pt.uncertainty_radius_km)} km` : '0 km (Initial Fix)'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-sans font-medium">{pt.stage || 'Forecast Point'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real GRU Intensity & Pressure Curves */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Kinematic Evolution Curve (GRU Autoregressive Sequence)
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setChartMetric('wind')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                chartMetric === 'wind' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Wind Speed (km/h)
            </button>
            <button
              onClick={() => setChartMetric('pressure')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                chartMetric === 'pressure' ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Central Pressure (hPa)
            </button>
          </div>
        </div>

        <div className="p-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'wind' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" km/h" />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(val) => [`${val} km/h`, 'Wind Velocity']}
                />
                <Area type="monotone" dataKey="wind_kmh" stroke="#0F172A" fill="#F1F5F9" strokeWidth={2} name="Wind Velocity" />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" hPa" />
                <Tooltip 
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(val) => [`${val} hPa`, 'Central MSLP']}
                />
                <Line type="monotone" dataKey="pressure_hpa" stroke="#0F172A" strokeWidth={2} dot={{ r: 4, fill: '#0F172A' }} name="Pressure MSLP" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Prediction;
