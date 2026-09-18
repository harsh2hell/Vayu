import React from 'react';

/**
 * IOSGlassCard
 * Clean, minimal card component for consistent, professional presentation.
 * Understated borders and subtle elevation without 3D tilt, sliding, glare, or artificial glass effects.
 */
export default function IOSGlassCard({
  children,
  className = '',
  wrapperClassName = '',
  maxTilt,
  perspective,
  scale,
  lift,
  glareOpacity,
  onClick,
  interactive = true,
  as: Component = 'div',
  ...rest
}) {
  return (
    <div className={`ios-3d-glass-wrapper ${wrapperClassName}`}>
      <Component
        className={`ios-3d-glass-card ${interactive ? 'ios-3d-glass-interactive' : ''} ${className}`}
        onClick={onClick}
        {...rest}
      >
        {children}
      </Component>
    </div>
  );
}

