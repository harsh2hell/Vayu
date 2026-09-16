import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, Shield, ChevronRight, ChevronDown,
  PieChart, Globe, Satellite, Crosshair, Layers,
  Compass, MapPin, Database, Cpu, FileText,
  User, Briefcase, BookOpen, MessageSquare, ShieldCheck
} from 'lucide-react';
import { OfficerAccountDisplay, SafeSignOutButton } from './auth/ClerkAuth';
import { getWebsiteUrl, isProductionDomain, toPortalPath } from '../utils/domain';

const SidebarNavItem = ({ item, isActive, onClick, indent = false }) => {
  const Icon = item.icon;
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] cursor-pointer transition-colors duration-150 ${
        isActive
          ? 'bg-slate-100 text-slate-900 font-medium'
          : 'bg-transparent text-slate-500 hover:text-slate-900'
      } ${indent ? 'pl-8' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon ? (
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`} />
        ) : (
          <span className="w-4 h-4 flex items-center justify-center">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-900' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
          </span>
        )}
        <span className="truncate">{item.label}</span>
      </div>
      {item.badge && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200/50 text-slate-600">
          {item.badge}
        </span>
      )}
    </button>
  );
};

const CollapsibleGroup = ({ title, items, activePath, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-1 mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2 py-1 text-[13px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer group"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
      {isOpen && (
        <div className="space-y-0.5 mt-1">
          {items.map((item) => {
            const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
            return (
              <div key={item.path}>
                <SidebarNavItem
                  item={item}
                  isActive={isActive}
                  onClick={() => onNavigate(item.path)}
                />
                {item.children && isActive && (
                  <div className="mt-0.5 space-y-0.5 relative before:absolute before:left-5 before:top-0 before:bottom-0 before:w-px before:bg-slate-200">
                    {item.children.map(child => (
                      <SidebarNavItem
                        key={child.path}
                        item={child}
                        isActive={activePath === child.path}
                        onClick={() => onNavigate(child.path)}
                        indent={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Normalization logic for matching routes
  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const normCurrent = currentPath.replace(/^\/dashboard\/?/, '/').replace(/\/+$/, '') || '/';
  
  // A helper to figure out active state exactly
  const activePath = location.pathname;

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogoutSuccess = () => {
    setIsLogoutDialogOpen(false);
    if (isProductionDomain()) {
      window.location.href = getWebsiteUrl('/');
    } else {
      navigate('/');
    }
  };

  // Nav mapping mimicking Snow UI structure but using Vayu pages
  // Navigation items matching Snow UI structure with all Vayu pages
  const DASHBOARDS = [
    { path: toPortalPath('/dashboard'), label: 'Command Overview', icon: PieChart },
    { path: toPortalPath('/dashboard/earth'), label: 'VAYU Earth', icon: Globe, badge: 'Live' },
    { path: toPortalPath('/dashboard/satellite'), label: 'Satellite Feed', icon: Satellite },
    { path: toPortalPath('/dashboard/detection'), label: 'Cyclone Models', icon: Crosshair }
  ];

  const PAGES = [
    { 
      path: toPortalPath('/dashboard/trajectory'), 
      label: 'Forecast Data', 
      icon: User,
      children: [
        { path: toPortalPath('/dashboard/trajectory'), label: 'Trajectory' },
        { path: toPortalPath('/dashboard/impact'), label: 'Impact & Alerts' }
      ]
    },
    { path: toPortalPath('/dashboard/classification'), label: 'Morphology', icon: Layers },
    { path: toPortalPath('/dashboard/archives'), label: 'Historical', icon: Database },
    { path: toPortalPath('/dashboard/models'), label: 'AI Intelligence', icon: Cpu },
    { path: toPortalPath('/dashboard/bulletin'), label: 'Official Reports', icon: FileText }
  ];

  return (
    <>
      <aside className="bg-white flex flex-col justify-between fixed top-0 left-0 h-screen z-40 border-r border-slate-100 w-56 select-none font-sans">
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Profile Area */}
          <div className="pt-5 px-4 pb-3">
            <OfficerAccountDisplay />
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto px-2 py-2">
            <CollapsibleGroup 
              title="Dashboards" 
              items={DASHBOARDS} 
              activePath={activePath} 
              onNavigate={handleNavigate} 
            />

            <CollapsibleGroup 
              title="Pages" 
              items={PAGES} 
              activePath={activePath} 
              onNavigate={handleNavigate} 
            />
          </div>
        </div>

        {/* Bottom Logo & End Session */}
        <div className="p-3.5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none group" 
            onClick={() => handleNavigate(toPortalPath('/dashboard'))}
            title="VAYU Cyclone Intelligence"
          >
            <img 
              src="/vayu-icon.png" 
              alt="VAYU Logo" 
              className="w-6 h-6 object-contain transition-transform group-hover:scale-105" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 tracking-tight font-heading leading-none">VAYU</span>
                <span className="text-[9px] px-1 py-0.2 bg-sky-100 text-sky-700 font-bold rounded font-mono">v2.1</span>
              </div>
              <span className="text-[10px] text-slate-400 leading-tight">MoES Cyclone Intel</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="End Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Logout Confirmation Dialog Modal */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-100 rounded-2xl p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Logout
                </h3>
                <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">
                  End your operational session?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(false)}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 border border-transparent transition-all cursor-pointer"
              >
                Cancel
              </button>
              <SafeSignOutButton
                onSignOutComplete={handleLogoutSuccess}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
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
