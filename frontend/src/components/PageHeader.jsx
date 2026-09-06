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
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {categoryBadge && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider uppercase border ${getBadgeClass()}`}>
              {categoryBadge}
            </span>
          )}
          {modelBadge && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold font-mono tracking-tight bg-blue-50/70 text-[#003087] border border-blue-200">
              {modelBadge}
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed max-w-3xl">
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
