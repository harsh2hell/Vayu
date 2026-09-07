import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  SignIn, 
  SignUp,
  useUser 
} from '@clerk/clerk-react';
import { Shield, ArrowLeft } from 'lucide-react';
import { getDashboardUrl, getWebsiteUrl } from '../utils/domain';
import { CLERK_PUBLISHABLE_KEY, AuthConfigurationNotice } from '../components/auth/ClerkAuth';
import { clerkLightTheme } from '../utils/clerkTheme';

/* ═══════════════════════════════════════════════════════════════════════════
   ATMOSPHERIC BACKGROUND — Clean Satellite Image
   Displays the project theme cyclone satellite image without points, markers, or text
   ═══════════════════════════════════════════════════════════════════════════ */

const AtmosphericBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      <img
        src="/cyclone_satellite_vis.jpg"
        alt="VAYU Cyclone Satellite Intelligence"
        className="w-full h-full object-cover object-center select-none pointer-events-none"
      />
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   CLERK AUTH SECTION — Handles auth state, renders SignIn/SignUp
   ═══════════════════════════════════════════════════════════════════════════ */

const ClerkAuthSection = ({ redirectTarget, isSignUp = false }) => {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      window.location.replace(redirectTarget);
    }
  }, [isLoaded, isSignedIn, redirectTarget]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500">Checking authentication...</p>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
          <Shield className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-900">Authenticated</p>
        <p className="text-xs text-slate-500 font-mono">Redirecting to Command Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full">
      {isSignUp ? (
        <SignUp
          appearance={clerkLightTheme}
          fallbackRedirectUrl={redirectTarget}
          signInUrl="/login"
        />
      ) : (
        <SignIn
          appearance={clerkLightTheme}
          fallbackRedirectUrl={redirectTarget}
          signUpUrl="/sign-up"
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN PAGE — Premium Split-Screen Layout
   ═══════════════════════════════════════════════════════════════════════════ */

const Login = ({ initialMode }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectTarget = searchParams.get('redirect_url') || getDashboardUrl();
  const isSignUp = initialMode === 'signUp' || 
    location.pathname === '/sign-up' || 
    location.pathname === '/signup' || 
    searchParams.get('mode') === 'signup';

  if (!CLERK_PUBLISHABLE_KEY) {
    return <AuthConfigurationNotice />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative">
      {/* 2px National Tricolor Stripe */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 to-[#138808] z-50" />

      {/* ═══════════ MAIN CONTAINER — Elevated Card ═══════════ */}
      <div
        className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden flex flex-col lg:flex-row"
        style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.04), 0 6px 14px -2px rgba(0,0,0,0.06), 0 16px 40px -6px rgba(0,0,0,0.08), 0 30px 60px -10px rgba(0,0,0,0.06)',
          border: '1px solid rgba(226,232,240,0.55)',
          minHeight: 'min(640px, calc(100vh - 80px))',
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        {/* ═══════════ LEFT SECTION — Auth Form ═══════════ */}
        <div className="relative z-10 w-full lg:w-[440px] xl:w-[460px] flex flex-col bg-white">
          {/* Back navigation */}
          <header className="px-6 pt-5 pb-2 flex items-center justify-between shrink-0">
            <a
              href={getWebsiteUrl()}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Home</span>
            </a>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-50 border border-slate-200/80 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Secure
            </span>
          </header>

          {/* Main form area — centered */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-10 overflow-y-auto">
            <div className="w-full max-w-sm space-y-4">
              {/* Logo */}
              <div className="text-center mb-2">
                <div className="inline-flex items-center justify-center h-18 mb-1">
                  <img
                    src="/vayu.png"
                    alt="VAYU Cyclone Intelligence"
                    className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Clerk form */}
              <ClerkAuthSection redirectTarget={redirectTarget} isSignUp={isSignUp} />
            </div>
          </main>

          {/* Footer */}
          <footer className="px-6 py-3 text-center shrink-0">
            <p className="text-[10px] text-slate-400 font-mono">
              VAYU AI Meteorological Platform • vayusat.live
            </p>
          </footer>
        </div>

        {/* ═══════════ RIGHT SECTION — Atmospheric Visual ═══════════ */}
        <div className="hidden lg:block flex-1 relative">
          <AtmosphericBackground />
        </div>
      </div>
    </div>
  );
};

export default Login;
