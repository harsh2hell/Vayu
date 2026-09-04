import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { MODEL_METRICS } from '../data/mockData';

const trainingHistory = [
  { epoch: 1, train: 72, val: 68 },
  { epoch: 5, train: 81, val: 77 },
  { epoch: 10, train: 87, val: 83 },
  { epoch: 15, train: 91, val: 88 },
  { epoch: 20, train: 93, val: 91 },
  { epoch: 25, train: 94, val: 92 },
  { epoch: 30, train: 94.5, val: 92.8 },
];

const confusionData = [
  { category: 'Tropical Disturbance', tp: 92, fp: 5, fn: 8 },
  { category: 'Developing Cyclone', tp: 88, fp: 7, fn: 12 },
  { category: 'Mature Cyclone', tp: 94, fp: 3, fn: 6 },
  { category: 'Intensifying', tp: 85, fp: 10, fn: 15 },
  { category: 'Weakening', tp: 83, fp: 12, fn: 17 },
];

const MetricBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1.5">
      <span className="text-slate-600">{label}</span>
      <span className="font-bold text-slate-800">{value}%</span>
    </div>
    <div className="progress-bar">
      <div className={`progress-fill ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const Performance = () => (
  <div className="space-y-5 max-w-[1400px] mx-auto">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900">AI Model Performance & Validation</h1>
        <p className="text-sm text-slate-500 mt-0.5">Evaluation metrics for all prototype AI/ML models</p>
      </div>
      <span className="badge badge-amber text-sm px-3 py-1.5">Prototype Evaluation Metrics</span>
    </div>

    {/* Model Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Detection */}
      <div className="card overflow-hidden border-t-4 border-[#003087]">
        <div className="card-header">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Detection Model</h3>
            <p className="text-xs text-slate-400 mt-0.5">{MODEL_METRICS.detection.version}</p>
          </div>
          <span className="badge badge-blue">CNN</span>
        </div>
        <div className="card-body space-y-4">
          <MetricBar label="Accuracy" value={MODEL_METRICS.detection.accuracy} color="bg-[#003087]" />
          <MetricBar label="Precision" value={MODEL_METRICS.detection.precision} color="bg-blue-400" />
          <MetricBar label="Recall" value={MODEL_METRICS.detection.recall} color="bg-blue-300" />
          <MetricBar label="F1 Score" value={MODEL_METRICS.detection.f1} color="bg-indigo-400" />
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div><p className="font-semibold text-slate-700">Dataset</p><p>{MODEL_METRICS.detection.dataset}</p></div>
          </div>
        </div>
      </div>

      {/* Classification */}
      <div className="card overflow-hidden border-t-4 border-amber-500">
        <div className="card-header">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Classification Model</h3>
            <p className="text-xs text-slate-400 mt-0.5">{MODEL_METRICS.classification.version}</p>
          </div>
          <span className="badge badge-amber">ResNet</span>
        </div>
        <div className="card-body space-y-4">
          <MetricBar label="Accuracy" value={MODEL_METRICS.classification.accuracy} color="bg-amber-500" />
          <MetricBar label="Precision" value={MODEL_METRICS.classification.precision} color="bg-amber-400" />
          <MetricBar label="Recall" value={MODEL_METRICS.classification.recall} color="bg-amber-300" />
          <MetricBar label="F1 Score" value={MODEL_METRICS.classification.f1} color="bg-orange-400" />
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Dataset</p>
            <p>{MODEL_METRICS.classification.dataset}</p>
          </div>
        </div>
      </div>

      {/* Prediction */}
      <div className="card overflow-hidden border-t-4 border-emerald-500">
        <div className="card-header">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Prediction Model</h3>
            <p className="text-xs text-slate-400 mt-0.5">{MODEL_METRICS.prediction.version}</p>
          </div>
          <span className="badge badge-green">LSTM</span>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{MODEL_METRICS.prediction.trackMAE}</p>
              <p className="text-xs text-slate-500 mt-1">km MAE<br />(Track Error)</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{MODEL_METRICS.prediction.intensityMAE}</p>
              <p className="text-xs text-slate-500 mt-1">km/h MAE<br />(Intensity Error)</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 24h track error below NHC benchmark</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 72h forecast capability with ensemble spread</div>
            <p className="text-slate-400 pt-1">Training: {MODEL_METRICS.prediction.dataset}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Training Curve */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-slate-800">Training vs Validation Accuracy</h3>
          <span className="text-xs text-slate-400">Detection Model — 30 epochs</span>
        </div>
        <div className="p-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trainingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="epoch" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} label={{ value: 'Epoch', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" domain={[65, 100]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line dataKey="train" stroke="#003087" strokeWidth={2} dot={false} name="Training Acc." />
              <Line dataKey="val" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="5,3" name="Validation Acc." />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-class accuracy */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-slate-800">Per-Class Detection Accuracy</h3>
        </div>
        <div className="card-body space-y-3">
          {confusionData.map((row) => (
            <div key={row.category}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600">{row.category}</span>
                <span className="font-semibold text-slate-800">{row.tp}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill bg-[#003087]" style={{ width: `${row.tp}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Performance;
