import React from 'react';

/**
 * Minimalist Clean White VAYU Preloader & Suspense Fallback
 * 
 * Replaces generic spinners with the pristine, high-end white VAYU splash identity:
 * - Pure crisp white canvas matching official VAYU welcome aesthetic
 * - Centered high-resolution VAYU emblem with specular light-sheen sweep
 * - "Welcome to VAYU" in clean, executive typography
 * - Used universally across public website, operational dashboard, and gateways
 */
export default function VayuRouteLoader({ message, inline = false }) {
  const containerClasses = inline
    ? "w-full h-full min-h-[50vh] bg-white text-slate-950 flex flex-col items-center justify-center font-sans antialiased select-none p-6"
    : "fixed inset-0 z-[99999] min-h-screen w-full bg-white text-slate-950 flex flex-col items-center justify-center font-sans antialiased select-none p-6";

  return (
    <div 
      className={containerClasses}
      style={{ backgroundColor: '#ffffff' }}
    >
      <style>{`
        @keyframes vayu-loader-sheen {
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

        .vayu-loader-sheen-sweep {
          animation: vayu-loader-sheen 1.4s cubic-bezier(0.25, 1, 0.5, 1) infinite;
        }
      `}</style>

      {/* Centered Steady Logo with Shining Sheen Effect */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Radial Halo */}
        <div className="absolute w-56 h-56 rounded-full bg-slate-100/80 blur-2xl -z-10 pointer-events-none" />

        <div className="relative overflow-hidden p-3 rounded-3xl">
          <img 
            src="/vayu.png" 
            alt="VAYU" 
            className="h-20 sm:h-24 md:h-28 w-auto object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.06)]" 
          />

          {/* Specular Diagonal Shining Sweep */}
          <div 
            className="vayu-loader-sheen-sweep absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" 
          />
        </div>
      </div>

      {/* Headline */}
      <div className="mt-4 text-center px-4 max-w-md">
        <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-slate-950 leading-tight">
          Welcome to VAYU
        </h1>
        {message && (
          <p className="mt-2 text-xs font-mono text-slate-400 tracking-wide">
            {message}
          </p>
        )}
      </div>

      {/* Minimalist, subtle progress indicator */}
      <div className="mt-6 w-32 h-1 bg-slate-100 rounded-full overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 bg-slate-900 rounded-full w-1/2 animate-[pulse_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
