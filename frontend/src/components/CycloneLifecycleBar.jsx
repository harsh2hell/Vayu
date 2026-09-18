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
    pastelBg: 'bg-[#EBF5FF] dark:bg-sky-950/40',
    pastelBorder: 'border-sky-200/80 dark:border-sky-900/50',
    windBadge: 'text-sky-700 dark:text-sky-300 bg-white/80 dark:bg-slate-900/80',
    pinBg: 'bg-sky-500',
  },
  { 
    id: 'D', 
    name: 'Depression', 
    nameHindi: 'अवसाद', 
    code: 'D',
    minWind: 31, 
    maxWind: 49, 
    accentColor: 'rose',
    pastelBg: 'bg-[#FEF2F2] dark:bg-rose-950/40',
    pastelBorder: 'border-rose-200/80 dark:border-rose-900/50',
    windBadge: 'text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900/80 font-bold',
    pinBg: 'bg-rose-500',
  },
  { 
    id: 'DD', 
    name: 'Deep Depression', 
    nameHindi: 'गहरा अवसाद', 
    code: 'DD',
    minWind: 50, 
    maxWind: 61, 
    accentColor: 'amber',
    pastelBg: 'bg-[#FFFBEB] dark:bg-amber-950/40',
    pastelBorder: 'border-amber-200/80 dark:border-amber-900/50',
    windBadge: 'text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-900/80',
    pinBg: 'bg-amber-500',
  },
  { 
    id: 'CS', 
    name: 'Cyclonic Storm', 
    nameHindi: 'चक्रवाती तूफान', 
    code: 'CS',
    minWind: 62, 
    maxWind: 88, 
    accentColor: 'orange',
    pastelBg: 'bg-[#FFF7ED] dark:bg-orange-950/40',
    pastelBorder: 'border-orange-200/80 dark:border-orange-900/50',
    windBadge: 'text-orange-700 dark:text-orange-300 bg-white/80 dark:bg-slate-900/80',
    pinBg: 'bg-orange-500',
  },
  { 
    id: 'SCS', 
    name: 'Severe Cyclone', 
    nameHindi: 'भीषण चक्रवात', 
    code: 'SCS',
    minWind: 89, 
    maxWind: 117, 
    accentColor: 'purple',
    pastelBg: 'bg-[#F3F0FF] dark:bg-purple-950/40',
    pastelBorder: 'border-purple-200/80 dark:border-purple-900/50',
    windBadge: 'text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-slate-900/80',
    pinBg: 'bg-purple-500',
  },
  { 
    id: 'VSCS', 
    name: 'Very Severe Cyclone', 
    nameHindi: 'अति भीषण चक्रवात', 
    code: 'VSCS',
    minWind: 118, 
    maxWind: 220, 
    accentColor: 'red',
    pastelBg: 'bg-[#FDF2F8] dark:bg-pink-950/40',
    pastelBorder: 'border-pink-200/80 dark:border-pink-900/50',
    windBadge: 'text-pink-700 dark:text-pink-300 bg-white/80 dark:bg-slate-900/80',
    pinBg: 'bg-rose-600',
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
 * 2. Clean, minimal pastel colored cards for every stage matching the dashboard design language
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
  const pressNum = parseFloat(currentPressure) || 1004;
  const currentStageIndex = classifyStage(windNum);
  const activeStage = CYCLONE_STAGES[currentStageIndex];

  // Calculate genuine deltas if previous data is available
  const hasDelta = prevWind !== null && prevPressure !== null;
  const windDelta = hasDelta ? windNum - parseFloat(prevWind) : 0;
  const pressureDelta = hasDelta ? pressNum - parseFloat(prevPressure) : 0;

  // Determine trend type based on real physical metrics
  let trendType = 'stable';
  if (windDelta > 3 || pressureDelta < -2) {
    trendType = 'intensifying';
  } else if (windDelta < -3 || pressureDelta > 2) {
    trendType = 'weakening';
  }

  const TREND_CONFIG = {
    intensifying: {
      label: isHindi ? 'तीव्र हो रहा है (Intensifying)' : 'Intensifying (Strengthening)',
      color: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-400/15 border-rose-300/70 dark:border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      icon: TrendingUp
    },
    STRENGTHENING: {
      label: isHindi ? 'तीव्र हो रहा है (Strengthening)' : 'Strengthening (Intensifying)',
      color: 'text-rose-700 dark:text-rose-300 bg-rose-500/10 dark:bg-rose-400/15 border-rose-300/70 dark:border-rose-400/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
      icon: TrendingUp
    },
    weakening: {
      label: isHindi ? 'क्षीण हो रहा है (Weakening)' : 'Weakening (Dissipating)',
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-300/70 dark:border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      icon: TrendingDown
    },
    WEAKENING: {
      label: isHindi ? 'क्षीण हो रहा है (Weakening)' : 'Weakening (Dissipating)',
      color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-400/15 border-emerald-300/70 dark:border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
      icon: TrendingDown
    },
    stable: {
      label: isHindi ? 'स्थिर अवस्था (Stable)' : 'Stable (Steady State)',
      color: 'text-sky-700 dark:text-sky-300 bg-sky-500/10 dark:bg-sky-400/15 border-sky-300/70 dark:border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]',
      icon: Minus
    },
    STABLE: {
      label: isHindi ? 'स्थिर अवस्था (Stable)' : 'Stable (Steady State)',
      color: 'text-sky-700 dark:text-sky-300 bg-sky-500/10 dark:bg-sky-400/15 border-sky-300/70 dark:border-sky-400/30 shadow-[0_0_12px_rgba(14,165,233,0.15)]',
      icon: Minus
    }
  };

  const currentTrend = TREND_CONFIG[trendType] || TREND_CONFIG.stable;
  const TrendIcon = currentTrend.icon;

  return (
    <div className={`p-5 sm:p-6 rounded-[32px] bg-[#FAFAFA] dark:bg-slate-900/80 border border-slate-100/60 dark:border-slate-800/80 space-y-4 transition-colors ${className}`}>
      {/* Top Header Row: Stage Badge + Trend and Change Deltas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-900 dark:text-white">
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
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${currentTrend.color}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{currentTrend.label}</span>
          </div>

          {/* Genuine Telemetry Change Badge */}
          {hasDelta && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-2xs">
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

      {/* Visual Stepper with Minimal Pastel Cards */}
      <div className="relative pt-2 pb-2">
        {/* Minimal Track Line */}
        <div className="hidden md:block absolute top-[28px] left-8 right-8 h-1 rounded-full z-0 bg-slate-200/70 dark:bg-slate-800" />

        {/* 6 Stage Cards Grid: Clean, Pastel Colored Dashboard Styling */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 relative z-10">
          {CYCLONE_STAGES.map((stage, idx) => {
            const isCurrent = idx === currentStageIndex;
            const isPast = idx < currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl transition-all select-none border ${stage.pastelBg} ${stage.pastelBorder} ${
                  isCurrent
                    ? 'ring-2 ring-slate-900/10 dark:ring-white/20 shadow-xs -translate-y-0.5 z-20'
                    : 'hover:shadow-xs'
                }`}
              >
                {/* Step Circle Pin */}
                <div className="relative w-6 h-6 flex items-center justify-center mb-1.5">
                  {isCurrent ? (
                    <div className="relative w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono font-bold text-[11px] flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </div>
                  ) : isPast ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-[10px] font-mono font-semibold">
                      {idx + 1}
                    </div>
                  )}
                </div>

                {/* Stage Title */}
                <span className="text-[11px] sm:text-xs font-heading font-bold leading-tight text-slate-900 dark:text-white">
                  {isHindi ? stage.nameHindi : stage.name}
                </span>

                {/* Wind Criteria Badge */}
                <span className={`text-[9.5px] sm:text-[10px] font-mono mt-1 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50 ${stage.windBadge}`}>
                  {stage.minWind}–{stage.maxWind} km/h
                </span>

                {/* Minimal Status Tag */}
                {isCurrent ? (
                  <span className="mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="whitespace-nowrap">{isHindi ? 'तूफान स्थिति' : 'STORM POSITION'}</span>
                  </span>
                ) : isPast ? (
                  <span className="mt-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-900/60">
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
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100/70 dark:border-white/10 font-sans">
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


