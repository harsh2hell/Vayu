import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Umbrella, SunMedium, ArrowRightCircle
} from 'lucide-react';
import LanguageWelcomeAnimation from '../components/LanguageWelcomeAnimation';
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

const SERVICES_DATA = [
  {
    id: 'rainfall',
    title: 'RAINFALL INFORMATION',
    titleHindi: 'वर्षा की जानकारी',
    bgColor: 'bg-[#1D82B8]',
    icon: CloudRain,
    route: '/city-tracker',
    routeLabel: 'View Coastal Rainfall Tracker',
    routeLabelHindi: 'तटीय वर्षा ट्रैकर देखें',
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
    title: 'MONSOON INFORMATION',
    titleHindi: 'मानसून की जानकारी',
    bgColor: 'bg-[#B8860B]',
    icon: Umbrella,
    route: '/bulletins',
    routeLabel: 'Official Monsoon Bulletins',
    routeLabelHindi: 'आधिकारिक मानसून बुलेटिन',
    badge: 'Seasonal Circulation',
    badgeHindi: 'मौसमी परिसंचरण',
    summary: 'National monsoon synoptic charts, seasonal rainfall distribution, Northern Limit of Monsoon (NLM) tracking, and agricultural rainfall advisories.',
    summaryHindi: 'राष्ट्रीय मानसून सिनॉप्टिक चार्ट, मौसमी वर्षा वितरण, मानसून की उत्तरी सीमा (एनएलएम) ट्रैकिंग और कृषि वर्षा सलाह।',
    stats: [
      { label: 'Season Departure', labelHindi: 'मौसमी विचलन', val: '+4.2%', sub: 'Above Normal (LPA)' },
      { label: 'Active Trough', labelHindi: 'सक्रिय ट्रफ रेखा', val: 'Positioned', sub: 'South of normal' },
      { label: 'Next Pulse', labelHindi: 'अगला स्पंद', val: '+48h to +72h', sub: 'Bay of Bengal' },
    ]
  },
  {
    id: 'cyclone',
    title: 'CYCLONE INFORMATION',
    titleHindi: 'चक्रवात की जानकारी',
    bgColor: 'bg-[#057A2A]',
    icon: 'cyclone',
    route: '/threat-map',
    routeLabel: 'Inspect GIS Cyclone Radar',
    routeLabelHindi: 'जीआईएस चक्रवात रडार देखें',
    badge: 'Critical Warning Active',
    badgeHindi: 'गंभीर चेतावनी सक्रिय',
    summary: 'End-to-end tropical cyclogenesis intelligence, multi-spectral satellite imagery, machine-learning track consensus, storm surge hydrodynamics, and district impact matrices.',
    summaryHindi: 'उष्णकटिबंधीय चक्रवात जनन खुफिया, बहु-स्पेक्ट्रल उपग्रह इमेजरी, मशीन-लर्निंग ट्रैक सहमति, तूफान उछाल हाइड्रोडायनामिक्स और जिला प्रभाव मैट्रिक्स।',
    stats: [
      { label: 'Current System', labelHindi: 'वर्तमान प्रणाली', val: 'Invest 92B', sub: 'Bay of Bengal' },
      { label: 'Wind Intensity', labelHindi: 'पवन तीव्रता', val: '42 km/h', sub: 'Gusts 55 km/h' },
      { label: '48h Genesis Risk', labelHindi: '48 घंटे का जोखिम', val: '68%', sub: 'ViT Neural Model' },
    ]
  },
  {
    id: 'climate',
    title: 'CLIMATE SERVICES',
    titleHindi: 'जलवायु सेवाएं',
    bgColor: 'bg-[#881337]',
    icon: SunMedium,
    route: '/bulletins',
    routeLabel: 'Climate Outlook Bulletins',
    routeLabelHindi: 'जलवायु दृष्टिकोण बुलेटिन',
    badge: 'Extended Forecasts',
    badgeHindi: 'दीर्घकालिक पूर्वानुमान',
    summary: 'Decadal and sub-seasonal climate anomaly tracking, El Niño-Southern Oscillation (ENSO) diagnostic reports, Indian Ocean Dipole (IOD) indices, and ocean heat content (OHC).',
    summaryHindi: 'दशकीय और उप-मौसमी जलवायु विसंगति ट्रैकिंग, अल नीनो-दक्षिणी दोलन (ईएनएसओ) नैदानिक ​​रिपोर्ट, हिंद महासागर द्विध्रुव (आईओडी) सूचकांक और महासागरीय ऊष्मा सामग्री।',
    stats: [
      { label: 'ENSO Phase', labelHindi: 'ईएनएसओ स्थिति', val: 'ENSO-Neutral', sub: 'La Niña developing' },
      { label: 'IOD Status', labelHindi: 'आईओडी स्थिति', val: 'Neutral', sub: 'Index: +0.12°C' },
      { label: 'SST Anomaly', labelHindi: 'एसएसटी विसंगति', val: '+0.8°C', sub: 'North Indian Ocean' },
    ]
  }
];

