import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, ArrowRight, ShieldCheck, CheckCircle2, Satellite, Activity } from 'lucide-react';

const SYSTEMS_CHECK = [
  { label: 'INSAT-3DR Multi-Spectral Radiometer', status: 'Active (4.0km IR)', ok: true },
  { label: 'MOSDAC Real-Time Geostationary Feed', status: 'Connected (45ms latency)', ok: true },
  { label: 'CycloneVision-CNN v2.1 Inference Engine', status: 'PyTorch Model Loaded', ok: true },
  { label: 'CycloneForecast-LSTM Spatiotemporal Model', status: 'Calibrated (15yr Archive)', ok: true },
];

const LoadingScreen = () => {
  const [progress, setProgress] = useState(15);
  const [activeCheckIdx, setActiveCheckIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('/landing'), 400);
          return 100;
        }
        return prev + 17;
      });
    }, 280);

    const checkTimer = setInterval(() => {
      setActiveCheckIdx((prev) => (prev < SYSTEMS_CHECK.length - 1 ? prev + 1 : prev));
    }, 450);

    return () => {
      clearInterval(timer);
      clearInterval(checkTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans relative overflow-hidden select-none">
      
      {/* National Tricolor Top Accent Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Official Government Portal Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#003087] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              GOI
            </div>
            <div>
              <p className="text-xs font-bold text-[#003087] tracking-tight">Government of India</p>
              <p className="text-[11px] text-slate-500">Ministry of Earth Sciences (MoES) • India Meteorological Department</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
              Smart India Hackathon 2026 Finalist Prototype
            </span>
          </div>
        </div>
      </header>

      {/* Central Institutional Portal Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-xl w-full p-8 space-y-6">
          
          {/* Platform Identity */}
          <div className="flex items-start gap-4 border-b border-slate-100 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#003087] flex items-center justify-center text-white shadow-md shadow-blue-900/20 flex-shrink-0">
              <Wind className="w-8 h-8" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#003087] tracking-tight">Cyclone<span className="text-amber-600">AI</span></h1>
                <span className="text-[10px] font-bold bg-blue-50 text-[#003087] border border-blue-200 px-2 py-0.5 rounded">
                  v2.1 Enterprise
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700">
                National Tropical Cyclone Monitoring, Classification & Prediction Gateway
              </p>
              <p className="text-[11px] text-slate-400">
                Regional Specialized Meteorological Centre (RSMC) Standard • SIH 2026
              </p>
            </div>
          </div>

          {/* Progress Bar & Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#003087] animate-pulse" />
                Initializing Multi-Source Telemetry Feeds...
              </span>
              <span className="font-bold text-[#003087]">{progress}%</span>
            </div>
            
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="h-full bg-gradient-to-r from-[#003087] to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Real Diagnostic Checks List */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Diagnostic Telemetry Verification
            </p>
            
            <div className="space-y-2 text-xs">
              {SYSTEMS_CHECK.map((check, idx) => {
                const isChecked = idx <= activeCheckIdx;
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={`font-medium transition-colors ${isChecked ? 'text-slate-800' : 'text-slate-400'}`}>
                      {check.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium">
                      {isChecked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">{check.status}</span>
                        </>
                      ) : (
                        <span className="text-slate-300">Pending...</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skip / Instant Access Button */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">Secure IMD / MoES AI Architecture</span>
            <button
              onClick={() => navigate('/landing')}
              className="btn-primary text-xs py-2 px-4 gap-1.5 shadow-xs"
            >
              <span>Enter Portal Directly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </main>

      {/* Official Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500">
        <p className="max-w-4xl mx-auto text-[11px] text-slate-400">
          © 2026 CycloneAI — Smart India Hackathon Prototype | Ministry of Earth Sciences, Government of India | IMD RSMC Gateway
        </p>
      </footer>

    </div>
  );
};

export default LoadingScreen;
