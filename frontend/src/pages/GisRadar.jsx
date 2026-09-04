import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wind, AlertTriangle, Satellite, Radio, Sliders, Crosshair, 
  CloudRain, Play, Pause, Compass, MapPin, Activity, ShieldAlert
} from 'lucide-react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle,
  Polyline, 
  Polygon, 
  Popup, 
  Marker,
  useMap 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import PublicNavbar from '../components/PublicNavbar';

L.Marker.prototype.options.icon = L.icon({ 
  iconUrl: icon, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41] 
});

const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
};

const SYSTEMS = {
  invest92b: {
    id: 'invest92b',
    name: "Developing Low Pressure Area (INVEST-92B)",
    shortName: "Invest 92B",
    shortNameHindi: "इन्वेस्ट ९२बी",
    hindiName: "सक्रिय चक्रवात जनन निगरानी (इन्वेस्ट-९२बी)",
    basin: "Central-South Bay of Bengal",
    basinHindi: "दक्षिण-मध्य बंगाल की खाड़ी",
    stage: "Incipient Cyclonic Circulation",
    stageHindi: "प्रारंभिक चक्रवाती परिसंचरण",
    risk48h: "68%",
    wind: "42",
    gusts: "55",
    pressure: "1004",
    speed: "14",
    direction: "North-West",
    directionHindi: "उत्तर-पश्चिम",
    lat: 13.5,
    lon: 88.5,
    target: "North Andhra & South Odisha Coastal Belt",
    targetHindi: "उत्तरी आंध्र एवं दक्षिणी ओडिशा तटीय क्षेत्र",
    window: "+60h to +72h Outlook",
    windowHindi: "+60 से +72 घंटे का अनुमान",
    threat: "Genesis Watch Active",
    threatHindi: "जनन निगरानी सक्रिय",
    threatColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    waypoints: [
      { step: '+00h', label: 'Vortex Fix (Observed)', labelHindi: 'भंवर केंद्र (अवलोकित)', lat: 13.5, lon: 88.5, wind: '42 km/h', gusts: '55 km/h', pressure: '1004 hPa', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र' },
      { step: '+12h', label: 'Consolidation Phase', labelHindi: 'समेकन चरण', lat: 14.4, lon: 87.6, wind: '50 km/h', gusts: '65 km/h', pressure: '1000 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+24h', label: 'Deepening Center', labelHindi: 'गहराता केंद्र', lat: 15.3, lon: 86.8, wind: '62 km/h', gusts: '80 km/h', pressure: '995 hPa', cat: 'Deep Depression', catHindi: 'गहरा अवसाद' },
      { step: '+48h', label: 'Tropical Storm Stage', labelHindi: 'चक्रवाती तूफान चरण', lat: 16.5, lon: 85.9, wind: '80 km/h', gusts: '100 km/h', pressure: '988 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+60h', label: 'Near Coastal Inflow', labelHindi: 'तटीय आगमन', lat: 17.8, lon: 85.1, wind: '95 km/h', gusts: '120 km/h', pressure: '980 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+72h', label: 'Odisha-Andhra Landfall', labelHindi: 'ओडिशा-आंध्र लैंडफॉल', lat: 19.4, lon: 84.7, wind: '110 km/h', gusts: '135 km/h', pressure: '972 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' }
    ],
    track: [
      [13.5, 88.5], [14.4, 87.6], [15.3, 86.8], [16.5, 85.9], [17.8, 85.1], [19.4, 84.7]
    ],
    cone: [
      [13.5, 88.5], [15.0, 89.8], [18.0, 88.0], [21.0, 86.5],
      [20.5, 83.2], [17.0, 83.8], [14.2, 86.5], [13.5, 88.5]
    ]
  },
  invest91a: {
    id: 'invest91a',
    name: "Developing Low Pressure Area (INVEST-91A)",
    shortName: "Invest 91A",
    shortNameHindi: "इन्वेस्ट ९१ए",
    hindiName: "सक्रिय चक्रवात जनन निगरानी (इन्वेस्ट-९१ए)",
    basin: "East-Central Arabian Sea",
    basinHindi: "पूर्वी-मध्य अरब सागर",
    stage: "Forming Convective Vortex",
    stageHindi: "संवहनी भंवर निर्माण",
    risk48h: "55%",
    wind: "40",
    gusts: "50",
    pressure: "1005",
    speed: "12",
    direction: "North-East",
    directionHindi: "उत्तर-पूर्व",
    lat: 14.8,
    lon: 66.2,
    target: "Saurashtra & Kutch Maritime Belt",
    targetHindi: "सौराष्ट्र एवं कच्छ समुद्री क्षेत्र",
    window: "+72h Outlook",
    windowHindi: "+72 घंटे का अनुमान",
    threat: "Genesis Watch Active",
    threatHindi: "जनन निगरानी सक्रिय",
    threatColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    waypoints: [
      { step: '+00h', label: 'Observed Center', labelHindi: 'अवलोकित केंद्र', lat: 14.8, lon: 66.2, wind: '40 km/h', gusts: '50 km/h', pressure: '1005 hPa', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र' },
      { step: '+12h', label: 'North-East Track', labelHindi: 'उत्तर-पूर्व ट्रैक', lat: 16.2, lon: 67.0, wind: '48 km/h', gusts: '60 km/h', pressure: '1001 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+24h', label: 'Maritime Intensification', labelHindi: 'समुद्री तीव्रता', lat: 17.8, lon: 68.1, wind: '58 km/h', gusts: '75 km/h', pressure: '996 hPa', cat: 'Deep Depression', catHindi: 'गहरा अवसाद' },
      { step: '+48h', label: 'Saurashtra Approach', labelHindi: 'सौराष्ट्र तटीय अग्रगमन', lat: 19.5, lon: 69.0, wind: '75 km/h', gusts: '95 km/h', pressure: '990 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+72h', label: 'Kutch Coastline Outlook', labelHindi: 'कच्छ तटरेखा अनुमान', lat: 21.2, lon: 69.8, wind: '90 km/h', gusts: '115 km/h', pressure: '982 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' }
    ],
    track: [
      [14.8, 66.2], [16.2, 67.0], [17.8, 68.1], [19.5, 69.0], [21.2, 69.8]
    ],
    cone: [
      [14.8, 66.2], [16.8, 68.5], [19.0, 70.2], [22.0, 71.0],
      [22.2, 68.5], [19.0, 67.2], [16.5, 65.5], [14.8, 66.2]
    ]
  },
  dana: {
    id: 'dana',
    name: "Severe Cyclonic Storm DANA (Historical Benchmark)",
    shortName: "Cyclone DANA",
    shortNameHindi: "चक्रवात दाना",
    hindiName: "भीषण चक्रवाती तूफान दाना (ऐतिहासिक केस अध्ययन)",
    basin: "North Bay of Bengal",
    basinHindi: "उत्तरी बंगाल की खाड़ी",
    stage: "Severe Cyclonic Storm (Landfall Phase)",
    stageHindi: "भीषण चक्रवाती तूफान (लैंडफॉल चरण)",
    risk48h: "Formed Cyclone",
    wind: "110",
    gusts: "125",
    pressure: "970",
    speed: "16",
    direction: "North-Northwest",
    directionHindi: "उत्तर-उत्तर-पश्चिम",
    lat: 19.4,
    lon: 87.2,
    target: "Dhamra Port & Kendrapara Coast, Odisha",
    targetHindi: "धामरा बंदरगाह एवं केंद्रपड़ा तट, ओडिशा",
    window: "Landfall Recorded",
    windowHindi: "लैंडफॉल दर्ज किया गया",
    threat: "Red Alert",
    threatHindi: "रेड अलर्ट",
    threatColor: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    waypoints: [
      { step: '+00h', label: 'Genesis Phase', labelHindi: 'जनन चरण', lat: 18.2, lon: 88.5, wind: '65 km/h', gusts: '80 km/h', pressure: '996 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+12h', label: 'Rapid Intensification', labelHindi: 'तीव्र गति वृद्धि', lat: 18.9, lon: 88.0, wind: '85 km/h', gusts: '105 km/h', pressure: '988 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+24h', label: 'Peak Maritime Velocity', labelHindi: 'शीर्ष समुद्री वेग', lat: 19.7, lon: 87.5, wind: '110 km/h', gusts: '125 km/h', pressure: '974 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+36h', label: 'Dhamra Port Landfall', labelHindi: 'धामरा बंदरगाह लैंडफॉल', lat: 20.8, lon: 86.9, wind: '115 km/h', gusts: '135 km/h', pressure: '970 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+48h', label: 'Inland Dissipation', labelHindi: 'अंतर्देशीय क्षीणता', lat: 22.1, lon: 85.8, wind: '60 km/h', gusts: '75 km/h', pressure: '992 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+60h', label: 'Remnant Low', labelHindi: 'अवशेष निम्न दबाव', lat: 23.4, lon: 84.8, wind: '35 km/h', gusts: '45 km/h', pressure: '1004 hPa', cat: 'Well Marked Low', catHindi: 'सुस्पष्ट निम्न दबाव' }
    ],
    track: [
      [18.2, 88.5], [18.9, 88.0], [19.7, 87.5], [20.8, 86.9], [22.1, 85.8], [23.4, 84.8]
    ],
    cone: [
      [18.2, 88.5], [19.4, 89.4], [21.0, 88.8], [23.8, 87.2],
      [23.5, 83.2], [20.8, 84.8], [19.0, 86.8], [18.2, 88.5]
    ]
  }
};

const BASE_LAYERS = {
  satellite: {
    id: 'satellite',
    name: 'Satellite Imagery',
    nameHindi: 'उपग्रह दृश्य',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri World Imagery'
  },
  dark: {
    id: 'dark',
    name: 'Dark Tactical GIS',
    nameHindi: 'डार्क जीआईएस',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB Dark Matter'
  },
  topo: {
    id: 'topo',
    name: 'Topographic / Bathymetry',
    nameHindi: 'स्थलाकृति',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri Topo'
  },
  light: {
    id: 'light',
    name: 'Nautical Light',
    nameHindi: 'नौवहन लाइट',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB Positron'
  }
};

const GisRadar = () => {
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

  // System & GIS States
  const [selectedSystemId, setSelectedSystemId] = useState('invest92b');
  const [mapBaseLayer, setMapBaseLayer] = useState('satellite');
  const [showDopplerRadar, setShowDopplerRadar] = useState(true);
  const [showSatelliteIR, setShowSatelliteIR] = useState(true);
  const [showCone, setShowCone] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [radarOpacity, setRadarOpacity] = useState(0.85);

  // 72h Timeline Scrubber & Player
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  const current = SYSTEMS[selectedSystemId] || SYSTEMS.invest92b;

  // Auto timeline playback
  useEffect(() => {
    let interval = null;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setActiveStepIndex(prev => {
          const maxSteps = (current.waypoints || []).length;
          if (prev >= maxSteps - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingTimeline, current]);

  // Reset step index when switching systems
  useEffect(() => {
    setActiveStepIndex(0);
    setIsPlayingTimeline(false);
  }, [selectedSystemId]);

  // Active vortex center blinking icon (blinks rapidly during 72h timelapse)
  const activeBlinkingIcon = useMemo(() => {
    return L.divIcon({
      className: 'vortex-blinking-wrapper',
      html: `
        <div class="vortex-marker-pin ${isPlayingTimeline ? 'is-timelapse-playing' : ''}">
          <span class="vortex-ping-outer"></span>
          <span class="vortex-ping-inner"></span>
          <span class="vortex-core-dot"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  }, [isPlayingTimeline]);

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
        
        {/* Page Title & System Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {isHindi ? 'लाइव जीआईएस 4.0 रडार प्रणाली' : 'Live GIS 4.0 Radar Intelligence'}
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> {isHindi ? 'डॉपलर रडार लाइव' : 'DWR Doppler Live'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
              {isHindi ? 'भू-स्थानिक रडार एवं लाइव चक्रवात निगरानी' : 'Geospatial Radar & Live Cyclone Surveillance'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isHindi 
                ? 'एकीकृत डॉपलर मौसम रडार परावर्तन, उपग्रह इन्फ्रारेड बादल, बहु-एजेंसी सर्वसम्मत प्रक्षेपवक्र और गतिशील पवन क्षेत्र त्रिज्या।' 
                : 'Integrated Doppler weather radar reflectivity, satellite infrared clouds, multi-agency consensus track, and dynamic wind swath radii.'}
            </p>
          </div>

          {/* System Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            {Object.keys(SYSTEMS).map((sysKey) => {
              const sys = SYSTEMS[sysKey];
              const isSelected = selectedSystemId === sysKey;
              return (
                <button
                  key={sysKey}
                  onClick={() => setSelectedSystemId(sysKey)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  {isHindi ? (sys.shortNameHindi || sys.shortName) : sys.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* GIS Interactive Command Bar */}
        <div className="bg-white dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          
          {/* Base Map Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {Object.keys(BASE_LAYERS).map((key) => {
              const layer = BASE_LAYERS[key];
              const isSelected = mapBaseLayer === key;
              return (
                <button
                  key={key}
                  onClick={() => setMapBaseLayer(key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isHindi && layer.nameHindi ? layer.nameHindi : layer.name}
                </button>
              );
            })}
          </div>

          {/* Tactical Layer Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setShowDopplerRadar(!showDopplerRadar)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                showDopplerRadar
                  ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>{isHindi ? 'डॉपलर रडार' : 'Doppler Radar'}</span>
            </button>

            <button
              onClick={() => setShowSatelliteIR(!showSatelliteIR)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                showSatelliteIR
                  ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>{isHindi ? 'उपग्रह इंफ्रारेड' : 'Satellite IR'}</span>
            </button>

            <button
              onClick={() => setShowCone(!showCone)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                showCone
                  ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isHindi ? 'पूर्वानुमान शंकु' : 'Forecast Cone'}</span>
            </button>

            <button
              onClick={() => setShowWindRadii(!showWindRadii)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                showWindRadii
                  ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{isHindi ? 'पवन दायरा' : 'Wind Radii'}</span>
            </button>
          </div>

          {/* Radar Opacity Slider */}
          {showDopplerRadar && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {isHindi ? 'पारदर्शिता' : 'Opacity'}
              </span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={radarOpacity}
                onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="font-bold text-slate-700 dark:text-slate-300 min-w-[32px] text-right">
                {Math.round(radarOpacity * 100)}%
              </span>
            </div>
          )}

        </div>

        {/* Map Frame */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md relative h-[560px]">
          
          {/* Top-Left Telemetry HUD Card */}
          {(() => {
            const waypoints = current.waypoints || [];
            const activeWp = waypoints[activeStepIndex] || waypoints[0] || {
              lat: current.lat, lon: current.lon, wind: current.wind, pressure: current.pressure, cat: current.stage, step: '+00h', label: 'Observed Vortex'
            };
            return (
              <div className="absolute top-4 left-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl text-xs shadow-lg max-w-xs space-y-2 pointer-events-auto">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <strong className="font-heading text-sm text-slate-950 dark:text-white">
                      {isHindi ? (current.shortNameHindi || current.shortName) : current.shortName}
                    </strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                    {activeWp.step}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>{isHindi ? 'स्थिति:' : 'Status:'}</span>
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {isHindi && activeWp.catHindi ? activeWp.catHindi : activeWp.cat}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isHindi ? 'भंवर निर्देशांक:' : 'Vortex Fix:'}</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{activeWp.lat}°N, {activeWp.lon}°E</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isHindi ? 'सतत हवाएं:' : 'Sustained Winds:'}</span>
                    <strong className="text-sky-700 dark:text-sky-400 font-bold">{activeWp.wind}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isHindi ? 'केंद्रीय दबाव:' : 'Central Pressure:'}</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{activeWp.pressure}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{isHindi ? 'लक्ष्य क्षेत्र:' : 'Target:'}</span>
                    <strong className="text-slate-900 dark:text-white font-medium text-[11px] truncate max-w-[140px]">
                      {isHindi ? current.targetHindi : current.target}
                    </strong>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Top-Right Doppler Radar dBZ Reflectivity Scale */}
          {showDopplerRadar && (
            <div className="absolute top-4 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl text-[10px] shadow-lg flex flex-col gap-1 pointer-events-auto">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-center">
                {isHindi ? 'डॉपलर रडार dBZ' : 'Doppler Radar dBZ'}
              </span>
              <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-yellow-400 via-orange-500 to-red-600 border border-slate-300 dark:border-slate-600 shadow-2xs" />
              <div className="flex justify-between text-slate-500 dark:text-slate-400 font-medium px-0.5">
                <span>15 dBZ</span>
                <span>35</span>
                <span>50</span>
                <span>65+ dBZ</span>
              </div>
            </div>
          )}

          {/* Leaflet Map */}
          {(() => {
            const waypoints = current.waypoints || [];
            const activeWp = waypoints[activeStepIndex] || waypoints[0] || { lat: current.lat, lon: current.lon };
            const activeTile = BASE_LAYERS[mapBaseLayer] || BASE_LAYERS.satellite;

            return (
              <MapContainer
                center={[activeWp.lat, activeWp.lon]}
                zoom={6}
                style={{ width: '100%', height: '100%' }}
              >
                <MapController center={[activeWp.lat, activeWp.lon]} zoom={6} />

                {/* Base Tile Layer */}
                <TileLayer
                  url={activeTile.url}
                  attribution={activeTile.attribution}
                />

                {/* Live Satellite Infrared Clouds */}
                {showSatelliteIR && (
                  <TileLayer
                    url="https://tilecache.rainviewer.com/v2/satellite/latest/256/{z}/{x}/{y}/0/0_0.png"
                    opacity={0.6}
                    zIndex={150}
                  />
                )}

                {/* Real-Time RainViewer Doppler Weather Radar Layer */}
                {showDopplerRadar && (
                  <TileLayer
                    url="https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png"
                    opacity={radarOpacity}
                    zIndex={200}
                  />
                )}

                {/* 70% Core Uncertainty Forecast Cone */}
                {showCone && current.cone && (
                  <Polygon
                    positions={current.cone}
                    pathOptions={{
                      fillColor: '#F59E0B',
                      fillOpacity: 0.18,
                      color: '#D97706',
                      weight: 2,
                      dashArray: '5, 5'
                    }}
                  />
                )}

                {/* Wind Swath Radii around the Active Waypoint Position */}
                {showWindRadii && (
                  <>
                    {/* 34-knot Gale Force Wind Radius (~120 km) */}
                    <Circle
                      center={[activeWp.lat, activeWp.lon]}
                      radius={120000}
                      pathOptions={{
                        color: '#0284C7',
                        fillColor: '#38BDF8',
                        fillOpacity: 0.08,
                        weight: 1.5,
                        dashArray: '3, 4'
                      }}
                    />
                    {/* 50-knot Storm Force Wind Radius (~70 km) */}
                    <Circle
                      center={[activeWp.lat, activeWp.lon]}
                      radius={70000}
                      pathOptions={{
                        color: '#EA580C',
                        fillColor: '#F97316',
                        fillOpacity: 0.12,
                        weight: 1.5
                      }}
                    />
                    {/* 64-knot Hurricane Force Core Radius (~35 km) */}
                    <Circle
                      center={[activeWp.lat, activeWp.lon]}
                      radius={35000}
                      pathOptions={{
                        color: '#DC2626',
                        fillColor: '#EF4444',
                        fillOpacity: 0.22,
                        weight: 2
                      }}
                    />
                  </>
                )}

                {/* Forecast Track Polyline */}
                {current.track && (
                  <Polyline
                    positions={current.track}
                    pathOptions={{
                      color: '#0284C7',
                      weight: 3,
                      dashArray: '4, 6'
                    }}
                  />
                )}

                {/* Inactive Forecast Waypoints */}
                {waypoints.map((wp, i) => {
                  const isSelected = i === activeStepIndex;
                  if (isSelected) return null;
                  return (
                    <CircleMarker
                      key={i}
                      center={[wp.lat, wp.lon]}
                      radius={i === 0 ? 6.5 : 4.5}
                      pathOptions={{
                        fillColor: i === 0 ? '#DC2626' : '#0284C7',
                        fillOpacity: 0.95,
                        color: '#ffffff',
                        weight: 2
                      }}
                      eventHandlers={{
                        click: () => setActiveStepIndex(i)
                      }}
                    >
                      <Popup>
                        <div className="p-1 text-xs space-y-1 font-sans">
                          <strong className="text-slate-900 block font-heading">
                            {isHindi && wp.labelHindi ? wp.labelHindi : wp.label}
                          </strong>
                          <div className="text-slate-600">
                            {isHindi ? 'समय: ' : 'Lead Time: '}
                            <strong>{wp.step}</strong>
                          </div>
                          <div className="text-slate-600">
                            {isHindi ? 'स्थिति: ' : 'Position: '}
                            <strong>{wp.lat}°N, {wp.lon}°E</strong>
                          </div>
                          <div className="text-slate-600">
                            {isHindi ? 'पवन: ' : 'Wind: '}
                            <strong>{wp.wind}</strong> ({isHindi ? 'झोंके: ' : 'Gusts: '}{wp.gusts})
                          </div>
                          <div className="text-slate-600">
                            {isHindi ? 'दबाव: ' : 'Pressure: '}
                            <strong>{wp.pressure}</strong>
                          </div>
                          <div className="text-slate-600">
                            {isHindi ? 'चरण: ' : 'Stage: '}
                            <strong className="text-amber-700">
                              {isHindi && wp.catHindi ? wp.catHindi : wp.cat}
                            </strong>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {/* Active Cyclone Vortex Center (Red Point with White Border - Blinks during timelapse) */}
                <Marker
                  position={[activeWp.lat, activeWp.lon]}
                  icon={activeBlinkingIcon}
                  zIndexOffset={1000}
                  eventHandlers={{
                    click: () => setActiveStepIndex(activeStepIndex)
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs space-y-1 font-sans">
                      <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <strong className="text-slate-900 block font-heading">
                          {isHindi && activeWp.labelHindi ? activeWp.labelHindi : activeWp.label}
                        </strong>
                      </div>
                      <div className="text-slate-600 pt-1">
                        {isHindi ? 'समय: ' : 'Lead Time: '}
                        <strong className="text-red-600 font-bold">{activeWp.step}</strong>
                      </div>
                      <div className="text-slate-600">
                        {isHindi ? 'स्थिति: ' : 'Position: '}
                        <strong>{activeWp.lat}°N, {activeWp.lon}°E</strong>
                      </div>
                      <div className="text-slate-600">
                        {isHindi ? 'पवन: ' : 'Wind: '}
                        <strong>{activeWp.wind}</strong> ({isHindi ? 'झोंके: ' : 'Gusts: '}{activeWp.gusts})
                      </div>
                      <div className="text-slate-600">
                        {isHindi ? 'दबाव: ' : 'Pressure: '}
                        <strong>{activeWp.pressure}</strong>
                      </div>
                      <div className="text-slate-600">
                        {isHindi ? 'चरण: ' : 'Stage: '}
                        <strong className="text-amber-700">
                          {isHindi && activeWp.catHindi ? activeWp.catHindi : activeWp.cat}
                        </strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            );
          })()}

          {/* Bottom Scrubber Bar: 72-Hour Forecast Progression Player */}
          {(() => {
            const waypoints = current.waypoints || [];
            return (
              <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
                
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                    isPlayingTimeline
                      ? 'bg-red-600 text-white shadow-md shadow-red-500/30 ring-2 ring-red-400/50 scale-105'
                      : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90'
                  }`}
                  title={isPlayingTimeline ? (isHindi ? "पूर्वानुमान प्लेबैक रोकें" : "Pause 72h Forecast Playback") : (isHindi ? "72h पूर्वानुमान प्लेबैक शुरू करें" : "Play 72h Forecast Playback")}
                >
                  {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingTimeline ? (isHindi ? 'रोकें' : 'Pause') : (isHindi ? '72 घंटे चलाएं' : 'Play 72h')}</span>
                </button>

                {/* Waypoint Step Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {waypoints.map((wp, idx) => {
                    const isSelected = idx === activeStepIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveStepIndex(idx);
                          setIsPlayingTimeline(false);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'
                        }`}
                      >
                        {wp.step}
                      </button>
                    );
                  })}
                </div>

                {/* Re-center on Eye */}
                <button
                  onClick={() => {
                    setActiveStepIndex(0);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Crosshair className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isHindi ? 'प्रारंभिक केंद्र' : 'Eye Origin'}</span>
                </button>

              </div>
            );
          })()}

        </div>

        {/* Coastal Radar Network Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              {isHindi ? 'पारादीप डॉपलर रडार (DWR)' : 'Paradip Radar (DWR)'}
            </span>
            <strong className="text-sm font-heading font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isHindi ? 'ऑनलाइन एवं सक्रिय' : 'Online & Active'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isHindi ? 'कवरेज: 400 किमी समुद्री दायरा' : 'Coverage: 400 km Marine Radius'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              {isHindi ? 'कोलकाता डॉपलर रडar' : 'Kolkata DWR Radar'}
            </span>
            <strong className="text-sm font-heading font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isHindi ? 'ऑनलाइन एवं सक्रिय' : 'Online & Active'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isHindi ? 'गंगा डेल्टा व सुंदरबन' : 'Ganges Delta & Sundarbans'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              {isHindi ? 'गोपालपुर व विशाखापट्टनम' : 'Gopalpur & Vizag DWR'}
            </span>
            <strong className="text-sm font-heading font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isHindi ? 'ऑनलाइन एवं सक्रिय' : 'Online & Active'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isHindi ? 'दक्षिण ओडिशा - उत्तर आंध्र' : 'South Odisha - North AP'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
              {isHindi ? 'भूझ (कच्छ) व वेरावल' : 'Bhuj & Veraval DWR'}
            </span>
            <strong className="text-sm font-heading font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {isHindi ? 'ऑनलाइन एवं सक्रिय' : 'Online & Active'}
            </strong>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {isHindi ? 'अरब सागर एवं सौराष्ट्र' : 'Arabian Sea & Saurashtra'}
            </span>
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

export default GisRadar;
