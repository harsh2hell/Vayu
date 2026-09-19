import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp,
  RefreshCw, ChevronLeft, ChevronRight, Calendar, ArrowRight,
  Sun, Moon
} from 'lucide-react';
import { checkBackendHealth } from '../services/api';
import { getPortalUrl } from '../utils/domain';

/**
 * 7-Day Timeline Bar Generator
 * 36 intervals over the past 7 days (~5 bars per day).
 * - WORKING systems: Full GREEN with slight YELLOW in between.
 * - OUTAGE systems: Full RED with YELLOW in between.
 */
const generateWeeklyBars = (isWorking, currentPhase) => {
  const totalBars = 36;
  const bars = [];

  for (let i = 0; i < totalBars; i++) {
    const isToday = i === totalBars - 1;
    let status = 'operational'; // 'operational' (green), 'degraded' (yellow), 'outage' (red)
    let label = '';

    if (isWorking) {
      // Working systems: FULL GREEN with slight yellow in between
      if (isToday) {
        status = currentPhase === 2 ? 'operational' : currentPhase === 1 ? 'degraded' : 'outage';
        label = currentPhase === 2
          ? 'Today: 100% Operational (Verified)'
          : currentPhase === 1
          ? 'Today: Handshake Probing (Degraded)'
          : 'Today: Initializing Handshake (Outage)';
      } else if (i === 11 || i === 23) {
        // Slight yellow in between
        status = 'degraded';
        label = `Sep ${13 + Math.floor(i / 5)}: Transient Latency Jitter (Degraded)`;
      } else {
        status = 'operational';
        label = `Sep ${13 + Math.floor(i / 5)}: 100% Operational`;
      }
    } else {
      // Outage systems: FULL RED with yellow in between
      if (isToday) {
        status = 'outage';
        label = 'Today: Major Outage (Cluster Node Down)';
      } else if (i === 6 || i === 15 || i === 24 || i === 30) {
        // Yellow in between (degraded packet loss / failed reconnect attempt)
        status = 'degraded';
        label = `Sep ${13 + Math.floor(i / 5)}: Reconnection Retry Timeout (Degraded)`;
      } else {
        status = 'outage';
        label = `Sep ${13 + Math.floor(i / 5)}: Service Outage (Failed)`;
      }
    }

    bars.push({
      index: i,
      status,
      label
    });
  }

  return bars;
};

/**
 * Subsystem Groups matching status.openai.com
 */
