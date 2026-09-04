import React, { useState, useEffect } from 'react';
import { 
  FileText, AlertTriangle, Download, Bell, ExternalLink, 
  ShieldCheck, Anchor, Radio, Clock, ChevronRight
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

const Bulletins = () => {
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              {isHindi ? 'राष्ट्रीय चक्रवात चेतावनी केंद्र (NCWC), नई दिल्ली' : 'National Cyclone Warning Centre (NCWC), New Delhi'}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <Radio className="w-3.5 h-3.5" /> {isHindi ? 'लाइव जारी बुलेटिन' : 'Live Official Bulletins'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
            {isHindi ? 'आधिकारिक आईएमडी मौसम विज्ञान बुलेटिन' : 'Official IMD Meteorological Bulletins'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHindi 
              ? 'पृथ्वी विज्ञान मंत्रालय एवं भारत मौसम विज्ञान विभाग (IMD) द्वारा जारी आधिकारिक राष्ट्रीय मौसम चेतावनी एवं समुद्र सुरक्षा बुलेटिन।' 
              : 'Official national weather advisories, maritime warnings, and storm bulletins issued by the Ministry of Earth Sciences and IMD.'}
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Bulletins List */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Bulletin 14 Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-950 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {isHindi ? 'बुलेटिन संख्या 14' : 'BULLETIN NO. 14'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {isHindi ? 'आज 00:00 भारतीय मानक समय' : 'Today, 00:00 IST'}
                  </span>
                </div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2.5 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/40">
                  {isHindi ? 'रेड अलर्ट प्रभाव' : 'Red Alert Impact'}
                </span>
              </div>

              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isHindi ? 'आधिकारिक सलाह डाउनलोड करें (PDF)' : 'Download Official Advisory (PDF)'}</span>
                </button>
              </div>
            </div>

            {/* Genesis Advisory 03 Card */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-950 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {isHindi ? 'उत्पत्ति सलाह संख्या 03' : 'GENESIS ADVISORY NO. 03'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {isHindi ? 'कल 18:00 भारतीय मानक समय' : 'Yesterday, 18:00 IST'}
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                  {isHindi ? 'विकासशील निगरानी' : 'Developing Watch'}
                </span>
              </div>

              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isHindi ? 'उत्पत्ति सलाह डाउनलोड करें (PDF)' : 'Download Genesis Advisory (PDF)'}</span>
                </button>
              </div>
            </div>

            {/* Special Tropical Weather Outlook */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-950 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {isHindi ? 'विशेष उष्णकटिबंधीय दृष्टिकोण' : 'SPECIAL TROPICAL WEATHER OUTLOOK'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {isHindi ? 'नियमित 12:00 यूटीसी' : 'Regular 12:00 UTC'}
                  </span>
                </div>
                <span className="text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-900/40">
                  {isHindi ? 'उत्तर हिंद महासागर बेसिन' : 'North Indian Ocean Basin'}
                </span>
              </div>

              <h2 className="font-bold text-lg text-slate-900 dark:text-white">
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{isHindi ? '5-दिवसीय दृष्टिकोण डाउनलोड करें (PDF)' : 'Download 5-Day Outlook (PDF)'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Maritime Warnings & Port Signals */}
          <div className="space-y-6">
            
            {/* Maritime Sea Warning Box */}
            <div className="border border-red-200 dark:border-red-900/60 rounded-2xl bg-red-50/40 dark:bg-red-950/20 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-red-950 dark:text-red-200 flex items-center gap-2">
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

              <div className="pt-3 border-t border-red-200/80 dark:border-red-900/60">
                <span className="text-[11px] uppercase tracking-wider text-red-800 dark:text-red-400 block font-semibold">
                  {isHindi ? 'भारतीय तटरक्षक 24x7 खोज एवं बचाव' : 'Coast Guard 24x7 Search & Rescue'}
                </span>
                <span className="text-base font-bold text-red-700 dark:text-red-300">
                  1554 ({isHindi ? 'टोल-फ्री' : 'Toll-Free'})
                </span>
              </div>
            </div>

            {/* Port Warning Signals Guide */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Anchor className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {isHindi ? 'आईएमडी बंदरगाह चेतावनी संकेत संदर्भ' : 'IMD Port Warning Signals Guide'}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {PORT_SIGNALS.map((ps, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-0.5">
                      <span>{ps.signal}</span>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400">{ps.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      {isHindi ? ps.descHindi : ps.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

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

export default Bulletins;
