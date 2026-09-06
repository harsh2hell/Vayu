import React from 'react';
import { Clock } from 'lucide-react';

/**
 * LastUpdatedBadge
 * Displays standardized real-time synchronization timestamp and data source credit.
 */
export default function LastUpdatedBadge({
  timestamp,
  source = null,
  isLive = false,
  className = '',
  isHindi = false,
  size = 'sm'
}) {
  const displayTime = timestamp || new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) + ' IST';

  const sizeClasses = size === 'xs'
    ? 'text-[10px] py-0.5 px-2 gap-1.5'
    : 'text-xs py-1 px-2.5 gap-2';

  return (
    <div
      className={`inline-flex items-center rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-600 dark:text-slate-300 font-mono shadow-2xs ${sizeClasses} ${className}`}
    >
      <span className="flex items-center gap-1">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isLive ? 'bg-emerald-500 animate-ping' : 'bg-sky-400'
          }`}
        />
        <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
      </span>
      <span>
        <span className="text-slate-400 dark:text-slate-500 mr-1">
          {isHindi ? 'अंतिम अपडेट:' : 'Last Updated:'}
        </span>
        <strong className="text-slate-800 dark:text-slate-100 font-semibold">{displayTime}</strong>
      </span>
      {source && (
        <>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {source}
          </span>
        </>
      )}
    </div>
  );
}
