import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { AnalysisSessionProvider } from '../context/AnalysisSessionContext';
const VayuAiAnalystDrawer = React.lazy(() => import('./VayuAiAnalystDrawer'));
import ErrorBoundary from './ErrorBoundary';
import VayuRouteLoader from './VayuRouteLoader';

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
            <React.Suspense fallback={<VayuRouteLoader message="Loading VAYU Operations..." />}>
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
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-medium text-xs shadow-lg shadow-slate-900/15 dark:shadow-black/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-700/40 dark:border-slate-200/50"
          title="Open VAYU AI Operational Analyst"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
          <span className="hidden sm:inline">VAYU AI Analyst</span>
        </button>

        {/* Operational AI Analyst Drawer */}
        {isAiAnalystOpen && (
          <React.Suspense fallback={null}>
            <VayuAiAnalystDrawer 
              isOpen={isAiAnalystOpen} 
              onClose={() => setIsAiAnalystOpen(false)} 
            />
          </React.Suspense>
        )}

      </div>
    </AnalysisSessionProvider>
  );
};

export default DashboardLayout;
