import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  BrainCircuit, MapPin, Wind, TrendingUp, 
  CheckCircle, ShieldCheck, Gauge, 
  Activity, Sparkles, AlertTriangle, 
  Compass, ShieldAlert, Navigation, Layers
} from 'lucide-react';
import { 
  MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { predictCycloneTrack } from '../services/api';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';

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
  const [selectedStormId, setSelectedStormId] = useState('DANA');
  const [forecastData, setForecastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [chartMetric, setChartMetric] = useState('wind'); // 'wind' | 'pressure'

  const activeStorm = VERIFIED_STORMS.find(s => s.id === selectedStormId) || VERIFIED_STORMS[0];

  useEffect(() => {
    let isMounted = true;

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

        if (res && res.success) {
          setForecastData(res);
        } else {
          setErrorMsg(res?.message || 'Trajectory prediction service returned an error.');
        }
      } catch (err) {
        if (!isMounted) return;
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
  }, [selectedStormId]);

  const trajectoryList = forecastData?.trajectory_forecast || [];
  const conePolygon = forecastData?.cone_polygon || [];
  const landfall = forecastData?.landfall_prediction;
  const strikeProbs = forecastData?.coastal_strike_probabilities || [];

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
      
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-[#003087] text-white flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  AI Spatiotemporal Trajectory Studio
                </h1>
                <span className="badge badge-navy">2-Layer GRU Seq2Seq (41,764 Params)</span>
                <DataTypeBadge type="ai" label="OPERATIONAL FORECAST" size="xs" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                10-feature kinematic schema • Multi-Horizon 72h Spatiotemporal Trajectory Forecasting with 25-pass MC Dropout
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <LastUpdatedBadge source="2-Layer GRU Seq2Seq" size="xs" />
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {VERIFIED_STORMS.map((storm) => (
              <button
                key={storm.id}
                onClick={() => setSelectedStormId(storm.id)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStormId === storm.id
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {storm.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trajectory Requirement Disclosure for Uploaded Frames */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#003087] shrink-0" />
          <span>
            <strong>Trajectory Kinematics Protocol:</strong> Deep GRU Seq2Seq autoregression requires historical track sequence data (IBTrACS 3-hourly fixes). Arbitrary single-frame uploads execute detection/classification, while trajectory forecasting runs on verified sequence tracks.
          </span>
        </div>
        <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded border border-blue-200 shrink-0 hidden lg:inline-block">
          Active: {activeStorm.name}
        </span>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-red-900">FORECAST GENERATION FAILED</h4>
            <p className="text-red-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* 2. Main Grid: GIS Leaflet Trajectory Map & Telemetry Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: GIS Leaflet Spatiotemporal Trajectory Map (7 Cols) */}
        <div className="xl:col-span-7 card overflow-hidden flex flex-col">
          <div className="card-header bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#003087]" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Predicted 72-Hour Spatiotemporal Trajectory & MC Uncertainty
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Fix
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> GRU Forecast
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 bg-sky-400/30 border border-sky-500" /> MC Uncertainty
              </span>
            </div>
          </div>

          <div className="h-[480px] w-full relative bg-slate-950">
            {isLoading ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-white space-y-3">
                <BrainCircuit className="w-8 h-8 text-sky-400 animate-spin" />
                <span className="text-xs font-mono">Executing 2-Layer GRU Seq2Seq & 25-Pass MC Dropout...</span>
              </div>
            ) : (
              <MapContainer
                key={`${selectedStormId}-${trajectoryList.length}`}
                center={mapCenter}
                zoom={6}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}"
                  attribution="Tiles &copy; Esri &mdash; Earthstar Geographics"
                />

                {/* Real 25-pass MC Dropout Uncertainty Polygon from Backend */}
                {conePolygon.length > 2 && (
                  <Polygon
                    positions={conePolygon}
                    pathOptions={{
                      color: '#0284c7',
                      fillColor: '#38bdf8',
                      fillOpacity: 0.22,
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
                      color: '#0284c7',
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
                          <p className="text-sky-700 font-semibold text-[11px]">
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
              </MapContainer>
            )}

            {/* Scientific Notice overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-black/85 text-cyan-300 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10">
              Uncertainty: 25-pass MC Dropout (p=0.20) • Epistemic uncertainty estimate
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Basin:</strong> {activeStorm.basin} • <strong>Storm:</strong> {activeStorm.name}
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              Held-Out Benchmark: +72h GRU has 86.0 km lower mean error than persistence
            </span>
          </div>
        </div>

        {/* Right: Telemetry & Landfall Summary (5 Cols) */}
        <div className="xl:col-span-5 space-y-5 flex flex-col justify-between">
          
          {/* Landfall Prediction Box */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-sm text-slate-900">Landfall Assessment</h3>
              </div>
              <span className="badge badge-red text-[10px]">Impact Window</span>
            </div>

            {landfall ? (
              <div className="space-y-3 text-xs">
                <div className="bg-red-50/70 border border-red-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-red-900 font-bold">Target Strike Sector:</span>
                    <span className="font-bold font-mono text-red-800">{landfall.target_sector}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-red-700">
                    <span>Coordinates:</span>
                    <span className="font-mono font-medium">{landfall.coordinates}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] block uppercase font-mono">Estimated Window</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{landfall.window}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 text-[10px] block uppercase font-mono">Storm Surge Estimate</span>
                    <span className="font-bold text-red-600 text-xs mt-0.5 block">{landfall.surge_estimate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                {isLoading ? 'Calculating landfall strike geometry...' : 'Landfall assessment unavailable.'}
              </div>
            )}
          </div>

          {/* Coastal Strike Probabilities Table */}
          <div className="card p-5 space-y-3 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Coastal Strike Probabilities (Top Districts)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{strikeProbs.length} Sectors</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {strikeProbs.length > 0 ? (
                strikeProbs.slice(0, 5).map((row, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{row.district}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">({row.state})</span>
                      <span className="text-[10px] block text-slate-500 mt-0.5">
                        Wind Gusts: {row.wind_gust_kmh} km/h • Surge: {row.surge_height_m}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-xs text-red-600 block">
                        {row.strike_probability_pct}%
                      </span>
                      <span className={`badge ${
                        row.warning_level === 'RED_WARNING' ? 'badge-red' : 'badge-orange'
                      } text-[9px] mt-0.5`}>
                        {row.warning_level?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  {isLoading ? 'Computing strike probabilities...' : 'No coastal strike sectors identified.'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Trajectory Sequence Table (+6h to +72h) */}
      <div className="card overflow-hidden">
        <div className="card-header bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#003087]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Autoregressive 3-Hourly Forecast Trajectory Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Horizons: NOW, +6h, +12h, +18h, +24h, +48h, +72h</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Forecast Horizon</th>
                <th className="py-2.5 px-4 font-semibold">Lead Time</th>
                <th className="py-2.5 px-4 font-semibold">Latitude</th>
                <th className="py-2.5 px-4 font-semibold">Longitude</th>
                <th className="py-2.5 px-4 font-semibold">Max Winds</th>
                <th className="py-2.5 px-4 font-semibold">Central MSLP</th>
                <th className="py-2.5 px-4 font-semibold">MC Uncertainty Radius</th>
                <th className="py-2.5 px-4 font-semibold">Evolutionary Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {trajectoryList.map((pt, idx) => {
                const isNow = pt.time === 'NOW' || idx === 0;
                return (
                  <tr key={idx} className={isNow ? 'bg-blue-50/50 font-bold' : 'hover:bg-slate-50'}>
                    <td className="py-2 px-4 text-slate-900 font-bold">{pt.time}</td>
                    <td className="py-2 px-4 text-slate-500">{pt.lead_hours}h</td>
                    <td className="py-2 px-4 text-slate-800">{pt.lat.toFixed(2)}°N</td>
                    <td className="py-2 px-4 text-slate-800">{pt.lon.toFixed(2)}°E</td>
                    <td className="py-2 px-4 text-red-600 font-bold">
                      {Math.round(pt.wind * 1.852)} km/h ({Math.round(pt.wind)} kt)
                    </td>
                    <td className="py-2 px-4 text-slate-700">{pt.pressure} hPa</td>
                    <td className="py-2 px-4 text-sky-700 font-semibold">
                      {pt.uncertainty_radius_km ? `±${Math.round(pt.uncertainty_radius_km)} km` : '0 km (Initial Fix)'}
                    </td>
                    <td className="py-2 px-4 text-slate-600 font-sans font-medium">{pt.stage || 'Forecast Point'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Real GRU Intensity & Pressure Curves */}
      <div className="card overflow-hidden">
        <div className="card-header bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#003087]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kinematic Evolution Curve (GRU Autoregressive Sequence)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => setChartMetric('wind')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                chartMetric === 'wind' ? 'bg-white text-[#003087] shadow-xs' : 'text-slate-600'
              }`}
            >
              Wind Speed (km/h)
            </button>
            <button
              onClick={() => setChartMetric('pressure')}
              className={`px-3 py-1 rounded font-medium transition-all ${
                chartMetric === 'pressure' ? 'bg-white text-[#003087] shadow-xs' : 'text-slate-600'
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
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(val) => [`${val} km/h`, 'Wind Velocity']}
                />
                <Area type="monotone" dataKey="wind_kmh" stroke="#DC2626" fill="#FEE2E2" strokeWidth={2} name="Wind Velocity" />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" hPa" />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                  formatter={(val) => [`${val} hPa`, 'Central MSLP']}
                />
                <Line type="monotone" dataKey="pressure_hpa" stroke="#003087" strokeWidth={2} dot={{ r: 4 }} name="Pressure MSLP" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Prediction;
