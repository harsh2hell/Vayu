import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { AnalysisSessionProvider } from '../context/AnalysisSessionContext';

const DashboardLayout = () => {
  const location = useLocation();
  const isMapFirst = location.pathname.includes('/earth');

  return (
    <AnalysisSessionProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-sky-500 selection:text-white relative">
        
        {/* Left Column: Fixed White Sidebar (width 14rem / 56) */}
        <Sidebar />
        
        {/* Main Content Area (strictly constrained to remaining screen width) */}
        <div className="flex flex-col min-h-screen ml-0 lg:ml-56 w-full lg:w-[calc(100%-14rem)] min-w-0 transition-all relative z-10">
          <Topbar />
          
          <main 
            style={isMapFirst ? { height: 'calc(100vh - 3.5rem)', minHeight: 'calc(100vh - 3.5rem)', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#020617' } : undefined}
            className={isMapFirst ? "flex-1 flex flex-col overflow-hidden relative bg-slate-950 min-h-0" : "flex-1 p-3 sm:p-5 lg:p-8 bg-slate-50/70 pb-12 min-w-0"}
          >
            <Outlet />
          </main>
        </div>

      </div>
    </AnalysisSessionProvider>
  );
};


export default DashboardLayout;
