import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown,
  Bug, UserPlus, Radio, Edit3, Trash2, ShieldCheck,
  ChevronDown, Check, ArrowRight, ShieldAlert, Sparkles, MapPin,
  Activity, Server, Database, Wind, Compass, AlertCircle, RefreshCw,
  Layers, Crosshair, Waves
} from 'lucide-react';
import { toPortalPath } from '../utils/domain';
import { useAnalysisSession, DEFAULT_PRESETS } from '../context/AnalysisSessionContext';
import { checkBackendHealth } from '../services/api';

// Datasets for line chart metric tabs (Climatological Baselines)
const METRIC_DATASETS = {
  wind: [
    { month: 'Jan', currentYear: 10, lastYear: 5 },
    { month: 'Feb', currentYear: 5, lastYear: 12 },
    { month: 'Mar', currentYear: 12, lastYear: 11 },
    { month: 'Apr', currentYear: 23, lastYear: 10 },
    { month: 'May', currentYear: 26, lastYear: 18 },
    { month: 'Jun', currentYear: 16, lastYear: 23 },
    { month: 'Jul', currentYear: 22, lastYear: 25 },
  ],
  pressure: [
    { month: 'Jan', currentYear: 1008, lastYear: 1012 },
    { month: 'Feb', currentYear: 1004, lastYear: 1009 },
    { month: 'Mar', currentYear: 998, lastYear: 1005 },
    { month: 'Apr', currentYear: 988, lastYear: 996 },
    { month: 'May', currentYear: 982, lastYear: 990 },
    { month: 'Jun', currentYear: 992, lastYear: 988 },
    { month: 'Jul', currentYear: 986, lastYear: 994 },
  ],
  rainfall: [
    { month: 'Jan', currentYear: 15, lastYear: 10 },
    { month: 'Feb', currentYear: 25, lastYear: 18 },
    { month: 'Mar', currentYear: 45, lastYear: 32 },
    { month: 'Apr', currentYear: 120, lastYear: 85 },
    { month: 'May', currentYear: 240, lastYear: 190 },
    { month: 'Jun', currentYear: 180, lastYear: 210 },
    { month: 'Jul', currentYear: 290, lastYear: 245 },
  ],
};

const KPI_CONFIGS = {
  Today: {
    cyclones: '7',
    cyclonesTrend: '+11.01%',
    regions: '3,671',
    regionsTrend: '-0.03%',
    alerts: '156',
    alertsTrend: '+15.03%',
    dataPoints: '2,318',
    dataPointsTrend: '+6.08%',
  },
  'This Week': {
    cyclones: '12',
    cyclonesTrend: '+18.4%',
    regions: '8,920',
    regionsTrend: '+4.20%',
    alerts: '412',
    alertsTrend: '+22.5%',
    dataPoints: '9,840',
    dataPointsTrend: '+12.1%',
  },
  'This Month': {
    cyclones: '28',
    cyclonesTrend: '+5.7%',
    regions: '18,450',
    regionsTrend: '+1.15%',
    alerts: '1,240',
    alertsTrend: '+8.3%',
    dataPoints: '34,100',
    dataPointsTrend: '+14.9%',
  },
  'Season 2026': {
    cyclones: '45',
    cyclonesTrend: '+14.2%',
    regions: '42,100',
    regionsTrend: '+7.80%',
    alerts: '3,890',
    alertsTrend: '+19.6%',
    dataPoints: '112,400',
    dataPointsTrend: '+28.4%',
  },
};

const warningsRegionData = [
  { name: 'OD', val: 18, fill: '#93C5FD' },
  { name: 'WB', val: 28, fill: '#6EE7B7' },
  { name: 'AP', val: 22, fill: '#0F172A' },
  { name: 'GJ', val: 32, fill: '#93C5FD' },
  { name: 'MH', val: 13, fill: '#C4B5FD' },
  { name: 'TN', val: 26, fill: '#6EE7B7' },
];

const severityData = [
  { name: 'Severe', value: 52.1, color: '#60A5FA' },
  { name: 'Very Severe', value: 22.8, color: '#34D399' },
  { name: 'Super', value: 13.9, color: '#C084FC' },
  { name: 'Depression', value: 11.2, color: '#475569' },
];

