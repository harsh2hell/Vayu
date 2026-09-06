// Domain & Subdomain routing utilities for vayusat.live
// Handles vayusat.live (Main Portal & /dashboard), login.vayusat.live (Clerk Authentication), and localhost

export const getHostname = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.toLowerCase();
};

export const isProductionDomain = () => {
  const host = getHostname();
  return host.endsWith('vayusat.live');
};

export const isAuthSubdomain = () => {
  const host = getHostname();
  return (
    host.startsWith('login.') ||
    host.includes('login-') ||
    host.startsWith('auth.') ||
    host.includes('auth-')
  );
};

// URL generators for seamless cross-subdomain transitions
export const getWebsiteUrl = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (isProductionDomain()) {
    return `https://vayusat.live${cleanPath}`;
  }
  return cleanPath;
};

export const getDashboardUrl = (subPath = '') => {
  const cleanPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  if (isProductionDomain()) {
    return `https://vayusat.live/dashboard${cleanPath}`;
  }
  return `/dashboard${cleanPath}`;
};

export const getAuthUrl = (redirectTarget) => {
  const target = redirectTarget || getDashboardUrl();
  if (isProductionDomain()) {
    return `https://login.vayusat.live?redirect_url=${encodeURIComponent(target)}`;
  }
  return `/login?redirect_url=${encodeURIComponent(target)}`;
};
