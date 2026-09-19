/**
 * VAYU Zoom Lock Utility
 * -------------------------------------------------------------
 * Enforces a strict, locked viewport scale across the application:
 * 1. Blocks trackpad pinch-to-zoom (wheel events with ctrlKey/metaKey).
 * 2. Blocks mouse wheel zoom (Ctrl/Cmd + Scroll).
 * 3. Blocks keyboard zoom shortcuts (Ctrl/Cmd with +, -, =).
 * 4. Blocks Safari/WebKit gesture zoom (gesturestart, gesturechange).
 * 5. Blocks multi-touch pinch zoom on the page while preserving interactive Leaflet map gestures.
 * 6. Blocks double-tap zoom on touchscreens.
 */

export function initZoomLock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};

  // 1. Wheel / Trackpad pinch zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  };

  // 2. Keyboard zoom shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key;
      const code = e.code;
      if (
        key === '+' ||
        key === '-' ||
        key === '=' ||
        key === '_' ||
        code === 'NumpadAdd' ||
        code === 'NumpadSubtract' ||
        code === 'Equal' ||
        code === 'Minus'
      ) {
        e.preventDefault();
      }
    }
  };

  // 3. WebKit gesture events (Safari / iOS / Mac trackpad)
  const handleGesture = (e) => {
    if (e.target && e.target.closest && e.target.closest('.leaflet-container')) {
      return;
    }
    e.preventDefault();
  };

  // 4. Multi-touch pinch zoom
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 1) {
      if (e.target && e.target.closest && e.target.closest('.leaflet-container')) {
        return;
      }
      e.preventDefault();
    }
  };

  // 5. Double-tap to zoom
  let lastTouchEnd = 0;
  const handleTouchEnd = (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      if (e.target && e.target.closest && (e.target.closest('.leaflet-container') || e.target.closest('input, textarea, select, button'))) {
        lastTouchEnd = now;
        return;
      }
      e.preventDefault();
    }
    lastTouchEnd = now;
  };

  // Attach global listeners with non-passive option where preventDefault is required
  window.addEventListener('wheel', handleWheel, { passive: false });
  document.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown, { passive: false });
  document.addEventListener('gesturestart', handleGesture, { passive: false });
  document.addEventListener('gesturechange', handleGesture, { passive: false });
  document.addEventListener('gestureend', handleGesture, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });

  return () => {
    window.removeEventListener('wheel', handleWheel);
    document.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
}
