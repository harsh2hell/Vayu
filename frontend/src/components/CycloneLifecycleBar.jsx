import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, ShieldAlert } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export const CYCLONE_STAGES = [
  { id: 'LPA', name: 'Low Pressure', nameHindi: 'निम्न दबाव', minWind: 0, maxWind: 30, color: 'sky' },
  { id: 'D', name: 'Depression', nameHindi: 'अवसाद', minWind: 31, maxWind: 49, color: 'blue' },
  { id: 'DD', name: 'Deep Depression', nameHindi: 'गहरा अवसाद', minWind: 50, maxWind: 61, color: 'amber' },
  { id: 'CS', name: 'Cyclonic Storm', nameHindi: 'चक्रवाती तूफान', minWind: 62, maxWind: 88, color: 'orange' },
  { id: 'SCS', name: 'Severe Cyclone', nameHindi: 'भीषण चक्रवात', minWind: 89, maxWind: 117, color: 'rose' },
  { id: 'VSCS', name: 'Very Severe Cyclone', nameHindi: 'अति भीषण चक्रवात', minWind: 118, maxWind: 220, color: 'red' }
];

export function classifyStage(windKmh) {
  const w = parseFloat(windKmh) || 0;
  if (w <= 30) return 0;
  if (w <= 49) return 1;
  if (w <= 61) return 2;
  if (w <= 88) return 3;
  if (w <= 117) return 4;
  return 5;
}

/**
 * CycloneLifecycleBar
 * Displays:
 * 1. Progress steps: Low Pressure → Depression → Deep Depression → Cyclonic Storm → Severe Cyclonic Storm → Very Severe Cyclonic Storm
 * 2. Active highlighted classification
 * 3. Strengthening / Weakening / Stable trend indicator
 * 4. Actual calculated deltas (Wind ↑/↓ and Pressure ↓/↑) from available telemetry
 */
