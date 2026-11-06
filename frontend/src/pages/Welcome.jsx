import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardUrl } from '../utils/domain';
import PublicNavbar, { getFontScalePercent, applyGlobalFontScale } from '../components/PublicNavbar';
import {
  Wind, Shield, AlertTriangle, ArrowRight, ExternalLink,
  Satellite, Compass, PhoneCall, FileText, CheckCircle2,
  XCircle, ChevronRight, Clock, MapPin, Eye, Radio,
  Activity, Info, Layers, RefreshCw, Sun, Moon, Sparkles,
  ArrowUpRight, BarChart2, ShieldAlert, Play, Pause, Sliders, Crosshair, CloudRain, Maximize2,
  Search, Waves, Bell, Navigation2, Menu, X, ShieldCheck, Target, TrendingUp, Gauge,
  Umbrella, SunMedium, ArrowRightCircle,
  CloudFog, Cloud, CloudLightning, Thermometer, Droplets, CloudSun, ChevronLeft,
  BrainCircuit, Cpu, TrendingDown, UserPlus, Check, ChevronDown, Globe, RotateCcw
} from 'lucide-react';
import ThreeCycloneGlobe from '../components/ThreeCycloneGlobe';
import CycloneAtmosphericLiveView from '../components/CycloneAtmosphericLiveView';
import LanguageWelcomeAnimation from '../components/LanguageWelcomeAnimation';
import IOSGlassCard from '../components/IOSGlassCard';
import { useLiveClock } from '../utils/liveDateTime';
import InfoTooltip from '../components/InfoTooltip';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';
import DataUnavailableNotice from '../components/DataUnavailableNotice';
import CycloneLifecycleBar from '../components/CycloneLifecycleBar';
import AIReasoningCard from '../components/AIReasoningCard';
import DataSourceStatusCard from '../components/DataSourceStatusCard';
import { 
  ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { getLiveBaseUrl, fetchLiveOceanTelemetry, getFormattedLastUpdated, fetchLiveCycloneFeed, fetchLiveNewsFeed, FALLBACK_CYCLONE_NEWS } from '../services/api';
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

const CycloneSwirlIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="12" r="2.8" />
    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.22.73 4.27 1.96 5.92l1.62-1.22A7.94 7.94 0 0 1 4 12c0-4.41 3.59-8 8-8 2.05 0 3.91.78 5.33 2.06l1.45-1.4A9.95 9.95 0 0 0 12 2z" />
    <path d="M12 22c5.52 0 10-4.48 10-10 0-2.22-.73-4.27-1.96-5.92l-1.62 1.22A7.94 7.94 0 0 1 20 12c0 4.41-3.59 8-8 8-2.05 0-3.91-.78-5.33-2.06l-1.45 1.4A9.95 9.95 0 0 0 12 22z" />
  </svg>
);

const fieldUnitsData = [
  { name: 'Natali Craig', role: 'Radar Operations', status: 'Active on Site', bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300' },
  { name: 'Drew Cano', role: 'Telemetry Ingestion', status: 'Standby', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
  { name: 'Andi Lane', role: 'Disaster Coordination', status: 'In Field', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' },
  { name: 'Koray Okumus', role: 'AI Inference', status: 'Online', bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300' },
  { name: 'Kate Morrison', role: 'Satellite Analyst', status: 'Active', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300' },
];

const SERVICES_DATA = [
  {
    id: 'rainfall',
    title: 'RAINFALL INTELLIGENCE',
    titleHindi: 'वर्षा इंटेलिजेंस',
    tag: 'Live Doppler Radar',
    tagHindi: 'लाइव डॉपलर रडार',
    teaser: 'Precipitation estimates & 850+ coastal rain gauges',
    teaserHindi: 'डॉपलर वर्षा एवं 850+ तटीय स्वचालित स्टेशन',
    accent: 'sky',
    cardBg: 'bg-[#F3F4F6] dark:bg-slate-900/90',
    cardBorder: 'border-slate-200/80 dark:border-slate-800',
    iconBg: 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/50',
    tagClass: 'text-sky-700 dark:text-sky-300 bg-white/80 dark:bg-slate-800 border border-sky-200/60 dark:border-sky-800/50',
    icon: CloudRain,
    route: '/rainfall-intelligence',
    routeLabel: 'Open Rainfall Intelligence Dashboard',
    routeLabelHindi: 'वर्षा इंटेलिजेंस डैशबोर्ड खोलें',
    badge: 'Live Radar & AWS Gauges',
    badgeHindi: 'लाइव रडार और मौसम स्टेशन',
    summary: 'Comprehensive rainfall monitoring network integrating satellite precipitation estimates, Doppler weather radar accumulations, and 850+ coastal automatic weather stations (AWS).',
    summaryHindi: 'उपग्रह वर्षा अनुमान, डॉपलर मौसम रडार संचय और 850+ तटीय स्वचालित मौसम स्टेशनों को एकीकृत करने वाला व्यापक वर्षा निगरानी नेटवर्क।',
    stats: [
      { label: 'Past 24h Peak', labelHindi: '24 घंटे का उच्चतम', val: '185 mm', sub: 'Dhamra Port, Odisha' },
      { label: 'AWS Reporting', labelHindi: 'सक्रिय स्टेशन', val: '98.4%', sub: 'Real-time telemetry' },
      { label: 'Flash Flood Alert', labelHindi: 'जलभराव चेतावनी', val: 'Active (Orange)', sub: 'Coastal lowlands' },
    ]
  },
  {
    id: 'monsoon',
    title: 'ATMOSPHERIC & MONSOON PATTERNS',
    titleHindi: 'वायुमंडलीय एवं मानसूनी पैटर्न',
    tag: 'Circulation & Pressure',
    tagHindi: 'परिसंचरण एवं दबाव',
    teaser: 'Seasonal circulation, pressure patterns & environmental conditions',
    teaserHindi: 'मौसमी परिसंचरण, दबाव पैटर्न एवं पर्यावरणीय स्थितियां',
    accent: 'amber',
    cardBg: 'bg-[#FFFBEB] dark:bg-amber-950/30',
    cardBorder: 'border-amber-200/70 dark:border-amber-900/50',
    iconBg: 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50',
    tagClass: 'text-amber-700 dark:text-amber-300 bg-white/80 dark:bg-slate-800 border border-amber-200/60 dark:border-amber-800/50',
    icon: Wind,
    route: '/atmospheric-patterns',
    routeLabel: 'Open Atmospheric & Monsoon Dashboard',
    routeLabelHindi: 'वायुमंडलीय एवं मानसूनी डैशबोर्ड खोलें',
    badge: 'Synoptic & Atmospheric Watch',
    badgeHindi: 'सिनॉप्टिक एवं वायुमंडलीय निगरानी',
    summary: 'Real-time synoptic intelligence tracking seasonal monsoon circulation, atmospheric pressure patterns, upper-air wind shear, moisture advection, and ambient environmental conditions.',
    summaryHindi: 'मौसमी मानसूनी परिसंचरण, वायुमंडलीय दबाव पैटर्न, पवन कतरनी (विंड शीयर), नमी संवहन और पर्यावरणीय स्थितियों की वास्तविक समय सिनॉप्टिक निगरानी।',
    stats: [
      { label: 'Seasonal Circulation', labelHindi: 'मौसमी परिसंचरण', val: 'Active Trough', sub: 'NLM & Bay pulse' },
      { label: 'Pressure Patterns', labelHindi: 'दबाव पैटर्न', val: '1004 hPa Gradient', sub: 'Low-pressure anomaly' },
      { label: 'Environmental Conditions', labelHindi: 'पर्यावरणीय स्थितियां', val: 'Low Shear (Favorable)', sub: 'SST 30.5°C • High RH' },
    ]
  },
  {
    id: 'cyclone',
    title: 'CYCLONE INTELLIGENCE',
    titleHindi: 'चक्रवात इंटेलिजेंस',
    tag: 'Vortex Intelligence',
    tagHindi: 'चक्रवात खुफिया',
    teaser: 'Multi-spectral satellite tracks & storm surge hydrodynamics',
    teaserHindi: 'उपग्रह तूफान ट्रैक, ज्वार एवं लैंडफॉल मैट्रिक्स',
    accent: 'rose',
    cardBg: 'bg-[#FEF2F2] dark:bg-rose-950/30',
    cardBorder: 'border-rose-200/70 dark:border-rose-900/50',
    iconBg: 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50',
    tagClass: 'text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-800 border border-rose-200/60 dark:border-rose-800/50',
    icon: 'cyclone',
    route: '/cyclone-intelligence',
    routeLabel: 'Open Cyclone Intelligence Dashboard',
    routeLabelHindi: 'चक्रवात इंटेलिजेंस डैशबोर्ड खोलें',
    badge: 'Critical Warning Active',
    badgeHindi: 'गंभीर चेतावनी सक्रिय',
    summary: 'End-to-end tropical cyclogenesis intelligence, multi-spectral satellite imagery, machine-learning track consensus, storm surge hydrodynamics, and district impact matrices.',
    summaryHindi: 'उष्णकटिबंधीय चक्रवात जनन खुफिया, बहु-स्पेक्ट्रल उपग्रह इमेजरी, मशीन-लर्निंग ट्रैक सहमति, तूफान उछाल हाइड्रोडायनामिक्स और जिला प्रभाव मैट्रिक्स।',
    stats: [
      { label: 'Current System', labelHindi: 'वर्तमान प्रणाली', val: 'Invest 92B', sub: 'Bay of Bengal' },
      { label: 'Wind Intensity', labelHindi: 'पवन तीव्रता', val: '42 km/h', sub: 'Gusts 55 km/h' },
      { label: '48h Genesis Risk', labelHindi: '48 घंटे का जोखिम', val: '68%', sub: 'AI Prototype Estimate' },
    ]
  },
  {
    id: 'climate',
    title: 'CLIMATE & OCEAN ANOMALIES',
    titleHindi: 'जलवायु एवं महासागरीय विसंगतियां',
    tag: 'ENSO, IOD & SST Watch',
    tagHindi: 'ईएनएसओ, आईओडी एवं एसएसटी',
    teaser: 'ENSO, IOD, sea surface temperature and other climate factors influencing cyclone formation',
    teaserHindi: 'ईएनएसओ, आईओडी, समुद्री सतह तापमान एवं चक्रवात निर्माण को प्रभावित करने वाले जलवायु कारक',
    accent: 'purple',
    cardBg: 'bg-[#F3F0FF] dark:bg-purple-950/30',
    cardBorder: 'border-purple-200/70 dark:border-purple-900/50',
    iconBg: 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50',
    tagClass: 'text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-slate-800 border border-purple-200/60 dark:border-purple-800/50',
    icon: SunMedium,
    route: '/climate-ocean-anomalies',
    routeLabel: 'Open Climate & Ocean Anomalies Dashboard',
    routeLabelHindi: 'जलवायु एवं महासागरीय विसंगति डैशबोर्ड खोलें',
    badge: 'Oceanic Teleconnections',
    badgeHindi: 'महासागरीय टेलीकनेक्शन',
    summary: 'Comprehensive diagnostics on planetary and oceanic climate drivers including El Niño-Southern Oscillation (ENSO), Indian Ocean Dipole (IOD), Sea Surface Temperature (SST) anomalies, and upper ocean heat content influencing tropical cyclogenesis.',
    summaryHindi: 'उष्णकटिबंधीय चक्रवात निर्माण को प्रभावित करने वाले अल नीनो-दक्षिणी दोलन (ईएनएसओ), हिंद महासागर द्विध्रुव (आईओडी), समुद्री सतह तापमान (एसएसटी) विसंगतियों और महासागरीय ऊष्मा की विस्तृत नैदानिक रिपोर्ट।',
    stats: [
      { label: 'ENSO Phase', labelHindi: 'ईएनएसओ स्थिति', val: 'ENSO-Neutral', sub: 'La Niña developing' },
      { label: 'IOD Status', labelHindi: 'आईओडी स्थिति', val: 'Neutral (+0.12°C)', sub: 'Influencing genesis' },
      { label: 'Sea Surface Temp', labelHindi: 'समुद्री सतह तापमान (SST)', val: '30.5°C (+0.8°C)', sub: 'High cyclone potential' },
    ]
  }
];

const MAJOR_CITIES_WEATHER = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    nameHindi: 'मुंबई',
    condition: 'Smoke Fog',
    conditionHindi: 'धुंध और कोहरा',
    icon: 'fog',
    temp: '29.0',
    windDir: 'No Direction',
    windDirHindi: 'शांत दिशा',
    windSpeed: '16.7 km/h',
    windSpeedHindi: '16.7 किमी/घंटा',
    humidity: '79 %',
    pressure: '1008 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '31°C', low: '25°C', cond: 'Haze' },
      { day: 'Day 2', dayHindi: 'परसों', high: '32°C', low: '26°C', cond: 'Partly Cloudy' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '30°C', low: '24°C', cond: 'Light Rain' },
    ]
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    nameHindi: 'बेंगलुरु',
    condition: 'Cloudy Sky',
    conditionHindi: 'बादल छाए रहेंगे',
    icon: 'cloudy',
    temp: '29.8',
    windDir: 'Westerly',
    windDirHindi: 'पश्चिमी',
    windSpeed: '5.6 km/h',
    windSpeedHindi: '5.6 किमी/घंटा',
    humidity: '47 %',
    pressure: '1012 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '30°C', low: '20°C', cond: 'Scattered Clouds' },
      { day: 'Day 2', dayHindi: 'परसों', high: '29°C', low: '19°C', cond: 'Thundershowers' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '28°C', low: '19°C', cond: 'Rain' },
    ]
  },
  {
    id: 'chennai',
    name: 'Chennai',
    nameHindi: 'चेन्नई',
    condition: 'Mainly Clear Sky',
    conditionHindi: 'साफ आसमान',
    icon: 'sun',
    temp: '32.4',
    windDir: 'Southeasterly',
    windDirHindi: 'दक्षिण-पूर्वी',
    windSpeed: '11.1 km/h',
    windSpeedHindi: '11.1 किमी/घंटा',
    humidity: '75 %',
    pressure: '1006 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '33°C', low: '27°C', cond: 'Sunny' },
      { day: 'Day 2', dayHindi: 'परसों', high: '34°C', low: '27°C', cond: 'Hot & Humid' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '31°C', low: '26°C', cond: 'Coastal Showers' },
    ]
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    nameHindi: 'हैदराबाद',
    condition: 'Haze',
    conditionHindi: 'हल्की धुंध',
    icon: 'haze',
    temp: '32.0',
    windDir: 'Calm',
    windDirHindi: 'शांत',
    windSpeed: '0 km/h',
    windSpeedHindi: '0 किमी/घंटा',
    humidity: '67 %',
    pressure: '1010 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '33°C', low: '23°C', cond: 'Clear Sky' },
      { day: 'Day 2', dayHindi: 'परसों', high: '34°C', low: '24°C', cond: 'Warm' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '32°C', low: '22°C', cond: 'Passing Showers' },
    ]
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    nameHindi: 'कोलकाता',
    condition: 'Thunderstorm with Rain',
    conditionHindi: 'तूफान व बारिश',
    icon: 'thunderstorm',
    temp: '30.2',
    windDir: 'Calm',
    windDirHindi: 'शांत',
    windSpeed: '0 km/h',
    windSpeedHindi: '0 किमी/घंटा',
    humidity: '84 %',
    pressure: '1004 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '31°C', low: '26°C', cond: 'Heavy Rain' },
      { day: 'Day 2', dayHindi: 'परसों', high: '29°C', low: '25°C', cond: 'Squally Winds' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '30°C', low: '25°C', cond: 'Overcast' },
    ]
  },
  {
    id: 'delhi',
    name: 'New Delhi',
    nameHindi: 'नई दिल्ली',
    condition: 'Dust Haze',
    conditionHindi: 'धूल भरी धुंध',
    icon: 'haze',
    temp: '31.5',
    windDir: 'Northwesterly',
    windDirHindi: 'उत्तर-पश्चिमी',
    windSpeed: '8.2 km/h',
    windSpeedHindi: '8.2 किमी/घंटा',
    humidity: '52 %',
    pressure: '1009 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '33°C', low: '21°C', cond: 'Mainly Clear' },
      { day: 'Day 2', dayHindi: 'परसों', high: '34°C', low: '22°C', cond: 'Sunny' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '32°C', low: '20°C', cond: 'Dry Breeze' },
    ]
  },
  {
    id: 'bhubaneswar',
    name: 'Bhubaneswar',
    nameHindi: 'भुवनेश्वर',
    condition: 'Squall Showers',
    conditionHindi: 'तीव्र बौछारें',
    icon: 'rain',
    temp: '31.2',
    windDir: 'Easterly',
    windDirHindi: 'पूर्वी',
    windSpeed: '18.5 km/h',
    windSpeedHindi: '18.5 किमी/घंटा',
    humidity: '88 %',
    pressure: '1003 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '29°C', low: '24°C', cond: 'Heavy Downpour' },
      { day: 'Day 2', dayHindi: 'परसों', high: '28°C', low: '23°C', cond: 'Gale Winds' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '30°C', low: '24°C', cond: 'Showers' },
    ]
  },
  {
    id: 'visakhapatnam',
    name: 'Visakhapatnam',
    nameHindi: 'विशाखापट्टनम',
    condition: 'Gusty Winds & Rain',
    conditionHindi: 'तेज हवाएं व बारिश',
    icon: 'thunderstorm',
    temp: '30.8',
    windDir: 'Northeasterly',
    windDirHindi: 'उत्तर-पूर्वी',
    windSpeed: '24.1 km/h',
    windSpeedHindi: '24.1 किमी/घंटा',
    humidity: '86 %',
    pressure: '1002 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '30°C', low: '26°C', cond: 'Coastal Squall' },
      { day: 'Day 2', dayHindi: 'परसों', high: '29°C', low: '25°C', cond: 'High Waves & Rain' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '31°C', low: '26°C', cond: 'Overcast' },
    ]
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    nameHindi: 'अहमदाबाद',
    condition: 'Sunny & Dry',
    conditionHindi: 'धूप व शुष्क',
    icon: 'sun',
    temp: '33.6',
    windDir: 'Southwesterly',
    windDirHindi: 'दक्षिण-पश्चिमी',
    windSpeed: '12.0 km/h',
    windSpeedHindi: '12.0 किमी/घंटा',
    humidity: '55 %',
    pressure: '1007 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '35°C', low: '24°C', cond: 'Sunny' },
      { day: 'Day 2', dayHindi: 'परसों', high: '36°C', low: '25°C', cond: 'Hot' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '34°C', low: '24°C', cond: 'Clear' },
    ]
  },
  {
    id: 'kochi',
    name: 'Kochi',
    nameHindi: 'कोच्चि',
    condition: 'Coastal Showers',
    conditionHindi: 'तटीय वर्षा',
    icon: 'rain',
    temp: '28.4',
    windDir: 'Southwesterly',
    windDirHindi: 'दक्षिण-पश्चिमी',
    windSpeed: '14.8 km/h',
    windSpeedHindi: '14.8 किमी/घंटा',
    humidity: '89 %',
    pressure: '1009 hPa',
    forecast: [
      { day: 'Tomorrow', dayHindi: 'कल', high: '29°C', low: '24°C', cond: 'Intermittent Rain' },
      { day: 'Day 2', dayHindi: 'परसों', high: '28°C', low: '24°C', cond: 'Monsoon Clouds' },
      { day: 'Day 3', dayHindi: '3 दिन बाद', high: '30°C', low: '25°C', cond: 'Humid' },
    ]
  }
];

