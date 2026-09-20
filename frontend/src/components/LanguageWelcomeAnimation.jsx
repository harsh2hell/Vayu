import React, { useState, useEffect, useRef } from 'react';

/**
 * Minimalist Clean Language & Welcome Transition
 * 
 * Features:
 * - Pure clean white background (with dark mode support) matching website theme
 * - Zero popup/bounce/jump effects on both logo and text
 * - Enlarged VAYU logo with ONLY a sleek specular shining light-sweep effect
 * - Clean, steady welcome headline:
 *     - Hindi: "वायु में आपका स्वागत है"
 *     - English: "Welcome to VAYU"
 * - Immediate background language switch
 * - Smooth fade-out transition
 * - Instant Skip button & click-to-dismiss
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

    // 1. Switch language behind the screen
    const timerSwitch = setTimeout(() => {
      try {
        if (onLanguageSwitchRef.current) {
          onLanguageSwitchRef.current(targetLanguage === 'hi');
        }
      } catch (err) {
        console.warn('Language switch callback error:', err);
      }
    }, 80);

    // 2. Start smooth fade-out (850ms on first-visit, 600ms on switch)
    const fadeDelay = mode === 'first-visit' ? 850 : 600;
    const timerFade = setTimeout(() => {
      setIsFadingOut(true);
    }, fadeDelay);

    // 3. Complete and unmount (fade duration is 350ms)
    const timerDone = setTimeout(() => {
      try {
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      } catch (err) {
        console.warn('Animation complete error:', err);
      }
    }, fadeDelay + 350);

    // 4. Hard safety fallback
    const fallbackTimer = setTimeout(() => {
      setIsFadingOut(true);
      if (onCompleteRef.current) onCompleteRef.current();
    }, 1800);

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
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white dark:bg-black text-slate-950 dark:text-white transition-opacity duration-350 ease-out select-none cursor-pointer ${
        isFadingOut 
          ? 'opacity-0 pointer-events-none' 
          : 'opacity-100 pointer-events-auto'
      }`}
    >
      <style>{`
        @keyframes ae-light-sheen {
          0% {
            transform: translateX(-180%) skewX(-25deg);
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(280%) skewX(-25deg);
            opacity: 0.6;
          }
        }

        .ae-sheen-sweep {
          animation: ae-light-sheen 1.4s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
      `}</style>

      {/* Centered Steady Logo with Shining Sheen Effect */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Halo */}
        <div className="absolute w-64 h-64 rounded-full bg-slate-100/90 dark:bg-slate-900/50 blur-3xl -z-10 pointer-events-none" />

        <div className="relative overflow-hidden p-3 rounded-3xl">
          <img 
            src="/vayu.png" 
            alt="VAYU" 
            className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)]" 
          />

          {/* Specular Diagonal Shining Sweep */}
          <div 
            className="ae-sheen-sweep absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/90 dark:via-white/60 to-transparent pointer-events-none" 
          />
        </div>
      </div>

      {/* Single Clean Headline (Steady, No Popup Effect) */}
      <div className="mt-4 text-center px-4 max-w-xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-slate-950 dark:text-white leading-tight">
          {displayText}
        </h1>
      </div>

      {/* Skip Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
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
