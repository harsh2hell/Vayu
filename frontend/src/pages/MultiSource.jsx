import React from 'react';
import { CheckCircle, WifiOff, ArrowDown } from 'lucide-react';
import { DATA_SOURCES } from '../data/mockData';

const MultiSource = () => (
  <div className="space-y-5 max-w-[1400px] mx-auto">
    <div>
      <h1 className="text-xl font-bold text-slate-900">Multi-Source Data Intelligence</h1>
      <p className="text-sm text-slate-500 mt-0.5">Live satellite data ingestion and fusion status</p>
    </div>

    {/* Source Status Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {DATA_SOURCES.map((src, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">{src.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Last sync: {src.lastSync} | Latency: {src.latency}</p>
            </div>
            {src.status === 'ONLINE'
              ? <span className="badge badge-green"><CheckCircle className="w-3 h-3" /> ONLINE</span>
              : <span className="badge badge-red"><WifiOff className="w-3 h-3" /> OFFLINE</span>
            }
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Data Quality</span>
              <span className="font-semibold text-slate-800">{src.quality}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill bg-emerald-500" style={{ width: `${src.quality}%` }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Fusion Architecture */}
    <div className="card p-8">
      <h3 className="text-sm font-semibold text-slate-800 text-center mb-8">AI Data Fusion Pipeline</h3>
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {['Satellite Imagery', 'Atmospheric Data', 'Ocean Data', 'Historical Records'].map(s => (
            <div key={s} className="bg-[#003087]/5 border border-[#003087]/20 rounded-xl p-3 text-center">
              <p className="text-xs font-semibold text-[#003087]">{s}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-10 text-slate-400">
          {[0, 1, 2, 3].map(i => <ArrowDown key={i} className="w-5 h-5" />)}
        </div>
        <div className="w-full bg-[#003087] text-white rounded-xl p-4 text-center">
          <p className="font-bold text-base">Multi-Source AI Data Fusion Engine</p>
          <p className="text-blue-200 text-xs mt-1">Feature concatenation · Temporal alignment · Spatial interpolation</p>
        </div>
        <ArrowDown className="w-5 h-5 text-slate-400" />
        <div className="w-full bg-amber-50 border-2 border-amber-400 rounded-xl p-4 text-center">
          <p className="font-bold text-amber-700">Cyclone Intelligence Output</p>
          <p className="text-amber-600 text-xs mt-1">Detection → Classification → Track Prediction → Risk Assessment</p>
        </div>
      </div>
    </div>
  </div>
);

export default MultiSource;
