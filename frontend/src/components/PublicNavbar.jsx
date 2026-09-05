import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, PhoneCall, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';

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

// Interactive 3D Glass Option Button with Dynamic Mouse Parallax & Specular Light Reflection
const Nav3DGlassButton = ({ link, isSelected, isScrolled, onClick }) => {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, isHovered: false });
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Multi-axis 3D tilt
    const rx = ((y - centerY) / centerY) * -12;
    const ry = ((x - centerX) / centerX) * 12;
    const gx = (x / rect.width) * 100;
    const gy = (y / rect.height) * 100;
    setTilt({ rx, ry, gx, gy, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, isHovered: false });
  };

  let transformStyle = '';
  if (tilt.isHovered) {
    transformStyle = `perspective(600px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(16px) scale3d(1.04, 1.04, 1.04) translateY(-1px)`;
  } else if (isSelected) {
    transformStyle = `perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(${isScrolled ? '14px' : '10px'}) scale3d(1.02, 1.02, 1.02) translateY(-0.5px)`;
  } else {
    transformStyle = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
  }

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle }}
      className={`nav-3d-glass-btn group relative overflow-hidden px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-250 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 select-none ${
        isSelected
          ? 'is-selected-glass text-slate-950 dark:text-white font-bold'
          : 'border border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium'
      }`}
    >
      {/* Specular Glare Layer that follows mouse cursor in 3D */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300"
        style={{
          background: tilt.isHovered
            ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.12) 45%, transparent 70%)`
            : isSelected
            ? `radial-gradient(circle at 50% 0%, rgba(56,189,248,0.25) 0%, transparent 70%)`
            : 'none',
          opacity: tilt.isHovered || isSelected ? 1 : 0
        }}
      />

      {/* Glass Upper Dome Reflection on Selected */}
      {isSelected && (
        <>
          <span className="absolute inset-x-1 top-0 h-[48%] rounded-t-full bg-gradient-to-b from-white/90 via-white/35 to-transparent dark:from-white/60 dark:via-white/15 pointer-events-none" />
          <span className="absolute inset-x-2.5 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white dark:via-white/70 to-transparent pointer-events-none" />
        </>
      )}

      {/* Luminous Jewel Status Dot (Cyan / Sky-Blue with pulsing aura) - Only on Selected Option */}
      {isSelected && (
        <span className="relative flex items-center justify-center transition-all duration-300 shrink-0">
          <span className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 dark:bg-cyan-300 animate-ping opacity-60" />
          <span className="relative w-2 h-2 rounded-full bg-slate-950 dark:bg-cyan-200 shadow-[0_0_8px_rgba(56,189,248,1),0_0_12px_rgba(34,211,238,0.9)] ring-1.5 ring-cyan-400/90" />
        </span>
      )}

      {/* Nav Label with floating depth */}
      <span className="relative z-10 transition-transform duration-200" style={{ transform: 'translateZ(8px)' }}>
        {link.label}
      </span>
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

  useEffect(() => {
    // Guarantee font scale is applied on mount
    applyGlobalFontScale(currentOffset);
  }, []);

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
      path: '/safety-updates', 
      label: isHindi ? 'सुरक्षा व अपडेट' : 'Safety & Updates',
      match: ['/safety-updates', '/bulletins', '/safety-guide', '/safety', '/updates']
    }
  ];

  return (
    <header className={`sticky top-0 z-[1000] w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/85 dark:bg-black/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)]'
        : 'bg-white/80 dark:bg-black/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-neutral-800/80'
    }`}>
      {/* 2px National Tricolor Stripe */}
      <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />
      
      <div className="header-inner-row max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3 flex-nowrap">
        
        {/* VAYU Brand Logo */}
        <div className="flex items-center shrink-0">
          <img 
            src={isDarkMode ? "/vayu-white.png?v=2" : "/vayu.png"} 
            alt="VAYU" 
            className="h-11 sm:h-12 md:h-[50px] w-auto object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105 cursor-pointer" 
            style={{ maxHeight: '50px' }}
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

        {/* Ultra-Glossy 3D Glass Pill Track with Scroll & Hover Interaction */}
        <nav
          onWheel={handleNavWheel}
          className={`nav-pill-track-3d hidden md:flex items-center gap-1.5 p-1 rounded-full backdrop-blur-2xl transition-all duration-400 shrink min-w-0 flex-nowrap relative select-none ${
            isScrolled
              ? 'is-scrolled-3d'
              : 'bg-slate-200/55 dark:bg-neutral-950/45 border border-white/70 dark:border-white/10 shadow-[0_2px_12px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)]'
          }`}
          title={isHindi ? "पेज बदलने के लिए क्लिक या स्क्रॉल करें" : "Click or scroll through options"}
        >
          {/* Ambient chromatic luminous glow orbs inside track for glass refraction */}
          <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-sky-400/15 via-cyan-400/10 to-indigo-400/15 rounded-full blur-md opacity-60" />
          {/* Specular top rim highlight */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/30 to-transparent" />

          {NAV_LINKS.map((link) => {
            const isSelected = link.match.includes(location.pathname);
            return (
              <Nav3DGlassButton
                key={link.path}
                link={link}
                isSelected={isSelected}
                isScrolled={isScrolled}
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

        {/* RIGHT SIDE CONTROLS: OFFICER LOGIN, HELPLINE, LANGUAGE, FONT, THEME, MOBILE HAMBURGER */}
        <div className="header-controls-row flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          
          {/* Official Officer Gateway */}
          <button
            onClick={() => navigate('/login')}
            className="header-ctrl-btn hidden xl:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shadow-xs cursor-pointer shrink-0"
            title={isHindi ? "आधिकारिक आईएमडी / एमओईएस अधिकारी लॉगिन पोर्टल" : "Official IMD / MoES Officer Login Gateway"}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-sky-200 shrink-0" />
            <span className="hidden 2xl:inline">{isHindi ? 'अधिकारी लॉगिन' : 'Officer Login'}</span>
            <span className="2xl:hidden inline">{isHindi ? 'लॉगिन' : 'Login'}</span>
          </button>

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
          
          {/* Officer Login Button */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate('/login');
            }}
            className="w-full flex items-center justify-between p-3 rounded-2xl text-white bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 dark:from-sky-700 dark:via-blue-600 dark:to-indigo-700 shadow-md border border-slate-700/50 dark:border-white/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 dark:bg-white/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 text-amber-400 dark:text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold tracking-tight">
                  {isHindi ? 'अधिकारी लॉगिन पोर्टल' : 'Official Officer Login'}
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