const renderWeatherIcon = (type, className = "w-5 h-5") => {
  switch (type) {
    case 'fog':
      return <CloudFog className={className} />;
    case 'cloudy':
      return <Cloud className={className} />;
    case 'sun':
      return <Sun className={className} />;
    case 'haze':
      return <CloudSun className={className} />;
    case 'thunderstorm':
      return <CloudLightning className={className} />;
    case 'rain':
      return <CloudRain className={className} />;
    default:
      return <CloudSun className={className} />;
  }
};

// Interactive 3D Glass Card with dynamic cursor tilt & depth layers
const CityWeather3DCard = ({
  city,
  idx,
  isHindi,
  isActive,
  renderWeatherIcon,
  onOpenForecast
}) => {
  return (
    <div className="h-full">
      <div
        className={`relative rounded-2xl p-4 text-slate-900 dark:text-white flex flex-col justify-between h-full min-h-[180px] transition-all border ${
          isActive
            ? 'border-sky-300 dark:border-sky-500/50 bg-sky-50/40 dark:bg-sky-950/20 shadow-xs'
            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 shadow-2xs'
        }`}
      >
        {/* City Name */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
            {isHindi ? city.nameHindi : city.name}
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {city.state || 'IN'}
          </span>
        </div>

        {/* 2x2 Weather Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 my-auto py-1 text-center items-center">
          {/* Condition */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
            <div className="text-sky-600 dark:text-sky-400">
              {renderWeatherIcon(city.icon, "w-5 h-5")}
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-1">
              {isHindi ? city.conditionHindi : city.condition}
            </span>
          </div>

          {/* Temperature */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
            <div className="text-sky-600 dark:text-sky-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-900 dark:text-white font-bold mt-1">
              {city.temp}°C
            </span>
          </div>

          {/* Wind */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
            <div className="text-sky-600 dark:text-sky-400">
              <Wind className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-1">
              {isHindi ? city.windSpeedHindi : city.windSpeed}
            </span>
          </div>

          {/* Humidity */}
          <div className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
            <div className="text-sky-600 dark:text-sky-400">
              <Droplets className="w-5 h-5" />
            </div>
            <span className="text-xs text-slate-900 dark:text-white font-bold mt-1">
              {city.humidity}
            </span>
          </div>
        </div>

        {/* Forecast CTA */}
        <button
          onClick={() => onOpenForecast(city)}
          className="text-center text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition-colors block w-full cursor-pointer mt-2"
        >
          {isHindi ? 'पूर्वानुमान' : 'Forecast'}
        </button>
      </div>
    </div>
  );
};

const INITIAL_SYSTEMS = {
  arnab: {
    id: 'arnab',
    name: "Extremely Severe Cyclonic Storm ARNAB (2026)",
    shortName: "Cyclone ARNAB",
    shortNameHindi: "चक्रवात अर्नब",
    hindiName: "अत्यंत भीषण चक्रवाती तूफान अर्नब (2026)",
    basin: "Bay of Bengal",
    basinHindi: "बंगाल की खाड़ी",
    stage: "Extremely Severe Cyclonic Storm (IMD)",
    stageHindi: "अति भीषण चक्रवाती तूफान (आईएमडी)",
    threat: "Red Alert (Cat 4 Equivalent)",
    threatHindi: "लाल चेतावनी (अत्यधिक विनाशकारी)",
    dvorak: "T6.0",
    risk48h: "100%",
    wind: "222",
    gusts: "260",
    pressure: "942",
    speed: "22",
    direction: "North-West (315°)",
    directionHindi: "उत्तर-पश्चिम (315°)",
    lat: 16.4,
    lon: 81.8,
    target: "Coastal Andhra Pradesh & South Odisha (Bapatla-Kakinada Corridor)",
    targetHindi: "तटीय आंध्र प्रदेश एवं दक्षिण ओडिशा (बापटला-काकीनाडा कॉरिडोर)",
    window: "Landfall Strike & Destructive Surge Benchmark",
    windowHindi: "लैंडफॉल स्ट्राइक एवं विनाशकारी तूफानी लहर",
    sst: 30.8,
    shear: 8.4,
    vitPattern: "Symmetric Eyewall with Intense Core Convection (LLCC)",
    vitConfidence: 98.4,
    isLive: true,
    systemType: "CONTEMPORARY_BENCHMARK",
    waypoints: [
      { step: '+00h', label: 'Genesis Phase', labelHindi: 'जनन चरण', lat: 16.0, lon: 89.1, wind: '55 km/h', gusts: '70 km/h', pressure: '998 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+12h', label: 'Rapid Consolidation', labelHindi: 'तीव्र विकास', lat: 15.3, lon: 88.4, wind: '85 km/h', gusts: '105 km/h', pressure: '988 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+24h', label: 'Eyewall Formation', labelHindi: 'नेत्र दीवार निर्माण', lat: 15.6, lon: 86.2, wind: '140 km/h', gusts: '170 km/h', pressure: '968 hPa', cat: 'Very Severe Cyclone', catHindi: 'भीषण चक्रवात' },
      { step: '+36h', label: 'Peak Ocean Intensity', labelHindi: 'चरम समुद्री तीव्रता', lat: 16.1, lon: 83.5, wind: '195 km/h', gusts: '235 km/h', pressure: '950 hPa', cat: 'Extremely Severe Cyclone', catHindi: 'अति भीषण चक्रवात' },
      { step: '+48h', label: 'Andhra Coastal Impact', labelHindi: 'आंध्र तटीय लैंडफॉल', lat: 16.4, lon: 81.8, wind: '222 km/h', gusts: '260 km/h', pressure: '942 hPa', cat: 'Landfall Strike', catHindi: 'तट से टकराया' },
      { step: '+72h', label: 'Inland Dissipation', labelHindi: 'आंतरिक क्षीणता', lat: 21.9, lon: 81.6, wind: '55 km/h', gusts: '70 km/h', pressure: '996 hPa', cat: 'Remnant Depression', catHindi: 'अवशेष अवसाद' }
    ],
    intensityCurve: [
      { time: '+00h', speed: 55, pressure: 998 },
      { time: '+12h', speed: 85, pressure: 988 },
      { time: '+24h', speed: 140, pressure: 968 },
      { time: '+36h', speed: 195, pressure: 950 },
      { time: '+48h (Peak)', speed: 222, pressure: 942 },
      { time: '+72h', speed: 55, pressure: 996 }
    ],
    track: [
      [16.0, 89.1], [15.3, 88.4], [15.6, 86.2], [16.1, 83.5], [16.4, 81.8], [21.9, 81.6]
    ],
    cone: [
      [16.0, 89.1], [16.8, 89.8], [17.5, 85.0], [22.8, 83.5],
      [22.0, 80.0], [17.0, 80.5], [14.8, 87.5], [16.0, 89.1]
    ]
  },
  murasu: {
    id: 'murasu',
    name: "Severe Cyclonic Storm MURASU (2026)",
    shortName: "Cyclone MURASU",
    shortNameHindi: "चक्रवात मुरासु",
    hindiName: "भीषण चक्रवाती तूफान मुरासु (2026)",
    basin: "Bay of Bengal",
    basinHindi: "बंगाल की खाड़ी",
    stage: "Severe Cyclonic Storm (IMD)",
    stageHindi: "भीषण चक्रवाती तूफान (आईएमडी)",
    threat: "Red Alert (Active Rainfall & Surge)",
    threatHindi: "लाल चेतावनी (सक्रिय भारी वर्षा)",
    dvorak: "T3.5",
    risk48h: "88%",
    wind: "110",
    gusts: "135",
    pressure: "988",
    speed: "16",
    direction: "West-North-West (290°)",
    directionHindi: "पश्चिम-उत्तर-पश्चिम (290°)",
    lat: 15.8,
    lon: 80.2,
    target: "South Coastal Andhra & North Tamil Nadu (Nellore-Chennai-Bapatla)",
    targetHindi: "दक्षिण तटीय आंध्र व उत्तर तमिलनाडु (नेल्लोर-चेन्नई-बापटला)",
    window: "Active Impact Window / Flood Warning",
    windowHindi: "सक्रिय प्रभाव खिड़की / बाढ़ चेतावनी",
    sst: 30.2,
    shear: 10.5,
    vitPattern: "Curved Banding with High Convective Precipitation",
    vitConfidence: 94.2,
    isLive: true,
    systemType: "CONTEMPORARY_ACTIVE",
    waypoints: [
      { step: '+00h', label: 'Southwest Bay Low', labelHindi: 'दक्षिण-पश्चिम बंगाल खाड़ी', lat: 12.8, lon: 84.5, wind: '45 km/h', gusts: '60 km/h', pressure: '1002 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+12h', label: 'Intensification Phase', labelHindi: 'तीव्रता चरण', lat: 13.6, lon: 83.2, wind: '65 km/h', gusts: '80 km/h', pressure: '996 hPa', cat: 'Deep Depression', catHindi: 'गहरा अवसाद' },
      { step: '+24h', label: 'Storm Naming Phase', labelHindi: 'तूफान नामकरण', lat: 14.5, lon: 82.0, wind: '85 km/h', gusts: '105 km/h', pressure: '992 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+36h', label: 'Coastal Approach', labelHindi: 'तटीय अग्रगमन', lat: 15.2, lon: 81.0, wind: '105 km/h', gusts: '125 km/h', pressure: '989 hPa', cat: 'Severe Cyclone', catHindi: 'भीषण चक्रवात' },
      { step: '+48h', label: 'Coast Crossing', labelHindi: 'तटीय प्रवेश (लैंडफॉल)', lat: 15.8, lon: 80.2, wind: '110 km/h', gusts: '135 km/h', pressure: '988 hPa', cat: 'Severe Cyclone', catHindi: 'भीषण चक्रवात' },
      { step: '+72h', label: 'Inland Heavy Rain', labelHindi: 'आंतरिक भारी वर्षा', lat: 17.0, lon: 79.5, wind: '45 km/h', gusts: '60 km/h', pressure: '1004 hPa', cat: 'Inland Depression', catHindi: 'आंतरिक अवसाद' }
    ],
    intensityCurve: [
      { time: '+00h', speed: 45, pressure: 1002 },
      { time: '+12h', speed: 65, pressure: 996 },
      { time: '+24h', speed: 85, pressure: 992 },
      { time: '+36h', speed: 105, pressure: 989 },
      { time: '+48h (Landfall)', speed: 110, pressure: 988 },
      { time: '+72h', speed: 45, pressure: 1004 }
    ],
    track: [
      [12.8, 84.5], [13.6, 83.2], [14.5, 82.0], [15.2, 81.0], [15.8, 80.2], [17.0, 79.5]
    ],
    cone: [
      [12.8, 84.5], [14.2, 85.5], [16.5, 82.5], [18.2, 80.5],
      [17.8, 78.5], [15.0, 79.0], [13.0, 83.0], [12.8, 84.5]
    ]
  },
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
    dvorak: "T2.0 (Developing)",
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
    sst: 30.5,
    shear: 11.2,
    vitPattern: "Curved Banding (LLCC)",
    vitConfidence: 84.6,
    waypoints: [
      { step: '+00h', label: 'Vortex Fix (Observed)', labelHindi: 'भंवर केंद्र (अवलोकित)', lat: 13.5, lon: 88.5, wind: '42 km/h', gusts: '55 km/h', pressure: '1004 hPa', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र' },
      { step: '+12h', label: 'Consolidation Phase', labelHindi: 'समेकन चरण', lat: 14.4, lon: 87.6, wind: '50 km/h', gusts: '65 km/h', pressure: '1000 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+24h', label: 'Deepening Center', labelHindi: 'गहराता केंद्र', lat: 15.3, lon: 86.8, wind: '62 km/h', gusts: '80 km/h', pressure: '995 hPa', cat: 'Deep Depression', catHindi: 'गहरा अवसाद' },
      { step: '+48h', label: 'Tropical Storm Stage', labelHindi: 'चक्रवाती तूफान चरण', lat: 16.5, lon: 85.9, wind: '80 km/h', gusts: '100 km/h', pressure: '988 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+60h', label: 'Near Coastal Inflow', labelHindi: 'तटीय आगमन', lat: 17.8, lon: 85.1, wind: '95 km/h', gusts: '120 km/h', pressure: '980 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+72h', label: 'Odisha-Andhra Landfall', labelHindi: 'ओडिशा-आंध्र लैंडफॉल', lat: 19.4, lon: 84.7, wind: '110 km/h', gusts: '135 km/h', pressure: '972 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' }
    ],
    intensityCurve: [
      { time: '+00h (Fix)', speed: 42, pressure: 1004 },
      { time: '+12h', speed: 50, pressure: 1000 },
      { time: '+24h', speed: 62, pressure: 995 },
      { time: '+48h', speed: 80, pressure: 988 },
      { time: '+60h', speed: 95, pressure: 980 },
      { time: '+72h (Landfall)', speed: 110, pressure: 972 },
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
    dvorak: "T1.5 (Low Area)",
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
    sst: 30.1,
    shear: 12.5,
    vitPattern: "Convective Hotspot",
    vitConfidence: 81.2,
    waypoints: [
      { step: '+00h', label: 'Observed Center', labelHindi: 'अवलोकित केंद्र', lat: 14.8, lon: 66.2, wind: '40 km/h', gusts: '50 km/h', pressure: '1005 hPa', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र' },
      { step: '+12h', label: 'North-East Track', labelHindi: 'उत्तर-पूर्व ट्रैक', lat: 16.2, lon: 67.0, wind: '48 km/h', gusts: '60 km/h', pressure: '1001 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+24h', label: 'Maritime Intensification', labelHindi: 'समुद्री तीव्रता', lat: 17.8, lon: 68.1, wind: '58 km/h', gusts: '75 km/h', pressure: '996 hPa', cat: 'Deep Depression', catHindi: 'गहरा अवसाद' },
      { step: '+48h', label: 'Saurashtra Approach', labelHindi: 'सौराष्ट्र तटीय अग्रगमन', lat: 19.5, lon: 69.0, wind: '75 km/h', gusts: '95 km/h', pressure: '990 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+72h', label: 'Kutch Coastline Outlook', labelHindi: 'कच्छ तटरेखा अनुमान', lat: 21.2, lon: 69.8, wind: '90 km/h', gusts: '115 km/h', pressure: '982 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' }
    ],
    intensityCurve: [
      { time: '+00h (Obs)', speed: 40, pressure: 1005 },
      { time: '+12h', speed: 48, pressure: 1001 },
      { time: '+24h', speed: 58, pressure: 996 },
      { time: '+48h', speed: 75, pressure: 990 },
      { time: '+72h (Outlook)', speed: 90, pressure: 982 },
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
    dvorak: "T3.5",
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
    sst: 29.8,
    shear: 11.5,
    vitPattern: "Curved Banding (Eye Formation)",
    vitConfidence: 91.5,
    waypoints: [
      { step: '+00h', label: 'Genesis Phase', labelHindi: 'जनन चरण', lat: 18.2, lon: 88.5, wind: '65 km/h', gusts: '80 km/h', pressure: '996 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+12h', label: 'Rapid Intensification', labelHindi: 'तीव्र गति वृद्धि', lat: 18.9, lon: 88.0, wind: '85 km/h', gusts: '105 km/h', pressure: '988 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+24h', label: 'Peak Maritime Velocity', labelHindi: 'शीर्ष समुद्री वेग', lat: 19.7, lon: 87.5, wind: '110 km/h', gusts: '125 km/h', pressure: '974 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+36h', label: 'Dhamra Port Landfall', labelHindi: 'धामरा बंदरगाह लैंडफॉल', lat: 20.8, lon: 86.9, wind: '115 km/h', gusts: '135 km/h', pressure: '970 hPa', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान' },
      { step: '+48h', label: 'Inland Dissipation', labelHindi: 'अंतर्देशीय क्षीणता', lat: 22.1, lon: 85.8, wind: '60 km/h', gusts: '75 km/h', pressure: '992 hPa', cat: 'Depression', catHindi: 'अवसाद' },
      { step: '+60h', label: 'Remnant Low', labelHindi: 'अवशेष निम्न दबाव', lat: 23.4, lon: 84.8, wind: '35 km/h', gusts: '45 km/h', pressure: '1004 hPa', cat: 'Well Marked Low', catHindi: 'सुस्पष्ट निम्न दबाव' }
    ],
    intensityCurve: [
      { time: '23 Oct', speed: 65, pressure: 998 },
      { time: '24 Oct 08:30', speed: 85, pressure: 990 },
      { time: '24 Oct 20:30', speed: 105, pressure: 986 },
      { time: '25 Oct (Landfall)', speed: 115, pressure: 970 },
      { time: '25 Oct 14:30', speed: 70, pressure: 992 },
      { time: '26 Oct', speed: 45, pressure: 1004 },
    ],
    track: [
      [18.2, 88.5], [18.9, 88.0], [19.7, 87.5], [20.8, 86.9], [22.1, 85.8], [23.4, 84.8]
    ],
    cone: [
      [18.2, 88.5], [19.4, 89.4], [21.0, 88.8], [23.8, 87.2],
      [23.5, 83.2], [20.8, 84.8], [19.0, 86.8], [18.2, 88.5]
    ]
  },
  biparjoy: {
    id: 'biparjoy',
    name: "Extremely Severe Cyclonic Storm BIPARJOY (Arabian Sea Benchmark)",
    shortName: "Cyclone BIPARJOY",
    shortNameHindi: "चक्रवात बिपरजॉय",
    hindiName: "अत्यंत भीषण चक्रवाती तूफान बिपरजॉय (ऐतिहासिक केस अध्ययन)",
    basin: "Arabian Sea",
    basinHindi: "अरब सागर",
    stage: "Extremely Severe Cyclonic Storm (Cat 3)",
    stageHindi: "अत्यंत भीषण चक्रवाती तूफान",
    dvorak: "T5.0",
    risk48h: "Formed Cyclone",
    wind: "145",
    gusts: "170",
    pressure: "965",
    speed: "12",
    direction: "North-North-East",
    directionHindi: "उत्तर-उत्तर-पूर्व",
    lat: 23.3,
    lon: 68.6,
    target: "Jakhau Port & Kutch Coast, Gujarat",
    targetHindi: "जखौ बंदरगाह एवं कच्छ तट, गुजरात",
    window: "Landfall Recorded",
    windowHindi: "लैंडफॉल दर्ज किया गया",
    threat: "Red Alert",
    threatHindi: "रेड अलर्ट",
    threatColor: "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
    sst: 31.0,
    shear: 10.5,
    vitPattern: "Eye / Embedded Center",
    vitConfidence: 94.2,
    waypoints: [
      { step: '+00h', label: 'Genesis Phase', labelHindi: 'जनन चरण', lat: 12.1, lon: 66.0, wind: '55 km/h', gusts: '70 km/h', pressure: '1000 hPa', cat: 'Deep Depression', catHindi: 'गहरा अवसाद' },
      { step: '+12h', label: 'Intensification', labelHindi: 'तीव्रता चरण', lat: 14.5, lon: 66.2, wind: '85 km/h', gusts: '105 km/h', pressure: '988 hPa', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान' },
      { step: '+24h', label: 'Severe Stage', labelHindi: 'भीषण चरण', lat: 17.2, lon: 67.0, wind: '120 km/h', gusts: '145 km/h', pressure: '975 hPa', cat: 'Very Severe Cyclonic Storm', catHindi: 'अति भीषण चक्रवाती तूफान' },
      { step: '+48h', label: 'Peak Maritime Intensity', labelHindi: 'शीर्ष समुद्री तीव्रता', lat: 19.8, lon: 67.4, wind: '165 km/h', gusts: '190 km/h', pressure: '958 hPa', cat: 'Extremely Severe Cyclonic Storm', catHindi: 'अत्यंत भीषण चक्रवाती तूफान' },
      { step: '+60h', label: 'Jakhau Port Landfall', labelHindi: 'जखौ बंदरगाह लैंडफॉल', lat: 23.3, lon: 68.6, wind: '125 km/h', gusts: '150 km/h', pressure: '975 hPa', cat: 'Very Severe Cyclonic Storm', catHindi: 'अति भीषण चक्रवाती तूफान' },
      { step: '+72h', label: 'Rajasthan Weakening', labelHindi: 'राजस्थान में क्षीण', lat: 24.6, lon: 71.4, wind: '50 km/h', gusts: '65 km/h', pressure: '995 hPa', cat: 'Depression', catHindi: 'अवसाद' }
    ],
    intensityCurve: [
      { time: '08 Jun', speed: 110, pressure: 980 },
      { time: '11 Jun (Peak)', speed: 165, pressure: 958 },
      { time: '14 Jun', speed: 135, pressure: 970 },
      { time: '15 Jun (Landfall)', speed: 125, pressure: 975 },
      { time: '16 Jun', speed: 80, pressure: 988 },
      { time: '17 Jun', speed: 45, pressure: 998 },
    ],
    track: [
      [12.1, 66.0], [14.5, 66.2], [17.2, 67.0], [19.8, 67.4], [21.5, 66.8], [23.3, 68.6]
    ],
    cone: [
      [12.1, 66.0], [14.0, 68.0], [18.0, 70.0], [24.5, 71.0], 
      [25.0, 67.0], [20.5, 65.0], [15.0, 64.5], [12.1, 66.0]
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
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri World Dark Gray Canvas'
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
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri World Light Gray Canvas'
  }
};

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

// Translation helper functions
const getCategoryName = (cat, isHindi) => {
  if (!isHindi || !cat) return cat;
  const map = {
    'Low Pressure Area': 'निम्न दबाव क्षेत्र',
    'Incipient Cyclonic Circulation': 'प्रारंभिक चक्रवाती परिसंचरण',
    'Forming Convective Vortex': 'संवहनी भंवर निर्माण',
    'Depression': 'अवसाद',
    'Deep Depression': 'गहरा अवसाद',
    'Cyclonic Storm': 'चक्रवाती तूफान',
    'Severe Cyclonic Storm': 'भीषण चक्रवाती तूफान',
    'Severe Cyclonic Storm (Landfall Phase)': 'भीषण चक्रवाती तूफान (लैंडफॉल चरण)',
    'Very Severe Cyclonic Storm': 'अति भीषण चक्रवाती तूफान',
    'Extremely Severe Cyclonic Storm': 'अत्यंत भीषण चक्रवाती तूफान',
    'Super Cyclonic Storm': 'सुपर चक्रवाती तूफान',
    'Well Marked Low': 'सुस्पष्ट निम्न दबाव',
    'Remnant Low': 'अवशेष निम्न दबाव',
    'Tropical Storm Stage': 'उष्णकटिबंधीय तूफान चरण',
    'Consolidation Phase': 'समेकन चरण',
    'Genesis Phase': 'उत्पत्ति चरण',
    'Deepening Center': 'गहराता केंद्र',
    'Vortex Fix (Observed)': 'भंवर केंद्र (अवलोकित)',
    'Observed Center': 'अवलोकित केंद्र',
    'Rapid Intensification': 'तीव्र गति वृद्धि',
    'Peak Maritime Velocity': 'शीर्ष समुद्री वेग',
    'Dhamra Port Landfall': 'धामरा बंदरगाह लैंडफॉल',
    'Odisha-Andhra Landfall': 'ओडिशा-आंध्र लैंडफॉल',
    'Inland Dissipation': 'अंतर्देशीय क्षीणता',
    'Near Coastal Inflow': 'तटीय आगमन',
    'North-East Track': 'उत्तर-पूर्व ट्रैक',
    'Maritime Intensification': 'समुद्री तीव्रता',
    'Saurashtra Approach': 'सौराष्ट्र तटीय अग्रगमन',
    'Kutch Coastline Outlook': 'कच्छ तटरेखा अनुमान'
  };
  return map[cat] || cat;
};

const getDirectionName = (dir, isHindi) => {
  if (!isHindi || !dir) return dir;
  const map = {
    'North-West': 'उत्तर-पश्चिम',
    'North-East': 'उत्तर-पूर्व',
    'North-Northwest': 'उत्तर-उत्तर-पश्चिम',
    'North': 'उत्तर',
    'North-North-East': 'उत्तर-उत्तर-पूर्व',
    'West': 'पश्चिम',
    'East': 'पूर्व',
    'South': 'दक्षिण',
    'Stationary': 'स्थिर'
  };
  return map[dir] || dir;
};

const Welcome = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState('arnab');
  const [liveNews, setLiveNews] = useState(FALLBACK_CYCLONE_NEWS);
  const [activeNav, setActiveNav] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('vayu_is_hindi') === 'true';
  });
  const [activeServiceModal, setActiveServiceModal] = useState(null);

  // Auto-rotating Major Cities Weather Carousel state (rotates every 3-4 seconds)
  const [cityCarouselIndex, setCityCarouselIndex] = useState(0);
  const [isCityCarouselPaused, setIsCityCarouselPaused] = useState(false);
  const [activeCityForecastModal, setActiveCityForecastModal] = useState(null);
  const [isCarouselAnimated, setIsCarouselAnimated] = useState(true);
  const [hoveredCardIdx, setHoveredCardIdx] = useState(null);
  const [itemsPerScreen, setItemsPerScreen] = useState(5);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragDeltaXRef = useRef(0);
  const lastWheelTimeRef = useRef(0);

  // Responsive items-per-screen detection
  useEffect(() => {
    const calcItems = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerScreen(5);
      else if (w >= 1024) setItemsPerScreen(4);
      else if (w >= 768) setItemsPerScreen(3);
      else if (w >= 640) setItemsPerScreen(2);
      else setItemsPerScreen(1);
    };
    calcItems();
    window.addEventListener('resize', calcItems);
    return () => window.removeEventListener('resize', calcItems);
  }, []);

  // Extended array with duplicates of the first 5 elements for seamless infinite looping
  const extendedCities = useMemo(() => {
    return [...MAJOR_CITIES_WEATHER, ...MAJOR_CITIES_WEATHER.slice(0, 5)];
  }, []);

  // Auto-rotate every 3.5 seconds
  useEffect(() => {
    if (isCityCarouselPaused) return;
    const timer = setInterval(() => {
      setIsCarouselAnimated(true);
      setCityCarouselIndex(prev => prev + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [isCityCarouselPaused]);

  // Seamlessly reset index to 0 without animation once sliding into duplicate items
  const handleCarouselTransitionEnd = () => {
    if (cityCarouselIndex >= MAJOR_CITIES_WEATHER.length) {
      setIsCarouselAnimated(false);
      setCityCarouselIndex(0);
    }
  };

  const handlePrevCity = () => {
    if (cityCarouselIndex === 0) {
      setIsCarouselAnimated(false);
      setCityCarouselIndex(MAJOR_CITIES_WEATHER.length);
      setTimeout(() => {
        setIsCarouselAnimated(true);
        setCityCarouselIndex(MAJOR_CITIES_WEATHER.length - 1);
      }, 30);
    } else {
      setIsCarouselAnimated(true);
      setCityCarouselIndex(prev => prev - 1);
    }
  };

  const handleNextCity = () => {
    setIsCarouselAnimated(true);
    setCityCarouselIndex(prev => prev + 1);
  };

  // Horizontal scroll wheel handler (two-finger swipe on trackpad or shift+scroll)
  const handleCarouselWheel = (e) => {
    const dx = e.deltaX;
    const dy = e.shiftKey ? e.deltaY : 0;
    const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(delta) > 15) {
      const now = Date.now();
      if (now - lastWheelTimeRef.current > 380) {
        lastWheelTimeRef.current = now;
        if (delta > 0) {
          handleNextCity();
        } else {
          handlePrevCity();
        }
      }
    }
  };

  // Touch & Mouse Drag handlers for tactile 3D scrolling
  const handleDragStart = (e) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    dragDeltaXRef.current = 0;
    setIsCityCarouselPaused(true);
  };

  const handleDragMove = (e) => {
    if (!isDraggingRef.current) return;
    const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const delta = currentX - dragStartXRef.current;
    dragDeltaXRef.current = delta;
    setDragOffsetPx(delta);
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = dragDeltaXRef.current;
    setDragOffsetPx(0);
    if (delta < -45) {
      handleNextCity();
    } else if (delta > 45) {
      handlePrevCity();
    }
    setTimeout(() => {
      setIsCityCarouselPaused(false);
    }, 1200);
  };

  // Opening & Language Transition Animation state (plays on every reload & visit)
  const [animState, setAnimState] = useState(() => {
    const isHi = typeof window !== 'undefined' && localStorage.getItem('vayu_is_hindi') === 'true';
    return { isOpen: true, mode: 'first-visit', targetLang: isHi ? 'hi' : 'en', animKey: 1 };
  });

  const handleLanguageToggle = (nextVal) => {
    setAnimState(prev => {
      const nextIsHindi = typeof nextVal === 'boolean'
        ? nextVal
        : (prev.isOpen ? prev.targetLang !== 'hi' : !isHindi);
      return {
        isOpen: true,
        mode: 'switch',
        targetLang: nextIsHindi ? 'hi' : 'en',
        animKey: (prev.animKey || 0) + 1
      };
    });
  };

  const handleLanguageSwitchImmediate = useCallback((toHindi) => {
    setIsHindi(toHindi);
    localStorage.setItem('vayu_is_hindi', String(toHindi));
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setAnimState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const [fontSizeOffset, setFontSizeOffset] = useState(() => {
    try {
      const saved = localStorage.getItem('vayu_font_offset');
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [stateFilter, setStateFilter] = useState('All');
  const [matrixThreatFilter, setMatrixThreatFilter] = useState('All');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');
  const [safetyTab, setSafetyTab] = useState('before');
  const liveClock = useLiveClock(1000);
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
  
  // Dashboard Interactive States
  const [heroVisualizerMode, setHeroVisualizerMode] = useState('globe'); // 'globe' | 'trajectory' | 'radar'
  const [isGlobeAutoRotate, setIsGlobeAutoRotate] = useState(true);
  const [activeOfficerModal, setActiveOfficerModal] = useState(null);

  // Persist language in localStorage
  useEffect(() => {
    localStorage.setItem('vayu_is_hindi', isHindi ? 'true' : 'false');
  }, [isHindi]);

  // Sync active nav item and header elevation with scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sectionIds = ['safety-protocol', 'bulletins', 'threat-matrix', 'geospatial-map'];
      const scrollY = window.scrollY + 140;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          setActiveNav(id);
          return;
        }
      }
      // When at top of page, no navigation item is selected by default
      setActiveNav(null);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const current = systems[activeId] || INITIAL_SYSTEMS[activeId];

  // Fetch live AI model inference & real-time telemetry from FastAPI backend / marine feeds
  const fetchLiveBackendData = async () => {
    setIsSyncing(true);
    try {
      const baseUrl = await getLiveBaseUrl();

      // Continuous Automated Ingestion: Fetch live cyclone events (Arnab, Murasu, GDACS) & national news
      const feedPromise = fetchLiveCycloneFeed().catch(() => null);
      const newsPromise = fetchLiveNewsFeed().catch(() => null);

      const bayPromise = baseUrl
        ? fetch(`${baseUrl}/api/v1/cyclones/genesis-watch?basin=Bay%20of%20Bengal`, { signal: AbortSignal.timeout(2500) })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        : Promise.resolve(null);

      const arabPromise = baseUrl
        ? fetch(`${baseUrl}/api/v1/cyclones/genesis-watch?basin=Arabian%20Sea`, { signal: AbortSignal.timeout(2500) })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        : Promise.resolve(null);

      const danaPromise = baseUrl
        ? fetch(`${baseUrl}/api/v1/cyclones/cyclone-dana-2024`, { signal: AbortSignal.timeout(2500) })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        : Promise.resolve(null);

      const biparjoyPromise = baseUrl
        ? fetch(`${baseUrl}/api/v1/cyclones/cyclone-biparjoy-2023`, { signal: AbortSignal.timeout(2500) })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        : Promise.resolve(null);

      const oceanPromise = fetchLiveOceanTelemetry('Bay of Bengal').catch(() => null);

      const [bayRes, arabRes, danaRes, biparjoyRes, oceanRes, feedRes, newsRes] = await Promise.all([
        bayPromise, arabPromise, danaPromise, biparjoyPromise, oceanPromise, feedPromise, newsPromise
      ]);

      if (newsRes && Array.isArray(newsRes) && newsRes.length > 0) {
        setLiveNews(newsRes);
      }

      setSystems((prev) => {
        const next = { ...prev };

        // Ingest dynamic real-time cyclone feed (Arnab, Murasu, and any newly detected GDACS systems)
        if (feedRes && feedRes.storms && Array.isArray(feedRes.storms)) {
          feedRes.storms.forEach((storm) => {
            if (storm && storm.id) {
              next[storm.id] = {
                ...(next[storm.id] || {}),
                ...storm,
                isLive: true
              };
            }
          });
        }

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

        if (biparjoyRes && biparjoyRes.success && biparjoyRes.data) {
          const d = biparjoyRes.data;
          next.biparjoy = {
            ...next.biparjoy,
            name: d.name || next.biparjoy.name,
            wind: String(Math.round(d.peak_intensity_kmh || d.wind_speed_kmh || 145)),
            gusts: String(Math.round((d.peak_intensity_kmh || d.wind_speed_kmh || 145) * 1.2)),
            pressure: String(Math.round(d.lowest_mslp_hpa || d.pressure_hpa || 965)),
            isLive: true,
          };
        }

        if (oceanRes && oceanRes.status === 'LIVE_OCEAN_ACTIVE') {
          if (next.invest92b) {
            next.invest92b = {
              ...next.invest92b,
              sst: oceanRes.air_temperature_c ? oceanRes.air_temperature_c + 1.2 : next.invest92b.sst,
              pressure: oceanRes.surface_pressure_hpa ? String(Math.round(oceanRes.surface_pressure_hpa)) : next.invest92b.pressure,
              wind: oceanRes.surface_wind_kmh ? String(Math.round(oceanRes.surface_wind_kmh)) : next.invest92b.wind,
              gusts: oceanRes.surface_wind_gusts_kmh ? String(Math.round(oceanRes.surface_wind_gusts_kmh)) : next.invest92b.gusts,
              isLive: true
            };
          }
        }

        return next;
      });

      setSyncStatus('LIVE_AI_CONNECTED');
      setLastSyncTime(getFormattedLastUpdated());
    } catch (err) {
      console.warn('Backend sync warning:', err);
      setSyncStatus('CALIBRATED_FALLBACK');
      setLastSyncTime(getFormattedLastUpdated());
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

  // Enforce light mode and strip any legacy dark class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    try { localStorage.removeItem('theme'); } catch (e) {}
  }, []);

  // Dynamically scale root document font-size so all rem-based typography scales with A- / A+
  useEffect(() => {
    applyGlobalFontScale(fontSizeOffset);
  }, [fontSizeOffset]);

  // Listen to fontScaleChange custom events across tabs or components
  useEffect(() => {
    const handleFontScale = (e) => {
      if (typeof e.detail === 'number') {
        setFontSizeOffset(e.detail);
      }
    };
    window.addEventListener('fontScaleChange', handleFontScale);
    return () => window.removeEventListener('fontScaleChange', handleFontScale);
  }, []);

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
      className="min-h-screen bg-white text-zinc-950 font-sans antialiased selection:bg-black selection:text-white flex flex-col w-full max-w-full"
    >
      {/* Cinematic Opening & Language Translation Morph Animation */}
      <LanguageWelcomeAnimation
        key={animState.animKey}
        isOpen={animState.isOpen}
        mode={animState.mode}
        targetLanguage={animState.targetLang}
        onLanguageSwitch={handleLanguageSwitchImmediate}
        onComplete={handleAnimationComplete}
      />
      {/* TOP APEX BAR (MINIMAL, ELEGANT, EXECUTIVE - ALWAYS AT TOP) */}
      <PublicNavbar
        isHindi={isHindi}
        setIsHindi={handleLanguageToggle}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={setFontSizeOffset}
        isScrolled={isScrolled}
      />

      {/* MOVING NATIONAL ADVISORY TICKER (RIGHT TO LEFT) - CLEAN MONOCHROME */}
      <div className="bg-white border-b border-zinc-200 py-2 text-xs text-zinc-800 transition-colors overflow-hidden font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          {/* Pinned Authority Tag */}
          <div className="flex items-center gap-2 shrink-0 bg-black text-white px-2.5 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase z-10 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>
              {isHindi ? 'राष्ट्रीय चेतावनी' : 'NATIONAL ADVISORY'}
            </span>
          </div>

          {/* Continuous Right-to-Left Scrolling Marquee */}
          <div className="relative flex-1 overflow-hidden flex items-center group cursor-default">
            <div className="animate-ticker-rtl flex items-center gap-8 font-medium">
              {/* Pass 1 */}
              <span className="inline-flex items-center gap-6 whitespace-nowrap text-zinc-700">
                {liveNews.map((item, idx) => (
                  <span key={`news-pass1-${item.id || idx}`} className="inline-flex items-center gap-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300 select-none">
                      {item.source || 'BULLETIN'}
                    </span>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-black transition-colors"
                      >
                        {isHindi ? (item.titleHindi || item.title) : item.title}
                      </a>
                    ) : (
                      <span>{isHindi ? (item.titleHindi || item.title) : item.title}</span>
                    )}
                    <span className="text-zinc-300 select-none">•</span>
                  </span>
                ))}
              </span>

              {/* Seamless loop duplication pass */}
              <span className="inline-flex items-center gap-6 whitespace-nowrap text-zinc-700" aria-hidden="true">
                {liveNews.map((item, idx) => (
                  <span key={`news-pass2-${item.id || idx}`} className="inline-flex items-center gap-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300 select-none">
                      {item.source || 'BULLETIN'}
                    </span>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-black transition-colors"
                      >
                        {isHindi ? (item.titleHindi || item.title) : item.title}
                      </a>
                    ) : (
                      <span>{isHindi ? (item.titleHindi || item.title) : item.title}</span>
                    )}
                    <span className="text-zinc-300 select-none">•</span>
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
           HERO SECTION: MINIMALIST BLACK & WHITE CYCLONE INTELLIGENCE & STUDIO
           ========================================================================= */}
      <section
        id="three-globe-hero"
        className="flex-1 flex flex-col justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 relative w-full bg-white border-b border-zinc-200"
      >
        <div className="max-w-7xl mx-auto w-full space-y-6">
          
          {/* Top Operational Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-zinc-200 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-black text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {current.systemType === 'CONTEMPORARY_BENCHMARK' ? 'BENCHMARK SYSTEM' : 'LIVE MONITORED'}
                </span>
                <span>•</span>
                <span>{isHindi ? 'उपग्रह टेलीमेट्री सिंक' : 'IMD RSMC NEW DELHI • JTWC TELESYNC'}</span>
                <span>•</span>
                <span>INSAT-3DR / 1.0 KM</span>
              </div>

              {/* Cyclone Title & Meta Badges */}
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight uppercase font-sans">
                  {isHindi ? (current.shortNameHindi || current.shortName) : current.shortName}
                </h1>
                <span className="text-base sm:text-lg font-mono text-zinc-400 font-semibold">
                  (2026)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-zinc-100 text-zinc-900 border border-zinc-300">
                  {isHindi ? (current.stageHindi || current.stage) : current.stage}
                </span>
              </div>

              {/* Secondary Coordinates & Basin */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-500 pt-0.5">
                <span className="flex items-center gap-1 text-zinc-900 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-zinc-700" />
                  {isHindi ? current.basinHindi : current.basin}
                </span>
                <span className="text-zinc-300 select-none">•</span>
                <span className="flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="font-semibold text-zinc-900">{current.lat}°N, {current.lon}°E</span>
                </span>
                <span className="text-zinc-300 select-none">•</span>
                <span className="font-semibold text-zinc-900">
                  {isHindi ? current.threatHindi : current.threat}
                </span>
              </div>
            </div>

            {/* Storm Switcher Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs gap-1">
                {Object.values(systems).map((sys) => {
                  const isSelected = activeId === sys.id;
                  const isBenchmark = sys.id === 'dana' || sys.id === 'biparjoy';
                  return (
                    <button
                      key={sys.id}
                      onClick={() => {
                        setActiveId(sys.id);
                        setActiveStepIndex(0);
                        setIsPlayingTimeline(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-mono font-medium ${
                        isSelected
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-zinc-400'
                      }`} />
                      <span>{sys.id.toUpperCase()}</span>
                      {isSelected && (
                        <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-200 uppercase font-mono">
                          {isBenchmark ? 'Ref' : 'Live'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Refresh / Last Updated */}
              <button
                onClick={fetchLiveBackendData}
                disabled={isSyncing}
                title="Refresh Telemetry"
                className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* MAIN TWO-COLUMN SPLIT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LEFT COLUMN: Clean Minimalist Telemetry & Forecast (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              {/* 4 Core Telemetry Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Metric 1: Sustained Wind */}
                <div 
                  onClick={() => navigate('/threat-map')}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs font-sans font-medium uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Wind className="w-3.5 h-3.5 text-zinc-900" />
                      {isHindi ? 'सतत पवन गति' : 'Sustained Wind'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {Math.round(parseInt(current.wind || 40) * 0.539957)} KT
                    </span>
                  </div>

                  <div className="my-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-mono font-semibold text-zinc-950 tracking-tight">
                          {current.wind}
                        </span>
                        <span className="text-xs font-mono font-bold uppercase text-zinc-400">km/h</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-700 bg-zinc-50">
                        {isHindi ? 'झोंके: ' : 'Gusts: '}<strong className="text-black">{current.gusts || Math.round(current.wind * 1.25)} km/h</strong>
                      </span>
                    </div>

                    {/* 5-Segment Intensity Gauge */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const windVal = parseInt(current.wind || 40);
                        const threshold = windVal >= 166 ? 5 : windVal >= 118 ? 4 : windVal >= 89 ? 3 : windVal >= 63 ? 2 : 1;
                        const isLit = lvl <= threshold;
                        return (
                          <div
                            key={lvl}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              isLit ? 'bg-zinc-950' : 'bg-zinc-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2.5 border-t border-zinc-100 text-zinc-500">
                    <span>{isHindi ? 'वर्गीकरण' : 'IMD Category'}</span>
                    <span className="font-semibold text-black">
                      {isHindi ? (current.stageHindi || current.stage) : current.stage}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Central Pressure */}
                <div 
                  onClick={() => navigate('/threat-map')}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs font-sans font-medium uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Gauge className="w-3.5 h-3.5 text-zinc-900" />
                      {isHindi ? 'केंद्रीय दबाव' : 'Central Pressure'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">MSLP</span>
                  </div>

                  <div className="my-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-mono font-semibold text-zinc-950 tracking-tight">
                          {current.pressure}
                        </span>
                        <span className="text-xs font-mono font-bold uppercase text-zinc-400">hPa</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-700 bg-zinc-50 flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3 text-zinc-800" />
                        <span>-{Math.max(0, 1013 - parseInt(current.pressure || 1004))} hPa</span>
                      </span>
                    </div>

                    {/* 5-Segment Intensity Gauge */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const pVal = parseInt(current.pressure || 1000);
                        const threshold = pVal < 950 ? 5 : pVal < 970 ? 4 : pVal < 985 ? 3 : pVal < 1000 ? 2 : 1;
                        const isLit = lvl <= threshold;
                        return (
                          <div
                            key={lvl}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              isLit ? 'bg-zinc-950' : 'bg-zinc-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2.5 border-t border-zinc-100 text-zinc-500">
                    <span>{isHindi ? 'दबाव प्रवणता' : 'Gradient'}</span>
                    <span className="font-semibold text-black">
                      {parseInt(current.pressure) < 960 ? 'Extreme Central Deficit' : 'Intense Cyclonic Core'}
                    </span>
                  </div>
                </div>

                {/* Metric 3: 48h Cyclogenesis Risk */}
                <div 
                  onClick={() => navigate('/bulletins')}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs font-sans font-medium uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Activity className="w-3.5 h-3.5 text-zinc-900" />
                      {isHindi ? '48h लैंडफॉल / निर्माण जोखिम' : '48h Threat / Formation'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">ENSEMBLE</span>
                  </div>

                  <div className="my-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-4xl sm:text-5xl font-mono font-semibold text-zinc-950 tracking-tight">
                        {current.risk48h || '100%'}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-700 bg-zinc-50">
                        {current.vitConfidence ? `${current.vitConfidence}% Confidence` : 'Operational Fix'}
                      </span>
                    </div>

                    {/* 5-Segment Intensity Gauge */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const rVal = parseInt(current.risk48h || 100);
                        const threshold = Math.min(5, Math.max(1, Math.ceil(rVal / 20)));
                        const isLit = lvl <= threshold;
                        return (
                          <div
                            key={lvl}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              isLit ? 'bg-zinc-950' : 'bg-zinc-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2.5 border-t border-zinc-100 text-zinc-500">
                    <span>{isHindi ? 'डोवोरक पैमाना' : 'Dvorak Intensity'}</span>
                    <span className="font-semibold text-black">
                      {current.dvorak || 'T6.0'} • Cat 4 Intensity
                    </span>
                  </div>
                </div>

                {/* Metric 4: Forward Track & Speed */}
                <div 
                  onClick={() => navigate('/threat-map')}
                  className="bg-white border border-zinc-200 hover:border-zinc-400 p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs font-sans font-medium uppercase tracking-wider text-zinc-500">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Navigation2 className="w-3.5 h-3.5 text-zinc-900" />
                      {isHindi ? 'आगे बढ़ने की गति' : 'Forward Velocity'}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">GRU SEQ</span>
                  </div>

                  <div className="my-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-mono font-semibold text-zinc-950 tracking-tight">
                          {current.speed || '22'}
                        </span>
                        <span className="text-xs font-mono font-bold uppercase text-zinc-400">km/h</span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-700 bg-zinc-50 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-zinc-800" />
                        <span>{isHindi ? (current.directionHindi || current.direction) : current.direction}</span>
                      </span>
                    </div>

                    {/* 5-Segment Intensity Gauge */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {[1, 2, 3, 4, 5].map((lvl) => {
                        const sVal = parseInt(current.speed || 22);
                        const threshold = Math.min(5, Math.max(1, Math.round(sVal / 6)));
                        const isLit = lvl <= threshold;
                        return (
                          <div
                            key={lvl}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              isLit ? 'bg-zinc-950' : 'bg-zinc-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2.5 border-t border-zinc-100 text-zinc-500">
                    <span>{isHindi ? 'दिशा प्रवाह' : 'Steer Current'}</span>
                    <span className="font-semibold text-black">
                      Subtropical Ridge Steering
                    </span>
                  </div>
                </div>

              </div>

              {/* Thermodynamic Diagnostics Strip */}
              <div className="border border-zinc-200 rounded-2xl p-3.5 bg-zinc-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-zinc-600">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-3.5 h-3.5 text-zinc-900" />
                  <span>{isHindi ? 'समुद्री सतह तापमान: ' : 'SST: '}</span>
                  <strong className="text-black font-semibold">{current.sst || 30.8}°C</strong>
                  <span className="text-zinc-400 text-[11px]">(&gt;26.5°C Optimal)</span>
                </div>

                <div className="hidden sm:block w-px h-4 bg-zinc-200" />

                <div className="flex items-center gap-2">
                  <Waves className="w-3.5 h-3.5 text-zinc-900" />
                  <span>{isHindi ? 'विंड शीयर: ' : 'VWS: '}</span>
                  <strong className="text-black font-semibold">{current.shear || 8.4} kt</strong>
                  <span className="text-zinc-400 text-[11px]">(Low Shear)</span>
                </div>

                <div className="hidden sm:block w-px h-4 bg-zinc-200" />

                <div className="flex items-center gap-2 truncate max-w-[240px]">
                  <BrainCircuit className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                  <span className="truncate">{current.vitPattern || 'Symmetric Eyewall (LLCC)'}</span>
                </div>
              </div>

              {/* Coastal Corridor Alert Strip & Quick Navigation Buttons */}
              <div className="border border-zinc-200 rounded-2xl p-4 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-200 text-zinc-800">
                      {isHindi ? 'प्रभाव कॉरिडोर' : 'LANDFALL CORRIDOR'}
                    </span>
                    <strong className="text-sm font-semibold text-zinc-950 font-sans">
                      {isHindi ? (current.targetHindi || current.target) : current.target}
                    </strong>
                  </div>
                  <p className="text-xs font-mono text-zinc-600">
                    {isHindi ? 'अनुमानित लैंडफॉल समय: ' : 'Impact Window: '}
                    <span className="text-zinc-900 font-semibold">
                      {isHindi ? (current.windowHindi || current.window) : current.window}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate('/threat-map')}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{isHindi ? 'डॉपलर रडार' : 'Doppler Radar'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/bulletins')}
                    className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-100 text-zinc-900 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>{isHindi ? 'बुलेटिन' : 'Bulletins'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: State-of-the-art Aerospace Satellite Terminal (5 cols) */}
            <div className="lg:col-span-5 flex flex-col">
              
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col h-full min-h-[480px] shadow-xs">
                
                {/* Visualizer Header: Mode Switcher Tabs + Controls */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3 mb-3">
                  <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs">
                    <button
                      onClick={() => setHeroVisualizerMode('globe')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer text-xs font-mono font-medium ${
                        heroVisualizerMode === 'globe'
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'text-zinc-600 hover:text-black'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{isHindi ? '3D ग्लोब' : '3D Globe'}</span>
                    </button>

                    <button
                      onClick={() => setHeroVisualizerMode('trajectory')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer text-xs font-mono font-medium ${
                        heroVisualizerMode === 'trajectory'
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'text-zinc-600 hover:text-black'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isHindi ? '72h ट्रैक' : '72h Track'}</span>
                    </button>

                    <button
                      onClick={() => setHeroVisualizerMode('radar')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer text-xs font-mono font-medium ${
                        heroVisualizerMode === 'radar'
                          ? 'bg-black text-white shadow-xs font-semibold'
                          : 'text-zinc-600 hover:text-black'
                      }`}
                    >
                      <Satellite className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'उपग्रह' : 'Satellite IR'}</span>
                    </button>
                  </div>

                  {/* Mode-Specific Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {heroVisualizerMode === 'globe' && (
                      <button
                        onClick={() => setIsGlobeAutoRotate(prev => !prev)}
                        className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                          isGlobeAutoRotate 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                        }`}
                        title={isGlobeAutoRotate ? "Pause Globe Rotation" : "Resume Globe Rotation"}
                      >
                        {isGlobeAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {heroVisualizerMode === 'trajectory' && (
                      <button
                        onClick={() => setIsPlayingTimeline(prev => !prev)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-mono font-medium transition-colors cursor-pointer ${
                          isPlayingTimeline 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlayingTimeline ? (isHindi ? 'रोकें' : 'Pause') : (isHindi ? 'चलाएं' : 'Play 72h')}</span>
                      </button>
                    )}

                    <button
                      onClick={() => navigate('/threat-map')}
                      className="p-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:text-black hover:bg-zinc-50 transition cursor-pointer"
                      title="Open Fullscreen Threat Map"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Viewport Canvas Container: Aerospace Tactical Satellite Console */}
                <div className="flex-1 w-full rounded-2xl overflow-hidden relative min-h-[400px] bg-gradient-to-b from-[#080d1a] via-[#040812] to-[#010206] border border-zinc-800/80 shadow-inner">
                  
                  {/* Tactical Corner Crosshairs */}
                  <span className="absolute top-2 left-2 text-[10px] font-mono text-zinc-600 select-none pointer-events-none z-10">+</span>
                  <span className="absolute top-2 right-2 text-[10px] font-mono text-zinc-600 select-none pointer-events-none z-10">+</span>
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-zinc-600 select-none pointer-events-none z-10">+</span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-zinc-600 select-none pointer-events-none z-10">+</span>

                  {/* MODE 1: 3D THREE.JS EARTH GLOBE */}
                  {heroVisualizerMode === 'globe' && (
                    <div className="w-full h-full relative">
                      <ThreeCycloneGlobe
                        targetLat={current.lat}
                        targetLon={current.lon}
                        systemName={isHindi ? (current.shortNameHindi || current.shortName) : current.shortName}
                        category={isHindi ? (current.stageHindi || current.stage) : current.stage}
                        risk={current.risk48h || '100%'}
                        autoRotate={isGlobeAutoRotate}
                        showTelemetry={false}
                        className="w-full h-full relative"
                      />
                      
                      {/* Floating Tactical Satellite HUD Badge */}
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-200 space-y-0.5 shadow-lg">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>INSAT-3DR / 3D ORBITAL VIEW</span>
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            VORTEX EYE: <strong className="text-white">{current.lat}°N, {current.lon}°E</strong> • {current.wind} KM/H
                          </div>
                        </div>
                      </div>

                      {/* Bottom Tactical Controls & Orbit Status */}
                      <div className="absolute bottom-3 inset-x-3 z-10 pointer-events-none flex items-center justify-between px-2 text-[10px] font-mono text-zinc-400">
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-zinc-800/80">
                          {isHindi ? 'घुमाने के लिए ड्रैग करें • ज़ूम के लिए स्क्रॉल' : 'DRAG TO ROTATE • SCROLL TO ZOOM'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-zinc-800/80 text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {isGlobeAutoRotate ? 'ORBIT ACTIVE' : 'MANUAL CONTROL'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* MODE 2: 72H TRAJECTORY SCRUBBER & INTENSITY RECHARTS */}
                  {heroVisualizerMode === 'trajectory' && (
                    <div className="w-full h-full p-4 flex flex-col justify-between bg-zinc-950 text-white select-none">
                      
                      {/* Top Step Info Card */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-zinc-400 font-mono uppercase tracking-wider text-[10px]">
                            {current.waypoints?.[activeStepIndex]?.step || '+00h'} {isHindi ? 'पूर्वानुमान बिंदु' : 'Forecast Point'}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-300">
                            {current.waypoints?.[activeStepIndex]?.lat}°N, {current.waypoints?.[activeStepIndex]?.lon}°E
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-white">
                          {isHindi 
                            ? (current.waypoints?.[activeStepIndex]?.labelHindi || current.waypoints?.[activeStepIndex]?.label) 
                            : (current.waypoints?.[activeStepIndex]?.label || 'Observed Center')}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-300 font-mono">
                          <span>
                            {isHindi ? 'पवन: ' : 'Wind: '}
                            <strong className="text-white">{current.waypoints?.[activeStepIndex]?.wind}</strong>
                          </span>
                          <span>
                            {isHindi ? 'दबाव: ' : 'MSLP: '}
                            <strong className="text-white">{current.waypoints?.[activeStepIndex]?.pressure}</strong>
                          </span>
                          <span className="text-zinc-400">
                            {isHindi 
                              ? (current.waypoints?.[activeStepIndex]?.catHindi || current.waypoints?.[activeStepIndex]?.cat) 
                              : current.waypoints?.[activeStepIndex]?.cat}
                          </span>
                        </div>
                      </div>

                      {/* Intensity Forecast Recharts Curve (Monochrome Clean Line) */}
                      <div className="my-2 h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={current.intensityCurve || (current.waypoints || []).map(w => ({
                              time: w.step,
                              speed: parseInt(w.wind) || 40,
                              pressure: parseInt(w.pressure) || 1000
                            }))} 
                            margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', color: '#ffffff' }} 
                            />
                            <Area type="monotone" dataKey="speed" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#speedGrad)" name="Wind Speed (km/h)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Scrubber Stepper Timeline Buttons */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1">
                          <span>{isHindi ? 'समय चरण' : 'Timestep'}</span>
                          <span>{activeStepIndex + 1} of {(current.waypoints || []).length || 6}</span>
                        </div>
                        <div className="grid grid-cols-6 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                          {(current.waypoints || []).map((wp, idx) => (
                            <button
                              key={wp.step || idx}
                              onClick={() => {
                                setActiveStepIndex(idx);
                                setIsPlayingTimeline(false);
                              }}
                              className={`py-1.5 px-1 rounded-lg text-center font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                                activeStepIndex === idx
                                  ? 'bg-white text-black'
                                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              }`}
                            >
                              {wp.step}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* MODE 3: ATMOSPHERIC SATELLITE RADAR / SHADER */}
                  {heroVisualizerMode === 'radar' && (
                    <div className="w-full h-full relative">
                      <CycloneAtmosphericLiveView />
                      
                      <div className="absolute top-3 left-3 z-10 pointer-events-none">
                        <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-200">
                          <span className="font-mono text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {isHindi ? 'इनसैट-३डीआर इन्फ्रारेड' : 'INSAT-3DR IR-1 Loop'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Main Content Sections Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 space-y-6">

          {/* =========================================================================
               CURRENT WEATHER ACROSS MAJOR CITIES (AUTO-ROTATING CAROUSEL)
               ========================================================================= */}
          <div
            className="rounded-[32px] bg-[#FAFAFA] dark:bg-slate-900/80 border border-slate-100/60 dark:border-slate-800/80 p-5 relative overflow-hidden group/carousel transition-colors"
            onMouseEnter={() => setIsCityCarouselPaused(true)}
            onMouseLeave={() => setIsCityCarouselPaused(false)}
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between mb-4 px-1 border-b border-slate-100 dark:border-slate-800 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <h2 className="font-heading font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900 dark:text-white">
                  {isHindi ? 'प्रमुख शहरों का वर्तमान मौसम' : 'CURRENT WEATHER ACROSS MAJOR CITIES'}
                </h2>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrevCity}
                  aria-label="Previous City"
                  className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextCity}
                  aria-label="Next City"
                  className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3D Glass Sliding Track Viewport with Wheel & Drag Gestures */}
            <div
              className="city-carousel-container relative z-10 select-none cursor-grab active:cursor-grabbing"
              onWheel={handleCarouselWheel}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              <div
                className={`city-carousel-track ${isCarouselAnimated && dragOffsetPx === 0 ? 'is-animated' : ''}`}
                style={{
                  transform: `translateX(calc(-1 * ${cityCarouselIndex} * (100% / var(--items-per-screen)) + ${dragOffsetPx}px))`
                }}
                onTransitionEnd={handleCarouselTransitionEnd}
              >
                {extendedCities.map((city, idx) => {
                  const centerIdx = cityCarouselIndex + Math.floor(itemsPerScreen / 2);
                  const positionOffset = idx - centerIdx;
                  const isActive = hoveredCardIdx !== null ? hoveredCardIdx === idx : idx === centerIdx;

                  return (
                    <div
                      key={`${city.id}-${idx}`}
                      className="city-carousel-item"
                      onMouseEnter={() => setHoveredCardIdx(idx)}
                      onMouseLeave={() => setHoveredCardIdx(null)}
                    >
                      <CityWeather3DCard
                        city={city}
                        idx={idx}
                        isHindi={isHindi}
                        isActive={isActive}
                        positionOffset={positionOffset}
                        renderWeatherIcon={renderWeatherIcon}
                        onOpenForecast={(city) => navigate(`/forecast/${city.id}`)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =========================================================================
               OUR SERVICES SECTION (RAINFALL, MONSOON, CYCLONE, CLIMATE SERVICES)
               ========================================================================= */}
          <div className="pt-2 sm:pt-2.5 relative">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2 mb-3.5 flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isHindi ? 'हमारी सेवाएं (OUR SERVICES)' : 'OUR SERVICES'}</span>
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                {isHindi ? 'भारत मौसम विज्ञान विभाग (IMD) अधिकृत मौसम सेवाएं' : 'National Meteorological & Early Warning Portals'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {SERVICES_DATA.map((srv) => {
                const IconComponent = srv.icon === 'cyclone' ? CycloneSwirlIcon : srv.icon;
                return (
                  <div
                    key={srv.id}
                    onClick={() => navigate(srv.route)}
                    className={`p-4 sm:p-5 rounded-2xl cursor-pointer group flex flex-col justify-between h-full border ${srv.cardBg} ${srv.cardBorder} hover:shadow-xs transition-all duration-150`}
                  >
                    <div>
                      {/* Card Header: Icon Badge + Pill Tag */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className={`w-9 h-9 rounded-lg border ${srv.iconBg} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${srv.tagClass} shrink-0`}>
                          {isHindi ? srv.tagHindi : srv.tag}
                        </span>
                      </div>

                      {/* Service Title */}
                      <h3 className="font-heading font-bold text-xs sm:text-[13px] uppercase tracking-wide leading-snug text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                        {isHindi ? srv.titleHindi : srv.title}
                      </h3>

                      {/* Teaser Description */}
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed mt-1.5 line-clamp-2">
                        {isHindi ? srv.teaserHindi : srv.teaser}
                      </p>
                    </div>

                    {/* Card Bottom: Read More Action with subtle arrow */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      <span className="text-[11px] font-medium">
                        {isHindi ? 'विवरण देखें' : 'Explore Service'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =========================================================================
               SIH AI CYCLONE INTELLIGENCE & PATTERN CLASSIFICATION SUITE PREVIEW
               Problem Statement: "AI/ML system for identification, classification, and prediction of tropical cyclone patterns using multi-source satellite data"
               ========================================================================= */}
          <div className="relative rounded-[32px] p-6 sm:p-7 bg-[#FAFAFA] dark:bg-slate-900/80 border border-slate-100/60 dark:border-slate-800/80 transition-colors">
            <div className="space-y-5">
              {/* Header Banner */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-100 dark:border-purple-900/50">
                      <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      {isHindi ? 'स्मार्ट इंडिया हैकाथॉन (SIH) एआई/एमएल सिस्टम' : 'SIH AI/ML INNOVATION SUITE'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {isHindi ? 'मल्टी-सोर्स उपग्रह डेटा एकीकरण' : 'Multi-Source Satellite Fusion Active'}
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-base sm:text-lg lg:text-xl text-slate-900 dark:text-white tracking-tight">
                    {isHindi 
                      ? 'उष्णकटिबंधीय चक्रवात पैटर्न पहचान, वर्गीकरण एवं पूर्वानुमान'
                      : 'Tropical Cyclone Pattern Identification, Classification & Prediction'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl mt-1 leading-relaxed">
                    {isHindi
                      ? 'बहु-स्रोत उपग्रह डेटा संलयन द्वारा वोर्टेक्स केंद्र पहचान (MobileNetV3), 4 डोवोरक पैटर्न वर्गीकरण (ResNet18) और 72 घंटे का न्यूरल ट्रैक पूर्वानुमान (GRU Seq2Seq)।'
                      : 'Multi-source satellite data fusion powering automated vortex identification (MobileNetV3 center fix), 4 validated Dvorak morphology classifications (ResNet18), and 72-hour neural spatiotemporal trajectory predictions (GRU Seq2Seq).'}
                  </p>
                </div>

                {/* Primary Launch Studio Button */}
                <div className="shrink-0 flex items-center gap-2.5">
                  <button
                    onClick={() => navigate('/ai-cyclone')}
                    className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BrainCircuit className="w-4 h-4" />
                    <span>{isHindi ? 'एआई चक्रवात स्टूडियो खोलें' : 'Launch AI Cyclone Studio'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 4 Feature Pillars Grid with Pastel Badges & Clean Rounded Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Pillar 1: Vortex Center Localization */}
                <div
                  onClick={() => navigate('/ai-cyclone?tab=identification')}
                  className="p-4.5 rounded-2xl cursor-pointer group h-full flex flex-col justify-between bg-[#EBF5FF] dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-900/50 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800 shadow-2xs">
                        <Crosshair className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-sky-700 dark:text-sky-300 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800">
                        MobileNetV3
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-[13px] font-heading font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug">
                      {isHindi ? '1. वोर्टेक्स पहचान व केंद्र निर्धारण' : '1. Vortex Center Localization'}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {isHindi ? 'स्वायत्त केंद्र फिक्स, 100% ऑब्जेक्टनेस सटीकता (4 परीक्षण फ्रेम) एवं Grad-CAM ध्यान हीटमैप' : 'Autonomous vortex center regression, 100% objectness accuracy and Grad-CAM attention heatmaps.'}
                    </p>
                  </div>
                </div>

                {/* Pillar 2: Pattern Classification */}
                <div
                  onClick={() => navigate('/ai-cyclone?tab=classification')}
                  className="p-4.5 rounded-2xl cursor-pointer group h-full flex flex-col justify-between bg-[#F3F0FF] dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800 shadow-2xs">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-purple-200/60 dark:border-purple-800">
                        4 Patterns
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-[13px] font-heading font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
                      {isHindi ? '2. संरचनात्मक पैटर्न वर्गीकरण' : '2. Pattern Classification'}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {isHindi ? 'डोवोरक आकारिकी (आई, कर्व्ड बैंड, शियर, शांत बेसलाइन) एवं आईएमडी विकास चक्र' : 'ResNet18 4-pattern morphology analysis (Eye, Curved Band, Shear, Calm) & IMD lifecycle stage.'}
                    </p>
                  </div>
                </div>

                {/* Pillar 3: Multi-Source Integration */}
                <div
                  onClick={() => navigate('/ai-cyclone?tab=multisource')}
                  className="p-4.5 rounded-2xl cursor-pointer group h-full flex flex-col justify-between bg-[#F0FDF4] dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 shadow-2xs">
                        <Satellite className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                        6 Feeds
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-[13px] font-heading font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {isHindi ? '3. बहु-स्रोत उपग्रह डेटा संलयन' : '3. Multi-Source Integration'}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {isHindi ? 'इन्सैट-3डीआर, ओशनसैट-3, जीपीएम राडार एवं आईएमडी डॉपलर नेटवर्क' : 'INSAT-3DR IR/WV, Oceansat-3 scatterometer, GPM Radar & IMD Coastal DWR.'}
                    </p>
                  </div>
                </div>

                {/* Pillar 4: 72h Track & Intensity */}
                <div
                  onClick={() => navigate('/ai-cyclone?tab=prediction')}
                  className="p-4.5 rounded-2xl cursor-pointer group h-full flex flex-col justify-between bg-[#FEF2F2] dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800 shadow-2xs">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wide uppercase text-rose-700 dark:text-rose-300 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-800">
                        72h Cone
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-[13px] font-heading font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                      {isHindi ? '4. ट्रैक व तीव्रता न्यूरल पूर्वानुमान' : '4. 72h Track & Intensity'}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {isHindi ? 'अनिश्चितता शंकु, केंद्रीय दबाव गिरावट व संवेदनशीलता सिम्युलेटर' : 'Uncertainty bounds, pressure drops & interactive What-If sensitivity sliders.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fast Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5 pb-1">
            <button
              onClick={() => navigate('/threat-map')}
              className="px-5 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-700 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{isHindi ? 'जीआईएस रडार मैप देखें' : 'Inspect GIS Radar Map'}</span>
            </button>

            <button
              onClick={() => navigate('/threat-map')}
              className="px-5 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{isHindi ? 'तटीय जिला आपदा मैट्रिक्स' : 'View District Threat Matrix'}</span>
            </button>
          </div>

      </div>

      {/* Service Details Modal */}
      {activeServiceModal && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveServiceModal(null)}
        >
          <div 
            className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.8)] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-950 dark:bg-black p-4 sm:p-5 text-white relative border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveServiceModal(null)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title={isHindi ? "बंद करें" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <div className={`p-2.5 rounded-2xl border ${activeServiceModal.iconBg}`}>
                  {activeServiceModal.icon === 'cyclone' ? (
                    <CycloneSwirlIcon className="w-7 h-7" />
                  ) : (
                    <activeServiceModal.icon className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${activeServiceModal.tagClass} inline-block mb-1`}>
                    {isHindi ? activeServiceModal.badgeHindi : activeServiceModal.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-black tracking-wide text-white">
                    {isHindi ? activeServiceModal.titleHindi : activeServiceModal.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHindi ? activeServiceModal.summaryHindi : activeServiceModal.summary}
              </p>

              {/* Stats Highlights */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {activeServiceModal.stats.map((st, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100/80 dark:border-slate-700/80 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                      {isHindi ? st.labelHindi : st.label}
                    </span>
                    <span className="text-sm font-black font-heading text-slate-900 dark:text-white block mt-0.5">
                      {st.val}
                    </span>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block truncate">
                      {st.sub}
                    </span>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveServiceModal(null)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isHindi ? 'बंद करें' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    const r = activeServiceModal.route;
                    setActiveServiceModal(null);
                    navigate(r);
                  }}
                  className="px-4.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isHindi ? activeServiceModal.routeLabelHindi : activeServiceModal.routeLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
           ACTIVE CITY FORECAST MODAL (3-DAY OUTLOOK)
           ========================================================================= */}
      {activeCityForecastModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveCityForecastModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.8)] max-w-md w-full overflow-hidden text-slate-900 dark:text-white"
          >
            {/* Modal Header */}
            <div className="bg-slate-950 dark:bg-black text-white p-4 sm:p-5 relative border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveCityForecastModal(null)}
                aria-label="Close Forecast Modal"
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-between pr-7">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                    {isHindi ? 'मौसम पूर्वानुमान एवं प्रेक्षण' : 'METEOROLOGICAL OBSERVATION & FORECAST'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-heading font-black tracking-wide">
                    {isHindi ? activeCityForecastModal.nameHindi : activeCityForecastModal.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-heading text-white">
                    {activeCityForecastModal.temp}°C
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {isHindi ? activeCityForecastModal.conditionHindi : activeCityForecastModal.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Current Key Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    {isHindi ? 'हवा की गति' : 'Wind'}
                  </span>
                  <strong className="text-xs font-bold block mt-0.5 text-slate-800 dark:text-slate-100">
                    {isHindi ? activeCityForecastModal.windSpeedHindi : activeCityForecastModal.windSpeed}
                  </strong>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400">
                    {isHindi ? activeCityForecastModal.windDirHindi : activeCityForecastModal.windDir}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    {isHindi ? 'आर्द्रता' : 'Humidity'}
                  </span>
                  <strong className="text-xs font-bold block mt-0.5 text-slate-800 dark:text-slate-100">
                    {activeCityForecastModal.humidity}
                  </strong>
                  <span className="text-[9.5px] text-slate-500 dark:text-slate-400">
                    {isHindi ? 'सापेक्षिक' : 'Relative'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    {isHindi ? 'दबाव' : 'Pressure'}
                  </span>
                  <strong className="text-xs font-bold block mt-0.5 text-slate-800 dark:text-slate-100">
                    {activeCityForecastModal.pressure}
                  </strong>
                  <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {isHindi ? 'सामान्य' : 'Nominal'}
                  </span>
                </div>
              </div>

              {/* 3-Day Outlook */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {isHindi ? '3 दिवसीय पूर्वानुमान (3-Day Outlook)' : '3-Day Outlook'}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {activeCityForecastModal.forecast?.map((fc, idx) => (
                    <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 text-center">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        {isHindi ? fc.dayHindi : fc.day}
                      </span>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold block mt-0.5">
                        {fc.cond}
                      </span>
                      <div className="flex items-center justify-center gap-1.5 text-xs font-black mt-1">
                        <span className="text-red-600 dark:text-red-400">{fc.high}</span>
                        <span className="text-slate-400 text-[10px]">/</span>
                        <span className="text-blue-600 dark:text-blue-400">{fc.low}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setActiveCityForecastModal(null)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isHindi ? 'बंद करें' : 'Close'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveCityForecastModal(null);
                      navigate('/city-tracker');
                    }}
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:inline-flex"
                  >
                    {isHindi ? 'सभी शहर' : 'All Cities'}
                  </button>
                  <button
                    onClick={() => {
                      const cId = activeCityForecastModal.id;
                      setActiveCityForecastModal(null);
                      navigate(`/forecast/${cId}`);
                    }}
                    className="px-4.5 py-2.5 rounded-2xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-400 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{isHindi ? '7-दिवसीय विस्तृत पूर्वानुमान' : 'Open 7-Day City Forecast'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Officer Detail Modal */}
      {activeOfficerModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveOfficerModal(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${activeOfficerModal.bg} ${activeOfficerModal.text}`}>
                {activeOfficerModal.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeOfficerModal.name}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">{activeOfficerModal.role} • {activeOfficerModal.status}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700/50">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">{isHindi ? 'स्टेशन:' : 'Station:'}</span>
                <span className="font-semibold text-slate-800 dark:text-white">Bhubaneswar IMD Radar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">{isHindi ? 'आपातकालीन चैनल:' : 'Emergency Channel:'}</span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">CH-08 (MoES)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">{isHindi ? 'प्रतिक्रिया स्थिति:' : 'Response Status:'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">De-escalation Active</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveOfficerModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Welcome;