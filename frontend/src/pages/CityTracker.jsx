import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowUpRight, Search, MapPin, 
  PhoneCall, Filter
} from 'lucide-react';
import { COASTAL_CITIES_DATA } from '../data/coastalCitiesData';
import PublicNavbar from '../components/PublicNavbar';

const STATE_OPTIONS = [
  { id: 'ALL', name: 'All States & UTs', nameHindi: 'सभी राज्य व केंद्र शासित प्रदेश' },
  { id: 'Odisha', name: 'Odisha', nameHindi: 'ओडिशा' },
  { id: 'West Bengal', name: 'West Bengal', nameHindi: 'पश्चिम बंगाल' },
  { id: 'Andhra Pradesh', name: 'Andhra Pradesh', nameHindi: 'आंध्र प्रदेश' },
  { id: 'Tamil Nadu', name: 'Tamil Nadu', nameHindi: 'तमिलनाडु' },
  { id: 'Gujarat', name: 'Gujarat', nameHindi: 'गुजरात' },
  { id: 'Maharashtra', name: 'Maharashtra', nameHindi: 'महाराष्ट्र' },
  { id: 'Goa', name: 'Goa', nameHindi: 'गोवा' },
  { id: 'Kerala', name: 'Kerala', nameHindi: 'केरल' },
  { id: 'Karnataka', name: 'Karnataka', nameHindi: 'कर्नाटक' },
  { id: 'Puducherry', name: 'Puducherry', nameHindi: 'पुडुचेरी' },
  { id: 'Andaman & Nicobar Islands', name: 'Andaman & Nicobar', nameHindi: 'अंडमान व निकोबार' },
  { id: 'Lakshadweep', name: 'Lakshadweep', nameHindi: 'लक्षद्वीप' }
];

