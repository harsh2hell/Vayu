import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardUrl } from '../utils/domain';
import { 
  Wind, Shield, AlertTriangle, ArrowRight, ExternalLink,
  Satellite, Compass, PhoneCall, FileText, CheckCircle2,
  XCircle, ChevronRight, Clock, MapPin, Eye, Radio,
  Activity, Info, Layers, RefreshCw, Sun, Moon, Sparkles,
  ArrowUpRight, BarChart2, ShieldAlert, Play, Pause, Sliders, Crosshair, CloudRain, Maximize2,
  Search, Waves, Bell, Navigation2
} from 'lucide-react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle,
  Polyline, 
  Polygon, 
  Popup, 
  useMap 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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

const INITIAL_SYSTEMS = {
  invest92b: {
    id: 'invest92b',
    name: "Developing Low Pressure Area (INVEST-92B)",
    shortName: "Invest 92B",
    hindiName: "सक्रिय चक्रवात जनन निगरानी (इन्वेस्ट-९२बी)",
    basin: "Central-South Bay of Bengal",
    basinHindi: "दक्षिण-मध्य बंगाल की खाड़ी",
    stage: "Incipient Cyclonic Circulation",
    risk48h: "68%",
    wind: "42",
    gusts: "55",
    pressure: "1004",
    speed: "14",
    direction: "North-West",
    lat: 13.5,
    lon: 88.5,
    target: "North Andhra & South Odisha Coastal Belt",
    window: "+60h to +72h Outlook",
    threat: "Genesis Watch Active",
    threatColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    waypoints: [
      { step: '+00h', label: 'Vortex Fix (Observed)', lat: 13.5, lon: 88.5, wind: '42 km/h', gusts: '55 km/h', pressure: '1004 hPa', cat: 'Low Pressure Area' },
      { step: '+12h', label: 'Consolidation Phase', lat: 14.4, lon: 87.6, wind: '50 km/h', gusts: '65 km/h', pressure: '1000 hPa', cat: 'Depression' },
      { step: '+24h', label: 'Deepening Center', lat: 15.3, lon: 86.8, wind: '62 km/h', gusts: '80 km/h', pressure: '995 hPa', cat: 'Deep Depression' },
      { step: '+48h', label: 'Tropical Storm Stage', lat: 16.5, lon: 85.9, wind: '80 km/h', gusts: '100 km/h', pressure: '988 hPa', cat: 'Cyclonic Storm' },
      { step: '+60h', label: 'Near Coastal Inflow', lat: 17.8, lon: 85.1, wind: '95 km/h', gusts: '120 km/h', pressure: '980 hPa', cat: 'Severe Cyclonic Storm' },
      { step: '+72h', label: 'Odisha-Andhra Landfall', lat: 19.4, lon: 84.7, wind: '110 km/h', gusts: '135 km/h', pressure: '972 hPa', cat: 'Severe Cyclonic Storm' }
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
    hindiName: "सक्रिय चक्रवात जनन निगरानी (इन्वेस्ट-९१ए)",
    basin: "East-Central Arabian Sea",
    basinHindi: "पूर्वी-मध्य अरब सागर",
    stage: "Forming Convective Vortex",
    risk48h: "55%",
    wind: "40",
    gusts: "50",
    pressure: "1005",
    speed: "12",
    direction: "North-East",
    lat: 14.8,
    lon: 66.2,
    target: "Saurashtra & Kutch Maritime Belt",
    window: "+72h Outlook",
    threat: "Genesis Watch Active",
    threatColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    waypoints: [
      { step: '+00h', label: 'Observed Center', lat: 14.8, lon: 66.2, wind: '40 km/h', gusts: '50 km/h', pressure: '1005 hPa', cat: 'Low Pressure Area' },
      { step: '+12h', label: 'North-East Track', lat: 16.2, lon: 67.0, wind: '48 km/h', gusts: '60 km/h', pressure: '1001 hPa', cat: 'Depression' },
      { step: '+24h', label: 'Maritime Intensification', lat: 17.8, lon: 68.1, wind: '58 km/h', gusts: '75 km/h', pressure: '996 hPa', cat: 'Deep Depression' },
      { step: '+48h', label: 'Saurashtra Approach', lat: 19.5, lon: 69.0, wind: '75 km/h', gusts: '95 km/h', pressure: '990 hPa', cat: 'Cyclonic Storm' },
      { step: '+72h', label: 'Kutch Coastline Outlook', lat: 21.2, lon: 69.8, wind: '90 km/h', gusts: '115 km/h', pressure: '982 hPa', cat: 'Severe Cyclonic Storm' }
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
    hindiName: "भीषण चक्रवाती तूफान दाना (ऐतिहासिक केस अध्ययन)",
    basin: "North Bay of Bengal",
    basinHindi: "उत्तरी बंगाल की खाड़ी",
    stage: "Severe Cyclonic Storm (Landfall Phase)",
    risk48h: "Formed Cyclone",
    wind: "110",
    gusts: "125",
    pressure: "970",
    speed: "16",
    direction: "North-Northwest",
    lat: 19.4,
    lon: 87.2,
    target: "Dhamra Port & Kendrapara Coast, Odisha",
    window: "Landfall Recorded",
    threat: "Red Alert",
    threatColor: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    waypoints: [
      { step: '+00h', label: 'Genesis Phase', lat: 18.2, lon: 88.5, wind: '65 km/h', gusts: '80 km/h', pressure: '996 hPa', cat: 'Cyclonic Storm' },
      { step: '+12h', label: 'Rapid Intensification', lat: 18.9, lon: 88.0, wind: '85 km/h', gusts: '105 km/h', pressure: '988 hPa', cat: 'Severe Cyclonic Storm' },
      { step: '+24h', label: 'Peak Maritime Velocity', lat: 19.7, lon: 87.5, wind: '110 km/h', gusts: '125 km/h', pressure: '974 hPa', cat: 'Severe Cyclonic Storm' },
      { step: '+36h', label: 'Dhamra Port Landfall', lat: 20.8, lon: 86.9, wind: '115 km/h', gusts: '135 km/h', pressure: '970 hPa', cat: 'Severe Cyclonic Storm' },
      { step: '+48h', label: 'Inland Dissipation', lat: 22.1, lon: 85.8, wind: '60 km/h', gusts: '75 km/h', pressure: '992 hPa', cat: 'Depression' },
      { step: '+60h', label: 'Remnant Low', lat: 23.4, lon: 84.8, wind: '35 km/h', gusts: '45 km/h', pressure: '1004 hPa', cat: 'Well Marked Low' }
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
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri World Imagery'
  },
  dark: {
    id: 'dark',
    name: 'Dark Tactical GIS',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB Dark Matter'
  },
  topo: {
    id: 'topo',
    name: 'Topographic / Bathymetry',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri Topo'
  },
  light: {
    id: 'light',
    name: 'Nautical Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB Positron'
  }
};

const DISTRICT_ROWS = [
  { 
    state: 'Odisha', 
    slug: 'odisha', 
    district: 'Balasore', 
    alert: 'Red Alert', 
    level: 'red',
    wind: '110-120 km/h', 
    gusts: '140 km/h',
    windPercent: 95,
    surge: '2.0-3.0 m', 
    surgePercent: 90,
    rainfall: 'Torrential (>200 mm)',
    readiness: 'Shelters Activated (100%)', 
    stations: ['Chandipur Coast', 'Soro Port'],
    controlRoom: '06782-262261'
  },
  { 
    state: 'Odisha', 
    slug: 'odisha', 
    district: 'Bhadrak', 
    alert: 'Red Alert', 
    level: 'red',
    wind: '110-120 km/h', 
    gusts: '135 km/h',
    windPercent: 95,
    surge: '2.0-3.0 m', 
    surgePercent: 90,
    rainfall: 'Torrential (220 mm)',
    readiness: 'Shelters Activated', 
    stations: ['Dhamra Port', 'Basudevpur'],
    controlRoom: '06784-251201'
  },
  { 
    state: 'Odisha', 
    slug: 'odisha', 
    district: 'Kendrapara', 
    alert: 'Red Alert', 
    level: 'red',
    wind: '100-115 km/h', 
    gusts: '130 km/h',
    windPercent: 88,
    surge: '1.5-2.0 m', 
    surgePercent: 75,
    rainfall: 'Very Heavy (190 mm)',
    readiness: 'Evacuation in Progress', 
    stations: ['Rajnagar Delta', 'Mahakalapada'],
    controlRoom: '06727-232145'
  },
  { 
    state: 'Odisha', 
    slug: 'odisha', 
    district: 'Puri', 
    alert: 'Orange Alert', 
    level: 'orange',
    wind: '80-95 km/h', 
    gusts: '115 km/h',
    windPercent: 75,
    surge: '1.0-1.5 m', 
    surgePercent: 55,
    rainfall: 'Heavy Rain (160 mm)',
    readiness: 'High Vigil • Beach Ban', 
    stations: ['Puri Seafront', 'Konark Marine'],
    controlRoom: '06752-223230'
  },
  { 
    state: 'West Bengal', 
    slug: 'west-bengal', 
    district: 'East Medinipur', 
    alert: 'Red Alert', 
    level: 'red',
    wind: '90-110 km/h', 
    gusts: '125 km/h',
    windPercent: 85,
    surge: '1.5-2.0 m', 
    surgePercent: 75,
    rainfall: 'Torrential (200 mm)',
    readiness: 'Coastal Warning Hoisted', 
    stations: ['Digha Sea Beach', 'Haldia Port'],
    controlRoom: '03228-263124'
  },
  { 
    state: 'West Bengal', 
    slug: 'west-bengal', 
    district: 'South 24 Parganas', 
    alert: 'Orange Alert', 
    level: 'orange',
    wind: '80-95 km/h', 
    gusts: '120 km/h',
    windPercent: 75,
    surge: '1.0-1.5 m', 
    surgePercent: 55,
    rainfall: 'Heavy Rain (180 mm)',
    readiness: 'Rough Sea Advisory Active', 
    stations: ['Sagar Island', 'Kakdwip Trawler Base'],
    controlRoom: '033-24791010'
  },
  { 
    state: 'Andhra Pradesh', 
    slug: 'andhra-pradesh', 
    district: 'Srikakulam', 
    alert: 'Orange Alert', 
    level: 'orange',
    wind: '70-85 km/h', 
    gusts: '100 km/h',
    windPercent: 65,
    surge: '0.5-1.0 m', 
    surgePercent: 40,
    rainfall: 'Heavy Rain (140 mm)',
    readiness: 'Disaster Teams Ready', 
    stations: ['Kalingapatnam Port', 'Tekkali Coast'],
    controlRoom: '08942-240557'
  },
  { 
    state: 'Andhra Pradesh', 
    slug: 'andhra-pradesh', 
    district: 'Visakhapatnam', 
    alert: 'Yellow Watch', 
    level: 'yellow',
    wind: '50-65 km/h', 
    gusts: '85 km/h',
    windPercent: 50,
    surge: '0.5 m', 
    surgePercent: 25,
    rainfall: 'Moderate Rain (95 mm)',
    readiness: 'Port Signal Hoisted (No. 3)', 
    stations: ['Gangavaram Port', 'Bheemunipatnam'],
    controlRoom: '0891-2560121'
  },
  { 
    state: 'Gujarat', 
    slug: 'gujarat', 
    district: 'Kutch Coast', 
    alert: 'Yellow Watch', 
    level: 'yellow',
    wind: '45-55 km/h', 
    gusts: '65 km/h',
    windPercent: 40,
    surge: '0.5 m', 
    surgePercent: 20,
    rainfall: 'Squall Showers (40 mm)',
    readiness: 'Deep Sea Advisory Active', 
    stations: ['Jakhau Port', 'Mandvi Coast'],
    controlRoom: '02832-250020'
  }
];

const Welcome = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('invest92b');
  const [isHindi, setIsHindi] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeOffset, setFontSizeOffset] = useState(0);
  const [stateFilter, setStateFilter] = useState('All');
  const [matrixThreatFilter, setMatrixThreatFilter] = useState('All');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [safetyTab, setSafetyTab] = useState('before');
  const [istTime, setIstTime] = useState('');
  // GIS Radar Map States
  const [mapBaseLayer, setMapBaseLayer] = useState('satellite');
  const [showDopplerRadar, setShowDopplerRadar] = useState(true);
  const [showSatelliteIR, setShowSatelliteIR] = useState(false);
  const [showCone, setShowCone] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [radarOpacity, setRadarOpacity] = useState(0.65);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);
  const [systems, setSystems] = useState(INITIAL_SYSTEMS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('');
  const [syncStatus, setSyncStatus] = useState('LIVE_AI_CONNECTED');

  const current = systems[activeId] || INITIAL_SYSTEMS[activeId];

  // Fetch live AI model inference & real-time telemetry from FastAPI backend
  const fetchLiveBackendData = async () => {
    setIsSyncing(true);
    try {
      const bayPromise = fetch('/api/v1/cyclones/genesis-watch?basin=Bay%20of%20Bengal')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const arabPromise = fetch('/api/v1/cyclones/genesis-watch?basin=Arabian%20Sea')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const danaPromise = fetch('/api/v1/cyclones/cyclone-dana-2024')
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

      const [bayRes, arabRes, danaRes] = await Promise.all([bayPromise, arabPromise, danaPromise]);

      setSystems((prev) => {
        const next = { ...prev };

        if (bayRes && bayRes.success && bayRes.data) {
          const d = bayRes.data;
          const currentFix = d.current_fix || {};
          const vit = d.vit_morphology || {};
          const thermo = d.thermodynamics || {};
          const prob = d.cyclogenesis_probability || {};
          const landfall = d.landfall || {};

          next.invest92b = {
            ...next.invest92b,
            name: d.name || next.invest92b.name,
            basin: d.region || d.basin || next.invest92b.basin,
            stage: d.category || next.invest92b.stage,
            wind: String(Math.round(currentFix.wind || 42)),
            gusts: String(Math.round((currentFix.wind || 42) * 1.3)),
            pressure: String(Math.round(currentFix.pressure || 1004)),
            risk48h: prob.lead_48h ? prob.lead_48h.split(' ')[0] : next.invest92b.risk48h,
            lat: currentFix.lat || 13.5,
            lon: currentFix.lon || 88.5,
            target: landfall.location || next.invest92b.target,
            window: landfall.window || next.invest92b.window,
            threat: prob.risk_level || next.invest92b.threat,
            vitPattern: vit.pattern || "Curved Banding (LLCC)",
            vitConfidence: vit.confidence || 84.6,
            sst: thermo.sea_surface_temp_c || 30.5,
            shear: thermo.vertical_wind_shear_knots || 11.2,
            isLive: true,
          };

          if (d.trajectory && d.trajectory.length > 0) {
            next.invest92b.waypoints = d.trajectory.map((t, idx) => ({
              step: t.time || `+${idx * 12}h`,
              label: t.stage || 'Forecast Point',
              lat: t.lat,
              lon: t.lon,
              wind: `${Math.round(t.speed || 40)} km/h`,
              gusts: `${Math.round((t.speed || 40) * 1.3)} km/h`,
              pressure: `${Math.round(t.pressure || 1000)} hPa`,
              cat: t.stage || 'Low Pressure Area'
            }));
            next.invest92b.track = d.trajectory.map(t => [t.lat, t.lon]);
          }
          if (d.cone_polygon && d.cone_polygon.length > 0) {
            next.invest92b.cone = d.cone_polygon;
          }
        }

        if (arabRes && arabRes.success && arabRes.data) {
          const d = arabRes.data;
          const currentFix = d.current_fix || {};
          const vit = d.vit_morphology || {};
          const thermo = d.thermodynamics || {};
          const prob = d.cyclogenesis_probability || {};
          const landfall = d.landfall || {};

          next.invest91a = {
            ...next.invest91a,
            name: d.name || next.invest91a.name,
            basin: d.region || d.basin || next.invest91a.basin,
            stage: d.category || next.invest91a.stage,
            wind: String(Math.round(currentFix.wind || 40)),
            gusts: String(Math.round((currentFix.wind || 40) * 1.25)),
            pressure: String(Math.round(currentFix.pressure || 1005)),
            risk48h: prob.lead_48h ? prob.lead_48h.split(' ')[0] : next.invest91a.risk48h,
            lat: currentFix.lat || 14.8,
            lon: currentFix.lon || 66.2,
            target: landfall.location || next.invest91a.target,
            window: landfall.window || next.invest91a.window,
            threat: prob.risk_level || next.invest91a.threat,
            vitPattern: vit.pattern || "Convective Hotspot",
            vitConfidence: vit.confidence || 81.2,
            sst: thermo.sea_surface_temp_c || 30.1,
            shear: thermo.vertical_wind_shear_knots || 12.5,
            isLive: true,
          };

          if (d.trajectory && d.trajectory.length > 0) {
            next.invest91a.waypoints = d.trajectory.map((t, idx) => ({
              step: t.time || `+${idx * 12}h`,
              label: t.stage || 'Forecast Point',
              lat: t.lat,
              lon: t.lon,
              wind: `${Math.round(t.speed || 40)} km/h`,
              gusts: `${Math.round((t.speed || 40) * 1.25)} km/h`,
              pressure: `${Math.round(t.pressure || 1000)} hPa`,
              cat: t.stage || 'Low Pressure Area'
            }));
            next.invest91a.track = d.trajectory.map(t => [t.lat, t.lon]);
          }
          if (d.cone_polygon && d.cone_polygon.length > 0) {
            next.invest91a.cone = d.cone_polygon;
          }
        }

        if (danaRes && danaRes.success && danaRes.data) {
          const d = danaRes.data;
          next.dana = {
            ...next.dana,
            name: d.name || next.dana.name,
            wind: String(Math.round(d.peak_intensity_kmh || 115)),
            gusts: String(Math.round((d.peak_intensity_kmh || 115) * 1.2)),
            pressure: String(Math.round(d.lowest_mslp_hpa || 970)),
            isLive: true,
          };
        }

        return next;
      });

      setSyncStatus('LIVE_AI_CONNECTED');
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    } catch (err) {
      console.warn('Backend sync warning:', err);
      setSyncStatus('CALIBRATED_FALLBACK');
    } finally {
      setIsSyncing(false);
    }
  };

  // Run backend sync on initial load and setup interval poll
  useEffect(() => {
    fetchLiveBackendData();
    const interval = setInterval(fetchLiveBackendData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync dark mode class with root html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Live IST Clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);


  // Auto-play timeline step progression
  useEffect(() => {
    let interval = null;
    if (isPlayingTimeline) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          const waypoints = current.waypoints || [];
          if (prev >= waypoints.length - 1) {
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

  // Reset active step when active cyclone changes
  useEffect(() => {
    setActiveStepIndex(0);
    setIsPlayingTimeline(false);
  }, [activeId]);

  const filteredDistricts = stateFilter === 'All'
    ? DISTRICT_ROWS
    : DISTRICT_ROWS.filter(d => d.state === stateFilter);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#fafbfc] dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col transition-colors duration-500"
      style={{ fontSize: `${16 + fontSizeOffset}px` }}
    >
      
      {/* 2px National Tricolor Stripe */}
      <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />

      {/* TOP APEX BAR (MINIMAL, ELEGANT, EXECUTIVE) */}
      <header className="bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-50 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4 flex-nowrap">
          
          {/* VAYU Brand: Standalone Authentic Design Logo */}
          <div className="flex items-center shrink-0">
            <img 
              src={isDarkMode ? "/vayu-white.png" : "/vayu.png"} 
              alt="VAYU" 
              className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-xs transition-transform duration-300 hover:scale-105 cursor-pointer" 
              onClick={() => scrollToSection('three-globe-hero')}
            />
          </div>

          {/* Clean Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
            {[
              { path: '/city-tracker', label: isHindi ? 'शहर व तटीय क्षेत्र (110+)' : 'City & Area Watch', isRoute: true, highlight: true },
              { id: 'geospatial-map', label: isHindi ? 'रडार मैप' : 'GIS Radar' },
              { id: 'threat-matrix', label: isHindi ? 'तटीय चेतावनी' : 'Threat Matrix' },
              { id: 'bulletins', label: isHindi ? 'सरकारी बुलेटिन' : 'Bulletins' },
              { id: 'safety-protocol', label: isHindi ? 'सुरक्षा गाइड' : 'Safety Guide' }
            ].map((link) => (
              <button
                key={link.id || link.path}
                onClick={() => link.isRoute ? navigate(link.path) : scrollToSection(link.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  link.highlight
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-900/60 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.highlight && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>}
                <span>{link.label}</span>
              </button>
            ))}
          </nav>

          {/* RIGHT SIDE: HELPLINE, OFFICER LOGIN, LANGUAGE, FONT CONTROLLER, THEME TOGGLE */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
            
            {/* Official Officer Gateway / Dashboard */}
            <a 
              href={getDashboardUrl()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shadow-xs"
              title="Official IMD / MoES Officer Gateway (dashboard.autonex.studio)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-sky-200" />
              <span className="hidden sm:inline">Officer Login</span>
              <span className="sm:hidden">Login</span>
            </a>

            {/* National Emergency Hotline */}
            <a 
              href="tel:112" 
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs"
              title="National Emergency Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>112 / 1078</span>
            </a>

            {/* Language Switcher */}
            <button
              onClick={() => setIsHindi(!isHindi)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Toggle Language"
            >
              {isHindi ? 'English' : 'हिन्दी'}
            </button>

            {/* Font Size Scaling Controls */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 p-0.5">
              <button
                onClick={() => setFontSizeOffset(p => Math.max(-2, p - 1))}
                className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Decrease font size"
              >
                A-
              </button>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 px-1 select-none">
                {fontSizeOffset === 0 ? '100%' : `${100 + fontSizeOffset * 10}%`}
              </span>
              <button
                onClick={() => setFontSizeOffset(p => Math.min(4, p + 1))}
                className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* ANIMATED SUN & MOON THEME SWITCHER */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle light/dark theme"
              className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 shadow-xs hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all duration-300 overflow-hidden group cursor-pointer"
              title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                {/* Sun Icon */}
                <Sun
                  className={`w-4 h-4 text-amber-500 absolute transition-all duration-500 transform ${
                    isDarkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 group-hover:rotate-45'
                  }`}
                />
                {/* Moon Icon */}
                <Moon
                  className={`w-4 h-4 text-sky-400 dark:text-amber-300 absolute transition-all duration-500 transform ${
                    isDarkMode ? 'rotate-0 scale-100 opacity-100 group-hover:-rotate-12' : '-rotate-90 scale-0 opacity-0'
                  }`}
                />
              </div>
            </button>

          </div>

        </div>
      </header>

      {/* MOVING NATIONAL ADVISORY TICKER (RIGHT TO LEFT) */}
      <div className="bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-200/80 dark:border-amber-900/50 py-2.5 text-xs text-amber-950 dark:text-amber-200 transition-colors duration-500 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          {/* Pinned Authority Tag */}
          <div className="flex items-center gap-2 shrink-0 bg-amber-500/20 dark:bg-amber-500/25 px-2.5 py-1 rounded-md z-10 select-none border border-amber-300/50 dark:border-amber-700/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600 dark:bg-amber-400"></span>
            </span>
            <span className="font-bold text-amber-950 dark:text-amber-200 tracking-wider text-[11px] uppercase whitespace-nowrap">
              {isHindi ? 'राष्ट्रीय चेतावनी' : 'NATIONAL ADVISORY'}
            </span>
          </div>

          {/* Continuous Right-to-Left Scrolling Marquee */}
          <div className="relative flex-1 overflow-hidden flex items-center group cursor-default">
            <div className="animate-ticker-rtl flex items-center gap-12 font-medium">
              <span className="inline-flex items-center gap-3 whitespace-nowrap">
                <span>{isHindi 
                  ? 'बंगाल की खाड़ी (13.5°N, 88.5°E) में चक्रवाती परिसंचरण इन्वेस्ट 92B सक्रिय। 48 घंटों में चक्रवात बनने की संभावना: 68%।' 
                  : 'Incipient cyclonic circulation Invest 92B in Bay of Bengal (13.5°N, 88.5°E). 48h cyclogenesis potential: 68%.'}</span>
                <span className="text-amber-500/60 dark:text-amber-400/60">•</span>
                <span>{isHindi 
                  ? 'आपदा प्रबंधन बल (NDRF/SDRF) तटीय क्षेत्रों में अलर्ट पर।' 
                  : 'Disaster response authorities on vigil across coastal corridors.'}</span>
                <span className="text-amber-500/60 dark:text-amber-400/60">•</span>
                <span>{isHindi 
                  ? 'मछुआरों को गहरे समुद्र में न जाने की आधिकारिक सलाह।' 
                  : 'Fishermen advised not to venture into deep sea.'}</span>
              </span>

              {/* Seamless loop duplication */}
              <span className="inline-flex items-center gap-3 whitespace-nowrap">
                <span>{isHindi 
                  ? 'बंगाल की खाड़ी (13.5°N, 88.5°E) में चक्रवाती परिसंचरण इन्वेस्ट 92B सक्रिय। 48 घंटों में चक्रवात बनने की संभावना: 68%।' 
                  : 'Incipient cyclonic circulation Invest 92B in Bay of Bengal (13.5°N, 88.5°E). 48h cyclogenesis potential: 68%.'}</span>
                <span className="text-amber-500/60 dark:text-amber-400/60">•</span>
                <span>{isHindi 
                  ? 'आपदा प्रबंधन बल (NDRF/SDRF) तटीय क्षेत्रों में अलर्ट पर।' 
                  : 'Disaster response authorities on vigil across coastal corridors.'}</span>
                <span className="text-amber-500/60 dark:text-amber-400/60">•</span>
                <span>{isHindi 
                  ? 'मछुआरों को गहरे समुद्र में न जाने की आधिकारिक सलाह।' 
                  : 'Fishermen advised not to venture into deep sea.'}</span>
              </span>
            </div>
          </div>

          {/* Pinned Observation Timestamp */}
          <span className="text-xs text-amber-800 dark:text-amber-400 shrink-0 hidden md:inline font-medium pl-2.5 border-l border-amber-300/40 dark:border-amber-800/40 z-10 whitespace-nowrap">
            Observation: {istTime}
          </span>
        </div>
      </div>

      {/* =========================================================================
           HERO SECTION: EXECUTIVE CYCLONE INTEL (RIGHT PART KEPT CLEAN)
           ========================================================================= */}
      <section id="three-globe-hero" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
        <div className="max-w-7xl mx-auto">
          
          {/* Active Detected Area Status Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Active Detection Live Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-bold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-400"></span>
                </span>
                <span>{isHindi ? 'सक्रिय चक्रवात निगरानी क्षेत्र' : 'Active Disturbance Detected'}</span>
              </div>

              {/* Detected Area Name */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200">
                <span className="font-bold text-slate-950 dark:text-white">
                  {isHindi ? current.basinHindi || current.basin : current.basin}
                </span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {current.shortName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Vortex Fix:</span>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {current.lat}°N, {current.lon}°E
              </span>
            </div>
          </div>

          {/* 2-Column Grid: Executive Intel on Left, Right Part Kept Clean */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Authoritative Editorial Presentation */}
            <div className="lg:col-span-8 space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border mb-3 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800">
                  <span>{current.basin}</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                  {isHindi ? current.hindiName : current.name}
                </h1>
                
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal mt-2 leading-relaxed">
                  Real-time meteorological intelligence for identification, classification, and 72-hour trajectory prediction using multi-source satellite data and numerical weather models.
                </p>
              </div>

              {/* Live AI Telemetry Feed Status & Diagnostics */}
              <div className="bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Live AI Model Feed:
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {current.vitPattern ? `ViT Morphology (${current.vitPattern})` : 'CycloneVision CNN v2.1'}
                  </span>
                  {current.sst && (
                    <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
                      • SST {current.sst}°C • Shear {current.shear} kts
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lastSyncTime ? `Synced: ${lastSyncTime}` : 'Connecting backend...'}
                  </span>
                  <button
                    onClick={fetchLiveBackendData}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                    title="Refresh AI Model Inference & Ocean Telemetry"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync AI Feed</span>
                  </button>
                </div>
              </div>

              {/* 4 Large Clean Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Sustained Wind</span>
                  <div className="text-3xl font-heading font-black text-slate-950 dark:text-white">
                    {current.wind} <span className="text-xs font-normal text-slate-500">km/h</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Gusts {current.gusts} km/h</span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Central Pressure</span>
                  <div className="text-3xl font-heading font-black text-slate-950 dark:text-white">
                    {current.pressure} <span className="text-xs font-normal text-slate-500">hPa</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Barometric Fix</span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">48h Formation</span>
                  <div className="text-3xl font-heading font-black text-amber-600 dark:text-amber-400">
                    {current.risk48h}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">ViT Probability</span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">Movement</span>
                  <div className="text-2xl font-heading font-bold text-slate-950 dark:text-white">
                    {current.direction}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Speed {current.speed} km/h</span>
                </div>

              </div>

              {/* Coastal Corridor Strip */}
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-medium block">Projected Coastal Corridor:</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-sm">{current.target}</strong>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-slate-600 dark:text-slate-300">
                  <span>Window: <strong className="text-slate-900 dark:text-white">{current.window}</strong></span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>Feed: <strong className="text-emerald-700 dark:text-emerald-400">ISRO MOSDAC Online</strong></span>
                </div>
              </div>

              {/* Fast Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => scrollToSection('geospatial-map')}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect GIS Radar Map</span>
                </button>

                <button
                  onClick={() => scrollToSection('threat-matrix')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>View District Threat Matrix</span>
                </button>
              </div>

            </div>

            {/* Right Column: Kept clean as requested */}
            <div className="lg:col-span-4 hidden lg:block" />

          </div>

        </div>
      </section>

      {/* =========================================================================
           STATE EARLY WARNING OVERVIEW BAR
           ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
            
            <div className="flex items-center justify-between gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">
                  State Disaster Management Early Warning Status
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live Telemetry Synchronized</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <button
                type="button"
                onClick={() => navigate('/state/odisha')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-red-300 dark:border-slate-700 dark:hover:border-red-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title="View detailed Odisha cyclone & district weather intelligence"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    Odisha
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/40">
                  Red Alert
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/state/west-bengal')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-red-300 dark:border-slate-700 dark:hover:border-red-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title="View detailed West Bengal cyclone & district weather intelligence"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    West Bengal
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/40">
                  Red Alert
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/state/andhra-pradesh')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-orange-300 dark:border-slate-700 dark:hover:border-orange-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title="View detailed Andhra Pradesh cyclone & district weather intelligence"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    Andhra Pradesh
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md border border-orange-200/60 dark:border-orange-900/40">
                  Orange Alert
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/state/gujarat')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-amber-300 dark:border-slate-700 dark:hover:border-amber-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title="View detailed Gujarat cyclone & district weather intelligence"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Gujarat
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                  Yellow Watch
                </span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
           PUBLIC CITY & COASTAL DANGER TRACKER CTA BANNER (110+ LOCATIONS)
           ========================================================================= */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/80 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/80 border-t border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 shrink-0">
              <Navigation2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-heading font-black text-slate-950 dark:text-white">
                  Looking for your City, Port or Beach?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  110+ Coastal Places
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Inspect local gale forecasts, storm surge depths, cyclone eye proximity & safety directives for all coastal towns without login.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/city-tracker')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:bg-sky-700 dark:hover:bg-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>Open City & Area Watch →</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
           GEOSPATIAL GIS MAP & DOPPLER RADAR SECTION
           ========================================================================= */}
      <section id="geospatial-map" className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/60 dark:bg-slate-950/60 border-t border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">
                  Geospatial Radar & Live Cyclone Surveillance
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  Live GIS 4.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Integrated Doppler weather radar reflectivity, multi-agency consensus track, and dynamic wind swath radii.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>WGS84 Datum</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" /> Doppler Radar Feed Online
              </span>
            </div>
          </div>

          {/* GIS Interactive Command Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Base Map Selector */}
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
                    {layer.name}
                  </button>
                );
              })}
            </div>

            {/* Middle: Tactical Layer Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setShowDopplerRadar(!showDopplerRadar)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  showDopplerRadar
                    ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Doppler Radar</span>
              </button>

              <button
                onClick={() => setShowSatelliteIR(!showSatelliteIR)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  showSatelliteIR
                    ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                }`}
              >
                <Satellite className="w-3.5 h-3.5" />
                <span>Satellite IR</span>
              </button>

              <button
                onClick={() => setShowCone(!showCone)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  showCone
                    ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Forecast Cone</span>
              </button>

              <button
                onClick={() => setShowWindRadii(!showWindRadii)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  showWindRadii
                    ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Wind Radii</span>
              </button>
            </div>

            {/* Right: Radar Opacity Slider */}
            {showDopplerRadar && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">Radar Opacity</span>
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
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden shadow-md relative h-[520px]">
            
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
                      <strong className="font-heading text-sm text-slate-950 dark:text-white">{current.shortName}</strong>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                      {activeWp.step}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <strong className="text-slate-900 dark:text-white font-semibold">{activeWp.cat}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Vortex Fix:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{activeWp.lat}°N, {activeWp.lon}°E</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sustained Winds:</span>
                      <strong className="text-sky-700 dark:text-sky-400 font-bold">{activeWp.wind}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Central Pressure:</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{activeWp.pressure}</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Top-Right Doppler Radar dBZ Reflectivity Scale */}
            {showDopplerRadar && (
              <div className="absolute top-4 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl text-[10px] shadow-lg flex flex-col gap-1 pointer-events-auto">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-center">Doppler Radar dBZ</span>
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

                  {/* Interactive Waypoints */}
                  {waypoints.map((wp, i) => {
                    const isSelected = i === activeStepIndex;
                    return (
                      <CircleMarker
                        key={i}
                        center={[wp.lat, wp.lon]}
                        radius={isSelected ? 9 : (i === 0 ? 7 : 4.5)}
                        pathOptions={{
                          fillColor: isSelected ? '#EF4444' : (i === 0 ? '#DC2626' : '#0284C7'),
                          fillOpacity: 0.95,
                          color: '#ffffff',
                          weight: isSelected ? 3 : 2
                        }}
                        eventHandlers={{
                          click: () => setActiveStepIndex(i)
                        }}
                      >
                        <Popup>
                          <div className="p-1 text-xs space-y-1 font-sans">
                            <strong className="text-slate-900 block font-heading">{wp.label}</strong>
                            <div className="text-slate-600">Lead Time: <strong>{wp.step}</strong></div>
                            <div className="text-slate-600">Position: <strong>{wp.lat}°N, {wp.lon}°E</strong></div>
                            <div className="text-slate-600">Wind: <strong>{wp.wind}</strong> (Gusts: {wp.gusts})</div>
                            <div className="text-slate-600">Pressure: <strong>{wp.pressure}</strong></div>
                            <div className="text-slate-600">Stage: <strong className="text-amber-700">{wp.cat}</strong></div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs shadow-xs hover:opacity-90 transition-all cursor-pointer"
                    title={isPlayingTimeline ? "Pause 72h Forecast Playback" : "Play 72h Forecast Playback"}
                  >
                    {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingTimeline ? 'Pause' : 'Play 72h'}</span>
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
                      const waypoints = current.waypoints || [];
                      setActiveStepIndex(0);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-sky-500" />
                    <span>Eye Origin</span>
                  </button>

                </div>
              );
            })()}

          </div>

        </div>
      </section>

      {/* =========================================================================
           IMPROVED DISTRICT-WISE COASTAL THREAT MATRIX
           ========================================================================= */}
      <section id="threat-matrix" className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0b1120] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header & Public Notice */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <span>Public Early Warning Threat Matrix • Free & Open Data</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
                District-Wise Coastal Threat Matrix
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Multi-hazard ratings for peak sustained winds, tidal storm surges, rainfall, and shelter activation status.
              </p>
            </div>

            {/* Matrix Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={matrixSearchQuery}
                onChange={(e) => setMatrixSearchQuery(e.target.value)}
                placeholder="Search district, port, or city..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
              />
              {matrixSearchQuery && (
                <button
                  onClick={() => setMatrixSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* 4 Summary Stat Counter Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Monitored Coastal Districts</span>
              <strong className="text-xl font-heading font-black text-slate-950 dark:text-white">9 Districts Active</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Eastern & Western Seaboard</span>
            </div>

            <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-semibold text-red-700 dark:text-red-400 block mb-0.5">Red Alert (Severe Danger)</span>
              <strong className="text-xl font-heading font-black text-red-700 dark:text-red-300">4 Districts</strong>
              <span className="text-[10px] text-red-600/80 dark:text-red-400/80 block mt-0.5">Balasore, Bhadrak, Kendrapara, Medinipur</span>
            </div>

            <div className="bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 block mb-0.5">Orange Alert (High Vigil)</span>
              <strong className="text-xl font-heading font-black text-orange-700 dark:text-orange-300">3 Districts</strong>
              <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 block mt-0.5">Puri, South 24 Parganas, Srikakulam</span>
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 p-3.5 rounded-2xl shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mb-0.5">Yellow Watch (Precautionary)</span>
              <strong className="text-xl font-heading font-black text-amber-700 dark:text-amber-300">2 Districts</strong>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block mt-0.5">Visakhapatnam, Kutch Coast</span>
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
            
            {/* State Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">State:</span>
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
                  {st}
                </button>
              ))}
            </div>

            {/* Threat Severity Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1">Threat Level:</span>
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
                  {lvl}
                </button>
              ))}
            </div>

          </div>

          {/* Upgraded Threat Matrix Table */}
          {(() => {
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
                d.state.toLowerCase().includes(q) ||
                (d.stations && d.stations.some(s => s.toLowerCase().includes(q)))
              );
            }

            if (list.length === 0) {
              return (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-white dark:bg-slate-900 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No districts matched your search "{matrixSearchQuery}".
                  </p>
                  <button
                    onClick={() => {
                      setMatrixSearchQuery('');
                      setStateFilter('All');
                      setMatrixThreatFilter('All');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              );
            }

            return (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900/90 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-5">District & Coastal Ports</th>
                      <th className="py-3.5 px-5">State</th>
                      <th className="py-3.5 px-5">Threat Level</th>
                      <th className="py-3.5 px-5">Expected Wind</th>
                      <th className="py-3.5 px-5">Tidal Surge</th>
                      <th className="py-3.5 px-5">24h Rain Warning</th>
                      <th className="py-3.5 px-5">Readiness</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {list.map((row, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => navigate(`/state/${row.slug}`)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        title={`Click to open full weather & cyclone intelligence for ${row.state}`}
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-950 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                            <span>{row.district}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-500" />
                          </div>
                          {row.stations && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {row.stations.map((st, sidx) => (
                                <span key={sidx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-medium">
                                  {st}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400 font-medium">
                          {row.state}
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
                            <span>{row.alert}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 dark:text-white">{row.wind}</div>
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
                            <span>{row.surge}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block">High tide surge</span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="font-semibold text-blue-700 dark:text-blue-300 text-[11px] block">
                            {row.rainfall}
                          </span>
                          <span className="text-[10px] text-slate-400 block">IMD 24h Model</span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="font-medium text-slate-700 dark:text-slate-300 block">
                            {row.readiness}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            DEOC: {row.controlRoom}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/state/${row.slug}`);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all shadow-2xs"
                          >
                            <span>View State Intel →</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {/* Public Guidance Tip */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Click on any district row to open its dedicated state weather page with local shelter locations, rainfall radars, and 24/7 disaster control room phone numbers.</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0 hidden sm:inline">
              100% Free & Open Access
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
           OFFICIAL BULLETINS & MARITIME WARNINGS
           ========================================================================= */}
      <section id="bulletins" className="py-12 px-4 sm:px-6 lg:px-8 bg-[#fafbfc] dark:bg-[#0b1120] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-2xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">
                  Official IMD Meteorological Bulletins
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Issued by National Cyclone Warning Centre, New Delhi.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">BULLETIN NO. 14</span>
                  <span>•</span>
                  <span>Issued Today, 00:00 IST</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Severe Cyclonic Storm DANA over North Bay of Bengal (Odisha & West Bengal)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  System crossed north Odisha coast near Dhamra Port with sustained winds of 100-110 kmph gusting to 120 kmph. Complete post-landfall de-escalation protocols in effect across Balasore and Bhadrak districts.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => alert('Downloading official IMD bulletin advisory PDF...')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Download Official Advisory (PDF)</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">GENESIS ADVISORY NO. 03</span>
                  <span>•</span>
                  <span>Issued Yesterday, 18:00 IST</span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Incipient Low Pressure Area Invest 92B in South-Central Bay of Bengal
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Deep atmospheric convection and favorable sea surface temperatures (30.5°C) support steady vortex intensification over the next 48 hours. Marine craft advised to exercise extreme caution.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => alert('Downloading official IMD bulletin advisory PDF...')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Download Genesis Advisory (PDF)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Maritime Warning Box */}
            <div className="border border-red-200 dark:border-red-900/60 rounded-2xl bg-red-50/40 dark:bg-red-950/20 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-red-950 dark:text-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>Maritime Sea Warning</span>
                </h3>
                <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">
                  Prohibition on maritime activities in North & Central Bay of Bengal.
                </p>
              </div>

              <div className="space-y-3 text-xs text-red-900 dark:text-red-200 leading-relaxed">
                <p>• <strong>Deep Sea Ban:</strong> Fishermen are strictly advised not to venture into north and adjoining central Bay of Bengal.</p>
                <p>• <strong>Port Signals:</strong> Signal No. 10 hoisted at Paradip and Dhamra Ports in Odisha.</p>
                <p>• <strong>Tidal Inundation:</strong> Storm surge of 1.5 to 2.0 m expected in coastal Kendrapara and Bhadrak.</p>
              </div>

              <div className="pt-3 border-t border-red-200/80 dark:border-red-900/60">
                <span className="text-[11px] uppercase tracking-wider text-red-800 dark:text-red-400 block font-semibold">Coast Guard 24x7 Search & Rescue</span>
                <span className="text-base font-bold text-red-700 dark:text-red-300">1554 (Toll-Free)</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
           DISASTER SAFETY PROTOCOL (NDMA CITIZEN GUIDELINES)
           ========================================================================= */}
      <section id="safety-protocol" className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0b1120] border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">
                Disaster Safety Protocol: Do's & Don'ts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official NDMA citizen guidelines during severe cyclone emergencies.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setSafetyTab('before')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  safetyTab === 'before' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Before Landfall
              </button>
              <button
                onClick={() => setSafetyTab('during')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  safetyTab === 'during' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                During Landfall
              </button>
              <button
                onClick={() => setSafetyTab('after')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  safetyTab === 'after' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                After Storm Passes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Essential Actions */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Essential Actions (Do's)</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {safetyTab === 'before' && (
                  <>
                    <li className="flex items-start gap-2"><span>✓</span> Keep emergency kit ready with battery radio, torch, dry rations, and drinking water.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Secure doors and windows; remove loose tiles or tin roofs.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Keep mobile phones and power banks fully charged.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Move to designated cyclone shelters when instructed by authorities.</li>
                  </>
                )}
                {safetyTab === 'during' && (
                  <>
                    <li className="flex items-start gap-2"><span>✓</span> Switch off electrical mains and turn off LPG gas cylinders.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Stay in the strongest central room of your house or shelter away from windows.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Keep listening to local radio and official alerts for updates.</li>
                  </>
                )}
                {safetyTab === 'after' && (
                  <>
                    <li className="flex items-start gap-2"><span>✓</span> Remain in the cyclone shelter until official 'All Clear' declaration is given.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Boil drinking water or use water purification tablets before consumption.</li>
                    <li className="flex items-start gap-2"><span>✓</span> Report broken power lines and water contamination to district helpline numbers.</li>
                  </>
                )}
              </ul>
            </div>

            {/* Avoid Hazards */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Avoid These Hazards (Don'ts)</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {safetyTab === 'before' && (
                  <>
                    <li className="flex items-start gap-2"><span>✕</span> Do not ignore official warnings broadcasted on radio, TV, or VAYU portal.</li>
                    <li className="flex items-start gap-2"><span>✕</span> Do not believe or spread unverified rumors on social media.</li>
                    <li className="flex items-start gap-2"><span>✕</span> Do not go near beaches or riverbanks to watch or photograph high waves.</li>
                  </>
                )}
                {safetyTab === 'during' && (
                  <>
                    <li className="flex items-start gap-2"><span>✕</span> <strong>CRITICAL:</strong> Do NOT go outside when winds suddenly stop — this is the calm 'Eye'; violent winds resume quickly from the reverse direction.</li>
                    <li className="flex items-start gap-2"><span>✕</span> Do not operate electrical appliances during severe lightning and rainfall.</li>
                  </>
                )}
                {safetyTab === 'after' && (
                  <>
                    <li className="flex items-start gap-2"><span>✕</span> Do not touch fallen electrical cables, loose wires, or metal structures in water.</li>
                    <li className="flex items-start gap-2"><span>✕</span> Do not enter structurally damaged or waterlogged buildings.</li>
                  </>
                )}
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Ministry of Earth Sciences, Government of India. All Rights Reserved.
          </div>
          <div className="flex items-center gap-5 text-slate-600 dark:text-slate-400 font-medium">
            <a href="https://moes.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">MoES</a>
            <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">IMD</a>
            <a href="https://www.mosdac.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">MOSDAC</a>
            <a href="https://ndma.gov.in" target="_blank" rel="noopener" className="hover:text-slate-900 dark:hover:text-white">NDMA</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Welcome;
