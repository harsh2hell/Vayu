import React, { useState } from 'react';
import { 
  AlertTriangle, AlertOctagon, Info, Bell, CheckCircle, 
  Clock, ShieldAlert, FileText, Download, Printer, 
  Send, Radio, Building2, Users, Anchor, X, CheckCheck
} from 'lucide-react';
import { ALERTS, ACTIVE_CYCLONES } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { downloadOfficialBulletinPdf } from '../services/api';

const DETAILED_ALERTS = [
  {
    id: 'WARN-2026-001',
    severity: 'RED',
    cyclone: 'TC-2026-ALPHA',
    title: 'RED ALERT: Severe Cyclonic Storm Landfall Warning',
    message: 'Rapid intensification observed. High probability of landfall between Gopalpur (Odisha) and Kalingapatnam (Andhra Pradesh) within 24–30 hours. Peak wind gusts reaching 125 km/h.',
    issuedAt: '2026-08-29 14:00 IST',
    region: 'Coastal Odisha (Ganjam, Puri) & North Coastal AP (Srikakulam)',
    surge: '2.5 to 3.2 meters above astronomical tide',
    rain: 'Extremely Heavy Rainfall (>204.4 mm) in isolated places',
    ports: 'Hoist Great Danger Signal No. 8 at Gopalpur & Paradip Ports',
    action: 'Total evacuation of low-lying coastal villages within 5 km of shoreline.'
  },
  {
    id: 'WARN-2026-002',
    severity: 'ORANGE',
    cyclone: 'TC-2026-ALPHA',
    title: 'ORANGE ALERT: Gale Wind & Inundation Advisory',
    message: 'Squally wind speed reaching 55-65 km/h gusting to 75 km/h prevailing along and off West Bengal and remaining Odisha coast, gradually increasing to 80-90 km/h from tonight.',
    issuedAt: '2026-08-29 13:15 IST',
    region: 'Gangetic West Bengal (Digha, Sagar Island) & Balasore',
    surge: '1.0 to 1.5 meters',
    rain: 'Heavy to Very Heavy Rainfall (115.6 to 204.4 mm)',
    ports: 'Hoist Local Warning Signal No. 4',
    action: 'Fishermen strictly advised not to venture into deep sea.'
  },
  {
    id: 'WARN-2026-003',
    severity: 'YELLOW',
    cyclone: 'TC-2026-BETA',
    title: 'YELLOW WATCH: Tropical Disturbance Development Advisory',
    message: 'Low pressure system over East-Central Arabian Sea is likely to concentrate into a Depression during next 24 hours. Moving North-Northwestwards.',
    issuedAt: '2026-08-29 11:30 IST',
    region: 'Saurashtra & Kutch Coast (Gujarat)',
    surge: 'Normal / Rough Sea conditions',
    rain: 'Light to Moderate Rainfall at most places',
    ports: 'Hoist Distant Cautionary Signal No. 1',
    action: 'Keep standby search and rescue units on alert.'
  }
];

const STAKEHOLDERS_BROADCAST = [
  { name: 'National Disaster Response Force (NDRF)', status: 'Dispatched (12 Battalions Deployed)', icon: Building2 },
  { name: 'Odisha State Disaster Management (OSDMA)', status: 'Control Room Active • 24/7 Red Alert', icon: ShieldAlert },
  { name: 'Indian Coast Guard (Eastern Fleet)', status: 'Maritime Patrol Warning Broadcast Active', icon: Anchor },
  { name: 'Coastal District Collectors & SDRF', status: 'Shelter Evacuation Protocol Initialized', icon: Users },
];

