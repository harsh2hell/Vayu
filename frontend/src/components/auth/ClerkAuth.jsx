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
            Clerk Authentication Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            The VAYU Command Dashboard is protected by Clerk Pro authentication (<code className="text-sky-600 font-mono">login.vayusat.live</code>).
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
        <p className="text-xs font-mono text-slate-500">Redirecting to login.vayusat.live...</p>
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

const ClerkUserDisplay = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-slate-800 truncate">VAYU Officer</span>
          <span className="text-[10px] text-slate-500 truncate">Authenticated Session</span>
        </div>
      </div>
    );
  }

  const name = user.fullName || user.firstName || 'Meteorological Officer';
  const email = user.primaryEmailAddress?.emailAddress || 'officer@vayusat.live';

  return (
    <div className="flex items-center gap-3">
      {user.imageUrl ? (
        <img 
          src={user.imageUrl} 
          alt={name} 
          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" 
        />
      ) : (
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
          <User className="w-4 h-4 text-slate-500" />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-slate-800 truncate">{name}</span>
        <span className="text-[10px] text-slate-500 truncate">{email}</span>
      </div>
    </div>
  );
};

export const OfficerAccountDisplay = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-semibold text-slate-800 truncate">VAYU Officer</span>
          <span className="text-[10px] text-slate-500 truncate">Operational Session</span>
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
