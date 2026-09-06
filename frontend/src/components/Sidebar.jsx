import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, MoreVertical, Shield,
  Activity, Satellite, Crosshair, Layers,
  Compass, Database, Cpu,
  MapPin, FileText
} from 'lucide-react';
import { OfficerAccountDisplay, SafeSignOutButton } from './auth/ClerkAuth';
import { getWebsiteUrl, isProductionDomain } from '../utils/domain';

// Clean, Professional VAYU Navigation Item (Solid White Dashboard Aesthetic)
const SidebarNavItem = ({ item, isActive, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 select-none group ${
        isActive
          ? 'bg-blue-50 text-[#003087] font-bold border border-blue-200/90 shadow-none'
          : 'bg-transparent text-slate-800 hover:text-slate-950 hover:bg-slate-100/80 font-medium border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 transition-colors ${
          isActive ? 'text-[#003087]' : 'text-slate-500 group-hover:text-slate-700'
        }`} />
        <span className="truncate tracking-tight">{item.label}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {item.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono bg-red-50 text-red-700 border border-red-200">
            {item.badge}
          </span>
        )}
        {isActive && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#003087] shrink-0" />
        )}
      </div>
    </button>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const menuRef = useRef(null);

  const NAV_GROUPS = [
    {
      title: 'COMMAND',
      items: [
        { path: '/dashboard', label: 'Command Overview', icon: Activity, exact: true },
      ]
    },
    {
      title: 'AI VISION',
      items: [
        { path: '/dashboard/satellite', label: 'Satellite Imagery', icon: Satellite },
        { path: '/dashboard/detection', label: 'Cyclone Detection', icon: Crosshair },
        { path: '/dashboard/classification', label: 'Morphology Classification', icon: Layers },
      ]
    },
    {
      title: 'FORECAST',
      items: [
        { path: '/dashboard/trajectory', label: 'Trajectory Forecast', icon: Compass },
        { path: '/dashboard/impact', label: 'Impact & Landfall', icon: MapPin },
      ]
    },
    {
      title: 'HISTORICAL',
      items: [
        { path: '/dashboard/archives', label: 'Storm Archives', icon: Database },
      ]
    },
    {
      title: 'AI SYSTEM',
      items: [
        { path: '/dashboard/models', label: 'Model Intelligence', icon: Cpu },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { path: '/dashboard/bulletin', label: 'Official Bulletin', icon: FileText },
      ]
    }
  ];

  const handleLogoutSuccess = () => {
    setIsLogoutDialogOpen(false);
    if (isProductionDomain()) {
      window.location.href = getWebsiteUrl('/');
    } else {
      navigate('/');
    }
  };

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Left Column: Pure White Background, VAYU Logo at top, Operations Nav, Account at bottom */}
      <aside 
        className="bg-white text-slate-800 flex flex-col justify-between fixed top-0 left-0 h-screen z-40 border-r border-slate-200 w-56 select-none shadow-none"
        style={{ backgroundColor: '#ffffff', opacity: 1 }}
      >
        
        {/* Top Left: Authentic VAYU Logo on Pure White Background with Continuous Sheen */}
        <div className="h-[84px] px-3.5 flex items-center border-b border-slate-100 shrink-0 bg-white">
          <div 
            className="relative overflow-hidden group rounded-xl p-1 -m-1 flex items-center cursor-pointer"
            onClick={() => navigate('/dashboard')}
            title="VAYU Command Center"
          >
            <img 
              src="/vayu.png" 
              alt="VAYU" 
              className="h-[66px] sm:h-[74px] w-auto max-w-[175px] object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105" 
            />
            <div 
              className="animate-vayu-sheen absolute inset-y-0 w-40 bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" 
            />
          </div>
        </div>

        {/* Navigation Links List Grouped By Operations */}
        <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto bg-white">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 py-1 select-none">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = item.exact 
                  ? location.pathname === item.path 
                  : location.pathname.startsWith(item.path);
                return (
                  <SidebarNavItem
                    key={item.path}
                    item={item}
                    isActive={isActive}
                    onClick={() => navigate(item.path)}
                  />
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Left Account Trigger on Clean Solid White */}
        <div className="p-3 border-t border-slate-200 bg-white relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100/80 border border-transparent text-slate-800 transition-colors cursor-pointer group select-none"
            title="Account & Session"
          >
            <div className="min-w-0 flex-1">
              <OfficerAccountDisplay />
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 transition-colors" />
          </button>

          {/* Account Sub-menu Popover */}
          {isAccountMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-sky-600" />
                  <span>Central Operations Desk</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Clerk Pro SSO • login.vayusat.live</div>
              </div>
              
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </aside>

      {/* Logout Confirmation Dialog Modal */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Logout
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Are you sure you want to end your operational session and return to login.vayusat.live?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <SafeSignOutButton
                onSignOutComplete={handleLogoutSuccess}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </SafeSignOutButton>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
