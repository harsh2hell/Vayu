import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { key: 'developing', label: 'Developing Cyclone', value: 72, color: 'bg-blue-500' },
  { key: 'mature', label: 'Mature Cyclone', value: 18, color: 'bg-indigo-400' },
  { key: 'intensifying', label: 'Intensifying Cyclone', value: 7, color: 'bg-orange-400' },
  { key: 'weakening', label: 'Weakening Cyclone', value: 3, color: 'bg-slate-300' },
];

const radarData = [
  { feature: 'Cloud Organisation', value: 82 },
  { feature: 'Eye Formation', value: 35 },
  { feature: 'Spiral Bands', value: 78 },
  { feature: 'SST Anomaly', value: 88 },
  { feature: 'Wind Shear', value: 55 },
  { feature: 'CDO Density', value: 70 },
];

const Classification = () => {
  const [selected, setSelected] = useState('developing');
  const navigate = useNavigate();

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">AI Cyclone Pattern Classification</h1>
        <p className="text-sm text-slate-500 mt-0.5">PatternNet-ResNet50 v1.4 — Morphological pattern recognition</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Image */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-800">Satellite Pattern View</h3>
            <span className="badge badge-blue">Dvorak Analysis</span>
          </div>
          <div className="bg-slate-800 relative" style={{ height: 280 }}>
            <img
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
              alt="Cyclone pattern"
              className="w-full h-full object-cover filter brightness-70 hue-rotate-180"
              style={{ height: 280 }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-36 h-36 border-2 border-amber-400 rounded-full opacity-60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-amber-300 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[
              ['Dvorak Code', 'T2.5 / 2.5'],
              ['CI Number', '2.5'],
              ['Estimated MSLP', '980 hPa'],
              ['Estimated Vmax', '85 km/h'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Probabilities */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-800">AI Classification Probabilities</h3>
          </div>
          <div className="p-5 space-y-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelected(cat.key)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selected === cat.key
                    ? 'border-[#003087] bg-blue-50'
                    : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-semibold ${selected === cat.key ? 'text-[#003087]' : 'text-slate-700'}`}>
                    {cat.label}
                  </span>
                  <span className={`text-sm font-bold ${selected === cat.key ? 'text-[#003087]' : 'text-slate-500'}`}>
                    {cat.value}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${cat.color}`} style={{ width: `${cat.value}%` }}></div>
                </div>
              </button>
            ))}
          </div>

          <div className="mx-5 mb-5 p-4 bg-[#003087] rounded-xl text-white">
            <p className="text-xs text-blue-200 mb-1">AI Classification Result</p>
            <h3 className="text-base font-bold mb-1">DEVELOPING TROPICAL CYCLONE</h3>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-semibold text-emerald-300">Confidence: 92.1%</span>
            </div>
          </div>
        </div>

        {/* Right: Feature Analysis */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="text-sm font-semibold text-slate-800">Feature Analysis Radar</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Radar dataKey="value" stroke="#003087" fill="#003087" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-5 border-t border-slate-100 space-y-3">
            {[
              ['Cloud Structure', 'Organised Spiral'],
              ['Eye Formation', 'Not Clearly Visible'],
              ['Development Stage', 'Early Intensification'],
              ['Wind Shear', 'Moderate (12 knots)'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                <span className="text-slate-500 text-xs">{k}</span>
                <span className="font-semibold text-slate-800 text-xs">{v}</span>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5">
            <button onClick={() => navigate('/dashboard/prediction')} className="btn-primary w-full text-xs">
              Run Intensity Prediction <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classification;
