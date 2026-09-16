import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Clock, ChevronRight, ExternalLink, User, LogOut, Search,
  Sun, History, LayoutSidebar, Sidebar, Menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getWebsiteUrl, isProductionDomain, toPortalPath } from '../utils/domain';
import { OfficerAccountDisplay, SafeSignOutButton } from './auth/ClerkAuth';

const Topbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname.includes('/earth')) return 'VAYU Earth';
    if (location.pathname.includes('/satellite')) return 'Satellite Feed';
    if (location.pathname.includes('/detection')) return 'Cyclone Models';
    if (location.pathname.includes('/classification')) return 'Morphology';
    if (location.pathname.includes('/trajectory') || location.pathname.includes('/prediction') || location.pathname.includes('/track')) return 'Trajectory';
    if (location.pathname.includes('/impact') || location.pathname.includes('/alerts')) return 'Impact & Alerts';
    if (location.pathname.includes('/archives') || location.pathname.includes('/analytics')) return 'Historical Archives';
    if (location.pathname.includes('/models') || location.pathname.includes('/training') || location.pathname.includes('/performance') || location.pathname.includes('/architecture')) return 'AI Intelligence';
    if (location.pathname.includes('/bulletin')) return 'Official Reports';
    return 'Overview';
  };
  
  const getBreadcrumbCategory = () => {
    if (location.pathname.includes('/trajectory') || location.pathname.includes('/classification') || location.pathname.includes('/archives') || location.pathname.includes('/models') || location.pathname.includes('/bulletin')) {
      return 'Pages';
    }
    return 'Dashboards';
  }

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 text-slate-800">
        
        {/* Left Section: Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <button className="hidden sm:flex text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <LayoutSidebar className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center text-slate-400">
              <span>{getBreadcrumbCategory()}</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900 font-medium truncate">{getPageTitle()}</span>
            </div>
            
            {/* Mobile Title */}
            <div className="sm:hidden font-semibold text-slate-900">
              {getPageTitle()}
            </div>
          </div>
        </div>

        {/* Right Section: Search & Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Search Bar (Hidden on small screens) */}
          <div className="hidden md:flex relative items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input 
              type="text"
              placeholder="Search"
              className="pl-8 pr-12 py-1.5 w-48 bg-slate-100/50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-sky-500 focus:outline-none rounded-lg text-[13px] text-slate-800 transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-2.5 flex items-center">
              <span className="text-[10px] font-mono text-slate-400 font-medium">⌘/</span>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="Theme">
              <Sun className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer" title="History">
              <History className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer relative" title="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer hidden sm:flex" title="Toggle Right Sidebar">
              <Sidebar className="w-4 h-4" />
            </button>
            
            {/* Mobile Menu Toggle */}
            <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer sm:hidden">
              <Menu className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      </header>
    </>
  );
};

export default Topbar;
