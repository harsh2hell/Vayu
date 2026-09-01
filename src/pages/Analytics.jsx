import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';
import { HISTORICAL_CYCLONES, CYCLONE_BY_YEAR } from '../data/mockData';

const Analytics = () => {
  const [basinFilter, setBasinFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = HISTORICAL_CYCLONES.filter(c =>
    (basinFilter === 'ALL' || c.basin === basinFilter) &&
    (search === '' || c.id.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase()))
  );

  const catColor = (cat) => {
    if (cat.includes('Super')) return 'badge-red';
    if (cat.includes('Very')) return 'badge-orange';
    if (cat.includes('Severe')) return 'badge-amber';
    return 'badge-blue';
  };

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historical Cyclone Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">North Indian Ocean basin historical database & trend analysis</p>
        </div>
        <button className="btn-secondary gap-2"><Download className="w-4 h-4" /> Export CSV</button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-800">Cyclones Per Year (NIO Basin)</h3>
          </div>
          <div className="p-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CYCLONE_BY_YEAR} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                <Bar dataKey="count" fill="#003087" radius={[4, 4, 0, 0]} name="Cyclones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">Seasonal Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'Post-Monsoon (Oct–Dec)', pct: 68, color: 'bg-[#003087]' },
              { label: 'Pre-Monsoon (Apr–Jun)', pct: 25, color: 'bg-blue-300' },
              { label: 'Monsoon (Jul–Sep)', pct: 7, color: 'bg-slate-300' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-800">{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${color}`} style={{ width: `${pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-slate-900">86</p>
              <p className="text-xs text-slate-400">Total (2019–2025)</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-slate-900">12.3</p>
              <p className="text-xs text-slate-400">Average per year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Table */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-slate-800">Historical Database</h3>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search cyclones..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input text-xs py-1.5 w-48"
            />
            <select
              value={basinFilter}
              onChange={e => setBasinFilter(e.target.value)}
              className="form-select text-xs py-1.5 w-44"
            >
              <option value="ALL">All Basins</option>
              <option value="Bay of Bengal">Bay of Bengal</option>
              <option value="Arabian Sea">Arabian Sea</option>
            </select>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              {filtered.length} records
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Cyclone ID</th>
                <th>Year</th>
                <th>Basin</th>
                <th>Max Wind</th>
                <th>Category</th>
                <th>Landfall</th>
                <th>Casualties</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="font-semibold text-[#003087]">{c.id}</td>
                  <td>{c.year}</td>
                  <td>{c.basin}</td>
                  <td className={`font-semibold ${c.maxWind >= 200 ? 'text-red-600' : c.maxWind >= 150 ? 'text-orange-500' : 'text-slate-700'}`}>
                    {c.maxWind} km/h
                  </td>
                  <td><span className={catColor(c.category)}>{c.category}</span></td>
                  <td>{c.landfall}</td>
                  <td className={c.casualties > 20 ? 'text-red-600 font-semibold' : 'text-slate-700'}>{c.casualties}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="text-center py-8 text-slate-400">No records match the filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
