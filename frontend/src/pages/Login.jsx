import React, { useEffect, useRef, useMemo } from 'react';
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
   ATMOSPHERIC BACKGROUND — Right Panel Visual
   CSS-animated cyclone vortex, wind-flow lines, particles & location markers
   ═══════════════════════════════════════════════════════════════════════════ */

const AtmosphericBackground = () => {
  const canvasRef = useRef(null);

  // Particle system for subtle floating atmosphere
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.3) * 0.4,
      vy: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    // Wind flow curves
    const windLines = Array.from({ length: 12 }, () => ({
      startX: Math.random() * 2000,
      startY: Math.random() * 2000,
      length: Math.random() * 200 + 100,
      angle: (Math.random() - 0.3) * Math.PI * 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.12 + 0.03,
      offset: Math.random() * 1000,
    }));

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);

      // Draw wind flow lines
      windLines.forEach((wl) => {
        const progress = ((t * wl.speed * 0.001 + wl.offset) % (w + wl.length * 2)) - wl.length;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(147, 220, 255, ${wl.opacity})`;
        ctx.lineWidth = 0.8;
        const cx1 = progress + wl.length * 0.33;
        const cy1 = wl.startY * (h / 2000) + Math.sin(t * 0.0005 + wl.offset) * 20;
        const cx2 = progress + wl.length * 0.66;
        const cy2 = wl.startY * (h / 2000) - Math.sin(t * 0.0004 + wl.offset) * 15;
        ctx.moveTo(progress, wl.startY * (h / 2000));
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, progress + wl.length, wl.startY * (h / 2000) + Math.sin(wl.angle) * 30);
        ctx.stroke();
      });

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > w + 10) p.x = -10;
        if (p.x < -10) p.x = w + 10;
        if (p.y > h + 10) p.y = -10;
        if (p.y < -10) p.y = h + 10;

        ctx.beginPath();
        ctx.arc(p.x * (w / 2000), p.y * (h / 2000), p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 230, 255, ${p.opacity})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Location marker data for Indian Ocean region
  const markers = useMemo(() => [
    { x: '42%', y: '35%', label: 'Mumbai', delay: '0s' },
    { x: '65%', y: '42%', label: 'Chennai', delay: '0.6s' },
    { x: '50%', y: '55%', label: 'Bay of Bengal', delay: '1.2s' },
    { x: '30%', y: '60%', label: 'Arabian Sea', delay: '1.8s' },
    { x: '75%', y: '30%', label: 'Kolkata', delay: '2.4s' },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep atmospheric gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020B18] via-[#0A1628] to-[#041225]" />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,200,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,200,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ocean showcase image blend */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-luminosity"
        style={{
          backgroundImage: 'url(/login-showcase-ocean.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Animated cyclone vortex — pure CSS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Outer ring */}
        <div
          className="absolute -inset-40 rounded-full border border-cyan-400/10"
          style={{ animation: 'login-vortex-spin 35s linear infinite' }}
        />
        {/* Mid ring */}
        <div
          className="absolute -inset-28 rounded-full border border-cyan-300/15"
          style={{ animation: 'login-vortex-spin 25s linear infinite reverse' }}
        />
        {/* Inner ring */}
        <div
          className="absolute -inset-16 rounded-full border border-sky-400/20"
          style={{ animation: 'login-vortex-spin 18s linear infinite' }}
        />
        {/* Core glow */}
        <div className="w-4 h-4 rounded-full bg-cyan-400/30 blur-sm" style={{ animation: 'login-core-pulse 4s ease-in-out infinite' }} />
        {/* Diffuse glow behind vortex */}
        <div
          className="absolute -inset-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)',
            animation: 'login-core-pulse 5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Canvas: particles & wind lines */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Glowing location markers */}
      {markers.map((m) => (
        <div
          key={m.label}
          className="absolute flex flex-col items-center"
          style={{ left: m.x, top: m.y, animationDelay: m.delay }}
        >
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" style={{ animation: 'login-marker-pulse 3s ease-in-out infinite', animationDelay: m.delay }} />
            <div className="absolute -inset-1 rounded-full bg-cyan-400/20" style={{ animation: 'login-marker-ring 3s ease-in-out infinite', animationDelay: m.delay }} />
          </div>
          <span className="mt-1.5 text-[9px] font-mono text-cyan-300/50 tracking-wider whitespace-nowrap">{m.label}</span>
        </div>
      ))}

      {/* Atmospheric radial glow accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/4 rounded-full blur-3xl" />

      {/* VAYU Intelligence info overlay — bottom */}
      <div className="absolute bottom-8 left-8 right-8 z-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-600" />
            <span className="text-xs font-semibold text-cyan-300/80 tracking-widest uppercase font-mono">
              Vayu Intelligence
            </span>
          </div>
          <p className="text-[11px] text-slate-400/60 font-mono leading-relaxed max-w-xs">
            AI-Powered Cyclone Tracking • Satellite Intelligence • Real-time Storm Analytics for the Indian Ocean Region
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400/70 font-mono">Systems Online</span>
            </div>
            <span className="text-slate-600 text-[10px]">•</span>
            <span className="text-[10px] text-slate-500/50 font-mono">Bay of Bengal • Arabian Sea</span>
          </div>
        </div>
      </div>
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
              <span>Back to Public Atlas</span>
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

      {/* ═══════════ CSS KEYFRAMES ═══════════ */}
      <style>{`
        @keyframes login-vortex-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes login-core-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.15); }
        }
        @keyframes login-marker-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes login-marker-ring {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0; transform: scale(2.2); }
        }
      `}</style>
    </div>
  );
};

export default Login;
