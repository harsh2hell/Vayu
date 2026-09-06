import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  useAuth,
  useUser, 
  useClerk 
} from '@clerk/clerk-react';
import { AlertTriangle, User } from 'lucide-react';
import { getAuthUrl, isProductionDomain } from '../../utils/domain';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

/**
 * Notice displayed when Clerk authentication has not been configured in the environment.
 * Prevents silent fallback to mock credentials and ensures the application fails securely.
 */
export const AuthConfigurationNotice = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            The VAYU Command Dashboard requires authorized operational credentials.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left font-mono text-[11px] text-slate-600 space-y-2">
          <p className="text-amber-700 font-semibold">Environment Variable Required:</p>
          <p>Please add <code className="text-slate-900 font-bold">VITE_CLERK_PUBLISHABLE_KEY</code> in your Vercel Project Settings ➔ Environment Variables, then redeploy.</p>
        </div>

        <a
          href="/"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
        >
          <span>Return to Public Portal</span>
        </a>
      </div>
    </div>
  );
};

/**
 * Strict Protected Route Wrapper:
 * Users cannot access /dashboard without a verified Clerk session.
 * Uses useAuth() to wait until the session is fully loaded before making redirect decisions,
 * preventing render-phase bounce loops.
 */
const ClerkProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn && isProductionDomain()) {
      const targetUrl = window.location.href;
      window.location.replace(getAuthUrl(targetUrl));
    }
  }, [isLoaded, isSignedIn]);

  // 1. Wait until Clerk has fully loaded the session
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500">Verifying session...</p>
      </div>
    );
  }

  // 2. If unauthenticated in development, use React Router Navigate
  if (!isSignedIn) {
    if (!isProductionDomain()) {
      return <Navigate to={`/login?redirect_url=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500">Redirecting to secure login gateway...</p>
      </div>
    );
  }

  // 3. User is authenticated! Render the dashboard
  return <>{children}</>;
};

export const ProtectedRoute = ({ children }) => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <AuthConfigurationNotice />;
  }
  return <ClerkProtectedRoute>{children}</ClerkProtectedRoute>;
};

// Helper functions for user profile resolution
const getDisplayName = (user) => {
  if (!user) return '';
  if (user.fullName && user.fullName.trim()) return user.fullName.trim();
  const joined = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (joined) return joined;
  if (user.username && user.username.trim()) return user.username.trim();
  const email = getDisplayEmail(user);
  if (email && email.includes('@')) {
    const prefix = email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return 'Authorized Officer';
};

const getDisplayEmail = (user) => {
  if (!user) return '';
  if (user.primaryEmailAddress?.emailAddress) {
    return user.primaryEmailAddress.emailAddress;
  }
  if (user.primaryEmailAddressId && Array.isArray(user.emailAddresses)) {
    const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
    if (primary?.emailAddress) return primary.emailAddress;
  }
  if (Array.isArray(user.emailAddresses) && user.emailAddresses[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress;
  }
  if (Array.isArray(user.externalAccounts) && user.externalAccounts[0]?.emailAddress) {
    return user.externalAccounts[0].emailAddress;
  }
  if (user.primaryPhoneNumber?.phoneNumber) {
    return user.primaryPhoneNumber.phoneNumber;
  }
  if (user.username) {
    return user.username;
  }
  return '';
};

const getInitials = (name) => {
  if (!name) return 'AO';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const ClerkUserDisplay = () => {
  const { user, isLoaded } = useUser();

  // Cache resolved user data in localStorage for fast zero-flicker rehydration
  useEffect(() => {
    if (user) {
      const resolvedName = getDisplayName(user);
      const resolvedEmail = getDisplayEmail(user);
      if (resolvedName) localStorage.setItem('vayu_user_name', resolvedName);
      if (resolvedEmail) localStorage.setItem('vayu_user_email', resolvedEmail);
      if (user.imageUrl) localStorage.setItem('vayu_user_avatar', user.imageUrl);
    }
  }, [user]);

  const cachedName = typeof window !== 'undefined' ? localStorage.getItem('vayu_user_name') : null;
  const cachedEmail = typeof window !== 'undefined' ? localStorage.getItem('vayu_user_email') : null;
  const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('vayu_user_avatar') : null;

  if (!isLoaded && !cachedName) {
    return (
      <div className="flex items-center gap-2.5 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 space-y-1">
          <div className="h-3 bg-slate-200 rounded w-20" />
          <div className="h-2.5 bg-slate-100 rounded w-28" />
        </div>
      </div>
    );
  }

  const name = (user ? getDisplayName(user) : cachedName) || 'Authorized Officer';
  const email = (user ? getDisplayEmail(user) : cachedEmail) || '';
  const avatarUrl = user?.imageUrl || cachedAvatar;
  const initials = getInitials(name);

  return (
    <div className="flex items-center gap-2.5">
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={name} 
          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
          {initials}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span className="text-xs font-bold text-slate-900 truncate leading-tight" title={name}>
          {name}
        </span>
        <span className="text-[11px] text-slate-500 truncate leading-tight mt-0.5" title={email}>
          {email || 'Operational Session'}
        </span>
      </div>
    </div>
  );
};

export const OfficerAccountDisplay = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    const cachedName = typeof window !== 'undefined' ? localStorage.getItem('vayu_user_name') : null;
    const cachedEmail = typeof window !== 'undefined' ? localStorage.getItem('vayu_user_email') : null;
    const cachedAvatar = typeof window !== 'undefined' ? localStorage.getItem('vayu_user_avatar') : null;
    const name = cachedName || 'Authorized Officer';
    const email = cachedEmail || 'Operational Session';
    const initials = getInitials(name);

    return (
      <div className="flex items-center gap-2.5">
        {cachedAvatar ? (
          <img 
            src={cachedAvatar} 
            alt={name} 
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" 
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <span className="text-xs font-bold text-slate-900 truncate leading-tight" title={name}>
            {name}
          </span>
          <span className="text-[11px] text-slate-500 truncate leading-tight mt-0.5" title={email}>
            {email}
          </span>
        </div>
      </div>
    );
  }
  return <ClerkUserDisplay />;
};

const ClerkSignOutButton = ({ onSignOutComplete, className, children }) => {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('vayu_user_name');
        localStorage.removeItem('vayu_user_email');
        localStorage.removeItem('vayu_user_avatar');
      }
      if (signOut) {
        await signOut();
      }
    } catch (err) {
      console.warn('[ClerkAuth] Sign out error:', err);
    }

    if (onSignOutComplete) {
      onSignOutComplete();
    } else {
      window.location.replace(getAuthUrl());
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className={className}
    >
      {children}
    </button>
  );
};

export const SafeSignOutButton = ({ onSignOutComplete, className, children }) => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <button
        type="button"
        onClick={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('vayu_user_name');
            localStorage.removeItem('vayu_user_email');
            localStorage.removeItem('vayu_user_avatar');
          }
          if (onSignOutComplete) onSignOutComplete();
          else window.location.replace(getAuthUrl());
        }}
        className={className}
      >
        {children}
      </button>
    );
  }
  return (
    <ClerkSignOutButton onSignOutComplete={onSignOutComplete} className={className}>
      {children}
    </ClerkSignOutButton>
  );
};
