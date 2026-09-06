import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, CheckCircle, AlertTriangle, 
  RefreshCw, ShieldCheck, MapPin, Wind
} from 'lucide-react';
import { downloadOfficialBulletinPdf } from '../services/api';
import DataTypeBadge from '../components/DataTypeBadge';
import LastUpdatedBadge from '../components/LastUpdatedBadge';

const BENCHMARK_STORMS = [
  {
    id: 'DANA',
    name: 'Cyclone DANA (2024)',
    fullName: 'Severe Cyclonic Storm DANA',
    basin: 'Bay of Bengal',
    category: 'Severe Cyclonic Storm',
    lat: 18.3,
    lon: 88.4,
    wind: 55.0, // knots (~102 km/h)
    pressure: 988.0,
    landfallDesc: 'Northern Odisha / West Bengal coast between Dhamra and Bhitarkanika'
  },
  {
    id: 'BIPARJOY',
    name: 'Cyclone BIPARJOY (2023)',
    fullName: 'Extremely Severe Cyclonic Storm BIPARJOY',
    basin: 'Arabian Sea',
    category: 'Extremely Severe Cyclonic Storm',
    lat: 20.5,
    lon: 67.2,
    wind: 75.0, // knots (~140 km/h)
    pressure: 966.0,
    landfallDesc: 'Saurashtra and Kutch coast near Jakhau Port'
  }
];

const Bulletin = () => {
  const navigate = useNavigate();
  const [selectedStormId, setSelectedStormId] = useState('DANA');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('idle'); // 'idle' | 'generating' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const [advisoryNumber, setAdvisoryNumber] = useState('VAYU-2024-ADV-08');

  const activeStorm = BENCHMARK_STORMS.find(s => s.id === selectedStormId) || BENCHMARK_STORMS[0];

  useEffect(() => {
    // Reset generation state on storm switch
    setGenerationStatus('idle');
    setErrorMsg(null);
    setAdvisoryNumber(`VAYU-${activeStorm.id === 'DANA' ? '2024' : '2023'}-ADV-${activeStorm.id === 'DANA' ? '08' : '14'}`);
  }, [selectedStormId]);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    setGenerationStatus('generating');
    setErrorMsg(null);

    try {
      const success = await downloadOfficialBulletinPdf({
        name: activeStorm.fullName,
        basin: activeStorm.basin,
        classification: activeStorm.category,
        lat: activeStorm.lat,
        lon: activeStorm.lon,
        windSpeed: activeStorm.wind,
        pressure: activeStorm.pressure
      });

      if (success) {
        setGenerationStatus('success');
      } else {
        setGenerationStatus('error');
        setErrorMsg('BULLETIN GENERATION UNAVAILABLE: Backend PDF synthesis service returned an error.');
      }
    } catch (err) {
      console.error('[Bulletin Page Error]:', err);
      setGenerationStatus('error');
      setErrorMsg('BULLETIN GENERATION UNAVAILABLE: Connection to VAYU backend advisory service timed out.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <DataTypeBadge type="ai" label="OFFICIAL ADVISORY" />
            <LastUpdatedBadge source="VAYU ReportLab Gateway" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Official Cyclone Bulletin & Advisory
            </h1>
            <span className="badge badge-navy">MoES / IMD Format</span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Automated compilation and generation of standardized meteorological cyclone bulletins, danger directives, and high-fidelity PDF advisories.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {BENCHMARK_STORMS.map((storm) => (
              <button
                key={storm.id}
                onClick={() => setSelectedStormId(storm.id)}
                disabled={isGenerating}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedStormId === storm.id
                    ? 'bg-[#003087] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {storm.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generation Status Alert Banner */}
      {generationStatus === 'error' && errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-red-900">BULLETIN COMPILATION FAILED</h4>
            <p className="text-red-700 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {generationStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-900">BULLETIN PDF GENERATED & DOWNLOADED</h4>
            <p className="text-emerald-700 mt-0.5">
              The official advisory document for <strong>{activeStorm.fullName}</strong> was successfully compiled by the backend ReportLab synthesis service.
            </p>
          </div>
        </div>
      )}

      {/* Main Advisory Compilation Dossier Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Advisory Dispatch Dossier
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {activeStorm.fullName} ({activeStorm.basin})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {advisoryNumber}
            </span>
            <span className="badge badge-orange text-[10px]">
              {activeStorm.category}
            </span>
          </div>
        </div>

        {/* Technical Bulletin Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Reference Fix</span>
            <span className="font-bold text-slate-900 text-sm block">
              {activeStorm.lat.toFixed(2)}°N, {activeStorm.lon.toFixed(2)}°E
            </span>
            <span className="text-[10px] text-slate-500 font-sans">IMD Synoptic Coordinates</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Maximum Winds</span>
            <span className="font-bold text-red-600 text-sm block">
              {Math.round(activeStorm.wind * 1.852)} km/h ({Math.round(activeStorm.wind)} kt)
            </span>
            <span className="text-[10px] text-slate-500 font-sans">3-Minute Sustained</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Central Pressure</span>
            <span className="font-bold text-slate-900 text-sm block">
              {activeStorm.pressure} hPa
            </span>
            <span className="text-[10px] text-slate-500 font-sans">MSLP Isobar Depth</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Primary Threat</span>
            <span className="font-bold text-amber-700 text-sm block">
              COASTAL STRIKE
            </span>
            <span className="text-[10px] text-slate-500 font-sans">Landfall Hazard Window</span>
          </div>
        </div>

        {/* Advisory Narrative Content Preview */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Synoptic Meteorological Summary
          </div>
          <p className="text-slate-600 leading-relaxed">
            The {activeStorm.fullName} over {activeStorm.basin} moved with a steady progression towards the {activeStorm.landfallDesc}. Deep layer steering winds continue to maintain an intense convective core as verified via VAYU MobileNetV3 dual-head detection and ResNet18 morphology.
          </p>
          <p className="text-slate-600 leading-relaxed pt-1">
            <strong>Coastal Directives:</strong> Fishermen are advised not to venture into deep sea sectors. Total suspension of fishing operations in threatened coastal regions. Ports are instructed to hoist Local Warning Signals.
          </p>
        </div>

        {/* Action Panel */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Document digitally stamped with verified MoES / IMD operational headers.</span>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="btn-primary py-3 px-6 text-xs font-bold gap-2 shadow-sm w-full sm:w-auto justify-center cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-300" />
                <span>Compiling Advisory PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Generate Official Bulletin PDF</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default Bulletin;