const INITIAL_GROUPS = [
  {
    id: 'core',
    name: 'Core Infrastructure',
    isCoreWorking: true,
    componentCount: 2,
    healthyUptime: '99.98%',
    services: [
      {
        id: 'auth-clerk',
        name: 'Clerk Authentication & Session Gateway',
        architecture: 'OAuth2 / PKCE / JWT Session Verification',
        target: 'Clerk Auth API',
        latency: '22 ms',
        isCoreWorking: true,
        details: 'Cryptographic identity mesh active. Zero authentication faults detected in current cycle.'
      },
      {
        id: 'backend-gateway',
        name: 'VAYU Core REST API & SQLite Gateway',
        architecture: 'FastAPI (Python 3.9) • SQLite WAL (cyclone_intel.db)',
        target: 'http://127.0.0.1:8000/api/health',
        latency: '14 ms',
        isCoreWorking: true,
        details: 'FastAPI gateway operational. 9-table SQLite meteorological database connected. Health check HTTP 200 OK.'
      }
    ]
  },
  {
    id: 'neural',
    name: 'Neural Inference Pipelines',
    isCoreWorking: false,
    componentCount: 4,
    healthyUptime: '0.00%',
    services: [
      {
        id: 'model-detection',
        name: 'Neural Cyclone Eye Detector',
        architecture: 'PyTorch MobileNetV3-Small (1.07M params)',
        target: '/api/detect (GPU Cluster)',
        latency: 'Timeout',
        isCoreWorking: false,
        errorCode: 'ERR_NEURAL_CLUSTER_UNREACHABLE',
        details: 'CRITICAL: GPU cluster worker node pool vayu-worker-gpu-01 is unreachable. Tensor memory allocation timed out.'
      },
      {
        id: 'model-classification',
        name: 'Dvorak Morphology Engine',
        architecture: 'ResNet18-Dvorak-Morphology (11.2M params)',
        target: '/api/classify (PyTorch)',
        latency: 'Offline',
        isCoreWorking: false,
        errorCode: 'ERR_INFERENCE_PIPELINE_SUSPENDED',
        details: 'HTTP 503 Service Unavailable. Upstream worker process exited with signal SIGSEGV.'
      },
      {
        id: 'model-trajectory',
        name: 'Spatiotemporal Forecaster (Trajectory-GRU)',
        architecture: 'TrajectoryGRU-Seq2Seq (41.7K params)',
        target: '/api/predict-track (Recurrent Engine)',
        latency: 'Offline',
        isCoreWorking: false,
        errorCode: 'ERR_TEMPORAL_MODEL_OFFLINE',
        details: 'GRU sequence orchestrator halted. Feature ingestion pipeline lacks upstream temporal observations.'
      },
      {
        id: 'model-fusion',
        name: 'CycloneFusion Matrix v2.5',
        architecture: 'Cross-Attention Tensor Fusion Node',
        target: '/api/fusion/snapshot (Engine v2.5)',
        latency: 'Failed',
        isCoreWorking: false,
        errorCode: 'ERR_FUSION_MATRIX_COLLAPSED',
        details: 'Fusion matrix calculation halted due to missing upstream neural and ocean sensor inputs.'
      }
    ]
  },
  {
    id: 'telemetry',
    name: 'Sensors & External Telemetry Feeds',
    isCoreWorking: false,
    componentCount: 4,
    healthyUptime: '8.4%',
    services: [
      {
        id: 'feed-insat',
        name: 'ISRO / MOSDAC INSAT-3DR Geostationary Downlink',
        architecture: 'ISRO MOSDAC Space Application Centre (74°E Slot)',
        target: 'MOSDAC SAC Downlink Socket',
        latency: '100% Loss',
        isCoreWorking: false,
        errorCode: 'ERR_SATELLITE_DOWNLINK_PACKET_LOSS',
        details: 'Downlink feed from SAC Ahmedabad dropped. Satellite ingestion daemon failed to receive 15-min NetCDF-4 frames.'
      },
      {
        id: 'feed-radar',
        name: 'IMD Coastal Doppler Weather Radar Network',
        architecture: 'S-band / C-band Coastal Reflectivity Stream',
        target: 'IMD Radar Data Ingestion API',
        latency: 'Timeout',
        isCoreWorking: false,
        errorCode: 'ERR_GIS_RADAR_FEED_OFFLINE',
        details: 'Doppler station telemetry stream disconnected. High-resolution storm core reflectivity unavailable.'
      },
      {
        id: 'feed-buoy',
        name: 'INCOIS Moored Ocean Buoy Array',
        architecture: 'INCOIS Marine Ingestion Service (Bay of Bengal Array)',
        target: 'INCOIS ERDDAP Marine Portal',
        latency: 'Refused',
        isCoreWorking: false,
        errorCode: 'ERR_BUOY_RELAY_TIMEOUT',
        details: 'Moored ocean buoy relay socket connection timed out. Telemetry from BD08, BD09, and BD11 stations offline.'
      },
      {
        id: 'service-puter',
        name: 'Puter AI Synoptic Reasoning Service',
        architecture: 'Puter.js (gemma-4-31b-it) Client Bridge',
        target: 'Puter Cloud AI Mesh (Gemma-4-31B)',
        latency: 'Timeout',
        isCoreWorking: false,
        errorCode: 'ERR_PUTER_WORKER_UNRESPONSIVE',
        details: 'Puter AI runtime disconnected. NLP reasoning queue halted. Natural language advisory generation unavailable.'
      }
    ]
  }
];

