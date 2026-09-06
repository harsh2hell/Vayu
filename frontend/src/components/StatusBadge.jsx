import React from 'react';

/**
 * Standard VAYU Unified Status Badge
 * Replaces disparate badges with identical shape, typography, padding, and semantic colors.
 */
const StatusBadge = ({
  status = 'READY', // 'LIVE' | 'READY' | 'RUNNING' | 'COMPLETE' | 'UNAVAILABLE' | 'WARNING' | 'REFERENCE' | 'AI' | 'BENCHMARK'
  label,
  size = 'sm' // 'xs' | 'sm' | 'md'
}) => {
  const norm = (status || '').toUpperCase();
  const text = label || norm;

  const getStyles = () => {
    switch (norm) {
      case 'LIVE':
      case 'ONLINE':
      case 'COMPLETE':
      case 'VERIFIED':
      case 'GROUND_TRUTH':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'RUNNING':
      case 'IN_PROGRESS':
      case 'INSPECTING':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500 animate-pulse'
        };
      case 'UNAVAILABLE':
      case 'OFFLINE':
      case 'ERROR':
      case 'FAILED':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500'
        };
      case 'WARNING':
      case 'INSUFFICIENT DATA':
      case 'INSUFFICIENT HISTORY':
      case 'UNCERTAIN':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'AI':
      case 'OPERATIONAL FORECAST':
      case 'DEEP_LEARNING':
        return {
          bg: 'bg-blue-50/80 text-[#003087] border-blue-200',
          dot: 'bg-[#003087]'
        };
      case 'BENCHMARK':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500'
        };
      case 'READY':
      case 'REFERENCE':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400'
        };
    }
  };

  const { bg, dot } = getStyles();
  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-2 py-0.5' 
    : size === 'md' 
    ? 'text-xs px-3 py-1' 
    : 'text-[11px] px-2.5 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-mono font-semibold tracking-tight border ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;
