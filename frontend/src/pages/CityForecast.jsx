import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
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
  ChevronLeft,
  Radio,
  ExternalLink,
  ChevronDown,
  Search,
  X,
  Check,
  Anchor,
  Sunrise,
  Sunset,
  Moon,
  CloudMoon,
  Loader2
} from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';
import IOSGlassCard from '../components/IOSGlassCard';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import { CITY_FORECAST_DATA, getCityForecast, getCityAstronomy } from '../data/cityForecastData';
import { COASTAL_CITIES_DATA } from '../data/coastalCitiesData';
import { useLiveClock } from '../utils/liveDateTime';
import { fetchGlobalLocationWeather, searchOnlineLocations } from '../services/weatherService';

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

// Helper to render weather icon inside the 48-hour hourly weather strip
const renderHourlyWeatherIcon = (icon) => {
  switch (icon) {
    case 'sun':
      return <Sun className="w-6 h-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]" />;
    case 'clear-night':
      return <Moon className="w-6 h-6 text-sky-600 dark:text-sky-200 drop-shadow-[0_0_6px_rgba(186,230,253,0.35)]" />;
    case 'cloud-sun':
      return <CloudSun className="w-6 h-6 text-amber-500 dark:text-amber-300" />;
    case 'cloud-night':
      return <CloudMoon className="w-6 h-6 text-slate-500 dark:text-slate-300" />;
    case 'rain':
    case 'night-rain':
      return <CloudRain className="w-6 h-6 text-sky-500 dark:text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.35)]" />;
    case 'thunderstorm':
      return <CloudLightning className="w-6 h-6 text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_6px_rgba(129,140,248,0.45)]" />;
    case 'fog':
      return <CloudFog className="w-6 h-6 text-slate-400 dark:text-slate-300" />;
    case 'sunrise':
      return <Sunrise className="w-6 h-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />;
    case 'sunset':
      return <Sunset className="w-6 h-6 text-orange-500 dark:text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />;
    case 'cloud':
    default:
      return <Cloud className="w-6 h-6 text-slate-400 dark:text-slate-200" />;
  }
};