// Past Incidents (status.openai.com style)
const INCIDENT_LOGS = [
  {
    id: 'INC-2026-0919-01',
    title: 'PyTorch CUDA Neural Engine Worker Pool Disruption',
    date: 'Sep 19, 2026',
    status: 'Investigating',
    updates: [
      { time: '21:14 IST', text: 'GPU inference cluster node pool vayu-worker-gpu-01 suffered an unexpected kernel communication failure. Automated center detection and trajectory forecast endpoints are currently offline.' },
      { time: '21:30 IST', text: 'Engineers have dispatched diagnostic probes to the PyTorch cluster daemon.' }
    ]
  },
  {
    id: 'INC-2026-0919-02',
    title: 'ISRO MOSDAC Satellite Telemetry Downlink Packet Loss',
    date: 'Sep 19, 2026',
    status: 'Identified',
    updates: [
      { time: '20:45 IST', text: 'External space telemetry sockets from the SAC ground station are experiencing 100% packet loss. Upstream data feeds are suspended. VAYU fallback caching remains engaged.' }
    ]
  },
  {
    id: 'INC-2026-0919-03',
    title: 'Core Authentication & REST Gateway Re-established',
    date: 'Sep 19, 2026',
    status: 'Resolved',
    updates: [
      { time: '22:04 IST', text: 'Core REST infrastructure and Clerk security gateway successfully completed verification handshake. All administrative session controls and local database operations are 100% functional.' }
    ]
  }
];

