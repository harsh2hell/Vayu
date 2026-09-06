import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  SignIn, 
  SignedIn, 
  SignedOut, 
  useUser 
} from '@clerk/clerk-react';
import { Shield, ArrowLeft, Radio } from 'lucide-react';
import { getDashboardUrl, getWebsiteUrl } from '../utils/domain';
import { CLERK_PUBLISHABLE_KEY, AuthConfigurationNotice } from '../components/auth/ClerkAuth';

const clerkAppearance = {
  variables: {
    colorPrimary: '#0284c7',
    colorBackground: '#0f172a',
    colorText: '#f8fafc',
    colorTextSecondary: '#94a3b8',
    colorInputBackground: '#020617',
    colorInputText: '#ffffff',
    borderRadius: '0.75rem',
  },
  elements: {
    card: 'bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8',
    headerTitle: 'text-white font-bold text-lg font-heading',
    headerSubtitle: 'text-slate-400 text-xs',
    socialButtonsBlockButton: 'border border-slate-800 bg-slate-950/70 hover:bg-slate-800 text-slate-200 text-xs',
    formButtonPrimary: 'bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs py-2.5 transition-all shadow-md',
    formFieldInput: 'bg-slate-950 border border-slate-800 text-white focus:border-sky-500 rounded-xl text-xs py-2.5',
    formFieldLabel: 'text-slate-300 text-xs font-medium',
    footerActionLink: 'text-sky-400 hover:text-sky-300 text-xs font-medium',
    identityPreviewText: 'text-slate-200 text-xs',
    identityPreviewEditButton: 'text-sky-400 text-xs',
    dividerLine: 'bg-slate-800',
    dividerText: 'text-slate-500 text-[11px]'
  }
};

/**
 * Inner component that uses Clerk hooks.
 * Only mounted when CLERK_PUBLISHABLE_KEY is present and ClerkProvider is active.
 */
const ClerkSignInSection = ({ redirectTarget }) => {
  const { isSignedIn, isLoaded } = useUser();

  // If already authenticated, redirect directly into the dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.href = redirectTarget;
    }
  }, [isLoaded, isSignedIn, redirectTarget]);

  return (
    <div className="flex justify-center">
      <SignedIn>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-300">Authenticated. Redirecting to Command Dashboard...</p>
        </div>
      </SignedIn>

      <SignedOut>
        <SignIn
          appearance={clerkAppearance}
          fallbackRedirectUrl={redirectTarget}
          signUpUrl={null}
        />
      </SignedOut>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a
          href={getWebsiteUrl()}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to VAYU Public Atlas</span>
        </a>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>login.vayusat.live</span>
          </span>
        </div>
      </header>

      {/* Main Authentication Card Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-5">
          
          {/* VAYU Identity Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-12 mb-1">
              <img 
                src="/vayu.png" 
                alt="VAYU Cyclone Intelligence" 
                className="h-10 w-auto object-contain filter drop-shadow"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">
              Command Center Access
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Sign in with your verified meteorological credentials to access real-time AI satellite diagnostics, GRU trajectory forecasts, and early warning advisories.
            </p>
          </div>

          {/* Official Clerk SignIn Component (Only mounted if ClerkProvider active) */}
          <ClerkSignInSection redirectTarget={redirectTarget} />

          {/* Clean Provenance Note */}
          <div className="text-center">
            <p className="text-[11px] text-slate-500 font-mono">
              VAYU AI Meteorological Platform • Clerk Pro Authentication Gateway
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-[10px] text-slate-600 font-mono">
        Official Early Warning Intelligence Platform • vayusat.live
      </footer>
    </div>
  );
};

export default Login;
