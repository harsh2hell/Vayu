import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  SignIn, 
  useUser 
} from '@clerk/clerk-react';
import { Shield, ArrowLeft } from 'lucide-react';
import { getDashboardUrl, getWebsiteUrl } from '../utils/domain';
import { CLERK_PUBLISHABLE_KEY, AuthConfigurationNotice } from '../components/auth/ClerkAuth';

const clerkAppearance = {
  variables: {
    colorPrimary: '#0284c7', // Sky-600
    colorBackground: '#ffffff',
    colorText: '#0f172a', // Slate-900
    colorTextSecondary: '#64748b', // Slate-500
    colorInputBackground: '#ffffff',
    colorInputText: '#0f172a',
    colorNeutral: '#0f172a',
    borderRadius: '0.875rem',
  },
  elements: {
    rootBox: 'w-full',
    card: 'bg-white shadow-xl border border-slate-200/90 rounded-2xl p-6 sm:p-8',
    headerTitle: 'text-slate-900 font-bold text-xl font-heading text-center tracking-tight',
    headerSubtitle: 'text-slate-500 text-xs text-center mt-1 leading-relaxed',
    socialButtonsBlockButton: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5 shadow-2xs transition-all',
    socialButtonsBlockButtonText: 'text-slate-700 font-medium text-xs',
    formButtonPrimary: 'bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 shadow-xs transition-all cursor-pointer',
    formFieldInput: 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-xs py-2.5 shadow-2xs',
    formFieldLabel: 'text-slate-700 text-xs font-medium mb-1',
    footerActionLink: 'text-sky-600 hover:text-sky-700 text-xs font-semibold transition-colors',
    footerActionText: 'text-slate-500 text-xs',
    identityPreviewText: 'text-slate-800 text-xs font-medium',
    identityPreviewEditButton: 'text-sky-600 hover:text-sky-700 text-xs font-semibold',
    dividerLine: 'bg-slate-200',
    dividerText: 'text-slate-400 text-[11px] font-mono uppercase tracking-wider',
    footer: 'border-t border-slate-100 mt-4 pt-4'
  }
};

/**
 * Inner component that uses Clerk hooks.
 * Only mounted when CLERK_PUBLISHABLE_KEY is present and ClerkProvider is active.
 */
const ClerkSignInSection = ({ redirectTarget }) => {
  const { isSignedIn, isLoaded } = useUser();

  // If already authenticated, redirect smoothly using window.location.replace
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.replace(redirectTarget);
    }
  }, [isLoaded, isSignedIn, redirectTarget]);

  // While checking existing session status, show a clean spinner
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-md">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  // If user is already signed in, show confirmation while redirect completes
  if (isSignedIn) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xl text-center space-y-3 w-full max-w-md">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <Shield className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Authenticated</p>
        <p className="text-xs text-slate-500 font-mono">Redirecting to Command Dashboard...</p>
      </div>
    );
  }

  // Not signed in: render Clerk SignIn form
  return (
    <div className="flex justify-center w-full">
      <SignIn
        appearance={clerkAppearance}
        fallbackRedirectUrl={redirectTarget}
        signUpUrl={null}
      />
    </div>
  );
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect_url') || getDashboardUrl();

  // If publishable key is not configured in Vercel, render notice without invoking Clerk hooks
  if (!CLERK_PUBLISHABLE_KEY) {
    return <AuthConfigurationNotice />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* 2px National Tricolor Stripe */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 to-[#138808] z-50" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a
          href={getWebsiteUrl()}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Atlas</span>
        </a>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Secure Operations Gateway</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Card Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md space-y-4">
          
          {/* VAYU Identity Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center h-14 mb-0.5">
              <img 
                src="/vayu.png" 
                alt="VAYU Cyclone Intelligence" 
                className="h-13 sm:h-14 w-auto object-contain filter drop-shadow-xs"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
              Command Center Access
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Official Meteorological Intelligence Portal • Ministry of Earth Sciences
            </p>
          </div>

          {/* Official Clerk SignIn Component */}
          <ClerkSignInSection redirectTarget={redirectTarget} />

          {/* Clean Provenance Note */}
          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400 font-mono">
              VAYU AI Meteorological Platform • Authorized Duty Officer Gateway
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-slate-400 font-mono">
        Early Warning Intelligence Platform • vayusat.live
      </footer>
    </div>
  );
};

export default Login;
