import React from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignIn, 
  UserButton, 
  useUser, 
  useClerk 
} from '@clerk/clerk-react';
import { Shield, ArrowRight, User } from 'lucide-react';
import { getAuthUrl, isProductionDomain, getWebsiteUrl } from '../../utils/domain';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

/**
 * Protected Route Wrapper
 * If Clerk key is configured:
 *  - Signed in: renders children
 *  - Signed out: prompts authentication via Clerk Pro custom domain auth.autonex.studio
 * If Clerk key is not yet configured:
 *  - Renders children in Demo Mode with setup notification banner
 */
export const ProtectedRoute = ({ children }) => {
  if (!CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <AuthGateFallback />
      </SignedOut>
    </>
  );
};

/**
 * Modern login gate when user lands on dashboard unauthenticated
 */
export const AuthGateFallback = () => {
  const authUrl = getAuthUrl();

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center p-4">
      {/* 2px National Tricolor Stripe */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="h-14 flex items-center justify-center mx-auto mb-3">
            <img 
              src="/vayu.png" 
              alt="VAYU" 
              className="h-12 w-auto object-contain filter drop-shadow-xs" 
            />
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 mb-2">
            <Shield className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Restricted Officer Portal</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Authentication Required
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access to <code className="text-sky-600 font-mono">dept.autonex.studio</code> requires meteorological officer credentials via Clerk Pro.
          </p>
        </div>

        {/* Clerk Sign In CTA */}
        <div className="flex flex-col gap-3">
          <a
            href={authUrl}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span>Sign In via auth.autonex.studio</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href={getWebsiteUrl()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Back to Public Atlas</span>
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400">
            Powered by Clerk Pro Custom Domain SSO • auth.autonex.studio
          </span>
        </div>
      </div>
    </div>
  );
};

// Internal component to display user identity when ClerkProvider is active
const ClerkUserDisplay = () => {
  const { user } = useUser();
  const name = user?.fullName || user?.firstName || 'IMD Officer';
  const email = user?.primaryEmailAddress?.emailAddress || 'officer.cyclone@imd.gov.in';

  return (
    <div className="flex items-center gap-3">
      {user?.imageUrl ? (
        <img src={user.imageUrl} alt={name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
          <User className="w-4 h-4 text-slate-600" />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-slate-900 truncate">{name}</span>
        <span className="text-[10px] text-slate-500 truncate">{email}</span>
      </div>
    </div>
  );
};

// Safe Account identity component (uses Clerk user if configured, otherwise fallback)
export const OfficerAccountDisplay = () => {
  if (CLERK_PUBLISHABLE_KEY) {
    return <ClerkUserDisplay />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
        <User className="w-4 h-4 text-slate-600" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-slate-900 truncate">IMD Officer</span>
        <span className="text-[10px] text-slate-500 truncate">officer.cyclone@imd.gov.in</span>
      </div>
    </div>
  );
};

// Internal sign out handler when Clerk is active
const ClerkSignOutButton = ({ onSignOutComplete, className, children }) => {
  const { signOut } = useClerk();
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await signOut();
        } catch (e) {
          console.error(e);
        }
        onSignOutComplete();
      }}
      className={className}
    >
      {children}
    </button>
  );
};

export const SafeSignOutButton = ({ onSignOutComplete, className, children }) => {
  if (CLERK_PUBLISHABLE_KEY) {
    return (
      <ClerkSignOutButton onSignOutComplete={onSignOutComplete} className={className}>
        {children}
      </ClerkSignOutButton>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        onSignOutComplete();
      }}
      className={className}
    >
      {children}
    </button>
  );
};
