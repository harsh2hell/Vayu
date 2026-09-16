import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileBottomNav from './MobileBottomNav';
import { AnalysisSessionProvider } from '../context/AnalysisSessionContext';
import ErrorBoundary from './ErrorBoundary';

const DashboardLayout = () => {
  const location = useLocation();
  const isMapFirst = location.pathname.includes('/earth');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Automatically collapse sidebar on mobile when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <AnalysisSessionProvider>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white relative">
        
        {/* Mobile Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-label="Close navigation overlay"
          />
        )}

        {/* Left Column: Sidebar (Collapsible drawer on mobile, fixed on desktop) */}
        <Sidebar 
          isMobileOpen={isMobileSidebarOpen} 
          onClose={() => setIsMobileSidebarOpen(false)} 
        />
        
        {/* Main Content Area: full width on mobile (ml-0), offset on desktop (lg:ml-56) */}
        <div className="flex flex-col min-h-screen ml-0 lg:ml-56 w-full lg:w-[calc(100%-14rem)] min-w-0 transition-all relative z-10">
          <Topbar 
            onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
            isMobileSidebarOpen={isMobileSidebarOpen}
          />
          
          <main 
            style={isMapFirst ? { height: 'calc(100vh - 3.5rem)', minHeight: 'calc(100vh - 3.5rem)', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#020617' } : undefined}
            className={isMapFirst ? "flex-1 flex flex-col overflow-hidden relative bg-slate-950 min-h-0 pb-16 lg:pb-0" : "flex-1 p-3 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-slate-900/30 pb-24 lg:pb-12 min-w-0"}
          >
            <React.Suspense fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-400 font-mono text-xs" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
                <span>Loading Geospatial Intelligence...</span>
              </div>
            }>
              <ErrorBoundary key={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </React.Suspense>
          </main>
        </div>

        {/* Mobile Bottom Navigation Bar matching reference layout */}
        <MobileBottomNav 
          onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

      </div>
    </AnalysisSessionProvider>
  );
};

export default DashboardLayout;