const Alerts = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  const [acknowledged, setAcknowledged] = useState({});
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [subEmail, setSubEmail] = useState('');

  const primary = ACTIVE_CYCLONES[0];

  const handleAcknowledge = (id) => {
    setAcknowledged(prev => ({
      ...prev,
      [id]: new Date().toLocaleTimeString('en-IN') + ' IST (NDRF Duty Officer)'
    }));
  };

  const handleBroadcast = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  const filtered = filter === 'ALL' 
    ? DETAILED_ALERTS 
    : DETAILED_ALERTS.filter(a => a.severity === filter);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">National Early Warning & Risk Intelligence Center</h1>
            <span className="badge badge-red">CAP Standard Active</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Common Alerting Protocol (CAP) automated dissemination system for disaster management authorities
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setShowBulletinModal(true)}
            className="btn-secondary text-xs sm:text-sm py-2 px-3 gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Generate Official IMD Bulletin</span>
          </button>

          <button 
            onClick={() => setShowSubscribeModal(true)}
            className="btn-primary text-xs sm:text-sm py-2 px-4 gap-2 shadow-sm"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>Subscribe to CAP Feeds</span>
          </button>
        </div>
      </div>

      {/* Alert Severity Filter Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: 'RED', label: 'RED WARNING', sub: 'Take Action Immediately', count: 1, border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700' },
          { key: 'ORANGE', label: 'ORANGE ALERT', sub: 'Be Prepared / Ready', count: 1, border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
          { key: 'YELLOW', label: 'YELLOW WATCH', sub: 'Be Updated / Monitor', count: 1, border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
          { key: 'ALL', label: 'TOTAL ACTIVE', sub: 'All National Warnings', count: 3, border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-[#003087]' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${item.bg} ${
              filter === item.key 
                ? `${item.border} shadow-md scale-102` 
                : 'border-transparent hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${item.text}`}>{item.label}</span>
              <span className={`text-2xl font-black ${item.text}`}>{item.count}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">{item.sub}</p>
          </button>
        ))}
      </div>

      {/* Main Grid: Alert Cards (8 Cols) + Multi-Agency Dispatcher (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Active Alert Dossiers (8 Cols) */}
        <div className="xl:col-span-8 space-y-4">
          
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-800">
              Active Bulletins ({filtered.length} Displayed)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Protocol: ITU-T X.1303 CAP v1.2</span>
          </div>

          {filtered.map((alert) => {
            const isAck = acknowledged[alert.id];
            return (
              <div 
                key={alert.id}
                className={`card p-5 border-l-6 space-y-4 transition-all ${
                  alert.severity === 'RED' 
                    ? 'border-l-red-600 bg-gradient-to-r from-red-50/60 to-white' 
                    : alert.severity === 'ORANGE'
                    ? 'border-l-orange-500 bg-gradient-to-r from-orange-50/40 to-white'
                    : 'border-l-amber-500 bg-gradient-to-r from-amber-50/40 to-white'
                }`}
              >
                {/* Alert Card Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        alert.severity === 'RED' ? 'badge-red' : alert.severity === 'ORANGE' ? 'badge-orange' : 'badge-amber'
                      }`}>
                        {alert.severity} ADVISORY
                      </span>
                      <span className="text-xs font-mono text-slate-500">{alert.id}</span>
                      <span className="text-xs text-slate-400">• {alert.issuedAt}</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900">{alert.title}</h4>
                    <p className="text-xs font-semibold text-[#003087]">Target System: {alert.cyclone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAck ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Ack: {isAck}</span>
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleAcknowledge(alert.id)}
                        className="btn-secondary text-xs py-1.5 px-3 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {alert.message}
                </p>

                {/* Specific Action Directives Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Vulnerable Impact Corridor:</span>
                    <span className="font-semibold text-slate-800">{alert.region}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Storm Surge:</span>
                    <span className="font-semibold text-red-600">{alert.surge}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Precipitation Warning:</span>
                    <span className="font-semibold text-slate-800">{alert.rain}</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Port Signals:</span>
                    <span className="font-semibold text-amber-700">{alert.ports}</span>
                  </div>
                </div>

                {/* Mandatory Directives */}
                <div className="bg-red-50 border-l-3 border-red-500 p-2.5 rounded-r-lg text-xs text-red-800">
                  <strong>Civil Protection Directive:</strong> {alert.action}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => navigate('/dashboard/track')}
                    className="text-xs font-semibold text-[#003087] hover:underline"
                  >
                    View Geospatial Impact Zone on Map →
                  </button>
                  <button 
                    onClick={() => setShowBulletinModal(true)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Print Bulletin PDF
                  </button>
                </div>
              </div>
            );
          })}

        </div>

        {/* Right Column: Multi-Agency Broadcast & Ingestion Activity (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Multi-Agency Broadcast Dispatcher Card */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#003087]" />
                <h3 className="font-bold text-sm text-slate-900">Multi-Agency Broadcast Feeds</h3>
              </div>
              <span className="badge badge-green">Connected</span>
            </div>

            <div className="space-y-3">
              {STAKEHOLDERS_BROADCAST.map((agency, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <agency.icon className="w-4 h-4 text-[#003087] flex-shrink-0" />
                    <h4 className="font-bold text-xs text-slate-900">{agency.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-6 font-medium">{agency.status}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button 
                onClick={handleBroadcast}
                disabled={broadcastSent}
                className="btn-primary w-full text-xs py-2.5 justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{broadcastSent ? 'Emergency Broadcast Transmitted!' : 'Dispatch Immediate Red Alert Push'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Alert Log */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Automated Event Log</h4>
              <span className="text-[10px] text-slate-400 font-mono">Today, 29 Aug</span>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { time: '14:30 IST', event: 'AI re-inference confirms Rapid Intensification rate (+30 km/h in 24h).' },
                { time: '14:00 IST', event: 'RED BULLETIN issued for Ganjam & Srikakulam districts.' },
                { time: '13:15 IST', event: 'ORANGE WARNING disseminated to West Bengal Disaster Authority.' },
                { time: '11:30 IST', event: 'Arabian Sea system designated TC-2026-BETA (Depression Watch).' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-[10px] text-slate-400 flex-shrink-0 mt-0.5">{log.time}</span>
                  <p className="text-slate-600 leading-snug">{log.event}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Official IMD Bulletin Print / PDF Modal */}
      {showBulletinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            <div className="bg-[#002266] text-white p-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">National Tropical Cyclone Bulletin (Official)</h3>
                  <p className="text-xs text-blue-200">Cyclone Warning Division • Regional Specialized Meteorological Centre (RSMC)</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBulletinModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs sm:text-sm text-slate-700 font-sans">
              <div className="border border-slate-300 p-4 rounded-xl space-y-1.5 font-mono text-xs bg-slate-50">
                <div className="text-center font-bold text-slate-900 pb-1 border-b border-slate-200">
                  INDIA METEOROLOGICAL DEPARTMENT / CYCLONEAI INTELLIGENCE REPORT
                </div>
                <div className="flex justify-between pt-1">
                  <span><strong>BULLETIN NO.:</strong> RSMC-04/2026</span>
                  <span><strong>TIME OF ISSUE:</strong> 1430 HRS IST / 29-08-2026</span>
                </div>
                <div><strong>FROM:</strong> CYCLONE WARNING DIVISION, NEW DELHI</div>
                <div><strong>TO:</strong> CONTROL ROOM, NDMA / SDMA ODISHA & ANDHRA PRADESH / COAST GUARD</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">1. SYNOPTIC SYSTEM INTENSITY</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The Severe Cyclonic Storm <strong>"{primary.name}"</strong> lay centered at 0830 UTC near Latitude {primary.lat}°N and Longitude {primary.lon}°E over the West-Central {primary.basin}. Current maximum sustained surface wind is estimated at {primary.windSpeed} km/h (46 knots) gusting to {primary.windSpeed + 20} km/h. Estimated Central Pressure is {primary.pressure} hPa.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">2. 72-HOUR AI FORECAST TRACK & INTENSITY</h4>
                <div className="overflow-x-auto">
                  <table className="table text-xs">
                    <thead>
                      <tr>
                        <th>Date/Time</th>
                        <th>Position</th>
                        <th>Max Wind (km/h)</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>29-08 / 1430 IST</td><td>15.4°N, 87.8°E</td><td>85</td><td>Cyclonic Storm</td></tr>
                      <tr><td>30-08 / 0230 IST</td><td>16.9°N, 86.5°E</td><td>101</td><td>Severe Cyclonic Storm</td></tr>
                      <tr className="bg-red-50 font-bold text-red-700"><td>30-08 / 1430 IST (Landfall)</td><td>18.2°N, 85.6°E</td><td>115</td><td>Very Severe Cyclone</td></tr>
                      <tr><td>31-08 / 1430 IST</td><td>20.1°N, 84.2°E</td><td>105</td><td>Inland Weakening</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">3. WARNING & SECTOR ADVISORIES</h4>
                <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded-r-lg space-y-1 text-xs text-red-800">
                  <div>• <strong>Storm Surge Warning:</strong> Inundation of low-lying coastal areas of Ganjam, Srikakulam up to 3.0m at landfall.</div>
                  <div>• <strong>Fishermen Advisory:</strong> Total ban on marine fishing operations along Bay of Bengal.</div>
                  <div>• <strong>Infrastructure Alert:</strong> Damage expected to thatched huts, power transmission poles, and standing paddy crops.</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
              <span className="text-[11px] text-slate-400 font-mono">CycloneAI Automated Decision-Support Bulletin</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => downloadOfficialBulletinPdf(primary)}
                  className="btn-secondary text-xs py-2 px-3 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#003087]" /> Download Official PDF
                </button>
                <button 
                  onClick={() => setShowBulletinModal(false)}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Subscribe to CAP Feed Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#003087]" />
                <h3 className="font-bold text-sm text-slate-900">Subscribe to Real-Time Alerts</h3>
              </div>
              <button onClick={() => setShowSubscribeModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>Receive automated SMS & Email alerts based on Common Alerting Protocol (CAP) standards for your coastal district.</p>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Email Address / SMS Number:</label>
                <input 
                  type="text" 
                  placeholder="e.g. controlroom@osdma.gov.in"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="form-input w-full text-xs" 
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Select Monitoring Jurisdiction:</label>
                <select className="form-select w-full text-xs">
                  <option>Odisha Coastal Districts (Ganjam, Puri, Balasore)</option>
                  <option>Andhra Pradesh (Srikakulam, Visakhapatnam)</option>
                  <option>West Bengal (South 24 Parganas, Digha)</option>
                  <option>All North Indian Ocean Basins</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button 
                onClick={() => { alert('Subscribed to CAP Alert Feeds!'); setShowSubscribeModal(false); }}
                className="btn-primary w-full text-xs py-2.5 justify-center"
              >
                Confirm Subscription
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Alerts;
