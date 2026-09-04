import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, Search, Waves, ArrowUpRight, Info, PhoneCall, ChevronRight
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const DISTRICT_ROWS = [
  { 
    state: 'Odisha', 
    stateHindi: 'ओडिशा',
    slug: 'odisha', 
    district: 'Balasore', 
    districtHindi: 'बालेश्वर',
    alert: 'Red Alert', 
    alertHindi: 'रेड अलर्ट',
    level: 'red',
    wind: '110-120 km/h', 
    windHindi: '110-120 किमी/घंटा',
    gusts: '140 km/h',
    gustsHindi: '140 किमी/घंटा',
    windPercent: 95,
    surge: '2.0-3.0 m', 
    surgeHindi: '2.0-3.0 मीटर',
    surgePercent: 90,
    rainfall: 'Torrential (>200 mm)',
    rainfallHindi: 'मूसलाधार (>200 मिमी)',
    readiness: 'Shelters Activated (100%)', 
    readinessHindi: '100% आश्रय स्थल सक्रिय',
    stations: ['Chandipur Coast', 'Soro Port'],
    stationsHindi: ['चांदीपुर तट', 'सोरो पोर्ट'],
    controlRoom: '06782-262261'
  },
  { 
    state: 'Odisha', 
    stateHindi: 'ओडिशा',
    slug: 'odisha', 
    district: 'Bhadrak', 
    districtHindi: 'भद्रक',
    alert: 'Red Alert', 
    alertHindi: 'रेड अलर्ट',
    level: 'red',
    wind: '110-120 km/h', 
    windHindi: '110-120 किमी/घंटा',
    gusts: '135 km/h',
    gustsHindi: '135 किमी/घंटा',
    windPercent: 95,
    surge: '2.0-3.0 m', 
    surgeHindi: '2.0-3.0 मीटर',
    surgePercent: 90,
    rainfall: 'Torrential (220 mm)',
    rainfallHindi: 'मूसलाधार (220 मिमी)',
    readiness: 'Shelters Activated', 
    readinessHindi: 'आश्रय स्थल सक्रिय',
    stations: ['Dhamra Port', 'Basudevpur'],
    stationsHindi: ['धामरा बंदरगाह', 'बासुदेवपुर'],
    controlRoom: '06784-251201'
  },
  { 
    state: 'Odisha', 
    stateHindi: 'ओडिशा',
    slug: 'odisha', 
    district: 'Kendrapara', 
    districtHindi: 'केंद्रपड़ा',
    alert: 'Red Alert', 
    alertHindi: 'रेड अलर्ट',
    level: 'red',
    wind: '100-115 km/h', 
    windHindi: '100-115 किमी/घंटा',
    gusts: '130 km/h',
    gustsHindi: '130 किमी/घंटा',
    windPercent: 88,
    surge: '1.5-2.0 m', 
    surgeHindi: '1.5-2.0 मीटर',
    surgePercent: 75,
    rainfall: 'Very Heavy (190 mm)',
    rainfallHindi: 'अत्यधिक भारी (190 मिमी)',
    readiness: 'Evacuation in Progress', 
    readinessHindi: 'सुरक्षित निकासी जारी',
    stations: ['Rajnagar Delta', 'Mahakalapada'],
    stationsHindi: ['राजनगर डेल्टा', 'महाकालपड़ा'],
    controlRoom: '06727-232145'
  },
  { 
    state: 'Odisha', 
    stateHindi: 'ओडिशा',
    slug: 'odisha', 
    district: 'Puri', 
    districtHindi: 'पुरी',
    alert: 'Orange Alert', 
    alertHindi: 'ऑरेंज अलर्ट',
    level: 'orange',
    wind: '80-95 km/h', 
    windHindi: '80-95 किमी/घंटा',
    gusts: '115 km/h',
    gustsHindi: '115 किमी/घंटा',
    windPercent: 75,
    surge: '1.0-1.5 m', 
    surgeHindi: '1.0-1.5 मीटर',
    surgePercent: 55,
    rainfall: 'Heavy Rain (160 mm)',
    rainfallHindi: 'भारी वर्षा (160 मिमी)',
    readiness: 'High Vigil • Beach Ban', 
    readinessHindi: 'उच्च सतर्कता • समुद्र तट प्रतिबंध',
    stations: ['Puri Seafront', 'Konark Marine'],
    stationsHindi: ['पुरी समुद्र तट', 'कोणार्क मरीन'],
    controlRoom: '06752-223230'
  },
  { 
    state: 'West Bengal', 
    stateHindi: 'पश्चिम बंगाल',
    slug: 'west-bengal', 
    district: 'East Medinipur', 
    districtHindi: 'पूर्व मेदिनीपुर',
    alert: 'Red Alert', 
    alertHindi: 'रेड अलर्ट',
    level: 'red',
    wind: '90-110 km/h', 
    windHindi: '90-110 किमी/घंटा',
    gusts: '125 km/h',
    gustsHindi: '125 किमी/घंटा',
    windPercent: 85,
    surge: '1.5-2.0 m', 
    surgeHindi: '1.5-2.0 मीटर',
    surgePercent: 75,
    rainfall: 'Torrential (200 mm)',
    rainfallHindi: 'मूसलाधार (200 मिमी)',
    readiness: 'Coastal Warning Hoisted', 
    readinessHindi: 'तटीय चेतावनी जारी',
    stations: ['Digha Sea Beach', 'Haldia Port'],
    stationsHindi: ['दीघा समुद्र तट', 'हल्दिया बंदरगाह'],
    controlRoom: '03228-263124'
  },
  { 
    state: 'West Bengal', 
    stateHindi: 'पश्चिम बंगाल',
    slug: 'west-bengal', 
    district: 'South 24 Parganas', 
    districtHindi: 'दक्षिण 24 परगना',
    alert: 'Orange Alert', 
    alertHindi: 'ऑरेंज अलर्ट',
    level: 'orange',
    wind: '80-95 km/h', 
    windHindi: '80-95 किमी/घंटा',
    gusts: '120 km/h',
    gustsHindi: '120 किमी/घंटा',
    windPercent: 75,
    surge: '1.0-1.5 m', 
    surgeHindi: '1.0-1.5 मीटर',
    surgePercent: 55,
    rainfall: 'Heavy Rain (180 mm)',
    rainfallHindi: 'भारी वर्षा (180 मिमी)',
    readiness: 'Rough Sea Advisory Active', 
    readinessHindi: 'अशांत समुद्र चेतावनी सक्रिय',
    stations: ['Sagar Island', 'Kakdwip Trawler Base'],
    stationsHindi: ['सागर द्वीप', 'काकद्वीप ट्रॉलर बेस'],
    controlRoom: '033-24791010'
  },
  { 
    state: 'Andhra Pradesh', 
    stateHindi: 'आंध्र प्रदेश',
    slug: 'andhra-pradesh', 
    district: 'Srikakulam', 
    districtHindi: 'श्रीकाकुलम',
    alert: 'Orange Alert', 
    alertHindi: 'ऑरेंज अलर्ट',
    level: 'orange',
    wind: '70-85 km/h', 
    windHindi: '70-85 किमी/घंटा',
    gusts: '100 km/h',
    gustsHindi: '100 किमी/घंटा',
    windPercent: 65,
    surge: '0.5-1.0 m', 
    surgeHindi: '0.5-1.0 मीटर',
    surgePercent: 40,
    rainfall: 'Heavy Rain (140 mm)',
    rainfallHindi: 'भारी वर्षा (140 मिमी)',
    readiness: 'Disaster Teams Ready', 
    readinessHindi: 'आपदा राहत दल तैनात',
    stations: ['Kalingapatnam Port', 'Tekkali Coast'],
    stationsHindi: ['कलिंगपट्टनम बंदरगाह', 'टेक्काली तट'],
    controlRoom: '08942-240557'
  },
  { 
    state: 'Andhra Pradesh', 
    stateHindi: 'आंध्र प्रदेश',
    slug: 'andhra-pradesh', 
    district: 'Visakhapatnam', 
    districtHindi: 'विशाखापट्टनम',
    alert: 'Yellow Watch', 
    alertHindi: 'येलो वॉच',
    level: 'yellow',
    wind: '50-65 km/h', 
    windHindi: '50-65 किमी/घंटा',
    gusts: '85 km/h',
    gustsHindi: '85 किमी/घंटा',
    windPercent: 50,
    surge: '0.5 m', 
    surgeHindi: '0.5 मीटर',
    surgePercent: 25,
    rainfall: 'Moderate Rain (95 mm)',
    rainfallHindi: 'मध्यम वर्षा (95 मिमी)',
    readiness: 'Port Signal Hoisted (No. 3)', 
    readinessHindi: 'बंदरगाह संकेत संख्या 3 जारी',
    stations: ['Gangavaram Port', 'Bheemunipatnam'],
    stationsHindi: ['गंगावरम बंदरगाह', 'भीमुनिपट्टनम'],
    controlRoom: '0891-2560121'
  },
  { 
    state: 'Gujarat', 
    stateHindi: 'गुजरात',
    slug: 'gujarat', 
    district: 'Kutch Coast', 
    districtHindi: 'कच्छ तट',
    alert: 'Yellow Watch', 
    alertHindi: 'येलो वॉच',
    level: 'yellow',
    wind: '45-55 km/h', 
    windHindi: '45-55 किमी/घंटा',
    gusts: '65 km/h',
    gustsHindi: '65 किमी/घंटा',
    windPercent: 40,
    surge: '0.5 m', 
    surgeHindi: '0.5 मीटर',
    surgePercent: 20,
    rainfall: 'Squall Showers (40 mm)',
    rainfallHindi: 'तेज़ बौछारें (40 मिमी)',
    readiness: 'Deep Sea Advisory Active', 
    readinessHindi: 'गहरे समुद्र चेतावनी सक्रिय',
    stations: ['Jakhau Port', 'Mandvi Coast'],
    stationsHindi: ['जाखौ बंदरगाह', 'मांडवी तट'],
    controlRoom: '02832-250020'
  }
];

