import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Lock, Mail, KeyRound, ArrowRight, ArrowLeft,
  Building2, Satellite, Compass, CheckCircle2, Sparkles
} from 'lucide-react';

const DEPARTMENTS = [
  { id: 'imd', name: 'IMD Cyclone Warning Division', desc: 'Central Forecaster & Cyclone Tracking', icon: Compass },
  { id: 'isro', name: 'ISRO • MOSDAC', desc: 'Satellite Ingestion & Oceanography', icon: Satellite },
  { id: 'moes', name: 'Ministry of Earth Sciences', desc: 'National Scientific Directorate', icon: Building2 },
  { id: 'ndrf', name: 'NDRF & Disaster Management', desc: 'Emergency Operations & Siren Dispatch', icon: Shield },
];

const Login = () => {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState('imd');
  const [email, setEmail] = useState('officer.cyclone@imd.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [otp, setOtp] = useState('849201');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500">
      
      {/* 2px National Tricolor Stripe */}
      <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />

      {/* Top Apex Govt Bar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-medium text-slate-600 dark:text-slate-300">
              भारत सरकार • पृथ्वी विज्ञान मंत्रालय <span className="text-slate-300 dark:text-slate-600 mx-1">|</span> Government of India • Ministry of Earth Sciences
            </span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Atlas</span>
          </button>
        </div>
      </header>

      {/* Main Login Screen */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 dark:bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6 relative">
            <div className="h-14 flex items-center justify-center mx-auto mb-3">
              <img 
                src="/vayu.png" 
                alt="VAYU" 
                className="h-12 w-auto object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105" 
              />
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 mb-2">
              <Sparkles className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>MoES • IMD Gateway</span>
            </div>

            <h1 className="text-2xl font-heading font-bold tracking-tight text-slate-950 dark:text-white">
              Department Officer Gateway
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Restricted National Portal for Certified Meteorological Officers
            </p>
          </div>

          {/* Department Selection */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Agency / Directorate
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDept === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDept(dept.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-slate-950 dark:border-white bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white dark:text-slate-950' : 'text-slate-600 dark:text-slate-400'}`} />
                      <span className="text-xs font-bold truncate">{dept.name.split(' ')[0]}</span>
                    </div>
                    <span className={`text-[11px] leading-tight line-clamp-1 font-normal ${isSelected ? 'text-slate-200 dark:text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                      {dept.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Govt Email / NIC ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name.dept@gov.in"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Security Passkey / Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Parichay 2FA Token
                </label>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> NIC SSO Verified
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  placeholder="6-digit OTP"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-950 dark:focus:border-white focus:bg-white dark:focus:bg-slate-800 transition-all tracking-wider font-semibold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating with NIC Parichay SSO...</span>
                ) : (
                  <>
                    <span>Enter Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Authorized personnel only. Access logged under Information Technology Act, Govt. of India.
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;
