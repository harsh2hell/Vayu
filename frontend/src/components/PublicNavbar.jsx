import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, PhoneCall, Sun, Moon } from 'lucide-react';

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

  const NAV_LINKS = [
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
      path: '/bulletins', 
      label: isHindi ? 'सरकारी बुलेटिन' : 'Bulletins',
      match: ['/bulletins']
    },
    { 
      path: '/safety-guide', 
      label: isHindi ? 'सुरक्षा गाइड' : 'Safety Guide',
      match: ['/safety-guide', '/safety']
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4 flex-nowrap">
        
        {/* VAYU Brand Logo */}
        <div className="flex items-center shrink-0">
          <img 
            src={isDarkMode ? "/vayu-white.png?v=2" : "/vayu.png"} 
            alt="VAYU" 
            className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105 cursor-pointer" 
            onClick={() => navigate('/')}
            title={isHindi ? "राष्ट्रीय चक्रवात पोर्टल होमपेज पर जाएं" : "Go to National Cyclone Portal Home"}
          />
        </div>

        {/* Ultra-Glossy 3D Glass Pill Track */}
        <nav className={`hidden md:flex items-center gap-1.5 p-1 rounded-full backdrop-blur-xl transition-all duration-300 shrink-0 flex-nowrap ${
          isScrolled
            ? 'bg-slate-100/90 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-white/10 shadow-xs'
            : 'bg-slate-100/80 dark:bg-neutral-950/40 border border-slate-200/60 dark:border-white/10'
        }`}>
          {NAV_LINKS.map((link) => {
            const isSelected = link.match.includes(location.pathname);
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`group relative overflow-hidden px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 transform-gpu ${
                  isSelected
                    ? 'bg-gradient-to-b from-white/95 via-white/85 to-white/70 dark:from-white/30 dark:via-white/15 dark:to-white/5 text-slate-950 dark:text-white border border-white/80 dark:border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08),inset_0_2px_1px_rgba(255,255,255,1),inset_0_-1.5px_2px_rgba(255,255,255,0.4)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15),0_6px_24px_rgba(0,0,0,0.8),inset_0_2px_1px_rgba(255,255,255,0.7),inset_0_-1.5px_2px_rgba(255,255,255,0.2)] backdrop-blur-2xl font-bold -translate-y-0.5 scale-[1.02]'
                    : 'border border-transparent bg-transparent text-slate-700 dark:text-white hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 hover:border-slate-200/60 dark:hover:border-white/15 hover:shadow-2xs font-medium'
                }`}
              >
                {/* Glossy Upper Dome Reflection & Bottom Rim - Active on Selected */}
                {isSelected && (
                  <>
                    <span className="absolute inset-x-1 top-0 h-[48%] rounded-t-full bg-gradient-to-b from-white/80 via-white/30 to-transparent dark:from-white/50 dark:via-white/15 pointer-events-none" />
                    <span className="absolute inset-x-2.5 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/70 to-transparent pointer-events-none" />
                  </>
                )}

                {/* Luminous Jewel Status Dot */}
                <span 
                  className={`relative flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-75 scale-75 group-hover:scale-100'
                  }`} 
                >
                  <span className="absolute w-2 h-2 rounded-full bg-cyan-400 dark:bg-cyan-300 animate-ping opacity-65" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shadow-[0_0_8px_rgba(255,255,255,1),0_0_12px_rgba(34,211,238,0.9)] ring-1 ring-cyan-400/90" />
                </span>

                <span className="relative z-10">
                  {link.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT SIDE CONTROLS: OFFICER LOGIN, HELPLINE, LANGUAGE, FONT, THEME */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
          
          {/* Official Officer Gateway */}
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shadow-xs cursor-pointer"
            title={isHindi ? "आधिकारिक आईएमडी / एमओईएस अधिकारी लॉगिन पोर्टल" : "Official IMD / MoES Officer Login Gateway"}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-sky-200" />
            <span className="hidden sm:inline">{isHindi ? 'अधिकारी लॉगिन' : 'Officer Login'}</span>
            <span className="sm:hidden">{isHindi ? 'लॉगिन' : 'Login'}</span>
          </button>

          {/* National Emergency Hotline */}
          <a 
            href="tel:112" 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs"
            title={isHindi ? "राष्ट्रीय आपातकालीन हेल्पलाइन" : "National Emergency Helpline"}
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>112 / 1078</span>
          </a>

          {/* Language Switcher */}
          <button
            onClick={() => setIsHindi(!isHindi)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
            title={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
          >
            {isHindi ? 'English' : 'हिन्दी'}
          </button>

          {/* Font Size Scaling Controls */}
          {setFontSizeOffset && (
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 p-0.5">
              <button
                onClick={() => setFontSizeOffset(p => Math.max(-2, p - 1))}
                className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title={isHindi ? "फ़ॉन्ट आकार घटाएं" : "Decrease font size"}
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeOffset(0)}
                className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1.5 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer select-none transition-colors"
                title={isHindi ? "फ़ॉन्ट स्केल रीसेट करें (100%)" : "Click to reset font scale to 100%"}
              >
                {fontSizeOffset === 0 ? '100%' : `${100 + Math.round(fontSizeOffset * 6.25)}%`}
              </button>
              <button
                onClick={() => setFontSizeOffset(p => Math.min(4, p + 1))}
                className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title={isHindi ? "फ़ॉन्ट आकार बढ़ाएं" : "Increase font size"}
              >
                A+
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          {setIsDarkMode && (
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle light/dark theme"
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 shadow-xs hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all duration-300 overflow-hidden group cursor-pointer"
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

        </div>

      </div>
    </header>
  );
};

export default PublicNavbar;
