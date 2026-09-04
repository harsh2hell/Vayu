import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardUrl } from '../utils/domain';
import PublicNavbar from '../components/PublicNavbar';
import { 
  Wind, Shield, AlertTriangle, ArrowRight, ExternalLink,
  Satellite, Compass, PhoneCall, FileText, CheckCircle2,
  XCircle, ChevronRight, Clock, MapPin, Eye, Radio,
  Activity, Info, Layers, RefreshCw, Sun, Moon, Sparkles,
  ArrowUpRight, BarChart2, ShieldAlert, Play, Pause, Sliders, Crosshair, CloudRain, Maximize2,
  Search, Waves, Bell, Navigation2, Menu, X
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
      className="min-h-screen bg-[#fafbfc] dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col transition-colors duration-500 overflow-x-hidden w-full max-w-full"
    >
      
      {/* TOP APEX BAR (MINIMAL, ELEGANT, EXECUTIVE - ALWAYS AT TOP) */}
      <PublicNavbar
        isHindi={isHindi}
        setIsHindi={setIsHindi}
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
            <div className="lg:col-span-8 space-y-6">
              
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
                  onClick={() => scrollToSection('geospatial-map')}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isHindi ? 'जीआईएस रडार मैप देखें' : 'Inspect GIS Radar Map'}</span>
                </button>

                <button
                  onClick={() => scrollToSection('threat-matrix')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>{isHindi ? 'तटीय जिला आपदा मैट्रिक्स' : 'View District Threat Matrix'}</span>
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
                  {isHindi ? 'भू-स्थानिक रडार एवं लाइव चक्रवात निगरानी' : 'Geospatial Radar & Live Cyclone Surveillance'}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
                  {isHindi ? 'लाइव जीआईएस 4.0' : 'Live GIS 4.0'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isHindi 
                  ? 'एकीकृत डॉपलर मौसम रडार परावर्तन, बहु-एजेंसी सर्वसम्मत प्रक्षेपवक्र और गतिशील पवन क्षेत्र त्रिज्या।' 
                  : 'Integrated Doppler weather radar reflectivity, multi-agency consensus track, and dynamic wind swath radii.'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{isHindi ? 'WGS84 डेटम' : 'WGS84 Datum'}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" /> {isHindi ? 'डॉपलर रडार फ़ीड ऑनलाइन' : 'Doppler Radar Feed Online'}
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
                    {isHindi && layer.nameHindi ? layer.nameHindi : layer.name}
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
                <span>{isHindi ? 'डॉपलर रडार' : 'Doppler Radar'}</span>
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
                <span>{isHindi ? 'उपग्रह इंफ्रारेड' : 'Satellite IR'}</span>
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
                <span>{isHindi ? 'पूर्वानुमान शंकु' : 'Forecast Cone'}</span>
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
                <span>{isHindi ? 'पवन दायरा' : 'Wind Radii'}</span>
              </button>
            </div>

            {/* Right: Radar Opacity Slider */}
            {showDopplerRadar && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isHindi ? 'रडार पारदर्शिता' : 'Radar Opacity'}
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
                        {isHindi ? (activeWp.catHindi || getCategoryName(activeWp.cat, isHindi)) : activeWp.cat}
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
                                {isHindi ? (wp.catHindi || getCategoryName(wp.cat, isHindi)) : wp.cat}
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
                            {isHindi ? (activeWp.catHindi || getCategoryName(activeWp.cat, isHindi)) : activeWp.cat}
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
                      const waypoints = current.waypoints || [];
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

        </div>
      </section>

      {/* =========================================================================
           IMPROVED DISTRICT-WISE COASTAL THREAT MATRIX
           ========================================================================= */}
      <section id="threat-matrix" className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header & Public Notice */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <span>
                  {isHindi ? 'सार्वजनिक प्रारंभिक चेतावनी मैट्रिक्स • निशुल्क एवं खुला डेटा' : 'Public Early Warning Threat Matrix • Free & Open Data'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
                {isHindi ? 'जिलावार तटीय आपदा चेतावनी मैट्रिक्स' : 'District-Wise Coastal Threat Matrix'}
              </h2>
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
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-2xs"
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
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-2xs">
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
                (d.districtHindi && d.districtHindi.toLowerCase().includes(q)) ||
                d.state.toLowerCase().includes(q) ||
                (d.stateHindi && d.stateHindi.toLowerCase().includes(q)) ||
                (d.stations && d.stations.some(s => s.toLowerCase().includes(q))) ||
                (d.stationsHindi && d.stationsHindi.some(s => s.toLowerCase().includes(q)))
              );
            }

            if (list.length === 0) {
              return (
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
              );
            }

            return (
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
                    {list.map((row, idx) => (
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
            );
          })()}

          {/* Public Guidance Tip */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-500 shrink-0" />
              <span>
                {isHindi 
                  ? 'स्थानीय आश्रय स्थलों, वर्षा रडार और 24/7 आपदा नियंत्रण कक्ष नंबरों के साथ समर्पित राज्य मौसम पृष्ठ खोलने के लिए किसी भी जिले की पंक्ति पर क्लिक करें।' 
                  : 'Click on any district row to open its dedicated state weather page with local shelter locations, rainfall radars, and 24/7 disaster control room phone numbers.'}
              </span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0 hidden sm:inline">
              {isHindi ? '100% निःशुल्क एवं खुला पोर्टल' : '100% Free & Open Access'}
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
           OFFICIAL BULLETINS & MARITIME WARNINGS
           ========================================================================= */}
      <section id="bulletins" className="py-12 px-4 sm:px-6 lg:px-8 bg-[#fafbfc] dark:bg-black border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-2xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">
                  {isHindi ? 'आधिकारिक आईएमडी मौसम विज्ञान बुलेटिन' : 'Official IMD Meteorological Bulletins'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isHindi ? 'राष्ट्रीय चक्रवात चेतावनी केंद्र, नई दिल्ली द्वारा जारी।' : 'Issued by National Cyclone Warning Centre, New Delhi.'}
                </p>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'बुलेटिन संख्या 14' : 'BULLETIN NO. 14'}
                  </span>
                  <span>•</span>
                  <span>
                    {isHindi ? 'आज जारी, 00:00 भारतीय मानक समय' : 'Issued Today, 00:00 IST'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isHindi 
                    ? 'उत्तरी बंगाल की खाड़ी पर गंभीर चक्रवाती तूफान दाना (ओडिशा और पश्चिम बंगाल)' 
                    : 'Severe Cyclonic Storm DANA over North Bay of Bengal (Odisha & West Bengal)'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isHindi 
                    ? 'सिस्टम 100-110 किमी/घंटा की निरंतर हवाओं और 120 किमी/घंटा के झोंकों के साथ धामरा बंदरगाह के पास उत्तरी ओडिशा तट को पार कर गया है। बालेश्वर और भद्रक जिलों में लैंडफॉल के बाद राहत प्रोटोकॉल पूरी तरह लागू हैं।' 
                    : 'System crossed north Odisha coast near Dhamra Port with sustained winds of 100-110 kmph gusting to 120 kmph. Complete post-landfall de-escalation protocols in effect across Balasore and Bhadrak districts.'}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => alert(isHindi ? 'आधिकारिक आईएमडी बुलेटिन परामर्श पीडीएफ डाउनलोड हो रहा है...' : 'Downloading official IMD bulletin advisory PDF...')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>{isHindi ? 'आधिकारिक सलाह डाउनलोड करें (PDF)' : 'Download Official Advisory (PDF)'}</span>
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/90 p-6 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {isHindi ? 'उत्पत्ति सलाह संख्या 03' : 'GENESIS ADVISORY NO. 03'}
                  </span>
                  <span>•</span>
                  <span>
                    {isHindi ? 'कल जारी, 18:00 भारतीय मानक समय' : 'Issued Yesterday, 18:00 IST'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isHindi 
                    ? 'दक्षिण-मध्य बंगाल की खाड़ी में उभरता हुआ कम दबाव का क्षेत्र (इन्वेस्ट 92B)' 
                    : 'Incipient Low Pressure Area Invest 92B in South-Central Bay of Bengal'}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isHindi 
                    ? 'गहरे वायुमंडलीय संवहन और अनुकूल समुद्री सतह तापमान (30.5°C) अगले 48 घंटों में स्थिर चक्रवाती तीव्रता का समर्थन करते हैं। समुद्री नौकाओं को अत्यधिक सावधानी बरतने की सलाह दी जाती है।' 
                    : 'Deep atmospheric convection and favorable sea surface temperatures (30.5°C) support steady vortex intensification over the next 48 hours. Marine craft advised to exercise extreme caution.'}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => alert(isHindi ? 'आधिकारिक आईएमडी बुलेटिन परामर्श पीडीएफ डाउनलोड हो रहा है...' : 'Downloading official IMD bulletin advisory PDF...')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-black dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>{isHindi ? 'उत्पत्ति सलाह डाउनलोड करें (PDF)' : 'Download Genesis Advisory (PDF)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Maritime Warning Box */}
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

          </div>
        </div>
      </section>

      {/* =========================================================================
           DISASTER SAFETY PROTOCOL (NDMA CITIZEN GUIDELINES)
           ========================================================================= */}
      <section id="safety-protocol" className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">
                {isHindi ? 'आपदा सुरक्षा प्रोटोकॉल: क्या करें और क्या न करें' : "Disaster Safety Protocol: Do's & Don'ts"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? 'गंभीर चक्रवात आपात स्थिति के दौरान आधिकारिक एनडीएमए नागरिक दिशानिर्देश।' : 'Official NDMA citizen guidelines during severe cyclone emergencies.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setSafetyTab('before')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  safetyTab === 'before' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isHindi ? 'लैंडफॉल से पहले' : 'Before Landfall'}
              </button>
              <button
                onClick={() => setSafetyTab('during')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  safetyTab === 'during' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isHindi ? 'लैंडफॉल के दौरान' : 'During Landfall'}
              </button>
              <button
                onClick={() => setSafetyTab('after')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  safetyTab === 'after' ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isHindi ? 'तूफान गुजरने के बाद' : 'After Storm Passes'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Essential Actions */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'आवश्यक कदम (क्या करें)' : "Essential Actions (Do's)"}</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {safetyTab === 'before' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'बैटरी रेडियो, टॉर्च, सूखा राशन और पीने के पानी के साथ आपातकालीन किट तैयार रखें।' : 'Keep emergency kit ready with battery radio, torch, dry rations, and drinking water.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'दरवाजे और खिड़कियां सुरक्षित करें; ढीली टाइलें या टिन की छतें हटा दें।' : 'Secure doors and windows; remove loose tiles or tin roofs.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'मोबाइल फोन और पावर बैंक पूरी तरह चार्ज रखें।' : 'Keep mobile phones and power banks fully charged.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'प्रशासन द्वारा निर्देश दिए जाने पर तुरंत नामित चक्रवात आश्रय स्थलों में जाएं।' : 'Move to designated cyclone shelters when instructed by authorities.'}</span>
                    </li>
                  </>
                )}
                {safetyTab === 'during' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'बिजली के मुख्य स्विच बंद करें और रसोई गैस सिलेंडर बंद रखें।' : 'Switch off electrical mains and turn off LPG gas cylinders.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'खिड़कियों से दूर अपने घर या आश्रय के सबसे मजबूत केंद्रीय कमरे में रहें।' : 'Stay in the strongest central room of your house or shelter away from windows.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'ताज़ा अपडेट के लिए स्थानीय रेडियो और आधिकारिक अलर्ट सुनते रहें।' : 'Keep listening to local radio and official alerts for updates.'}</span>
                    </li>
                  </>
                )}
                {safetyTab === 'after' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'जब तक आधिकारिक रूप से मौसम साफ होने की घोषणा न हो, आश्रय स्थल में ही रहें।' : "Remain in the cyclone shelter until official 'All Clear' declaration is given."}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'पीने का पानी उबालकर पिएं या पानी शुद्ध करने वाली गोलियों का उपयोग करें।' : 'Boil drinking water or use water purification tablets before consumption.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{isHindi ? 'टूटी बिजली लाइनों और दूषित पानी की सूचना जिला हेल्पलाइन नंबरों पर दें।' : 'Report broken power lines and water contamination to district helpline numbers.'}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Avoid Hazards */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900/90 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>{isHindi ? 'इन खतरों से बचें (क्या न करें)' : "Avoid These Hazards (Don'ts)"}</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {safetyTab === 'before' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{isHindi ? 'रेडियो, टीवी या वायु पोर्टल पर प्रसारित आधिकारिक चेतावनियों को नजरअंदाज न करें।' : 'Do not ignore official warnings broadcasted on radio, TV, or VAYU portal.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{isHindi ? 'सोशल मीडिया पर असत्यापित अफवाहों पर विश्वास न करें और न ही फैलाएं।' : 'Do not believe or spread unverified rumors on social media.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{isHindi ? 'ऊंची लहरों को देखने या फोटो खींचने के लिए समुद्र तटों या नदी किनारों पर न जाएं।' : 'Do not go near beaches or riverbanks to watch or photograph high waves.'}</span>
                    </li>
                  </>
                )}
                {safetyTab === 'during' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>
                        <strong>{isHindi ? 'अति महत्वपूर्ण:' : 'CRITICAL:'}</strong>{' '}
                        {isHindi 
                          ? 'जब अचानक हवा रुक जाए तो बाहर न निकलें - यह चक्रवात की शांत आंख (Eye) हो सकती है; इसके तुरंत बाद विपरीत दिशा से भयानक हवाएं शुरू हो जाती हैं।' 
                          : 'Do NOT go outside when winds suddenly stop — this is the calm \'Eye\'; violent winds resume quickly from the reverse direction.'}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{isHindi ? 'तेज आकाशीय बिजली और मूसलाधार बारिश के दौरान बिजली के उपकरण न चलाएं।' : 'Do not operate electrical appliances during severe lightning and rainfall.'}</span>
                    </li>
                  </>
                )}
                {safetyTab === 'after' && (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{isHindi ? 'जमीन पर गिरे बिजली के तारों, ढीले तारों या पानी में डूबे धातु के ढांचों को न छुएं।' : 'Do not touch fallen electrical cables, loose wires, or metal structures in water.'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{isHindi ? 'क्षतिग्रस्त या पानी से भरे भवनों में प्रवेश न करें।' : 'Do not enter structurally damaged or waterlogged buildings.'}</span>
                    </li>
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
