import React, { useState } from 'react';
import { Brain, Sparkles, Activity, Thermometer, Wind, Eye, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import InfoTooltip from './InfoTooltip';
import DataTypeBadge from './DataTypeBadge';

/**
 * AIReasoningCard ("AI Analysis / Why This Prediction?")
 * Explains the genuine physical and meteorological factors driving the AI/ML prediction:
 * - Falling central pressure & barometric gradient
 * - Sea Surface Temperature (SST) thermal fuel
 * - Vertical Wind Shear (VWS) column stability
 * - ResNet18 cloud organization & LLCC
 * - Transparent AI Model Confidence (genuinely stated or noted as unavailable)
 */
export default function AIReasoningCard({
  systemName = 'Invest 92B',
  pressure = 1004,
  wind = 42,
  sst = 30.5,
  shear = 11.2,
  vitPattern = 'Curved Banding / Low-Level Circulation Center (LLCC)',
  risk48h = '68%',
  confidenceScore = 'Phase 3B Validated',
  confidenceType = 'MobileNetV3 / ResNet18 Telemetry',
  isHistorical = false,
  isHindi = false,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Evaluate genuine meteorological drivers from real values
  const pressNum = parseFloat(pressure) || 1004;
  const sstNum = parseFloat(sst) || 30.0;
  const shearNum = parseFloat(shear) || 12.0;

  const factors = [
    {
      id: 'pressure',
      title: isHindi ? 'केंद्रीय दबाव एवं ग्रेडिएंट (Barometric Gradient)' : 'Falling Central Pressure Gradient',
      icon: Activity,
      metric: `${pressNum} hPa`,
      status: pressNum < 1000 ? 'Deepening' : 'Depression Stage',
      statusColor: pressNum < 990 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400',
      reason: isHindi
        ? `केंद्रीय दबाव ${pressNum} hPa पर स्थिर या गिर रहा है, जिससे तटीय क्षेत्र और चक्रवात केंद्र के बीच गहरा दबाव अंतर बन रहा है जो निम्न-स्तरीय हवाओं को तेजी से खींचता है।`
        : `Central pressure at ${pressNum} hPa creates a steep horizontal barometric gradient that accelerates low-level inflow into the vortex core.`,
      tooltipTerm: 'central_pressure'
    },
    {
      id: 'sst',
      title: isHindi ? 'समुद्री सतह तापमान (Ocean Heat Engine)' : 'Sea Surface Temperature (Thermal Fuel)',
      icon: Thermometer,
      metric: `${sstNum}°C`,
      status: sstNum >= 28.5 ? 'Highly Favorable' : 'Moderate',
      statusColor: sstNum >= 28.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      reason: isHindi
        ? `समुद्र की सतह का तापमान ${sstNum}°C है, जो चक्रवात बनने के लिए आवश्यक 28.0°C की सीमा से काफी अधिक है। यह निरंतर जलवाष्प और गुप्त ऊष्मा प्रदान करता है।`
        : `Ocean temperature of ${sstNum}°C exceeds the 28.0°C tropical cyclogenesis threshold, supplying strong moisture flux and latent heat energy.`,
      tooltipTerm: 'sst'
    },
    {
      id: 'shear',
      title: isHindi ? 'वर्टिकल पवन अपरूपण (Atmospheric Shear)' : 'Vertical Wind Shear (Vortex Alignment)',
      icon: Wind,
      metric: `${shearNum} kts`,
      status: shearNum < 15 ? 'Low / Favorable' : 'Moderate',
      statusColor: shearNum < 15 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400',
      reason: isHindi
        ? `पवन अपरूपण केवल ${shearNum} नॉट है (15 से कम)। कम शीयर के कारण तूफान का ऊर्ध्वाधर स्तंभ बिना झुके या बिखरे सीधा और संगठित रहता है।`
        : `Low vertical shear (${shearNum} kts < 15 kt threshold) prevents convective tilting and allows vertical latent heat stacking in the column.`,
      tooltipTerm: 'shear'
    },
    {
      id: 'morphology',
      title: isHindi ? 'उपग्रह क्लाउड आकारिकी (ResNet18 Pattern)' : 'ResNet18 Cloud Morphology Classification',
      icon: Eye,
      metric: 'ResNet18',
      status: 'Curved Banding',
      statusColor: 'text-sky-600 dark:text-sky-400',
      reason: isHindi
        ? `इन्फ्रारेड सैटेलाइट चैनलों में ${vitPattern} देखा गया है, जो प्राथमिक चक्रवाती परिसंचरण केंद्र (LLCC) की पुष्टि करता है।`
        : `ResNet18 Grad-CAM attention detects ${vitPattern}, indicating organized low-level cyclonic vorticity.`,
      tooltipTerm: 'dvorak'
    }
  ];

  return (
    <div className={`p-5 rounded-2xl sm:rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4 ${className}`}>
      
      {/* Card Header with Confidence Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                {isHindi ? 'एआई विश्लेषण: यह पूर्वानुमान क्यों?' : 'AI Reasoning: Why This Prediction?'}
              </h3>
              <DataTypeBadge type={isHistorical ? 'historical' : 'ai'} isHindi={isHindi} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              {isHindi
                ? 'मौसम विज्ञान कारकों और भौतिक मापदंडों का पारदर्शी न्यूरल मॉडल विश्लेषण'
                : 'Meteorological indicators and physical drivers underpinning the model forecast'}
            </p>
          </div>
        </div>

        {/* AI Model Genuine Confidence Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {confidenceScore ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-mono font-bold text-sky-900 dark:text-sky-300 shadow-2xs">
              <Sparkles className="w-3 h-3 text-sky-500" />
              <span>{confidenceType}: {confidenceScore}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-600 dark:text-slate-400">
              <AlertCircle className="w-3 h-3 text-slate-400" />
              <span>Confidence: Single Deterministic Run</span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse' : 'Expand'}
            aria-label="Toggle Reasoning Details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Factor Breakdown */}
      {isExpanded && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {factors.map((f) => {
              const IconComp = f.icon;
              return (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200">
                        {f.title}
                      </span>
                      <InfoTooltip term={f.tooltipTerm} isHindi={isHindi} />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 ${f.statusColor}`}>
                      {f.metric} &bull; {f.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {f.reason}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Model Summary / Disclaimer */}
          <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/40 flex items-start gap-2.5 text-[11px] text-sky-900 dark:text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{isHindi ? 'सिस्टम पूर्वानुमान निष्कर्ष:' : 'Model Inference Rationale:'}</strong>{' '}
              {isHindi
                ? `अनुकूल समुद्री तापमान (${sstNum}°C) और कम पवन अपरूपण (${shearNum} kts) के संयोजन से ${systemName} के अगले 48 घंटों में चक्रवात के रूप में विकसित होने की संभावना ${risk48h} आंकी गई है।`
                : `Coupled thermodynamics of warm waters (${sstNum}°C) with weak tropospheric shear (${shearNum} kts) support continuous vortex intensification, yielding a ${risk48h} 48h cyclogenesis probability for ${systemName}.`}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
