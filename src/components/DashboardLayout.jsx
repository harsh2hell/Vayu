import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex antialiased selection:bg-sky-500 selection:text-white">
      
      {/* Left Column: Only VAYU Logo at top and Account at bottom */}
      <Sidebar />
      
      {/* Main Content Area (offset by left column width on desktop) */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 lg:ml-56 transition-all">
        <Topbar />
        
        <main className="flex-1 p-3 sm:p-5 lg:p-8 overflow-y-auto bg-slate-50/70 pb-12">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
