import React from 'react';

/**
<<<<<<< HEAD
 * VAYU Route Suspense Fallback (VayuRouteLoader)
 * ---------------------------------------------
 * Premium meteorological intelligence loading state in pure Light Mode.
 * Features an authentic counter-clockwise spinning cyclone vortex emblem
 * with concentric Doppler radar isobar pulses, ambient lighting, and
 * institutional MoES / IMD branding.
=======
 * Minimalist Clean White VAYU Preloader & Suspense Fallback
 * 
 * Replaces generic spinners with the pristine, high-end white VAYU splash identity:
 * - Pure crisp white canvas matching official VAYU welcome aesthetic
 * - Centered high-resolution VAYU emblem with specular light-sheen sweep
 * - "Welcome to VAYU" in clean, executive typography
 * - Used universally across public website, operational dashboard, and gateways
>>>>>>> d2bda6f92485f3a0e192f4013f0420e0ec7ea10c
 */
export default function VayuRouteLoader({ message, inline = false }) {
  const containerClasses = inline
    ? "w-full h-full min-h-[50vh] bg-white text-slate-950 flex flex-col items-center justify-center font-sans antialiased select-none p-6"
    : "fixed inset-0 z-[99999] min-h-screen w-full bg-white text-slate-950 flex flex-col items-center justify-center font-sans antialiased select-none p-6";

  return (
<<<<<<< HEAD
    <div className="min-h-screen w-full bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-center font-sans antialiased p-6 relative overflow-hidden select-none">
      {/* Inline Keyframes for smooth cyclone vortex rotation and radar progress */}
      <style>{`
        @keyframes vayu-cyclone-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes vayu-progress-sweep {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>

      {/* National Tricolor Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-slate-300 to-[#138808] opacity-80" />

      {/* Ambient Meteorological Radial Light */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12)_0%,rgba(248,250,252,0)_70%)]" />

      {/* Cyclone Vortex Center Stage */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Doppler Radar Scan Pulse Wave 1 */}
        <div className="absolute w-44 h-44 rounded-full border border-sky-400/25 animate-ping opacity-30 pointer-events-none" />

        {/* Doppler Radar Scan Pulse Wave 2 */}
        <div className="absolute w-36 h-36 rounded-full border border-sky-500/20 animate-pulse pointer-events-none" />

        {/* Outer Isobar Dashed Tracking Ring */}
        <div 
          className="absolute w-28 h-28 rounded-full border border-dashed border-sky-400/50 pointer-events-none"
          style={{ animation: 'vayu-cyclone-spin 12s linear infinite' }}
        />

        {/* Soft Cyclone Eye Glow Backdrop */}
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-tr from-sky-400/25 via-blue-500/15 to-transparent blur-lg pointer-events-none" />

        {/* Cyclone Emblem (Rotating Counter-Clockwise like North Indian Ocean Cyclones) */}
        <div 
          className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center z-10"
          style={{ animation: 'vayu-cyclone-spin 2.4s linear infinite' }}
        >
          <img
            src="/vayu-icon.png"
            alt="VAYU Cyclone Vortex"
            className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(2,132,199,0.25)]"
          />
        </div>

        {/* Eye of the Cyclone (Subtle Pulsing Core) */}
        <div className="absolute z-20 w-3.5 h-3.5 rounded-full bg-white border-2 border-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.85)] animate-pulse pointer-events-none" />
      </div>

      {/* Branding & Status Info */}
      <div className="text-center z-10 space-y-2 max-w-sm">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl font-black tracking-wider text-slate-900 font-sans">
            VAYU
          </span>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 uppercase tracking-wider">
            Meteorological Intelligence
          </span>
        </div>

        <p className="text-xs sm:text-[13px] font-medium text-slate-500 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{message}</span>
        </p>

        {/* Radar Telemetry Progress Sweep Bar */}
        <div className="w-48 sm:w-56 h-1 bg-slate-200/80 rounded-full overflow-hidden mx-auto mt-3 relative">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-blue-600 to-sky-400 w-1/3 rounded-full"
            style={{ animation: 'vayu-progress-sweep 1.6s ease-in-out infinite' }}
          />
        </div>
=======
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
>>>>>>> d2bda6f92485f3a0e192f4013f0420e0ec7ea10c
      </div>
    </div>
  );
}
