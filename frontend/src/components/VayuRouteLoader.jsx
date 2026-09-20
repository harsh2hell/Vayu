import React from 'react';

/**
 * VAYU Route Suspense Fallback (VayuRouteLoader)
 * ---------------------------------------------
 * Premium meteorological intelligence loading state in pure Light Mode.
 * Features an authentic counter-clockwise spinning cyclone vortex emblem
 * with concentric Doppler radar isobar pulses, ambient lighting, and
 * institutional MoES / IMD branding.
 */
export default function VayuRouteLoader({ message = 'Initializing meteorological intelligence...', inline = false }) {
  const containerClasses = inline
    ? "w-full h-full min-h-[50vh] bg-white dark:bg-black text-slate-950 dark:text-white flex flex-col items-center justify-center font-sans antialiased select-none p-6 relative overflow-hidden"
    : "fixed inset-0 z-[99999] min-h-screen w-full bg-white dark:bg-black text-slate-950 dark:text-white flex flex-col items-center justify-center font-sans antialiased select-none p-6 relative overflow-hidden";

  const isHindi = typeof window !== 'undefined' && localStorage.getItem('vayu_is_hindi') === 'true';
  const displayText = isHindi ? 'वायु में आपका स्वागत है' : 'Welcome to VAYU';

  return (
    <div className={containerClasses}>
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
    </div>
  );
}
