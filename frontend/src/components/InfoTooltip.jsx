import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

export const SCIENTIFIC_TERMS = {
  central_pressure: {
    name: 'Central Pressure (MSLP)',
    nameHindi: 'केंद्रीय बैरोमीटर दबाव (MSLP)',
    desc: 'The atmospheric pressure measured at sea level in the storm center. Lower pressure means a stronger pressure gradient and higher cyclone intensity.',
    descHindi: 'तूफान के केंद्र में मापा गया वायुमंडलीय दबाव। कम दबाव का अर्थ है अधिक शक्तिशाली चक्रवात और तीव्र हवाएं (hPa में मापा जाता है)।',
    impact: 'Drop > 6 hPa in 12h indicates rapid cyclone deepening.'
  },
  sustained_wind: {
    name: 'Sustained Wind Speed',
    nameHindi: 'सतत पवन गति (Sustained Wind)',
    desc: 'The average 1-minute or 3-minute continuous wind velocity near the cyclone core. This metric defines the official IMD intensity categorization.',
    descHindi: 'चक्रवात के केंद्र के समीप 1 से 3 मिनट के औसत अंतराल में दर्ज सतत हवा की गति, जो इसकी आधिकारिक तीव्रता श्रेणी तय करती है।',
    impact: 'Determines alert levels from Depression to Severe Cyclone.'
  },
  gusts: {
    name: 'Wind Gusts',
    nameHindi: 'पवन झोंके (Gusts)',
    desc: 'Sudden, brief spikes in wind speed lasting a few seconds, typically 20–35% faster than the sustained wind, responsible for roof and tree damage.',
    descHindi: 'अचानक आने वाले कुछ सेकंड के अत्यधिक तीव्र हवा के झोंके, जो सतत हवा से 20-35% तक तेज होते हैं और अत्यधिक नुकसान पहुंचाते हैं।',
    impact: 'Key factor for structural wind engineering safety.'
  },
  formation_probability: {
    name: 'Next 48h Formation Probability',
    nameHindi: 'अगले 48 घंटे चक्रवात जनन संभावना',
    desc: 'The estimated statistical and neural model probability that this tropical disturbance will intensify into at least a Depression within the next 48 hours.',
    descHindi: 'यह दर्शाता है कि अगले 48 घंटों के भीतर यह मौसम प्रणाली गहराकर चक्रवात या अवसाद में तब्दील होगी या नहीं (एआई वीआईटी मॉडल अनुमान)।',
    impact: 'Probability > 60% triggers pre-cyclone watches.'
  },
  invest: {
    name: 'INVEST Area',
    nameHindi: 'इन्वेस्ट क्षेत्र (INVEST Area)',
    desc: 'A designated tropical weather disturbance ("Investigative Area", e.g. 92B for Bay of Bengal, 91A for Arabian Sea) under active satellite surveillance.',
    descHindi: 'मौसम विज्ञान एजेंसियों द्वारा उपग्रह और रडार पर बारीकी से नजर रखी जाने वाली संभावित चक्रवात जनन मौसम प्रणाली (जैसे बंगाल की खाड़ी के लिए 92B)।',
    impact: 'Identified before official naming occurs.'
  },
  projected_coastal_corridor: {
    name: 'Projected Coastal Corridor',
    nameHindi: 'अनुमानित तटीय प्रभाव क्षेत्र',
    desc: 'The coastal sector identified by ensemble trajectory models where landfall or gale-force maritime impacts are projected within 24–72 hours.',
    descHindi: 'मल्टी-मॉडल पूर्वानुमान द्वारा पहचाना गया वह तटीय क्षेत्र जहां 24 से 72 घंटों में चक्रवात के टकराने या भारी प्रभाव की प्रबल संभावना है।',
    impact: 'Directly guides district disaster management and evacuations.'
  },
  movement: {
    name: 'Movement Vector',
    nameHindi: 'प्रणाली की गति एवं दिशा',
    desc: 'The forward translation velocity (km/h) and compass track heading of the vortex center across the oceanic basin.',
    descHindi: 'समुद्र तल पर चक्रवात के केंद्र के आगे बढ़ने की दिशा (जैसे उत्तर-पश्चिम) और गति (किमी/घंटा)।',
    impact: 'Determines the exact timing and location of landfall.'
  },
  dvorak: {
    name: 'Dvorak T-Number',
    nameHindi: 'ड्वोरक टी-संख्या (Dvorak Scale)',
    desc: 'A standardized satellite-based cloud pattern analysis scale (T1.0 to T8.0) estimating tropical cyclone intensity from thermal infrared imagery.',
    descHindi: 'उपग्रह इन्फ्रारेड चित्रों के आधार पर चक्रवात की तीव्रता आंकने का वैश्विक मानक पैमाना (T1.0 से T8.0)।',
    impact: 'T3.5 corresponds to Cyclonic Storm status (~85 km/h).'
  },
  sst: {
    name: 'Sea Surface Temperature (SST)',
    nameHindi: 'समुद्री सतह तापमान (SST)',
    desc: 'Ocean surface water temperature. Temperatures at or above 28.0°C provide the thermal energy and moisture flux needed for cyclogenesis.',
    descHindi: 'समुद्र की सतह का तापमान। 28°C या अधिक तापमान चक्रवात के निर्माण और उसे ऊर्जा प्रदान करने के लिए आवश्यक माना जाता है।',
    impact: 'SST > 30°C strongly fuels rapid intensification.'
  },
  shear: {
    name: 'Vertical Wind Shear (VWS)',
    nameHindi: 'वर्टिकल पवन अपरूपण (Wind Shear)',
    desc: 'The difference in wind speed and direction between upper (200 hPa) and lower (850 hPa) troposphere. Low shear (<15 kts) enables storm formation.',
    descHindi: 'वायुमंडल के ऊपरी और निचले स्तरों के बीच हवा की गति और दिशा का अंतर। कम शीयर (<15 समुद्री मील) चक्रवात बनने के अनुकूल होता है।',
    impact: 'High shear (>25 kts) tears apart convective vortex cores.'
  },
  radar: {
    name: 'Doppler Weather Radar (DWR)',
    nameHindi: 'डॉपलर मौसम रडार',
    desc: 'Ground-based coastal radar measuring precipitation intensity and internal rotation velocities up to 400 km offshore in real time.',
    descHindi: 'तटीय रडार जो समुद्र में 400 किमी दूर तक बारिश, बादलों की गति और चक्रवाती भंवर को वास्तविक समय में ट्रैक करता है।',
    impact: 'Critical for tracking the eye during the final 24h before landfall.'
  },
  cone: {
    name: 'Cone of Uncertainty',
    nameHindi: 'अनिश्चितता का शंकु (Forecast Cone)',
    desc: 'The projected geographic cone representing the 25-pass Monte Carlo Dropout epistemic uncertainty zone where the cyclone center is forecast to track over 72 hours.',
    descHindi: 'पूर्वानुमान का वह क्षेत्र जिसमें 25-पास मोंटे कार्लो ड्रॉपआउट के अनुसार चक्रवात का केंद्र आगे बढ़ने का अनुमान है।',
    impact: 'Widens over time due to forecast uncertainty.'
  },
  surge: {
    name: 'Storm Surge',
    nameHindi: 'तूफानी समुद्री लहरें (Storm Surge)',
    desc: 'An abnormal rise of sea level above astronomical tides caused by extreme low pressure and winds pushing ocean water onto the coastline.',
    descHindi: 'चक्रवात के कम दबाव और तेज हवाओं के कारण समुद्र के जलस्तर में होने वाली असामान्य और खतरनाक वृद्धि।',
    impact: 'Primary cause of coastal inundation and loss of life.'
  },
  eye_fix: {
    name: 'Vortex Eye Fix',
    nameHindi: 'चक्रवात भंवर केंद्र निर्धारण',
    desc: 'The precise latitude and longitude of the minimum pressure center determined by satellite feature tracking and deep learning models.',
    descHindi: 'उपग्रह और एआई मॉडल द्वारा निर्धारित चक्रवात के केंद्र (आई) के सटीक अक्षांश और देशांतर निर्देशांक।',
    impact: 'Pinpoints the exact trajectory starting point.'
  }
};

