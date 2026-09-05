import React, { useRef, useEffect } from 'react';

/**
 * IOSGlassCard
 * High-performance Apple VisionOS / iOS 3D Glassmorphism Card.
 * 
 * Features:
 * - Clean translucent glass with blur, soft border, layered shadows
 * - Mouse-following 3D perspective tilt (smooth & realistic)
 * - Dynamic specular light reflection / gloss moving with cursor
 * - Top edge specular rim reflection (bevel)
 * - Direct DOM manipulation on mousemove for 60/120fps GPU performance (zero React re-renders)
 * - Mobile/touch automatic detection with native press animation fallback
 */
export default function IOSGlassCard({
  children,
  className = '',
  wrapperClassName = '',
  maxTilt = 7,
  perspective = 1000,
  scale = 1.02,
  lift = 4,
  glareOpacity = 0.45,
  onClick,
  interactive = true,
  as: Component = 'div',
  ...rest
}) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const isTouchRef = useRef(false);

  useEffect(() => {
    // Check if device is touch-primary
    if (typeof window !== 'undefined') {
      isTouchRef.current = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    }
  }, []);

  const handleMouseMove = (e) => {
    if (!interactive || isTouchRef.current) return;
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return;

    // Relative -1 to 1 coordinates from card center
    const px = (x / width) * 2 - 1;
    const py = (y / height) * 2 - 1;

    const rotateX = -py * maxTilt;
    const rotateY = px * maxTilt;

    // Direct GPU transform update
    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-${lift}px) scale3d(${scale}, ${scale}, ${scale}) translateZ(10px)`;

    // Specular gloss update
    if (glare) {
      const gx = ((x / width) * 100).toFixed(1);
      const gy = ((y / height) * 100).toFixed(1);
      glare.style.opacity = '1';
      glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, ${glareOpacity}) 0%, rgba(255, 255, 255, 0.12) 35%, transparent 70%)`;
    }
  };

  const handleMouseEnter = () => {
    if (!interactive || isTouchRef.current) return;
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.12s ease-out, box-shadow 0.3s ease, border-color 0.3s ease, background-color 0.3s ease';
    }
  };

  const handleMouseLeave = () => {
    if (!interactive || isTouchRef.current) return;
    const card = cardRef.current;
    const glare = glareRef.current;

    if (card) {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background-color 0.3s ease';
      card.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1) translateZ(0px)`;
    }

    if (glare) {
      glare.style.opacity = '0';
    }
  };

  return (
    <div className={`ios-3d-glass-wrapper ${wrapperClassName}`}>
      <Component
        ref={cardRef}
        className={`ios-3d-glass-card ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        {...rest}
      >
        {interactive && (
          <>
            <div ref={glareRef} className="ios-glass-specular" />
            <div className="ios-glass-bevel" />
          </>
        )}
        {children}
      </Component>
    </div>
  );
}
