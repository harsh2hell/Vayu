import React from 'react';

/**
 * Standard VAYU Unified Page Header Component
 * Enforces identical typography, padding, card styling, and action alignment across all dashboard pages.
 */
const PageHeader = ({
  categoryBadge = 'OPERATIONAL METEOROLOGY',
  categoryColor = 'navy', // 'navy' | 'blue' | 'emerald' | 'amber' | 'purple' | 'red'
  title,
  subtitle,
  modelBadge,
  actions
}) => {
  const getBadgeClass = () => {
    switch (categoryColor) {
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'purple': return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'red': return 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'blue':
      case 'navy':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {categoryBadge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${getBadgeClass()}`}>
              {categoryBadge}
            </span>
          )}
          {modelBadge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
              {modelBadge}
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-[13px] sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
