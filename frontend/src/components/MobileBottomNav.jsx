import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, History, Bell, Settings, User } from 'lucide-react';
import { toPortalPath } from '../utils/domain';

const MobileBottomNav = ({ 
  onToggleSidebar, 
  onOpenHistory, 
  onOpenNotifications, 
  unreadCount = 0 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isHome = currentPath === toPortalPath('/dashboard') || currentPath === '/dashboard';
  const isEarth = currentPath.includes('/earth');
  const isImpact = currentPath.includes('/impact') || currentPath.includes('/trajectory');

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none safe-area-bottom"
    >
      {/* 1. Home / Overview */}
      <button
        type="button"
        onClick={() => navigate(toPortalPath('/dashboard'))}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          isHome 
            ? 'text-slate-900 dark:text-white font-bold' 
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
        title="Overview"
      >
        <div className={`p-1 rounded-full ${isHome ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
          <Home className={`w-5 h-5 ${isHome ? 'fill-slate-900 dark:fill-white' : ''}`} />
        </div>
      </button>

      {/* 2. Operational History */}
      <button
        type="button"
        onClick={() => {
          if (onOpenHistory) {
            onOpenHistory();
          } else {
            navigate(toPortalPath('/dashboard/archives'));
          }
        }}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
        title="Operational History"
      >
        <div className="p-1 rounded-full">
          <History className="w-5 h-5" />
        </div>
      </button>

      {/* 3. Alerts & Notifications */}
      <button
        type="button"
        onClick={() => {
          if (onOpenNotifications) {
            onOpenNotifications();
          } else {
            navigate(toPortalPath('/dashboard/impact'));
          }
        }}
        className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
        title="Notifications"
      >
        <div className="p-1 rounded-full relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </div>
      </button>

      {/* 4. Explorer / Settings (Earth & Models) */}
      <button
        type="button"
        onClick={() => navigate(toPortalPath('/dashboard/earth'))}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
          isEarth 
            ? 'text-sky-600 dark:text-sky-400 font-bold' 
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
        }`}
        title="VAYU Earth"
      >
        <div className={`p-1 rounded-full ${isEarth ? 'bg-sky-50 dark:bg-sky-950/50' : ''}`}>
          <Settings className="w-5 h-5" />
        </div>
      </button>

      {/* 5. Navigation Menu / Profile */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
        title="All Pages & Menu"
      >
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 flex items-center justify-center overflow-hidden ring-1 ring-slate-300 dark:ring-slate-600">
          <User className="w-4 h-4 text-slate-700 dark:text-slate-200" />
        </div>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
