import React from 'react';
import { Info } from 'lucide-react';

/**
 * Standard VAYU Unified Info Callout Component
 * Used for scientific disclosures, protocol notes, limitations, and benchmark scope notices.
 */
const InfoCallout = ({
  icon: Icon = Info,
  title,
  children,
  badge,
  className = ''
}) => {
  return (
    <div className={`bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 sm:p-4 text-xs text-blue-950 flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-[#003087] shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          {title && <span className="font-bold text-[#003087] mr-1.5">{title}:</span>}
          <span className="text-blue-950 font-normal">{children}</span>
        </div>
      </div>
      {badge && (
        <span className="font-mono text-[10px] bg-white text-blue-900 px-2 py-0.5 rounded border border-blue-200 shrink-0 font-semibold hidden sm:inline-block">
          {badge}
        </span>
      )}
    </div>
  );
};

export default InfoCallout;
