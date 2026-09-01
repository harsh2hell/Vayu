import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Clock, AlertTriangle, PanelLeft, 
  ShieldAlert, X, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const [time, setTime] = useState(new Date());
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedBasin, setSelectedBasin] = useState('NIO');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const alerts = [
    { id: 1, msg: 'Severe Cyclone ALPHA rapid intensification in Bay of Bengal', time: '8m ago', sev: 'RED' },
    { id: 2, msg: 'Tropical Disturbance BETA developing in Arabian Sea', time: '1h ago', sev: 'YELLOW' },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      
      {/* Left Section: Breadcrumb & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Clean Vercel / GitHub Search Input */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cyclones, coastal districts, satellite feeds..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#003087] focus:border-[#003087] transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium bg-white border border-slate-200 px-1 py-0.2 rounded">
            /
          </span>
        </div>
      </div>

      {/* Right Section: Basin Tabs + Clock + Alerts */}
      <div className="flex items-center gap-3">
        
        {/* Basin Segmented Control */}
        <div className="hidden md:flex items-center bg-slate-100 p-0.5 rounded-md text-xs font-medium border border-slate-200">
          {[
            { id: 'NIO', label: 'North Indian Ocean' },
            { id: 'BOB', label: 'Bay of Bengal' },
            { id: 'ARB', label: 'Arabian Sea' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBasin(b.id)}
              className={`px-2.5 py-1 rounded transition-colors ${
                selectedBasin === b.id 
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Live IST Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 font-normal">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Advisories"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-semibold text-slate-800">Active Warnings</span>
                <button onClick={() => setShowAlerts(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {alerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { navigate('/dashboard/alerts'); setShowAlerts(false); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        a.sev === 'RED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {a.sev} ALERT
                      </span>
                      <span className="text-[10px] text-slate-400">{a.time}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-snug">{a.msg}</p>
                  </button>
                ))}
              </div>

              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => { navigate('/dashboard/alerts'); setShowAlerts(false); }}
                  className="text-xs font-medium text-[#003087] hover:underline"
                >
                  View All Bulletins →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Action CTA */}
        <button
          onClick={() => navigate('/dashboard/alerts')}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-2xs transition-colors"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Active Red Alert</span>
        </button>

      </div>

    </header>
  );
};

export default Topbar;
