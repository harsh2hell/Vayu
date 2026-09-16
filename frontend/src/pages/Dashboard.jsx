import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown,
  Bug, UserPlus, Radio, Edit3, Trash2, ShieldCheck,
  ChevronDown
} from 'lucide-react';

const windData = [
  { month: 'Jan', currentYear: 10, lastYear: 5 },
  { month: 'Feb', currentYear: 5, lastYear: 12 },
  { month: 'Mar', currentYear: 12, lastYear: 11 },
  { month: 'Apr', currentYear: 23, lastYear: 10 },
  { month: 'May', currentYear: 26, lastYear: 18 },
  { month: 'Jun', currentYear: 16, lastYear: 23 },
  { month: 'Jul', currentYear: 22, lastYear: 25 },
];

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
  { name: 'Odisha Coast', val: '28%' },
  { name: 'West Bengal', val: '22%' },
  { name: 'Andhra Pradesh', val: '18%' },
  { name: 'Gujarat', val: '12%' },
  { name: 'Maharashtra', val: '10%' },
  { name: 'Tamil Nadu', val: '10%' },
];

const Dashboard = () => {
  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 bg-white min-h-[calc(100vh-3.5rem)] text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* MAIN LEFT COLUMN */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Overview</h1>
          <button className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
            Today <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F3F4F6] p-5 rounded-2xl flex flex-col justify-between h-32">
            <span className="text-sm font-semibold text-slate-700">Active Cyclones</span>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900">7</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center pb-1">
                +11.01% <TrendingUp className="w-3 h-3 ml-0.5 text-emerald-600" />
              </span>
            </div>
          </div>
          <div className="bg-[#EBF5FF] p-5 rounded-2xl flex flex-col justify-between h-32">
            <span className="text-sm font-semibold text-slate-700">Affected Regions</span>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900">3,671</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center pb-1">
                -0.03% <TrendingDown className="w-3 h-3 ml-0.5 text-slate-400" />
              </span>
            </div>
          </div>
          <div className="bg-[#F3F0FF] p-5 rounded-2xl flex flex-col justify-between h-32">
            <span className="text-sm font-semibold text-slate-700">Alerts Issued</span>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900">156</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center pb-1">
                +15.03% <TrendingUp className="w-3 h-3 ml-0.5 text-emerald-600" />
              </span>
            </div>
          </div>
          <div className="bg-[#F0FDF4] p-5 rounded-2xl flex flex-col justify-between h-32">
            <span className="text-sm font-semibold text-slate-700">Data Points</span>
            <div className="flex items-end gap-3">
              <span className="text-[28px] leading-none font-bold text-slate-900">2,318</span>
              <span className="text-xs font-semibold text-slate-500 flex items-center pb-1">
                +6.08% <TrendingUp className="w-3 h-3 ml-0.5 text-emerald-600" />
              </span>
            </div>
          </div>
        </div>

        {/* Middle Row: Line Chart + Regions List */}
        <div className="flex flex-col lg:flex-row gap-6 bg-[#FAFAFA] rounded-[32px] p-6 border border-slate-100/60">
          
          <div className="flex-1 flex flex-col min-w-0 pr-0 lg:pr-6 lg:border-r border-slate-100/50">
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <button className="text-sm font-bold text-slate-900 relative after:absolute after:-bottom-2 after:left-0 after:w-full after:h-0.5 after:bg-slate-800 cursor-pointer">Wind Speed Trends</button>
              <button className="text-sm font-medium text-slate-400 hover:text-slate-700 cursor-pointer">Pressure Anomalies</button>
              <button className="text-sm font-medium text-slate-400 hover:text-slate-700 cursor-pointer">Rainfall</button>
              <div className="ml-auto flex gap-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span> This year</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Last year</span>
              </div>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={windData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val > 0 ? `${val}k` : '0'} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="currentYear" stroke="#0F172A" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#0F172A', stroke: '#fff', strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="lastYear" stroke="#93C5FD" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="w-full lg:w-[220px] shrink-0 pt-2">
            <h3 className="text-[13px] font-bold text-slate-900 mb-6">Top Affected Regions</h3>
            <div className="space-y-4">
              {topRegions.map((region, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <span className="text-[13px] font-medium text-slate-700 w-24 truncate">{region.name}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 h-[3px] bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-800 rounded-full" style={{ width: region.val }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom 2 charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAFAFA] rounded-[32px] p-6 border border-slate-100/60">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Warnings by Region</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warningsRegionData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(val) => val > 0 ? `${val}k` : '0'} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="val" radius={[6, 6, 6, 6]}>
                    {warningsRegionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-[#FAFAFA] rounded-[32px] p-6 border border-slate-100/60 flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Severity Distribution</h3>
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
                    <span className="text-[11px] font-semibold text-slate-500 w-20">{item.name}</span>
                    <span className="text-xs font-bold text-slate-900">{item.value}%</span>
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
          <h3 className="text-[13px] font-bold text-slate-900 mb-5">System Alerts</h3>
          <div className="space-y-5">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">Anomaly detection active.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">Just now</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4 text-sky-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">New station registered.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">59 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">Backend sync complete.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">12 hours ago</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <Radio className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 leading-tight">Andi Lane subscribed.</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">Today, 11:59 AM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 mb-5">Recent Updates</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:w-0.5 before:bg-slate-100">
            
            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=TC&background=E0E7FF&color=4F46E5" alt="TC" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-1.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Trajectory modified.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-1">Just now</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=NS&background=FFEDD5&color=C2410C" alt="NS" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-1.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Released a new forecast.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-1">59 minutes ago</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=BR&background=FCE7F3&color=BE185D" alt="BR" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-1.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Submitted a bug report.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-1">12 hours ago</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white relative z-10 shrink-0">
                <div className="w-6 h-6 rounded-full overflow-hidden shadow-sm">
                  <img src="https://ui-avatars.com/api/?name=MD&background=E0F2FE&color=0369A1" alt="MD" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="pt-1.5">
                 <p className="text-[13px] font-semibold text-slate-800 leading-tight">Modified telemetry data.</p>
                 <p className="text-[11px] font-medium text-slate-400 mt-1">Today, 11:59 AM</p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Field Units */}
        <div>
          <h3 className="text-[13px] font-bold text-slate-900 mb-5">Field Units</h3>
          <div className="space-y-4">
            {[
              { name: 'Natali Craig', bg: 'bg-indigo-100', text: 'text-indigo-700' },
              { name: 'Drew Cano', bg: 'bg-emerald-100', text: 'text-emerald-700' },
              { name: 'Andi Lane', bg: 'bg-amber-100', text: 'text-amber-700' },
              { name: 'Koray Okumus', bg: 'bg-sky-100', text: 'text-sky-700' },
              { name: 'Kate Morrison', bg: 'bg-rose-100', text: 'text-rose-700' },
              { name: 'Melody Macy', bg: 'bg-purple-100', text: 'text-purple-700' }
            ].map((unit, i) => (
              <div key={unit.name} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${unit.bg} ${unit.text}`}>
                  {unit.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[13px] font-medium text-slate-700">{unit.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
