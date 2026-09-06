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

// Interactive iOS 3D Glass Navigation Item with Tilt, Specular Glare, Bevel Lighting & Blue Bullet
const SidebarNavItem = ({ item, isActive, onClick }) => {
  const btnRef = useRef(null);
  const glareRef = useRef(null);
  const isTouchRef = useRef(false);
  const Icon = item.icon;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      isTouchRef.current = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    }
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchRef.current) return;
    const btn = btnRef.current;
    const glare = glareRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const px = (x / width) * 2 - 1;
    const py = (y / height) * 2 - 1;

    const maxTilt = 8;
    const rotateX = -py * maxTilt;
    const rotateY = px * maxTilt;

    btn.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px) scale3d(1.02, 1.02, 1.02) translateZ(10px)`;

    if (glare) {
      const gx = ((x / width) * 100).toFixed(1);
      const gy = ((y / height) * 100).toFixed(1);
      glare.style.opacity = '1';
      glare.style.background = isActive
        ? `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 35%, transparent 70%)`
        : `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.18) 45%, transparent 75%)`;
    }
  };

  const handleMouseEnter = () => {
    if (isTouchRef.current) return;
    const btn = btnRef.current;
    if (btn) {
      btn.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease';
    }
  };

  const handleMouseLeave = () => {
    if (isTouchRef.current) return;
    const btn = btnRef.current;
    const glare = glareRef.current;

    if (btn) {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background 0.3s ease';
      btn.style.transform = isActive
        ? 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(-0.5px) scale3d(1, 1, 1) translateZ(4px)'
        : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1) translateZ(0px)';
    }

    if (glare) {
      glare.style.opacity = '0';
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`sidebar-ios-glass-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer group select-none border shrink-0 ${
        isActive
          ? 'is-active text-slate-950 font-bold border-sky-200/90'
          : 'border-transparent text-slate-600 hover:text-slate-950'
      }`}
    >
      {/* Specular Glare Layer that follows mouse cursor in 3D */}
      <div ref={glareRef} className="ios-glass-specular" />

      {/* Top Edge Bevel Optical Reflection Rim */}
      <div className="ios-glass-bevel" />

      {/* Content with Blue Bullet on Left for Selected Option */}
      <div className="flex items-center gap-2.5 min-w-0 relative z-10 transition-transform duration-200">
        {/* Luminous Electric Cyan/Blue Bullet indicator on Selected Option */}
        {isActive && (
          <span className="relative flex items-center justify-center shrink-0 w-2.5 h-2.5 -ml-0.5">
            <span className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#38bdf8,0_0_12px_#0ea5e9] ring-2 ring-cyan-400/80" />
          </span>
        )}

        <Icon className={`w-4 h-4 shrink-0 transition-all duration-200 ${
          isActive 
            ? 'text-sky-600 drop-shadow-[0_2px_4px_rgba(2,132,199,0.3)]' 
            : 'text-slate-400 group-hover:text-sky-600 group-hover:scale-110 group-hover:drop-shadow-[0_2px_4px_rgba(2,132,199,0.25)]'
        }`} />

        <span className={`truncate transition-colors duration-200 ${
          isActive 
            ? 'font-bold text-slate-950 tracking-wide' 
            : 'font-semibold text-slate-600 group-hover:text-slate-950 group-hover:font-bold'
        }`}>
          {item.label}
        </span>
      </div>

      {/* Badge (e.g. "Live") */}
      {item.badge && (
        <span 
          className={`relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-all duration-200 ${
            isActive 
              ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
              : 'bg-red-100 text-red-600 group-hover:bg-red-500 group-hover:text-white group-hover:scale-105 group-hover:shadow-[0_2px_8px_rgba(239,68,68,0.4)]'
          }`}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const menuRef = useRef(null);
  const accountBtnRef = useRef(null);
  const accountGlareRef = useRef(null);

  const handleAccountMouseMove = (e) => {
    const btn = accountBtnRef.current;
    const glare = accountGlareRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const px = (x / width) * 2 - 1;
    const py = (y / height) * 2 - 1;

    const rotateX = -py * 6;
    const rotateY = px * 6;

    btn.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-1.5px) scale3d(1.015, 1.015, 1.015) translateZ(8px)`;

    if (glare) {
      const gx = ((x / width) * 100).toFixed(1);
      const gy = ((y / height) * 100).toFixed(1);
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.15) 45%, transparent 75%)`;
    }
  };

  const handleAccountMouseEnter = () => {
    const btn = accountBtnRef.current;
    if (btn) {
      btn.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease';
    }
  };

  const handleAccountMouseLeave = () => {
    const btn = accountBtnRef.current;
    const glare = accountGlareRef.current;

    if (btn) {
      btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background 0.3s ease';
      btn.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1) translateZ(0px)';
    }

    if (glare) {
      glare.style.opacity = '0';
    }
  };

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
      <aside className="bg-white text-slate-700 flex flex-col justify-between fixed top-0 left-0 h-screen z-40 border-r border-slate-200 w-56 select-none shadow-xs">
        
        {/* Top Left: Authentic VAYU Logo on White Background with Continuous Sheen */}
        <div className="h-16 px-4 flex items-center border-b border-slate-100 shrink-0">
          <div 
            className="relative overflow-hidden group rounded-xl p-1 -m-1 flex items-center cursor-pointer"
            onClick={() => navigate('/dashboard')}
            title="VAYU Command Center"
          >
            <img 
              src="/vayu.png" 
              alt="VAYU" 
              className="h-12 sm:h-[50px] w-auto object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105" 
            />
            <div 
              className="animate-vayu-sheen absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" 
            />
          </div>
        </div>

        {/* Navigation Links List Grouped By Operations */}
        <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold px-3 py-0.5 select-none">
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

        {/* Bottom Left Account Trigger with iOS 3D Glass Effect */}
        <div className="p-3 border-t border-slate-100 relative" ref={menuRef}>
          <button
            ref={accountBtnRef}
            type="button"
            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
            onMouseMove={handleAccountMouseMove}
            onMouseEnter={handleAccountMouseEnter}
            onMouseLeave={handleAccountMouseLeave}
            className="sidebar-ios-glass-btn w-full flex items-center gap-2 p-2 rounded-xl text-left border border-transparent text-slate-800 cursor-pointer group select-none"
            title="Account & Session"
          >
            {/* Specular Glare Layer that follows mouse cursor in 3D */}
            <div ref={accountGlareRef} className="ios-glass-specular" />

            {/* Glass Top Bevel Reflection Rim */}
            <div className="ios-glass-bevel" />

            <div className="min-w-0 flex-1 relative z-10 transition-transform duration-200">
              <OfficerAccountDisplay />
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0 relative z-10 transition-colors" />
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
