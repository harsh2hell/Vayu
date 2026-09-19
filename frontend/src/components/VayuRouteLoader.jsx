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
    ? "w-full h-full min-h-[50vh] bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-center font-sans antialiased select-none p-6 relative overflow-hidden"
    : "fixed inset-0 z-[99999] min-h-screen w-full bg-[#F8FAFC] text-slate-800 flex flex-col items-center justify-center font-sans antialiased select-none p-6 relative overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Inline Keyframes for smooth cyclone vortex rotation and radar progress */}
      <style>{`
        @keyframes vayu-cyclone-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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
      <div className="relative flex items-center justify-center">
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

        {/* Cyclone Emblem */}
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
    </div>
  );
}
