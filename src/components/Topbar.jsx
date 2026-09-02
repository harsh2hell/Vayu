import React, { useState, useEffect } from 'react';
import { 
  Bell, Search, Clock, AlertTriangle, PanelLeft, 
  ShieldAlert, X, ChevronRight, Sparkles, Sun, Moon,
  SlidersHorizontal, Check
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Topbar = ({ isSidebarCollapsed, onToggleSidebar }) => {
  const [time, setTime] = useState(new Date());
  const [showAlerts, setShowAlerts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getPageTitle = () => {
    if (location.pathname.includes('/track')) return '4D Track Visualizer';
    if (location.pathname.includes('/satellite')) return 'Satellite Ingestion';
    if (location.pathname.includes('/detection')) return 'Vision Detection';
    if (location.pathname.includes('/classification')) return 'Dvorak Classification';
    if (location.pathname.includes('/prediction')) return '72h Trajectory';
    if (location.pathname.includes('/alerts')) return 'CAP Early Warnings';
    if (location.pathname.includes('/analytics')) return 'Historical Analytics';
    if (location.pathname.includes('/performance')) return 'Model Benchmarks';
    if (location.pathname.includes('/architecture')) return 'System Architecture';
    return 'Overview';
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (q.includes('sat') || q.includes('feed') || q.includes('insat')) {
        navigate('/dashboard/satellite');
      } else if (q.includes('vision') || q.includes('detect') || q.includes('cnn')) {
        navigate('/dashboard/detection');
      } else if (q.includes('pred') || q.includes('track') || q.includes('bilstm')) {
        navigate('/dashboard/prediction');
      } else if (q.includes('alert') || q.includes('warn') || q.includes('bulletin')) {
        navigate('/dashboard/alerts');
      } else {
        navigate('/dashboard');
      }
      setSearchQuery('');
    }
  };

  const alerts = [
    { id: 1, title: 'Cyclone ALPHA', msg: 'Severe Cyclonic Storm active in Bay of Bengal (T+24h Landfall)', time: '5m ago', sev: 'RED' },
    { id: 2, title: 'Arabian Sea Disturbance', msg: 'Deep Depression tracking North-West towards Gujarat coast', time: '42m ago', sev: 'YELLOW' },
    { id: 3, title: 'INSAT-3DR Stream', msg: 'New 4K multi-spectral infrared frame ingested and aligned', time: '1h ago', sev: 'BLUE' },
  ];

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-all text-slate-800">
      
      {/* Left Section: Breadcrumb in Autonex Style */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Monospace Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-semibold">// WORKSPACE</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-bold">{getPageTitle()}</span>
          <span className="hidden sm:inline-block bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 ml-1">
            IMD National Desk
          </span>
        </div>
      </div>

      {/* Right Section: Search & Status Icons */}
      <div className="flex items-center gap-2.5">
        
        {/* Search Input */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search systems, models..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono bg-white border border-slate-200 px-1 rounded">
            /
          </kbd>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time.toLocaleTimeString()} IST</span>
        </div>

        {/* Theme Icon Button (Light Mode Active) */}
        <button 
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Light Theme Active"
        >
          <Sun className="w-4 h-4 text-amber-500" />
        </button>

        {/* Alerts Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-heading font-bold text-xs text-slate-900">Active Alert Feed</span>
                <button onClick={() => setShowAlerts(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-800">{a.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{a.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{a.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Topbar;
