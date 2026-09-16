import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown,
  Bug, UserPlus, Radio, Edit3, Trash2, ShieldCheck,
  ChevronDown, Check, ArrowRight, ShieldAlert, Sparkles, MapPin
} from 'lucide-react';
import { toPortalPath } from '../utils/domain';

// Datasets for line chart metric tabs
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

  // Interactive UI state
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [activeMetricTab, setActiveMetricTab] = useState('wind');
  const [activeOfficerModal, setActiveOfficerModal] = useState(null);

  const kpis = KPI_CONFIGS[selectedTimeRange] || KPI_CONFIGS.Today;
  const currentChartData = METRIC_DATASETS[activeMetricTab] || METRIC_DATASETS.wind;

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 bg-white dark:bg-black min-h-[calc(100vh-3.5rem)] text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      
      {/* MAIN LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Header with Interactive Time Range Dropdown */}
        <div className="flex justify-between items-end relative">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">MoES Operational Meteorological Telemetry</p>
          </div>

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

        {/* 4 KPI Cards (Dynamic values reacting to timeRange) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
            className="bg-[#F3F4F6] dark:bg-slate-900/90 border border-transparent dark:border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Cyclones</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900 dark:text-white">{kpis.cyclones}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center pb-1">
                {kpis.cyclonesTrend} <TrendingUp className="w-3 h-3 ml-0.5 text-emerald-600 dark:text-emerald-400" />
              </span>
            </div>
          </div>

          <div 
            onClick={() => navigate(toPortalPath('/dashboard/impact'))}
            className="bg-[#EBF5FF] dark:bg-slate-900/90 border border-transparent dark:border-sky-900/40 p-5 rounded-2xl flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Affected Regions</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900 dark:text-white">{kpis.regions}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center pb-1">
                {kpis.regionsTrend} <TrendingDown className="w-3 h-3 ml-0.5 text-slate-400 dark:text-slate-500" />
              </span>
            </div>
          </div>

          <div 
            onClick={() => navigate(toPortalPath('/dashboard/impact'))}
            className="bg-[#F3F0FF] dark:bg-slate-900/90 border border-transparent dark:border-purple-900/40 p-5 rounded-2xl flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Alerts Issued</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900 dark:text-white">{kpis.alerts}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center pb-1">
                {kpis.alertsTrend} <TrendingUp className="w-3 h-3 ml-0.5 text-emerald-600 dark:text-emerald-400" />
              </span>
            </div>
          </div>

          <div 
            onClick={() => navigate(toPortalPath('/dashboard/earth'))}
            className="bg-[#F0FDF4] dark:bg-slate-900/90 border border-transparent dark:border-emerald-900/40 p-5 rounded-2xl flex flex-col justify-between h-32 cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data Points</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900 dark:text-white">{kpis.dataPoints}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center pb-1">
                {kpis.dataPointsTrend} <TrendingUp className="w-3 h-3 ml-0.5 text-emerald-600 dark:text-emerald-400" />
              </span>
            </div>
          </div>
        </div>

        {/* Middle Row: Interactive Line Chart Tabs + Regions List */}
        <div className="flex flex-col lg:flex-row gap-6 bg-[#FAFAFA] dark:bg-slate-900/80 rounded-[32px] p-6 border border-slate-100/60 dark:border-slate-800/80 transition-colors">
          
          <div className="flex-1 flex flex-col min-w-0 pr-0 lg:pr-6 lg:border-r border-slate-100/50 dark:border-slate-800/60">
            {/* Interactive Metric Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <button 
                onClick={() => setActiveMetricTab('wind')}
                className={`text-sm cursor-pointer transition-all ${
                  activeMetricTab === 'wind'
                    ? 'font-bold text-slate-900 dark:text-white relative after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-slate-800 dark:after:bg-sky-400'
                    : 'font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Wind Speed Trends
              </button>

              <button 
                onClick={() => setActiveMetricTab('pressure')}
                className={`text-sm cursor-pointer transition-all ${
                  activeMetricTab === 'pressure'
                    ? 'font-bold text-slate-900 dark:text-white relative after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-slate-800 dark:after:bg-sky-400'
                    : 'font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Pressure Anomalies
              </button>

              <button 
                onClick={() => setActiveMetricTab('rainfall')}
                className={`text-sm cursor-pointer transition-all ${
                  activeMetricTab === 'rainfall'
                    ? 'font-bold text-slate-900 dark:text-white relative after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-slate-800 dark:after:bg-sky-400'
                    : 'font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Rainfall
              </button>

              <div className="ml-auto flex gap-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-sky-400"></span> 2026 Season</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-300 dark:bg-blue-500"></span> 2025 Benchmark</span>
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

          <div className="w-full lg:w-[220px] shrink-0 pt-2">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-6">Top Affected Regions</h3>
            <div className="space-y-4">
              {topRegions.map((region, idx) => (
                <div 
                  key={idx} 
                  onClick={() => navigate(toPortalPath('/dashboard/impact'))}
                  className="flex items-center gap-4 cursor-pointer group"
                >
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors w-24 truncate">{region.name}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-[3px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 dark:bg-sky-500 group-hover:bg-sky-500 rounded-full transition-colors" style={{ width: region.val }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom 2 charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAFAFA] dark:bg-slate-900/80 rounded-[32px] p-6 border border-slate-100/60 dark:border-slate-800/80 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Warnings by Region</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warningsRegionData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val > 0 ? `${val}k` : '0'} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)' }} />
                  <Bar dataKey="val" radius={[6, 6, 6, 6]}>
                    {warningsRegionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#FAFAFA] dark:bg-slate-900/80 rounded-[32px] p-6 border border-slate-100/60 dark:border-slate-800/80 flex flex-col transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Severity Distribution</h3>
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
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Anomaly detection active.</p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Just now</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/earth'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center shrink-0 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/60">
                <UserPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Windy.com stream active.</p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Live Feed</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">Backend sync complete.</p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">12 hours ago</p>
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
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">MoES Bulletin Dispatched.</p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">Today, 11:59 AM</p>
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
