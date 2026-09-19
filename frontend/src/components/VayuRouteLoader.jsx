import React from 'react';

/**
 * Lightweight VAYU Route Suspense Fallback
 * 
 * Features:
 * - Pure CSS animation (zero heavy icons or external libraries)
 * - Seamless dark slate aesthetic matching both public and operations portals
 * - Zero layout shift and minimal bundle impact (~0.5 KB)
 */
export default function VayuRouteLoader({ message = 'Initializing meteorological intelligence...' }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center font-sans antialiased p-6">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-10 h-10 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-sky-400 animate-ping" />
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
          VAYU Meteorological System
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-mono">
          {message}
        </div>
      </div>
    </div>
  );
}