// Generate dynamic, city-specific 48-hour forecast with tailored 2-hour interval cadence and true astronomical events
const generate48HourForecast = (city, isHindi, currentTime = new Date()) => {
  if (!city) return [];

  const profile = getCityAstronomy(city);
  const baseTemp = Number(city.temp) || 28;
  const forecastDays = Array.isArray(city.forecast7Days) ? city.forecast7Days : [];
  const day0 = forecastDays[0] || {};
  const pChance0 = day0.precipChance !== undefined ? day0.precipChance : (city.precipitation?.chance || 40);
  const condition = (city.condition || '').toLowerCase();

  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
  const rawPoints = [];

  const M_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const M_HI = ['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिस'];

  // Current real-time point ("Now" / "अभी")
  const nowDayNum = String(now.getDate()).padStart(2, '0');
  const nowDateStr = isHindi ? `${nowDayNum} ${M_HI[now.getMonth()]}` : `${nowDayNum} ${M_EN[now.getMonth()]}`;

  let nowIcon = 'cloud';
  let nowCondLabel = isHindi ? 'बादल' : 'Cloudy';
  const isRainyCity = condition.includes('rain') || condition.includes('storm') || condition.includes('squall') || pChance0 >= 50;

  const nowH = now.getHours();
  const nowMinOfDay = nowH * 60 + now.getMinutes();
  const isNowNight = nowMinOfDay < profile.sunriseMin || nowMinOfDay >= profile.sunsetMin;

  if (isRainyCity && pChance0 >= 40) {
    if (condition.includes('thunder') || pChance0 >= 75) {
      nowIcon = 'thunderstorm';
      nowCondLabel = isHindi ? 'तूफान व बारिश' : 'Thunderstorm';
    } else {
      nowIcon = isNowNight ? 'night-rain' : 'rain';
      nowCondLabel = isHindi ? 'बारिश' : 'Rain';
    }
  } else if (isRainyCity && pChance0 >= 20) {
    nowIcon = isNowNight ? 'night-rain' : 'rain';
    nowCondLabel = isHindi ? 'बौछारें' : 'Showers';
  } else if (condition.includes('fog') || condition.includes('haze') || condition.includes('dust')) {
    nowIcon = 'fog';
    nowCondLabel = isHindi ? 'धुंध' : 'Haze & Fog';
  } else if (condition.includes('sun') || condition.includes('clear')) {
    nowIcon = isNowNight ? 'clear-night' : 'sun';
    nowCondLabel = isNowNight ? (isHindi ? 'साफ रात' : 'Clear Night') : (isHindi ? 'धूप' : 'Sunny');
  } else {
    nowIcon = isNowNight ? 'cloud-night' : 'cloud-sun';
    nowCondLabel = isHindi ? 'आंशिक बादल' : 'Partly Cloudy';
  }

  rawPoints.push({
    type: 'hour',
    key: 'hour-now',
    date: new Date(now),
    offsetH: 0,
    timeLabel: isHindi ? 'अभी' : 'Now',
    temp: Math.round(baseTemp),
    icon: nowIcon,
    condLabel: nowCondLabel,
    rainProb: pChance0 >= 20 ? pChance0 : 0,
    isNow: true,
    isMidnight: false,
    isDay2: false,
    dateLabel: nowDateStr
  });

  // Determine city-specific station cadence track ('even' vs 'odd')
  let candidateH = nowH + 1;
  if (profile.slotCadence === 'even' && candidateH % 2 !== 0) candidateH += 1;
  if (profile.slotCadence === 'odd' && candidateH % 2 === 0) candidateH += 1;

  let currentSlotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), candidateH, 0, 0);
  if (currentSlotDate.getTime() <= now.getTime()) {
    currentSlotDate.setTime(currentSlotDate.getTime() + 2 * 3600000);
  }

  const endTime = now.getTime() + 48 * 3600000;
  const nowDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Generate 2-hour interval timepoints following this city's station cadence
  while (currentSlotDate.getTime() <= endTime) {
    const d = new Date(currentSlotDate);
    const offsetH = Math.round((d.getTime() - now.getTime()) / 3600000);
    const slotDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayOffsetDays = Math.max(0, Math.round((slotDayStart - nowDayStart) / 86400000));

    // Continuously index the appropriate future day entry from existing forecast7Days data
    const dayIdx = forecastDays.length > 0 ? Math.min(dayOffsetDays, forecastDays.length - 1) : 0;
    const targetDay = forecastDays[dayIdx] || {};

    const tMin = Number(targetDay.tempMin) !== undefined && !isNaN(Number(targetDay.tempMin))
      ? Number(targetDay.tempMin)
      : Math.round(baseTemp - (dayOffsetDays >= 1 ? 3.2 : 3.5));
    const tMax = Number(targetDay.tempMax) !== undefined && !isNaN(Number(targetDay.tempMax))
      ? Number(targetDay.tempMax)
      : Math.round(baseTemp + (dayOffsetDays >= 1 ? 4.0 : 3.8));
    const baseRain = targetDay.precipChance !== undefined && !isNaN(Number(targetDay.precipChance))
      ? Number(targetDay.precipChance)
      : (city.precipitation?.chance !== undefined ? city.precipitation.chance : 40);
    const dayCond = (targetDay.condition || city.condition || '').toLowerCase();
    const isTargetRainyCity = dayCond.includes('rain') || dayCond.includes('storm') || dayCond.includes('squall') || baseRain >= 50;

    const h = d.getHours();

    // Diurnal temperature curve tailored to the city's peak heat hour and coastal moderating spread
    const cycle = Math.cos(((h - profile.peakHeatHour) / 12) * Math.PI);
    const temp = Math.round(tMin + (tMax - tMin) * ((cycle + 1) / 2));

    // Dynamic rain probability modulated by local rain window and nocturnal cooling
    let rainProb = baseRain;
    if (h >= profile.rainWindow[0] && h <= profile.rainWindow[1]) {
      rainProb = Math.min(100, baseRain + profile.rainBoost);
    } else if (h < Math.floor(profile.sunriseMin / 60) || h >= Math.floor(profile.sunsetMin / 60)) {
      rainProb = Math.max(0, baseRain - Math.round(profile.nightCooling * 2.5));
    }

    const isNight = h < Math.floor(profile.sunriseMin / 60) || h >= Math.floor(profile.sunsetMin / 60);

    let icon = 'cloud';
    let condLabel = isHindi ? 'बादल' : 'Cloudy';

    if (isTargetRainyCity && rainProb >= 40) {
      if (dayCond.includes('thunder') || rainProb >= 75) {
        icon = 'thunderstorm';
        condLabel = isHindi ? 'तूफान व बारिश' : 'Thunderstorm';
      } else {
        icon = isNight ? 'night-rain' : 'rain';
        condLabel = isHindi ? 'बारिश' : 'Rain';
      }
    } else if (isTargetRainyCity && rainProb >= 20) {
      icon = isNight ? 'night-rain' : 'rain';
      condLabel = isHindi ? 'बौछारें' : 'Showers';
    } else if (dayCond.includes('fog') || dayCond.includes('haze') || dayCond.includes('dust')) {
      icon = 'fog';
      condLabel = isHindi ? 'धुंध' : 'Haze & Fog';
    } else if (dayCond.includes('sun') || dayCond.includes('clear')) {
      icon = isNight ? 'clear-night' : 'sun';
      condLabel = isNight ? (isHindi ? 'साफ रात' : 'Clear Night') : (isHindi ? 'धूप' : 'Sunny');
    } else {
      icon = isNight ? 'cloud-night' : 'cloud-sun';
      condLabel = isHindi ? 'आंशिक बादल' : 'Partly Cloudy';
    }

    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const timeLabel = `${displayHour}${ampm}`;

    const slotDayNum = String(d.getDate()).padStart(2, '0');
    const slotDateStr = isHindi ? `${slotDayNum} ${M_HI[d.getMonth()]}` : `${slotDayNum} ${M_EN[d.getMonth()]}`;

    rawPoints.push({
      type: 'hour',
      key: `hour-${d.getTime()}`,
      date: d,
      offsetH,
      timeLabel,
      temp,
      icon,
      condLabel,
      rainProb: rainProb >= 20 ? rainProb : 0,
      isNow: false,
      isMidnight: h === 0,
      isDay2: dayOffsetDays >= 1,
      dateLabel: slotDateStr
    });

    currentSlotDate = new Date(currentSlotDate.getTime() + 2 * 3600000);
  }

  // Insert geographically accurate Sunrise and Sunset events for this specific city
  for (let dayOffset = 0; dayOffset <= 3; dayOffset++) {
    const sunriseD = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset,
      Math.floor(profile.sunriseMin / 60),
      profile.sunriseMin % 60,
      0
    );
    if (sunriseD.getTime() > now.getTime() && sunriseD.getTime() <= endTime) {
      rawPoints.push({
        type: 'event',
        key: `event-sunrise-${sunriseD.getTime()}`,
        date: sunriseD,
        timeLabel: isHindi ? profile.sunriseHi : profile.sunrise,
        label: isHindi ? 'सूर्योदय' : 'Sunrise',
        icon: 'sunrise',
        rainProb: 0,
        isDay2: sunriseD.getTime() >= now.getTime() + 24 * 3600000
      });
    }

    const sunsetD = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset,
      Math.floor(profile.sunsetMin / 60),
      profile.sunsetMin % 60,
      0
    );
    if (sunsetD.getTime() > now.getTime() && sunsetD.getTime() <= endTime) {
      rawPoints.push({
        type: 'event',
        key: `event-sunset-${sunsetD.getTime()}`,
        date: sunsetD,
        timeLabel: isHindi ? profile.sunsetHi : profile.sunset,
        label: isHindi ? 'सूर्यास्त' : 'Sunset',
        icon: 'sunset',
        rainProb: 0,
        isDay2: sunsetD.getTime() >= now.getTime() + 24 * 3600000
      });
    }
  }

  // Sort strictly chronologically so events and hourly slots flow seamlessly
  rawPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Prevent duplicate time slots and guarantee uniqueness
  const uniquePoints = [];
  const seenKeys = new Set();
  for (const pt of rawPoints) {
    const dedupeKey = pt.key || (pt.isNow ? 'hour-now' : `${pt.type}-${pt.date.getTime()}`);
    if (!seenKeys.has(dedupeKey)) {
      seenKeys.add(dedupeKey);
      uniquePoints.push(pt);
    }
  }

  return uniquePoints;
};

