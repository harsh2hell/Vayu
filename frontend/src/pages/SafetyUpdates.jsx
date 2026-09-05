import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FileText, AlertTriangle, Download, Bell, ExternalLink, 
  ShieldCheck, Anchor, Radio, Clock, ChevronRight,
  CheckCircle2, XCircle, PhoneCall, PackageCheck, LifeBuoy,
  HeartPulse, Shield, Sparkles, Info, Layers
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const PORT_SIGNALS = [
  { signal: 'Signal No. 1', name: 'Warning', desc: 'Low pressure area or squally weather exists at sea.', descHindi: 'समुद्र में कम दबाव का क्षेत्र या झोंकेदार मौसम मौजूद है।' },
  { signal: 'Signal No. 2', name: 'Disturbance', desc: 'Depression formed with winds up to 61 km/h.', descHindi: 'अवसाद का निर्माण हुआ है और हवाएं 61 किमी/घंटा तक हैं।' },
  { signal: 'Signal No. 3', name: 'Danger', desc: 'Port threatened by squalls from cyclonic circulation.', descHindi: 'चक्रवाती परिसंचरण के कारण बंदरगाह पर तेज़ हवाओं का खतरा।' },
  { signal: 'Signal No. 4', name: 'Imminent Danger', desc: 'Severe storm is likely to cross port area.', descHindi: 'भीषण तूफान के बंदरगाह क्षेत्र को पार करने की संभावना।' },
  { signal: 'Signal No. 8', name: 'Severe Cyclone', desc: 'Severe cyclonic storm to cross with port on its right.', descHindi: 'भीषण चक्रवात बंदरगाह के दाहिनी ओर से पार करेगा।' },
  { signal: 'Signal No. 10', name: 'Great Danger', desc: 'Severe or Super cyclone expected to strike directly over port.', descHindi: 'भीषण या सुपर चक्रवात के सीधे बंदरगाह से टकराने की आशंका।' }
];