export default function CycloneLifecycleBar({
  currentWind = 42,
  currentPressure = 1004,
  prevWind = null,
  prevPressure = null,
  trendIntervalHours = 6,
  isForecastTrend = false,
  isHindi = false,
  className = ''
}) {
  const windNum = parseFloat(currentWind) || 0;
  const pressNum = parseFloat(currentPressure) || 1000;
  const currentStageIndex = classifyStage(windNum);
  const activeStage = CYCLONE_STAGES[currentStageIndex];

  // Calculate actual observed or forecast delta if historical/waypoint data is provided
  let windDelta = 0;
  let pressureDelta = 0;
  let hasDelta = false;

  if (prevWind !== null && prevWind !== undefined) {
    windDelta = windNum - parseFloat(prevWind);
    hasDelta = true;
  }
  if (prevPressure !== null && prevPressure !== undefined) {
    pressureDelta = pressNum - parseFloat(prevPressure);
    hasDelta = true;
  }

  // Determine trend status
  let trendType = 'STABLE'; // 'STRENGTHENING' | 'WEAKENING' | 'STABLE'
  if (hasDelta) {
    if (windDelta > 2 || pressureDelta < -1) {
      trendType = 'STRENGTHENING';
    } else if (windDelta < -2 || pressureDelta > 1) {
      trendType = 'WEAKENING';
    }
  } else {
    // If no past fix provided, evaluate default stage characteristic
    trendType = windNum > 60 ? 'STRENGTHENING' : 'STABLE';
  }

  const TREND_CONFIG = {
    STRENGTHENING: {
      label: isHindi ? 'तीव्र हो रहा है (Strengthening)' : 'Strengthening (Intensifying)',
      color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60',
      icon: TrendingUp
    },
    WEAKENING: {
      label: isHindi ? 'क्षीण हो रहा है (Weakening)' : 'Weakening (Dissipating)',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60',
      icon: TrendingDown
    },
    STABLE: {
      label: isHindi ? 'स्थिर अवस्था (Stable)' : 'Stable (Steady State)',
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900/60',
      icon: Minus
    }
  };

  const currentTrend = TREND_CONFIG[trendType];
  const TrendIcon = currentTrend.icon;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3.5 ${className}`}>
      
      {/* Top Header Row: Stage Badge + Trend and Change Deltas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="font-heading font-black text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {isHindi ? 'चक्रवात विकास चरण एवं प्रवृत्ति' : 'Cyclone Development Stage & Trend'}
            </span>
          </div>
          <InfoTooltip
            title={isHindi ? 'आईएमडी चक्रवात वर्गीकरण' : 'IMD Cyclone Intensity Lifecycle'}
            text={isHindi
              ? 'भारतीय मौसम विज्ञान विभाग (IMD) 3-मिनट की निरंतर हवा की गति के आधार पर चक्रवातों को 6 मुख्य श्रेणियों में वर्गीकृत करता है।'
              : 'The India Meteorological Department (IMD) categorizes tropical disturbances into 6 distinct stages based on sustained wind velocity.'}
            impact={isHindi ? 'आपदा प्रबंधन और चेतावनी स्तर इसी वर्गीकरण पर आधारित हैं।' : 'Directly triggers coastal evacuation thresholds.'}
            isHindi={isHindi}
          />
        </div>

        {/* Dynamic Trend Indicator Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${currentTrend.color}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{currentTrend.label}</span>
          </div>

          {/* Genuine Telemetry Change Badge (if delta available) */}
          {hasDelta && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500 font-sans">
                {isForecastTrend 
                  ? (isHindi ? `अनुमानित ${trendIntervalHours}h:` : `Forecast ${trendIntervalHours}h:`) 
                  : (isHindi ? `पिछले ${trendIntervalHours}h:` : `Past ${trendIntervalHours}h:`)}
              </span>
              <span className={`font-bold ${windDelta >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Wind {windDelta >= 0 ? `↑ ${windDelta.toFixed(0)}` : `↓ ${Math.abs(windDelta).toFixed(0)}`} km/h
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className={`font-bold ${pressureDelta <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Press {pressureDelta <= 0 ? `↓ ${Math.abs(pressureDelta).toFixed(0)}` : `↑ ${pressureDelta.toFixed(0)}`} hPa
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Stepper: Low Pressure → Depression → Deep Depression → Cyclonic Storm → Severe Cyclonic Storm → Very Severe Cyclonic Storm */}
      <div className="relative pt-2 pb-1">
        
        {/* Connecting track line */}
        <div className="hidden md:block absolute top-[28px] left-6 right-6 h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 transition-all duration-500"
            style={{ width: `${(currentStageIndex / (CYCLONE_STAGES.length - 1)) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 relative z-10">
          {CYCLONE_STAGES.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isPast = idx < currentStageIndex;
            const isFuture = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center text-center p-2.5 rounded-2xl transition-all border ${
                  isCurrent
                    ? 'bg-white dark:bg-slate-900 border-rose-500 dark:border-rose-500 shadow-md ring-2 ring-rose-500/20 scale-[1.03]'
                    : isPast
                    ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-90'
                    : 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/60 opacity-60'
                }`}
              >
                {/* Step Circle Pin */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all mb-1.5 shadow-xs ${
                    isCurrent
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/20'
                      : isPast
                      ? 'bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Stage Title */}
                <span className={`text-[11px] font-bold leading-tight ${isCurrent ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-600 dark:text-slate-400'}`}>
                  {isHindi ? stage.nameHindi : stage.name}
                </span>

                {/* Wind Criteria */}
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                  {stage.minWind}–{stage.maxWind} km/h
                </span>

                {/* Current Stage Indicator Tag */}
                {isCurrent && (
                  <span className="mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-rose-600 text-white shadow-2xs animate-pulse">
                    CURRENT FIX
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Footnote Context */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5 font-sans">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {isHindi ? 'वर्तमान स्थिति:' : 'Active Status:'}
          </span>
          <span>
            {isHindi ? activeStage.nameHindi : activeStage.name} • {windNum} km/h ({pressNum} hPa)
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 font-mono">
          IMD SOP Bulletin Criteria &bull; Official Beaufort/IMD Standard
        </span>
      </div>

    </div>
  );
}
