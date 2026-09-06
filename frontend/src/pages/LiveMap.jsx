import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, Shield, ArrowRight, ArrowLeft, Wind, Sparkles, 
  RefreshCw, Layers, Compass, Plus, Minus, Play, Pause,
  Radio, Info, Maximize2, Minimize2, MapPin, Eye, Check
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import ThreeCycloneGlobe from '../components/ThreeCycloneGlobe';

const STORM_TARGETS = [
  {
    id: 'dana',
    name: 'Invest 92B / Cyclone Dana',
    nameHindi: 'इन्वेस्ट 92B / चक्रवात दाना',
    basin: 'Bay of Bengal',
    basinHindi: 'बंगाल की खाड़ी',
    lat: 13.5,
    lon: 88.5,
    wind: '120 km/h',
    pressure: '984 hPa',
    risk: '78%',
    category: 'Severe Cyclonic Storm',
    categoryHindi: 'गंभीर चक्रवाती तूफान',
  },
  {
    id: 'biparjoy',
    name: 'Cyclone Biparjoy (Historical Track)',
    nameHindi: 'चक्रवात बिपरजॉय (ऐतिहासिक ट्रैक)',
    basin: 'Arabian Sea',
    basinHindi: 'अरब सागर',
    lat: 18.2,
    lon: 67.8,
    wind: '165 km/h',
    pressure: '960 hPa',
    risk: '85%',
    category: 'Extremely Severe Cyclonic Storm',
    categoryHindi: 'अत्यंत गंभीर चक्रवाती तूफान',
  },
  {
    id: 'equatorial',
    name: 'Equatorial Indian Ocean ITCZ',
    nameHindi: 'भूमध्यरेखीय हिंद महासागर आईटीसीजेड',
    basin: 'Indian Ocean',
    basinHindi: 'हिंद महासागर',
    lat: 1.5,
    lon: 77.5,
    wind: '45 km/h',
    pressure: '1004 hPa',
    risk: '25%',
    category: 'Monsoon Trough Disturbance',
    categoryHindi: 'मानसून ट्रफ विक्षोभ',
  },
  {
    id: 'chennai',
    name: 'Coromandel Seaboard / Chennai Watch',
    nameHindi: 'कोरोमंडल तटरेखा / चेन्नई निगरानी',
    basin: 'SW Bay of Bengal',
    basinHindi: 'दक्षिण-पश्चिम बंगाल की खाड़ी',
    lat: 13.08,
    lon: 80.27,
    wind: '55 km/h',
    pressure: '1002 hPa',
    risk: '42%',
    category: 'Coastal Low-Pressure Trough',
    categoryHindi: 'तटीय कम दबाव वाला ट्रफ',
  },
  {
    id: 'kolkata',
    name: 'North Bay / Gangetic Delta',
    nameHindi: 'उत्तरी खाड़ी / गंगा डेल्टा क्षेत्र',
    basin: 'North Bay of Bengal',
    basinHindi: 'उत्तरी बंगाल की खाड़ी',
    lat: 21.8,
    lon: 88.8,
    wind: '65 km/h',
    pressure: '998 hPa',
    risk: '50%',
    category: 'Depression Surge Watch',
    categoryHindi: 'अवसाद निगरानी',
  }
];

