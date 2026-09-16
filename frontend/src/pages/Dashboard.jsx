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
    cyclones: '7,265',
    cyclonesTrend: '+11.01%',
    regions: '3,671',
    regionsTrend: '-0.03%',
    alerts: '256',
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

const deviceTrafficData = [
  { name: 'Linux', val: 38 },
  { name: 'Mac', val: 78 },
  { name: 'iOS', val: 56 },
  { name: 'Windows', val: 92 },
  { name: 'Android', val: 115, isHighlight: true, badge: '243K' },
  { name: 'Other', val: 34 },
];

const locationTrafficData = [
  { name: 'US', val: 42 },
  { name: 'Canada', val: 82 },
  { name: 'Mexico', val: 72 },
  { name: 'China', val: 36 },
  { name: 'Japan', val: 94 },
  { name: 'Australia', val: 62 },
];

const productTrafficData = [
  { month: 'Jan', all: 28, snow: 16 },
  { month: 'Feb', all: 48, snow: 26 },
  { month: 'Mar', all: 36, snow: 20 },
  { month: 'Apr', all: 68, snow: 42 },
  { month: 'May', all: 78, snow: 48 },
  { month: 'Jun', all: 45, snow: 24 },
];

const referenceProjects = [
  { name: 'ByeWind', role: 'Chief Meteorologist', status: 'In Progress', statusColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80' },
  { name: 'Natali Craig', role: 'Radar Operations', status: 'Complete', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80' },
  { name: 'Drew Cano', role: 'Telemetry Ingestion', status: 'Pending', statusColor: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80' },
  { name: 'Orlando Diggs', role: 'Evacuation Lead', status: 'Approved', statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80' },
  { name: 'Andi Lane', role: 'Disaster Liaison', status: 'Rejected', statusColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80' },
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
    <div className="w-full flex flex-col xl:flex-row gap-8 bg-white min-h-[calc(100vh-3.5rem)] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* MAIN LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Header with Interactive Time Range Dropdown */}
        <div className="flex justify-between items-end relative">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Overview</h1>
            <p className="text-xs text-slate-400 mt-0.5">MoES Operational Meteorological Telemetry</p>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsTimeRangeOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-slate-300 text-[13px] font-medium text-slate-700 hover:text-slate-900 bg-white shadow-xs transition-colors cursor-pointer"
            >
              <span>{selectedTimeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isTimeRangeOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-30 py-1 animate-in fade-in duration-100">
                {['Today', 'This Week', 'This Month', 'Season 2026'].map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedTimeRange(range);
                      setIsTimeRangeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                      selectedTimeRange === range
                        ? 'bg-sky-50 text-sky-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{range}</span>
                    {selectedTimeRange === range && <Check className="w-3.5 h-3.5 text-sky-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4 Colored KPI Cards (2x2 grid on mobile, 4 cols on desktop) matching reference mockup */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Vibrant Royal Blue */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
            className="bg-[#1877F2] text-white p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between h-28 sm:h-32 cursor-pointer shadow-sm hover:shadow-md transition-shadow group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-white/90">Views</span>
              <span className="p-1 rounded-full bg-white/20 text-white">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-[28px] leading-none font-bold text-white tracking-tight">{kpis.cyclones}</div>
              <div className="text-[11px] font-medium text-white/80 mt-1 flex items-center">
                {kpis.cyclonesTrend}
              </div>
            </div>
          </div>

          {/* Card 2: Dark Charcoal / Black */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/impact'))}
            className="bg-[#18181B] dark:bg-slate-900 text-white p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between h-28 sm:h-32 cursor-pointer shadow-sm hover:shadow-md transition-shadow group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-white/80">Visits</span>
              <span className="p-1 rounded-full bg-white/10 text-white/80">
                <TrendingDown className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-[28px] leading-none font-bold text-white tracking-tight">{kpis.regions}</div>
              <div className="text-[11px] font-medium text-white/60 mt-1 flex items-center">
                {kpis.regionsTrend}
              </div>
            </div>
          </div>

          {/* Card 3: Dark Charcoal / Black */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/impact'))}
            className="bg-[#18181B] dark:bg-slate-900 text-white p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between h-28 sm:h-32 cursor-pointer shadow-sm hover:shadow-md transition-shadow group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-white/80">New Users</span>
              <span className="p-1 rounded-full bg-white/10 text-white/80">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-[28px] leading-none font-bold text-white tracking-tight">{kpis.alerts}</div>
              <div className="text-[11px] font-medium text-white/60 mt-1 flex items-center">
                {kpis.alertsTrend}
              </div>
            </div>
          </div>

          {/* Card 4: Vivid Electric Blue */}
          <div 
            onClick={() => navigate(toPortalPath('/dashboard/earth'))}
            className="bg-[#2B87FF] text-white p-3.5 sm:p-5 rounded-2xl flex flex-col justify-between h-28 sm:h-32 cursor-pointer shadow-sm hover:shadow-md transition-shadow group select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-white/90">Active Users</span>
              <span className="p-1 rounded-full bg-white/20 text-white">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <div className="text-xl sm:text-[28px] leading-none font-bold text-white tracking-tight">{kpis.dataPoints}</div>
              <div className="text-[11px] font-medium text-white/80 mt-1 flex items-center">
                {kpis.dataPointsTrend}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Line Chart Card: Users, Projects, Operating Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-5 mb-6 text-[13px]">
            <button 
              onClick={() => setActiveMetricTab('wind')}
              className={`cursor-pointer transition-all ${
                activeMetricTab === 'wind' 
                  ? 'text-purple-600 dark:text-purple-400 font-bold relative after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-purple-600' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
              }`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveMetricTab('pressure')}
              className={`cursor-pointer transition-all ${
                activeMetricTab === 'pressure' 
                  ? 'text-purple-600 dark:text-purple-400 font-bold relative after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-purple-600' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
              }`}
            >
              Projects
            </button>
            <button 
              onClick={() => setActiveMetricTab('rainfall')}
              className={`cursor-pointer transition-all ${
                activeMetricTab === 'rainfall' 
                  ? 'text-purple-600 dark:text-purple-400 font-bold relative after:absolute after:-bottom-1.5 after:left-0 after:w-full after:h-0.5 after:bg-purple-600' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
              }`}
            >
              Operating Status
            </button>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentChartData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="currentYear" 
                  stroke="#C084FC" 
                  strokeWidth={2} 
                  dot={{ r: 4, stroke: '#18181B', strokeWidth: 2, fill: '#FFFFFF' }} 
                  activeDot={{ r: 6, fill: '#A855F7', stroke: '#18181B', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Device Traffic Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-blue-600 dark:text-blue-400 mb-4">Device Traffic</h3>
          
          <div className="h-[200px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deviceTrafficData} barSize={34} margin={{ top: 25, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                <YAxis hide domain={[0, 140]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)' }} />
                <Bar 
                  dataKey="val" 
                  radius={[12, 12, 12, 12]}
                >
                  {deviceTrafficData.map((entry, index) => (
                    <Cell 
                      key={`device-${index}`} 
                      fill={entry.isHighlight ? '#3B82F6' : '#F1F5F9'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Location Traffic Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-emerald-500 dark:text-emerald-400 mb-4">Location Traffic</h3>
          
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationTrafficData} barSize={32} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                <YAxis hide domain={[0, 110]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)' }} />
                <Bar 
                  dataKey="val" 
                  fill="#F1F5F9"
                  radius={[12, 12, 12, 12]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Product Traffic Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-rose-500 dark:text-rose-400">Product Traffic</h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100" /> All</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> SnowUI</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Dashboard</span>
            </div>
          </div>
          
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productTrafficData} barSize={6} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="snow" fill="#FB7185" radius={[4, 4, 4, 4]} />
                <Bar dataKey="all" fill="#94A3B8" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Projects Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-cyan-500 dark:text-cyan-400 mb-4">Projects</h3>
          
          <div className="space-y-3.5">
            {referenceProjects.map((p) => (
              <div 
                key={p.name}
                onClick={() => setActiveOfficerModal({ name: p.name, role: p.role, status: p.status, bg: 'bg-cyan-100', text: 'text-cyan-700' })}
                className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src={p.avatar} 
                    alt={p.name} 
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700" 
                  />
                  <div className="truncate">
                    <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                      {p.name}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {p.role}
                    </span>
                  </div>
                </div>
                
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${p.statusColor}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN (Desktop sidebar for alerts and field units) */}
      <div className="hidden xl:flex w-[280px] shrink-0 flex-col gap-10 xl:pl-2">
        
        {/* System Alerts */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 mb-5">System Alerts</h3>
          <div className="space-y-4">
            <div 
              onClick={() => navigate(toPortalPath('/dashboard/detection'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">Anomaly detection active.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">Just now</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/earth'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-sky-50/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100">
                <UserPlus className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">Windy.com stream active.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">Live Feed</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">Backend sync complete.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">12 hours ago</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/bulletin'))}
              className="flex gap-3 items-start p-2 rounded-xl hover:bg-emerald-50/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                <Radio className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">MoES Bulletin Dispatched.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">Today, 11:59 AM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 mb-5">Recent Updates</h3>
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-slate-100">
            
            <div 
              onClick={() => navigate(toPortalPath('/dashboard/trajectory'))}
              className="relative flex items-start gap-4 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=TC&background=E0E7FF&color=4F46E5" alt="TC" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-0.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Trajectory modified.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-0.5">Just now</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/impact'))}
              className="relative flex items-start gap-4 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=NS&background=FFEDD5&color=C2410C" alt="NS" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-0.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Released a new forecast.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-0.5">59 minutes ago</p>
              </div>
            </div>

            <div 
              onClick={() => navigate(toPortalPath('/dashboard/models'))}
              className="relative flex items-start gap-4 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=MD&background=E0F2FE&color=0369A1" alt="MD" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-0.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Modified telemetry data.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-0.5">Today, 11:59 AM</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Field Units */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 mb-5">Field Units</h3>
          <div className="space-y-3">
            {[
              { name: 'Natali Craig', role: 'Radar Operations', status: 'Active on Site', bg: 'bg-indigo-100', text: 'text-indigo-700' },
              { name: 'Drew Cano', role: 'Telemetry Ingestion', status: 'Standby', bg: 'bg-emerald-100', text: 'text-emerald-700' },
              { name: 'Andi Lane', role: 'Disaster Coordination', status: 'In Field', bg: 'bg-amber-100', text: 'text-amber-700' },
              { name: 'Koray Okumus', role: 'AI Inference', status: 'Online', bg: 'bg-sky-100', text: 'text-sky-700' },
              { name: 'Kate Morrison', role: 'Satellite Analyst', status: 'Active', bg: 'bg-rose-100', text: 'text-rose-700' },
            ].map((unit) => (
              <div 
                key={unit.name} 
                onClick={() => setActiveOfficerModal(unit)}
                className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${unit.bg} ${unit.text}`}>
                    {unit.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <span className="text-[13px] font-medium text-slate-700 group-hover:text-slate-900 block leading-tight">{unit.name}</span>
                    <span className="text-[10px] text-slate-400">{unit.role}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveOfficerModal(null)}
        >
          <div 
            className="w-full max-w-sm bg-white border border-slate-100 rounded-2xl p-5 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${activeOfficerModal.bg} ${activeOfficerModal.text}`}>
                {activeOfficerModal.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{activeOfficerModal.name}</h4>
                <p className="text-xs text-slate-400">{activeOfficerModal.role} • {activeOfficerModal.status}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Station:</span>
                <span className="font-semibold text-slate-800">Bhubaneswar IMD Radar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Emergency Channel:</span>
                <span className="font-mono font-semibold text-sky-600">CH-08 (MoES)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Response Status:</span>
                <span className="font-semibold text-emerald-600">De-escalation Active</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveOfficerModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
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
