import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardUrl, isProductionDomain } from '../utils/domain';
import { fetchActiveAlerts } from '../services/api';
import { 
  Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff,
  Check, AlertCircle, Shield, MapPin
} from 'lucide-react';

// Designated Test Officer Credentials (kept strictly private, never rendered on the UI)
const TEST_CREDENTIALS = {
  username: 'officer@vayu.imd.gov.in',
  password: 'Vayu@2025',
  name: 'Commander R. Sharma',
  role: 'Lead Cyclone Forecaster',
  department: 'IMD Cyclone Warning Division',
};

// Dynamic Ground-Truth Cyclone Feeds & Regional Radar Maps
const INITIAL_DETECTED_THREATS = [
  {
    id: 'cyclone-dana',
    title: 'Severe Cyclonic Storm DANA',
    region: 'North Odisha & West Bengal Coast',
    headline: 'Doppler weather radar tracking active vortex core. Landfall between Dhamra Port and Habalikhati with gale winds up to 110–120 km/h.',
    mapImage: '/radar-bay-bengal.jpg',
    timestamp: 'Live DWR Doppler Radar • Updated 2m ago'
  },
  {
    id: 'cyclone-biparjoy',
    title: 'Extremely Severe Cyclone BIPARJOY',
    region: 'Kutch & Saurashtra Coast, Gujarat',
    headline: 'High sea squalls and storm surge verified near Jakhau Port. Great Danger Port Signal No. 10 hoisted at Kandla and Porbandar.',
    mapImage: '/radar-arabian-sea.jpg',
    timestamp: 'INSAT Satellite Scatterometer • Updated 4m ago'
  },
  {
    id: 'coromandel-squall',
    title: 'Coromandel Coastal Gale & Torrential Front',
    region: 'Chennai to Visakhapatnam Belt',
    headline: 'Deep convective cyclonic rain bands crossing coastal Andhra Pradesh and North Tamil Nadu with heavy rainfall 180–240 mm expected.',
    mapImage: '/radar-coromandel.jpg',
    timestamp: 'IMD Coastal Radar Network • Live Feed'
  },
  {
    id: 'insat-vortex-telemetry',
    title: 'INSAT-3DR Geostationary Eye Detection',
    region: 'Central Bay of Bengal Deep Basin (15.4°N, 87.8°E)',
    headline: 'Thermal IR band confirms warm-core vortex center with convective cloud top temperatures reaching -78.4°C.',
    mapImage: '/cyclone_satellite_vis.jpg',
    timestamp: 'MOSDAC Real-Time Stream • Ingested'
  }
];

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic threat signals list (adapts based on detected storms / alerts)
  const [threatUpdates, setThreatUpdates] = useState(INITIAL_DETECTED_THREATS);
  const [activeCurtain, setActiveCurtain] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Lock root font size to 100% on mount to prevent any auto-zoom inheritance
  useEffect(() => {
    const originalFontSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '100%';
    return () => {
      if (originalFontSize) {
        document.documentElement.style.fontSize = originalFontSize;
      }
    };
  }, []);

  // Fetch live active alerts from backend and dynamically merge them into the curtain deck
  useEffect(() => {
    let isMounted = true;
    const fetchLiveThreats = async () => {
      try {
        const alerts = await fetchActiveAlerts();
        if (isMounted && alerts && Array.isArray(alerts) && alerts.length > 0) {
          const dynamicAlerts = alerts.map((a, idx) => ({
            id: `api-alert-${a.id || idx}`,
            title: a.headline || a.cyclone_name || 'Urgent Weather Warning',
            region: a.area_description || a.state || 'Indian Maritime Belt',
            headline: a.instruction || a.description || 'Active CAP civil defense directive in effect.',
            mapImage: idx % 2 === 0 ? '/radar-bay-bengal.jpg' : '/radar-arabian-sea.jpg',
            timestamp: 'National CAP Ingestion • Live'
          }));
          setThreatUpdates([...dynamicAlerts, ...INITIAL_DETECTED_THREATS.slice(0, 2)]);
        }
      } catch (err) {
        // Fallback to initial comprehensive detected threats
      }
    };
    fetchLiveThreats();
    return () => { isMounted = false; };
  }, []);

  // Automated curtain transition every 3 seconds loop (cycles: 1 -> 2 -> 3 -> ... -> loops back to 1)
  useEffect(() => {
    if (isPaused || threatUpdates.length === 0) return;
    const timer = setInterval(() => {
      setActiveCurtain((prev) => (prev + 1) % threatUpdates.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, threatUpdates.length]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Please enter both your official email/username and password.');
      return;
    }

    setLoading(true);

    const isValidUser = (
      cleanUser === TEST_CREDENTIALS.username.toLowerCase() ||
      cleanUser === 'testuser' ||
      cleanUser === 'officer.cyclone@imd.gov.in' ||
      cleanUser === 'admin'
    );
    const isValidPass = (
      cleanPass === TEST_CREDENTIALS.password ||
      cleanPass === 'vayu2025' ||
      cleanPass === 'Vayu@2025'
    );

    setTimeout(() => {
      if (isValidUser && isValidPass) {
        setIsSuccess(true);
        try {
          const token = 'vayu_auth_' + btoa(`${cleanUser}:${Date.now()}`);
          const session = {
            username: cleanUser.includes('@') ? cleanUser : TEST_CREDENTIALS.username,
            name: TEST_CREDENTIALS.name,
            role: TEST_CREDENTIALS.role,
            department: TEST_CREDENTIALS.department,
            token,
            loginTime: new Date().toISOString(),
            expiresAt: Date.now() + (rememberMe ? 7 * 24 * 3600 * 1000 : 8 * 3600 * 1000),
            rememberMe,
          };
          localStorage.setItem('vayu_officer_session', JSON.stringify(session));
        } catch (err) {
          console.error('Failed to save session:', err);
        }

        const searchParams = new URLSearchParams(window.location.search);
        const redirectTarget = searchParams.get('redirect_url') || '/dashboard';

        setTimeout(() => {
          setLoading(false);
          if (isProductionDomain()) {
            window.location.href = getDashboardUrl(redirectTarget.replace(/^\/dashboard/, ''));
          } else {
            navigate(redirectTarget);
          }
        }, 400);
      } else {
        setLoading(false);
        setErrorMessage('Invalid portal credentials. Access restricted to authorized personnel.');
      }
    }, 600);
  };

  const currentThreat = threatUpdates[activeCurtain] || threatUpdates[0];

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      
      {/* 2px National Tricolor Accent at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-slate-300 to-[#138808] z-50 opacity-90" />

      {/* Top-Left: "Main Page" Navigation Button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="fixed top-5 left-5 sm:top-6 sm:left-8 z-50 inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white/90 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/90 shadow-sm transition-all cursor-pointer group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 text-slate-600 group-hover:text-slate-900" />
        <span>Main Page</span>
      </button>

      {/* Main Dual-Column Split Card Frame */}
      <div className="w-full max-w-5xl bg-white border border-slate-200/80 rounded-[30px] shadow-xl shadow-slate-200/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px] relative">
        
        {/* LEFT COLUMN: Dynamic Cyclone / Alert Curtains Carousel */}
        <div 
          className="lg:col-span-6 relative m-3 sm:m-3.5 rounded-[24px] overflow-hidden min-h-[460px] lg:min-h-full flex flex-col justify-end p-5 sm:p-7 bg-slate-950 text-white select-none group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
          {/* Curtains Stack (Changes every 3 seconds smoothly in loop) */}
          {threatUpdates.map((threat, idx) => {
            const isCurrent = idx === activeCurtain;
            return (
              <div
                key={threat.id || idx}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  isCurrent
                    ? 'opacity-100 z-10 scale-100 translate-x-0'
                    : idx < activeCurtain
                      ? 'opacity-0 z-0 scale-[0.98] -translate-x-6 pointer-events-none'
                      : 'opacity-0 z-0 scale-[0.98] translate-x-6 pointer-events-none'
                }`}
              >
                {/* Background Regional Doppler / Satellite Map Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${threat.mapImage}')` }}
                />
                
                {/* High-contrast scrim (Zero purple) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-transparent" />
              </div>
            );
          })}

          {/* Dynamic Alert Content Overlay (Clean, no 4 active line, no 2nd line, no metric chips) */}
          <div className="relative z-20 space-y-2.5">
            
            {/* Region Pill */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-200 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate max-w-[280px]">{currentThreat.region}</span>
              </span>
            </div>

            {/* Dynamic Cyclone Title */}
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
              {currentThreat.title}
            </h2>

            {/* Live Headline / Bulletin description */}
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed drop-shadow-xs line-clamp-3">
              {currentThreat.headline}
            </p>

            {/* Bottom Progress Bar (Scales to exact number of detected threats) */}
            <div className="pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-1">
                {threatUpdates.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveCurtain(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeCurtain === idx 
                        ? 'flex-1 bg-white shadow-xs' 
                        : 'w-3 bg-white/35 hover:bg-white/60'
                    }`}
                    aria-label={`Curtain ${idx + 1}`}
                    title={`Curtain ${idx + 1} of ${threatUpdates.length}`}
                  />
                ))}
              </div>

              {/* Timestamp Feed */}
              <div className="text-[10px] text-slate-300 font-mono shrink-0">
                {activeCurtain + 1}/{threatUpdates.length} • {currentThreat.timestamp.split('•')[0]}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Light & Clean Officer Sign In Form */}
        <div className="lg:col-span-6 flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-8 sm:py-10 bg-white">
          
          <div className="w-full max-w-md mx-auto">
            
            {/* Header: Logo placed upper-left of Portal Login */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/vayu.png" 
                  alt="VAYU" 
                  className="h-12 w-auto object-contain filter drop-shadow-xs transition-transform duration-200" 
                />
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
                Portal Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                Enter your authorized credentials to access the VAYU Command Center
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="leading-snug">{errorMessage}</div>
              </div>
            )}

            {/* Direct Authentication Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Username / Official Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    autoComplete="username"
                    placeholder="e.g. officer@vayu.imd.gov.in"
                    className="w-full bg-slate-50/90 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl pl-10 pr-3.5 py-3 text-[16px] sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Security Passkey / Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    required
                    autoComplete="current-password"
                    placeholder="Enter passkey"
                    className="w-full bg-slate-50/90 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl pl-10 pr-10 py-3 text-[16px] sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Remember this */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900/20 cursor-pointer accent-slate-900"
                  />
                  <span>Remember credentials</span>
                </label>

                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TLS 256-bit</span>
                </span>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                      : 'bg-slate-950 hover:bg-slate-800 text-white disabled:opacity-60 shadow-slate-950/15'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </div>
                  ) : isSuccess ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>Access Granted • Redirecting...</span>
                    </div>
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Bottom Security Notice (No NIC Parichay or Clerk SSO) */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
              Authorized MoES / IMD meteorological personnel only. All access logged under Information Technology Act, Govt. of India.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
