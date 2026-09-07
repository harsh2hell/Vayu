import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wind, AlertTriangle, Satellite, Radio, Sliders, Crosshair, 
  CloudRain, Play, Pause, Compass, MapPin, Activity, ShieldAlert,
  Search, Waves, ArrowUpRight, Info, PhoneCall,
  Ruler, Maximize2, Minimize2, Gauge, Thermometer, Droplets,
  Share2, ChevronDown, ChevronUp, Check, X, Layers, Plus, Minus
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
import './ZoomEarthControls.css';

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

const MapActionHandler = ({ action, setAction, currentCenter, defaultZoom = 6 }) => {
  const map = useMap();
  useEffect(() => {
    if (!action) return;
    if (action === 'zoomIn') {
      map.zoomIn();
    } else if (action === 'zoomOut') {
      map.zoomOut();
    } else if (action === 'recenter') {
      map.flyTo(currentCenter, defaultZoom, { duration: 0.8 });
    } else if (action === 'resetNorth') {
      map.setView(currentCenter, defaultZoom);
    }
    setAction(null);
  }, [action, setAction, currentCenter, defaultZoom, map]);
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
    categoryBadge: "LPA",
    categoryBadgeColor: "bg-emerald-500",
    categoryFull: "Low Pressure Area • Developing Genesis",
    waypoints: [
      { step: '-12h', date: '06 Sept', time: '15:30', lat: 12.8, lon: 89.2, windKmh: 35, pressureHpa: '1006', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र', type: 'LPA', typeColor: '#10b981', isPast: true, label: 'Early Circulation' },
      { step: '+00h', date: '07 Sept', time: '03:30', lat: 13.5, lon: 88.5, windKmh: 42, pressureHpa: '1004', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र', type: 'LPA', typeColor: '#10b981', isObserved: true, label: 'Vortex Fix (Observed)' },
      { step: '+12h', date: '07 Sept', time: '15:30', lat: 14.4, lon: 87.6, windKmh: 50, pressureHpa: '1000', cat: 'Depression', catHindi: 'अवसाद', type: 'D', typeColor: '#3b82f6', label: 'Consolidation Phase' },
      { step: '+24h', date: '08 Sept', time: '03:30', lat: 15.3, lon: 86.8, windKmh: 62, pressureHpa: '995', cat: 'Deep Depression', catHindi: 'गहरा अवसाद', type: 'DD', typeColor: '#06b6d4', label: 'Deepening Center' },
      { step: '+48h', date: '09 Sept', time: '03:30', lat: 16.5, lon: 85.9, windKmh: 80, pressureHpa: '988', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान', type: 'CS', typeColor: '#22c55e', label: 'Tropical Storm Stage' },
      { step: '+60h', date: '09 Sept', time: '15:30', lat: 17.8, lon: 85.1, windKmh: 95, pressureHpa: '980', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#eab308', label: 'Near Coastal Inflow' },
      { step: '+72h', date: '10 Sept', time: '03:30', lat: 19.4, lon: 84.7, windKmh: 110, pressureHpa: '972', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#f97316', label: 'Odisha-Andhra Landfall' },
      { step: '+84h', date: '10 Sept', time: '15:30', lat: 20.3, lon: 84.2, windKmh: 75, pressureHpa: '990', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान', type: 'CS', typeColor: '#22c55e', label: 'Inland Weakening' },
      { step: '+96h', date: '11 Sept', time: '03:30', lat: 21.1, lon: 83.8, windKmh: 45, pressureHpa: '1002', cat: 'Depression', catHindi: 'अवसाद', type: 'D', typeColor: '#3b82f6', label: 'Remnant Circulation' }
    ],
    track: [
      [12.8, 89.2], [13.5, 88.5], [14.4, 87.6], [15.3, 86.8], [16.5, 85.9], [17.8, 85.1], [19.4, 84.7], [20.3, 84.2], [21.1, 83.8]
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
    categoryBadge: "LPA",
    categoryBadgeColor: "bg-emerald-500",
    categoryFull: "Low Pressure Area • Arabian Sea Genesis",
    waypoints: [
      { step: '-12h', date: '06 Sept', time: '15:30', lat: 14.1, lon: 65.5, windKmh: 32, pressureHpa: '1008', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र', type: 'LPA', typeColor: '#10b981', isPast: true, label: 'Forming Circulation' },
      { step: '+00h', date: '07 Sept', time: '03:30', lat: 14.8, lon: 66.2, windKmh: 40, pressureHpa: '1005', cat: 'Low Pressure Area', catHindi: 'निम्न दबाव क्षेत्र', type: 'LPA', typeColor: '#10b981', isObserved: true, label: 'Observed Center' },
      { step: '+12h', date: '07 Sept', time: '15:30', lat: 16.2, lon: 67.0, windKmh: 48, pressureHpa: '1001', cat: 'Depression', catHindi: 'अवसाद', type: 'D', typeColor: '#3b82f6', label: 'North-East Track' },
      { step: '+24h', date: '08 Sept', time: '03:30', lat: 17.8, lon: 68.1, windKmh: 58, pressureHpa: '996', cat: 'Deep Depression', catHindi: 'गहरा अवसाद', type: 'DD', typeColor: '#06b6d4', label: 'Maritime Intensification' },
      { step: '+48h', date: '09 Sept', time: '03:30', lat: 19.5, lon: 69.0, windKmh: 75, pressureHpa: '990', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान', type: 'CS', typeColor: '#22c55e', label: 'Saurashtra Approach' },
      { step: '+72h', date: '10 Sept', time: '03:30', lat: 21.2, lon: 69.8, windKmh: 90, pressureHpa: '982', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#f97316', label: 'Kutch Coastline Outlook' }
    ],
    track: [
      [14.1, 65.5], [14.8, 66.2], [16.2, 67.0], [17.8, 68.1], [19.5, 69.0], [21.2, 69.8]
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
    categoryBadge: "SCS",
    categoryBadgeColor: "bg-orange-500",
    categoryFull: "Severe Cyclonic Storm • Landfall recorded at Dhamra",
    waypoints: [
      { step: '-12h', date: '23 Oct', time: '11:30', lat: 17.5, lon: 89.1, windKmh: 55, pressureHpa: '1000', cat: 'Deep Depression', catHindi: 'गहरा अवसाद', type: 'DD', typeColor: '#06b6d4', isPast: true, label: 'Formative Depression' },
      { step: '+00h', date: '23 Oct', time: '23:30', lat: 18.2, lon: 88.5, windKmh: 65, pressureHpa: '996', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान', type: 'CS', typeColor: '#22c55e', isObserved: true, label: 'Genesis Phase' },
      { step: '+12h', date: '24 Oct', time: '11:30', lat: 18.9, lon: 88.0, windKmh: 85, pressureHpa: '988', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#eab308', label: 'Rapid Intensification' },
      { step: '+24h', date: '24 Oct', time: '23:30', lat: 19.7, lon: 87.5, windKmh: 110, pressureHpa: '974', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#f97316', label: 'Peak Maritime Velocity' },
      { step: '+36h', date: '25 Oct', time: '05:30', lat: 20.8, lon: 86.9, windKmh: 115, pressureHpa: '970', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#ef4444', label: 'Dhamra Port Landfall' },
      { step: '+48h', date: '25 Oct', time: '17:30', lat: 22.1, lon: 85.8, windKmh: 60, pressureHpa: '992', cat: 'Depression', catHindi: 'अवसाद', type: 'D', typeColor: '#3b82f6', label: 'Inland Dissipation' },
      { step: '+60h', date: '26 Oct', time: '05:30', lat: 23.4, lon: 84.8, windKmh: 35, pressureHpa: '1004', cat: 'Well Marked Low', catHindi: 'सुस्पष्ट निम्न दबाव', type: 'LPA', typeColor: '#10b981', label: 'Remnant Low' }
    ],
    track: [
      [17.5, 89.1], [18.2, 88.5], [18.9, 88.0], [19.7, 87.5], [20.8, 86.9], [22.1, 85.8], [23.4, 84.8]
    ],
    cone: [
      [18.2, 88.5], [19.4, 89.4], [21.0, 88.8], [23.8, 87.2],
      [23.5, 83.2], [20.8, 84.8], [19.0, 86.8], [18.2, 88.5]
    ]
  },
  biparjoy: {
    id: 'biparjoy',
    name: "Extremely Severe Cyclonic Storm BIPARJOY (Historical Benchmark)",
    shortName: "Cyclone BIPARJOY",
    shortNameHindi: "चक्रवात बिपरजॉय",
    hindiName: "अति भीषण चक्रवाती तूफान बिपरजॉय (ऐतिहासिक केस अध्ययन)",
    basin: "East-Central & Northeast Arabian Sea",
    basinHindi: "पूर्वी-मध्य एवं पूर्वोत्तर अरब सागर",
    stage: "Extremely Severe Cyclonic Storm",
    stageHindi: "अति भीषण चक्रवाती तूफान",
    risk48h: "Category 3 Equivalent",
    wind: "165",
    gusts: "185",
    pressure: "958",
    speed: "10",
    direction: "North-Northeast",
    directionHindi: "उत्तर-उत्तर-पूर्व",
    lat: 20.8,
    lon: 67.1,
    target: "Jakhau Port & Kutch Coast, Gujarat",
    targetHindi: "जखाऊ बंदरगाह एवं कच्छ तट, गुजरात",
    window: "Landfall Recorded",
    windowHindi: "लैंडफॉल दर्ज किया गया",
    threat: "Extremely Severe Watch",
    threatHindi: "अति भीषण निगरानी",
    threatColor: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800",
    categoryBadge: "ESCS",
    categoryBadgeColor: "bg-purple-600",
    categoryFull: "Extremely Severe Cyclonic Storm • Category 3 Equivalent",
    waypoints: [
      { step: '-24h', date: '13 Jun', time: '05:30', lat: 18.5, lon: 67.2, windKmh: 165, pressureHpa: '958', cat: 'Extremely Severe Cyclonic Storm', catHindi: 'अति भीषण चक्रवाती तूफान', type: 'ESCS', typeColor: '#9333ea', isPast: true, label: 'Peak Intensity' },
      { step: '-12h', date: '13 Jun', time: '17:30', lat: 19.8, lon: 67.0, windKmh: 155, pressureHpa: '964', cat: 'Very Severe Cyclonic Storm', catHindi: 'बहुत भीषण चक्रवाती तूफान', type: 'VSCS', typeColor: '#f97316', isPast: true, label: 'Northward Recurvature' },
      { step: '+00h', date: '14 Jun', time: '05:30', lat: 20.8, lon: 67.1, windKmh: 145, pressureHpa: '970', cat: 'Very Severe Cyclonic Storm', catHindi: 'बहुत भीषण चक्रवाती तूफान', type: 'VSCS', typeColor: '#f97316', isObserved: true, label: 'Observed Center Fix' },
      { step: '+12h', date: '14 Jun', time: '17:30', lat: 21.9, lon: 67.6, windKmh: 135, pressureHpa: '976', cat: 'Very Severe Cyclonic Storm', catHindi: 'बहुत भीषण चक्रवाती तूफान', type: 'VSCS', typeColor: '#f97316', label: 'Saurashtra Coast Approach' },
      { step: '+24h', date: '15 Jun', time: '05:30', lat: 22.8, lon: 68.3, windKmh: 125, pressureHpa: '982', cat: 'Very Severe Cyclonic Storm', catHindi: 'बहुत भीषण चक्रवाती तूफान', type: 'VSCS', typeColor: '#f97316', label: 'Pre-Landfall Friction' },
      { step: '+36h', date: '15 Jun', time: '20:30', lat: 23.3, lon: 68.6, windKmh: 115, pressureHpa: '986', cat: 'Severe Cyclonic Storm', catHindi: 'भीषण चक्रवाती तूफान', type: 'SCS', typeColor: '#eab308', label: 'Jakhau Port Landfall' },
      { step: '+48h', date: '16 Jun', time: '08:30', lat: 24.2, lon: 69.8, windKmh: 75, pressureHpa: '994', cat: 'Cyclonic Storm', catHindi: 'चक्रवाती तूफान', type: 'CS', typeColor: '#22c55e', label: 'Inland Rajasthan Dissipation' }
    ],
    track: [
      [18.5, 67.2], [19.8, 67.0], [20.8, 67.1], [21.9, 67.6], [22.8, 68.3], [23.3, 68.6], [24.2, 69.8]
    ],
    cone: [
      [18.5, 67.2], [20.0, 68.5], [22.5, 69.8], [24.5, 71.0],
      [24.8, 68.2], [22.8, 66.8], [20.2, 65.8], [18.5, 67.2]
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

  // Zoom Earth Controls States
  const mapWrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapAction, setMapAction] = useState(null); // 'zoomIn' | 'zoomOut' | 'recenter' | 'resetNorth'
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(true);
  const [isRightTableOpen, setIsRightTableOpen] = useState(true);
  const [satSubMode, setSatSubMode] = useState('live'); // 'live' | 'hd' | 'ir'
  const [activeForecastLayer, setActiveForecastLayer] = useState('none'); // 'none' | 'precip' | 'wind' | 'temp' | 'humidity' | 'pressure'
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapWrapperRef.current?.requestFullscreen) {
        mapWrapperRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

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
             SECTION 1: ZOOM EARTH GEOSPATIAL WORKSTATION & GIS CONSOLE
             ========================================================================= */}
        <section className="space-y-4">
          
          {/* Header Bar: Title, Live Status & Quick Storm Selector */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-cyan-600 dark:text-cyan-400 animate-vortex-spin" />
                  {isHindi ? 'ज़ूम अर्थ जीआईएस मोड (VAYU 4.0)' : 'Zoom Earth Interactive Console (VAYU 4.0)'}
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" /> {isHindi ? 'डॉपलर रडार लाइव' : 'Live Doppler Feed'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-950 dark:text-white tracking-tight">
                {isHindi ? 'तटीय खतरा मानचित्र एवं ज़ूम अर्थ मौसम कंसोल' : 'Threat Map • Zoom Earth GIS & Storm Tracking Console'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isHindi 
                  ? 'ज़ूम अर्थ शैली में लाइव उपग्रह, डॉपलर रडार, पवन, वर्षा, तापमान एवं उच्च-घनत्व तूफान ट्रैक तालिका।' 
                  : 'Zoom Earth style live satellite, Doppler radar, forecast layers, high-density storm track & timeline scrubber.'}
              </p>
            </div>

            {/* Storm Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-w-full">
              {Object.keys(SYSTEMS).map((sysKey) => {
                const sys = SYSTEMS[sysKey];
                const isSelected = selectedSystemId === sysKey;
                return (
                  <button
                    key={sysKey}
                    onClick={() => {
                      setSelectedSystemId(sysKey);
                      setActiveStepIndex(0);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#ff5500] text-white shadow-md shadow-orange-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {isHindi ? (sys.shortNameHindi || sys.shortName) : sys.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Share notification toast */}
          {shareToast && (
            <div className="fixed top-20 right-6 z-[99999] bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-cyan-500/40 text-xs flex items-center gap-2 backdrop-blur-md">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{isHindi ? 'लाइव कंसोल लिंक कॉपी हो गया!' : 'Live storm console URL copied to clipboard!'}</span>
            </div>
          )}

          {/* Measuring notice */}
          {isMeasuring && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 p-2.5 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-amber-500" />
                <span><strong>Measure Tool Active:</strong> Click any two points or waypoints to estimate radial distance to cyclone eye.</span>
              </div>
              <button 
                onClick={() => setIsMeasuring(false)}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30"
              >
                Exit
              </button>
            </div>
          )}

          {/* =========================================================================
              ZOOM EARTH INTERACTIVE MAP FRAME
              ========================================================================= */}
          <div 
            ref={mapWrapperRef}
            className={`relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-2xl transition-all select-none ${
              isFullscreen ? 'fixed inset-0 z-[99999] rounded-none border-0 h-screen w-screen' : 'h-[640px] md:h-[680px]'
            }`}
          >

            {/* 1. LEFT FLOATING CONTROL DRAWER (Live Maps + Forecast Maps) */}
            <div className="absolute top-3 left-3 z-[1000] w-52 sm:w-60 pointer-events-auto">
              <div className="zoom-earth-glass rounded-2xl p-2.5 sm:p-3 text-white shadow-2xl border border-white/10">
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/40">
                      <Wind className="w-3.5 h-3.5 text-white animate-vortex-spin" />
                    </div>
                    <div>
                      <span className="font-heading font-black text-xs tracking-wider uppercase text-white block leading-none">
                        VAYU EARTH
                      </span>
                      <span className="text-[9px] text-cyan-400 font-mono tracking-tight font-semibold">
                        GIS CONSOLE 4.0
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsLeftMenuOpen(!isLeftMenuOpen)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                    title={isLeftMenuOpen ? "Minimize layer panel" : "Expand layer panel"}
                  >
                    {isLeftMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isLeftMenuOpen && (
                  <div className="space-y-2.5 text-xs max-h-[460px] overflow-y-auto zoom-earth-scrollbar pr-0.5">
                    
                    {/* LIVE MAPS */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1 px-1">
                        Live Maps
                      </span>
                      <div className="space-y-1">
                        {/* Satellite item */}
                        <div className="bg-white/5 hover:bg-white/10 rounded-xl p-2 transition">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Satellite className="w-4 h-4 text-cyan-400" />
                              <span className="font-semibold text-white">Satellite</span>
                            </div>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          </div>
                          {/* Sub-chips: Live / HD / IR */}
                          <div className="flex items-center gap-1 mt-1 pl-4">
                            {['live', 'hd', 'ir'].map((mode) => (
                              <button
                                key={mode}
                                onClick={() => {
                                  setSatSubMode(mode);
                                  if (mode === 'ir') {
                                    setShowSatelliteIR(true);
                                    setMapBaseLayer('dark');
                                  } else {
                                    setMapBaseLayer('satellite');
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                                  satSubMode === mode 
                                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-bold' 
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                              >
                                {mode === 'live' ? '✓ Live' : mode === 'hd' ? 'HD' : 'IR'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Radar item */}
                        <div className={`rounded-xl p-2 transition ${showDopplerRadar ? 'bg-white/10 border border-white/15' : 'bg-white/5 hover:bg-white/10'}`}>
                          <button
                            onClick={() => setShowDopplerRadar(!showDopplerRadar)}
                            className="w-full flex items-center justify-between text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                              <span className="font-semibold text-white">Radar</span>
                            </div>
                            {showDopplerRadar && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                          </button>

                          {showDopplerRadar && (
                            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between gap-1.5 pl-4">
                              <span className="text-[10px] text-slate-400">Opacity</span>
                              <input
                                type="range"
                                min="0.2"
                                max="1.0"
                                step="0.05"
                                value={radarOpacity}
                                onChange={(e) => setRadarOpacity(parseFloat(e.target.value))}
                                className="w-16 sm:w-20 h-1 bg-white/20 rounded accent-emerald-400 cursor-pointer"
                              />
                              <span className="text-[10px] font-mono text-emerald-300 font-bold">{Math.round(radarOpacity * 100)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* FORECAST MAPS */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1 px-1">
                        Forecast Maps
                      </span>
                      <div className="space-y-0.5">
                        {[
                          { id: 'precip', label: 'Precipitation', icon: CloudRain, unit: 'mm/h' },
                          { id: 'wind', label: 'Wind', icon: Wind, unit: 'km/h' },
                          { id: 'temp', label: 'Temperature', icon: Thermometer, unit: '°C' },
                          { id: 'humidity', label: 'Humidity', icon: Droplets, unit: '%' },
                          { id: 'pressure', label: 'Pressure', icon: Gauge, unit: 'hPa' }
                        ].map((f) => {
                          const IconComp = f.icon;
                          const isActive = activeForecastLayer === f.id;
                          return (
                            <button
                              key={f.id}
                              onClick={() => setActiveForecastLayer(isActive ? 'none' : f.id)}
                              className={`w-full flex items-center justify-between px-2 py-1 rounded-lg text-left transition cursor-pointer ${
                                isActive 
                                  ? 'bg-blue-600/30 text-blue-300 border border-blue-400/40 font-semibold' 
                                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                                <span>{f.label}</span>
                              </div>
                              {isActive && <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300 font-mono">{f.unit}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tactical Overlays */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                      <button
                        onClick={() => setShowCone(!showCone)}
                        className={`flex-1 py-1 text-[10px] font-medium rounded text-center transition cursor-pointer ${
                          showCone ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Cone
                      </button>
                      <button
                        onClick={() => setShowWindRadii(!showWindRadii)}
                        className={`flex-1 py-1 text-[10px] font-medium rounded text-center transition cursor-pointer ${
                          showWindRadii ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40' : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Radii
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* 2. RIGHT FLOATING STORM TRACK & FORECAST TABLE CARD (Zoom Earth replica) */}
            <div className="absolute top-3 right-12 sm:right-16 z-[1000] w-72 sm:w-84 max-h-[520px] flex flex-col pointer-events-auto">
              <div className="zoom-earth-glass rounded-2xl text-white shadow-2xl border border-white/10 overflow-hidden flex flex-col">
                
                {/* Storm Title Header */}
                <div className="p-3 pb-2 border-b border-white/10 flex items-center justify-between bg-black/20">
                  <div className="min-w-0 pr-2">
                    <h3 className="font-heading font-black text-sm tracking-tight text-white truncate">
                      {isHindi ? (current.hindiName || current.name) : current.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="truncate">{isHindi ? current.basinHindi : current.basin}</span>
                      <span>•</span>
                      <span className="font-mono text-cyan-300">{current.window}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsRightTableOpen(!isRightTableOpen)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer shrink-0"
                    title={isRightTableOpen ? "Minimize forecast table" : "Expand forecast table"}
                  >
                    {isRightTableOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isRightTableOpen && (
                  <>
                    {/* Forecast Table Header */}
                    <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold text-slate-400 border-b border-white/10 grid grid-cols-5 gap-1 text-center uppercase tracking-wider bg-white/5">
                      <span className="text-left col-span-1 pl-1">DATE</span>
                      <span className="col-span-1">TIME</span>
                      <span className="col-span-1">TYPE</span>
                      <span className="col-span-1">WIND</span>
                      <span className="col-span-1 text-right pr-1">PRESS</span>
                    </div>

                    {/* High-density Track Table Rows */}
                    <div className="overflow-y-auto max-h-[280px] zoom-earth-scrollbar divide-y divide-white/5 text-xs">
                      {(() => {
                        const waypoints = current.waypoints || [];
                        return waypoints.map((wp, idx) => {
                          const isActive = idx === activeStepIndex;
                          return (
                            <div
                              key={idx}
                              onClick={() => {
                                setActiveStepIndex(idx);
                                setIsPlayingTimeline(false);
                              }}
                              className={`grid grid-cols-5 gap-1 items-center px-2.5 py-1.5 cursor-pointer transition select-none ${
                                isActive 
                                  ? 'zoom-earth-row-active' 
                                  : 'hover:bg-white/10 text-slate-300'
                              }`}
                            >
                              {/* Date */}
                              <div className="col-span-1 text-left pl-1 font-medium text-[11px] truncate">
                                {wp.date || '07 Sept'}
                              </div>

                              {/* Time */}
                              <div className="col-span-1 text-center font-mono text-[11px]">
                                {wp.time || '03:30'}
                              </div>

                              {/* Type Badge */}
                              <div className="col-span-1 flex items-center justify-center">
                                <span 
                                  className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight text-white"
                                  style={{ backgroundColor: wp.typeColor || '#10b981' }}
                                >
                                  {wp.type || 'LPA'}
                                </span>
                              </div>

                              {/* Wind km/h */}
                              <div className="col-span-1 text-center font-bold font-mono text-[11px]">
                                {wp.windKmh || wp.wind.replace(' km/h', '')}
                              </div>

                              {/* Pressure hPa */}
                              <div className="col-span-1 text-right pr-1 font-mono text-[11px]">
                                {wp.pressureHpa || wp.pressure.replace(' hPa', '')}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* Bottom Summary Badge & Warnings Button */}
                    <div className="p-2.5 border-t border-white/10 bg-black/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black text-white ${current.categoryBadgeColor || 'bg-[#ff5500]'}`}>
                          {current.categoryBadge || 'SCS'}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-white block truncate">
                            {current.categoryFull || `${current.stage} • ${current.wind} km/h winds`}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {isHindi ? current.targetHindi : current.target}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const el = document.getElementById('coastal-threat-matrix');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-1.5 px-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer border border-white/10 shadow-sm"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHindi ? 'चेतावनी एवं तटीय अलर्ट विवरण' : 'Latest Warnings and Information'}</span>
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* 3. RIGHT FLOATING VERTICAL GIS TOOLBAR */}
            <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
              
              {/* Share */}
              <button
                onClick={handleShare}
                className="zoom-earth-glass rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer shadow-lg"
                title="Share storm tracking view"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Measure */}
              <button
                onClick={() => setIsMeasuring(!isMeasuring)}
                className={`zoom-earth-glass rounded-xl p-2 transition cursor-pointer shadow-lg ${
                  isMeasuring ? 'bg-amber-500/40 text-amber-300 border-amber-400' : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
                title="Measure distance to eye"
              >
                <Ruler className="w-4 h-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="zoom-earth-glass rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer shadow-lg"
                title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Recenter Vortex */}
              <button
                onClick={() => setMapAction('recenter')}
                className="zoom-earth-glass rounded-xl p-2 text-cyan-400 hover:text-cyan-200 hover:bg-white/20 transition cursor-pointer shadow-lg"
                title="Recenter storm eye"
              >
                <Crosshair className="w-4 h-4" />
              </button>

              {/* Zoom In */}
              <button
                onClick={() => setMapAction('zoomIn')}
                className="zoom-earth-glass rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer shadow-lg"
                title="Zoom In"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Zoom Out */}
              <button
                onClick={() => setMapAction('zoomOut')}
                className="zoom-earth-glass rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer shadow-lg"
                title="Zoom Out"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Reset Bearing / North */}
              <button
                onClick={() => setMapAction('resetNorth')}
                className="zoom-earth-glass rounded-xl p-2 text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer shadow-lg"
                title="Reset North Orientation"
              >
                <Compass className="w-4 h-4" />
              </button>

            </div>

            {/* 4. ACTIVE FORECAST SCALE LEGEND (If forecast layer active) */}
            {activeForecastLayer !== 'none' && (
              <div className="absolute bottom-16 left-4 z-[1000] zoom-earth-glass rounded-xl p-2.5 text-[10px] text-white shadow-xl pointer-events-auto max-w-[220px]">
                <div className="flex items-center justify-between mb-1 font-semibold uppercase tracking-wider text-slate-300">
                  <span>
                    {activeForecastLayer === 'precip' && 'Precipitation (mm/h)'}
                    {activeForecastLayer === 'wind' && 'Wind Speed (km/h)'}
                    {activeForecastLayer === 'temp' && 'Sea Surface Temp (°C)'}
                    {activeForecastLayer === 'humidity' && 'Relative Humidity (%)'}
                    {activeForecastLayer === 'pressure' && 'Atmospheric Pressure (hPa)'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-yellow-400 via-orange-500 to-red-600 border border-white/20" />
                <div className="flex justify-between text-slate-400 font-mono mt-1">
                  {activeForecastLayer === 'precip' && <><span>0.5</span><span>10</span><span>35</span><span>75+</span></>}
                  {activeForecastLayer === 'wind' && <><span>20</span><span>65</span><span>120</span><span>200+</span></>}
                  {activeForecastLayer === 'temp' && <><span>24°</span><span>27°</span><span>29°</span><span>32°C</span></>}
                  {activeForecastLayer === 'humidity' && <><span>40%</span><span>60%</span><span>80%</span><span>100%</span></>}
                  {activeForecastLayer === 'pressure' && <><span>940</span><span>970</span><span>995</span><span>1015</span></>}
                </div>
              </div>
            )}

            {/* 5. BOTTOM CENTERED TIMELINE PLAYBACK BAR (Zoom Earth replica) */}
            {(() => {
              const waypoints = current.waypoints || [];
              const activeWp = waypoints[activeStepIndex] || waypoints[0] || {
                date: '07 Sept', time: '03:30', step: '+00h'
              };

              return (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] pointer-events-auto flex flex-col items-center gap-1.5">
                  <div className="zoom-earth-glass px-4 py-2 rounded-2xl text-white shadow-2xl border border-white/10 flex items-center gap-3">
                    
                    {/* Play / Pause */}
                    <button
                      onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                        isPlayingTimeline 
                          ? 'bg-[#ff5500] text-white shadow-lg shadow-orange-500/40 animate-pulse' 
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                      title={isPlayingTimeline ? "Pause playback" : "Play 72h forecast track"}
                    >
                      {isPlayingTimeline ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    {/* Step Back */}
                    <button
                      onClick={() => {
                        setActiveStepIndex(prev => (prev > 0 ? prev - 1 : waypoints.length - 1));
                        setIsPlayingTimeline(false);
                      }}
                      className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Previous forecast step"
                    >
                      ◀
                    </button>

                    {/* Current Timestamp Display */}
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-black/40 rounded-xl border border-white/10">
                      <span className="font-bold text-xs text-white whitespace-nowrap">
                        {activeWp.date || '07 Sept'}
                      </span>
                      <span className="font-mono text-sm font-black text-cyan-300 tracking-wider">
                        {activeWp.time || '03:30'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono font-semibold">
                        {activeWp.step}
                      </span>
                    </div>

                    {/* Step Forward */}
                    <button
                      onClick={() => {
                        setActiveStepIndex(prev => (prev < waypoints.length - 1 ? prev + 1 : 0));
                        setIsPlayingTimeline(false);
                      }}
                      className="p-1 text-slate-300 hover:text-white transition cursor-pointer"
                      title="Next forecast step"
                    >
                      ▶
                    </button>

                  </div>

                  {/* Scrubber dots */}
                  <div className="flex items-center gap-1.5 px-3 py-1 zoom-earth-glass rounded-full text-[9px]">
                    {waypoints.map((wp, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveStepIndex(i);
                          setIsPlayingTimeline(false);
                        }}
                        className={`w-2 h-2 rounded-full transition cursor-pointer ${
                          i === activeStepIndex 
                            ? 'bg-[#ff5500] scale-125 ring-2 ring-orange-400/50' 
                            : 'bg-white/30 hover:bg-white/60'
                        }`}
                        title={`${wp.date} ${wp.time} (${wp.step})`}
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* 6. LEAFLET MAP CONTAINER */}
            {(() => {
              const waypoints = current.waypoints || [];
              const activeWp = waypoints[activeStepIndex] || waypoints[0] || { lat: current.lat, lon: current.lon };
              const activeTile = BASE_LAYERS[mapBaseLayer] || BASE_LAYERS.satellite;

              return (
                <MapContainer
                  center={[activeWp.lat, activeWp.lon]}
                  zoom={6}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <MapController center={[activeWp.lat, activeWp.lon]} zoom={6} />
                  <MapActionHandler 
                    action={mapAction} 
                    setAction={setMapAction} 
                    currentCenter={[activeWp.lat, activeWp.lon]} 
                    defaultZoom={6} 
                  />

                  {/* Base Satellite / GIS TileLayer */}
                  <TileLayer
                    url={activeTile.url}
                    attribution={activeTile.attribution}
                  />

                  {/* Satellite IR Overlay */}
                  {showSatelliteIR && (
                    <TileLayer
                      url="https://tilecache.rainviewer.com/v2/satellite/latest/256/{z}/{x}/{y}/0/0_0.png"
                      opacity={satSubMode === 'ir' ? 0.75 : 0.55}
                      zIndex={150}
                    />
                  )}

                  {/* Doppler Weather Radar Overlay */}
                  {showDopplerRadar && (
                    <TileLayer
                      url="https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png"
                      opacity={radarOpacity}
                      zIndex={200}
                    />
                  )}

                  {/* Forecast Simulation Layer (when selected) */}
                  {activeForecastLayer === 'precip' && (
                    <TileLayer
                      url="https://tilecache.rainviewer.com/v2/radar/latest/256/{z}/{x}/{y}/2/1_1.png"
                      opacity={0.8}
                      zIndex={210}
                    />
                  )}

                  {/* Forecast Cone */}
                  {showCone && current.cone && (
                    <Polygon
                      positions={current.cone}
                      pathOptions={{
                        fillColor: '#F59E0B',
                        fillOpacity: 0.2,
                        color: '#D97706',
                        weight: 2,
                        dashArray: '5, 5'
                      }}
                    />
                  )}

                  {/* Wind Radii (35kt, 50kt, 64kt) */}
                  {showWindRadii && (
                    <>
                      <Circle
                        center={[activeWp.lat, activeWp.lon]}
                        radius={130000}
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
                        radius={75000}
                        pathOptions={{
                          color: '#EA580C',
                          fillColor: '#F97316',
                          fillOpacity: 0.12,
                          weight: 1.5
                        }}
                      />
                      <Circle
                        center={[activeWp.lat, activeWp.lon]}
                        radius={40000}
                        pathOptions={{
                          color: '#DC2626',
                          fillColor: '#EF4444',
                          fillOpacity: 0.22,
                          weight: 2
                        }}
                      />
                    </>
                  )}

                  {/* Track Polyline */}
                  {current.track && (
                    <Polyline
                      positions={current.track}
                      pathOptions={{
                        color: '#0284C7',
                        weight: 3.5,
                        dashArray: '4, 6'
                      }}
                    />
                  )}

                  {/* Inactive Track Waypoints */}
                  {waypoints.map((wp, i) => {
                    const isSelected = i === activeStepIndex;
                    if (isSelected) return null;
                    return (
                      <CircleMarker
                        key={i}
                        center={[wp.lat, wp.lon]}
                        radius={wp.isObserved ? 6.5 : 4.5}
                        pathOptions={{
                          fillColor: wp.typeColor || '#0284C7',
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
                              {isHindi && wp.labelHindi ? wp.labelHindi : (wp.label || wp.cat)}
                            </strong>
                            <div className="text-slate-600">
                              {isHindi ? 'समय: ' : 'Time: '}
                              <strong>{wp.date} {wp.time} ({wp.step})</strong>
                            </div>
                            <div className="text-slate-600">
                              {isHindi ? 'स्थिति: ' : 'Position: '}
                              <strong>{wp.lat}°N, {wp.lon}°E</strong>
                            </div>
                            <div className="text-slate-600">
                              {isHindi ? 'पवन: ' : 'Wind: '}
                              <strong>{wp.windKmh || wp.wind} km/h</strong>
                            </div>
                            <div className="text-slate-600">
                              {isHindi ? 'दबाव: ' : 'Pressure: '}
                              <strong>{wp.pressureHpa || wp.pressure} hPa</strong>
                            </div>
                            <div className="text-slate-600">
                              {isHindi ? 'श्रेणी: ' : 'Category: '}
                              <strong className="text-amber-700">
                                {wp.type} ({isHindi && wp.catHindi ? wp.catHindi : wp.cat})
                              </strong>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {/* Active Vortex Center Marker */}
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
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <strong className="text-slate-900 block font-heading">
                            {isHindi && activeWp.labelHindi ? activeWp.labelHindi : (activeWp.label || activeWp.cat)}
                          </strong>
                        </div>
                        <div className="text-slate-600 pt-1">
                          {isHindi ? 'समय: ' : 'Time: '}
                          <strong className="text-red-600 font-bold">{activeWp.date} {activeWp.time} ({activeWp.step})</strong>
                        </div>
                        <div className="text-slate-600">
                          {isHindi ? 'स्थिति: ' : 'Position: '}
                          <strong>{activeWp.lat}°N, {activeWp.lon}°E</strong>
                        </div>
                        <div className="text-slate-600">
                          {isHindi ? 'पवन: ' : 'Wind: '}
                          <strong>{activeWp.windKmh || activeWp.wind} km/h</strong>
                        </div>
                        <div className="text-slate-600">
                          {isHindi ? 'दबाव: ' : 'Pressure: '}
                          <strong>{activeWp.pressureHpa || activeWp.pressure} hPa</strong>
                        </div>
                        <div className="text-slate-600">
                          {isHindi ? 'श्रेणी: ' : 'Stage: '}
                          <strong className="text-amber-700">
                            {activeWp.type} ({isHindi && activeWp.catHindi ? activeWp.catHindi : activeWp.cat})
                          </strong>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                </MapContainer>
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
