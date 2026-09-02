import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Satellite, Target, Activity,
  ShieldAlert, Wind, PanelLeftClose, PanelLeftOpen,
  User, Compass, Layers, BarChart3, Gauge, Cpu,
  ChevronDown, MoreHorizontal, Check, X, ShieldCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/track', label: '4D Track Visualizer', icon: Compass },
  { path: '/dashboard/satellite', label: 'Satellite Ingestion', icon: Satellite },
  { path: '/dashboard/detection', label: 'Vision Detection', icon: Target },
  { path: '/dashboard/classification', label: 'Dvorak Classification', icon: Layers },
  { path: '/dashboard/prediction', label: '72h Trajectory', icon: Activity },
  { path: '/dashboard/alerts', label: 'CAP Early Warnings', icon: ShieldAlert, badge: 'Live' },
  { path: '/dashboard/analytics', label: 'Historical Analytics', icon: BarChart3 },
  { path: '/dashboard/performance', label: 'Model Benchmarks', icon: Gauge },
  { path: '/dashboard/architecture', label: 'System Architecture', icon: Cpu },
];

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserModal, setShowUserModal] = useState(false);
  const [officerName, setOfficerName] = useState('Dr. Harsh Vardhan');
  const [officerRole, setOfficerRole] = useState('Lead AI Meteorologist');
  const [stationJurisdiction, setStationJurisdiction] = useState('RSMC New Delhi • North Indian Ocean Desk');

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path) && path !== '/dashboard';
  };

  return (
    <>
      <aside 
        className={`bg-white text-slate-700 flex flex-col fixed top-0 left-0 h-screen z-50 transition-all duration-200 border-r border-slate-200 select-none shadow-xs ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div 
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-2.5 cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
            title="VAYU AI"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Wind className="w-4 h-4 text-sky-400" />
            </div>
            
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-heading font-black text-sm text-slate-900 tracking-tight block">VAYU AI</span>
                <span className="text-[10px] font-mono text-slate-400 block tracking-tight">Cyclone Intelligence</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button 
              onClick={onToggle}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Workspace Dropdown Pill (Autonex Style) */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-slate-100">
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 transition-colors text-left text-xs font-medium text-slate-800">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <div className="w-5 h-5 rounded bg-sky-600 text-white font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  U
                </div>
                <span className="truncate text-xs font-semibold text-slate-800">IMD National Desk</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>
          </div>
        )}

        {/* Navigation Items List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item, idx) => {
            const active = isActive(item.path, item.exact);
            const Icon = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 relative ${
                  active
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500'}`} />
                
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Footer (Autonex Style) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          {!isCollapsed ? (
            <button
              onClick={() => setShowUserModal(true)}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center flex-shrink-0">
                  H
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{officerName}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{officerRole}</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ) : (
            <button 
              onClick={onToggle}
              className="w-full flex items-center justify-center p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Duty Officer Profile Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">Meteorological Officer Profile</h3>
                  <p className="text-[11px] text-slate-500">Ministry of Earth Sciences • National Cyclone Desk</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUserModal(false)} 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Officer Name:</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Role / Designation:</label>
                <input
                  type="text"
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Jurisdiction:</label>
                <input
                  type="text"
                  value={stationJurisdiction}
                  onChange={(e) => setStationJurisdiction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowUserModal(false)}
                className="btn-primary text-xs py-2 px-5"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