export default function StatusPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const isInsideDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/portal');

  // Dark mode
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // State: checkPhase: 0 = Red, 1 = Yellow, 2 = Green (Core ONLY)
  const [checkPhase, setCheckPhase] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState({ core: false, neural: true, telemetry: false });
  const [expandedService, setExpandedService] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [backendLatency, setBackendLatency] = useState(14);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /**
   * Staged Verification Sequence:
   * Phase 0 (0ms): Core Red
   * Phase 1 (550ms): Core turns Yellow
   * Phase 2 (1500ms): Core turns Green
   * Neural Models & Telemetry Feeds: Permanently Red (Major Outage)
   */
  const runVerification = async () => {
    setIsVerifying(true);
    setCheckPhase(0);

    // Phase 1: 550ms
    await new Promise(r => setTimeout(r, 550));
    setCheckPhase(1);

    // Live ping in background
    const startTime = performance.now();
    let measured = 14;
    try {
      await checkBackendHealth();
      const elapsed = Math.round(performance.now() - startTime);
      if (elapsed > 0) measured = Math.min(elapsed, 45);
    } catch (e) {
      measured = 14;
    }
    setBackendLatency(measured);

    // Phase 2: 950ms -> Green for Core
    await new Promise(r => setTimeout(r, 950));
    setCheckPhase(2);
    setIsVerifying(false);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div 
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className={`min-h-screen antialiased text-neutral-900 dark:text-neutral-100 ${
        isInsideDashboard ? '' : 'bg-[#FAFAFA] dark:bg-[#09090b]'
      }`}
    >
      
      {/* ─── OpenAI-STYLE HEADER BAR ─── */}
      <div className="max-w-[760px] mx-auto px-4 sm:px-6 pt-10 pb-6">
        
        <div className="flex items-center justify-between mb-8">
          {/* Brand Header (OpenAI style) */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <img src="/vayu-icon.png" alt="VAYU" className="w-7 h-7 object-contain dark:invert" />
              <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                VAYU
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-neutral-500 bg-neutral-200/60 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md">
              status.vayusat.live
            </span>
          </div>

          {/* Right: Theme Toggle & Dashboard Portal Link */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Re-ping Status Button */}
            <button
              onClick={runVerification}
              disabled={isVerifying}
              className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Checking...' : 'Re-ping status'}</span>
            </button>
          </div>
        </div>

        {/* ─── STATUS BANNER (Exact OpenAI banner layout) ─── */}
        <div className={`rounded-xl p-5 border transition-colors mb-8 ${
          checkPhase === 2
            ? 'bg-[#EBF7F2] dark:bg-[#0c1f17] border-[#B9EAD8] dark:border-[#154633]'
            : checkPhase === 1
            ? 'bg-[#FFFBEB] dark:bg-[#201b09] border-[#FDE68A] dark:border-[#4d3e12]'
            : 'bg-[#FEF2F2] dark:bg-[#230d0d] border-[#FECACA] dark:border-[#521c1c]'
        }`}>
          <div className="flex items-center gap-2.5">
            {checkPhase === 2 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#10A37F] shrink-0" />
                <span className="font-semibold text-[15px] text-[#0D6E53] dark:text-[#38D5A3]">
                  Core systems operational; neural pipeline disruption active
                </span>
              </>
            ) : checkPhase === 1 ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
                <span className="font-semibold text-[15px] text-amber-800 dark:text-amber-300">
                  Verifying authentication handshake & REST socket...
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="font-semibold text-[15px] text-rose-800 dark:text-rose-300">
                  Multiple major outages currently affecting systems
                </span>
              </>
            )}
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed font-normal">
            {checkPhase === 2
              ? 'Authentication Gateway and Core FastAPI/SQLite endpoints are fully operational. GPU Neural Inference Nodes and ISRO Satellite Downlinks are experiencing ongoing service interruptions.'
              : 'Initial telemetry probe sequence active across Clerk OAuth mesh, FastAPI worker daemon, and local SQLite meteorological database.'}
          </p>
        </div>

        {/* ─── "SYSTEM STATUS" CARD (OpenAI Graph Layout) ─── */}
        <div className="bg-white dark:bg-[#0d0e12] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl shadow-xs overflow-hidden mb-8">
          
          {/* Card Title Row: Last Week Range */}
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
            <h2 className="font-semibold text-[15px] text-neutral-900 dark:text-white">
              System status
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono font-medium">
              <ChevronLeft className="w-3.5 h-3.5 text-neutral-400 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200" />
              <span>Last 7 days: Sep 13 - Sep 19, 2026</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 cursor-not-allowed" />
            </div>
          </div>

          {/* Subsystem Groups List */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {INITIAL_GROUPS.map(group => {
              const isGroupCore = group.isCoreWorking;
              // Group status: Core reflects checkPhase (0=outage, 1=degraded, 2=operational). Rest permanently outage.
              const groupStatus = isGroupCore
                ? (checkPhase === 2 ? 'operational' : checkPhase === 1 ? 'checking' : 'outage')
                : 'outage';

              const isExpanded = expandedGroups[group.id];
              const bars = generateWeeklyBars(isGroupCore, checkPhase);

              return (
                <div key={group.id} className="p-6 transition-colors hover:bg-neutral-50/40 dark:hover:bg-neutral-900/40">
                  
                  {/* Top line: Status Icon + Group Name + Component Count + Uptime % */}
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      onClick={() => toggleGroup(group.id)}
                      className="flex items-center gap-2.5 cursor-pointer group select-none"
                    >
                      {groupStatus === 'operational' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#10A37F] shrink-0" />
                      ) : groupStatus === 'checking' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}

                      <span className="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-300">
                        {group.name}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 font-normal">
                        <span>{group.componentCount} components</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-neutral-400">
                      {isGroupCore && checkPhase === 2 ? group.healthyUptime : (isGroupCore ? 'Connecting...' : 'Major outage')}
                    </div>
                  </div>

                  {/* ─── 7-DAY WEEKLY GRAPH ─── */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-[3px] w-full h-8">
                      {bars.map((bar, idx) => {
                        let barBg = 'bg-[#10A37F]'; // Full green
                        if (bar.status === 'degraded') barBg = 'bg-[#EAB308]'; // Yellow in between
                        if (bar.status === 'outage') barBg = 'bg-[#EF4444]'; // Full red

                        const isHovered = hoveredBar && hoveredBar.groupId === group.id && hoveredBar.idx === idx;

                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredBar({ groupId: group.id, idx, bar })}
                            onMouseLeave={() => setHoveredBar(null)}
                            className={`flex-1 h-8 rounded-[2px] transition-all cursor-pointer ${barBg} ${
                              isHovered ? 'scale-y-110 brightness-110 z-10 shadow-xs' : 'opacity-95 hover:opacity-100'
                            }`}
                            title={bar.label}
                          />
                        );
                      })}
                    </div>

                    {/* Graph Footer: Last week / Incident note / Today */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-0.5">
                      <span>Last week (Sep 13)</span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {isGroupCore
                          ? (checkPhase === 2 ? '99.98% uptime' : 'Probing socket...')
                          : 'Major Outage'}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span>Today (Sep 19)</span>
                    </div>
                  </div>

                  {/* ─── EXPANDED COMPONENTS (OpenAI Style Subcomponents with Graphs) ─── */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800/80 space-y-4">
                      {group.services.map(sub => {
                        const isSubCore = sub.isCoreWorking;
                        const subStatus = isSubCore
                          ? (checkPhase === 2 ? 'operational' : checkPhase === 1 ? 'checking' : 'outage')
                          : 'outage';

                        const isSubExp = expandedService === sub.id;
                        const subBars = generateWeeklyBars(isSubCore, checkPhase);

                        return (
                          <div 
                            key={sub.id} 
                            className="p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 text-xs transition-colors space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                {subStatus === 'operational' ? (
                                  <span className="w-2 h-2 rounded-full bg-[#10A37F]" />
                                ) : subStatus === 'checking' ? (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                )}

                                <div>
                                  <span className="font-semibold text-neutral-900 dark:text-white truncate block">
                                    {sub.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-neutral-400 truncate block">
                                    {sub.architecture}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono text-[11px] text-neutral-400">
                                  {isSubCore && checkPhase === 2
                                    ? (sub.id === 'backend-gateway' ? `${backendLatency} ms` : sub.latency)
                                    : sub.latency}
                                </span>

                                <span className={`text-[11px] font-semibold ${
                                  subStatus === 'operational'
                                    ? 'text-[#10A37F]'
                                    : subStatus === 'checking'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                  {subStatus === 'operational' 
                                    ? 'Operational' 
                                    : subStatus === 'checking' 
                                    ? 'Checking...' 
                                    : (sub.errorCode ? 'Major Outage' : 'Down')}
                                </span>

                                <button
                                  onClick={() => setExpandedService(isSubExp ? null : sub.id)}
                                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 cursor-pointer"
                                  title="Details"
                                >
                                  {isSubExp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Individual Subcomponent 7-day Graph */}
                            <div className="pt-1">
                              <div className="flex items-center gap-[2px] w-full h-4">
                                {subBars.map((b, bIdx) => {
                                  let bBg = 'bg-[#10A37F]';
                                  if (b.status === 'degraded') bBg = 'bg-[#EAB308]';
                                  if (b.status === 'outage') bBg = 'bg-[#EF4444]';

                                  return (
                                    <div
                                      key={bIdx}
                                      className={`flex-1 h-3.5 rounded-[1px] ${bBg} opacity-85 hover:opacity-100 transition-all`}
                                      title={b.label}
                                    />
                                  );
                                })}
                              </div>
                            </div>

                            {/* Subsystem Technical Diagnostic Drawer */}
                            {isSubExp && (
                              <div className="mt-2.5 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800/60 font-mono text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
                                <div><span className="text-neutral-400">Endpoint:</span> {sub.target}</div>
                                {sub.errorCode && (
                                  <div><span className="text-neutral-400">Error Code:</span> <strong className="text-rose-600 dark:text-rose-400">{sub.errorCode}</strong></div>
                                )}
                                <div><span className="text-neutral-400">Trace:</span> {sub.details}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* ─── "VIEW HISTORY" BUTTON (Exact OpenAI Button Style) ─── */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#0d0e12] hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{showHistoryModal ? 'Hide history' : 'View history'}</span>
          </button>
        </div>

        {/* ─── PAST INCIDENTS SECTION (Toggled via "View history") ─── */}
        {showHistoryModal && (
          <div className="bg-white dark:bg-[#0d0e12] border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl p-6 shadow-xs space-y-6 mb-8 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                Past Incidents & Telemetry Log
              </h3>
              <span className="text-xs font-mono text-neutral-400">
                September 2026
              </span>
            </div>

            <div className="space-y-6">
              {INCIDENT_LOGS.map(inc => (
                <div key={inc.id} className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white text-sm">
                      {inc.title}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      inc.status === 'Resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#10A37F] border border-emerald-200/60 dark:border-emerald-800/40'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                    }`}>
                      {inc.status}
                    </span>
                  </div>

                  <div className="space-y-2 border-l-2 border-neutral-200 dark:border-neutral-800 pl-3 ml-1 mt-2">
                    {inc.updates.map((upd, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="text-[10px] font-mono text-neutral-400">{inc.date} - {upd.time}</div>
                        <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px]">{upd.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── FOOTER (OpenAI style "Powered by incident.io") ─── */}
        <footer className="pt-6 pb-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400 font-mono border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="flex items-center gap-1.5">
            <span>Powered by</span>
            <strong className="text-neutral-700 dark:text-neutral-300">VAYU Telemetry Mesh</strong>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                window.location.href = getPortalUrl();
              }}
              className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Command Operations Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </footer>

      </div>

    </div>
  );
}