// Summary text generator for 48-hour forecast with city-specific astronomy and cadence
const get48HourSummary = (city, isHindi) => {
  if (!city) return '';
  const profile = getCityAstronomy(city);
  const cond = (city.condition || '').toLowerCase();
  const precip = city.precipitation?.chance || 0;
  const sRise = isHindi ? profile.sunriseHi : profile.sunrise;
  const sSet = isHindi ? profile.sunsetHi : profile.sunset;

  let weatherDesc = '';
  if (precip >= 75 || cond.includes('thunder') || cond.includes('storm')) {
    weatherDesc = isHindi
      ? 'अगले 48 घंटों में गरज-चमक के साथ मानसूनी बौछारों की संभावना है। दोपहर के समय तीव्र बारिश और तटीय हवाएं सक्रिय रहेंगी।'
      : 'Scattered thunderstorms and localized heavy downpours expected over the next 48 hours. Gusty coastal winds active during afternoon hours.';
  } else if (precip >= 40 || cond.includes('rain') || cond.includes('shower')) {
    weatherDesc = isHindi
      ? 'अगले 48 घंटों में रुक-रुक कर बारिश होने का अनुमान है। कल दोपहर वर्षा की तीव्रता में वृद्धि हो सकती है।'
      : 'Passing showers and coastal cloud cover expected over the next 48 hours, with peak precipitation chances developing tomorrow afternoon.';
  } else if (cond.includes('haze') || cond.includes('fog') || cond.includes('dust')) {
    weatherDesc = isHindi
      ? 'सुबह के समय धुंध और हल्का कोहरा बना रहेगा। दिन चढ़ने के साथ दृश्यता में सुधार होगा। अगले 48 घंटे शुष्क मौसम रहेगा।'
      : 'Moderate haze during early morning hours, improving with daytime solar heating. Dry conditions forecast across the next 48 hours.';
  } else if (cond.includes('sun') || cond.includes('clear')) {
    weatherDesc = isHindi
      ? 'अगले 48 घंटों तक मुख्यतः साफ आसमान और तेज धूप खिली रहेगी। रात का तापमान सुखद बना रहेगा।'
      : 'Mainly clear skies and bright sunshine expected throughout the next 48 hours. Warm afternoons with pleasant night breezes.';
  } else {
    weatherDesc = isHindi
      ? 'मध्यम तापमान और आंशिक बादलों के साथ सामान्य मौसम रहने का अनुमान है। अगले 48 घंटों में मौसम स्थिर रहेगा।'
      : 'Partly cloudy skies with stable temperatures forecast over the next 48 hours. Humidity levels remaining moderate.';
  }

  const astroNote = isHindi
    ? `सूर्योदय ${sRise} • सूर्यास्त ${sSet}`
    : `Sunrise ${sRise} • Sunset ${sSet}`;

  return `${weatherDesc} (${astroNote})`;
};

