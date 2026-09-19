import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneCall, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
import { useLiveClock } from '../utils/liveDateTime';
import { getStatusUrl, isProductionDomain } from '../utils/domain';

export const FONT_SCALE_MAP = {
  '-3': 75,
  '-2': 85,
  '-1': 92,
  '0': 100,
  '1': 110,
  '2': 125,
  '3': 140,
  '4': 155,
};

export const getFontScalePercent = (offset) => {
  return FONT_SCALE_MAP[String(offset)] ?? 100;
};

export const applyGlobalFontScale = (offset) => {
  const percent = getFontScalePercent(offset);
  document.documentElement.style.fontSize = `${percent}%`;
  try {
    localStorage.setItem('vayu_font_offset', String(offset));
  } catch {
    // ignore
  }
};

const PublicNavbar = ({
  isHindi,
  setIsHindi,
  isDarkMode,
  setIsDarkMode,
  fontSizeOffset,
  _setFontSizeOffset
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const liveClock = useLiveClock(1000);

  // Read initial offset from prop or localStorage
  const currentOffset = typeof fontSizeOffset === 'number'
    ? fontSizeOffset
    : (() => {
      try {
        const s = localStorage.getItem('vayu_font_offset');
        return s !== null ? parseInt(s, 10) : 0;
      } catch { 
        return 0; 
      }
    })();

  useEffect(() => {
    applyGlobalFontScale(currentOffset);
  }, [currentOffset]);

  const NAV_LINKS = [
    {
      path: '/',
      label: isHindi ? 'मुख्य पृष्ठ' : 'Home',
      match: ['/']
    },
    {
      path: '/ai-cyclone',
      label: isHindi ? 'एआई चक्रवात ट्रैक' : 'AI Cyclone Track',
      match: ['/ai-cyclone', '/ai-intelligence', '/cyclone-ai']
    },
    {
      path: '/city-tracker',
      label: isHindi ? 'तटीय शहर निगरानी' : 'City & Area Watch',
      match: ['/city-tracker', '/cities']
    },
    {
      path: '/threat-map',
      label: isHindi ? 'तटीय खतरा मानचित्र' : 'Threat Map',
      match: ['/threat-map', '/radar', '/gis-radar', '/threat-matrix']
    },
    {
      path: '/live-map',
      label: isHindi ? 'लाइव रडार व पवन' : 'Live Radar & Wind',
      match: ['/live-map', '/live-earth', '/3d-earth']
    },
    {
      path: '/safety-updates',
      label: isHindi ? 'बुलेटिन व सुरक्षा' : 'Bulletins & Safety',
      match: ['/safety-updates', '/bulletins', '/safety-guide', '/safety', '/updates']
    },
    {
      path: '/status',
      label: isHindi ? 'सिस्टम स्थिति' : 'System Status',
      match: ['/status']
    }
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200 font-sans">
      {/* Subtle National Tricolor Accent Line */}
      <div className="h-[1.5px] bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808] opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        
        {/* Left: VAYU Brand Logo */}
        <div 
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
          title={isHindi ? "राष्ट्रीय चक्रवात पोर्टल होमपेज पर जाएं" : "Go to National Cyclone Portal Home"}
        >
          <img
            src={isDarkMode ? "/vayu-white.png?v=2" : "/vayu.png"}
            alt="VAYU"
            className="h-8 sm:h-9 w-auto object-contain transition-opacity duration-150 group-hover:opacity-80"
          />
        </div>

        {/* Center: Minimalist Monochromatic Segmented Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          {NAV_LINKS.map((link) => {
            const isSelected = link.match.includes(location.pathname);
            return (
              <button
                key={link.path}
                onClick={() => {
                  if (link.path === '/' && location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else if (link.path === '/status' && isProductionDomain()) {
                    window.location.href = getStatusUrl('/status');
                  } else {
                    navigate(link.path);
                  }
                }}
                className={`px-3 lg:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap select-none ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Portal CTA & Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Operations Console Button */}
          <button
            onClick={() => navigate('/threat-map')}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer"
            title={isHindi ? "परिचालन नियंत्रण कक्ष खोलें" : "Open Operational Command Console"}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isHindi ? 'अधिकारी नियंत्रण कक्ष' : 'Operations Console'}</span>
          </button>

          {/* Language Switcher */}
          {setIsHindi && (
            <button
              onClick={() => setIsHindi(!isHindi)}
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs font-semibold transition-colors cursor-pointer"
              title="Toggle Language / भाषा बदलें"
            >
              {isHindi ? 'EN' : 'हिन्दी'}
            </button>
          )}

          {/* Theme Switcher */}
          {setIsDarkMode && (
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle light/dark theme"
              className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
              title={isDarkMode ? (isHindi ? "लाइट थीम पर स्विच करें" : "Switch to Light Theme") : (isHindi ? "डार्क थीम पर स्विच करें" : "Switch to Dark Theme")}
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
              </div>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          
          {/* Mobile Live Clock Display */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                {isHindi ? liveClock.dateStrHindi : liveClock.dateStr}
              </span>
            </div>
            <div className="font-mono font-semibold text-slate-900 dark:text-white">
              {liveClock.timeStr} IST
            </div>
          </div>

          {/* Emergency Helpline */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
              <span className="text-xs font-semibold">
                {isHindi ? 'राष्ट्रीय हेल्पलाइन: 112 / 1078' : 'Emergency Helpline: 112 / 1078'}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-2.5 py-0.5 rounded-md">24x7</span>
          </a>

          {/* Navigation Pages */}
          <div className="space-y-1 pt-1">
            {NAV_LINKS.map((link) => {
              const isSelected = link.match.includes(location.pathname);
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (link.path === '/' && location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (link.path === '/status' && isProductionDomain()) {
                      window.location.href = getStatusUrl('/status');
                    } else {
                      navigate(link.path);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium'
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              );
            })}
          </div>

          {/* Mobile Operations Console Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/threat-map');
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isHindi ? 'अधिकारी नियंत्रण कक्ष' : 'Operations Console'}</span>
          </button>

          {/* Mobile Language Switcher */}
          {setIsHindi && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isHindi ? 'वेबसाइट भाषा / Language:' : 'Portal Language / भाषा:'}
              </span>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsHindi(!isHindi);
                }}
                className="px-3 py-1 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 cursor-pointer"
              >
                {isHindi ? 'English में देखें' : 'हिन्दी में देखें'}
              </button>
            </div>
          )}

        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
