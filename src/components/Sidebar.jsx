import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Satellite, Target, BrainCircuit,
  ShieldAlert, Wind, PanelLeftClose, PanelLeftOpen,
  User, CheckCircle2, Sliders, FileText, Zap, X
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const [showUserModal, setShowUserModal] = useState(false);
  const [officerName, setOfficerName] = useState('Dr. Harsh Vardhan');
  const [officerRole, setOfficerRole] = useState('Lead AI Meteorologist');
  const [stationJurisdiction, setStationJurisdiction] = useState('RSMC New Delhi (North Indian Ocean Desk)');

  return (
    <>
      <aside 
        className={`bg-[#0D1117] text-[#C9D1D9] flex flex-col fixed top-0 left-0 h-screen z-50 transition-all duration-200 border-r border-[#30363D] select-none ${
          isCollapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        {/* Header Branding */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#30363D]">
          <div 
            onClick={() => navigate('/')}
            className={`flex items-center gap-2.5 cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#238636] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
              <Wind className="w-4 h-4" />
            </div>
            
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white tracking-tight">CycloneAI</span>
                  <span className="text-[10px] bg-[#161B22] text-[#58A6FF] border border-[#30363D] px-1.5 py-0.2 rounded font-medium">
                    SIH 2026
                  </span>
                </div>
                <p className="text-[11px] text-[#8B949E] truncate">MoES • IMD Gateway</p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button 
              onClick={onToggle}
              className="text-[#8B949E] hover:text-white p-1 rounded-md hover:bg-[#21262D] transition-colors"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Unified Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
          
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-[#8B949E] text-[11px] font-semibold tracking-wider px-2.5 mb-1.5">
                Core Intelligence
              </p>
            )}
            
            <NavLink
              to="/dashboard"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors bg-[#1F6FEB] text-white font-medium shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4 text-white" />
              {!isCollapsed && <span>AI Command Center</span>}
            </NavLink>
          </div>

          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-[#8B949E] text-[11px] font-semibold tracking-wider px-2.5 mb-1.5">
                Pipeline Capabilities
              </p>
            )}

            <div className="space-y-1 text-xs text-[#8B949E] px-2.5 py-2 bg-[#161B22] border border-[#30363D] rounded-md">
              {!isCollapsed ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-Time Satellite Stream</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>Manual Ingestion Simulator</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                    <span>72h BiLSTM Track Engine</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>CAP District Early Warning</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              )}
            </div>
          </div>

        </nav>

        {/* User Profile / Duty Desk Footer */}
        <div className="p-3 border-t border-[#30363D] bg-[#090D11] space-y-2.5">
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between text-xs px-1">
                <span className="flex items-center gap-1.5 text-[#3FB950] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#3FB950] animate-pulse" />
                  AI Models Online
                </span>
                <span className="text-[#8B949E] text-[11px]">PyTorch / CUDA</span>
              </div>

              {/* User Profile Button */}
              <button
                onClick={() => setShowUserModal(true)}
                className="w-full flex items-center gap-2.5 p-1.5 rounded-md hover:bg-[#161B22] border border-transparent hover:border-[#30363D] transition-colors text-left"
              >
                <div className="w-7 h-7 rounded-full bg-[#21262D] border border-[#30363D] text-[#58A6FF] font-bold text-xs flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white truncate">{officerName}</p>
                  <p className="text-[11px] text-[#8B949E] truncate">{officerRole}</p>
                </div>
              </button>
            </>
          ) : (
            <button 
              onClick={onToggle}
              className="w-full flex items-center justify-center p-1.5 text-[#8B949E] hover:text-white rounded-md hover:bg-[#161B22] transition-colors"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Duty Officer & User Profile Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#003087] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Duty Officer & Station Profile</h3>
                  <p className="text-[11px] text-slate-500">Ministry of Earth Sciences • National Cyclone Desk</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-700">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Designation / Role:</label>
                <input
                  type="text"
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Operational Jurisdiction:</label>
                <input
                  type="text"
                  value={stationJurisdiction}
                  onChange={(e) => setStationJurisdiction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:bg-white"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                <span className="text-[11px] font-semibold text-slate-600 block">System Access Credentials:</span>
                <p className="text-[11px] text-slate-500">
                  Authority: Level-4 Cyclone Warning Dispatcher • CAP ITU-T X.1303 Certified
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowUserModal(false)}
                className="btn-primary text-xs py-1.5 px-4"
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
