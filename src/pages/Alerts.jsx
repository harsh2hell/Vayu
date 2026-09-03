import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, AlertOctagon, Info, Bell, CheckCircle, 
  Clock, ShieldAlert, FileText, Download, Printer, 
  Send, Radio, Building2, Users, Anchor, X, CheckCheck,
  MapPin, Waves, Wind, Copy, Code
} from 'lucide-react';
import { 
  MapContainer, TileLayer, Marker, Popup, Circle
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { downloadOfficialBulletinPdf, fetchActiveAlerts } from '../services/api';
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

const DEFAULT_ALERTS = [
  {
    id: 1,
    alert_level: 'RED_ALERT',
    cyclone_name: 'Severe Cyclonic Storm DANA',
    basin: 'Bay of Bengal',
    lat: 19.26,
    lon: 84.91,
    title: 'RED ALERT: Severe Cyclonic Storm Landfall Warning',
    affected_districts: ['Bhadrak', 'Kendrapara', 'Balasore', 'Jagatsinghpur', 'Purba Medinipur'],
    affected_states: ['Odisha', 'West Bengal'],
    wind_gust_forecast_kmh: 120.0,
    surge_height_m: '2.0 – 2.8m',
    rainfall_24h_mm: 240.0,
    evacuation_recommendation: 'High priority evacuation in progress for 1.2M residents across coastal Odisha.',
    cap_identifier: 'IN-IMD-CAP-2026-DANA-01',
    issued_at: '2026-09-02 14:00 IST'
  }
];

const STAKEHOLDERS_BROADCAST = [
  { name: 'National Disaster Response Force (NDRF)', status: 'Dispatched (12 Battalions Deployed in Coastal Odisha & WB)', icon: Building2 },
  { name: 'State Disaster Management Authorities (OSDMA / APSDMA)', status: 'Control Room Active • 24/7 Red Alert Mode', icon: ShieldAlert },
  { name: 'Indian Coast Guard (Eastern Seaboard)', status: 'Maritime Patrol Warning & Fishermen Recall Active', icon: Anchor },
  { name: 'District Emergency Operations Centres (DEOC)', status: 'Shelter Evacuation Protocol 100% Initialized', icon: Users },
];

const Alerts = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [acknowledged, setAcknowledged] = useState({});
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [alertsList, setAlertsList] = useState(DEFAULT_ALERTS);
  const [selectedCapAlert, setSelectedCapAlert] = useState(null);
  const [copiedCap, setCopiedCap] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      const liveAlerts = await fetchActiveAlerts();
      if (liveAlerts && liveAlerts.length > 0) {
        setAlertsList(liveAlerts);
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

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const filtered = filter === 'ALL' 
    ? alertsList 
    : alertsList.filter(a => (a.alert_level || '').includes(filter));

  const generateCapXmlString = (alert) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alert.cap_identifier || 'IN-IMD-CAP-2026-01'}</identifier>
  <sender>imd.cyclone.warning@nic.in</sender>
  <sent>${new Date().toISOString()}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Tropical Cyclone ${alert.alert_level || 'RED ALERT'}</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <headline>${alert.cyclone_name} COASTAL STRIKE WARNING</headline>
    <description>Sustained wind gusts up to ${alert.wind_gust_forecast_kmh} km/h. Surge: ${alert.surge_height_m}. 24h Rain: ${alert.rainfall_24h_mm} mm.</description>
    <instruction>${alert.evacuation_recommendation}</instruction>
    <area>
      <areaDesc>${(alert.affected_districts || []).join(', ')}</areaDesc>
    </area>
  </info>
</alert>`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
              CAP Early Warning & Disaster Operations Center
            </h1>
            <span className="badge badge-red">OASIS CAP v1.2 Protocol</span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Automated Common Alerting Protocol (CAP v1.2) emergency bulletin generator and geospatial evacuation zone dispatcher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadOfficialBulletinPdf({ name: 'Severe Cyclonic Storm DANA', basin: 'Bay of Bengal' })}
            className="btn-primary text-xs py-1.5 px-3.5 shadow-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official Bulletin PDF</span>
          </button>
        </div>
      </div>

      {/* Geospatial Coastal Warning GIS Map */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">// GEOSPATIAL_EVACUATION_ZONES_MAP</span>
            <p className="text-xs text-slate-500 font-normal">Live coastal storm surge inundation and district warning polygons.</p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Red Alert</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Orange Alert</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Yellow Watch</span>
          </div>
        </div>

        <div className="h-72 w-full rounded-lg overflow-hidden border border-slate-200 relative">
          <MapContainer
            center={[19.8, 85.8]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}"
              attribution="Tiles &copy; Esri &mdash; Earthstar Geographics"
            />

            {/* Red Alert Coastal Zone */}
            <Circle
              center={[20.80, 86.95]}
              radius={95000}
              pathOptions={{ fillColor: '#EF4444', fillOpacity: 0.25, color: '#DC2626', weight: 2 }}
            />

            {/* Orange Alert Coastal Zone */}
            <Circle
              center={[21.68, 87.52]}
              radius={80000}
              pathOptions={{ fillColor: '#F97316', fillOpacity: 0.2, color: '#EA580C', weight: 1.5 }}
            />

            {/* Alert Location Marker */}
            <Marker
              position={[20.80, 86.95]}
              icon={createSectorIcon('RED')}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1 font-sans">
                  <p className="font-bold text-slate-900">Cyclone DANA Landfall Strike Zone</p>
                  <p className="text-slate-600 font-mono text-[10px]">Dhamra Port &amp; Bhadrak Coast</p>
                  <p className="text-red-600 font-semibold text-[11px]">Surge: 2.0 – 2.8 meters</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

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
          <div className="space-y-4">
            {filtered.map((alert, idx) => (
              <div 
                key={alert.id || idx} 
                className={`bg-white border rounded-xl p-5 space-y-3.5 shadow-2xs transition-all ${
                  (alert.alert_level || '').includes('RED') ? 'border-red-200' :
                  (alert.alert_level || '').includes('ORANGE') ? 'border-orange-200' : 'border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${
                      (alert.alert_level || '').includes('RED') ? 'badge-red' :
                      (alert.alert_level || '').includes('ORANGE') ? 'badge-orange' : 'badge-amber'
                    }`}>
                      {alert.alert_level || 'RED_ALERT'}
                    </span>
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
            ))}
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

    </div>
  );
};

export default Alerts;