const CityTracker = () => {
  const navigate = useNavigate();
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

  // Font size offset
  const [fontSizeOffset, setFontSizeOffset] = useState(0);

  // Scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL'); // ALL, HOTSPOT, TRENDING, RED, ORANGE, PORTS
  const [selectedCityId, setSelectedCityId] = useState(null);

  // Filter 100+ cities based on search, state, and category
  const filteredCities = useMemo(() => {
    return COASTAL_CITIES_DATA.filter((place) => {
      // State filter
      if (selectedState !== 'ALL' && place.state !== selectedState) {
        return false;
      }

      // Category / Tag filter
      if (activeCategoryFilter === 'HOTSPOT' && !place.isDangerHotspot) {
        return false;
      }
      if (activeCategoryFilter === 'TRENDING' && !place.isTrending) {
        return false;
      }
      if (activeCategoryFilter === 'RED' && place.level !== 'red') {
        return false;
      }
      if (activeCategoryFilter === 'ORANGE' && place.level !== 'orange') {
        return false;
      }
      if (activeCategoryFilter === 'PORTS' && !place.category.toLowerCase().includes('port')) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = place.name.toLowerCase().includes(q);
        const matchesState = place.state.toLowerCase().includes(q);
        const matchesCategory = place.category.toLowerCase().includes(q);
        const matchesHistory = place.historicalEvent.toLowerCase().includes(q);
        return matchesName || matchesState || matchesCategory || matchesHistory;
      }

      return true;
    });
  }, [selectedState, activeCategoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col transition-colors duration-500 overflow-x-hidden w-full max-w-full">
      
<<<<<<< HEAD
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
=======
      {/* =========================================================================
           TOP APEX NAVIGATION BAR (ALWAYS AT TOP)
           ========================================================================= */}
      <header className="sticky top-0 z-[1000] w-full bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-neutral-800/80 transition-colors duration-500">
        {/* 2px National Tricolor Stripe */}
        <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
              title={isHindi ? "राष्ट्रीय चक्रवात पोर्टल पर वापस जाएं" : "Return to National Cyclone Portal"}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? 'राष्ट्रीय पोर्टल पर वापस जाएं' : 'Back to National Portal'}</span>
              <span className="sm:hidden">{isHindi ? 'वापस' : 'Back'}</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isHindi ? 'शहर व तटीय निगरानी' : 'City & Coastal Watch'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {isHindi ? '110+ स्थान' : '110+ Locations'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{isHindi ? 'सार्वजनिक मौसम सूचना • शून्य लॉगिन' : 'Open Public Intelligence • Zero Login Required'}</span>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleHindi}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
              title={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
            >
              {isHindi ? 'English' : 'हिन्दी'}
            </button>

            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span className="hidden sm:inline">{isHindi ? 'हेल्पलाइन: 112' : 'Helpline: 112'}</span>
              <span className="sm:hidden">112</span>
            </a>
          </div>

        </div>
      </header>
>>>>>>> cc3d2e13df6885b2e4121917d30b75b1144bde5c

      {/* =========================================================================
           SEARCH & BROWSE 100+ COASTAL CITIES & DANGER DIRECTORY
           ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
        
        {/* Search & State Selector Controls Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-950 dark:text-white">
                {isHindi ? 'राष्ट्रीय तटीय निर्देशिका (110+ निगरानी किए गए स्थान)' : 'National Coastal Directory (110+ Monitored Places)'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi 
                  ? 'किसी भी शहर, बंदरगाह, द्वीप या ऐतिहासिक चक्रवात लैंडफॉल केंद्र का निरीक्षण करने के लिए नीचे अपना राज्य चुनें या खोजें।'
                  : 'Select your state or search below to inspect any city, port, island, or historical cyclone landfall hub.'}
              </p>
            </div>

            {/* Instant Search Box */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHindi ? "शहर, बंदरगाह, समुद्र तट खोजें (उदा. बालेश्वर, दीघा, पुरी)..." : "Search city, port, beach (e.g. Balasore, Digha, Mundra, Puri)..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {isHindi ? 'हटाएं' : 'Clear'}
                </button>
              )}
            </div>
          </div>

          {/* State Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{isHindi ? 'राज्य:' : 'State:'}</span>
            </span>
            {STATE_OPTIONS.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedState(st.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedState === st.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isHindi ? (st.nameHindi || st.name) : st.name}
              </button>
            ))}
          </div>

          {/* Special Category & Severity Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {isHindi ? 'फ़िल्टर करें:' : 'Filter by:'}
              </span>
              {[
                { id: 'ALL', label: isHindi ? 'सभी स्थान' : 'All Places' },
                { id: 'HOTSPOT', label: isHindi ? '🔥 लैंडफॉल हॉटस्पॉट' : '🔥 Landfall Hotspots' },
                { id: 'TRENDING', label: isHindi ? '⚡ सक्रिय खतरा' : '⚡ Trending Threat' },
                { id: 'RED', label: isHindi ? '🔴 रेड अलर्ट' : '🔴 Red Alert' },
                { id: 'ORANGE', label: isHindi ? '🟠 ऑरेंज अलर्ट' : '🟠 Orange Alert' },
                { id: 'PORTS', label: isHindi ? '⚓ वाणिज्यिक एवं मत्स्य बंदरगाह' : '⚓ Commercial & Fishing Ports' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveCategoryFilter(f.id)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeCategoryFilter === f.id
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {isHindi ? `दिखाए जा रहे हैं ` : `Showing `}
              <strong className="text-slate-900 dark:text-white">{filteredCities.length}</strong>
              {isHindi ? ` स्थान` : ` locations`}
            </span>
          </div>

        </div>

        {/* Directory Grid of 100+ Coastal Places */}
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCities.map((item) => {
              const isRed = item.level === 'red';
              const isOrange = item.level === 'orange';

              const borderTheme = isRed
                ? 'border-red-200 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-700'
                : isOrange
                ? 'border-orange-200 dark:border-orange-900/60 hover:border-orange-300 dark:hover:border-orange-700'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';

              const badgeTheme = isRed
                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                : isOrange
                ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                : item.level === 'yellow'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(`/state/${item.stateSlug}`)}
                  className={`bg-white dark:bg-slate-900/90 border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 group ${borderTheme}`}
                  title={isHindi ? `${item.state} के लिए संपूर्ण मौसम और चक्रवात जानकारी खोलें` : `Click to open full weather & cyclone intelligence for ${item.state}`}
                >
                  
                  {/* Card Header: Location Name & Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        <h3 className="text-lg font-heading font-black text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${badgeTheme}`}>
                        {item.alert}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.state}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                    </div>
                  </div>

                  {/* Micro Weather Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{isHindi ? 'हवा' : 'Wind'}</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{item.wind}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{isHindi ? 'भंवर दूरी' : 'Vortex Fix'}</span>
                      <strong className="text-slate-900 dark:text-white font-bold truncate block">{item.distToEye}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">{isHindi ? 'लहर' : 'Surge'}</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 font-bold">{item.surge}</strong>
                    </div>
                  </div>

                  {/* Historical Landmark Cyclone Tag */}
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">{isHindi ? 'चक्रवात रिकॉर्ड: ' : 'Cyclone Record: '}</span>
                    <span>{item.historicalEvent}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-sky-600 dark:text-sky-400 font-bold text-[11px] flex items-center gap-1">
                      <span>{isHindi ? 'जांचने के लिए क्लिक करें' : 'Click to Inspect'}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/state/${item.stateSlug}`);
                      }}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold text-[11px] transition-colors"
                    >
                      {item.state} {isHindi ? 'पृष्ठ →' : 'Page →'}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isHindi ? 'कोई मेल खाता स्थान नहीं मिला' : 'No matching locations found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {isHindi 
                ? `आपके फ़िल्टर "${searchQuery}" से कोई तटीय शहर या बंदरगाह मेल नहीं खाता। दूसरा राज्य चुनकर देखें या खोज साफ़ करें।`
                : `No coastal city or port matched your filter "${searchQuery}". Try selecting another state or clear your search input.`}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedState('ALL');
                setActiveCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
            >
              {isHindi ? 'सभी फ़िल्टर रीसेट करें' : 'Reset All Filters'}
            </button>
          </div>
        )}

      </section>

      {/* =========================================================================
           PUBLIC FOOTER
           ========================================================================= */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong className="text-slate-900 dark:text-white font-bold block">
              {isHindi ? 'राष्ट्रीय तटीय चक्रवात एवं मौसम विज्ञान निर्देशिका' : 'National Coastal Cyclone & Weather Intelligence Directory'}
            </strong>
            <span>
              {isHindi 
                ? 'भारत सरकार • पृथ्वी विज्ञान मंत्रालय (MoES) एवं भारत मौसम विज्ञान विभाग (IMD)' 
                : 'Government of India • Ministry of Earth Sciences (MoES) & India Meteorological Department (IMD)'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-slate-950 dark:hover:text-white font-semibold cursor-pointer"
            >
              {isHindi ? 'शीर्ष पर वापस जाएं ↑' : 'Back to Top ↑'}
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/')}
              className="hover:text-slate-950 dark:hover:text-white font-semibold cursor-pointer"
            >
              {isHindi ? 'राष्ट्रीय पोर्टल' : 'National Portal'}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CityTracker;
