import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Compass,
  Umbrella,
  Eye,
  ShieldAlert,
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Radio,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import { CITY_FORECAST_DATA, getCityForecast } from '../data/cityForecastData';

// Helper to render lucide icon based on condition string
const renderWeatherIcon = (iconName, className = "w-6 h-6") => {
  switch (iconName) {
    case 'sun':
      return <Sun className={className} />;
    case 'rain':
      return <CloudRain className={className} />;
    case 'thunderstorm':
      return <CloudLightning className={className} />;
    case 'cloudy':
      return <Cloud className={className} />;
    case 'fog':
    case 'haze':
      return <CloudFog className={className} />;
    default:
      return <CloudSun className={className} />;
  }
};

const CityForecast = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();

  // Scroll to top on page load or city change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cityId]);

  // Global settings synced with localStorage
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('vayu_is_hindi') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try {
      const s = localStorage.getItem('vayu_font_offset');
      return s !== null ? parseInt(s, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSetHindi = (val) => {
    const nextVal = typeof val === 'function' ? val(isHindi) : val;
    setIsHindi(nextVal);
    localStorage.setItem('vayu_is_hindi', String(nextVal));
  };

  const handleSetDarkMode = (val) => {
    const nextVal = typeof val === 'function' ? val(isDarkMode) : val;
    setIsDarkMode(nextVal);
    if (nextVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch city forecast dataset
  const cityData = useMemo(() => {
    return getCityForecast(cityId);
  }, [cityId]);

  // Active selected day for detailed hourly view (defaults to Day 0: Today)
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Selected day object
  const activeDay = cityData.forecast7Days[selectedDayIdx] || cityData.forecast7Days[0];

  // List of all major cities for quick switcher
  const allCities = useMemo(() => {
    return Object.values(CITY_FORECAST_DATA);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Navigation Bar */}
      <PublicNavbar
        isHindi={isHindi}
        setIsHindi={handleSetHindi}
        isDarkMode={isDarkMode}
        setIsDarkMode={handleSetDarkMode}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={setFontSizeOffset}
        isScrolled={isScrolled}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* =========================================================================
             BREADCRUMB & BACK NAVIGATION
             ========================================================================= */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link
              to="/"
              className="hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHindi ? 'होम' : 'Home'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              to="/city-tracker"
              className="hover:text-sky-600 dark:hover:text-sky-400 font-semibold transition-colors"
            >
              {isHindi ? 'शहर व तटीय क्षेत्र' : 'Major Cities'}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold">
              {isHindi ? cityData.nameHindi : cityData.name} {isHindi ? '7-दिवसीय पूर्वानुमान' : '7-Day Forecast'}
            </span>
          </div>

          {/* Live Feed Status Tag */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isHindi ? 'इसरो मोसडैक उपग्रह डेटा' : 'ISRO MOSDAC Satellite Telemetry'}</span>
          </div>
        </div>

        {/* =========================================================================
             CITY QUICK SWITCHER PILLS (Switch between Mumbai, Chennai, Kolkata, etc.)
             ========================================================================= */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-2.5 sm:p-3 rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 text-sky-500" />
              {isHindi ? 'प्रमुख शहर:' : 'Quick Switch:'}
            </span>
            {allCities.map((c) => {
              const isCurrent = c.id === cityData.id;
              return (
                <button
                  key={c.id}
                  onClick={() => navigate(`/forecast/${c.id}`)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isCurrent
                      ? 'bg-sky-500 text-white shadow-xs scale-[1.03]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <span className="text-sm leading-none">{c.emoji}</span>
                  <span>{isHindi ? c.nameHindi : c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
             HERO 3D GLASS WEATHER BANNER
             ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 via-white/70 to-sky-50/70 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-950/80 backdrop-blur-2xl border border-white/90 dark:border-white/10 p-5 sm:p-7 shadow-[0_8px_32px_0_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {/* Ambient Glow Orbs behind glass */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-sky-400/20 dark:bg-sky-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-400/15 dark:bg-cyan-500/15 rounded-full blur-3xl" />
          {/* Top specular line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white dark:via-white/30 to-transparent" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Col: City Identity & Primary Condition */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{isHindi ? cityData.regionHindi : cityData.region}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>{cityData.coordinates}</span>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
                  {isHindi ? cityData.nameHindi : cityData.name}
                </h1>
                <span className="text-lg sm:text-xl font-bold text-slate-500 dark:text-slate-400">
                  ({isHindi ? cityData.name : cityData.nameHindi})
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {isHindi ? cityData.stateHindi : cityData.state}
                </span>
              </div>

              {/* Temperature & Big Weather Condition */}
              <div className="flex items-center gap-4 sm:gap-6 pt-2">
                <div className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter flex items-start">
                  <span>{cityData.temp}</span>
                  <span className="text-2xl sm:text-3xl text-sky-600 dark:text-sky-400 ml-1">°C</span>
                </div>

                <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-4xl sm:text-5xl" role="img" aria-label={cityData.condition}>
                    {cityData.emoji}
                  </span>
                  <div>
                    <div className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                      {isHindi ? cityData.conditionHindi : cityData.condition}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {isHindi ? 'अनुभूत तापमान: ' : 'Feels like: '}
                      <strong className="text-slate-800 dark:text-slate-200">{cityData.feelsLike}°C</strong>
                      {' • '}
                      {isHindi ? 'न्यूनतम/अधिकतम: ' : 'Min/Max: '}
                      <strong className="text-slate-800 dark:text-slate-200">{cityData.tempMin}° / {cityData.tempMax}°</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updated Time */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {isHindi ? 'अंतिम अवलोकन: ' : 'Observation Station ' + cityData.stationCode + ' • '}
                  {isHindi ? cityData.updatedAtHindi : cityData.updatedAt}
                </span>
              </div>
            </div>

            {/* Right Col: 6-Slot Micro Telemetry Grid */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Droplets className="w-5 h-5 mx-auto text-sky-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'आर्द्रता' : 'Humidity'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cityData.humidity}%</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Gauge className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'दबाव' : 'Pressure'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cityData.pressure}</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Eye className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'दृश्यता' : 'Visibility'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cityData.visibility}</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Sun className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'यूवी इंडेक्स' : 'UV Index'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cityData.uvIndex} ({cityData.uvCategory})</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Thermometer className="w-5 h-5 mx-auto text-rose-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'ओसांक' : 'Dew Point'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cityData.dewPoint}</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Cloud className="w-5 h-5 mx-auto text-sky-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'बादल' : 'Cloud Cover'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{cityData.cloudCover}</span>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
             THE 4 CORE REQUIRED METRIC CARDS (AQI, TEMP, PRECIPITATION, WIND SPEED/DIR)
             ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              {isHindi ? 'मौसम व पर्यावरण विश्लेषिकी (KEY METEOROLOGICAL TELEMETRY)' : 'KEY METEOROLOGICAL & AIR QUALITY TELEMETRY'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. AQI (Air Quality Index) Card */}
            <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/85 dark:border-white/10 p-4.5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Gauge className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isHindi ? 'वायु गुणवत्ता (AQI)' : 'Air Quality (AQI)'}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    cityData.aqi.statusColor === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : cityData.aqi.statusColor === 'orange'
                      ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    {isHindi ? cityData.aqi.categoryHindi : cityData.aqi.category}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                    {cityData.aqi.value}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 500 AQI Index</span>
                </div>

                {/* Meter Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cityData.aqi.value < 50
                        ? 'bg-emerald-500'
                        : cityData.aqi.value < 100
                        ? 'bg-sky-500'
                        : cityData.aqi.value < 150
                        ? 'bg-amber-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, (cityData.aqi.value / 300) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">PM2.5</span>
                    <strong className="text-slate-800 dark:text-slate-200">{cityData.aqi.pm25}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">PM10</span>
                    <strong className="text-slate-800 dark:text-slate-200">{cityData.aqi.pm10}</strong>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-3 bg-slate-50 dark:bg-white/[0.02] p-2 rounded-xl border border-slate-100 dark:border-white/5">
                {isHindi ? cityData.aqi.advisoryHindi : cityData.aqi.advisory}
              </p>
            </div>

            {/* 2. Temperature & Heat Index Card */}
            <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/85 dark:border-white/10 p-4.5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      <Thermometer className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isHindi ? 'तापमान (TEMPERATURE)' : 'TEMPERATURE'}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold border border-sky-500/25">
                    {cityData.temp} °C
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                    {cityData.temp}°C
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {isHindi ? 'अनुभूत: ' : 'Feels: '}{cityData.feelsLike}°C
                  </span>
                </div>

                <div className="space-y-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{isHindi ? 'दैनिक अधिकतम (Day Max):' : 'Day High:'}</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{cityData.tempMax}°C</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{isHindi ? 'दैनिक न्यूनतम (Night Low):' : 'Night Low:'}</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-extrabold">{cityData.tempMin}°C</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{isHindi ? 'ओसांक (Dew Point):' : 'Dew Point:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{cityData.dewPoint}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 p-2 rounded-xl text-[11px] text-sky-800 dark:text-sky-300 font-medium">
                {isHindi ? 'तटीय उष्णकटिबंधीय मौसम के कारण उच्च आर्द्रता व उमस प्रभावी है।' : 'High relative humidity amplifies thermal index across urban sectors.'}
              </div>
            </div>

            {/* 3. Precipitation Card */}
            <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/85 dark:border-white/10 p-4.5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      <Umbrella className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isHindi ? 'वर्षा (PRECIPITATION)' : 'PRECIPITATION'}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/25">
                    {cityData.precipitation.chance}%
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                    {cityData.precipitation.rate}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{isHindi ? 'वर्षा दर' : 'Current Rate'}</span>
                </div>

                {/* Rain probability bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                    style={{ width: `${cityData.precipitation.chance}%` }}
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'वर्षा प्रकार:' : 'Type:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{isHindi ? cityData.precipitation.typeHindi : cityData.precipitation.type}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'बीते 24 घंटे:' : 'Past 24h:'}</span>
                    <strong className="text-cyan-600 dark:text-cyan-400">{cityData.precipitation.past24h}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'आगामी 24 घंटे:' : 'Next 24h Outlook:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{cityData.precipitation.expected24h}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40 p-2 rounded-xl text-[11px] text-cyan-800 dark:text-cyan-300 font-medium">
                {isHindi ? 'डॉपलर रडार वर्षा की निरंतर निगरानी कर रहा है।' : 'Doppler radar reflectivity tracking local convective thunderstorm clouds.'}
              </div>
            </div>

            {/* 4. Wind Speed & Direction Card */}
            <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/85 dark:border-white/10 p-4.5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Wind className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isHindi ? 'हवा की गति व दिशा' : 'WIND & DIRECTION'}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/25">
                    {cityData.wind.speed}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white block">
                      {isHindi ? cityData.wind.directionHindi : cityData.wind.direction}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{cityData.wind.speed}</span>
                  </div>

                  {/* Compass Bearing Indicator */}
                  <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80 relative shadow-inner">
                    <Compass
                      className="w-7 h-7 text-emerald-600 dark:text-emerald-400 transition-transform duration-700"
                      style={{ transform: `rotate(${cityData.wind.bearing}deg)` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'हवा के झोंके (Gusts):' : 'Wind Gusts:'}</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{cityData.wind.gusts}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'कोण (Bearing):' : 'Bearing Angle:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{cityData.wind.bearing}° N</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'ब्यूफोर्ट पैमाना:' : 'Beaufort:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{cityData.wind.beaufortScale}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-2 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                {isHindi ? 'तटीय जहाजों और मछुआरों के लिए सामान्य परिचालन स्थिति।' : 'Coastal maritime advisory: Maintain vigilance along exposed jetties.'}
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
             7-DAY WEATHER FORECAST CARDS WITH EMOJIS (☀️, 🌧️, ☁️, ⛈️)
             ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-black text-slate-950 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                <span>{isHindi ? '7-दिवसीय विस्तृत मौसम पूर्वानुमान' : '7-DAY EXTENDED METEOROLOGICAL FORECAST'}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi
                  ? 'प्रत्येक दिन पर क्लिक करके विस्तृत प्रति घंटा अवलोकन (Hourly Breakdown) देखें।'
                  : 'Click any day card below to inspect detailed 24-hour intervals and hourly metrics.'}
              </p>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1">☀️ {isHindi ? 'धूप' : 'Sunny'}</span>
              <span className="flex items-center gap-1">🌧️ {isHindi ? 'वर्षा' : 'Rain'}</span>
              <span className="flex items-center gap-1">☁️ {isHindi ? 'बादल' : 'Cloud'}</span>
            </div>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {cityData.forecast7Days.map((dayItem, idx) => {
              const isSelected = idx === selectedDayIdx;

              return (
                <div
                  key={`${dayItem.day}-${idx}`}
                  onClick={() => setSelectedDayIdx(idx)}
                  className={`rounded-2xl p-3.5 transition-all duration-300 cursor-pointer flex flex-col justify-between text-center relative overflow-hidden backdrop-blur-xl border ${
                    isSelected
                      ? 'bg-sky-500/15 dark:bg-sky-400/15 border-sky-400 dark:border-sky-400 shadow-[0_8px_24px_rgba(2,132,199,0.22)] -translate-y-1 ring-2 ring-sky-400/40'
                      : 'bg-white/70 dark:bg-slate-900/60 border-white/80 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500/50 hover:bg-white/90 dark:hover:bg-slate-900/80 shadow-2xs hover:-translate-y-0.5'
                  }`}
                >
                  {/* Top Specular Glare */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white dark:via-white/20 to-transparent" />

                  {/* Day Title & Date */}
                  <div>
                    <div className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {isHindi ? dayItem.dayHindi : dayItem.day}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      {dayItem.date}
                    </div>

                    {/* BIG EMOJI as requested: ☀️, 🌧️, ☁️ */}
                    <div className="my-2 text-3xl sm:text-4xl hover:scale-115 transition-transform duration-200 select-none">
                      {dayItem.emoji}
                    </div>

                    {/* Condition Text */}
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1 leading-tight mb-2">
                      {isHindi ? dayItem.conditionHindi : dayItem.condition}
                    </div>
                  </div>

                  {/* Temperature Range */}
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-center gap-1.5 font-bold">
                      <span className="text-rose-600 dark:text-rose-400">{dayItem.tempMax}°</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-cyan-600 dark:text-cyan-400">{dayItem.tempMin}°</span>
                    </div>

                    {/* Precipitation pill */}
                    <div className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 py-0.5 px-1.5 rounded-md flex items-center justify-center gap-1">
                      <Umbrella className="w-2.5 h-2.5 text-sky-500" />
                      <span>{dayItem.precipChance}%</span>
                    </div>

                    {/* Wind */}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-none pt-0.5">
                      {dayItem.windSpeed} {dayItem.windDir}
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute inset-x-4 bottom-0 h-1 rounded-t-full bg-sky-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* =========================================================================
               DETAILED HOURLY TIMELINE FOR SELECTED DAY
               ========================================================================= */}
          {activeDay.hourly && activeDay.hourly.length > 0 && (
            <div className="mt-4 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/85 dark:border-white/10 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-heading font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    {isHindi
                      ? `${activeDay.dayHindi} (${activeDay.date}) - प्रति घंटा विस्तृत मौसम पूर्वानुमान`
                      : `${activeDay.day} (${activeDay.date}) - 24-Hour Detailed Interval Timeline`}
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {isHindi ? 'पूर्वानुमान स्थिति: ' : 'Condition: '}
                  <strong className="text-slate-800 dark:text-slate-200">
                    {isHindi ? activeDay.conditionHindi : activeDay.condition} {activeDay.emoji}
                  </strong>
                </span>
              </div>

              {/* Hourly Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {activeDay.hourly.map((h, hIdx) => (
                  <div
                    key={hIdx}
                    className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs hover:shadow-xs transition-all"
                  >
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block mb-1">
                      {h.time}
                    </span>
                    <span className="text-2xl block my-1">{h.emoji}</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      {h.temp}°C
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium block truncate">
                      {h.cond}
                    </span>
                    <div className="mt-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                      <span className="text-sky-600 dark:text-sky-400">🌧️ {h.rain}%</span>
                      <span>💨 {h.wind}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
             EARLY WARNING & SAFETY ADVISORY FOOTER BANNER
             ========================================================================= */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 border border-amber-500/25 p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white">
                {isHindi ? 'आधिकारिक चक्रवात एवं तटीय सुरक्षा चेतावनी' : 'Official Cyclone & Coastal Early Warning Advisory'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isHindi
                  ? 'ताजा उपग्रह रडार, तटीय खतरा मानचित्र और एनडीएमए सुरक्षा प्रोटोकॉल देखने के लिए पोर्टल का उपयोग करें।'
                  : 'Track live high-resolution Doppler GIS Radar, threat trajectories, and emergency safety protocols.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/threat-map"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>{isHindi ? 'खतरा मानचित्र देखें' : 'View Threat Map'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/safety-updates"
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all"
            >
              {isHindi ? 'सुरक्षा व बुलेटिन' : 'Safety & Bulletins'}
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
};

export default CityForecast;
