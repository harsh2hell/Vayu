import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { AnalysisSessionProvider } from '../context/AnalysisSessionContext';
import VayuAiAnalystDrawer from './VayuAiAnalystDrawer';
import ErrorBoundary from './ErrorBoundary';

const DashboardLayout = () => {
  const location = useLocation();
  const isMapFirst = location.pathname.includes('/earth');
  const [isAiAnalystOpen, setIsAiAnalystOpen] = useState(false);

  return (
    <AnalysisSessionProvider>
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white relative transition-colors duration-200">
        
        {/* Left Column: Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen ml-56 w-[calc(100%-14rem)] min-w-0 transition-all relative z-10">
          <Topbar onOpenAiAnalyst={() => setIsAiAnalystOpen(true)} />
          
          <main 
            style={isMapFirst ? { height: 'calc(100vh - 3.5rem)', minHeight: 'calc(100vh - 3.5rem)', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: '#020617' } : undefined}
            className={isMapFirst ? "flex-1 flex flex-col overflow-hidden relative bg-slate-950 min-h-0" : "flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-black/90 pb-12 min-w-0 transition-colors duration-200"}
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

        {/* Floating Quick Action Trigger for VAYU AI Analyst */}
        <button
          type="button"
          onClick={() => setIsAiAnalystOpen(prev => !prev)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/30 hover:shadow-sky-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/20"
          title="Open VAYU AI Operational Analyst"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">VAYU AI Analyst</span>
        </button>

        {/* Operational AI Analyst Drawer */}
        <VayuAiAnalystDrawer 
          isOpen={isAiAnalystOpen} 
          onClose={() => setIsAiAnalystOpen(false)} 
        />

      </div>
    </AnalysisSessionProvider>
  );
};

export default DashboardLayout;
