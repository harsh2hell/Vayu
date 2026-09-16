import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Clock, ChevronRight, ChevronLeft, ExternalLink, User, LogOut, Search,
  Sun, Moon, History, Sidebar, Menu, X, Check, ShieldAlert,
  AlertTriangle, Info, ArrowRight, Sparkles, Compass
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toPortalPath } from '../utils/domain';

const SEARCH_ITEMS = [
  { id: 'overview', title: 'Command Overview', category: 'Dashboards', path: '/dashboard', icon: '📊', desc: 'Real-time cyclone metrics, active alerts & regional distribution' },
  { id: 'earth', title: 'VAYU Earth', category: 'Dashboards', path: '/dashboard/earth', icon: '🌍', desc: 'Global live wind particles & GDACS cyclone geospatial viewer' },
  { id: 'satellite', title: 'Satellite Feed', category: 'Dashboards', path: '/dashboard/satellite', icon: '🛰️', desc: 'INSAT-3D & NASA GIBS multispectral infrared & visible imagery' },
  { id: 'detection', title: 'Cyclone Models', category: 'Dashboards', path: '/dashboard/detection', icon: '🎯', desc: 'MobileNetV3 center detection & confidence bounding boxes' },
  { id: 'trajectory', title: 'Forecast Data — Trajectory', category: 'Pages', path: '/dashboard/trajectory', icon: '📈', desc: 'Deep GRU Seq2Seq 72-hour track predictions vs persistence' },
  { id: 'impact', title: 'Forecast Data — Impact & Alerts', category: 'Pages', path: '/dashboard/impact', icon: '⚠️', desc: 'Landfall estimation, coastal inundation & red alert zones' },
  { id: 'morphology', title: 'Morphology', category: 'Pages', path: '/dashboard/classification', icon: '🌀', desc: 'ResNet-18 Dvorak T-number & CDO convective cloud analysis' },
  { id: 'archives', title: 'Historical Archives', category: 'Pages', path: '/dashboard/archives', icon: '📚', desc: 'Historical North Indian Ocean cyclonic storm database' },
  { id: 'models', title: 'AI Intelligence', category: 'Pages', path: '/dashboard/models', icon: '🧠', desc: 'Model architecture, loss convergence curves & benchmark evaluations' },
  { id: 'bulletin', title: 'Official Reports', category: 'Pages', path: '/dashboard/bulletin', icon: '📄', desc: 'MoES / IMD standard formatted operational cyclone bulletins' },
  { id: 'action-theme', title: 'Toggle Dark Theme', category: 'Quick Action', isAction: true, action: 'toggleTheme', icon: '🌓', desc: 'Switch interface between light and dark modes' },
  { id: 'action-dana', title: 'View Cyclone DANA Analysis', category: 'Active Cyclones', path: '/dashboard/trajectory', icon: '🌪️', desc: 'Severe Cyclonic storm active in Bay of Bengal' },
];

const INITIAL_NOTIFICATIONS = [
  { id: 1, title: 'Severe Cyclone DANA Tracking Active', desc: 'Estimated central pressure 988 hPa, sustained winds 65 kts.', time: '5m ago', unread: true, type: 'critical', path: '/dashboard/trajectory' },
  { id: 2, title: 'Red Warning: Odisha & West Bengal Coast', desc: 'Heavy precipitation and storm surge alert issued for 4 districts.', time: '28m ago', unread: true, type: 'warning', path: '/dashboard/impact' },
  { id: 3, title: 'Windy.com Live Stream Connected', desc: 'Global wind vectors and GDACS live data feed active.', time: '1h ago', unread: false, type: 'info', path: '/dashboard/earth' },
  { id: 4, title: 'AI Model Inference Updated', desc: 'Landfall prediction error calibrated to 32.4 km from target.', time: '2h ago', unread: false, type: 'info', path: '/dashboard/models' },
];