const INITIAL_SYSTEMS = {
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
  const [activeId, setActiveId] = useState('invest92b');
  const [activeNav, setActiveNav] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('vayu_is_hindi') === 'true';
  });
  const [activeServiceModal, setActiveServiceModal] = useState(null);

  // Opening & Language Transition Animation state
  const [animState, setAnimState] = useState(() => {
    const hasSeenIntro = sessionStorage.getItem('vayu_intro_animated');
    if (!hasSeenIntro) {
      sessionStorage.setItem('vayu_intro_animated', 'true');
      return { isOpen: true, mode: 'first-visit', targetLang: 'en', animKey: 1 };
    }
    return { isOpen: false, mode: 'first-visit', targetLang: 'en', animKey: 0 };
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

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
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

  // Sync dark mode class and colorScheme with root html element and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Keep dark mode state in sync if changed across tabs or navigation
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
      className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col transition-colors duration-500 w-full max-w-full"
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
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        fontSizeOffset={fontSizeOffset}
        setFontSizeOffset={setFontSizeOffset}
        isScrolled={isScrolled}
      />

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
            {isHindi ? `अवलोकन: ${istTime}` : `Observation: ${istTime}`}
          </span>
        </div>
      </div>

      {/* =========================================================================
           HERO SECTION: EXECUTIVE CYCLONE INTEL (FIT FOR PC & LAPTOP SCREENS)
           ========================================================================= */}
      <section
        id="three-globe-hero"
        className="flex-1 flex flex-col justify-center py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 relative w-full overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full my-auto space-y-3 sm:space-y-3.5 lg:space-y-4">

          {/* Active Detected Area Status Indicator */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5 sm:pb-3">
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
              <span>{isHindi ? 'भंवर निर्देशांक:' : 'Vortex Fix:'}</span>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {current.lat}°N, {current.lon}°E
              </span>
            </div>
          </div>

          {/* Hero Intel Presentation (Full Width) */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg text-xs font-semibold border bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800">
              <span>{isHindi ? (current.basinHindi || current.basin) : current.basin}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-heading font-black tracking-tight text-slate-950 dark:text-white leading-tight">
              {isHindi ? current.hindiName : current.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-5xl">
              {isHindi
                ? 'बहु-स्रोत उपग्रह डेटा और संख्यात्मक मौसम मॉडल का उपयोग करके पहचान, वर्गीकरण और 72 घंटे के प्रक्षेपवक्र पूर्वानुमान के लिए वास्तविक समय मौसम विज्ञान निगरानी।'
                : 'Real-time meteorological intelligence for identification, classification, and 72-hour trajectory prediction using multi-source satellite data and numerical weather models.'}
            </p>
          </div>

          {/* Live AI Telemetry Feed Status & Diagnostics */}
          <div className="bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-3.5 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {isHindi ? 'लाइव एआई मॉडल डेटा:' : 'Live AI Model Feed:'}
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                {current.vitPattern
                  ? (isHindi ? `वीआईटी आकारिकी (${current.vitPattern})` : `ViT Morphology (${current.vitPattern})`)
                  : (isHindi ? 'चक्रवातविज़न सीएनएन v2.1' : 'CycloneVision CNN v2.1')}
              </span>
              {current.sst && (
                <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
                  • {isHindi ? 'समुद्री तापमान' : 'SST'} {current.sst}°C • {isHindi ? 'पवन अपरूपण' : 'Shear'} {current.shear} kts
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400">
                {lastSyncTime
                  ? (isHindi ? `सिंक किया गया: ${lastSyncTime}` : `Synced: ${lastSyncTime}`)
                  : (isHindi ? 'बैकएंड कनेक्ट हो रहा है...' : 'Connecting backend...')}
              </span>
              <button
                onClick={fetchLiveBackendData}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title={isHindi ? "एआई मॉडल निष्कर्ष और महासागरीय टेलीमेट्री रीफ्रेश करें" : "Refresh AI Model Inference & Ocean Telemetry"}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isHindi ? 'एआई डेटा रीफ्रेश' : 'Sync AI Feed'}</span>
              </button>
            </div>
          </div>

          {/* 4 Clean Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xs transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">
                {isHindi ? 'सतत पवन गति' : 'Sustained Wind'}
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white">
                {current.wind} <span className="text-xs font-normal text-slate-500">{isHindi ? 'किमी/घंटा' : 'km/h'}</span>
              </div>
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {isHindi ? `झोंके ${current.gusts} किमी/घंटा` : `Gusts ${current.gusts} km/h`}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xs transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">
                {isHindi ? 'केंद्रीय दबाव' : 'Central Pressure'}
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white">
                {current.pressure} <span className="text-xs font-normal text-slate-500">{isHindi ? 'एचपीए' : 'hPa'}</span>
              </div>
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {isHindi ? 'बैरोमीटर रीडिंग' : 'Barometric Fix'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xs transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">
                {isHindi ? '48 घंटे में चक्रवात संभावना' : '48h Formation'}
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-amber-600 dark:text-amber-400">
                {current.risk48h}
              </div>
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {isHindi ? 'एआई वीआईटी मॉडल प्रायिकता' : 'ViT Probability'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-xs transition-colors">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5 font-medium">
                {isHindi ? 'गति एवं दिशा' : 'Movement'}
              </span>
              <div className="text-xl sm:text-2xl font-heading font-bold text-slate-950 dark:text-white">
                {isHindi ? (current.directionHindi || getDirectionName(current.direction, isHindi)) : current.direction}
              </div>
              <span className="text-[0.7rem] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {isHindi ? `गति ${current.speed} किमी/घंटा` : `Speed ${current.speed} km/h`}
              </span>
            </div>
          </div>

          {/* Coastal Corridor Strip */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-medium block">
                {isHindi ? 'अनुमानित तटीय प्रभाव क्षेत्र:' : 'Projected Coastal Corridor:'}
              </span>
              <strong className="text-slate-900 dark:text-white font-bold text-sm">
                {isHindi ? (current.targetHindi || current.target) : current.target}
              </strong>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-slate-600 dark:text-slate-300">
              <span>
                {isHindi ? 'समय सीमा: ' : 'Window: '}
                <strong className="text-slate-900 dark:text-white">
                  {isHindi ? (current.windowHindi || current.window) : current.window}
                </strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span>
                {isHindi ? 'डेटा फ़ीड: ' : 'Feed: '}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {isHindi ? 'इसरो मोसडैक ऑनलाइन' : 'ISRO MOSDAC Online'}
                </strong>
              </span>
            </div>
          </div>

          {/* =========================================================================
               OUR SERVICES SECTION (RAINFALL, MONSOON, CYCLONE, CLIMATE SERVICES)
               ========================================================================= */}
          <div className="pt-2 sm:pt-2.5">
            <div className="border-b border-slate-300 dark:border-slate-800 pb-1 mb-2.5 flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-950 dark:text-white font-heading">
                {isHindi ? 'हमारी सेवाएं (OUR SERVICES)' : 'OUR SERVICES'}
              </h2>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                {isHindi ? 'भारत मौसम विज्ञान विभाग (IMD) अधिकृत मौसम सेवाएं' : 'National Meteorological & Early Warning Portals'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
              {SERVICES_DATA.map((srv) => {
                const IconComponent = srv.icon === 'cyclone' ? CycloneSwirlIcon : srv.icon;
                return (
                  <div
                    key={srv.id}
                    onClick={() => setActiveServiceModal(srv)}
                    className={`${srv.bgColor} rounded-lg sm:rounded-xl p-3 sm:p-3.5 text-white shadow-xs hover:shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex items-center gap-3 relative overflow-hidden`}
                  >
                    {/* Subtle top gloss reflection */}
                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

                    {/* Service Icon */}
                    <div className="shrink-0 p-2 rounded-lg bg-black/15 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>

                    {/* Service Title & Read More */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-black text-xs sm:text-[13px] uppercase tracking-wide leading-tight text-white drop-shadow-xs">
                        {isHindi ? srv.titleHindi : srv.title}
                      </h3>
                      <div className="text-[11px] font-semibold text-white/90 flex items-center gap-1 mt-1 group-hover:text-white transition-colors">
                        <span>{isHindi ? 'अधिक पढ़ें' : 'Read More'}</span>
                        <ArrowRightCircle className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fast Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-0.5 pb-1">
            <button
              onClick={() => navigate('/threat-map')}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{isHindi ? 'जीआईएस रडार मैप देखें' : 'Inspect GIS Radar Map'}</span>
            </button>

            <button
              onClick={() => navigate('/threat-map')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>{isHindi ? 'तटीय जिला आपदा मैट्रिक्स' : 'View District Threat Matrix'}</span>
            </button>
          </div>

        </div>
      </section>

      {/* Service Details Modal */}
      {activeServiceModal && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveServiceModal(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`${activeServiceModal.bgColor} p-4 sm:p-5 text-white relative`}>
              <button
                onClick={() => setActiveServiceModal(null)}
                className="absolute top-3.5 right-3.5 p-1 rounded-lg bg-black/20 hover:bg-black/35 text-white transition-all cursor-pointer"
                title={isHindi ? "बंद करें" : "Close"}
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-black/20">
                  {activeServiceModal.icon === 'cyclone' ? (
                    <CycloneSwirlIcon className="w-7 h-7 text-white" />
                  ) : (
                    <activeServiceModal.icon className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 block">
                    {isHindi ? activeServiceModal.badgeHindi : activeServiceModal.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-heading font-black tracking-wide">
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
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-2.5 text-center">
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
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveServiceModal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {isHindi ? 'बंद करें' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    const r = activeServiceModal.route;
                    setActiveServiceModal(null);
                    navigate(r);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${activeServiceModal.bgColor} hover:brightness-110 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer`}
                >
                  <span>{isHindi ? activeServiceModal.routeLabelHindi : activeServiceModal.routeLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Welcome;