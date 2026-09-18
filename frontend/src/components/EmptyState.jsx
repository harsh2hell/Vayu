import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Standard VAYU Unified Empty State Component
 * Replaces disparate, jarring warning boxes with a clean, professional placeholder.
 */
const EmptyState = ({
  icon: Icon = AlertCircle,
  title = 'NO INFERENCE EXECUTED',
  description = 'Select an input frame or load a benchmark case to run the deep neural model.',
  action = null,
  children = null
}) => {
  return (
    <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center rounded-2xl bg-slate-50/50 border border-slate-100">
      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 text-slate-400 flex items-center justify-center mb-3 shadow-sm">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
        {title}
      </h4>
      <p className="text-xs text-slate-500 max-w-md mt-1 leading-relaxed">
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