const EMERGENCY_HELPLINES = [
  { name: 'National Emergency Helpline', nameHindi: 'राष्ट्रीय आपातकालीन हेल्पलाइन', num: '112', desc: 'Unified Police, Fire, Medical Services', descHindi: 'एकीकृत पुलिस, अग्निशमन, चिकित्सा सेवा' },
  { name: 'NDMA Disaster Control Room', nameHindi: 'एनडीएमए राष्ट्रीय आपदा नियंत्रण कक्ष', num: '1078', desc: 'National Disaster Management Authority', descHindi: 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण' },
  { name: 'NDRF Control Room (New Delhi)', nameHindi: 'एनडीआरएफ नियंत्रण कक्ष (नई दिल्ली)', num: '011-24363260', desc: 'National Disaster Response Force HQ', descHindi: 'राष्ट्रीय आपदा प्रतिक्रिया बल मुख्यालय' },
  { name: 'Indian Coast Guard SAR', nameHindi: 'भारतीय तटरक्षक खोज व बचाव', num: '1554', desc: '24/7 Marine Search & Rescue Hotline', descHindi: '24/7 समुद्री खोज एवं बचाव हेल्पलाइन' }
];

const SURVIVAL_ITEMS = [
  { name: 'Battery-Powered Portable AM/FM Radio', nameHindi: 'बैटरी से चलने वाला पोर्टेबल रेडियो', desc: 'For continuous official broadcast advisories', descHindi: 'आधिकारिक बुलेटिन और चेतावनी सुनने हेतु' },
  { name: 'Heavy-Duty LED Torch & Spare Batteries', nameHindi: 'एलईडी टॉर्च व अतिरिक्त बैटरियां', desc: 'In case of prolonged power failure', descHindi: 'लंबे समय तक बिजली गुल रहने की स्थिति में' },
  { name: '3-Day Non-Perishable Ready-to-Eat Food', nameHindi: '3 दिन का सूखा व डिब्बाबंद भोजन', desc: 'Biscuits, flattened rice (poha), roasted gram', descHindi: 'बिस्कुट, पोहा, भुने चने, सूखा भोजन' },
  { name: 'Sealed Bottled Water (3L per person/day)', nameHindi: 'सील बंद पीने का पानी (3L/व्यक्ति/दिन)', desc: 'Plus chlorine / water purification tablets', descHindi: 'साथ में क्लोरीन / पानी शुद्ध करने की गोलियां' },
  { name: 'Comprehensive First Aid Kit & Prescriptions', nameHindi: 'प्राथमिक चिकित्सा किट व नियमित दवाएं', desc: 'Antiseptics, bandages, 7-day regular medicine', descHindi: 'पट्टी, एंटीसेप्टिक, 7 दिन की नियमित दवाएं' },
  { name: 'Waterproof Bag for Identity & Property Docs', nameHindi: 'दस्तावेजों के लिए वाटरप्रूफ बैग', desc: 'Aadhaar, land deeds, bank passbooks, cash', descHindi: 'आधार, जमीन के कागजात, पासबुक, नकदी' },
  { name: 'Charged Power Banks & Emergency Cables', nameHindi: 'चार्ज पावर बैंक व केबल', desc: 'Keep phone battery usage strictly optimized', descHindi: 'मोबाइल की बैटरी न्यूनतम उपयोग पर रखें' },
  { name: 'Sturdy Waterproof Footwear & Raincoats', nameHindi: 'मजबूत जूते व बरसाती (रेनकोट)', desc: 'Protection against flying debris & glass', descHindi: 'उड़ते मलबे व कांच से सुरक्षा हेतु' }
];

const SafetyUpdates = ({ initialTab }) => {
  const location = useLocation();

  // Determine initial active tab based on route, query param or prop
  const getInitialTab = () => {
    if (initialTab) return initialTab;
    const path = location.pathname.toLowerCase();
    if (path === '/safety-guide' || path === '/safety') return 'safety';
    if (path === '/bulletins' || path === '/updates') return 'bulletins';
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'safety' || tabParam === 'bulletins' || tabParam === 'all') return tabParam;
    return 'all';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [safetyPhase, setSafetyPhase] = useState('before'); // 'before' | 'during' | 'after'

  // Language state persisted with vayu_is_hindi
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('vayu_is_hindi') === 'true';
  });

  const handleSetHindi = (val) => {
    setIsHindi(val);
    localStorage.setItem('vayu_is_hindi', String(val));
  };

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Font size scaling
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  // Track scroll for navbar blur
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownloadPdf = (bulletinName) => {
    alert(isHindi 
      ? `आधिकारिक आईएमडी बुलेटिन (${bulletinName}) पीडीएफ प्रारूप में डाउनलोड हो रहा है...` 
      : `Downloading official IMD bulletin advisory (${bulletinName}) in PDF format...`);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-500">
      
      {/* Top Navbar */}
      <PublicNavbar
        isHindi={isHindi}
        setIsHindi={handleSetHindi}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={setFontSizeOffset}
        isScrolled={isScrolled}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        
        {/* Top Header & Overview */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shadow-2xs">
                {isHindi ? 'राष्ट्रीय चक्रवात चेतावनी केंद्र (NCWC) • एनडीएमए (NDMA)' : 'NCWC New Delhi • National Disaster Management Authority'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> 
                {isHindi ? 'लाइव 24x7 सुरक्षा व बुलेटिन सेवा' : 'Live 24x7 Safety & Updates'}
              </span>
            </div>

            {/* Quick Emergency Helplines Chip */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline font-medium">
                {isHindi ? 'आपातकालीन सहायता:' : 'Emergency Hotlines:'}
              </span>
              <a 
                href="tel:112" 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 font-bold hover:bg-red-100 transition-colors shadow-2xs"
                title={isHindi ? "राष्ट्रीय आपातकालीन हेल्पलाइन: 112" : "National Emergency Helpline: 112"}
              >
                <PhoneCall className="w-3 h-3 text-red-600" />
                <span>112</span>
              </a>
              <a 
                href="tel:1078" 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                title={isHindi ? "एनडीएमए आपदा नियंत्रण: 1078" : "NDMA Disaster Control: 1078"}
              >
                <span>1078</span>
              </a>
              <a 
                href="tel:1554" 
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                title={isHindi ? "तटरक्षक समुद्री खोज व बचाव: 1554" : "Coast Guard SAR: 1554"}
              >
                <span>1554</span>
              </a>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
              {isHindi ? 'सुरक्षा एवं आधिकारिक अपडेट (Safety & Updates)' : 'Safety & Official Updates'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
              {isHindi 
                ? 'पृथ्वी विज्ञान मंत्रालय और भारत मौसम विज्ञान विभाग (IMD) द्वारा जारी आधिकारिक चक्रवात बुलेटिन, बंदरगाह चेतावनी संकेत और एनडीएमए (NDMA) नागरिक सुरक्षा प्रोटोकॉल का एकीकृत राष्ट्रीय पोर्टल।' 
                : 'Unified operational portal for official IMD tropical cyclone advisories, maritime warnings, port danger signals, and NDMA citizen disaster safety protocols.'}
            </p>
          </div>

          {/* Unified Primary Navigation Tabs: All vs Bulletins vs Safety Guide */}
          <div className="pt-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs max-w-full overflow-x-auto gap-1.5">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700 -translate-y-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{isHindi ? 'सभी जानकारी (बुलेटिन व सुरक्षा)' : 'All Information (Updates & Safety)'}</span>
              </button>

              <button
                onClick={() => setActiveTab('bulletins')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'bulletins'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700 -translate-y-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>{isHindi ? 'आधिकारिक बुलेटिन' : 'Official Bulletins & Warnings'}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
                  {isHindi ? '३ लाइव' : '3 Live'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('safety')}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'safety'
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-700 -translate-y-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'नागरिक सुरक्षा प्रोटोकॉल व किट' : 'Disaster Safety Protocol & Kit'}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                  NDMA
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================================
             VIEW 1: OFFICIAL BULLETINS & SEA WARNINGS
             ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'bulletins') && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* 2-Column Grid: Bulletins List + Maritime / Port Signals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Left 2 Cols: Bulletins List */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Bulletin 14 Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-3.5 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-950 dark:text-white px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {isHindi ? 'बुलेटिन संख्या 14' : 'BULLETIN NO. 14'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {isHindi ? 'आज 00:00 भारतीय मानक समय' : 'Today, 00:00 IST'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-0.5 rounded-full border border-red-200/60 dark:border-red-900/40 shadow-2xs">
                      {isHindi ? 'रेड अलर्ट प्रभाव' : 'Red Alert Impact'}
                    </span>
                  </div>

                  <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {isHindi 
                      ? 'उत्तरी बंगाल की खाड़ी पर गंभीर चक्रवाती तूफान दाना (ओडिशा और पश्चिम बंगाल)' 
                      : 'Severe Cyclonic Storm DANA over North Bay of Bengal (Odisha & West Bengal)'}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isHindi 
                      ? 'सिस्टम 100-110 किमी/घंटा की निरंतर हवाओं और 120 किमी/घंटा के झोंकों के साथ धामरा बंदरगाह के पास उत्तरी ओडिशा तट को पार कर गया है। बालेश्वर और भद्रक जिलों में लैंडफॉल के बाद राहत प्रोटोकॉल पूरी तरह लागू हैं। भारी वर्षा के कारण निचले इलाकों में जलभराव की निगरानी की जा रही है।' 
                      : 'System crossed north Odisha coast near Dhamra Port with sustained winds of 100-110 kmph gusting to 120 kmph. Complete post-landfall de-escalation protocols in effect across Balasore and Bhadrak districts. Inundation in low-lying areas being monitored closely.'}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button 
                      onClick={() => handleDownloadPdf('Bulletin No. 14 - Cyclone DANA')}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-sky-500" />
                      <span>{isHindi ? 'आधिकारिक सलाह डाउनलोड करें (PDF)' : 'Download Official Advisory (PDF)'}</span>
                    </button>
                  </div>
                </div>

                {/* Genesis Advisory 03 Card */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-3.5 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-950 dark:text-white px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {isHindi ? 'उत्पत्ति सलाह संख्या 03' : 'GENESIS ADVISORY NO. 03'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {isHindi ? 'कल 18:00 भारतीय मानक समय' : 'Yesterday, 18:00 IST'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-3 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40 shadow-2xs">
                      {isHindi ? 'विकासशील निगरानी' : 'Developing Watch'}
                    </span>
                  </div>

                  <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {isHindi 
                      ? 'दक्षिण-मध्य बंगाल की खाड़ी में उभरता हुआ कम दबाव का क्षेत्र (इन्वेस्ट 92B)' 
                      : 'Incipient Low Pressure Area Invest 92B in South-Central Bay of Bengal'}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isHindi 
                      ? 'गहरे वायुमंडलीय संवहन और अनुकूल समुद्री सतह तापमान (30.5°C) अगले 48 घंटों में स्थिर चक्रवाती तीव्रता का समर्थन करते हैं। समुद्री नौकाओं को अत्यधिक सावधानी बरतने की सलाह दी जाती है। 72 घंटे में अवसाद और गहरे अवसाद में बदलने का प्रबल अनुमान है।' 
                      : 'Deep atmospheric convection and favorable sea surface temperatures (30.5°C) support steady vortex intensification over the next 48 hours. Marine craft advised to exercise extreme caution with high probability of depression formation within 72 hours.'}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button 
                      onClick={() => handleDownloadPdf('Genesis Advisory No. 03 - Invest 92B')}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-amber-500" />
                      <span>{isHindi ? 'उत्पत्ति सलाह डाउनलोड करें (PDF)' : 'Download Genesis Advisory (PDF)'}</span>
                    </button>
                  </div>
                </div>

                {/* Special Tropical Weather Outlook */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-3.5 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-950 dark:text-white px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {isHindi ? 'विशेष उष्णकटिबंधीय दृष्टिकोण' : 'SPECIAL TROPICAL WEATHER OUTLOOK'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {isHindi ? 'नियमित 12:00 यूटीसी' : 'Regular 12:00 UTC'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-900/40 shadow-2xs">
                      {isHindi ? 'उत्तर हिंद महासागर बेसिन' : 'North Indian Ocean Basin'}
                    </span>
                  </div>

                  <h2 className="font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {isHindi 
                      ? 'अरब सागर एवं बंगाल की खाड़ी बेसिन 5-दिवसीय चक्रवात जनन संभावना' 
                      : 'Arabian Sea & Bay of Bengal Basin 5-Day Cyclogenesis Outlook'}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isHindi 
                      ? 'मैडेन-जूलियन दोलन (एमजेओ) वर्तमान में चरण 3 में है और अनुकूल आयाम के साथ बंगाल की खाड़ी के ऊपर चक्रवात गठन के लिए अनुकूल परिस्थितियां बना रहा है। अरब सागर के ऊपर पूर्वी-मध्य भाग में इन्वेस्ट 91ए पर नजर रखी जा रही है।' 
                      : 'Madden-Julian Oscillation (MJO) currently in Phase 3 with favorable amplitude enhancing convective activity over the Bay of Bengal. Over the Arabian Sea, Invest 91A remains under constant satellite radar surveillance.'}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button 
                      onClick={() => handleDownloadPdf('RSMC 5-Day Cyclogenesis Outlook')}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-emerald-500" />
                      <span>{isHindi ? '5-दिवसीय दृष्टिकोण डाउनलोड करें (PDF)' : 'Download 5-Day Outlook (PDF)'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Maritime Warnings & Port Signals */}
              <div className="space-y-6">
                
                {/* Maritime Sea Warning Box */}
                <div className="border border-red-200 dark:border-red-900/60 rounded-2xl sm:rounded-3xl bg-red-50/40 dark:bg-red-950/20 p-5 sm:p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-red-950 dark:text-red-200 flex items-center gap-2 font-heading">
                      <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <span>{isHindi ? 'समुद्री चेतावनी' : 'Maritime Sea Warning'}</span>
                    </h3>
                    <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                      {isHindi ? 'उत्तर एवं मध्य बंगाल की खाड़ी में समुद्री गतिविधियों पर पूर्ण प्रतिबंध।' : 'Prohibition on maritime activities in North & Central Bay of Bengal.'}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-red-900 dark:text-red-200 leading-relaxed">
                    <p>
                      • <strong>{isHindi ? 'गहरे समुद्र प्रतिबंध:' : 'Deep Sea Ban:'}</strong>{' '}
                      {isHindi 
                        ? 'मछुआरों को उत्तर और उससे सटे मध्य बंगाल की खाड़ी में न जाने की सख्त सलाह दी जाती है।' 
                        : 'Fishermen are strictly advised not to venture into north and adjoining central Bay of Bengal.'}
                    </p>
                    <p>
                      • <strong>{isHindi ? 'बंदरगाह संकेत:' : 'Port Signals:'}</strong>{' '}
                      {isHindi 
                        ? 'ओडिशा के पारादीप और धामरा बंदरगाहों पर संकेत संख्या 10 फहराया गया है।' 
                        : 'Signal No. 10 hoisted at Paradip and Dhamra Ports in Odisha.'}
                    </p>
                    <p>
                      • <strong>{isHindi ? 'ज्वारीय जलभराव:' : 'Tidal Inundation:'}</strong>{' '}
                      {isHindi 
                        ? 'तटीय केंद्रपड़ा और भद्रक में 1.5 से 2.0 मीटर की तूफानी लहर की संभावना है।' 
                        : 'Storm surge of 1.5 to 2.0 m expected in coastal Kendrapara and Bhadrak.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-red-200/80 dark:border-red-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-red-800 dark:text-red-400 block font-semibold">
                        {isHindi ? 'तटरक्षक खोज व बचाव (24x7)' : 'Coast Guard 24x7 SAR'}
                      </span>
                      <a href="tel:1554" className="text-base font-black text-red-700 dark:text-red-300 hover:underline">
                        1554
                      </a>
                    </div>
                    <span className="text-[10px] font-bold bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                      {isHindi ? 'टोल-फ्री' : 'Toll-Free'}
                    </span>
                  </div>
                </div>

                {/* Port Warning Signals Guide */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <Anchor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider font-heading">
                      {isHindi ? 'आईएमडी बंदरगाह चेतावनी संकेत संदर्भ' : 'IMD Port Warning Signals Guide'}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    {PORT_SIGNALS.map((ps, idx) => (
                      <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-0.5">
                          <span className="font-heading font-black">{ps.signal}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                            {ps.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">
                          {isHindi ? ps.descHindi : ps.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Divider between sections when viewing All */}
        {activeTab === 'all' && (
          <div className="pt-4 pb-2">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-2" />
          </div>
        )}

        {/* =========================================================================
             VIEW 2: CITIZEN SAFETY PROTOCOL, SURVIVAL KIT & EMERGENCY HELPLINES
             ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'safety') && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header & Phase Switcher */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {isHindi ? 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) प्रोटोकॉल' : 'National Disaster Management Authority (NDMA) Protocol'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
                  {isHindi ? 'आपदा सुरक्षा प्रोटोकॉल: क्या करें और क्या न करें' : "Disaster Safety Protocol: Do's & Don'ts"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isHindi 
                    ? 'गंभीर चक्रवात आपात स्थिति, तूफानी लहरों और लैंडफॉल के दौरान जीवन एवं संपत्ति की सुरक्षा के लिए आधिकारिक दिशा-निर्देश।' 
                    : 'Official life-saving instructions and citizen action guidelines before, during, and after severe cyclonic storm landfall.'}
                </p>
              </div>

              {/* Phase Selector Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold shrink-0">
                <button
                  onClick={() => setSafetyPhase('before')}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    safetyPhase === 'before' 
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? '१. पूर्व-तैयारी (Before)' : '1. Before Cyclone'}
                </button>
                <button
                  onClick={() => setSafetyPhase('during')}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    safetyPhase === 'during' 
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? '२. लैंडफॉल के दौरान (During)' : '2. During Landfall'}
                </button>
                <button
                  onClick={() => setSafetyPhase('after')}
                  className={`px-3 sm:px-4 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    safetyPhase === 'after' 
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? '३. बाद में रिकवरी (After)' : '3. After Storm'}
                </button>
              </div>
            </div>

            {/* 2-Column Do's vs Don'ts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* Essential Actions (Do's) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2 font-heading">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'आवश्यक कार्य (क्या करें)' : 'Essential Actions (Do\'s)'}</span>
                </h3>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {safetyPhase === 'before' && (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'घर की छत, दरवाजे और खिड़कियों की मजबूती जांचें; ढीली टीन शेड या छज्जों को कसकर बांधें।' : 'Inspect home roof, doors, and windows; secure loose tin sheets and external structures.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'सूखा राशन, पीने का साफ पानी, प्राथमिक चिकित्सा किट और जरूरी दवाएं कम से कम 3 दिनों के लिए सुरक्षित रखें।' : 'Stock non-perishable food, clean drinking water, first-aid kit, and essential medications for 3 days.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'मोबाइल फोन और पावर बैंक पूरी तरह चार्ज रखें; जरूरी दस्तावेज वाटरप्रूफ बैग में रखें।' : 'Keep mobile phones and power banks fully charged; secure documents in waterproof plastic sleeves.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'यदि आपका घर कच्चे निर्माण में है या निचले तटीय क्षेत्र में है, तो प्रशासन द्वारा बताए गए चक्रवात आश्रय स्थल में तुरंत जाएं।' : 'Evacuate promptly to the nearest designated cyclone shelter if living in kuccha house or low-lying coastal surge zone.'}</span>
                      </li>
                    </>
                  )}
                  {safetyPhase === 'during' && (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'बिजली के मुख्य स्विच (Mains) तुरंत बंद करें और रसोई गैस सिलेंडर को कसकर बंद रखें।' : 'Switch off main electrical power breakers and close LPG cylinder valves securely.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'खिड़कियों और कांच के दरवाजों से दूर घर के सबसे मजबूत केंद्रीय कमरे में ही शरण लें।' : 'Stay in the strongest central room of your home or concrete shelter away from glass windows and doors.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'ताज़ा मौसम अपडेट और प्रशासनिक निर्देशों के लिए केवल स्थानीय रेडियो और आधिकारिक VAYU पोर्टल सुनें।' : 'Keep listening to official transistor radio bulletins and VAYU portal alerts for verified emergency updates.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'पालतू मवेशियों और जानवरों को खूंटे से खोल दें ताकि वे अपनी जान बचाने के लिए ऊंचे स्थान पर जा सकें।' : 'Untie cattle and livestock so they can seek refuge on higher ground during flash flooding.'}</span>
                      </li>
                    </>
                  )}
                  {safetyPhase === 'after' && (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'जब तक प्रशासन द्वारा आधिकारिक रूप से "ऑल क्लियर" घोषित न हो, तब तक सुरक्षित आश्रय स्थल में ही रहें।' : 'Remain inside the shelter until disaster authorities give an official "All Clear" declaration.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'पीने का पानी हमेशा उबालकर पिएं या क्लोरीन की गोलियों का उपयोग करें ताकि जलजनित रोगों से बचा जा सके।' : 'Boil drinking water thoroughly or treat with chlorination tablets to prevent waterborne epidemic diseases.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'टूटे बिजली के खंभों, तारों और दूषित पानी की जानकारी तुरंत जिला हेल्पलाइन नंबरों पर दें।' : 'Promptly report severed electrical lines, fallen trees, and contaminated reservoirs to district emergency numbers.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{isHindi ? 'मकान में दोबारा प्रवेश करने से पहले उसकी संरचनात्मक मजबूती और गैस रिसाव की सावधानीपूर्वक जांच करें।' : 'Check structural integrity and ensure no LPG gas leak before re-entering home.'}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Avoid Hazards (Don'ts) */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-2 font-heading">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>{isHindi ? 'इन खतरों से बचें (क्या न करें)' : "Avoid These Hazards (Don'ts)"}</span>
                </h3>

                <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {safetyPhase === 'before' && (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'रेडियो, टीवी या वायु पोर्टल पर प्रसारित आधिकारिक चेतावनियों को कभी भी नजरअंदाज न करें।' : 'Do not disregard official warnings broadcasted on radio, TV, or VAYU portal.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'सोशल मीडिया पर असत्यापित अफवाहों पर विश्वास न करें और न ही उन्हें आगे प्रसारित करें।' : 'Do not believe or propagate unverified rumors, forwards, or sensational audio clips on social media.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'ऊंची लहरों को देखने या फोटो/वीडियो खींचने के लिए समुद्र तटों या नदी किनारों पर कदापि न जाएं।' : 'Never go near beaches, seawalls, or riverbanks to watch or photograph high surf and storm surges.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'समुद्री मछुआरों को समुद्र में नाव ले जाने की सख्त मनाही है; नावों को सुरक्षित बांधें।' : 'Fishermen must not venture into the sea; secure fishing trawlers firmly to high moorings.'}</span>
                      </li>
                    </>
                  )}
                  {safetyPhase === 'during' && (
                    <>
                      <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>
                          <strong className="text-red-700 dark:text-red-300">{isHindi ? 'अति महत्वपूर्ण चेतावनी:' : 'CRITICAL WARNING:'}</strong>{' '}
                          {isHindi 
                            ? 'जब अचानक हवा रुक जाए और शांति छा जाए, तो बाहर न निकलें - यह चक्रवात की "आंख" (Eye) हो सकती है; इसके तुरंत बाद विपरीत दिशा से भयानक विनाशकारी हवाएं शुरू हो जाती हैं।' 
                            : 'Do NOT go outside when winds suddenly stop — this is the deceptive calm "Eye" of the cyclone; violent gale winds resume violently from the opposite direction within minutes.'}
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'तेज आकाशीय बिजली और मूसलाधार बारिश के दौरान बिजली के भारी उपकरण न चलाएं।' : 'Do not operate electrical appliances or use corded devices during severe thunderstorm lightning.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'पुराने या क्षतिग्रस्त भवनों, टीन के शेड और बड़े पेड़ों के नीचे कभी शरण न लें।' : 'Never take shelter under old dilapidated buildings, tin canopies, or heavy roadside trees.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'जलभराव वाली सड़कों पर वाहन न चलाएं; गहरे बहाव में गाड़ी बह सकती है।' : 'Do not drive vehicles across waterlogged bridges or causeways; moving water can sweep cars away.'}</span>
                      </li>
                    </>
                  )}
                  {safetyPhase === 'after' && (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'जमीन पर गिरे बिजली के तारों, ढीले तारों या पानी में डूबे धातु के ढांचों को भूलकर भी न छुएं।' : 'Do not touch fallen electric wires, broken poles, or submerged metal barricades.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'क्षतिग्रस्त या पानी से भरे भवनों में बिना सुरक्षा जांच के प्रवेश न करें।' : 'Do not enter structurally damaged, flooded, or unstable masonry buildings.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'बाढ़ के पानी में जमा हुआ खुला या बासी भोजन न खाएं।' : 'Do not consume open food that came into contact with cyclone or flood waters.'}</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{isHindi ? 'राहत और बचाव कार्यों में बाधा न डालें और अनावश्यक भीड़ न लगाएं।' : 'Avoid sightseeing or gathering in crowds that impede rescue and NDRF medical convoys.'}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

            </div>

            {/* Emergency Survival Kit Checklist */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <PackageCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider">
                    {isHindi ? 'नागरिक चक्रवात आपातकालीन किट चेकलिस्ट' : 'Citizen Cyclone Emergency Survival Kit Checklist'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isHindi ? 'तूफान के आने से पहले इस किट को एक जगह तैयार रखें।' : 'Keep these essential supplies packed together in an easy-to-carry waterproof bag before landfall.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {SURVIVAL_ITEMS.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block font-heading">
                      {isHindi ? item.nameHindi : item.name}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {isHindi ? item.descHindi : item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Helplines Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {EMERGENCY_HELPLINES.map((hl, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      {isHindi ? hl.nameHindi : hl.name}
                    </span>
                    <a 
                      href={`tel:${hl.num.replace(/[^0-9]/g, '')}`} 
                      className="text-2xl font-heading font-black text-red-700 dark:text-red-400 hover:underline flex items-center gap-2"
                    >
                      <PhoneCall className="w-5 h-5 text-red-600" />
                      <span>{hl.num}</span>
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                    {isHindi ? hl.descHindi : hl.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 {isHindi ? 'पृथ्वी विज्ञान मंत्रालय, भारत सरकार। सर्वाधिकार सुरक्षित।' : 'Ministry of Earth Sciences, Government of India. All Rights Reserved.'}
          </div>
          <div className="flex items-center gap-5 text-slate-600 dark:text-slate-400 font-medium">
            <a href="https://moes.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">
              {isHindi ? 'एमओईएस' : 'MoES'}
            </a>
            <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">
              {isHindi ? 'आईएमडी' : 'IMD'}
            </a>
            <a href="https://www.mosdac.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">
              {isHindi ? 'मोसडैक' : 'MOSDAC'}
            </a>
            <a href="https://ndma.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">
              {isHindi ? 'एनडीएमए' : 'NDMA'}
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default SafetyUpdates;
