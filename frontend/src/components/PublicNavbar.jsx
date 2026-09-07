import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, PhoneCall, Sun, Moon, Menu, X, ChevronRight, Clock } from 'lucide-react';
import { useLiveClock } from '../utils/liveDateTime';
import { getAuthUrl } from '../utils/domain';

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

// Interactive Nav Option Button (Pure transparent shell sitting over the continuous Apple glass pill)
const Nav3DGlassButton = React.forwardRef(({ link, isSelected, isHovered, onClick, onMouseEnter }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`nav-3d-glass-btn group relative z-10 px-3.5 lg:px-4 py-1.5 rounded-full text-xs tracking-wide cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center select-none transition-colors duration-200 ${
        isSelected
          ? 'text-slate-950 dark:text-white font-bold'
          : isHovered
          ? 'text-slate-950 dark:text-white font-semibold'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium'
      }`}
    >
      {/* Nav Label */}
      <span className="relative z-10 transition-transform duration-200">
        {link.label}
      </span>
    </button>
  );
});

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

  const lastNavWheelTimeRef = useRef(0);

  // Wheel scroll handler: scrolling over the navbar options advances smoothly between options
  const handleNavWheel = (e) => {
    const dx = e.deltaX;
    const dy = e.shiftKey ? e.deltaY : (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : 0);
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(delta) > 15) {
      const now = Date.now();
      if (now - lastNavWheelTimeRef.current > 320) {
        lastNavWheelTimeRef.current = now;
        const currentIdx = NAV_LINKS.findIndex(l => l.match.includes(location.pathname));
        const validCurrentIdx = currentIdx >= 0 ? currentIdx : 0;
        if (delta > 0 && validCurrentIdx < NAV_LINKS.length - 1) {
          navigate(NAV_LINKS[validCurrentIdx + 1].path);
        } else if (delta < 0 && validCurrentIdx > 0) {
          navigate(NAV_LINKS[validCurrentIdx - 1].path);
        }
      }
    }
  };

  const [isPastHero, setIsPastHero] = useState(false);
  const isPastHeroRef = useRef(false);

  useEffect(() => {
    // Guarantee font scale is applied on mount
    applyGlobalFontScale(currentOffset);

    let rafId = null;

    const checkScroll = () => {
      const currentY = window.scrollY;
      const heroH1 = document.querySelector('#three-globe-hero h1');
      
      let shouldCollapse = false;
      let shouldExpand = false;

      if (heroH1) {
        const bottom = heroH1.getBoundingClientRect().bottom;
        // Collapses when the hero heading has scrolled past the sticky header (~75px)
        shouldCollapse = bottom <= 75;
        // Expands back with a smooth 60px hysteresis deadband to prevent flickering
        shouldExpand = bottom >= 135;
      } else {
        // Fallback for pages without three-globe-hero
        shouldCollapse = currentY > 220;
        shouldExpand = currentY < 160;
      }

      if (!isPastHeroRef.current && shouldCollapse) {
        isPastHeroRef.current = true;
        setIsPastHero(true);
      } else if (isPastHeroRef.current && shouldExpand) {
        isPastHeroRef.current = false;
        setIsPastHero(false);
      }
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        checkScroll();
        rafId = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // Initial check after paint
    const t1 = setTimeout(checkScroll, 60);
    const t2 = setTimeout(checkScroll, 350);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  const NAV_LINKS = [
    { 
      path: '/', 
      label: isHindi ? 'होम' : 'Home',
      match: ['/']
    },
    { 
      path: '/ai-cyclone', 
      label: isHindi ? 'एआई चक्रवात' : 'AI Cyclone',
      match: ['/ai-cyclone', '/ai-intelligence', '/cyclone-ai']
    },
    { 
      path: '/city-tracker', 
      label: isHindi ? 'शहर व तटीय क्षेत्र (110+)' : 'City & Area Watch',
      match: ['/city-tracker', '/cities']
    },
    { 
      path: '/threat-map', 
      label: isHindi ? 'तटीय खतरा मानचित्र' : 'Threat Map',
      match: ['/threat-map', '/radar', '/gis-radar', '/threat-matrix']
    },
    { 
      path: '/live-map', 
      label: isHindi ? 'लाइव मैप' : 'Live Map',
      match: ['/live-map', '/live-earth', '/3d-earth']
    },
    { 
      path: '/safety-updates', 
      label: isHindi ? 'सुरक्षा व अपडेट' : 'Safety & Updates',
      match: ['/safety-updates', '/bulletins', '/safety-guide', '/safety', '/updates']
    }
  ];

  const navTrackRef = useRef(null);
  const itemRefs = useRef([]);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pillRect, setPillRect] = useState({ left: 0, top: 0, width: 0, height: 0, ready: false });
  const [glassMouse, setGlassMouse] = useState({ x: 0, y: 0, isHovered: false });

  const activeIdx = NAV_LINKS.findIndex(l => l.match.includes(location.pathname));
  const validActiveIdx = activeIdx >= 0 ? activeIdx : 0;
  const targetIdx = hoveredIdx !== null ? hoveredIdx : validActiveIdx;

  const updatePill = useCallback(() => {
    const track = navTrackRef.current;
    const targetEl = itemRefs.current[targetIdx];
    if (!track || !targetEl) return;
    setPillRect({
      left: targetEl.offsetLeft,
      top: targetEl.offsetTop,
      width: targetEl.offsetWidth,
      height: targetEl.offsetHeight,
      ready: true
    });
  }, [targetIdx]);

  useEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    window.addEventListener('fontScaleChange', updatePill);
    const t = setTimeout(updatePill, 40);
    return () => {
      window.removeEventListener('resize', updatePill);
      window.removeEventListener('fontScaleChange', updatePill);
      clearTimeout(t);
    };
  }, [updatePill, location.pathname, isHindi]);

  const handleNavMouseMove = (e) => {
    if (!navTrackRef.current) return;
    const trackRect = navTrackRef.current.getBoundingClientRect();
    const relX = e.clientX - trackRect.left - pillRect.left;
    const relY = e.clientY - trackRect.top - pillRect.top;
    setGlassMouse({ x: relX, y: relY, isHovered: true });
  };

  const handleNavMouseLeave = () => {
    setHoveredIdx(null);
    setGlassMouse(prev => ({ ...prev, isHovered: false }));
  };

  return (
    <header className={`sticky top-0 z-[1000] w-full transition-all duration-300 header-glass-bar ${
      isScrolled ? 'is-scrolled' : ''
    }`}>
      {/* Specular Glossy Light Sheen across top half of glass header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/35 via-white/12 to-transparent dark:from-white/15 dark:via-white/4 dark:to-transparent select-none z-0" />
      
      {/* 2px National Tricolor Stripe */}
      <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808] relative z-10" />
      
      <div className="header-inner-row max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 h-16 sm:h-[68px] md:h-[72px] flex items-center justify-between gap-2 sm:gap-3 flex-nowrap relative z-10">
        
        {/* VAYU Brand Logo - Collapses smoothly when scrolled past hero section */}
        <div className={`header-collapsible-item header-collapsible-logo flex items-center shrink-0 ${
          isPastHero ? 'is-collapsed' : ''
        }`}>
          <img 
            src={isDarkMode ? "/vayu-white.png?v=2" : "/vayu.png"} 
            alt="VAYU" 
            className="h-12 sm:h-14 md:h-16 lg:h-[62px] w-auto object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105 cursor-pointer select-none shrink-0" 
            style={{ maxHeight: '62px' }}
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
              }
            }}
            title={isHindi ? "राष्ट्रीय चक्रवात पोर्टल होमपेज पर जाएं" : "Go to National Cyclone Portal Home"}
          />
        </div>

        {/* Ultra-Glossy 3D Clear Glass Pill Track with Continuous Apple Motion Animation */}
        <nav
          ref={navTrackRef}
          onWheel={handleNavWheel}
          onMouseMove={handleNavMouseMove}
          onMouseLeave={handleNavMouseLeave}
          className={`nav-pill-track-3d hidden md:flex items-center gap-1.5 p-1 rounded-full backdrop-blur-2xl transition-all duration-500 shrink min-w-0 flex-nowrap relative select-none ${
            isPastHero ? 'mx-auto' : ''
          } ${
            isScrolled || isPastHero
              ? 'is-scrolled-3d'
              : 'bg-slate-200/55 dark:bg-neutral-950/45 border border-white/70 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]'
          }`}
          title={isHindi ? "पेज बदलने के लिए क्लिक या स्क्रॉल करें" : "Click or scroll through options"}
        >
          {/* Ambient chromatic luminous glow orbs inside track for glass refraction */}
          <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-sky-400/15 via-cyan-400/10 to-indigo-400/15 rounded-full blur-md opacity-60" />
          {/* Specular top rim highlight */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/30 to-transparent" />

          {/* Continuous Motion Apple Liquid 3D Clear Glass Sliding Pill */}
          {pillRect.ready && (
            <div
              className="nav-sliding-glass-pill overflow-hidden"
              style={{
                transform: `translate3d(${pillRect.left}px, ${pillRect.top}px, 0)`,
                width: `${pillRect.width}px`,
                height: `${pillRect.height}px`,
                opacity: pillRect.ready ? 1 : 0
              }}
            >
              {/* 3D Convex Top Curved Specular Lens Reflection */}
              <span className="absolute inset-x-1.5 top-[1px] h-[46%] rounded-t-full bg-gradient-to-b from-white/95 via-white/28 to-transparent pointer-events-none" />

              {/* Specular Top-Center Glass Glint */}
              <span className="absolute left-1/4 top-[2px] w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none opacity-90" />

              {/* Prismatic Lateral Refractions (Left & Right Edge Bevels) */}
              <span className="absolute inset-y-1.5 left-[1px] w-[1.5px] bg-gradient-to-b from-white/85 via-white/20 to-transparent pointer-events-none rounded-l-full" />
              <span className="absolute inset-y-1.5 right-[1px] w-[1.5px] bg-gradient-to-b from-white/85 via-white/20 to-transparent pointer-events-none rounded-r-full" />

              {/* Lower Rim Cyan Specular Refractive Line */}
              <span className="absolute inset-x-3 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-400/90 dark:via-cyan-300/90 to-transparent pointer-events-none" />

              {/* Interactive Dynamic Cursor Specular Flare inside Glass */}
              {glassMouse.isHovered && (
                <span
                  className="absolute w-24 h-12 rounded-full pointer-events-none transition-opacity duration-200 -translate-x-1/2 -translate-y-1/2 blur-xs opacity-50 dark:opacity-40"
                  style={{
                    left: `${glassMouse.x}px`,
                    top: `${glassMouse.y}px`,
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(56,189,248,0.25) 55%, transparent 75%)'
                  }}
                />
              )}
            </div>
          )}

          {NAV_LINKS.map((link, idx) => {
            const isSelected = link.match.includes(location.pathname);
            const isHovered = hoveredIdx === idx;
            return (
              <Nav3DGlassButton
                key={link.path}
                ref={(el) => (itemRefs.current[idx] = el)}
                link={link}
                isSelected={isSelected}
                isHovered={isHovered}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => {
                  setHoveredIdx(null);
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

        {/* RIGHT SIDE CONTROLS: OFFICER LOGIN, HELPLINE, LANGUAGE, FONT, THEME, MOBILE HAMBURGER */}
        <div className="header-controls-row flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          
          {/* Official Portal Gateway - Collapses smoothly when scrolled past hero section */}
          <button
            onClick={() => { window.location.href = getAuthUrl(); }}
            className={`header-ctrl-btn header-collapsible-item header-collapsible-login hidden xl:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap ${
              isPastHero ? 'is-collapsed' : ''
            }`}
            title={isHindi ? "आधिकारिक आईएमडी / एमओईएस पोर्टल लॉगिन" : "Official IMD / MoES Portal Login"}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-sky-200 shrink-0" />
            <span className="hidden 2xl:inline whitespace-nowrap">{isHindi ? 'पोर्टल लॉगिन' : 'Portal Login'}</span>
            <span className="2xl:hidden inline whitespace-nowrap">{isHindi ? 'लॉगिन' : 'Login'}</span>
          </button>

          {/* Real-time Live Clock with Seconds & Pulsing Dot */}
          <div
            className="header-ctrl-btn hidden md:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 shrink-0 select-none shadow-2xs"
            title={isHindi ? "लाइव भारतीय मानक समय (IST) व दिनांक" : "Live Real-Time Indian Standard Time (IST) & Date"}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-sans font-semibold text-[11px] hidden xl:inline">
              {isHindi ? liveClock.dateShortHindi : liveClock.dateShort}
            </span>
            <span className="text-slate-300 dark:text-slate-600 hidden xl:inline">•</span>
            <span className="tracking-tight">{liveClock.timeStr}</span>
            <span className="text-[10px] text-sky-600 dark:text-sky-400 font-sans font-bold">IST</span>
          </div>

          {/* National Emergency Hotline */}
          <a 
            href="tel:112" 
            className="header-ctrl-btn hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs shrink-0"
            title={isHindi ? "राष्ट्रीय आपातकालीन हेल्पलाइन" : "National Emergency Helpline"}
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
            <span>112</span>
            <span className="hidden lg:inline"> / 1078</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={() => setIsHindi(!isHindi)}
            className="header-ctrl-btn px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0"
            title={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
          >
            {isHindi ? 'English' : 'हिन्दी'}
          </button>

          {/* Font Size Scaling Controls */}
          <div className="header-font-box flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 shrink-0">
            <button
              onClick={() => handleFontChange(Math.max(-3, currentOffset - 1))}
              disabled={currentOffset <= -3}
              className="header-font-btn px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={isHindi ? "फ़ॉन्ट आकार घटाएं" : "Decrease font size"}
            >
              A-
            </button>
            <button
              onClick={() => handleFontChange(0)}
              className="header-font-indicator text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1 sm:px-1.5 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer select-none transition-colors hidden sm:inline-block min-w-[36px] text-center"
              title={isHindi ? "फ़ॉन्ट स्केल रीसेट करें (100%)" : "Click to reset font scale to 100%"}
            >
              {`${getFontScalePercent(currentOffset)}%`}
            </button>
            <button
              onClick={() => handleFontChange(Math.min(4, currentOffset + 1))}
              disabled={currentOffset >= 4}
              className="header-font-btn px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={isHindi ? "फ़ॉन्ट आकार बढ़ाएं" : "Increase font size"}
            >
              A+
            </button>
          </div>

          {/* Theme Switcher */}
          {setIsDarkMode && (
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle light/dark theme"
              className="header-theme-btn relative p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 shadow-xs hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all duration-300 overflow-hidden group cursor-pointer shrink-0"
              title={isDarkMode ? (isHindi ? "लाइट थीम पर स्विच करें" : "Switch to Light Theme") : (isHindi ? "डार्क थीम पर स्विच करें" : "Switch to Dark Theme")}
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                <Sun
                  className={`w-4 h-4 text-amber-500 absolute transition-all duration-500 transform ${
                    isDarkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 group-hover:rotate-45'
                  }`}
                />
                <Moon
                  className={`w-4 h-4 text-sky-400 dark:text-amber-300 absolute transition-all duration-500 transform ${
                    isDarkMode ? 'rotate-0 scale-100 opacity-100 group-hover:-rotate-12' : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="md:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-slate-900 dark:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          
          {/* Mobile Live Clock Display */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
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
          
          {/* Officer Login Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              window.location.href = getAuthUrl();
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-white bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 dark:from-sky-700 dark:via-blue-600 dark:to-indigo-700 shadow-md border border-slate-700/50 dark:border-white/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 dark:bg-white/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-amber-400 dark:text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold tracking-tight">
                  {isHindi ? 'पोर्टल लॉगिन' : 'Official Portal Login'}
                </div>
                <div className="text-[10px] text-slate-300 dark:text-sky-100 font-medium">
                  {isHindi ? 'आईएमडी / एमओईएस प्राधिकृत' : 'IMD / MoES Operational Gateway'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-sky-200" />
          </button>

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
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-sky-700 dark:text-sky-300 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 cursor-pointer"
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