/**
 * InfoTooltip
 * Micro-component rendering a clean iOS 3D glass popover with technical explanations.
 * Hover on desktop, click/tap on mobile.
 */
export default function InfoTooltip({
  term,
  title,
  text,
  impact,
  isHindi = false,
  className = '',
  size = 'sm'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const termData = SCIENTIFIC_TERMS[term] || {};
  const displayTitle = title || (isHindi ? termData.nameHindi || termData.name : termData.name) || 'Technical Term';
  const displayDesc = text || (isHindi ? termData.descHindi || termData.desc : termData.desc) || '';
  const displayImpact = impact || termData.impact;

  // Handle outside click to dismiss on mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const iconDimension = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  const buttonDimension = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center align-middle ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Information about ${displayTitle}`}
        className={`inline-flex items-center justify-center ${buttonDimension} rounded-full text-slate-400 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-500`}
      >
        <Info className={iconDimension} />
      </button>

      {/* iOS-Style Glass Popover */}
      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-[9999] bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.16)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] text-left animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Top Edge Specular Glare */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-white/10 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
            <span className="font-heading font-bold text-xs text-slate-900 dark:text-white truncate">
              {displayTitle}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans font-normal">
            {displayDesc}
          </p>

          {/* Impact / Practical Relevance */}
          {displayImpact && (
            <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-medium text-sky-700 dark:text-sky-400 font-mono">
                {isHindi ? 'मौसम विज्ञान महत्व:' : 'Operational Impact:'}
              </span>
              <span className="truncate max-w-[170px] text-right font-medium">
                {displayImpact}
              </span>
            </div>
          )}

          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 bg-white dark:bg-slate-900 rotate-45 border-r border-b border-slate-200/90 dark:border-white/10" />
        </div>
      )}
    </div>
  );
}
