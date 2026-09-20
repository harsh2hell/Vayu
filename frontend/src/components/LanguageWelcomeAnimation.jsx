import React, { useState, useEffect, useRef } from 'react';

/**
 * LanguageWelcomeAnimation
 * -------------------------------------------------------------
 * Cinematic VAYU Reload & Welcome Transition:
 * - Dynamic levitating VAYU logo with gentle breathing float
 * - Specular diagonal prismatic light-sweep across logo surface
 * - Concentric Doppler radar isobar pulse waves & ambient backlighting
 * - Clockwise dashed telemetry orbital track with gliding satellite sensor
 * - Clean institutional headline: "Welcome to VAYU" / "वायु में आपका स्वागत है"
 * - MoES / IMD Meteorological Intelligence status badge with emerald pulse
 * - Smooth fade-out with instant Skip button
 */
const LanguageWelcomeAnimation = ({
  isOpen,
  mode = 'switch', // 'first-visit' | 'switch'
  targetLanguage = 'hi', // 'hi' | 'en'
  onLanguageSwitch,
  onComplete
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const onCompleteRef = useRef(onComplete);
  const onLanguageSwitchRef = useRef(onLanguageSwitch);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onLanguageSwitchRef.current = onLanguageSwitch;
  }, [onComplete, onLanguageSwitch]);

  useEffect(() => {
    if (!isOpen) {
      setIsFadingOut(false);
      return;
    }

    setIsFadingOut(false);

    // 1. Switch language behind the screen safely
    const timerSwitch = setTimeout(() => {
      try {
        if (onLanguageSwitchRef.current) {
          onLanguageSwitchRef.current(targetLanguage === 'hi');
        }
      } catch (err) {
        console.warn('Language switch callback error:', err);
      }
    }, 80);

    // 2. Start smooth fade-out (1350ms on first-visit/reload to enjoy the cinematic animation)
    const fadeDelay = mode === 'first-visit' ? 1350 : 650;
    const timerFade = setTimeout(() => {
      setIsFadingOut(true);
    }, fadeDelay);

    // 3. Complete and unmount (fade duration is 380ms)
    const timerDone = setTimeout(() => {
      try {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      } catch (err) {
        console.warn('Animation complete error:', err);
      }
    }, fadeDelay + 380);

    // 4. Hard safety fallback: force close after max 2.4s under any circumstance
    const fallbackTimer = setTimeout(() => {
      setIsFadingOut(true);
      if (onCompleteRef.current) onCompleteRef.current();
    }, 2400);

    return () => {
      clearTimeout(timerSwitch);
      clearTimeout(timerFade);
      clearTimeout(timerDone);
      clearTimeout(fallbackTimer);
    };
  }, [isOpen, mode, targetLanguage]);

  if (!isOpen) return null;

  const isHindi = targetLanguage === 'hi';
  const displayText = isHindi ? 'वायु में आपका स्वागत है' : 'Welcome to VAYU';

  const handleImmediateDismiss = () => {
    setIsFadingOut(true);
    if (onCompleteRef.current) onCompleteRef.current();
  };

  return (
    <div 
      onClick={handleImmediateDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fbfcfd] dark:bg-[#06080d] text-slate-950 dark:text-white transition-opacity duration-380 ease-out select-none cursor-pointer ${
        isFadingOut 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100 pointer-events-auto'
      }`}
    >
      <style>{`
        @keyframes vayuEntrance {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }

        @keyframes vayuLevitate {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }

        @keyframes vayuGroundShadow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.28;
            filter: blur(6px);
          }
          50% {
            transform: scale(0.78);
            opacity: 0.12;
            filter: blur(10px);
          }
        }

        @keyframes vayuPrismaticGleam {
          0% {
            transform: translateX(-240%) skewX(-25deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          65% {
            opacity: 0.95;
          }
          100% {
            transform: translateX(340%) skewX(-25deg);
            opacity: 0;
          }
        }

        @keyframes vayuOrbitClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes vayuOrbitCounterClockwise {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes vayuRadarPulse1 {
          0% { transform: scale(0.82); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.22; }
          100% { transform: scale(1.42); opacity: 0; }
        }

        @keyframes vayuRadarPulse2 {
          0% { transform: scale(0.88); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 0.16; }
          100% { transform: scale(1.58); opacity: 0; }
        }

        @keyframes vayuAuraBreathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.22);
            opacity: 0.75;
          }
        }

        @keyframes vayuProgressSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }

        .vayu-entrance-wrap {
          animation: vayuEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .vayu-levitate {
          animation: vayuLevitate 3.2s ease-in-out infinite;
        }

        .vayu-ground-shadow {
          animation: vayuGroundShadow 3.2s ease-in-out infinite;
        }

        .vayu-sheen-sweep {
          animation: vayuPrismaticGleam 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }

        .vayu-aura-breathe {
          animation: vayuAuraBreathe 3.6s ease-in-out infinite;
        }

        .vayu-radar-pulse-1 {
          animation: vayuRadarPulse1 2.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }

        .vayu-radar-pulse-2 {
          animation: vayuRadarPulse2 2.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 0.75s;
        }

        .vayu-progress-bar {
          animation: vayuProgressSweep 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* Top National Tricolor Header Accent Strip */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-95 z-30 shadow-xs" />

      {/* Soft Ambient Radial Atmosphere Light */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.14)_0%,rgba(56,189,248,0.06)_45%,transparent_75%)]" />

      {/* Main Atmospheric Animation Stage */}
      <div className="vayu-entrance-wrap relative flex flex-col items-center justify-center z-10">
        
        {/* Logo Stage with Orbiting Radar Track, Compass Reticle, & Pulse Waves */}
        <div className="relative flex flex-col items-center justify-center">
          
          {/* Concentric Doppler Radar Pulse Wave 1 */}
          <div className="absolute w-76 h-76 sm:w-92 sm:h-92 rounded-full border border-sky-400/25 vayu-radar-pulse-1 pointer-events-none" />
          
          {/* Concentric Doppler Radar Pulse Wave 2 */}
          <div className="absolute w-60 h-60 sm:w-74 sm:h-74 rounded-full border border-sky-500/25 vayu-radar-pulse-2 pointer-events-none" />

          {/* Outer Compass Reticle Ring (Static Tick Marks) */}
          <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-slate-300/40 dark:border-slate-700/50 pointer-events-none flex items-center justify-center">
            {/* Cardinal Navigation Coordinates / Crosshairs */}
            <div className="absolute -top-1 w-0.5 h-2 bg-sky-500/70" />
            <div className="absolute -bottom-1 w-0.5 h-2 bg-sky-500/70" />
            <div className="absolute -left-1 h-0.5 w-2 bg-sky-500/70" />
            <div className="absolute -right-1 h-0.5 w-2 bg-sky-500/70" />
          </div>

          {/* Clockwise Dashed Isobar Orbit Track with Gliding Satellite Sensor */}
          <div 
            className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-dashed border-sky-400/45 pointer-events-none"
            style={{ animation: 'vayuOrbitClockwise 10s linear infinite' }}
          >
            {/* Orbiting Satellite Telemetry Sensor Marker */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-[0_0_12px_rgba(2,132,199,1)] border-2 border-white dark:border-slate-900" />
              <div className="absolute w-6 h-6 rounded-full bg-sky-400/30 animate-ping" />
            </div>
          </div>

          {/* Core Atmospheric Breathing Backlight Glow */}
          <div className="vayu-aura-breathe absolute w-52 h-52 rounded-full bg-gradient-to-tr from-sky-400/30 via-blue-500/20 to-cyan-300/25 blur-3xl pointer-events-none" />

          {/* Elevated Floating Logo Card */}
          <div className="vayu-levitate relative">
            <div className="relative overflow-hidden px-8 py-5 sm:px-11 sm:py-6 rounded-3xl backdrop-blur-md bg-white/75 dark:bg-slate-900/75 border border-slate-200/70 dark:border-slate-800/70 shadow-[0_16px_45px_-10px_rgba(2,132,199,0.22)]">
              <img 
                src="/vayu.png" 
                alt="VAYU" 
                className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain filter drop-shadow-[0_10px_24px_rgba(0,0,0,0.1)] select-none" 
              />

              {/* Specular Diagonal Prismatic Shining Gleam Sweep */}
              <div className="vayu-sheen-sweep absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-white/90 dark:via-white/70 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* 3D Realistic Ground Shadow (reacts dynamically to logo height) */}
          <div className="vayu-ground-shadow w-44 sm:w-56 h-3 rounded-full bg-slate-900/30 dark:bg-black/60 mt-3 pointer-events-none" />
        </div>

        {/* Clean Institutional Headline & Meteorological Status */}
        <div className="mt-5 text-center px-4 max-w-xl space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-slate-950 dark:text-white leading-tight drop-shadow-xs">
            {displayText}
          </h1>

          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-sky-200/80 dark:border-sky-800/60 shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[11px] font-bold text-sky-900 dark:text-sky-200 uppercase tracking-widest font-sans">
              Meteorological Intelligence
            </span>
          </div>

          {/* Sleek Telemetry Progress Sweep Bar */}
          <div className="w-48 sm:w-56 h-1 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden mx-auto mt-2 relative">
            <div className="vayu-progress-bar h-full bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400 w-1/3 rounded-full" />
          </div>
        </div>
      </div>

      {/* Instant Skip Button */}
      <button
        onClick={() => {
          if (onLanguageSwitchRef.current) {
            onLanguageSwitchRef.current(targetLanguage === 'hi');
          }
          setIsFadingOut(true);
          setTimeout(() => {
            if (onCompleteRef.current) onCompleteRef.current();
          }, 80);
        }}
        className="absolute top-6 right-6 text-xs text-neutral-400 hover:text-black dark:hover:text-white font-semibold px-3 py-1 rounded border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white transition-colors cursor-pointer z-30"
      >
        Skip
      </button>
    </div>
  );
};

export default LanguageWelcomeAnimation;
