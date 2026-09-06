import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import {
  AlertTriangle, AlertOctagon, Info, Bell, CheckCircle,
  Clock, ShieldAlert, FileText, Printer,
  Send, Radio, Building2, Users, Anchor, X, CheckCheck,
  MapPin, Waves, Wind, Copy, Code, ChevronRight
=======
import { 
  AlertTriangle, Bell, CheckCircle, 
  FileText, Download, CheckCheck,
  MapPin, ShieldAlert, Info
>>>>>>> 8fc4fea20e540ccd05ddeb81f325336c2367e0bd
} from 'lucide-react';
import {
  MapContainer, TileLayer, Marker, Popup, Circle
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { fetchActiveAlerts, getFormattedLastUpdated } from '../services/api';
=======
import { downloadOfficialBulletinPdf, fetchActiveAlerts, getFormattedLastUpdated } from '../services/api';
>>>>>>> 8fc4fea20e540ccd05ddeb81f325336c2367e0bd
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import DataUnavailableNotice from '../components/DataUnavailableNotice';
import L from 'leaflet';

const createSectorIcon = (severity) => L.divIcon({
  className: 'custom-alert-marker',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full ${severity.includes('RED') ? 'bg-red-500/30' : severity.includes('ORANGE') ? 'bg-orange-500/30' : 'bg-amber-500/30'} animate-ping absolute"></div>
      <div class="w-6 h-6 rounded-full ${severity.includes('RED') ? 'bg-red-600' : severity.includes('ORANGE') ? 'bg-orange-600' : 'bg-amber-600'} border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
        ⚠️
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const Alerts = () => {
  const [filter, setFilter] = useState('ALL');
  const [acknowledged, setAcknowledged] = useState({});
  const [alertsList, setAlertsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(() => getFormattedLastUpdated());

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      try {
        const liveAlerts = await fetchActiveAlerts();
        if (liveAlerts && Array.isArray(liveAlerts)) {
          setAlertsList(liveAlerts);
          setLastUpdated(getFormattedLastUpdated());
        }
      } catch (err) {
        console.error('[Alerts Page Error]:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAlerts();
  }, []);

  const handleAcknowledge = (id) => {
    setAcknowledged(prev => ({
      ...prev,
      [id]: new Date().toLocaleTimeString('en-IN') + ' IST (Duty Officer)'
    }));
  };

<<<<<<< HEAD
  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const filtered = filter === 'ALL'
    ? alertsList
=======
  const filtered = filter === 'ALL' 
    ? alertsList 
>>>>>>> 8fc4fea20e540ccd05ddeb81f325336c2367e0bd
    : alertsList.filter(a => (a.alert_level || '').includes(filter));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <DataTypeBadge type="ai" label="OPERATIONAL DIRECTIVE" />
            <LastUpdatedBadge timestamp={lastUpdated} source="Disaster Warning System" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Coastal Warnings & Disaster Operations
            </h1>
            <span className="badge badge-red">CAP Protocol</span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Automated Common Alerting Protocol emergency bulletins and impact directives derived from backend inference.
          </p>
        </div>

<<<<<<< HEAD

=======
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadOfficialBulletinPdf({ name: 'Severe Cyclonic Storm DANA', basin: 'Bay of Bengal' })}
            className="btn-primary text-xs py-2 px-4 shadow-xs gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Bulletin PDF</span>
          </button>
        </div>
>>>>>>> 8fc4fea20e540ccd05ddeb81f325336c2367e0bd
      </div>

      {/* Geospatial Coastal Warning GIS Map */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">// GEOSPATIAL_WARNING_MAP</span>
            <p className="text-xs text-slate-500 font-normal">Active coastal district warning zones based on database directives.</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Red Alert</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Orange Alert</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Yellow Watch</span>
          </div>
        </div>

        <div className="h-72 w-full rounded-lg overflow-hidden border border-slate-200 relative">
          <MapContainer
            center={[20.5, 86.5]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}"
              attribution="Tiles &copy; Esri &mdash; Earthstar Geographics"
            />

            {/* Dynamic Alert Sector Markers */}
            {alertsList.map((alert, idx) => {
              const lat = alert.lat || 20.80;
              const lon = alert.lon || 86.95;
              const severity = alert.alert_level || 'RED_ALERT';

              return (
                <React.Fragment key={alert.id || idx}>
                  <Circle
                    center={[lat, lon]}
                    radius={severity.includes('RED') ? 85000 : 60000}
                    pathOptions={{
                      fillColor: severity.includes('RED') ? '#EF4444' : '#F97316',
                      fillOpacity: 0.22,
                      color: severity.includes('RED') ? '#DC2626' : '#EA580C',
                      weight: 2
                    }}
                  />
                  <Marker
                    position={[lat, lon]}
                    icon={createSectorIcon(severity)}
                  >
                    <Popup>
                      <div className="p-1 text-xs space-y-1 font-sans">
                        <p className="font-bold text-slate-900">{alert.cyclone_name}</p>
                        <p className="text-slate-600 font-mono text-[10px]">
                          Districts: {(alert.affected_districts || []).join(', ')}
                        </p>
                        <p className="text-red-600 font-semibold text-[11px]">
                          Surge: {alert.surge_height_m} • Gusts: {alert.wind_gust_forecast_kmh} km/h
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>

<<<<<<< HEAD
      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Left Column: Active Alert Feed (8 Cols) */}
        <div className="xl:col-span-8 space-y-4">

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Filter:</span>
            {['ALL', 'RED', 'ORANGE', 'YELLOW'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all border ${filter === f
                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Alert Cards */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <DataUnavailableNotice
                title="No Active Severe Weather Warnings"
                message="No active Common Alerting Protocol (CAP) emergency directives matching current filters."
                compact={false}
              />
            ) : (
              filtered.map((alert, idx) => (
                <div
                  key={alert.id || idx}
                  className={`bg-white border rounded-xl p-5 space-y-3.5 shadow-2xs transition-all ${(alert.alert_level || '').includes('RED') ? 'border-red-200' :
                      (alert.alert_level || '').includes('ORANGE') ? 'border-orange-200' : 'border-amber-200'
                    }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge ${(alert.alert_level || '').includes('RED') ? 'badge-red' :
                          (alert.alert_level || '').includes('ORANGE') ? 'badge-orange' : 'badge-amber'
                        }`}>
                        {alert.alert_level || 'RED_ALERT'}
                      </span>
                      <DataTypeBadge
                        type={alert.cyclone_name?.includes('DANA') ? 'historical' : 'live'}
                        label={alert.cyclone_name?.includes('DANA') ? 'HISTORICAL BENCHMARK' : 'LIVE DIRECTIVE'}
                      />
                      <span className="text-xs font-mono text-slate-400">{alert.cap_identifier || `CAP-WARN-${alert.id}`}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">{alert.issued_at || 'Just Now'}</span>
                  </div>

                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    {alert.cyclone_name} — Coastal Warning Directive
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.evacuation_recommendation}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Wind Gusts</span>
                      <span className="font-bold text-sky-700">{alert.wind_gust_forecast_kmh} km/h</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Storm Surge</span>
                      <span className="font-bold text-red-600">{alert.surge_height_m}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">24h Rainfall</span>
                      <span className="font-bold text-slate-800">{alert.rainfall_24h_mm} mm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Target Districts</span>
                      <span className="font-bold text-slate-800 truncate block">{(alert.affected_districts || []).join(', ')}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {acknowledged[alert.id] ? (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Acknowledged: {acknowledged[alert.id]}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="btn-secondary text-xs py-1 px-3"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Acknowledge Protocol</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedCapAlert(alert)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] flex items-center gap-1"
                      >
                        <Code className="w-3 h-3" />
                        <span>CAP v1.2 Payload</span>
                      </button>
                    </div>

                    <button
                      onClick={() => navigate('/dashboard/track')}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View 4D Track Visualizer</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )))}
          </div>

        </div>

        {/* Right Column: Multi-Agency Broadcast & Ingestion Activity (4 Cols) */}
        <div className="xl:col-span-4 space-y-4">

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-600" />
                <h3 className="font-heading font-bold text-xs text-slate-900 uppercase">// MULTI_AGENCY_DISPATCH</h3>
              </div>
              <span className="badge badge-green">Operational</span>
            </div>

            <div className="space-y-2.5">
              {STAKEHOLDERS_BROADCAST.map((agency, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <agency.icon className="w-3.5 h-3.5 text-slate-700 flex-shrink-0" />
                    <h4 className="font-bold text-xs text-slate-900">{agency.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5">{agency.status}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleBroadcast}
                disabled={broadcastSent}
                className="w-full btn-primary text-xs py-2 justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastSent ? 'Emergency Push Dispatched to NDRF/SDMA!' : 'Transmit Immediate CAP Push'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* CAP v1.2 XML / JSON Modal */}
      {selectedCapAlert && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-[#003087]" />
                <h3 className="font-bold text-sm text-slate-900">OASIS CAP v1.2 XML Emergency Payload</h3>
              </div>
              <button onClick={() => setSelectedCapAlert(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96">
              {generateCapXmlString(selectedCapAlert)}
            </pre>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-500">Standard: OASIS CAP v1.2 / ITU-T X.1303</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCapXmlString(selectedCapAlert));
                  setCopiedCap(true);
                  setTimeout(() => setCopiedCap(false), 2000);
                }}
                className="btn-primary text-xs py-1.5 px-3 gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCap ? 'Copied to Clipboard!' : 'Copy XML Payload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

=======
      {/* Main Grid: Active Alert Feed */}
      <div className="space-y-4">
        
        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">Filter Level:</span>
          {['ALL', 'RED', 'ORANGE', 'YELLOW'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all border ${
                filter === f
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Alert Cards */}
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200">
            Loading active alerts from backend database...
          </div>
        ) : filtered.length === 0 ? (
          <DataUnavailableNotice
            title="No Active Severe Weather Warnings"
            message="No active Common Alerting Protocol (CAP) emergency directives matching current filters."
            compact={false}
          />
        ) : (
          filtered.map((alert, idx) => (
            <div 
              key={alert.id || idx} 
              className={`bg-white border rounded-xl p-5 space-y-3.5 shadow-2xs transition-all ${
                (alert.alert_level || '').includes('RED') ? 'border-red-200' :
                (alert.alert_level || '').includes('ORANGE') ? 'border-orange-200' : 'border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${
                    (alert.alert_level || '').includes('RED') ? 'badge-red' :
                    (alert.alert_level || '').includes('ORANGE') ? 'badge-orange' : 'badge-amber'
                  }`}>
                    {alert.alert_level || 'RED_ALERT'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {alert.cap_identifier || `CAP-DIRECTIVE-${alert.id}`}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {alert.issued_at || 'Active Directive'}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900">
                {alert.cyclone_name} — Coastal Warning Directive
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {alert.evacuation_recommendation}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Wind Gusts</span>
                  <span className="font-bold text-sky-700">{alert.wind_gust_forecast_kmh} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Storm Surge</span>
                  <span className="font-bold text-red-600">{alert.surge_height_m}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">24h Rainfall</span>
                  <span className="font-bold text-slate-800">{alert.rainfall_24h_mm} mm</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Target Districts</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {(alert.affected_districts || []).join(', ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {acknowledged[alert.id] ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1 text-xs">
                      <CheckCheck className="w-4 h-4" />
                      <span>Acknowledged: {acknowledged[alert.id]}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="btn-secondary text-xs py-1.5 px-3 gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Acknowledge Receipt</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Target States: {(alert.affected_states || []).join(', ')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

>>>>>>> 8fc4fea20e540ccd05ddeb81f325336c2367e0bd
    </div>
  );
};

export default Alerts;
