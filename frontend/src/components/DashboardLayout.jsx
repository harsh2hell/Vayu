import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased selection:bg-sky-500 selection:text-white relative overflow-x-hidden">
      
      {/* Ambient luminous glow orbs behind glass sidebar & header */}
      <div className="fixed top-0 left-0 w-80 h-96 bg-gradient-to-br from-sky-400/20 via-indigo-300/10 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-72 h-80 bg-gradient-to-tr from-teal-300/15 via-sky-200/10 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Left Column: VisionOS Transparent Glossy Glass Sidebar */}
      <Sidebar />
      
      {/* Main Content Area (offset by left column width on desktop) */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 lg:ml-56 transition-all relative z-10">
        <Topbar />
        
        <main className="flex-1 p-3 sm:p-5 lg:p-8 bg-slate-50/70 pb-12">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
