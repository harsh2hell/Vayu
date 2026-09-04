// Domain & Subdomain routing utilities for autonex.studio
// Handles www.autonex.studio, auth.autonex.studio, dashboard.autonex.studio, and localhost

export const getHostname = () => {
  if (typeof window === 'undefined') return '';
  return window.location.hostname.toLowerCase();
};

export const isProductionDomain = () => {
  const host = getHostname();
  return host.endsWith('autonex.studio');
};

export const isDashboardSubdomain = () => {
  const host = getHostname();
  // Support dashboard.autonex.studio or local test dashboard.localhost
  return host.startsWith('dashboard.') || host.includes('dashboard-');
};

export const isAuthSubdomain = () => {
  const host = getHostname();
  return host.startsWith('auth.') || host.includes('auth-');
};

// URL generators for seamless cross-subdomain transitions
export const getWebsiteUrl = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (isProductionDomain()) {
    return `https://www.autonex.studio${cleanPath}`;
  }
  return cleanPath;
};

export const getDashboardUrl = (subPath = '') => {
  const cleanPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  if (isProductionDomain()) {
    return `https://dashboard.autonex.studio${cleanPath}`;
  }
  return `/dashboard${cleanPath}`;
};

export const getAuthUrl = (redirectTarget) => {
  const target = redirectTarget || (isProductionDomain() ? 'https://dashboard.autonex.studio' : '/dashboard');
  if (isProductionDomain()) {
    return `https://auth.autonex.studio/sign-in?redirect_url=${encodeURIComponent(target)}`;
  }
  return `/login?redirect_url=${encodeURIComponent(target)}`;
};
