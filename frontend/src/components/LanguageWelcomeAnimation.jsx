import React, { useState, useEffect, useRef } from 'react';

/**
 * Minimalist Clean White Language & Welcome Transition
 * 
 * Features:
 * - Pure plain white background matching website light theme
 * - Zero popup/bounce/jump effects on both logo and text
 * - Enlarged VAYU logo with ONLY a sleek specular shining light-sweep effect
 * - Clean, steady welcome headline:
 *     - Switching to Hindi (English -> Hindi): "वायु में आपका स्वागत है"
 *     - Switching to English (Hindi -> English): "Welcome to VAYU"
 * - Immediate background language switch while 100% solid white
 * - Smooth fade-out transition
 * - Fully resistant to rapid clicking: resets cleanly on every toggle without getting stuck
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

    // 1. Immediately switch language behind the solid white screen (at 100ms)
    const timerSwitch = setTimeout(() => {
      if (onLanguageSwitchRef.current) {
        onLanguageSwitchRef.current(targetLanguage === 'hi');
      }
    }, 100);

    // 2. Start smooth fade-out (at 750ms for switch, 950ms for first-visit)
    const fadeDelay = mode === 'first-visit' ? 950 : 750;
    const timerFade = setTimeout(() => {
      setIsFadingOut(true);
    }, fadeDelay);

    // 3. Complete and unmount (fade duration is 450ms)
    const timerDone = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, fadeDelay + 450);

    return () => {
      clearTimeout(timerSwitch);
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, [isOpen, mode, targetLanguage]);

  if (!isOpen) return null;

  const isHindi = targetLanguage === 'hi';
  const displayText = isHindi ? 'वायु में आपका स्वागत है' : 'Welcome to VAYU';

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white text-black transition-opacity duration-450 ease-out select-none ${
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
          animation: ae-light-sheen 1.3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
      `}</style>

      {/* Centered Steady Logo with Shining Sheen Effect */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Halo */}
        <div className="absolute w-64 h-64 rounded-full bg-slate-100/90 blur-3xl -z-10 pointer-events-none" />

        <div className="relative overflow-hidden p-3 rounded-3xl">
          {/* Logo Image (Substantially Enlarged, Steady, No Popup Effect) */}
          <img 
            src="/vayu.png" 
            alt="VAYU" 
            className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)]" 
          />

          {/* Specular Diagonal Shining Sweep */}
          <div 
            className="ae-sheen-sweep absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" 
          />
        </div>
      </div>

      {/* Single Clean Headline (Steady, No Popup Effect) */}
      <div className="mt-4 text-center px-4 max-w-xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-slate-950 leading-tight">
          {displayText}
        </h1>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => {
          if (onLanguageSwitchRef.current) {
            onLanguageSwitchRef.current(targetLanguage === 'hi');
          }
          setIsFadingOut(true);
          setTimeout(() => {
            if (onCompleteRef.current) onCompleteRef.current();
          }, 100);
        }}
        className="absolute top-6 right-6 text-xs text-neutral-400 hover:text-black font-semibold px-3 py-1 rounded border border-neutral-200 hover:border-black transition-colors cursor-pointer"
      >
        Skip
      </button>
    </div>
  );
};

export default LanguageWelcomeAnimation;
