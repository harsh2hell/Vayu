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
      case 'blue': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'amber': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      case 'navy':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {categoryBadge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${getBadgeClass()}`}>
              {categoryBadge}
            </span>
          )}
          {modelBadge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-tight bg-slate-100 text-slate-600">
              {modelBadge}
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-[13px] sm:text-sm text-slate-500 font-normal leading-relaxed max-w-3xl">
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
