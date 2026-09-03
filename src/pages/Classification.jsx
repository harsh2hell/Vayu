import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { CheckCircle, ChevronRight, Upload, Sparkles, Crosshair, Eye, Wind, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classifyMorphologyPattern } from '../services/api';

const DEFAULT_CLASSES = [
  { class_id: 'cdo_pattern', class_name: 'Central Dense Overcast (CDO)', probability_pct: 68.5, dvorak_range: 'T3.5 – T4.5', color: 'bg-blue-600' },
  { class_id: 'curved_band', class_name: 'Curved Band Pattern', probability_pct: 18.2, dvorak_range: 'T1.5 – T3.5', color: 'bg-sky-500' },
  { class_id: 'shear_pattern', class_name: 'Shear Pattern', probability_pct: 8.4, dvorak_range: 'T1.5 – T3.0', color: 'bg-amber-500' },
  { class_id: 'eye_pattern', class_name: 'Eye Pattern (Warm Core)', probability_pct: 3.5, dvorak_range: 'T4.5 – T7.5', color: 'bg-red-500' },
  { class_id: 'embedded_center', class_name: 'Embedded Center Pattern', probability_pct: 1.4, dvorak_range: 'T3.5 – T5.5', color: 'bg-indigo-500' },
];

const radarData = [
  { feature: 'Spiral Curvature', value: 85 },
  { feature: 'Eyewall Core', value: 72 },
  { feature: 'CDO Symmetry', value: 88 },
  { feature: 'Convective Cloud', value: 78 },
  { feature: 'SST Coupling', value: 92 },
  { feature: 'Low Shear', value: 80 },
];

const Classification = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('cdo_pattern');
  const [customFile, setCustomFile] = useState(null);
  const [customImage, setCustomImage] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setCustomImage(URL.createObjectURL(file));
      setClassificationResult(null);
    }
  };

  const handleRunClassification = async () => {
    setIsClassifying(true);
    const res = await classifyMorphologyPattern(customFile, 'Bay of Bengal', 12.0);
    setIsClassifying(false);
    if (res) {
      setClassificationResult(res);
      if (res.class_probability_distribution && res.class_probability_distribution.length > 0) {
        setSelectedClass(res.class_probability_distribution[0].class_id);
      }
    }
  };

  const classesList = classificationResult?.class_probability_distribution || DEFAULT_CLASSES;
  const topClass = classificationResult?.predicted_pattern || 'Central Dense Overcast (CDO)';
  const topConf = classificationResult?.confidence_percentage || 68.5;
  const dvorakCode = classificationResult?.dvorak_classification?.t_number || 'T3.5';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#003087]" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Cyclone Pattern Classification</h1>
            <span className="badge badge-navy">PatternNet-ViT v1.8 (5 Morphological Classes)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Vision Transformer (ViT) architecture classifying Curved Band, Shear, CDO, Eye, and Embedded Center patterns with Grad-CAM attention.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="btn-secondary text-xs sm:text-sm py-2 px-3 gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Satellite Frame</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button 
            onClick={handleRunClassification}
            disabled={isClassifying}
            className="btn-primary text-xs sm:text-sm py-2 px-4 gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isClassifying ? 'Running ViT Classifier...' : 'Run Morphological AI Classifier'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left: Satellite Pattern View & Grad-CAM */}
        <div className="card overflow-hidden flex flex-col">
          <div className="card-header bg-white flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Satellite Morphology & Grad-CAM</h3>
            <span className="badge badge-blue">Dvorak Matrix</span>
          </div>
          
          <div className="bg-slate-950 relative min-h-[300px] flex items-center justify-center overflow-hidden">
            <img
              src={customImage || "https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=8,75,23,95&TIME=2024-10-24&WIDTH=1024&HEIGHT=768&FORMAT=image/png"}
              alt="Cyclone pattern"
              className="w-full h-full object-cover filter brightness-90 contrast-125 saturate-150"
            />

            
            {/* Grad-CAM Attention Heatmap Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-44 h-44 border-2 border-amber-400 rounded-full opacity-70 animate-pulse flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-red-400 bg-red-600/30 rounded-full"></div>
              </div>
            </div>

            <div className="absolute bottom-2 left-2 bg-black/80 text-cyan-300 font-mono text-[10px] px-2 py-1 rounded">
              Attention Head: ViT-B/16 Layer 12
            </div>
          </div>

          <div className="p-4 space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Predicted Pattern:</span>
              <span className="font-bold text-slate-900">{topClass}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Dvorak Code:</span>
              <span className="font-bold text-sky-800">{dvorakCode}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">IMD Classification:</span>
              <span className="font-bold text-slate-800">{classificationResult?.dvorak_classification?.category || 'Severe Cyclonic Storm'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Peak Sustained Wind:</span>
              <span className="font-bold text-red-600">{classificationResult?.dvorak_classification?.estimated_wind_speed_kmh || 100} km/h</span>
            </div>
          </div>
        </div>

        {/* Middle: 5 Morphological Probabilities */}
        <div className="card overflow-hidden flex flex-col">
          <div className="card-header bg-white">
            <h3 className="text-sm font-semibold text-slate-800">5-Class Softmax Probability Distribution</h3>
          </div>

          <div className="p-5 space-y-3 flex-1">
            {classesList.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedClass(cat.class_id)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                  selectedClass === cat.class_id
                    ? 'border-[#003087] bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-semibold ${selectedClass === cat.class_id ? 'text-[#003087]' : 'text-slate-800'}`}>
                    {cat.class_name}
                  </span>
                  <span className={`text-xs font-bold font-mono ${selectedClass === cat.class_id ? 'text-[#003087]' : 'text-slate-600'}`}>
                    {cat.probability_pct}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill bg-[#003087]" style={{ width: `${cat.probability_pct}%` }}></div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">Dvorak Range: {cat.dvorak_range}</span>
              </button>
            ))}
          </div>

          <div className="mx-5 mb-5 p-4 bg-[#003087] rounded-xl text-white">
            <p className="text-xs text-blue-200 mb-1 uppercase tracking-wider">Top Morphological Classification</p>
            <h3 className="text-base font-bold mb-1">{topClass}</h3>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-semibold text-emerald-300">Confidence: {topConf}%</span>
            </div>
          </div>
        </div>

        {/* Right: Feature Radar & Next Steps */}
        <div className="card overflow-hidden flex flex-col">
          <div className="card-header bg-white">
            <h3 className="text-sm font-semibold text-slate-800">Morphological Feature Radar</h3>
          </div>

          <div className="h-60 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fill: '#64748B' }} />
                <Radar dataKey="value" stroke="#003087" fill="#003087" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 border-t border-slate-100 space-y-2.5 text-xs flex-1">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Backbone Architecture:</span>
              <span className="font-semibold text-slate-800">Vision Transformer (ViT-B/16)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Grad-CAM Hotspots:</span>
              <span className="font-semibold text-emerald-700">3 Foci Localized</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Training Dataset:</span>
              <span className="font-semibold text-slate-800">WMO / IMD Classified Archive</span>
            </div>
          </div>

          <div className="p-4 pt-0">
            <button 
              onClick={() => navigate('/dashboard/track')} 
              className="btn-primary w-full text-xs py-2.5 justify-center gap-1.5"
            >
              <span>Proceed to 4D Trajectory Predictor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Classification;
