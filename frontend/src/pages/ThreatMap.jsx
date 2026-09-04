import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wind, AlertTriangle, Satellite, Radio, Sliders, Crosshair, 
  CloudRain, Play, Pause, Compass, MapPin, Activity, ShieldAlert,
  Search, Waves, ArrowUpRight, Info, PhoneCall
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

const ThreatMap = () => {
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

  // System & GIS Map States
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

  // Threat Matrix Filter States
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* =========================================================================
             SECTION 1: GEOSPATIAL RADAR & SYSTEM CONTROLS
             ========================================================================= */}
        <section className="space-y-4">
          
          {/* Page Title & System Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  {isHindi ? 'एकीकृत खतरा मानचित्र (GIS 4.0)' : 'Unified Threat Map (GIS 4.0)'}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> {isHindi ? 'डॉपलर रडार लाइव' : 'DWR Doppler Live'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
                {isHindi ? 'तटीय खतरा मानचित्र एवं लाइव जीआईएस रडार' : 'Threat Map • Coastal Risk & Live GIS Radar'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isHindi 
                  ? 'डॉपलर मौसम रडार, उपग्रह इंफ्रारेड, पूर्वानुमान शंकु और 9 तटीय जिलों की आपदा रेटिंग का संपूर्ण एकीकरण।' 
                  : 'Integrated Doppler radar surveillance, satellite cloud infrared, storm track cone, and multi-hazard district threat ratings.'}
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

          {/* GIS Command Bar */}
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

            {/* Top-Right Doppler dBZ Reflectivity Scale */}
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

                  <TileLayer
                    url={activeTile.url}
                    attribution={activeTile.attribution}
                  />

                  {showSatelliteIR && (
                    <TileLayer
                      url="https://tilecache.rainviewer.com/v2/satellite/latest/256/{z}/{x}/{y}/0/0_0.png"
                      opacity={0.6}
                      zIndex={150}
                    />
                  )}

                  {showDopplerRadar && (
                    <TileLayer
                      url="https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png"
                      opacity={radarOpacity}
                      zIndex={200}
                    />
                  )}

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

                  {showWindRadii && (
                    <>
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

                  {/* Active Vortex Center Marker (Red Point with White Border - Blinks during timelapse) */}
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

            {/* Bottom Scrubber Bar */}
            {(() => {
              const waypoints = current.waypoints || [];
              return (
                <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
                  
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

                  <button
                    onClick={() => setActiveStepIndex(0)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-sky-500" />
                    <span>{isHindi ? 'प्रारंभिक केंद्र' : 'Eye Origin'}</span>
                  </button>

                </div>
              );
            })()}

          </div>

        </section>

        {/* =========================================================================
             SECTION 2: SUMMARY COUNTER STATS
             ========================================================================= */}
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

        {/* =========================================================================
             SECTION 3: DISTRICT-WISE COASTAL THREAT MATRIX
             ========================================================================= */}
        <section className="space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <span>
                  {isHindi ? 'जिलावार तटीय आपदा प्रारंभिक चेतावनी' : 'District-Level Coastal Threat Multi-Hazard Status'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-950 dark:text-white tracking-tight">
                {isHindi ? 'तटीय जिला आपदा मैट्रिक्स' : 'Coastal District Threat Matrix'}
              </h2>
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

        </section>

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

export default ThreatMap;
