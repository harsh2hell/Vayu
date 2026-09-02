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
  const [showSearchModal, setShowSearchModal] = useState(false);
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
    if (location.pathname.includes('/analytics')) return 'Historical Database';
    if (location.pathname.includes('/performance')) return 'Model Benchmarks';
    if (location.pathname.includes('/architecture')) return 'Pipeline Architecture';
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
      setShowSearchModal(false);
      setSearchQuery('');
    }
  };

  const alerts = [
    { id: 1, title: 'Cyclone ALPHA', msg: 'Severe Cyclonic Storm active in Bay of Bengal (T+24h Landfall)', time: '5m ago', sev: 'RED' },
    { id: 2, title: 'Arabian Sea Disturbance', msg: 'Deep Depression tracking North-West towards Gujarat coast', time: '42m ago', sev: 'YELLOW' },
    { id: 3, title: 'INSAT-3DR Stream', msg: 'New 4K multi-spectral infrared frame ingested and aligned', time: '1h ago', sev: 'BLUE' },
  ];

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40 transition-all text-slate-800">
      
      {/* Left Section: Breadcrumb in Autonex Style with VAYU/IMD Org */}
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
          <span className="text-slate-400 font-medium">// WORKSPACE</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-900 font-bold">{getPageTitle()}</span>
          <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-mono px-1.5 py-0.2 rounded border border-slate-200 ml-1">
            IMD National Desk
          </span>
        </div>
      </div>

      {/* Right Section: Action Buttons in Autonex Style */}
      <div className="flex items-center gap-2">
        
        {/* Search Button */}
        <button
          onClick={() => setShowSearchModal(true)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Search systems, models..."
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Theme Toggle Icon (Sun for Light Theme) */}
        <button 
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Light Theme Active"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {/* Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors relative"
            title="Active Meteorological Alerts"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
          </button>

          {showAlerts && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 space-y-2 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-sans font-bold text-xs text-slate-900">Active Alert Feed</span>
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

      {/* Global Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/30 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-4 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Type a module name or cyclone (Enter to navigate)..."
                className="w-full text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ESC
              </kbd>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">Quick Links</p>
              {[
                { title: '4D Track Visualizer', path: '/dashboard/track' },
                { title: 'Satellite Ingestion Stream', path: '/dashboard/satellite' },
                { title: 'Vision Detection (CNN)', path: '/dashboard/detection' },
                { title: '72h Trajectory Studio', path: '/dashboard/prediction' },
                { title: 'CAP Early Warnings', path: '/dashboard/alerts' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    setShowSearchModal(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-left transition-colors"
                >
                  <span>{item.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

export default Topbar;
