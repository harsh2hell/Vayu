import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, MoreVertical, Shield } from 'lucide-react';
import { OfficerAccountDisplay, SafeSignOutButton } from './auth/ClerkAuth';
import { getWebsiteUrl, isProductionDomain } from '../utils/domain';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogoutSuccess = () => {
    setIsLogoutDialogOpen(false);
    if (isProductionDomain()) {
      window.location.href = getWebsiteUrl('/');
    } else {
      navigate('/');
    }
  };

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Left Column: Pure White Background, VAYU Logo at top, Account at bottom */}
      <aside className="bg-white text-slate-700 flex flex-col justify-between fixed top-0 left-0 h-screen z-40 border-r border-slate-200 w-56 select-none shadow-xs">
        
        {/* Top Left: Authentic VAYU Logo on White Background with Continuous Sheen */}
        <div className="h-16 px-5 flex items-center border-b border-slate-100">
          <div 
            className="relative overflow-hidden group rounded-xl p-1 -m-1 flex items-center cursor-pointer"
            onClick={() => navigate('/dashboard')}
            title="VAYU Command Center"
          >
            <img 
              src="/vayu.png" 
              alt="VAYU" 
              className="h-10.5 w-auto object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105" 
            />
            <div 
              className="animate-vayu-sheen absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" 
            />
          </div>
        </div>

        {/* Empty Middle Space */}
        <div className="flex-1" />

        {/* Bottom Left Account Trigger */}
        <div className="p-3 border-t border-slate-100 relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsAccountMenuOpen((prev) => !prev)}
            className="w-full flex items-center gap-2 p-2 rounded-xl text-left hover:bg-slate-100/80 text-slate-800 transition-all cursor-pointer group"
            title="Account & Session"
          >
            <div className="min-w-0 flex-1">
              <OfficerAccountDisplay />
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </button>

          {/* Account Sub-menu Popover */}
          {isAccountMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-sky-600" />
                  <span>Central Operations Desk</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Clerk Pro SSO • autonex.studio</div>
              </div>
              
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </aside>

      {/* Logout Confirmation Dialog Modal */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Logout
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Are you sure you want to end your operational session and return to www.autonex.studio?
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
              <SafeSignOutButton
                onSignOutComplete={handleLogoutSuccess}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
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