const INITIAL_HISTORY = [
  { id: 1, action: 'Calculated 72h forecast trajectory for Cyclone DANA', time: '12 mins ago', path: '/dashboard/trajectory' },
  { id: 2, action: 'Viewed VAYU Earth global wind particles and radar overlay', time: '34 mins ago', path: '/dashboard/earth' },
  { id: 3, action: 'Generated Official Advisory Bulletin ADV-08 for disaster authorities', time: '1 hour ago', path: '/dashboard/bulletin' },
  { id: 4, action: 'Analyzed INSAT-3D thermal IR convective band morphology', time: '3 hours ago', path: '/dashboard/classification' },
  { id: 5, action: 'Synchronized GDACS real-time cyclone database', time: '5 hours ago', path: '/dashboard' },
];

const Topbar = ({ onToggleSidebar, isMobileSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  // Modals & Panels state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [historyItems, setHistoryItems] = useState(INITIAL_HISTORY);

  const searchInputRef = useRef(null);
  const notificationsRef = useRef(null);
  const historyRef = useRef(null);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Keyboard shortcut for Cmd+/ or Ctrl+/ or Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (historyRef.current && !historyRef.current.contains(e.target)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const getPageTitle = () => {
    if (location.pathname.includes('/earth')) return 'VAYU Earth';
    if (location.pathname.includes('/satellite')) return 'Satellite Feed';
    if (location.pathname.includes('/detection')) return 'Cyclone Models';
    if (location.pathname.includes('/classification')) return 'Morphology';
    if (location.pathname.includes('/trajectory') || location.pathname.includes('/prediction') || location.pathname.includes('/track')) return 'Trajectory';
    if (location.pathname.includes('/impact') || location.pathname.includes('/alerts')) return 'Impact & Alerts';
    if (location.pathname.includes('/archives') || location.pathname.includes('/analytics')) return 'Historical Archives';
    if (location.pathname.includes('/models') || location.pathname.includes('/training') || location.pathname.includes('/performance') || location.pathname.includes('/architecture')) return 'AI Intelligence';
    if (location.pathname.includes('/bulletin')) return 'Official Reports';
    return 'Overview';
  };
  
  const getBreadcrumbCategory = () => {
    if (location.pathname.includes('/trajectory') || location.pathname.includes('/classification') || location.pathname.includes('/archives') || location.pathname.includes('/models') || location.pathname.includes('/bulletin')) {
      return 'Pages';
    }
    return 'Dashboards';
  };

  // Filter search items
  const filteredSearchItems = SEARCH_ITEMS.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const handleSearchSelect = (item) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (item.isAction && item.action === 'toggleTheme') {
      toggleTheme();
    } else if (item.path) {
      navigate(toPortalPath(item.path));
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (item) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n));
    setIsNotificationsOpen(false);
    if (item.path) {
      navigate(toPortalPath(item.path));
    }
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const isOverviewPage = location.pathname === toPortalPath('/dashboard') || location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 text-slate-800 dark:text-slate-200 transition-colors relative">
        
        {/* Left Section: Breadcrumbs / Mobile Navigation Button */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile Back / Menu Navigation matching reference mockup */}
          <div className="sm:hidden flex items-center">
            {!isOverviewPage ? (
              <button 
                onClick={() => navigate(toPortalPath('/dashboard'))}
                className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400 text-[14px] font-medium hover:opacity-80 py-1 px-1 rounded-md cursor-pointer transition-opacity"
                title="Back to Overview"
              >
                <ChevronLeft className="w-5 h-5 -ml-1 text-sky-600 dark:text-sky-400" />
                <span>Home</span>
              </button>
            ) : (
              <button 
                onClick={onToggleSidebar}
                className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-[14px] font-medium hover:opacity-80 py-1 px-1 rounded-md cursor-pointer transition-opacity"
                title="Open Navigation"
              >
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                <span className="hidden xs:inline">Menu</span>
              </button>
            )}
          </div>

          {/* Desktop Breadcrumbs */}
          <div className="hidden sm:flex items-center text-[13px] text-slate-400 dark:text-slate-500">
            <span>{getBreadcrumbCategory()}</span>
            <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-900 dark:text-slate-100 font-medium truncate">{getPageTitle()}</span>
          </div>
        </div>

        {/* Mobile Centered Page Title (matches reference layout) */}
        <div className="sm:hidden absolute left-1/2 -translate-x-1/2 font-bold text-slate-900 dark:text-slate-100 text-[15px] tracking-tight pointer-events-none text-center truncate max-w-[160px]">
          {getPageTitle()}
        </div>

        {/* Right Section: Search & Functional Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Interactive Search Bar */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex relative items-center cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 absolute left-2.5 transition-colors" />
            <input 
              type="text"
              readOnly
              value=""
              placeholder="Search or jump to..."
              className="pl-8 pr-12 py-1.5 w-48 lg:w-56 bg-slate-100/70 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-sky-300 dark:group-hover:border-sky-500 rounded-lg text-[13px] text-slate-800 dark:text-slate-200 transition-all placeholder:text-slate-400 cursor-pointer select-none"
            />
            <div className="absolute right-2 flex items-center">
              <span className="text-[10px] font-mono bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 shadow-xs font-semibold">
                ⌘/
              </span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            
            {/* Mobile Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Search (⌘/)"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* 1. Theme Toggle (Sun / Moon) */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform rotate-0 hover:-rotate-12" />
              )}
            </button>

            {/* 2. History / Recent Activity Popover */}
            <div className="relative" ref={historyRef}>
              <button 
                onClick={() => {
                  setIsHistoryOpen(prev => !prev);
                  setIsNotificationsOpen(false);
                }}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  isHistoryOpen 
                    ? 'bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Operational History"
              >
                <History className="w-4 h-4" />
              </button>

              {/* History Dropdown */}
              {isHistoryOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Operational Audit Log</span>
                    </div>
                    {historyItems.length > 0 && (
                      <button 
                        onClick={handleClearHistory}
                        className="text-[11px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                    {historyItems.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No recent activity recorded.
                      </div>
                    ) : (
                      historyItems.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => {
                            setIsHistoryOpen(false);
                            navigate(toPortalPath(item.path));
                          }}
                          className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50 transition-all cursor-pointer group"
                        >
                          <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 leading-snug">
                            {item.action}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            {item.time}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(prev => !prev);
                  setIsHistoryOpen(false);
                }}
                className={`p-1.5 rounded-md transition-colors cursor-pointer relative ${
                  isNotificationsOpen 
                    ? 'bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Alerts & Warnings</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold font-mono">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                      >
                        <Check className="w-3 h-3" /> Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          n.unread 
                            ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-100 dark:border-sky-900/40' 
                            : 'bg-white dark:bg-slate-900/60 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="shrink-0 mt-0.5">
                            {n.type === 'critical' ? (
                              <ShieldAlert className="w-4 h-4 text-red-500" />
                            ) : n.type === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Info className="w-4 h-4 text-sky-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-[12px] font-bold text-slate-900 dark:text-white truncate">
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {n.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-2 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate(toPortalPath('/dashboard/impact'));
                      }}
                      className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      View All Coastal Warnings →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Right Sidebar / Insights Quick Toggle */}
            <button 
              onClick={() => navigate(toPortalPath('/dashboard/earth'))}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer hidden sm:flex"
              title="Launch VAYU Earth Explorer"
            >
              <Sidebar className="w-4 h-4" />
            </button>
            
          </div>
          
        </div>
      </header>

      {/* Global Interactive Command Palette / Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search commands, pages, or cyclones..."
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                ESC
              </kbd>
            </div>

            {/* Suggestions list */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredSearchItems.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No matching pages or cyclones found for "{searchQuery}".
                </div>
              ) : (
                filteredSearchItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleSearchSelect(item)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      idx === searchSelectedIndex
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">{item.title}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-500 shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Quick navigation for VAYU Operations Portal</span>
              <span>Press <kbd className="font-mono bg-white dark:bg-slate-700 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-600">Enter</kbd> to select</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