const CityForecast = () => {
  const { cityId } = useParams();
  const navigate = useNavigate();

  // Scroll to top on page load or city change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedDayIdx(0);
  }, [cityId]);

  // Global settings synced with localStorage
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('vayu_is_hindi') === 'true';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const liveClock = useLiveClock(1000);

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

  const locationState = useLocation();

  // Initial base city data to prevent layout shift
  const initialBase = useMemo(() => {
    const passedLoc = locationState?.state?.location;
    return getCityForecast(passedLoc?.id || cityId);
  }, [cityId, locationState?.state?.location]);

  // Live dynamically fetched weather & air-quality telemetry state
  const [liveCityData, setLiveCityData] = useState(initialBase);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Active selected day for detailed hourly view (defaults to Day 0: Today)
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Reset selected day index when cityId changes
  useEffect(() => {
    setSelectedDayIdx(0);
  }, [cityId]);

  // Dynamically load real-world meteorological & air quality telemetry for any selected location
  useEffect(() => {
    let isCancelled = false;
    const loadLiveData = async () => {
      setIsLoadingLive(true);
      try {
        const passedLoc = locationState?.state?.location;
        const target = passedLoc || cityId;
        const realData = await fetchGlobalLocationWeather(target);
        if (!isCancelled && realData) {
          setLiveCityData(realData);
        }
      } catch (err) {
        console.error('Failed to load global live telemetry:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingLive(false);
        }
      }
    };

    loadLiveData();

    return () => {
      isCancelled = true;
    };
  }, [cityId, locationState?.state?.location]);

  const cityData = liveCityData || initialBase;

  // Selected day object
  const activeDay = (cityData.forecast7Days && cityData.forecast7Days[selectedDayIdx]) || 
                    (cityData.forecast7Days && cityData.forecast7Days[0]) || 
                    cityData;

  // Search Location Modal states
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [onlineSearchResults, setOnlineSearchResults] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const searchInputRef = React.useRef(null);
  const searchModalRef = React.useRef(null);

  // Dynamic online geocoding for any global or Indian location
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setOnlineSearchResults([]);
      setIsSearchingOnline(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingOnline(true);
      try {
        const res = await searchOnlineLocations(searchQuery);
        setOnlineSearchResults(res || []);
      } catch (e) {
        console.error('Error during online geocoding search:', e);
      } finally {
        setIsSearchingOnline(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 48-Hour Hourly Weather Forecast Strip State & Ref
  const hourlyScrollRef = React.useRef(null);
  const hourly48Data = useMemo(() => generate48HourForecast(cityData, isHindi, liveClock.now), [cityData, isHindi, liveClock.now]);
  const hourly48Summary = useMemo(() => get48HourSummary(cityData, isHindi), [cityData, isHindi]);
  const cityAstronomy = useMemo(() => getCityAstronomy(cityData), [cityData]);

  // Smooth scroll compensation when an expired slot drops off the left, preventing visual jumps
  const firstFutureSlotKey = hourly48Data.find(item => !item.isNow)?.key;
  const prevFirstFutureKeyRef = React.useRef(firstFutureSlotKey);

  React.useEffect(() => {
    if (prevFirstFutureKeyRef.current && prevFirstFutureKeyRef.current !== firstFutureSlotKey) {
      if (hourlyScrollRef.current && hourlyScrollRef.current.scrollLeft > 20) {
        const sampleCard = hourlyScrollRef.current.children[1];
        const cardWidth = sampleCard ? sampleCard.offsetWidth + 12 : 88;
        hourlyScrollRef.current.scrollLeft = Math.max(0, hourlyScrollRef.current.scrollLeft - cardWidth);
      }
    }
    prevFirstFutureKeyRef.current = firstFutureSlotKey;
  }, [firstFutureSlotKey]);

  const handleScrollHourly = (dir) => {
    if (hourlyScrollRef.current) {
      hourlyScrollRef.current.scrollBy({
        left: dir === 'left' ? -340 : 340,
        behavior: 'smooth'
      });
    }
  };

  // List of all 10 major cities for quick switcher (kept exactly as they are)
  const allCities = useMemo(() => {
    return Object.values(CITY_FORECAST_DATA);
  }, []);

  const isCustomLocationActive = useMemo(() => {
    return !allCities.some(c => c.id.toLowerCase() === (cityData?.id || '').toLowerCase());
  }, [allCities, cityData]);

  // Comprehensive Search Index of 120+ Indian Cities, Coastal Ports & Maritime States
  const allSearchableLocations = useMemo(() => {
    const list = [];
    const seenIds = new Set();

    // 1. Major Quick-Switch Cities
    Object.values(CITY_FORECAST_DATA).forEach((c) => {
      const normalizedId = c.id.toLowerCase();
      seenIds.add(normalizedId);
      list.push({
        id: c.id,
        name: c.name,
        nameHindi: c.nameHindi,
        state: c.state,
        stateHindi: c.stateHindi,
        type: 'city',
        typeLabel: 'Major City',
        typeLabelHindi: 'प्रमुख शहर',
        badgeColor: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        emoji: c.emoji || '🏙️',
        temp: `${c.temp}°C`,
        condition: c.condition,
        conditionHindi: c.conditionHindi,
        isHotspot: false,
        alert: null
      });
    });

    // 2. Coastal Cities, Ports & Landfall Hotspots from COASTAL_CITIES_DATA
    COASTAL_CITIES_DATA.forEach((item) => {
      const normalizedId = item.id.toLowerCase();
      if (!seenIds.has(normalizedId)) {
        seenIds.add(normalizedId);
        const isPort = item.name.toLowerCase().includes('port') ||
                       item.category?.toLowerCase().includes('port') ||
                       item.category?.toLowerCase().includes('harbour');
        list.push({
          id: item.id,
          name: item.name,
          nameHindi: item.nameHindi || item.name,
          state: item.state,
          stateHindi: item.stateHindi || item.state,
          type: isPort ? 'port' : 'coastal',
          typeLabel: isPort ? 'Commercial Port' : (item.category || 'Coastal Watch Zone'),
          typeLabelHindi: isPort ? 'बंदरगाह' : 'तटीय क्षेत्र',
          badgeColor: item.level === 'red'
            ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
            : item.level === 'orange'
            ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          emoji: item.level === 'red' ? '⛈️' : item.level === 'orange' ? '🌧️' : (isPort ? '⚓' : '🌊'),
          temp: item.temp,
          condition: item.condition,
          conditionHindi: item.condition,
          isHotspot: item.isDangerHotspot,
          alert: item.alert
        });
      }
    });

    // 3. Maritime States & UTs
    const MARITIME_STATES = [
      { id: 'odisha', hubId: 'bhubaneswar', name: 'Odisha', nameHindi: 'ओडिशा', coast: 'Bay of Bengal Seaboard' },
      { id: 'west-bengal', hubId: 'kolkata', name: 'West Bengal', nameHindi: 'पश्चिम बंगाल', coast: 'Bay of Bengal & Sundarbans' },
      { id: 'andhra-pradesh', hubId: 'visakhapatnam', name: 'Andhra Pradesh', nameHindi: 'आंध्र प्रदेश', coast: 'Bay of Bengal Coast' },
      { id: 'tamil-nadu', hubId: 'chennai', name: 'Tamil Nadu', nameHindi: 'तमिलनाडु', coast: 'Coromandel Coast' },
      { id: 'kerala', hubId: 'kochi', name: 'Kerala', nameHindi: 'केरल', coast: 'Malabar Coast' },
      { id: 'karnataka', hubId: 'bengaluru', name: 'Karnataka', nameHindi: 'कर्नाटक', coast: 'Canara Coast' },
      { id: 'maharashtra', hubId: 'mumbai', name: 'Maharashtra', nameHindi: 'महाराष्ट्र', coast: 'Konkan Coast' },
      { id: 'gujarat', hubId: 'ahmedabad', name: 'Gujarat', nameHindi: 'गुजरात', coast: 'Kathiawar & Kutch Seaboard' },
      { id: 'goa', hubId: 'mumbai', name: 'Goa', nameHindi: 'गोवा', coast: 'Konkan Coast' },
      { id: 'andaman-nicobar', hubId: 'kolkata', name: 'Andaman & Nicobar Islands', nameHindi: 'अंडमान और निकोबार द्वीप समूह', coast: 'Andaman Sea' },
      { id: 'lakshadweep', hubId: 'kochi', name: 'Lakshadweep', nameHindi: 'लक्षद्वीप', coast: 'Arabian Sea' },
      { id: 'puducherry', hubId: 'chennai', name: 'Puducherry', nameHindi: 'पुदुचेरी', coast: 'Coromandel Coast' },
      { id: 'delhi', hubId: 'delhi', name: 'National Capital (Delhi NCR)', nameHindi: 'दिल्ली राष्ट्रीय राजधानी क्षेत्र', coast: 'Northern Meteorological Grid' }
    ];

    MARITIME_STATES.forEach(st => {
      list.push({
        id: st.hubId,
        name: st.name,
        nameHindi: st.nameHindi,
        state: st.coast,
        stateHindi: st.coast,
        type: 'state',
        typeLabel: 'Maritime State',
        typeLabelHindi: 'तटीय राज्य',
        badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        emoji: '🇮🇳',
        temp: 'State Hub',
        condition: st.coast,
        conditionHindi: st.coast,
        isHotspot: false,
        alert: null
      });
    });

    return list;
  }, []);

  // Filtered locations based on search query and category tab
  const filteredSearchLocations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let base = allSearchableLocations;

    if (searchCategory === 'CITIES') {
      base = base.filter(item => item.type === 'city' || item.type === 'coastal');
    } else if (searchCategory === 'PORTS') {
      base = base.filter(item => item.type === 'port');
    } else if (searchCategory === 'STATES') {
      base = base.filter(item => item.type === 'state');
    }

    if (!q) {
      return base.slice(0, 24);
    }

    const localMatches = base
      .filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(q);
        const nameHiMatch = (item.nameHindi || '').toLowerCase().includes(q);
        const stateMatch = item.state.toLowerCase().includes(q);
        const stateHiMatch = (item.stateHindi || '').toLowerCase().includes(q);
        const typeMatch = item.typeLabel.toLowerCase().includes(q);
        return nameMatch || nameHiMatch || stateMatch || stateHiMatch || typeMatch;
      })
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q);
        const bStarts = b.name.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });

    // Merge online global geocoding results
    if ((searchCategory === 'ALL' || searchCategory === 'CITIES') && onlineSearchResults.length > 0) {
      const localNames = new Set(localMatches.map(l => l.name.toLowerCase()));
      const uniqueOnline = onlineSearchResults.filter(o => !localNames.has(o.name.toLowerCase()));
      return [...localMatches, ...uniqueOnline];
    }

    return localMatches;
  }, [allSearchableLocations, searchQuery, searchCategory, onlineSearchResults]);

  // Lock background scroll and auto-focus input when modal opens
  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isSearchModalOpen]);

  // Global Escape & Cmd/Ctrl+K key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
        setSearchQuery('');
        setSelectedIndex(0);
      } else if (e.key === 'Escape' && isSearchModalOpen) {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchModalOpen]);

  // Keyboard navigation inside search dropdown
  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredSearchLocations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSearchLocations[selectedIndex]) {
        handleSelectLocation(filteredSearchLocations[selectedIndex]);
      }
    }
  };

  const handleSelectLocation = (location) => {
    setIsSearchModalOpen(false);
    setSearchQuery('');
    navigate(`/forecast/${location.id}`, { state: { location } });
  };

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

          {/* Live Feed Status Tag & Timestamp */}
          <div className="flex items-center gap-2 flex-wrap">
            <DataTypeBadge type="live" label={isHindi ? 'आईएमडी एडब्ल्यूएस स्टेशन' : 'IMD AWS STATION FEED'} isHindi={isHindi} size="xs" />
            <LastUpdatedBadge timestamp={liveClock.clockTimeStr + ' IST'} source="IMD AWS" isLive={true} isHindi={isHindi} size="xs" />
          </div>
        </div>

        {/* =========================================================================
             CITY QUICK SWITCHER PILLS (Switch between Mumbai, Chennai, Kolkata, etc.)
             ========================================================================= */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 p-2 sm:p-2.5 rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
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
                  className={`px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center shrink-0 ${
                    isCurrent
                      ? 'bg-sky-500 text-white shadow-xs scale-[1.03]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <span>{isHindi ? c.nameHindi : c.name}</span>
                </button>
              );
            })}

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700/80 mx-0.5 shrink-0" />

            {/* Premium Pill-Shaped Search Location Button */}
            <button
              id="quick-switch-search-btn"
              onClick={() => {
                setIsSearchModalOpen(true);
                setSearchQuery('');
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 group ${
                isCustomLocationActive
                  ? 'bg-sky-500 text-white shadow-xs scale-[1.03]'
                  : 'bg-sky-500/10 hover:bg-sky-500 text-sky-700 dark:text-sky-300 hover:text-white dark:hover:text-white border border-sky-300/60 dark:border-sky-500/40 hover:border-transparent hover:scale-[1.03] active:scale-[0.98] shadow-xs'
              }`}
              title={isHindi ? 'स्थान खोजें' : 'Search Location'}
            >
              <Search className={`w-3.5 h-3.5 transition-colors ${isCustomLocationActive ? 'text-white' : 'text-sky-600 dark:text-sky-400 group-hover:text-white'}`} />
              <span>{isHindi ? 'स्थान खोजें' : 'Search Location'}</span>
            </button>
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
                  <span>{activeDay.temp}</span>
                  <span className="text-2xl sm:text-3xl text-sky-600 dark:text-sky-400 ml-1">°C</span>
                </div>

                <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-4xl sm:text-5xl" role="img" aria-label={activeDay.condition}>
                    {activeDay.emoji}
                  </span>
                  <div>
                    <div className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                      {isHindi ? activeDay.conditionHindi : activeDay.condition}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {isHindi ? 'अनुभूत तापमान: ' : 'Feels like: '}
                      <strong className="text-slate-800 dark:text-slate-200">{activeDay.feelsLike}°C</strong>
                      {' • '}
                      {isHindi ? 'न्यूनतम/अधिकतम: ' : 'Min/Max: '}
                      <strong className="text-slate-800 dark:text-slate-200">{activeDay.tempMin}° / {activeDay.tempMax}°</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Updated Time or Active Day Forecast Indicator */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 pt-1">
                {selectedDayIdx === 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {isHindi 
                        ? `लाइव अवलोकन स्टेशन ${cityData.stationCode} • ${liveClock.timeStr} IST (${liveClock.dateStrHindi})` 
                        : `Live Observation Station ${cityData.stationCode} • ${liveClock.timeStr} IST (${liveClock.dateStr})`}
                    </span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      {isHindi ? `${activeDay.dayHindi} का पूर्वानुमान (${activeDay.date})` : `${activeDay.day} Forecast (${activeDay.date})`}
                      {' • '}
                      {isHindi ? 'इसरो मोसडैक उपग्रह मॉडल' : 'ISRO MOSDAC Model Telemetry'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Col: 6-Slot Micro Telemetry Grid */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Droplets className="w-5 h-5 mx-auto text-sky-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'आर्द्रता' : 'Humidity'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{activeDay.humidity}%</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Gauge className="w-5 h-5 mx-auto text-cyan-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'दबाव' : 'Pressure'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{activeDay.pressure}</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Eye className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'दृश्यता' : 'Visibility'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{activeDay.visibility}</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Sun className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'यूवी इंडेक्स' : 'UV Index'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{activeDay.uvIndex} ({activeDay.uvCategory})</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Thermometer className="w-5 h-5 mx-auto text-rose-500 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'ओसांक' : 'Dew Point'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{activeDay.dewPoint}</span>
              </div>

              <div className="bg-white/60 dark:bg-white/[0.04] backdrop-blur-md rounded-2xl p-3 border border-white/80 dark:border-white/10 text-center shadow-2xs">
                <Cloud className="w-5 h-5 mx-auto text-sky-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                  {isHindi ? 'बादल' : 'Cloud Cover'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{activeDay.cloudCover}</span>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
             THE 4 CORE REQUIRED METRIC CARDS (AQI, TEMP, PRECIPITATION, WIND SPEED/DIR)
             ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <span>{isHindi ? 'मौसम व पर्यावरण विश्लेषिकी' : 'KEY METEOROLOGICAL & AIR QUALITY TELEMETRY'}</span>
            </h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/10 dark:bg-sky-400/10 border border-sky-500/25 text-xs text-sky-700 dark:text-sky-300 font-bold">
              <span>{isHindi ? activeDay.dayHindi : activeDay.day} ({activeDay.date})</span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span>{isHindi ? `दिन ${selectedDayIdx + 1}/7 का पूर्वानुमान` : `Day ${selectedDayIdx + 1} of 7 Outlook`}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. AQI (Air Quality Index) Card */}
            <IOSGlassCard wrapperClassName="h-full" className="p-4.5 rounded-2xl flex flex-col justify-between h-full">
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
                    activeDay.aqi.statusColor === 'emerald'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                      : activeDay.aqi.statusColor === 'orange'
                      ? 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30'
                      : activeDay.aqi.statusColor === 'rose'
                      ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}>
                    {isHindi ? activeDay.aqi.categoryHindi : activeDay.aqi.category}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                    {activeDay.aqi.value}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ 500 AQI Index</span>
                </div>

                {/* Meter Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeDay.aqi.value <= 50
                        ? 'bg-emerald-500'
                        : activeDay.aqi.value <= 100
                        ? 'bg-sky-500'
                        : activeDay.aqi.value <= 150
                        ? 'bg-amber-500'
                        : activeDay.aqi.value <= 250
                        ? 'bg-orange-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, (activeDay.aqi.value / 300) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-xs py-2 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold">PM2.5</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px] truncate block">{activeDay.aqi?.pm25 || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold">PM10</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px] truncate block">{activeDay.aqi?.pm10 || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold">SO₂</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px] truncate block">{activeDay.aqi?.so2 || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold">NO₂</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px] truncate block">{activeDay.aqi?.no2 || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold">CO</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px] truncate block">{activeDay.aqi?.co || 'N/A'}</strong>
                  </div>
                  <div className="bg-slate-50/80 dark:bg-slate-900/40 p-1.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-bold">O₃</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-[11px] truncate block">{activeDay.aqi?.o3 || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-3 bg-slate-50 dark:bg-white/[0.02] p-2 rounded-xl border border-slate-100 dark:border-white/5">
                {isHindi ? (activeDay.aqi?.advisoryHindi || activeDay.aqi?.advisory) : activeDay.aqi?.advisory}
              </p>
            </IOSGlassCard>

            {/* 2. Temperature & Heat Index Card */}
            <IOSGlassCard wrapperClassName="h-full" className="p-4.5 rounded-2xl flex flex-col justify-between h-full">
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
                    {activeDay.temp} °C
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                    {activeDay.temp}°C
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {isHindi ? 'अनुभूत: ' : 'Feels: '}{activeDay.feelsLike}°C
                  </span>
                </div>

                <div className="space-y-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{isHindi ? 'दैनिक अधिकतम (Day Max):' : 'Day High:'}</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{activeDay.tempMax}°C</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{isHindi ? 'दैनिक न्यूनतम (Night Low):' : 'Night Low:'}</span>
                    <strong className="text-cyan-600 dark:text-cyan-400 font-extrabold">{activeDay.tempMin}°C</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>{isHindi ? 'ओसांक (Dew Point):' : 'Dew Point:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeDay.dewPoint}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/40 p-2 rounded-xl text-[11px] text-sky-800 dark:text-sky-300 font-medium">
                {activeDay.precipitation.chance >= 60
                  ? (isHindi ? 'सक्रिय मानसूनी बादलों के कारण दिन के तापमान में गिरावट का अनुमान है।' : 'Convective cloud cover and precipitation will moderate daytime temperatures.')
                  : activeDay.tempMax >= 33
                  ? (isHindi ? 'तीव्र धूप और उच्च तापमान के कारण दोपहर में अत्यधिक उमस का अनुभव होगा।' : 'High daytime solar irradiance will elevate peak afternoon thermal index.')
                  : (isHindi ? 'मौसम सामान्यतः स्थिर व अनुकूल बना रहेगा।' : 'Atmospheric conditions indicate a pleasant diurnal thermal range.')}
              </div>
            </IOSGlassCard>

            {/* 3. Precipitation Card */}
            <IOSGlassCard wrapperClassName="h-full" className="p-4.5 rounded-2xl flex flex-col justify-between h-full">
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
                    {activeDay.precipitation?.chance ?? 0}%
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
                    {activeDay.precipitation?.rate || '0.0 mm/hr'}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{isHindi ? 'वर्तमान वर्षा दर' : 'Current Rate'}</span>
                </div>

                {/* Rain probability bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                    style={{ width: `${activeDay.precipitation?.chance ?? 0}%` }}
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'वर्षा प्रकार:' : 'Type:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{isHindi ? (activeDay.precipitation?.typeHindi || activeDay.precipitation?.type) : activeDay.precipitation?.type}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'वर्षा मात्रा:' : 'Rainfall:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeDay.precipitation?.rainfall || activeDay.rainfall || '0.0 mm'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'बीते 24 घंटे:' : 'Past 24h:'}</span>
                    <strong className="text-cyan-600 dark:text-cyan-400">{activeDay.precipitation?.past24h || '0.0 mm'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'आगामी 24 घंटे:' : 'Next 24h Outlook:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeDay.precipitation?.expected24h || '0.0 mm'}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-800/40 p-2 rounded-xl text-[11px] text-cyan-800 dark:text-cyan-300 font-medium">
                {activeDay.precipitation.chance >= 70
                  ? (isHindi ? 'डॉपलर रडार तीव्र संवहनीय बादलों व गरज-चमक की निगरानी कर रहा है।' : 'Doppler weather radar tracking active convective thunderstorm cells over the region.')
                  : activeDay.precipitation.chance >= 35
                  ? (isHindi ? 'तटीय व स्थानीय बादलों के संपर्क से छिटपुट बौछारों की संभावना है।' : 'Scattered light showers expected due to regional moisture convergence.')
                  : (isHindi ? 'अधिकांशतः शुष्क मौसम व न्यूनतम वर्षा का अनुमान है।' : 'Predominantly dry atmospheric conditions with negligible rain expected.')}
              </div>
            </IOSGlassCard>

            {/* 4. Wind Speed & Direction Card */}
            <IOSGlassCard wrapperClassName="h-full" className="p-4.5 rounded-2xl flex flex-col justify-between h-full">
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
                    {activeDay.wind.speed}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 mb-2">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white block">
                      {isHindi ? activeDay.wind.directionHindi : activeDay.wind.direction}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{activeDay.wind.speed}</span>
                  </div>

                  {/* Compass Bearing Indicator */}
                  <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100/80 dark:bg-slate-800/80 relative shadow-inner">
                    <Compass
                      className="w-7 h-7 text-emerald-600 dark:text-emerald-400 transition-transform duration-700"
                      style={{ transform: `rotate(${activeDay.wind.bearing}deg)` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'हवा के झोंके (Gusts):' : 'Wind Gusts:'}</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{activeDay.wind.gusts}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'कोण (Bearing):' : 'Bearing Angle:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeDay.wind.bearing}° N</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{isHindi ? 'ब्यूफोर्ट पैमाना:' : 'Beaufort:'}</span>
                    <strong className="text-slate-800 dark:text-slate-200">{activeDay.wind.beaufortScale}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-2 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                {activeDay.wind.speedKmh >= 25
                  ? (isHindi ? 'तटीय जहाजों और मछुआरों के लिए तेज हवाओं की चेतावनी।' : 'Maritime advisory: High wind gusts require extra precaution in exposed coastal zones.')
                  : (isHindi ? 'तटीय जहाजों और सामान्य गतिविधियों के लिए अनुकूल स्थिति।' : 'Maritime advisory: Normal operational status across coastal zones.')}
              </div>
            </IOSGlassCard>

          </div>
        </section>

        {/* =========================================================================
             PREMIUM APPLE WEATHER 48-HOUR HOURLY FORECAST INFO BOX (2-HR INTERVALS)
             ========================================================================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-white/80 to-sky-50/70 dark:from-[#0d1322]/95 dark:via-[#090e1a]/95 dark:to-[#050810]/95 backdrop-blur-2xl border border-white/90 dark:border-white/10 text-slate-900 dark:text-white p-4 sm:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.95)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          {/* Ambient Glow behind glass */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-sky-400/10 dark:bg-sky-500/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl" />
          {/* Top specular reflection line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/30 to-transparent" />

          {/* Card Header */}
          <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isHindi ? '48 घंटे का प्रति घंटा पूर्वानुमान (2 घंटे का अंतराल)' : '48-HOUR HOURLY FORECAST (2-HOUR INTERVALS)'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300/60 dark:border-sky-400/30">
                {isHindi ? cityData.nameHindi : cityData.name}
              </span>
              {cityAstronomy && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-400/30 inline-flex items-center gap-1.5 shadow-2xs">
                  <span>🌅 {isHindi ? cityAstronomy.sunriseHi : cityAstronomy.sunrise}</span>
                  <span className="opacity-40">•</span>
                  <span>🌇 {isHindi ? cityAstronomy.sunsetHi : cityAstronomy.sunset}</span>
                </span>
              )}
              {cityAstronomy && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100/90 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hidden md:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{isHindi ? cityAstronomy.stationCadenceHindi : cityAstronomy.stationCadence}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                {isHindi ? 'दाईं ओर स्क्रॉल करें →' : 'Scroll right for full 48h →'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleScrollHourly('left')}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 dark:bg-white/5 dark:hover:bg-white/15 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/10 shadow-xs"
                  aria-label="Scroll left"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScrollHourly('right')}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 dark:bg-white/5 dark:hover:bg-white/15 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-white/10 shadow-xs"
                  aria-label="Scroll right"
                  title="Scroll right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Summary Subtitle */}
          <div className="relative z-10 py-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300/90 font-medium">
            {hourly48Summary}
          </div>

          {/* 48-Hour Horizontal Scroll Strip with 2-hr gaps */}
          <div className="relative z-10 mt-1">
            <div
              ref={hourlyScrollRef}
              className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
            >
              {hourly48Data.map((item) => (
                <div
                  key={item.key || (item.isNow ? 'hour-now' : `${item.type}-${item.date?.getTime()}`)}
                  className={`min-w-[68px] sm:min-w-[76px] h-[116px] flex flex-col items-center justify-between py-2 px-1.5 rounded-2xl transition-all duration-150 shrink-0 ${
                    item.isNow
                      ? 'bg-sky-500/15 dark:bg-sky-500/20 border border-sky-400/50 dark:border-sky-400/40 shadow-xs ring-1 ring-sky-400/20'
                      : item.type === 'event'
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-300/50 dark:border-amber-400/30'
                        : 'hover:bg-slate-100/80 dark:hover:bg-white/10 border border-transparent hover:border-slate-200/70 dark:hover:border-white/10'
                  }`}
                >
                  {/* Top Row: Time label */}
                  <div className="text-center w-full">
                    <span className={`text-xs block truncate ${item.isNow ? 'text-sky-700 dark:text-sky-300 font-bold' : 'text-slate-600 dark:text-slate-300 font-semibold'}`}>
                      {item.timeLabel}
                    </span>
                    {item.isMidnight && (
                      <span className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block leading-tight">
                        {item.dateLabel}
                      </span>
                    )}
                  </div>

                  {/* Middle Row: Icon & Precipitation % */}
                  <div className="flex flex-col items-center justify-center my-auto">
                    {renderHourlyWeatherIcon(item.icon)}
                    {item.rainProb > 0 ? (
                      <span className="text-[10px] font-bold text-sky-600 dark:text-cyan-400 leading-none mt-1">
                        {item.rainProb}%
                      </span>
                    ) : (
                      <span className="h-2.5" />
                    )}
                  </div>

                  {/* Bottom Row: Temperature or Event Label */}
                  <div className="text-center w-full">
                    {item.type === 'event' ? (
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-300 block truncate">
                        {item.label}
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block">
                        {item.temp}°
                      </span>
                    )}
                  </div>
                </div>
              ))}
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
                  ? 'अगले 7 दिनों का विस्तृत मौसम एवं चक्रवात निगरानी पूर्वानुमान।'
                  : 'Comprehensive 7-day meteorological and coastal risk outlook.'}
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
                <IOSGlassCard
                  key={`${dayItem.day}-${idx}`}
                  onClick={() => setSelectedDayIdx(idx)}
                  wrapperClassName="h-full"
                  className={`p-3.5 rounded-2xl cursor-pointer flex flex-col justify-between text-center relative h-full ${
                    isSelected
                      ? '!border-sky-400 dark:!border-sky-400 !bg-sky-500/15 dark:!bg-sky-400/15 shadow-[0_12px_28px_rgba(2,132,199,0.25)] ring-2 ring-sky-400/40 -translate-y-1'
                      : 'hover:!border-sky-300 dark:hover:!border-sky-500/50'
                  }`}
                >
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

                    {/* Wind & AQI */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 leading-none pt-1">
                      <span>{dayItem.windSpeed} {dayItem.windDir}</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded">AQI {dayItem.aqi?.value ?? dayItem.aqi}</span>
                    </div>
                  </div>

                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute inset-x-4 bottom-0 h-1 rounded-t-full bg-sky-500" />
                  )}
                </IOSGlassCard>
              );
            })}
          </div>
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

      {/* =========================================================================
           PREMIUM SEARCH LOCATION POPUP / MODAL
           ========================================================================= */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSearchModalOpen(false);
            }
          }}
        >
          {/* Modal Container */}
          <div
            ref={searchModalRef}
            className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.3)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col max-h-[82vh] animate-in zoom-in-95 duration-200"
            onKeyDown={handleSearchKeyDown}
          >
            {/* Top Specular Line */}
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-sky-500/40 dark:via-sky-400/40 to-transparent" />

            {/* Search Input Bar */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200/80 dark:border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={isHindi ? 'भारत या विश्व का कोई भी शहर खोजें (उदा. देहरादून, शिमला, दिल्ली)...' : 'Search any city, coastal port, or state (e.g. Dehradun, Shimla, Delhi)...'}
                className="w-full bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
              />
              {isSearchingOnline && (
                <div className="flex items-center text-sky-500 animate-spin shrink-0">
                  <Loader2 className="w-4 h-4" />
                </div>
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndex(0);
                    searchInputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Esc</span>
              </button>
            </div>

            {/* Quick Category Filters */}
            <div className="px-3.5 sm:px-4 py-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
              {[
                { key: 'ALL', label: isHindi ? 'सभी' : 'All', count: allSearchableLocations.length },
                { key: 'CITIES', label: isHindi ? 'प्रमुख शहर' : 'Major Cities', count: allSearchableLocations.filter(i => i.type === 'city' || i.type === 'coastal').length },
                { key: 'PORTS', label: isHindi ? 'तटीय बंदरगाह' : 'Ports & Harbours', count: allSearchableLocations.filter(i => i.type === 'port').length },
                { key: 'STATES', label: isHindi ? 'तटीय राज्य' : 'Maritime States', count: allSearchableLocations.filter(i => i.type === 'state').length },
              ].map((tab) => {
                const isActive = searchCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSearchCategory(tab.key);
                      setSelectedIndex(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Suggestions List */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 max-h-[50vh]">
              {filteredSearchLocations.length > 0 ? (
                filteredSearchLocations.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isCurrentActive = item.id.toLowerCase() === cityData.id.toLowerCase();
                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => handleSelectLocation(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group p-2.5 sm:p-3 rounded-2xl transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 border ${
                        isSelected
                          ? 'bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/40 shadow-xs scale-[1.005]'
                          : 'bg-white/50 dark:bg-slate-800/40 border-slate-200/50 dark:border-white/5 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 group-hover:scale-105 transition-transform text-sky-600 dark:text-sky-400">
                          {item.type === 'port' ? (
                            <Anchor className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          ) : item.type === 'state' ? (
                            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                              {isHindi ? item.nameHindi : item.name}
                            </span>
                            {isHindi && item.nameHindi !== item.name && (
                              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                                ({item.name})
                              </span>
                            )}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                              {isHindi ? item.typeLabelHindi : item.typeLabel}
                            </span>
                            {item.isHotspot && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25">
                                {isHindi ? 'खतरा क्षेत्र' : 'High Alert'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {isHindi ? item.stateHindi : item.state} {item.condition ? `• ${isHindi ? item.conditionHindi : item.condition}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.temp && item.temp !== 'State Hub' && (
                          <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {item.temp}
                            </span>
                          </div>
                        )}
                        {isCurrentActive ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-lg">
                            <Check className="w-3 h-3" />
                            <span className="hidden sm:inline">{isHindi ? 'सक्रिय' : 'Active'}</span>
                          </span>
                        ) : (
                          <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-sky-500 text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'कोई स्थान नहीं मिला' : 'No locations found'}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isHindi
                        ? `"${searchQuery}" के लिए कोई परिणाम नहीं मिला। कृपया कोई अन्य भारतीय शहर या राज्य खोजें।`
                        : `No matching results for "${searchQuery}". Try searching for Kolkata, Chennai, Odisha, or Paradip.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Keyboard & Info Bar */}
            <div className="p-3 sm:px-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">↑↓</kbd>
                  <span className="hidden sm:inline">{isHindi ? 'नेविगेट' : 'Navigate'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">↵</kbd>
                  <span className="hidden sm:inline">{isHindi ? 'चुनें' : 'Select'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">esc</kbd>
                  <span className="hidden sm:inline">{isHindi ? 'बंद करें' : 'Close'}</span>
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {isHindi ? '120+ भारतीय शहर व बंदरगाह' : '120+ Indian Cities, Ports & States'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityForecast;
