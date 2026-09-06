import React from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldAlert, Check, Radio, Sparkles } from 'lucide-react';
import InfoTooltip from './InfoTooltip';

export const CYCLONE_STAGES = [
  { 
    id: 'LPA', 
    name: 'Low Pressure', 
    nameHindi: 'निम्न दबाव', 
    code: 'LPA',
    minWind: 0, 
    maxWind: 30, 
    accentColor: 'sky',
    topBar: 'bg-sky-400/80',
    windBadge: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40',
  },
  { 
    id: 'D', 
    name: 'Depression', 
    nameHindi: 'अवसाद', 
    code: 'D',
    minWind: 31, 
    maxWind: 49, 
    accentColor: 'rose',
    topBar: 'bg-rose-500',
    windBadge: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/40 font-bold',
  },
  { 
    id: 'DD', 
    name: 'Deep Depression', 
    nameHindi: 'गहरा अवसाद', 
    code: 'DD',
    minWind: 50, 
    maxWind: 61, 
    accentColor: 'amber',
    topBar: 'bg-amber-400/80',
    windBadge: 'text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30',
  },
  { 
    id: 'CS', 
    name: 'Cyclonic Storm', 
    nameHindi: 'चक्रवाती तूफान', 
    code: 'CS',
    minWind: 62, 
    maxWind: 88, 
    accentColor: 'orange',
    topBar: 'bg-orange-400/80',
    windBadge: 'text-orange-700 dark:text-orange-300 bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/50 dark:border-orange-800/30',
  },
  { 
    id: 'SCS', 
    name: 'Severe Cyclone', 
    nameHindi: 'भीषण चक्रवात', 
    code: 'SCS',
    minWind: 89, 
    maxWind: 117, 
    accentColor: 'purple',
    topBar: 'bg-purple-400/80',
    windBadge: 'text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/30',
  },
  { 
    id: 'VSCS', 
    name: 'Very Severe Cyclone', 
    nameHindi: 'अति भीषण चक्रवात', 
    code: 'VSCS',
    minWind: 118, 
    maxWind: 220, 
    accentColor: 'red',
    topBar: 'bg-red-400/80',
    windBadge: 'text-red-700 dark:text-red-300 bg-red-50/80 dark:bg-red-950/30 border border-red-200/50 dark:border-red-800/30',
  }
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
 * 1. Progress steps: Low Pressure → Depression → Deep Depression → Cyclonic Storm → Severe Cyclone → Very Severe Cyclone
 * 2. Uniquely colorful jewel-toned cards for every stage with individual color grading & live telemetry radar
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
    trendType = windNum > 60 ? 'STRENGTHENING' : 'STABLE';
  }

  const TREND_CONFIG = {
    STRENGTHENING: {
      label: isHindi ? 'तीव्र हो रहा है (Strengthening)' : 'Strengthening (Intensifying)',
      color: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-400/15 border-rose-300/70 dark:border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      icon: TrendingUp
    },
    WEAKENING: {
      label: isHindi ? 'क्षीण हो रहा है (Weakening)' : 'Weakening (Dissipating)',
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-300/70 dark:border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      icon: TrendingDown
    },
    STABLE: {
      label: isHindi ? 'स्थिर अवस्था (Stable)' : 'Stable (Steady State)',
      color: 'text-sky-700 dark:text-sky-300 bg-sky-500/10 dark:bg-sky-400/15 border-sky-300/70 dark:border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]',
      icon: Minus
    }
  };

  const currentTrend = TREND_CONFIG[trendType];
  const TrendIcon = currentTrend.icon;

  return (
    <div className={`relative overflow-hidden p-4 sm:p-5 sm:px-6 rounded-3xl bg-gradient-to-br from-white/95 via-slate-50/70 to-white/90 dark:from-[#0b0f19]/95 dark:via-[#070a12]/95 dark:to-[#04060a]/98 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] space-y-4 transition-all duration-300 ${className}`}>
      {/* Top Specular Sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 dark:via-white/20 to-transparent" />

      {/* Top Header Row: Stage Badge + Trend and Change Deltas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-[0_0_12px_rgba(14,165,233,0.25)]">
              <ShieldAlert className="w-4 h-4" />
            </div>
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

        {/* Dynamic Trend Indicator Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentTrend.color}`}>
            <TrendIcon className="w-3.5 h-3.5 animate-pulse" />
            <span>{currentTrend.label}</span>
          </div>

          {/* Genuine Telemetry Change Badge */}
          {hasDelta && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400 font-sans font-medium">
                {isForecastTrend 
                  ? (isHindi ? `अनुमानित ${trendIntervalHours}h:` : `Forecast ${trendIntervalHours}h:`) 
                  : (isHindi ? `पिछले ${trendIntervalHours}h:` : `Past ${trendIntervalHours}h:`)}
              </span>
              <span className={`font-bold flex items-center gap-0.5 ${windDelta >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Wind {windDelta >= 0 ? `↑ ${windDelta.toFixed(0)}` : `↓ ${Math.abs(windDelta).toFixed(0)}`} km/h
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className={`font-bold flex items-center gap-0.5 ${pressureDelta <= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Press {pressureDelta <= 0 ? `↓ ${Math.abs(pressureDelta).toFixed(0)}` : `↑ ${pressureDelta.toFixed(0)}`} hPa
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visual Stepper with Full-Spectrum Colored Energy Track */}
      <div className="relative pt-3 pb-2">
        
        {/* Minimal Subtle Track Line */}
        <div className="hidden md:block absolute top-[32px] left-8 right-8 h-1 rounded-full z-0 bg-slate-200/80 dark:bg-slate-800" />

        {/* Active Progress Line */}
        <div className="hidden md:block absolute top-[32px] left-8 right-8 h-1 rounded-full z-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-rose-500 transition-all duration-700 relative"
            style={{ width: `${Math.max(8, (currentStageIndex / (CYCLONE_STAGES.length - 1)) * 100)}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-rose-500" />
          </div>
        </div>

        {/* 6 Stage Cards Grid: Clean, Minimal, Subtly Color Graded */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 relative z-10">
          {CYCLONE_STAGES.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isPast = idx < currentStageIndex;
            const isFuture = idx > currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`relative flex flex-col items-center text-center p-3 rounded-2xl transition-all duration-200 select-none overflow-hidden ${
                  isCurrent
                    ? 'bg-white dark:bg-slate-900 border border-rose-400 dark:border-rose-500/70 shadow-[0_8px_24px_rgba(244,63,94,0.1)] ring-1 ring-rose-500/20 scale-[1.02] -translate-y-0.5 z-20'
                    : isPast
                    ? 'bg-white/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/5 opacity-85 hover:opacity-100'
                    : 'bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                {/* Subtle Top Accent Color Line (Color Grading) */}
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-[2.5px] ${stage.topBar} ${
                    isCurrent ? 'opacity-100' : 'opacity-35 group-hover:opacity-70'
                  }`}
                />

                {/* Step Circle Pin */}
                <div className="relative w-7 h-7 flex items-center justify-center mb-1.5 mt-0.5">
                  {isCurrent ? (
                    <>
                      <span className="absolute -inset-1 rounded-full bg-rose-500/20 animate-pulse" />
                      <div className="relative w-7 h-7 rounded-full bg-rose-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-white dark:ring-slate-900">
                        {idx + 1}
                      </div>
                    </>
                  ) : isPast ? (
                    <div className="w-6 h-6 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-300/70 dark:border-sky-800/80 flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-slate-900">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-[10.5px] font-mono font-semibold ring-2 ring-white dark:ring-slate-900">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Stage Title */}
                <span
                  className={`text-[11px] sm:text-xs font-heading font-bold leading-tight ${
                    isCurrent ? 'text-slate-950 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isHindi ? stage.nameHindi : stage.name}
                </span>

                {/* Wind Criteria Badge */}
                <span className={`text-[9.5px] sm:text-[10px] font-mono mt-1 px-2 py-0.5 rounded-md ${stage.windBadge}`}>
                  {stage.minWind}–{stage.maxWind} km/h
                </span>

                {/* Minimal Status Tag */}
                {isCurrent ? (
                  <span className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-rose-500 text-white shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                    <span className="whitespace-nowrap">{isHindi ? 'तूफान स्थिति' : 'STORM POSITION'}</span>
                  </span>
                ) : isPast ? (
                  <span className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider uppercase text-sky-600 dark:text-sky-400 bg-sky-500/10 dark:bg-sky-400/10 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    <span>{isHindi ? 'पार' : 'PASSED'}</span>
                  </span>
                ) : (
                  <span className="mt-2 px-1.5 py-0.5 text-[9.5px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                    {stage.code}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Footnote Context */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200/70 dark:border-white/10 font-sans">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {isHindi ? 'सक्रिय स्थिति:' : 'Active Status:'}
          </span>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {isHindi ? activeStage.nameHindi : activeStage.name}
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {windNum} km/h ({pressNum} hPa)
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
          IMD SOP Bulletin Criteria &bull; Official Beaufort/IMD Standard
        </span>
      </div>

    </div>
  );
}


