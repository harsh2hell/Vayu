import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, MoreVertical, Shield,
  Activity, Globe, Satellite, Crosshair, Layers,
  Compass, Database, Cpu,
  MapPin, FileText
} from 'lucide-react';
import { OfficerAccountDisplay, SafeSignOutButton } from './auth/ClerkAuth';
import { getWebsiteUrl, isProductionDomain, toPortalPath, isPortalSubdomain } from '../utils/domain';

// 3D Clear Crystal Glass Navigation Item (Pure transparent shell over the continuous sliding glass pill)
const SidebarNavItem = React.forwardRef(({ item, isActive, isHovered, onClick, onMouseEnter }, ref) => {
  const Icon = item.icon;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`group relative z-10 w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer select-none transition-colors duration-200 bg-transparent border border-transparent ${
        isActive
          ? 'text-slate-950 font-bold'
          : isHovered
          ? 'text-slate-950 font-semibold'
          : 'text-slate-700 hover:text-slate-950 font-medium'
      }`}
    >
      <div className="relative z-10 flex items-center gap-2.5 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
          isActive
            ? 'text-sky-600'
            : isHovered
            ? 'text-sky-500'
            : 'text-slate-500 group-hover:text-slate-800'
        }`} />
        <span className="truncate tracking-tight">{item.label}</span>
      </div>

      <div className="relative z-10 flex items-center gap-1.5 shrink-0">
        {item.badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono bg-red-50 text-red-700 border border-red-200 shadow-2xs">
            {item.badge}
          </span>
        )}
      </div>
    </button>
  );
});

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
        { path: toPortalPath('/dashboard'), label: 'Command Overview', icon: Activity, exact: true },
        { path: toPortalPath('/dashboard/earth'), label: 'VAYU Earth', icon: Globe, badge: 'LIVE' },
      ]
    },
    {
      title: 'AI VISION',
      items: [
        { path: toPortalPath('/dashboard/satellite'), label: 'Satellite Imagery', icon: Satellite },
        { path: toPortalPath('/dashboard/detection'), label: 'Cyclone Detection', icon: Crosshair },
        { path: toPortalPath('/dashboard/classification'), label: 'Morphology Classification', icon: Layers },
      ]
    },
    {
      title: 'FORECAST',
      items: [
        { path: toPortalPath('/dashboard/trajectory'), label: 'Trajectory Forecast', icon: Compass },
        { path: toPortalPath('/dashboard/impact'), label: 'Impact & Landfall', icon: MapPin },
      ]
    },
    {
      title: 'HISTORICAL',
      items: [
        { path: toPortalPath('/dashboard/archives'), label: 'Storm Archives', icon: Database },
      ]
    },
    {
      title: 'AI SYSTEM',
      items: [
        { path: toPortalPath('/dashboard/models'), label: 'Model Intelligence', icon: Cpu },
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { path: toPortalPath('/dashboard/bulletin'), label: 'Official Bulletin', icon: FileText },
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

  // Check if current route matches nav item path across both subdomain styles (/satellite or /dashboard/satellite)
  const isItemActive = (itemPath, exact) => {
    const current = location.pathname.replace(/\/+$/, '') || '/';
    const target = itemPath.replace(/\/+$/, '') || '/';
    const normCurrent = current.replace(/^\/dashboard\/?/, '/').replace(/\/+$/, '') || '/';
    const normTarget = target.replace(/^\/dashboard\/?/, '/').replace(/\/+$/, '') || '/';

    if (exact || normTarget === '/') {
      return current === target || normCurrent === normTarget;
    }
    return current === target || current.startsWith(target + '/') || normCurrent === normTarget || normCurrent.startsWith(normTarget + '/');
  };

  // Continuous Apple 3D Clear Glass Sliding Pill State & Logic
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [hoveredPath, setHoveredPath] = useState(null);
  const [pillRect, setPillRect] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  const [glassMouse, setGlassMouse] = useState({ x: 0, y: 0, isHovered: false });

  // Find active item path
  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const activeItem = allItems.find(it => isItemActive(it.path, it.exact));
  const activePath = activeItem ? activeItem.path : (allItems[0]?.path || '');
  const targetPath = hoveredPath || activePath;

  const updatePill = useCallback(() => {
    const navEl = navRef.current;
    const targetEl = itemRefs.current[targetPath];
    if (!navEl || !targetEl) return;

    setPillRect({
      left: targetEl.offsetLeft,
      top: targetEl.offsetTop,
      width: targetEl.offsetWidth,
      height: targetEl.offsetHeight,
      ready: true
    });
  }, [targetPath]);

  useEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    const t = setTimeout(updatePill, 40);
    return () => {
      window.removeEventListener('resize', updatePill);
      clearTimeout(t);
    };
  }, [updatePill, location.pathname]);

  const handleNavMouseMove = (e) => {
    if (!navRef.current) return;
    const navRect = navRef.current.getBoundingClientRect();
    const relX = e.clientX - navRect.left - pillRect.left;
    const relY = e.clientY - navRect.top - pillRect.top;
    setGlassMouse({ x: relX, y: relY, isHovered: true });
  };

  const handleNavMouseLeave = () => {
    setHoveredPath(null);
    setGlassMouse(prev => ({ ...prev, isHovered: false }));
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
            onClick={() => navigate(toPortalPath('/dashboard'))}
            title="VAYU Command Center"
          >
            <img 
              src="/vayu.png" 
              alt="VAYU" 
              className="h-[66px] sm:h-[74px] w-auto max-w-[175px] object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105" 
            />
            {/* Continuous, Smooth Diagonal Light Sheen Effect */}
            <div 
              className="animate-vayu-sheen absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" 
            />
          </div>
        </div>

        {/* Navigation Links List Grouped By Operations */}
        <nav 
          ref={navRef}
          onMouseMove={handleNavMouseMove}
          onMouseLeave={handleNavMouseLeave}
          className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto bg-white relative"
        >
          {/* Continuous Motion Apple 3D Clear Crystal Glass Sliding Pill */}
          {pillRect.ready && (
            <div
              className="sidebar-sliding-glass-pill overflow-hidden"
              style={{
                transform: `translate3d(${pillRect.left}px, ${pillRect.top}px, 0)`,
                width: `${pillRect.width}px`,
                height: `${pillRect.height}px`,
                opacity: pillRect.ready ? 1 : 0
              }}
            >
              {/* 3D Convex Top Curved Specular Lens Reflection */}
              <span className="absolute inset-x-1.5 top-[1px] h-[46%] rounded-t-xl bg-gradient-to-b from-white/95 via-white/28 to-transparent pointer-events-none" />

              {/* Specular Top-Center Glass Glint */}
              <span className="absolute left-1/4 top-[2px] w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none opacity-90" />

              {/* Prismatic Lateral Refractions */}
              <span className="absolute inset-y-1.5 left-[1px] w-[1.5px] bg-gradient-to-b from-white/85 via-white/20 to-transparent pointer-events-none rounded-l-xl" />
              <span className="absolute inset-y-1.5 right-[1px] w-[1.5px] bg-gradient-to-b from-white/85 via-white/20 to-transparent pointer-events-none rounded-r-xl" />

              {/* Lower Rim Cyan Specular Line */}
              <span className="absolute inset-x-3 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/90 to-transparent pointer-events-none" />

              {/* Interactive Dynamic Cursor Specular Flare inside Glass */}
              {glassMouse.isHovered && (
                <span
                  className="absolute w-24 h-12 rounded-full pointer-events-none transition-opacity duration-200 -translate-x-1/2 -translate-y-1/2 blur-xs opacity-50"
                  style={{
                    left: `${glassMouse.x}px`,
                    top: `${glassMouse.y}px`,
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(56,189,248,0.25) 55%, transparent 75%)'
                  }}
                />
              )}
            </div>
          )}

          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold px-3 py-1 select-none">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = isItemActive(item.path, item.exact);
                const isHovered = hoveredPath === item.path;
                return (
                  <SidebarNavItem
                    key={item.path}
                    ref={(el) => (itemRefs.current[item.path] = el)}
                    item={item}
                    isActive={isActive}
                    isHovered={isHovered}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onClick={() => {
                      setHoveredPath(null);
                      navigate(item.path);
                    }}
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
                <div className="text-[10px] text-slate-500 mt-0.5">Authorized Duty Officer Session</div>
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
                  Are you sure you want to end your operational session?
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