const topRegions = [
  { name: 'Odisha Coast', val: '28%', risk: 'High' },
  { name: 'West Bengal', val: '22%', risk: 'High' },
  { name: 'Andhra Pradesh', val: '18%', risk: 'Moderate' },
  { name: 'Gujarat', val: '12%', risk: 'Watch' },
  { name: 'Maharashtra', val: '10%', risk: 'Watch' },
  { name: 'Tamil Nadu', val: '10%', risk: 'Watch' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const session = useAnalysisSession();
  const { 
    currentInput, 
    detectionResult, 
    classificationResult, 
    trajectoryResult, 
    landfallPrediction,
    setStormPreset,
    setActiveStormPreset
  } = session;

  // System Health state (lightweight single-shot check, no polling)
  const [backendHealth, setBackendHealth] = useState({ status: 'CHECKING' });

  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((res) => {
      if (isMounted) setBackendHealth(res || { status: 'OFFLINE' });
    }).catch(() => {
      if (isMounted) setBackendHealth({ status: 'OFFLINE' });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Preset switching handler (uses canonical setStormPreset)
  const handleSelectPreset = (presetId) => {
    if (setStormPreset) {
      setStormPreset(presetId);
    } else if (setActiveStormPreset) {
      setActiveStormPreset(presetId);
    }
  };

  // Interactive UI state
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState('wind');
  const [activeOfficerModal, setActiveOfficerModal] = useState(null);

  const kpis = KPI_CONFIGS[selectedTimeRange] || KPI_CONFIGS.Today;
  const currentChartData = METRIC_DATASETS[activeMetricTab] || METRIC_DATASETS.wind;

  // Active Storm Derived Values
  const activeStormName = currentInput?.name || 'No Active Storm';
  const activeBasin = currentInput?.basin || 'North Indian Ocean';
  const activeDate = currentInput?.observation_date || currentInput?.date || null;

  // Center Coordinates Fix
  const centerFormatted = detectionResult?.center_coordinates?.formatted
    || (detectionResult?.latitude && detectionResult?.longitude 
        ? `${Math.abs(detectionResult.latitude)}°N, ${Math.abs(detectionResult.longitude)}°E` 
        : (currentInput?.ground_truth_center 
            ? `${currentInput.ground_truth_center.lat}°N, ${currentInput.ground_truth_center.lon}°E (IMD Fix)` 
            : null));

  // Dvorak & Intensity
  const dvorakTNumber = classificationResult?.dvorak_classification?.t_number 
    || classificationResult?.dvorak_t_number 
    || classificationResult?.t_number 
    || null;
  const dvorakPattern = classificationResult?.primary_class 
    || classificationResult?.predicted_pattern 
    || classificationResult?.pattern_class 
    || null;
  const classificationText = dvorakTNumber 
    ? `T${dvorakTNumber} • ${dvorakPattern || 'Analyzed'}` 
    : (dvorakPattern || 'Not analyzed');

  const maxWindKmh = classificationResult?.estimated_intensity?.max_sustained_wind_kmh
    ?? classificationResult?.peak_sustained_wind_kmh
    ?? (classificationResult?.dvorak_classification?.estimated_intensity_knots ? Math.round(classificationResult.dvorak_classification.estimated_intensity_knots * 1.852) : null);

  const mslpHpa = classificationResult?.estimated_intensity?.central_pressure_hpa
    ?? classificationResult?.lowest_mslp_hpa
    ?? classificationResult?.dvorak_classification?.estimated_mslp_hpa
    ?? null;

  // Trajectory Status
  const trajectoryForecastList = trajectoryResult?.trajectory_forecast || [];
  const trajectoryStatusText = trajectoryResult?.forecast_status 
    || (trajectoryForecastList.length > 0 ? `${trajectoryForecastList.length} Milestones (72h)` : 'Not analyzed');

  // Landfall Projection
  const landfallSector = landfallPrediction?.target_sector 
    || landfallPrediction?.target_coast 
    || landfallPrediction?.location 
    || (landfallPrediction ? 'Corridor Computed' : 'Not analyzed');
  const surgeHeight = landfallPrediction?.surge_height_m 
    || landfallPrediction?.surge_potential_m 
    || null;

  // Real critical districts from session if present
  const criticalDistricts = landfallPrediction?.coastal_strike_probabilities
    || trajectoryResult?.impact_assessment?.critical_districts
    || trajectoryResult?.coastal_strike_probabilities
    || [];

  const isGatewayOnline = backendHealth?.status === 'ONLINE';

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 bg-white dark:bg-black min-h-[calc(100vh-3.5rem)] text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      
      {/* MAIN LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Header with Active Storm Preset Selector + System Health Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">Mission Control</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                isGatewayOnline 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' 
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              }`}>
                {isGatewayOnline ? 'GATEWAY ONLINE' : 'STANDBY (FALLBACK)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              MoES Operational Meteorological Telemetry • Active Session: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeStormName}</span> ({activeBasin}{activeDate ? ` • ${activeDate}` : ''})
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Storm Preset Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              {DEFAULT_PRESETS.map((preset) => {
                const isActive = currentInput?.presetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#003087] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {preset.name.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            {/* Climatological Time Range Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsTimeRangeOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 shadow-xs transition-colors cursor-pointer"
              >
                <span>{selectedTimeRange}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              </button>

              {isTimeRangeOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 animate-in fade-in duration-100">
                  {['Today', 'This Week', 'This Month', 'Season 2026'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedTimeRange(range);
                        setIsTimeRangeOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                        selectedTimeRange === range
                          ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{range}</span>
                      {selectedTimeRange === range && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 KPI Cards (Connected to Active Analysis Session) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Active System & Center Fix */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/detection'))}
            className="bg-[#F3F4F6] dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Active Cyclone</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-[20px] leading-tight font-bold text-slate-900 dark:text-white truncate">
                {activeStormName.split(' (')[0]}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                {centerFormatted || 'Center not fixed'}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Detection:</span>
              <span className={`font-semibold ${detectionResult ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {detectionResult ? (detectionResult.confidence_percentage ? `${detectionResult.confidence_percentage}%` : 'Confirmed') : 'Not analyzed'}
              </span>
            </div>
          </div>

          {/* KPI 2: Dvorak Morphology & Intensity */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/classification'))}
            className="bg-[#EBF5FF] dark:bg-slate-900/90 border border-sky-100 dark:border-sky-900/40 p-5 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 tracking-wider uppercase">Dvorak & Intensity</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-[20px] leading-tight font-bold text-slate-900 dark:text-white truncate">
                {classificationText}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {maxWindKmh ? `${maxWindKmh} km/h • ${mslpHpa ? `${mslpHpa} hPa` : 'MSLP est.'}` : 'Intensity uncalculated'}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-sky-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Classification:</span>
              <span className={`font-semibold ${classificationResult ? 'text-sky-700 dark:text-sky-300' : 'text-slate-400'}`}>
                {classificationResult ? 'ResNet18 Complete' : 'Not analyzed'}
              </span>
            </div>
          </div>

          {/* KPI 3: Spatiotemporal Trajectory */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
            className="bg-[#F3F0FF] dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/40 p-5 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 tracking-wider uppercase">72h Trajectory</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-[20px] leading-tight font-bold text-slate-900 dark:text-white truncate">
                {trajectoryStatusText}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                {trajectoryForecastList.length > 0 ? 'GRU 25-pass MC Dropout' : 'Awaiting trajectory model'}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-purple-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Forecast Horizon:</span>
              <span className={`font-semibold ${trajectoryResult ? 'text-purple-700 dark:text-purple-300' : 'text-slate-400'}`}>
                {trajectoryResult ? '+72 Hours' : 'Not analyzed'}
              </span>
            </div>
          </div>

          {/* KPI 4: Landfall & Coastal Risk */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/impact'))}
            className="bg-[#F0FDF4] dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-900/40 p-5 rounded-2xl flex flex-col justify-between h-36 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-wider uppercase">Landfall Corridor</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <div className="text-[18px] leading-tight font-bold text-slate-900 dark:text-white truncate">
                {landfallSector}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                {surgeHeight ? `Surge: ${surgeHeight}m projected` : (landfallPrediction ? 'Corridor evaluated' : 'Awaiting impact run')}
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-medium pt-1 border-t border-emerald-200/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Coastal Directives:</span>
              <span className={`font-semibold ${landfallPrediction ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}`}>
                {criticalDistricts.length > 0 ? `${criticalDistricts.length} Sectors` : (landfallPrediction ? 'Active' : 'Not analyzed')}
              </span>
            </div>
          </div>

        </div>

        {/* System Architecture & Health Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isGatewayOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <strong className="text-slate-700 dark:text-slate-300">Gateway:</strong> {isGatewayOnline ? 'FastAPI Gateway (Online)' : 'Client In-Browser Inference'}
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden md:flex items-center gap-1.5">
              <strong className="text-slate-700 dark:text-slate-300">Engines:</strong> MobileNetV3 + ResNet18 + 2-Layer GRU
            </span>
            <span className="hidden lg:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden lg:flex items-center gap-1.5">
              <strong className="text-slate-700 dark:text-slate-300">Database:</strong> SQLite Intel (Active)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">SESSION: {currentInput?.sessionId?.slice(0, 26)}...</span>
          </div>
        </div>

        {/* Middle Row: Climatological Basin Baseline + Active Strike Risk */}
        <div className="flex flex-col lg:flex-row gap-6 bg-[#FAFAFA] dark:bg-slate-900/80 rounded-[32px] p-6 border border-slate-100/60 dark:border-slate-800/80 transition-colors">
          
          <div className="flex-1 flex flex-col min-w-0 pr-0 lg:pr-6 lg:border-r border-slate-100/50 dark:border-slate-800/60">
            {/* Climatological Baseline Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Climatological Basin Baseline</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                    Seasonal Reference
                  </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Historical monthly meteorological trends for North Indian Ocean basins (Reference comparison)</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <button 
                    onClick={() => setActiveMetricTab('wind')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeMetricTab === 'wind'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Wind
                  </button>
                  <button 
                    onClick={() => setActiveMetricTab('pressure')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeMetricTab === 'pressure'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Pressure
                  </button>
                  <button 
                    onClick={() => setActiveMetricTab('rainfall')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeMetricTab === 'rainfall'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Rainfall
                  </button>
                </div>
              </div>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentChartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94A3B8' }} 
                    domain={activeMetricTab === 'pressure' ? [970, 1020] : ['auto', 'auto']}
                    tickFormatter={(val) => {
                      if (activeMetricTab === 'pressure') return `${val}`;
                      if (activeMetricTab === 'rainfall') return `${val}mm`;
                      return val > 0 ? `${val}k` : '0';
                    }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.2)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="currentYear" name="Current Season" stroke="#0F172A" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#0EA5E9', stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="lastYear" name="Historical" stroke="#93C5FD" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Strike Risk / Top Affected Sectors */}
          <div className="w-full lg:w-[240px] shrink-0 pt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Active Strike Risk</h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                criticalDistricts.length > 0 
                  ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {criticalDistricts.length > 0 ? `${criticalDistricts.length} Sectors` : 'Standby'}
              </span>
            </div>

            {criticalDistricts.length > 0 ? (
              <div className="space-y-3.5">
                {criticalDistricts.slice(0, 5).map((district, idx) => {
                  const prob = district.strike_prob_pct ?? district.probability_pct ?? 50;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => navigate(toPortalPath('/dashboard/impact'))}
                      className="cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate max-w-[130px]">
                          {district.district || district.name}
                        </span>
                        <span className="font-bold text-red-600 dark:text-red-400 font-mono text-[11px]">{prob}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all" 
                          style={{ width: `${Math.min(100, prob)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No coastal strike model run for <span className="font-semibold">{activeStormName.split(' (')[0]}</span> yet.
                </p>
                <button
                  onClick={() => navigate(toPortalPath('/dashboard/impact'))}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#003087] dark:text-sky-400 hover:underline cursor-pointer"
                >
                  <span>Evaluate Coastal Risk</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom 2 charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAFAFA] dark:bg-slate-900/80 rounded-[32px] p-6 border border-slate-100/60 dark:border-slate-800/80 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {criticalDistricts.length > 0 
                  ? `Coastal Strike Probabilities (${activeStormName.split(' (')[0]})` 
                  : 'Regional Strike Frequency (Historical Benchmark)'}
              </h3>
              <span className="text-[10px] text-slate-400">
                {criticalDistricts.length > 0 ? 'Live Session Output' : 'Archive Norms'}
              </span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={criticalDistricts.length > 0 
                    ? criticalDistricts.slice(0, 6).map((d, i) => ({
                        name: (d.district || d.name || '').slice(0, 6),
                        val: d.strike_prob_pct ?? d.probability_pct ?? 50,
                        fill: i === 0 ? '#EF4444' : (i < 3 ? '#F59E0B' : '#3B82F6')
                      }))
                    : warningsRegionData} 
                  barSize={28} 
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val > 0 ? `${val}%` : '0'} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)' }} />
                  <Bar dataKey="val" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#FAFAFA] dark:bg-slate-900/80 rounded-[32px] p-6 border border-slate-100/60 dark:border-slate-800/80 flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Severity Distribution</h3>
              <span className="text-[10px] text-slate-400">IMD 1990–2025</span>
            </div>
            <div className="flex-1 flex flex-row items-center justify-between px-4">
              <div className="w-[160px] h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3 justify-center">
                {severityData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-20">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.value}%</span>
                    <span className="w-1.5 h-1.5 rounded-full ml-1" style={{ backgroundColor: item.color }}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full xl:w-[280px] shrink-0 flex flex-col gap-10 xl:pl-2">
        
        {/* System Alerts */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-5">System Alerts</h3>
          <div className="space-y-4">
            <div 
              onClick={() => navigate(toPortalPath('/dashboard/detection'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {detectionResult ? 'MobileNetV3: Fix confirmed.' : 'MobileNetV3: Standby.'}
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                  {detectionResult ? (detectionResult.confidence_percentage ? `${detectionResult.confidence_percentage}% confidence` : 'Center localized') : 'Awaiting raster detection'}
                </p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/earth'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/60">
                <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  {isGatewayOnline ? 'FastAPI Gateway: Online.' : 'Client Fallback Active.'}
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                  {isGatewayOnline ? 'Neural backend operational' : 'In-browser inference'}
                </p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                <Compass className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  Active: {activeStormName.split(' (')[0]}.
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                  {activeBasin} • {activeDate || 'Session initialized'}
                </p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/bulletin'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60">
                <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  MoES Advisory Ready.
                </p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
                  Synthesis & PDF Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-5">Recent Updates</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            
            <div 
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="relative flex items-start gap-4 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 relative z-10 shrink-0 border border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=TC&background=E0E7FF&color=4F46E5" alt="TC" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-0.5">
                 <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">Trajectory modified.</p>
                 <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Just now</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/impact'))}
              className="relative flex items-start gap-4 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 relative z-10 shrink-0 border border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=NS&background=FFEDD5&color=C2410C" alt="NS" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-0.5">
                 <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">Released a new forecast.</p>
                 <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">59 minutes ago</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/models'))}
              className="relative flex items-start gap-4 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-900 relative z-10 shrink-0 border border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=MD&background=E0F2FE&color=0369A1" alt="MD" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-0.5">
                 <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight">Modified telemetry data.</p>
                 <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">Today, 11:59 AM</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Field Units */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-5">Field Units</h3>
          <div className="space-y-3">
            {[
              { name: 'Natali Craig', role: 'Radar Operations', status: 'Active on Site', bg: 'bg-indigo-100 dark:bg-indigo-950/60', text: 'text-indigo-700 dark:text-indigo-300' },
              { name: 'Drew Cano', role: 'Telemetry Ingestion', status: 'Standby', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
              { name: 'Andi Lane', role: 'Disaster Coordination', status: 'In Field', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' },
              { name: 'Koray Okumus', role: 'AI Inference', status: 'Online', bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-700 dark:text-sky-300' },
              { name: 'Kate Morrison', role: 'Satellite Analyst', status: 'Active', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300' },
            ].map((unit) => (
              <div 
                key={unit.name} 
                onClick={() => setActiveOfficerModal(unit)}
                className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${unit.bg} ${unit.text}`}>
                    {unit.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white block leading-tight">{unit.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{unit.role}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {unit.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

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
                <span className="text-slate-400 dark:text-slate-500">Station:</span>
                <span className="font-semibold text-slate-800 dark:text-white">Bhubaneswar IMD Radar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Emergency Channel:</span>
                <span className="font-mono font-semibold text-sky-600 dark:text-sky-400">CH-08 (MoES)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Response Status:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">De-escalation Active</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveOfficerModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
