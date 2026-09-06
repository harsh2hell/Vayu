import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

const Box = ({ label, sub, color }) => (
  <div className={`border-2 ${color} rounded-xl p-4 text-center`}>
    <p className="font-semibold text-sm">{label}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

const Architecture = () => (
  <div className="space-y-5 max-w-[1400px] mx-auto">
    <div>
      <h1 className="text-xl font-bold text-slate-900">AI System Architecture</h1>
      <p className="text-sm text-slate-500 mt-0.5">End-to-end data flow and machine learning pipeline diagram</p>
    </div>

    <div className="card p-10">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 text-sm">
        {/* Tier 1 */}
        <div className="w-full grid grid-cols-3 gap-4">
          <Box label="INSAT-3DR / 3D" sub="Visible, IR, Water Vapour" color="border-blue-300 bg-blue-50 text-blue-800" />
          <Box label="NOAA-20 / GPM" sub="SST, Rainfall, Microwave" color="border-blue-300 bg-blue-50 text-blue-800" />
          <Box label="ASCAT / Meteosat" sub="Wind Field, Water Vapour" color="border-blue-300 bg-blue-50 text-blue-800" />
        </div>

        <ArrowDown className="w-6 h-6 text-slate-400" />

        {/* Tier 2 */}
        <div className="w-full">
          <Box label="Data Collection & Ingestion Layer" sub="APIs · Webhooks · Direct Downlink · BUFR/NetCDF parsing" color="border-slate-300 bg-slate-50 text-slate-700" />
        </div>

        <ArrowDown className="w-6 h-6 text-slate-400" />

        {/* Tier 3 */}
        <div className="w-full">
          <Box label="Pre-processing & Data Fusion" sub="Normalisation · Cloud masking · Spatial alignment · Feature concatenation" color="border-indigo-300 bg-indigo-50 text-indigo-800" />
        </div>

        <ArrowDown className="w-6 h-6 text-slate-400" />

        {/* AI Core */}
        <div className="w-full border-2 border-[#003087] rounded-2xl p-5 bg-[#003087]/5">
          <p className="text-center font-bold text-[#003087] mb-4 text-base">Genuine AI / ML Intelligence Engine (Verified PyTorch Checkpoints)</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-[#003087]/30 rounded-xl p-3 text-center">
              <p className="font-semibold text-[#003087] text-xs">DETECTION & EYE FIX</p>
              <p className="text-[10px] text-slate-800 font-bold mt-1">MobileNetV3-Small</p>
              <p className="text-[10px] text-slate-500">Dual-head center regression (4.2 MB .pt)</p>
            </div>
            <div className="bg-white border border-[#003087]/30 rounded-xl p-3 text-center">
              <p className="font-semibold text-[#003087] text-xs">MORPHOLOGY CLASSIFIER</p>
              <p className="text-[10px] text-slate-800 font-bold mt-1">ResNet-18 + Grad-CAM</p>
              <p className="text-[10px] text-slate-500">5 Dvorak patterns (43.0 MB .pt)</p>
            </div>
            <div className="bg-white border border-[#003087]/30 rounded-xl p-3 text-center">
              <p className="font-semibold text-[#003087] text-xs">TRAJECTORY & CONES</p>
              <p className="text-[10px] text-slate-800 font-bold mt-1">2-Layer GRU Seq2Seq</p>
              <p className="text-[10px] text-slate-500">25-Pass MC Dropout (0.16 MB .pt)</p>
            </div>
          </div>
        </div>

        <ArrowDown className="w-6 h-6 text-slate-400" />

        {/* Tier 5 */}
        <div className="w-full grid grid-cols-2 gap-4">
          <Box label="Risk Assessment Module" sub="Automated severity scoring · Impact modelling" color="border-orange-300 bg-orange-50 text-orange-800" />
          <Box label="Alert Generation System" sub="Multi-channel notification · Authority dispatch" color="border-red-300 bg-red-50 text-red-800" />
        </div>

        <ArrowDown className="w-6 h-6 text-slate-400" />

        {/* Final Output */}
        <div className="w-full border-2 border-emerald-500 rounded-2xl p-5 bg-emerald-50 text-center">
          <p className="font-bold text-emerald-800 text-base">VAYU Dashboard Platform</p>
          <p className="text-xs text-emerald-600 mt-1">Web-based command center for meteorologists, disaster managers & emergency responders</p>
        </div>
      </div>
    </div>
  </div>
);

export default Architecture;
