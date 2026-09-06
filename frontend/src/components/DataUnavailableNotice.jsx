import React from 'react';
import { AlertTriangle, RefreshCw, Radio } from 'lucide-react';

/**
 * DataUnavailableNotice
 * Clean, professional state shown when an automated telemetry stream or sensor feed is offline,
 * replacing confusing fake or hardcoded random placeholders.
 */
export default function DataUnavailableNotice({
  feedName = 'Telemetry Feed',
  reason = null,
  onRetry = null,
  isRetrying = false,
  className = '',
  isHindi = false,
  compact = false
}) {
  const defaultReason = isHindi
    ? 'सेंसर स्ट्रीम ऑफलाइन है या उपग्रह डेटा पास की प्रतीक्षा में है।'
    : 'Real-time telemetry stream currently unavailable. Awaiting next ground station pass.';

  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-xs ${className}`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold">{feedName}:</strong>{' '}
            <span className="text-amber-800 dark:text-amber-400/90">{reason || defaultReason}</span>
          </span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="px-2 py-1 rounded-lg bg-amber-200/60 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-900 dark:text-amber-200 text-[10px] font-semibold transition-colors flex items-center gap-1 shrink-0"
          >
            <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isHindi ? 'पुनः प्रयास' : 'Retry'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-2.5 ${className}`}
    >
      <div className="w-10 h-10 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
        <Radio className="w-5 h-5 animate-pulse" />
      </div>
      <div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
          {feedName} {isHindi ? 'वर्तमान में अनुपलब्ध' : 'Currently Unavailable'}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm mt-1">
          {reason || defaultReason}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isHindi ? 'कनेक्शन पुनः जांचें' : 'Check Sensor Connection'}</span>
        </button>
      )}
    </div>
  );
}
