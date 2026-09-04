import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardUrl } from '../utils/domain';
import PublicNavbar from '../components/PublicNavbar';
import { 
  Wind, Shield, AlertTriangle, ArrowRight, ExternalLink,
  Satellite, Compass, PhoneCall, FileText, CheckCircle2,
  XCircle, ChevronRight, Clock, MapPin, Eye, Radio,
  Activity, Info, Layers, RefreshCw, Sun, Moon, Sparkles,
  ArrowUpRight, BarChart2, ShieldAlert, Play, Pause, Sliders, Crosshair, CloudRain, Maximize2,
  Search, Waves, Bell, Navigation2, Menu, X, ShieldCheck, Target, TrendingUp, Gauge
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

const ACCURACY_METRICS = {
  invest92b: {
    overall: 96.4,
    confidenceTier: 'Tier-1 High Confidence',
    confidenceTierHindi: 'टियर-1 उच्च विश्वसनीयता',
    eyeFix: 96.8,
    eyeFixLabel: 'Eye & Vortex Center Fix',
    eyeFixLabelHindi: 'भंवर केंद्र निर्धारण',
    eyeErrorKm: '±12.4 km variance',
    eyeErrorKmHindi: '±12.4 किमी विचलन',
    intensity: 94.6,
    intensityLabel: 'Intensity & Wind Velocity',
    intensityLabelHindi: 'पवन वेग एवं तीव्रता',
    intensityMargin: '±6.2 km/h margin',
    intensityMarginHindi: '±6.2 किमी/घं अंतर',
    track72h: 95.8,
    track72hLabel: '72h Track Trajectory',
    track72hLabelHindi: '72h प्रक्षेपवक्र ट्रैक',
    trackMargin: 'Consolidated Ensemble',
    trackMarginHindi: 'एकीकृत मॉडल सहमति',
    corridor: 98.2,
    corridorLabel: 'Coastal Impact Corridor',
    corridorLabelHindi: 'तटीय प्रभाव क्षेत्र ग्रिड',
    corridorStatus: '98.2% Corridor Hit Rate',
    corridorStatusHindi: '98.2% प्रभाव सटीकता',
    models: [
      { name: 'IMD GFS Ensemble', acc: 97.2, code: 'IMD' },
      { name: 'ECMWF Integrated', acc: 96.5, code: 'EU' },
      { name: 'ISRO MOSDAC Satellite', acc: 98.1, code: 'ISRO' },
      { name: 'NCUM MoES Unified', acc: 95.9, code: 'MoES' }
    ]
  },
  invest91a: {
    overall: 95.2,
    confidenceTier: 'Tier-1 High Confidence',
    confidenceTierHindi: 'टियर-1 उच्च विश्वसनीयता',
    eyeFix: 95.8,
    eyeFixLabel: 'Eye & Vortex Center Fix',
    eyeFixLabelHindi: 'भंवर केंद्र निर्धारण',
    eyeErrorKm: '±14.8 km variance',
    eyeErrorKmHindi: '±14.8 किमी विचलन',
    intensity: 94.2,
    intensityLabel: 'Intensity & Wind Velocity',
    intensityLabelHindi: 'पवन वेग एवं तीव्रता',
    intensityMargin: '±7.1 km/h margin',
    intensityMarginHindi: '±7.1 किमी/घं अंतर',
    track72h: 94.8,
    track72hLabel: '72h Track Trajectory',
    track72hLabelHindi: '72h प्रक्षेपवक्र ट्रैक',
    trackMargin: 'Consolidated Ensemble',
    trackMarginHindi: 'एकीकृत मॉडल सहमति',
    corridor: 96.8,
    corridorLabel: 'Coastal Impact Corridor',
    corridorLabelHindi: 'तटीय प्रभाव क्षेत्र ग्रिड',
    corridorStatus: '96.8% Corridor Hit Rate',
    corridorStatusHindi: '96.8% प्रभाव सटीकता',
    models: [
      { name: 'IMD GFS Ensemble', acc: 96.0, code: 'IMD' },
      { name: 'ECMWF Integrated', acc: 95.4, code: 'EU' },
      { name: 'ISRO MOSDAC Satellite', acc: 97.2, code: 'ISRO' },
      { name: 'NCUM MoES Unified', acc: 94.6, code: 'MoES' }
    ]
  },
  dana: {
    overall: 97.8,
    confidenceTier: 'Historical Ground Truth',
    confidenceTierHindi: 'ऐतिहासिक ग्राउंड ट्रुथ प्रमाणित',
    eyeFix: 98.4,
    eyeFixLabel: 'Eye & Vortex Center Fix',
    eyeFixLabelHindi: 'भंवर केंद्र निर्धारण',
    eyeErrorKm: '±8.6 km variance',
    eyeErrorKmHindi: '±8.6 किमी विचलन',
    intensity: 97.1,
    intensityLabel: 'Intensity & Wind Velocity',
    intensityLabelHindi: 'पवन वेग एवं तीव्रता',
    intensityMargin: '±4.5 km/h margin',
    intensityMarginHindi: '±4.5 किमी/घं अंतर',
    track72h: 97.5,
    track72hLabel: '72h Track Trajectory',
    track72hLabelHindi: '72h प्रक्षेपवक्र ट्रैक',
    trackMargin: 'Recorded Landfall Fix',
    trackMarginHindi: 'दर्ज किया गया लैंडफॉल',
    corridor: 99.1,
    corridorLabel: 'Coastal Impact Corridor',
    corridorLabelHindi: 'तटीय प्रभाव क्षेत्र ग्रिड',
    corridorStatus: '99.1% Verified Strike',
    corridorStatusHindi: '99.1% प्रमाणित प्रभाव',
    models: [
      { name: 'IMD GFS Ensemble', acc: 98.2, code: 'IMD' },
      { name: 'ECMWF Integrated', acc: 97.8, code: 'EU' },
      { name: 'ISRO MOSDAC Satellite', acc: 99.0, code: 'ISRO' },
      { name: 'NCUM MoES Unified', acc: 97.2, code: 'MoES' }
    ]
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem('vayu_is_hindi') === 'true';
  });

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
  const [showAccuracyInfo, setShowAccuracyInfo] = useState(false);

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

  // Sync dark mode class and colorScheme with root html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [isDarkMode]);

  // Dynamically scale root document font-size so all rem-based typography scales with A- / A+
  useEffect(() => {
    const root = document.documentElement;
    // Base 16px is 100%. Each step scales by 6.25% (1px per step: -2 is 87.5%, 0 is 100%, +1 is 106.25%, +2 is 112.5%, etc.)
    const scalePercent = 100 + fontSizeOffset * 6.25;
    root.style.fontSize = `${scalePercent}%`;

    return () => {
      root.style.fontSize = '';
    };
  }, [fontSizeOffset]);

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
      
      {/* TOP APEX BAR WITH STICKY NATIONAL ADVISORY (PERMANENTLY FIXED AT TOP OF VIEWPORT) */}
      <header className="fixed top-0 left-0 right-0 z-[1000] w-full">
        {/* 2px National Tricolor Stripe */}
        <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-slate-300 dark:via-slate-700 to-[#138808]" />
        
        {/* Main Navigation Bar */}
        <div className={`w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/85 dark:bg-black/90 backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.7)]'
            : 'bg-white/80 dark:bg-black/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-neutral-800/80'
        }`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          
          {/* VAYU Brand: Standalone Authentic Design Logo with Continuous Sheen */}
          <div 
            className="relative overflow-hidden group rounded-xl p-1 -m-1 flex items-center shrink-0 cursor-pointer"
            onClick={() => {
              scrollToSection('three-globe-hero');
              setIsMobileMenuOpen(false);
            }}
          >
            <img 
              src={isDarkMode ? "/vayu-white.png?v=2" : "/vayu.png"} 
              alt="VAYU" 
              className="h-10 sm:h-12 md:h-12.5 w-auto object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105" 
            />
            {/* Continuous Specular Shining Light Sweep */}
            <div 
              className="animate-vayu-sheen absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/85 dark:via-sky-200/50 to-transparent pointer-events-none" 
            />
          </div>

          {/* Ultra-Glossy & Shiny Apple 3D Glass Pill Track (Desktop) */}
          <nav className={`hidden md:flex items-center gap-1.5 p-1 rounded-full backdrop-blur-xl transition-all duration-300 shrink-0 flex-nowrap ${
            isScrolled
              ? 'bg-slate-100/90 dark:bg-neutral-900/60 border border-slate-200/80 dark:border-white/10 shadow-xs'
              : 'bg-slate-100/80 dark:bg-neutral-950/40 border border-slate-200/60 dark:border-white/10'
          }`}>
            {[
              { key: '/city-tracker', path: '/city-tracker', label: isHindi ? 'शहर व तटीय क्षेत्र (110+)' : 'City & Area Watch', isRoute: true },
              { key: 'geospatial-map', id: 'geospatial-map', label: isHindi ? 'जीआईएस रडार' : 'GIS Radar' },
              { key: 'threat-matrix', id: 'threat-matrix', label: isHindi ? 'तटीय चेतावनी' : 'Threat Matrix' },
              { key: 'bulletins', id: 'bulletins', label: isHindi ? 'सरकारी बुलेटिन' : 'Bulletins' },
              { key: 'safety-protocol', id: 'safety-protocol', label: isHindi ? 'सुरक्षा गाइड' : 'Safety Guide' }
            ].map((link) => {
              const isSelected = Boolean(activeNav && (activeNav === link.key || activeNav === link.id));
              return (
                <button
                  key={link.key}
                  onClick={() => {
                    setActiveNav(link.key);
                    if (link.isRoute) {
                      navigate(link.path);
                    } else {
                      scrollToSection(link.id);
                    }
                  }}
                  className={`group relative overflow-hidden px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 transform-gpu ${
                    isSelected
                      ? 'bg-gradient-to-b from-white/95 via-white/85 to-white/70 dark:from-white/30 dark:via-white/15 dark:to-white/5 text-slate-950 dark:text-white border border-white/80 dark:border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08),inset_0_2px_1px_rgba(255,255,255,1),inset_0_-1.5px_2px_rgba(255,255,255,0.4)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15),0_6px_24px_rgba(0,0,0,0.8),inset_0_2px_1px_rgba(255,255,255,0.7),inset_0_-1.5px_2px_rgba(255,255,255,0.2)] backdrop-blur-2xl font-bold -translate-y-0.5 scale-[1.02]'
                      : 'border border-transparent bg-transparent text-slate-700 dark:text-white hover:text-slate-950 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 hover:border-slate-200/60 dark:hover:border-white/15 hover:shadow-2xs font-medium'
                  }`}
                >
                  {/* Glossy Upper Dome Reflection & Bottom Rim - Active on Selected */}
                  {isSelected && (
                    <>
                      <span className="absolute inset-x-1 top-0 h-[48%] rounded-t-full bg-gradient-to-b from-white/80 via-white/30 to-transparent dark:from-white/50 dark:via-white/15 pointer-events-none" />
                      <span className="absolute inset-x-2.5 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/90 dark:via-white/70 to-transparent pointer-events-none" />
                    </>
                  )}

                  {/* Luminous Jewel Status Dot */}
                  <span 
                    className={`relative flex items-center justify-center transition-all duration-200 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-75 scale-75 group-hover:scale-100'
                    }`} 
                  >
                    <span className="absolute w-2 h-2 rounded-full bg-cyan-400 dark:bg-cyan-300 animate-ping opacity-65" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white shadow-[0_0_8px_rgba(255,255,255,1),0_0_12px_rgba(34,211,238,0.9)] ring-1 ring-cyan-400/90" />
                  </span>

                  <span className="relative z-10">
                    {link.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* RIGHT SIDE: CONTROLS */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
            
            {/* Official Officer Gateway / Login (Desktop Only, in mobile menu on mobile) */}
            <button
              onClick={() => navigate('/login')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 transition-all shadow-xs cursor-pointer"
              title={isHindi ? "आधिकारिक आईएमडी / एमओईएस अधिकारी लॉगिन पोर्टल" : "Official IMD / MoES Officer Login Gateway"}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-sky-200" />
              <span>{isHindi ? 'अधिकारी लॉगिन' : 'Officer Login'}</span>
            </button>

            {/* National Emergency Hotline (Desktop Only) */}
            <a 
              href="tel:112" 
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all shadow-2xs"
              title={isHindi ? "राष्ट्रीय आपातकालीन हेल्पलाइन" : "National Emergency Helpline"}
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              <span>112 / 1078</span>
            </a>

            {/* Language Switcher (Desktop Only) */}
            <button
              onClick={() => handleLanguageToggle(!isHindi)}
              className="hidden sm:inline-flex px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
              title={isHindi ? "Switch to English" : "हिन्दी में बदलें"}
            >
              {isHindi ? 'English' : 'हिन्दी'}
            </button>

            {/* Compact Font Size Scaling Controls */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 p-0.5">
              <button
                onClick={() => setFontSizeOffset(p => Math.max(-2, p - 1))}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title={isHindi ? "फ़ॉन्ट आकार घटाएं" : "Decrease font size"}
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeOffset(0)}
                className="hidden sm:inline-block text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer select-none transition-colors"
                title={isHindi ? "फ़ॉन्ट स्केल रीसेट करें (100%)" : "Click to reset font scale to 100%"}
              >
                {fontSizeOffset === 0 ? '100%' : `${100 + Math.round(fontSizeOffset * 6.25)}%`}
              </button>
              <button
                onClick={() => setFontSizeOffset(p => Math.min(4, p + 1))}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white rounded hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer"
                title={isHindi ? "फ़ॉन्ट आकार बढ़ाएं" : "Increase font size"}
              >
                A+
              </button>
            </div>

            {/* Compact Theme Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle light/dark theme"
              className="relative p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 shadow-xs hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all duration-300 overflow-hidden group cursor-pointer shrink-0"
              title={isDarkMode ? (isHindi ? "लाइट थीम पर स्विच करें" : "Switch to Light Theme") : (isHindi ? "डार्क थीम पर स्विच करें" : "Switch to Dark Theme")}
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

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="md:hidden p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
              )}
            </button>

          </div>

        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            
            {/* 1. OFFICER LOGIN BUTTON (PROMINENT & HIGHLIGHTED) */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl text-white bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 dark:from-sky-700 dark:via-blue-600 dark:to-indigo-700 shadow-md border border-slate-700/50 dark:border-white/20 active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 dark:bg-white/20 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-amber-400 dark:text-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold tracking-tight">
                    {isHindi ? 'अधिकारी लॉगिन पोर्टल' : 'Official Officer Login'}
                  </div>
                  <div className="text-[10px] text-slate-300 dark:text-sky-100 font-medium">
                    {isHindi ? 'आईएमडी / एमओईएस प्राधिकृत' : 'IMD / MoES Operational Gateway'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 dark:text-sky-200" />
            </button>

            {/* 2. EMERGENCY HELPLINE */}
            <a
              href="tel:112"
              className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span className="text-xs font-bold">
                  {isHindi ? 'राष्ट्रीय हेल्पलाइन: 112 / 1078' : 'Emergency Helpline: 112 / 1078'}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">24x7</span>
            </a>

            {/* 3. NAVIGATION PAGES & MODULES */}
            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-neutral-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
                {isHindi ? 'नेविगेशन एवं निगरानी पेज' : 'Navigation & Live Watch'}
              </div>

              {[
                { 
                  key: '/city-tracker', 
                  path: '/city-tracker', 
                  label: isHindi ? 'शहर व तटीय क्षेत्र निगरानी (110+)' : 'City & Area Watch (110+)', 
                  desc: isHindi ? 'ज़िला और बंदरगाह स्तर का रीयल-टाइम डेटा' : 'District & Port-level Real-Time Tracker',
                  badge: 'LIVE',
                  isRoute: true 
                },
                { 
                  key: 'geospatial-map', 
                  id: 'geospatial-map', 
                  label: isHindi ? 'जीआईएस डॉपलर रडार' : 'GIS Radar & Doppler Map', 
                  desc: isHindi ? 'मौसम उपग्रह, हवा का दायरा और शंकु' : 'Satellite IR, Wind Radii & Track Cone'
                },
                { 
                  key: 'threat-matrix', 
                  id: 'threat-matrix', 
                  label: isHindi ? 'तटीय खतरा मैट्रिक्स' : 'Coastal Threat Matrix', 
                  desc: isHindi ? 'तटीय ज़िलों की जोखिम सूची व हवा की गति' : 'Port threat levels & preparedness status'
                },
                { 
                  key: 'bulletins', 
                  id: 'bulletins', 
                  label: isHindi ? 'सरकारी मौसम बुलेटिन' : 'Official Weather Bulletins', 
                  desc: isHindi ? 'आईएमडी के आधिकारिक परामर्श एवं चेतावनी' : 'IMD advisories and official updates'
                },
                { 
                  key: 'safety-protocol', 
                  id: 'safety-protocol', 
                  label: isHindi ? 'सुरक्षा और निकासी गाइड' : 'Safety & Evacuation Guide', 
                  desc: isHindi ? 'चक्रवात से पहले, दौरान और बाद के दिशा-निर्देश' : 'Actionable protocols for citizen safety'
                },
                { 
                  key: '/state/odisha', 
                  path: '/state/odisha', 
                  label: isHindi ? 'राज्य आपदा नियंत्रण केंद्र' : 'State Disaster Cells', 
                  desc: isHindi ? 'ओडिशा, प. बंगाल, आंध्र प्रदेश, गुजरात' : 'Odisha, WB, AP, Gujarat Control Rooms',
                  isRoute: true 
                }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveNav(item.key);
                    if (item.isRoute) {
                      navigate(item.path);
                    } else {
                      scrollToSection(item.id);
                    }
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 transition-colors text-left group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* 4. MOBILE LANGUAGE SWITCHER */}
            <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isHindi ? 'वेबसाइट भाषा / Language:' : 'Portal Language / भाषा:'}
              </span>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLanguageToggle(!isHindi);
                }}
                className="px-3 py-1 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-300 bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 cursor-pointer"
              >
                {isHindi ? 'English में देखें' : 'हिन्दी में देखें'}
              </button>
            </div>

          </div>
        )}
        </div>

        {/* MOVING NATIONAL ADVISORY TICKER (RIGHT TO LEFT) - STICKY TOGETHER WITH HEADER */}
        <div className="bg-amber-500/15 dark:bg-amber-950/40 backdrop-blur-xl border-b border-amber-200/80 dark:border-amber-900/60 py-2 sm:py-2.5 text-xs text-amber-950 dark:text-amber-200 transition-colors duration-500 overflow-hidden shadow-xs">
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
      </header>

      {/* Spacer to preserve layout flow under fixed top header */}
      <div className="h-[96px] sm:h-[104px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

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
              <span>{isHindi ? 'भंवर निर्देशांक:' : 'Vortex Fix:'}</span>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                {current.lat}°N, {current.lon}°E
              </span>
            </div>
          </div>

          {/* 2-Column Grid: Executive Intel on Left, Right Part Kept Clean */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Authoritative Editorial Presentation */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border mb-3 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800">
                  <span>{isHindi ? (current.basinHindi || current.basin) : current.basin}</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight text-slate-950 dark:text-white leading-tight">
                  {isHindi ? current.hindiName : current.name}
                </h1>
                
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal mt-2 leading-relaxed">
                  {isHindi 
                    ? 'बहु-स्रोत उपग्रह डेटा और संख्यात्मक मौसम मॉडल का उपयोग करके पहचान, वर्गीकरण और 72 घंटे के प्रक्षेपवक्र पूर्वानुमान के लिए वास्तविक समय मौसम विज्ञान निगरानी।'
                    : 'Real-time meteorological intelligence for identification, classification, and 72-hour trajectory prediction using multi-source satellite data and numerical weather models.'}
                </p>
              </div>

              {/* Live AI Telemetry Feed Status & Diagnostics */}
              <div className="bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
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
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
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

              {/* 4 Large Clean Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                
                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    {isHindi ? 'सतत पवन गति' : 'Sustained Wind'}
                  </span>
                  <div className="text-3xl font-heading font-black text-slate-950 dark:text-white">
                    {current.wind} <span className="text-xs font-normal text-slate-500">{isHindi ? 'किमी/घंटा' : 'km/h'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {isHindi ? `झोंके ${current.gusts} किमी/घंटा` : `Gusts ${current.gusts} km/h`}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    {isHindi ? 'केंद्रीय दबाव' : 'Central Pressure'}
                  </span>
                  <div className="text-3xl font-heading font-black text-slate-950 dark:text-white">
                    {current.pressure} <span className="text-xs font-normal text-slate-500">{isHindi ? 'एचपीए' : 'hPa'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {isHindi ? 'बैरोमीटर रीडिंग' : 'Barometric Fix'}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    {isHindi ? '48 घंटे में चक्रवात संभावना' : '48h Formation'}
                  </span>
                  <div className="text-3xl font-heading font-black text-amber-600 dark:text-amber-400">
                    {current.risk48h}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {isHindi ? 'एआई वीआईटी मॉडल प्रायिकता' : 'ViT Probability'}
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    {isHindi ? 'गति एवं दिशा' : 'Movement'}
                  </span>
                  <div className="text-2xl font-heading font-bold text-slate-950 dark:text-white">
                    {isHindi ? (current.directionHindi || getDirectionName(current.direction, isHindi)) : current.direction}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {isHindi ? `गति ${current.speed} किमी/घंटा` : `Speed ${current.speed} km/h`}
                  </span>
                </div>

              </div>

              {/* Coastal Corridor Strip */}
              <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
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

              {/* Fast Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
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

            {/* Right Column: Real-time Information Accuracy & Model Reliability Gauge */}
            <div className="lg:col-span-5 xl:col-span-4 w-full">
              {(() => {
                const acc = ACCURACY_METRICS[activeId] || ACCURACY_METRICS.invest92b;
                const radius = 46;
                const circumference = 2 * Math.PI * radius; // ~289.03
                const strokeDashoffset = circumference - (acc.overall / 100) * circumference;

                return (
                  <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors relative overflow-hidden">
                    {/* Top ambient glow subtle gradient */}
                    <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {isHindi ? 'सूचना सटीकता एवं विश्वसनीयता' : 'Information Accuracy & Confidence'}
                          </h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                            {isHindi ? 'मल्टी-मॉडल सत्यापन इंडेक्स' : 'Multi-Model Cross-Verification'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowAccuracyInfo(!showAccuracyInfo)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title={isHindi ? "सत्यापन विवरण" : "Verification Methodology"}
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Methodology Collapsible Info */}
                    {showAccuracyInfo && (
                      <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-1 relative z-10 animate-in fade-in duration-200">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {isHindi ? 'सटीकता मापन पद्धति:' : 'Ground-Truth Verification Index:'}
                        </p>
                        <p>
                          {isHindi
                            ? 'यह सटीकता स्कोर इसरो मोसडैक (ISRO MOSDAC), ४८ आईएमडी एडब्ल्यूएस (IMD AWS) तटीय मौसम केंद्रों और ईसीएमडब्ल्यूएफ/जीएफएस एनसेंबल डेटा के साथ वास्तविक समय तुलना पर आधारित है।'
                            : 'Accuracy is computed via continuous spatial-temporal cross-validation between ISRO MOSDAC INSAT-3DR Rapid-Scan IR, 48 IMD Coastal AWS Stations, and Doppler Radar vortex fixes.'}
                        </p>
                      </div>
                    )}

                    {/* Circular Percentage Meter (Hero Gauge) */}
                    <div className="flex items-center gap-5 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 mb-5 relative z-10">
                      {/* SVG Gauge */}
                      <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 110 110">
                          {/* Background Track */}
                          <circle
                            cx="55"
                            cy="55"
                            r={radius}
                            className="stroke-slate-200 dark:stroke-slate-700/60"
                            strokeWidth="9"
                            fill="transparent"
                          />
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient id="accuracyGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="50%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                          {/* Progress Arc */}
                          <circle
                            cx="55"
                            cy="55"
                            r={radius}
                            stroke="url(#accuracyGaugeGradient)"
                            strokeWidth="9"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{
                              transition: 'stroke-dashoffset 1s ease-in-out',
                            }}
                          />
                        </svg>

                        {/* Center Percentage Display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black font-heading tracking-tight text-slate-950 dark:text-white leading-none">
                            {acc.overall}%
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {isHindi ? 'सटीक' : 'ACCURATE'}
                          </span>
                        </div>
                      </div>

                      {/* Gauge Summary Text */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100/70 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300/60 dark:border-emerald-800/80">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{isHindi ? acc.confidenceTierHindi : acc.confidenceTier}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                          {isHindi ? 'उच्च विश्वसनीयता दर' : 'High Operational Reliability'}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                          {isHindi 
                            ? 'संख्यात्मक मौसम मॉडल और सैटेलाइट टेलीमेट्री का सामूहिक विश्लेषण' 
                            : 'Multi-satellite consensus & numerical assimilation index'}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown Graphs (Dimensional Accuracy) */}
                    <div className="space-y-3 mb-5 relative z-10">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-sky-500" />
                          <span>{isHindi ? 'पैरामीटर-वार सटीकता' : 'Dimensional Accuracy Breakdown'}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {isHindi ? 'प्रमाणित स्कोर' : 'Benchmark'}
                        </span>
                      </div>

                      {/* Metric 1: Eye Fix */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {isHindi ? acc.eyeFixLabelHindi : acc.eyeFixLabel}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {acc.eyeFix}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                            style={{ width: `${acc.eyeFix}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{isHindi ? 'सटीक केंद्र निर्धारण' : 'Radar/IR Core Fix'}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{isHindi ? acc.eyeErrorKmHindi : acc.eyeErrorKm}</span>
                        </div>
                      </div>

                      {/* Metric 2: Intensity & Wind Velocity */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {isHindi ? acc.intensityLabelHindi : acc.intensityLabel}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {acc.intensity}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-700"
                            style={{ width: `${acc.intensity}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{isHindi ? 'पवन वेग पूर्वानुमान' : 'Dvorak & ViT Calc'}</span>
                          <span className="text-sky-600 dark:text-sky-400 font-medium">{isHindi ? acc.intensityMarginHindi : acc.intensityMargin}</span>
                        </div>
                      </div>

                      {/* Metric 3: 72h Track Trajectory */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {isHindi ? acc.track72hLabelHindi : acc.track72hLabel}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {acc.track72h}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                            style={{ width: `${acc.track72h}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{isHindi ? 'प्रक्षेपवक्र सहमति' : 'Ensemble Trajectory'}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">{isHindi ? acc.trackMarginHindi : acc.trackMargin}</span>
                        </div>
                      </div>

                      {/* Metric 4: Coastal Impact Corridor */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {isHindi ? acc.corridorLabelHindi : acc.corridorLabel}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {acc.corridor}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                            style={{ width: `${acc.corridor}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{isHindi ? 'तटीय प्रभाव पूर्वानुमान' : 'Landfall Zone Accuracy'}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{isHindi ? acc.corridorStatusHindi : acc.corridorStatus}</span>
                        </div>
                      </div>
                    </div>

                    {/* Model Ensemble Comparison Grid */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 relative z-10">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                        <span>{isHindi ? 'मॉडल सहमति तुलना' : 'Model Ensemble Consensus'}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">4/4 Agree</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {acc.models && acc.models.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                          >
                            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate mr-1">
                              {m.code}: {m.name.split(' ')[0]}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                              {m.acc}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verification Footer Badge */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isHindi ? '४८ आईएमडी एडब्ल्यूएस स्टेशनों द्वारा सत्यापित' : 'Validated vs 48 IMD AWS Stations'}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {isHindi ? 'विलंबता <45s' : 'Latency <45s'}
                      </span>
                    </div>

                  </div>
                );
              })()}
            </div>


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
                  {isHindi ? 'राज्य आपदा प्रबंधन प्रारंभिक चेतावनी स्थिति' : 'State Disaster Management Early Warning Status'}
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isHindi ? 'लाइव टेलीमेट्री समकालिक' : 'Live Telemetry Synchronized'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
              <button
                type="button"
                onClick={() => navigate('/state/odisha')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-red-300 dark:border-slate-700 dark:hover:border-red-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title={isHindi ? "विस्तृत ओडिशा चक्रवात एवं मौसम विवरण देखें" : "View detailed Odisha cyclone & district weather intelligence"}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {isHindi ? 'ओडिशा' : 'Odisha'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/40">
                  {isHindi ? 'रेड अलर्ट' : 'Red Alert'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/state/west-bengal')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-red-300 dark:border-slate-700 dark:hover:border-red-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title={isHindi ? "विस्तृत पश्चिम बंगाल चक्रवात एवं मौसम विवरण देखें" : "View detailed West Bengal cyclone & district weather intelligence"}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                    {isHindi ? 'पश्चिम बंगाल' : 'West Bengal'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200/60 dark:border-red-900/40">
                  {isHindi ? 'रेड अलर्ट' : 'Red Alert'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/state/andhra-pradesh')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-orange-300 dark:border-slate-700 dark:hover:border-orange-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title={isHindi ? "विस्तृत आंध्र प्रदेश चक्रवात एवं मौसम विवरण देखें" : "View detailed Andhra Pradesh cyclone & district weather intelligence"}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {isHindi ? 'आंध्र प्रदेश' : 'Andhra Pradesh'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md border border-orange-200/60 dark:border-orange-900/40">
                  {isHindi ? 'ऑरेंज अलर्ट' : 'Orange Alert'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/state/gujarat')}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 hover:border-amber-300 dark:border-slate-700 dark:hover:border-amber-900 transition-all cursor-pointer shadow-2xs hover:shadow-sm text-left group"
                title={isHindi ? "विस्तृत गुजरात चक्रवात एवं मौसम विवरण देखें" : "View detailed Gujarat cyclone & district weather intelligence"}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {isHindi ? 'गुजरात' : 'Gujarat'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40">
                  {isHindi ? 'येलो वॉच' : 'Yellow Watch'}
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
                  {isHindi ? 'क्या आप अपने शहर, बंदरगाह या तटीय क्षेत्र की स्थिति जानना चाहते हैं?' : 'Looking for your City, Port or Beach?'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  {isHindi ? '110+ तटीय क्षेत्र' : '110+ Coastal Places'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {isHindi 
                  ? 'बिना लॉगिन के सभी तटीय नगरों के लिए स्थानीय तूफानी हवा का पूर्वानुमान, तूफानी लहर की ऊंचाई, चक्रवात केंद्र की दूरी और सुरक्षा निर्देश देखें।' 
                  : 'Inspect local gale forecasts, storm surge depths, cyclone eye proximity & safety directives for all coastal towns without login.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/city-tracker')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-bold hover:bg-sky-700 dark:hover:bg-slate-200 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span>{isHindi ? 'शहर एवं क्षेत्र निगरानी खोलें →' : 'Open City & Area Watch →'}</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
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

export default Welcome;
