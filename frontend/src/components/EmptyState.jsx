import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Standard VAYU Unified Empty State Component
 * Clean, professional, monochromatic placeholder.
 */
const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'NO INFERENCE EXECUTED',
  description = 'Select an input frame or load a benchmark case to run the deep neural model.',
  action = null,
  children = null
}) => {
  return (
    <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
      <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3 shadow-xs">
        <Icon className="w-5 h-5 stroke-[1.75]" />
      </div>
      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 leading-relaxed">
        {description}
      </p>
      {children && (
        <div className="w-full max-w-sm mt-3">
          {children}
        </div>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
