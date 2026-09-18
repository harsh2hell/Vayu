import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PhoneCall, Sun, Moon, Menu, X, ChevronRight, Clock } from 'lucide-react';
import { useLiveClock } from '../utils/liveDateTime';

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
  } catch (e) {}
};

// Institutional Nav Link with clean government styling (high legibility, no cheesy 3D glints)
const InstitutionalNavLink = ({ link, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold tracking-normal cursor-pointer whitespace-nowrap shrink-0 transition-all duration-150 select-none ${
        isSelected
          ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 shadow-xs'
          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <span>{link.label}</span>
      {isSelected && (
        <span className="sr-only">(Active Page)</span>
      )}
    </button>
  );
};

const PublicNavbar = ({
  isHindi,
  setIsHindi,
  isDarkMode,
  setIsDarkMode,
  fontSizeOffset,
  setFontSizeOffset,
  isScrolled
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
        } catch(e) { return 0; }
      })();

  const handleFontChange = (newOffset) => {
    applyGlobalFontScale(newOffset);
    if (typeof setFontSizeOffset === 'function') {
      setFontSizeOffset(newOffset);
    }
    window.dispatchEvent(new CustomEvent('fontScaleChange', { detail: newOffset }));
  };

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
      label: isHindi ? 'तटीय शहर निगरानी (110+)' : 'City & Area Watch',
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
    }
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full select-none shadow-sm">
      {/* 1. TOP PRE-HEADER IDENTITY BAR (OFFICIAL GOVERNMENT OF INDIA STANDARD) */}
      <div className="w-full bg-[#0b1322] text-slate-200 border-b border-slate-800 text-[11px] font-medium">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-8 flex items-center justify-between gap-3">
          
          {/* Official Ministry & Government of India Bilingual Line */}
          <div className="flex items-center gap-2.5 truncate">
            {/* National Tricolor Emblem Mark */}
            <span className="inline-flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-3 bg-[#FF9933] rounded-xs" />
              <span className="w-1.5 h-3 bg-white rounded-xs" />
              <span className="w-1.5 h-3 bg-[#138808] rounded-xs" />
            </span>
            <span className="font-bold text-white tracking-wide">
              {isHindi ? 'भारत सरकार' : 'GOVERNMENT OF INDIA'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 truncate hidden sm:inline">
              {isHindi ? 'पृथ्वी विज्ञान मंत्रालय (MoES)' : 'Ministry of Earth Sciences (MoES)'}
            </span>
            <span className="text-slate-500 hidden md:inline">•</span>
            <span className="text-sky-400 font-semibold hidden md:inline truncate">
              {isHindi ? 'भारत मौसम विज्ञान विभाग (IMD)' : 'India Meteorological Department (IMD)'}
            </span>
          </div>

          {/* Top Right: Emergency Helpline, IST Clock, Accessibility, Language, Theme */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* National Emergency Control Room */}
            <a 
              href="tel:112" 
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold text-rose-300 hover:text-white bg-rose-950/60 border border-rose-800/80 transition-colors"
              title={isHindi ? "राष्ट्रीय आपदा नियंत्रण कक्ष" : "National Emergency Helpline (24x7)"}
            >
              <PhoneCall className="w-3 h-3 text-rose-400" />
              <span>112 / 1078 (NDMA)</span>
            </a>

            {/* Official IST Clock */}
            <div 
              className="hidden lg:inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-300"
              title="Indian Standard Time (IST)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>IST: {liveClock.timeStr}</span>
            </div>

            <div className="h-3.5 w-px bg-slate-700 hidden sm:block" />

            {/* Font Size Scaling */}
            <div className="flex items-center gap-0.5 bg-slate-800/90 rounded border border-slate-700 p-0.5">
              <button
                onClick={() => handleFontChange(Math.max(-3, currentOffset - 1))}
                disabled={currentOffset <= -3}
                className="px-1 text-[10px] font-bold text-slate-300 hover:text-white rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                title="Decrease Font Size"
              >
                A-
              </button>
              <button
                onClick={() => handleFontChange(0)}
                className="px-1 text-[10px] font-bold text-sky-400 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                title="Reset Font Size (100%)"
              >
                A
              </button>
              <button
                onClick={() => handleFontChange(Math.min(4, currentOffset + 1))}
                disabled={currentOffset >= 4}
                className="px-1 text-[10px] font-bold text-slate-300 hover:text-white rounded hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                title="Increase Font Size"
              >
                A+
              </button>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setIsHindi(!isHindi)}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
            >
              {isHindi ? 'ENG' : 'हिन्दी'}
            </button>

            {/* Dark/Light Toggle */}
            {setIsDarkMode && (
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label="Toggle theme"
                className="p-1 rounded text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title={isDarkMode ? "Light Mode" : "Dark Mode"}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. NATIONAL TRICOLOR ACCENT LINE (3PX SOLID) */}
      <div className="h-[3px] w-full grid grid-cols-3">
        <div className="bg-[#FF9933]" />
        <div className="bg-white" />
        <div className="bg-[#138808]" />
      </div>

      {/* 3. MAIN INSTITUTIONAL NAVIGATION BAR */}
      <div className="w-full bg-white dark:bg-[#0c1424] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 h-16 sm:h-[70px] flex items-center justify-between gap-4">

          {/* Left: Department Logo & Official Title */}
          <div 
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            {/* Cyclone Logo Seal */}
            <img 
              src={isDarkMode ? "/vayu-white.png?v=2" : "/vayu.png"} 
              alt="VAYU Logo" 
              className="h-10 sm:h-12 md:h-13 w-auto object-contain transition-transform group-hover:scale-102"
            />

            {/* Official Institutional Typography */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white font-heading">
                  VAYU <span className="font-hindi font-bold text-slate-600 dark:text-slate-300 text-sm">(वायु)</span>
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {isHindi ? 'राष्ट्रीय पोर्टल' : 'National Portal'}
                </span>
              </div>
              <p className="text-[11px] sm:text-[12px] font-semibold text-slate-700 dark:text-slate-300 leading-tight truncate">
                {isHindi 
                  ? 'राष्ट्रीय चक्रवात पूर्व चेतावनी एवं तटीय सुरक्षा प्रणाली' 
                  : 'National Cyclone Early Warning & Threat Assessment System'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden xl:block leading-none mt-0.5">
                {isHindi 
                  ? 'पृथ्वी विज्ञान मंत्रालय (MoES) एवं भारत मौसम विज्ञान विभाग (IMD)' 
                  : 'Ministry of Earth Sciences (MoES) • India Meteorological Department'}
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Clean Institutional Navbar, No Glints or Bubbles) */}
          <nav 
            className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800"
            aria-label="Main Department Navigation"
          >
            {NAV_LINKS.map((link) => {
              const isSelected = link.match.includes(location.pathname);
              return (
                <InstitutionalNavLink
                  key={link.path}
                  link={link}
                  isSelected={isSelected}
                  onClick={() => {
                    if (link.path === '/' && location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      navigate(link.path);
                    }
                  }}
                />
              );
            })}
          </nav>

          {/* Right: Operational Portal Action & Mobile Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Operations Portal Button */}
            <button
              onClick={() => navigate('/threat-map')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              title={isHindi ? "परिचालन नियंत्रण कक्ष खोलें" : "Open Operational Command Console"}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isHindi ? 'अधिकारी नियंत्रण कक्ष' : 'Operations Console'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Live Clock Display */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                {isHindi ? liveClock.dateStrHindi : liveClock.dateStr}
              </span>
            </div>
            <div className="font-mono font-bold text-sky-600 dark:text-sky-400">
              {liveClock.timeStr} IST
            </div>
          </div>
          

          {/* Emergency Helpline */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span className="text-xs font-bold">
                {isHindi ? 'राष्ट्रीय हेल्पलाइन: 112 / 1078' : 'Emergency Helpline: 112 / 1078'}
              </span>
            </div>
            <span className="text-[10px] font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full">24x7</span>
          </a>

          {/* Navigation Pages */}
          <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-neutral-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
              {isHindi ? 'नेविगेशन पेज' : 'Navigation'}
            </div>

            {NAV_LINKS.map((link) => {
              const isSelected = link.match.includes(location.pathname);
              return (
                <button
                  key={link.path}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (link.path === '/' && location.pathname === '/') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      navigate(link.path);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/60 dark:border-sky-800/60'
                      : 'hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-800 dark:text-slate-200 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                    <span className="text-xs truncate">{link.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Mobile Language Switcher */}
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {isHindi ? 'वेबसाइट भाषा / Language:' : 'Portal Language / भाषा:'}
            </span>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsHindi(!isHindi);
              }}
              className="px-3.5 py-1.5 rounded-2xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-slate-100 dark:bg-neutral-800 border border-slate-100 dark:border-neutral-700 cursor-pointer"
            >
              {isHindi ? 'English में देखें' : 'हिन्दी में देखें'}
            </button>
          </div>

        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
