import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle2, XCircle, PhoneCall, AlertTriangle, 
  PackageCheck, Radio, LifeBuoy, HeartPulse, Shield
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

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
  { name: 'Sealed Bottled Water (3L per person/day)', nameHindi: 'सील बंद पीने का पानी (3 लीटर प्रति व्यक्ति/दिन)', desc: 'Plus chlorine / water purification tablets', descHindi: 'साथ में क्लोरीन / पानी शुद्ध करने की गोलियां' },
  { name: 'Comprehensive First Aid Kit & Prescriptions', nameHindi: 'प्राथमिक चिकित्सा किट व नियमित दवाएं', desc: 'Antiseptics, bandages, 7-day regular medicine', descHindi: 'पट्टी, एंटीसेप्टिक, 7 दिन की नियमित दवाएं' },
  { name: 'Waterproof Bag for Identity & Property Docs', nameHindi: 'दस्तावेजों के लिए वाटरप्रूफ बैग', desc: 'Aadhaar, land deeds, bank passbooks, cash', descHindi: 'आधार, जमीन के कागजात, पासबुक, नकदी' },
  { name: 'Charged Power Banks & Emergency Cables', nameHindi: 'चार्ज पावर बैंक व केबल', desc: 'Keep phone battery usage strictly optimized', descHindi: 'मोबाइल की बैटरी न्यूनतम उपयोग पर रखें' },
  { name: 'Sturdy Waterproof Footwear & Raincoats', nameHindi: 'मजबूत जूते व बरसाती (रेनकोट)', desc: 'Protection against flying debris & glass', descHindi: 'उड़ते मलबे व कांच से सुरक्षा हेतु' }
];

const SafetyGuide = () => {
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

  const [safetyTab, setSafetyTab] = useState('before'); // 'before' | 'during' | 'after'

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header & Phase Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {isHindi ? 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) दिशानिर्देश' : 'National Disaster Management Authority (NDMA) Protocol'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
              {isHindi ? 'आपदा सुरक्षा प्रोटोकॉल: क्या करें और क्या न करें' : "Disaster Safety Protocol: Do's & Don'ts"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHindi 
                ? 'गंभीर चक्रवात आपात स्थिति, तूफानी लहरों और लैंडफॉल के दौरान जीवन एवं संपत्ति की सुरक्षा के लिए आधिकारिक दिशा-निर्देश।' 
                : 'Official life-saving instructions and citizen action guidelines before, during, and after severe cyclonic storm landfall.'}
            </p>
          </div>

          {/* Phase Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setSafetyTab('before')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                safetyTab === 'before' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isHindi ? '१. पूर्व-तैयारी (Before)' : '1. Before Cyclone'}
            </button>
            <button
              onClick={() => setSafetyTab('during')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                safetyTab === 'during' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isHindi ? '२. लैंडफॉल के दौरान (During)' : '2. During Landfall'}
            </button>
            <button
              onClick={() => setSafetyTab('after')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                safetyTab === 'after' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isHindi ? '३. बाद में रिकवरी (After)' : '3. After Storm'}
            </button>
          </div>
        </div>

        {/* 2-Column Do's vs Don'ts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Essential Actions (Do's) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'आवश्यक कार्य (क्या करें)' : 'Essential Actions (Do\'s)'}</span>
            </h3>

            <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {safetyTab === 'before' && (
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
              {safetyTab === 'during' && (
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
              {safetyTab === 'after' && (
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
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{isHindi ? 'इन खतरों से बचें (क्या न करें)' : "Avoid These Hazards (Don'ts)"}</span>
            </h3>

            <ul className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {safetyTab === 'before' && (
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
              {safetyTab === 'during' && (
                <>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
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
              {safetyTab === 'after' && (
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
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-4">
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
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="font-bold text-slate-900 dark:text-white block">
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
            <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
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

export default SafetyGuide;
