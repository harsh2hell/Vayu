import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Clock, ChevronRight, ExternalLink, User, LogOut, Shield
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Topbar = () => {
  const [time, setTime] = useState(new Date());
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const mobileAccountRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Close mobile account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileAccountRef.current && !mobileAccountRef.current.contains(event.target)) {
        setIsMobileAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (location.pathname.includes('/track')) return '4D Track Visualizer';
    if (location.pathname.includes('/satellite')) return 'Satellite Telemetry (INSAT)';
    if (location.pathname.includes('/detection')) return 'AI Vision Detection';
    if (location.pathname.includes('/classification')) return 'Dvorak Classification';
    if (location.pathname.includes('/prediction')) return '72h Trajectory Studio';
    if (location.pathname.includes('/alerts')) return 'CAP Early Warnings';
    if (location.pathname.includes('/analytics')) return 'Historical Storm DB';
    if (location.pathname.includes('/performance')) return 'AI Model Benchmarks';
    if (location.pathname.includes('/architecture')) return 'Pipeline Architecture';
    return 'Command Overview';
  };

  const istString = time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 text-slate-800">
        
        {/* Left Section: Mobile Brand / Desktop Title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Logo on White Background */}
          <div className="lg:hidden flex items-center shrink-0">
            <img 
              src="/vayu.png" 
              alt="VAYU" 
              className="h-8 w-auto object-contain cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
            <span className="text-slate-500 font-medium hidden sm:inline">MoES Command</span>
            <ChevronRight className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span className="text-slate-900 font-bold truncate">{getPageTitle()}</span>
          </div>
        </div>

        {/* Right Section: Time, Public Portal Link & Mobile Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time IST Clock */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{istString} IST</span>
          </div>

          {/* Return to Public Portal */}
          <button
            onClick={() => navigate('/')}
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-md transition-colors cursor-pointer"
          >
            <span>Public Portal</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Alert Bell */}
          <button
            onClick={() => navigate('/dashboard/alerts')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative cursor-pointer"
            title="Active Coastal Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1" />
          </button>

          {/* Mobile Account Trigger (visible on lg:hidden) */}
          <div className="lg:hidden relative" ref={mobileAccountRef}>
            <button
              onClick={() => setIsMobileAccountOpen(!isMobileAccountOpen)}
              className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 cursor-pointer"
              title="Account"
            >
              <User className="w-4 h-4" />
            </button>

            {isMobileAccountOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">IMD Officer</div>
                  <div className="text-[10px] text-slate-500">officer.cyclone@imd.gov.in</div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsMobileAccountOpen(false);
                      setIsLogoutDialogOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Mobile Logout Confirmation Modal */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Logout</h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Are you sure you want to end your operational session and return to the public website?
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
              <button
                type="button"
                onClick={() => {
                  setIsLogoutDialogOpen(false);
                  navigate('/');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;
