import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, CheckCircle, AlertTriangle, 
  RefreshCw, ArrowRight, ChevronLeft,
  Sparkles, FileText, Edit3, Eye, Copy, Check, Printer
} from 'lucide-react';
import { downloadOfficialBulletinPdf } from '../services/api';
import { useAnalysisSession } from '../context/AnalysisSessionContext';
import { buildBulletinPromptContext } from '../services/cycloneContextSerializer';
import { generateBulletinNarrative } from '../services/puterAiService';
import PageHeader from '../components/PageHeader';

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
  const session = useAnalysisSession();
  const { currentInput, setStormPreset, setActiveStormPreset } = session;

  const [selectedStormId, setSelectedStormId] = useState(
    currentInput?.presetId === 'biparjoy-2023' ? 'BIPARJOY' : 'DANA'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('idle'); // 'idle' | 'generating' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  const [advisoryNumber, setAdvisoryNumber] = useState('VAYU-2024-ADV-08');

  // AI Bulletin Draft state
  const [aiDraftText, setAiDraftText] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftError, setDraftError] = useState(null);
  const [_draftSessionId, setDraftSessionId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const activeStorm = BENCHMARK_STORMS.find(s => s.id === selectedStormId) || BENCHMARK_STORMS[0];

  // Keep selected storm in sync when session preset changes externally
  useEffect(() => {
    if (currentInput?.presetId === 'biparjoy-2023' && selectedStormId !== 'BIPARJOY') {
      setSelectedStormId('BIPARJOY');
    } else if (currentInput?.presetId === 'dana-2024' && selectedStormId !== 'DANA') {
      setSelectedStormId('DANA');
    }
  }, [currentInput?.presetId]);

  const handleSelectStorm = (stormId) => {
    setSelectedStormId(stormId);
    const presetId = stormId === 'DANA' ? 'dana-2024' : 'biparjoy-2023';
    if (setStormPreset) {
      setStormPreset(presetId);
    } else if (setActiveStormPreset) {
      setActiveStormPreset(presetId);
    }
    // Strict session isolation: discard previous draft immediately on storm switch
    setAiDraftText('');
    setDraftSessionId(null);
    setIsEditing(false);
    setDraftError(null);
  };

  useEffect(() => {
    // Reset generation state on storm switch
    setGenerationStatus('idle');
    setErrorMsg(null);
    setAdvisoryNumber(`VAYU-${activeStorm.id === 'DANA' ? '2024' : '2023'}-ADV-${activeStorm.id === 'DANA' ? '08' : '14'}`);
  }, [selectedStormId]);

  // Session isolation: if external session changes, discard stale draft
  useEffect(() => {
    setAiDraftText('');
    setDraftSessionId(null);
    setIsEditing(false);
    setDraftError(null);
  }, [currentInput?.sessionId]);

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

  const handleGenerateAiDraft = async () => {
    setIsGeneratingDraft(true);
    setDraftError(null);

    const activeSessionId = currentInput?.sessionId || `session_${selectedStormId.toLowerCase()}`;

    try {
      const bulletinContext = buildBulletinPromptContext({
        ...session,
        name: activeStorm.fullName,
        basin: activeStorm.basin,
        lat: activeStorm.lat,
        lon: activeStorm.lon,
        current_wind: Math.round(activeStorm.wind * 1.852),
        current_mslp: activeStorm.pressure,
        observation_date: activeStorm.id === 'DANA' ? '2024-10-24' : '2023-06-12',
        presetId: activeStorm.id === 'DANA' ? 'dana-2024' : 'biparjoy-2023',
        sourceType: 'benchmark'
      });

      const response = await generateBulletinNarrative(bulletinContext);

      if (activeSessionId && currentInput?.sessionId && activeSessionId !== currentInput.sessionId) {
        console.warn(`[Bulletin] Discarding stale AI draft from session ${activeSessionId} (active: ${currentInput.sessionId})`);
        return;
      }

      if (response && response.success && response.text) {
        setAiDraftText(response.text);
        setDraftSessionId(activeSessionId);
      } else {
        setDraftError(response?.error || 'Unable to generate AI bulletin draft. Active telemetry required.');
      }
    } catch (err) {
      if (activeSessionId && currentInput?.sessionId && activeSessionId !== currentInput.sessionId) {
        return;
      }
      console.error('[AI Bulletin Draft Error]:', err);
      setDraftError(err?.message || 'Error occurred while communicating with AI analyst.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleCopyDraft = () => {
    if (!aiDraftText) return;
    navigator.clipboard.writeText(aiDraftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleDownloadDraftText = () => {
    if (!aiDraftText) return;
    const blob = new Blob([aiDraftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VAYU_AI_Bulletin_Draft_${activeStorm.id}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handlePrintDraft = () => {
    if (!aiDraftText) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>VAYU AI Bulletin Draft - ${activeStorm.fullName}</title>
          <style>
            body { font-family: monospace, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 12px; line-height: 1.6; padding: 24px; white-space: pre-wrap; color: #0f172a; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${aiDraftText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Standard Unified Header */}
      <PageHeader
        categoryBadge="REPORTS • OFFICIAL ADVISORY"
        categoryColor="slate"
        modelBadge="MoES / IMD Format"
        title="Official Cyclone Bulletin & Advisory"
        subtitle="Automated compilation and generation of standardized meteorological cyclone bulletins, danger directives, and high-fidelity PDF advisories."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Storm:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              {BENCHMARK_STORMS.map((storm) => {
                const isActive = selectedStormId === storm.id;
                return (
                  <button
                    key={storm.id}
                    onClick={() => handleSelectStorm(storm.id)}
                    disabled={isGenerating || isGeneratingDraft}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{storm.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        }
      />

      {/* Generation Status Alert Banner */}
      {generationStatus === 'error' && errorMsg && (
        <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-red-900 dark:text-red-300">BULLETIN COMPILATION FAILED</h4>
            <p className="text-red-700 dark:text-red-400 mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {generationStatus === 'success' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-start gap-3 animate-in fade-in duration-200">
          <CheckCircle className="w-5 h-5 text-slate-700 dark:text-slate-300 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white">BULLETIN PDF GENERATED & DOWNLOADED</h4>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">
              The official advisory document for <strong>{activeStorm.fullName}</strong> was successfully compiled by the backend ReportLab synthesis service.
            </p>
          </div>
        </div>
      )}

      {/* Main Advisory Compilation Dossier Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Advisory Dispatch Dossier
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
              {activeStorm.fullName} ({activeStorm.basin})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {advisoryNumber}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
              {activeStorm.category}
            </span>
          </div>
        </div>

        {/* Technical Bulletin Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Reference Fix</span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm block">
              {activeStorm.lat.toFixed(2)}°N, {activeStorm.lon.toFixed(2)}°E
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">IMD Synoptic Coordinates</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Maximum Winds</span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm block">
              {Math.round(activeStorm.wind * 1.852)} km/h ({Math.round(activeStorm.wind)} kt)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">3-Minute Sustained</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Central Pressure</span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm block">
              {activeStorm.pressure} hPa
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">MSLP Isobar Depth</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Primary Threat</span>
            <span className="font-semibold text-slate-900 dark:text-white text-sm block">
              COASTAL STRIKE
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Landfall Hazard Window</span>
          </div>
        </div>

        {/* Advisory Narrative Content Preview */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
            Synoptic Meteorological Summary
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            The {activeStorm.fullName} over {activeStorm.basin} moved with a steady progression towards the {activeStorm.landfallDesc}. Deep layer steering winds continue to maintain an intense convective core as verified via VAYU MobileNetV3 dual-head detection and ResNet18 morphology.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
            <strong>Coastal Directives:</strong> Fishermen are advised not to venture into deep sea sectors. Total suspension of fishing operations in threatened coastal regions. Ports are instructed to hoist Local Warning Signals.
          </p>
        </div>

        {/* Action Panel */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Command Overview</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/impact')}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Impact Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleGeneratePdf}
            disabled={isGenerating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
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

      {/* AI Analytical Bulletin Draft Section (Decision Support & Human Review) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                AI Cyclone Analysis Bulletin Draft
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Automated analytical synopsis synthesizing verified VAYU ML model outputs (MobileNetV3 center fix, ResNet18 Dvorak morphology, Trajectory-GRU kinematic milestones, and landfall strike probabilities).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              AI-GENERATED DRAFT — HUMAN REVIEW REQUIRED
            </span>
          </div>
        </div>

        {/* Error State */}
        {draftError && (
          <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-red-900 dark:text-red-300 block">AI Draft Generation Failed</span>
                <span className="text-red-700 dark:text-red-400">{draftError}</span>
              </div>
            </div>
            <button
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingDraft}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isGeneratingDraft && (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="relative">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Synthesizing Cyclone Analysis Bulletin...</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Querying VAYU ML telemetry, formatting key forecast milestones, verifying strike probabilities, and applying strict meteorological grounding.
              </p>
            </div>
          </div>
        )}

        {/* Empty State / Ready to Generate */}
        {!aiDraftText && !isGeneratingDraft && (
          <div className="py-8 px-6 bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  No Active AI Draft for {activeStorm.fullName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                Generate an analytical draft covering storm position, Dvorak morphology, key GRU track milestones (+6h, +12h, +24h, +48h, +72h), and coastal impact probabilities. The draft is fully editable before dispatch.
              </p>
            </div>

            <button
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingDraft}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Bulletin Draft</span>
            </button>
          </div>
        )}

        {/* Active Draft Review & Editor View */}
        {aiDraftText && !isGeneratingDraft && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    isEditing
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview Mode</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Draft</span>
                    </>
                  )}
                </button>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
                  {isEditing ? 'Editing active (changes persist in export)' : 'Viewing read-only formatted draft'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  title="Copy bulletin text to clipboard"
                >
                  {copiedDraft ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                      <span className="text-slate-900 dark:text-white font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadDraftText}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  title="Export draft as plain text (.txt)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export TXT</span>
                </button>

                <button
                  onClick={handlePrintDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  title="Print bulletin draft"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={handleGenerateAiDraft}
                  disabled={isGeneratingDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg font-medium transition-colors cursor-pointer shadow-xs"
                  title="Regenerate draft from active session"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            {/* Editor or Viewer Body */}
            {isEditing ? (
              <div className="space-y-1.5">
                <textarea
                  value={aiDraftText}
                  onChange={(e) => setAiDraftText(e.target.value)}
                  rows={20}
                  className="w-full p-4 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-slate-900 dark:focus:border-white rounded-xl leading-relaxed outline-none resize-y transition-all shadow-inner"
                  placeholder="Cyclone analysis bulletin draft..."
                />
                <p className="text-[11px] text-slate-400 italic">
                  Note: Meteorologists may adjust synoptic notes or formatting above. Edited content will be exported.
                </p>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-xl max-h-[500px] overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap shadow-inner select-text">
                {aiDraftText}
              </div>
            )}

            {/* Mandatory Operational Disclaimer Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold block uppercase tracking-wider text-[10px] text-slate-700 dark:text-slate-300">
                  Operational Disclaimer & Authority Boundary
                </span>
                This is an AI-generated analytical draft based on VAYU model outputs and is not an official meteorological warning, forecast, evacuation order, or statutory bulletin. Official warnings and public safety decisions should rely on the relevant authorized meteorological and disaster-management authorities.
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Bulletin;