const LiveMap = () => {
  const navigate = useNavigate();

  // Language state synchronized with localStorage
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('preferredLanguage') === 'hi';
  });

  const handleSetHindi = (val) => {
    setIsHindi(val);
    localStorage.setItem('preferredLanguage', val ? 'hi' : 'en');
  };

  // Dark mode detection
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // MANDATORY USER REQUIREMENT:
  // When someone opens this page, first show a notification modal stating it is a 3D Live Earth module
  // with two options in the bottom right corner (Allow and Leave beside each other).
  const [showNotification, setShowNotification] = useState(true);

  // 3D Globe Interactive States
  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showCyclone, setShowCyclone] = useState(true);
  const [zoomStep, setZoomStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentTarget = STORM_TARGETS[selectedTargetIndex];

  // Handler for Leave button: navigate back to previous page
  const handleLeave = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Handler for Allow button: close notification and enter 3D Live Earth
  const handleAllow = () => {
    setShowNotification(false);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomStep((prev) => Math.min(prev + 1, 4));
  const handleZoomOut = () => setZoomStep((prev) => Math.max(prev - 1, -3));
  const handleResetNorth = () => {
    // Re-trigger coordinate alignment
    const idx = selectedTargetIndex;
    setSelectedTargetIndex(-1);
    setTimeout(() => setSelectedTargetIndex(idx), 30);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
      {/* 2px National Tricolor Stripe */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808] z-50" />

      {/* Global Public Navigation Header */}
      <PublicNavbar isHindi={isHindi} setIsHindi={handleSetHindi} />

      {/* =========================================================================
          MANDATORY 3D LIVE EARTH MODULE ACCESS NOTIFICATION MODAL
          Appears first when user opens the page.
          Contains 'Leave' and 'Allow' buttons beside each other in bottom right corner.
          ========================================================================= */}
      {showNotification && (
        <div 
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="live-earth-title"
        >
          {/* Frosted Glass Notification Card */}
          <div 
            className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between"
            style={{
              backdropFilter: 'blur(28px) saturate(190%)',
              WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            }}
          >
            {/* Specular top rim highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
            
            {/* Ambient Background Light Blob */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />

            {/* Notification Header & Content */}
            <div className="space-y-4 relative z-10">
              {/* Badge & Telemetry Indicator */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                  </span>
                  <span>{isHindi ? 'जियोस्पेशियल 3D टेलीमेट्री' : 'GEOSPATIAL 3D TELEMETRY'}</span>
                </div>

                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  VAYU 4.0 • WebGL
                </span>
              </div>

              {/* Title with Icon */}
              <div className="flex items-start gap-3.5 pt-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
                  <Globe className="w-6 h-6 animate-spin" style={{ animationDuration: '24s' }} />
                </div>
                <div>
                  <h2 id="live-earth-title" className="text-xl sm:text-2xl font-bold font-heading text-slate-950 dark:text-white tracking-tight">
                    {isHindi ? '3D लाइव अर्थ मॉड्यूल' : '3D Live Earth Module'}
                  </h2>
                  <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mt-0.5">
                    {isHindi ? 'उच्च-रिज़ॉल्यूशन महासागरीय चक्रवात सिमुलेशन' : 'High-Resolution Planetary Cyclone Simulation'}
                  </p>
                </div>
              </div>

              {/* Informative Description */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  {isHindi 
                    ? 'यह मॉड्यूल वास्तविक समय के मौसम संबंधी उपग्रह डेटा के साथ एक इंटरैक्टिव 3D अर्थ ग्लोब शुरू करता है। इसमें चक्रवाती भंवर (Cyclonic Vortex), वायुमंडलीय बादल और सौर प्रकाश शामिल हैं।'
                    : 'This module initializes an interactive 3D Live Earth environment rendered in real-time WebGL. It visualizes live cyclonic vortices, atmospheric cloud drift, and solar day/night illumination across the Indian Ocean Basin.'
                  }
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{isHindi ? '3D ग्रहीय घूर्णन' : 'Interactive 3D Rotation'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{isHindi ? 'सक्रिय चक्रवात भंवर' : 'Live Cyclone Vortex'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{isHindi ? 'नासा अर्थ टेक्सचर' : 'NASA Satellite Maps'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{isHindi ? 'जीपीयू त्वरित' : 'GPU 60fps Telemetry'}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                {isHindi 
                  ? 'अनुमति देने पर 3D अर्थ मॉड्यूल लोड होगा। आप जब चाहें वापस जा सकते हैं।'
                  : 'Granting access will activate the 3D WebGL renderer. You can exit anytime.'
                }
              </p>
            </div>

            {/* MANDATORY USER REQUIREMENT:
                Bottom right corner contains two options: "Leave" and "Allow" beside each other. */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 relative z-10">
              <button
                type="button"
                onClick={handleLeave}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95 flex items-center gap-1.5"
                title={isHindi ? 'पिछले पेज पर वापस जाएं' : 'Go back to previous page'}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isHindi ? 'बाहर जाएं' : 'Leave'}</span>
              </button>

              <button
                type="button"
                onClick={handleAllow}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 shadow-md shadow-sky-600/25 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
                title={isHindi ? '3D अर्थ मॉड्यूल में प्रवेश करें' : 'Enter the 3D Live Earth Module'}
              >
                <span>{isHindi ? 'अनुमति दें' : 'Allow'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN 3D LIVE EARTH WORKSTATION
          ========================================================================= */}
      <main className="flex-1 flex flex-col relative w-full max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 gap-3">
        
        {/* Top Control Bar: Title, Target Selectors, and Info Button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm">
          {/* Brand Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-500/10 dark:bg-sky-400/15 border border-sky-300/60 dark:border-sky-400/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-2xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-heading text-slate-950 dark:text-white">
                  {isHindi ? '3D लाइव अर्थ मौसम कंसोल' : 'Live Map • 3D Earth Console'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  3D LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {isHindi ? 'नासा उपग्रह डेटा • वास्तविक समय 3D घूर्णन व चक्रवाती भंवर' : 'NASA Imagery • 3D Planetary Simulation • Real-Time Vortex Model'}
              </p>
            </div>
          </div>

          {/* Quick Target Storm Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            {STORM_TARGETS.map((target, index) => {
              const isSelected = selectedTargetIndex === index;
              return (
                <button
                  key={target.id}
                  onClick={() => setSelectedTargetIndex(index)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-xs scale-102'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-sky-500'}`} />
                  <span>{isHindi ? target.nameHindi : target.name}</span>
                </button>
              );
            })}
          </div>

          {/* Re-open Info Dialog Button */}
          <button
            onClick={() => setShowNotification(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
            title={isHindi ? "3D अर्थ मॉड्यूल विवरण देखें" : "View 3D Live Earth Module Details"}
          >
            <Info className="w-3.5 h-3.5 text-sky-500" />
            <span className="hidden sm:inline">{isHindi ? 'मॉड्यूल विवरण' : 'Module Info'}</span>
          </button>
        </div>

        {/* 3D Earth Workstation Box */}
        <div 
          className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-xl bg-gradient-to-b from-slate-900 via-[#0a1122] to-black text-white flex flex-col justify-between transition-all ${
            isFullscreen ? 'fixed inset-0 z-[1500] rounded-none' : 'min-h-[620px] sm:min-h-[700px] lg:min-h-[750px] flex-1'
          }`}
        >
          {/* Top Left Floating Target Telemetry Card */}
          <div className="absolute top-4 left-4 z-20 pointer-events-auto max-w-xs sm:max-w-sm">
            <div 
              className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/15 shadow-2xl text-xs space-y-2 text-white"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-sm tracking-tight">{isHindi ? currentTarget.nameHindi : currentTarget.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-red-950/80 text-red-300 text-[10px] font-mono font-bold border border-red-800/60">
                  {currentTarget.risk} RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">{isHindi ? 'निर्देशांक' : 'COORDINATES'}</span>
                  <strong className="text-cyan-300">{currentTarget.lat}°N, {currentTarget.lon}°E</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isHindi ? 'पवन गति' : 'WIND INTENSITY'}</span>
                  <strong className="text-emerald-300">{currentTarget.wind}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isHindi ? 'केंद्रीय दबाव' : 'CENTRAL PRESSURE'}</span>
                  <strong className="text-amber-300">{currentTarget.pressure}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{isHindi ? 'महासागरीय बेसिन' : 'BASIN'}</span>
                  <strong className="text-white truncate">{isHindi ? currentTarget.basinHindi : currentTarget.basin}</strong>
                </div>
              </div>

              <div className="pt-1 text-[10px] text-slate-300 font-sans flex items-center justify-between">
                <span>{isHindi ? currentTarget.categoryHindi : currentTarget.category}</span>
                <span className="text-emerald-400 font-mono font-semibold">● ACTIVE FEED</span>
              </div>
            </div>
          </div>

          {/* Top Right Floating Toolbar (Zoom, Rotate, Fullscreen, Reset) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
            {/* Zoom In Button */}
            <button
              onClick={handleZoomIn}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition shadow-lg cursor-pointer"
              title={isHindi ? "ज़ूम इन" : "Zoom In"}
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Zoom Out Button */}
            <button
              onClick={handleZoomOut}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition shadow-lg cursor-pointer"
              title={isHindi ? "ज़ूम आउट" : "Zoom Out"}
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Reset to North / Recenter */}
            <button
              onClick={handleResetNorth}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-400 border border-white/15 backdrop-blur-md transition shadow-lg cursor-pointer"
              title={isHindi ? "उत्तर दिशा पर रीसेट करें" : "Reset North Orientation"}
            >
              <Compass className="w-4 h-4" />
            </button>

            {/* Toggle Auto Rotation */}
            <button
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`p-2.5 rounded-xl border border-white/15 backdrop-blur-md transition shadow-lg cursor-pointer ${
                autoRotate ? 'bg-sky-600 text-white' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
              }`}
              title={autoRotate ? (isHindi ? "घूर्णन रोकें" : "Pause Rotation") : (isHindi ? "घूर्णन शुरू करें" : "Start Rotation")}
            >
              {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Toggle Cyclonic Vortex */}
            <button
              onClick={() => setShowCyclone((prev) => !prev)}
              className={`p-2.5 rounded-xl border border-white/15 backdrop-blur-md transition shadow-lg cursor-pointer ${
                showCyclone ? 'bg-cyan-600 text-white' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
              }`}
              title={showCyclone ? (isHindi ? "चक्रवात परत छुपाएं" : "Hide Cyclone Layer") : (isHindi ? "चक्रवात परत दिखाएं" : "Show Cyclone Layer")}
            >
              <Wind className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/15 backdrop-blur-md transition shadow-lg cursor-pointer"
              title={isFullscreen ? (isHindi ? "पूर्ण स्क्रीन से बाहर निकलें" : "Exit Fullscreen") : (isHindi ? "पूर्ण स्क्रीन" : "Fullscreen")}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Actual 3D Three.js Globe Component filling entire workstation */}
          <div className="w-full h-full absolute inset-0">
            <ThreeCycloneGlobe
              targetLat={currentTarget.lat}
              targetLon={currentTarget.lon}
              systemName={currentTarget.name}
              category={currentTarget.category}
              risk={currentTarget.risk}
              isDark={true}
              autoRotate={autoRotate}
              enableWheelZoom={true}
              zoomStep={zoomStep}
              showCyclone={showCyclone}
              showTelemetry={false}
              className="w-full h-full absolute inset-0 select-none"
            />
          </div>

          {/* Bottom Interactive Guidance Pill */}
          <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-white/15 backdrop-blur-md text-[11px] text-slate-300 font-mono shadow-xl pointer-events-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>{isHindi ? 'ग्लोब घुमाने के लिए ड्रैग करें • स्क्रॉल से ज़ूम करें' : 'Drag to Rotate 3D Earth • Scroll / Pinch to Zoom'}</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-white/15 backdrop-blur-md text-[10px] text-slate-400 font-mono shadow-xl pointer-events-auto flex items-center gap-2">
              <span>{isHindi ? 'मौसम विज्ञान प्रभाग' : 'Meteorological Intelligence'}</span>
              <span>•</span>
              <span className="text-sky-400 font-semibold">vayusat.live</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LiveMap;