const ThreatMatrix = () => {
  const navigate = useNavigate();

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

  // Filter and Search States
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [matrixThreatFilter, setMatrixThreatFilter] = useState('All');

  const filteredDistricts = useMemo(() => {
    let list = DISTRICT_ROWS;
    if (stateFilter !== 'All') {
      list = list.filter(d => d.state === stateFilter);
    }
    if (matrixThreatFilter !== 'All') {
      list = list.filter(d => d.alert === matrixThreatFilter);
    }
    if (matrixSearchQuery.trim()) {
      const q = matrixSearchQuery.toLowerCase().trim();
      list = list.filter(d => 
        d.district.toLowerCase().includes(q) || 
        (d.districtHindi && d.districtHindi.toLowerCase().includes(q)) ||
        d.state.toLowerCase().includes(q) ||
        (d.stateHindi && d.stateHindi.toLowerCase().includes(q)) ||
        (d.stations && d.stations.some(s => s.toLowerCase().includes(q))) ||
        (d.stationsHindi && d.stationsHindi.some(s => s.toLowerCase().includes(q)))
      );
    }
    return list;
  }, [stateFilter, matrixThreatFilter, matrixSearchQuery]);

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
        
        {/* Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span>
                {isHindi ? 'सार्वजनिक प्रारंभिक चेतावनी मैट्रिक्स • निशुल्क एवं खुला डेटा' : 'Public Early Warning Threat Matrix • Free & Open Data'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
              {isHindi ? 'जिलावार तटीय आपदा चेतावनी मैट्रिक्स' : 'District-Wise Coastal Threat Matrix'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHindi 
                ? 'अधिकतम सतत हवाओं, ज्वारीय तूफानी लहरों, वर्षा और आश्रय स्थल सक्रियता स्थिति के लिए बहु-खतरा रेटिंग।' 
                : 'Multi-hazard ratings for peak sustained winds, tidal storm surges, rainfall, and shelter activation status.'}
            </p>
          </div>

          {/* Matrix Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={matrixSearchQuery}
              onChange={(e) => setMatrixSearchQuery(e.target.value)}
              placeholder={isHindi ? 'जिला, बंदरगाह या शहर खोजें...' : 'Search district, port, or city...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
            />
            {matrixSearchQuery && (
              <button
                onClick={() => setMatrixSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {isHindi ? 'हटाएं' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              {isHindi ? 'निगरानी किए जा रहे तटीय जिले' : 'Monitored Coastal Districts'}
            </span>
            <strong className="text-xl font-heading font-black text-slate-950 dark:text-white">
              {isHindi ? '9 सक्रिय जिले' : '9 Districts Active'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isHindi ? 'पूर्वी एवं पश्चिमी तटरेखा' : 'Eastern & Western Seaboard'}
            </span>
          </div>

          <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 block mb-0.5">
              {isHindi ? 'रेड अलर्ट (गंभीर खतरा)' : 'Red Alert (Severe Danger)'}
            </span>
            <strong className="text-xl font-heading font-black text-red-700 dark:text-red-300">
              {isHindi ? '4 जिले' : '4 Districts'}
            </strong>
            <span className="text-[10px] text-red-600/80 dark:text-red-400/80 block mt-0.5">
              {isHindi ? 'बालेश्वर, भद्रक, केंद्रपड़ा, मेदिनीपुर' : 'Balasore, Bhadrak, Kendrapara, Medinipur'}
            </span>
          </div>

          <div className="bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 block mb-0.5">
              {isHindi ? 'ऑरेंज अलर्ट (उच्च सतर्कता)' : 'Orange Alert (High Vigil)'}
            </span>
            <strong className="text-xl font-heading font-black text-orange-700 dark:text-orange-300">
              {isHindi ? '3 जिले' : '3 Districts'}
            </strong>
            <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 block mt-0.5">
              {isHindi ? 'पुरी, दक्षिण 24 परगना, श्रीकाकुलम' : 'Puri, South 24 Parganas, Srikakulam'}
            </span>
          </div>

          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">
              {isHindi ? 'येलो वॉच (एहतियाती निगरानी)' : 'Yellow Watch (Precautionary)'}
            </span>
            <strong className="text-xl font-heading font-black text-amber-700 dark:text-amber-300">
              {isHindi ? '2 जिले' : '2 Districts'}
            </strong>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-0.5">
              {isHindi ? 'विशाखापट्टनम, कच्छ तट' : 'Visakhapatnam, Kutch Coast'}
            </span>
          </div>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
          
          {/* State Filter Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">
              {isHindi ? 'राज्य:' : 'State:'}
            </span>
            {['All', 'Odisha', 'West Bengal', 'Andhra Pradesh', 'Gujarat'].map((st) => (
              <button
                key={st}
                onClick={() => setStateFilter(st)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  stateFilter === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isHindi 
                  ? (st === 'All' ? 'सभी' : st === 'Odisha' ? 'ओडिशा' : st === 'West Bengal' ? 'पश्चिम बंगाल' : st === 'Andhra Pradesh' ? 'आंध्र प्रदेश' : 'गुजरात') 
                  : st}
              </button>
            ))}
          </div>

          {/* Threat Severity Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">
              {isHindi ? 'खतरे का स्तर:' : 'Threat Level:'}
            </span>
            {['All', 'Red Alert', 'Orange Alert', 'Yellow Watch'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setMatrixThreatFilter(lvl)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  matrixThreatFilter === lvl
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isHindi 
                  ? (lvl === 'All' ? 'सभी' : lvl === 'Red Alert' ? 'रेड अलर्ट' : lvl === 'Orange Alert' ? 'ऑरेंज अलर्ट' : 'येलो वॉच') 
                  : lvl}
              </button>
            ))}
          </div>

        </div>

        {/* Threat Matrix Table */}
        {filteredDistricts.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900 space-y-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isHindi 
                ? `आपकी खोज "${matrixSearchQuery}" से कोई जिला मेल नहीं खाता।` 
                : `No districts matched your search "${matrixSearchQuery}".`}
            </p>
            <button
              onClick={() => {
                setMatrixSearchQuery('');
                setStateFilter('All');
                setMatrixThreatFilter('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold cursor-pointer"
            >
              {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900/90 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-5">{isHindi ? 'जिला एवं तटीय बंदरगाह' : 'District & Coastal Ports'}</th>
                  <th className="py-3.5 px-5">{isHindi ? 'राज्य' : 'State'}</th>
                  <th className="py-3.5 px-5">{isHindi ? 'खतरे का स्तर' : 'Threat Level'}</th>
                  <th className="py-3.5 px-5">{isHindi ? 'अपेक्षित हवा' : 'Expected Wind'}</th>
                  <th className="py-3.5 px-5">{isHindi ? 'ज्वारीय लहर' : 'Tidal Surge'}</th>
                  <th className="py-3.5 px-5">{isHindi ? '24 घंटे वर्षा चेतावनी' : '24h Rain Warning'}</th>
                  <th className="py-3.5 px-5">{isHindi ? 'तैयारी की स्थिति' : 'Readiness'}</th>
                  <th className="py-3.5 px-5 text-right">{isHindi ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredDistricts.map((row, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => navigate(`/state/${row.slug}`)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                    title={isHindi ? `${row.stateHindi || row.state} के लिए संपूर्ण मौसम और चक्रवात जानकारी खोलें` : `Click to open full weather & cyclone intelligence for ${row.state}`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                        <span>{isHindi ? (row.districtHindi || row.district) : row.district}</span>
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
                      </div>
                      {row.stations && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {row.stations.map((st, sidx) => (
                            <span key={sidx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                              {isHindi && row.stationsHindi && row.stationsHindi[sidx] ? row.stationsHindi[sidx] : st}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">
                      {isHindi ? (row.stateHindi || row.state) : row.state}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                        row.level === 'red' ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900' :
                        row.level === 'orange' ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900' :
                        'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.level === 'red' ? 'bg-red-500 animate-ping' :
                          row.level === 'orange' ? 'bg-orange-500' : 'bg-amber-500'
                        }`} />
                        <span>{isHindi ? (row.alertHindi || row.alert) : row.alert}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isHindi ? (row.windHindi || row.wind) : row.wind}
                      </div>
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            row.level === 'red' ? 'bg-red-500' :
                            row.level === 'orange' ? 'bg-orange-500' : 'bg-amber-500'
                          }`} 
                          style={{ width: `${row.windPercent || 70}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                        <Waves className="w-3.5 h-3.5" />
                        <span>{isHindi ? (row.surgeHindi || row.surge) : row.surge}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {isHindi ? 'उच्च ज्वार लहर' : 'High tide surge'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-blue-700 dark:text-blue-300 text-[11px] block">
                        {isHindi ? (row.rainfallHindi || row.rainfall) : row.rainfall}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {isHindi ? 'आईएमडी 24 घंटे मॉडल' : 'IMD 24h Model'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-medium text-slate-700 dark:text-slate-300 block">
                        {isHindi ? (row.readinessHindi || row.readiness) : row.readiness}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {isHindi ? 'जिला आपदा नियंत्रण:' : 'DEOC:'} {row.controlRoom}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/state/${row.slug}`);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all shadow-2xs cursor-pointer"
                      >
                        <span>{isHindi ? 'राज्य विवरण देखें →' : 'View State Intel →'}</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Public Guidance Tip */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              {isHindi 
                ? 'स्थानीय आश्रय स्थलों, वर्षा रडार और 24/7 आपदा नियंत्रण कक्ष नंबरों के साथ समर्पित राज्य मौसम पृष्ठ खोलने के लिए किसी भी जिले की पंक्ति पर क्लिक करें।' 
                : 'Click on any district row to open its dedicated state weather page with local shelter locations, rainfall radars, and 24/7 disaster control room phone numbers.'}
            </span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {isHindi ? '100% निःशुल्क एवं खुला पोर्टल' : '100% Free & Open Access'}
          </span>
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

export default ThreatMatrix;
