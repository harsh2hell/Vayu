// Domain & Subdomain routing utilities for vayusat.live
// Handles:
// - www.vayusat.live / vayusat.live (Public Atlas & Web Portal)
// - portal.vayusat.live (Command & Operations Portal, previously /dashboard)
// - login.vayusat.live (Clerk Authentication Gateway)
// - localhost / dev environments

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

export const isPortalSubdomain = () => {
  const host = getHostname();
  if (
    host.startsWith('portal.') ||
    host.includes('portal-') ||
    host.startsWith('dashboard.') ||
    host.includes('dashboard-')
  ) {
    return true;
  }
  // Allow simulation/testing in dev via ?portal=true or ?subdomain=portal
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'true' || params.get('subdomain') === 'portal') {
      return true;
    }
  }
  return false;
};

// URL generators for seamless cross-subdomain transitions
export const getWebsiteUrl = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (isProductionDomain()) {
    return `https://www.vayusat.live${cleanPath}`;
  }
  return cleanPath;
};

export const getPortalUrl = (subPath = '') => {
  const cleanPath = subPath 
    ? (subPath.startsWith('/') ? subPath : `/${subPath}`).replace(/^\/dashboard\/?/, '/')
    : '';
  const finalPath = cleanPath === '/' ? '' : cleanPath;
  if (isProductionDomain()) {
    return `https://portal.vayusat.live${finalPath || '/'}`;
  }
  return `/dashboard${finalPath}`;
};

// Aliased for backward compatibility across existing calls
export const getDashboardUrl = getPortalUrl;

export const getAuthUrl = (redirectTarget) => {
  const target = redirectTarget || getPortalUrl();
  if (isProductionDomain()) {
    return `https://login.vayusat.live?redirect_url=${encodeURIComponent(target)}`;
  }
  return `/login?redirect_url=${encodeURIComponent(target)}`;
};

/**
 * Returns the base prefix for portal routes depending on the current subdomain context:
 * - On portal.vayusat.live: '' (e.g. /satellite)
 * - On main site or local dev: '/dashboard' (e.g. /dashboard/satellite)
 */
export const getPortalBasePath = () => {
  return isPortalSubdomain() ? '' : '/dashboard';
};

export const toPortalPath = (path = '') => {
  const clean = path.replace(/^\/dashboard\/?/, '').replace(/^\/+/, '');
  const base = getPortalBasePath();
  return clean ? `${base}/${clean}` : (base || '/');
};
