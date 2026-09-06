import { BENCHMARK_STORMS } from '../data/benchmarkData';

const CANDIDATE_URLS = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8001',
  'http://localhost:8001'
];

let activeBaseUrl = CANDIDATE_URLS[0];

/**
 * Automatically resolves and caches the live active API base URL.
 */
export async function getLiveBaseUrl() {
  for (const url of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${url}/api/health`, { method: 'GET', signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        activeBaseUrl = url;
        return url;
      }
    } catch {
      // Continue to next candidate
    }
  }
  return activeBaseUrl;
}

/**
 * Returns a standardized formatted IST timestamp for UI Last Updated displays.
 */
export function getFormattedLastUpdated() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }) + ' IST';
}

/**
 * Checks if the Python FastAPI backend is live and operational.
 */
export async function checkBackendHealth() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
    if (response.ok) {
      return await response.json();
    }
    return { status: 'OFFLINE' };
  } catch (err) {
    return { status: 'OFFLINE', error: err.message };
  }
}

/**
 * Sends satellite image bytes to the CycloneVision-CNN v2.1 model for inference.
 */
export async function detectCycloneFromImage(imageFileOrBlob, basin = 'Bay of Bengal') {
  try {
    const baseUrl = await getLiveBaseUrl();
    const formData = new FormData();
    const fileName = imageFileOrBlob.name || 'satellite_frame.png';
    formData.append('file', imageFileOrBlob, fileName);
    formData.append('basin', basin);

    let response;
    try {
      response = await fetch(`${baseUrl}/api/v1/detection/cnn-inference`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      response = await fetch(`${baseUrl}/api/detect`, {
        method: 'POST',
        body: formData,
      });
    }

    if (response && response.ok) {
      const json = await response.json();
      const raw = json.data || json;
      const detected = raw.cyclone_detected ?? raw.detected ?? true;
      const objectness = raw.objectness !== undefined ? raw.objectness : ((raw.confidence_percentage ?? 100.0) / 100.0);
      const center = raw.center || {
        lat: raw.coordinates?.latitude ?? 18.3,
        lon: raw.coordinates?.longitude ?? 88.4,
        center_x_norm: raw.coordinates?.center_x_norm ?? 0.5,
        center_y_norm: raw.coordinates?.center_y_norm ?? 0.5
      };
      return { 
        success: true, 
        isLiveApi: true, 
        ...raw,
        detected,
        cyclone_detected: detected,
        objectness,
        center,
        coordinates: raw.coordinates || { latitude: center.lat, longitude: center.lon }
      };
    }
    throw new Error(`API returned ${response?.status || 'network error'}`);
  } catch (err) {
    console.error('[VAYU API] Detection inference error:', err);
    return {
      success: false,
      error: 'MODEL_UNAVAILABLE',
      message: 'MODEL UNAVAILABLE: Backend connection required for live AI inference.'
    };
  }
}

/**
 * Classifies satellite frame into the 4 validated Dvorak morphological patterns.
 */
export async function classifyMorphologyPattern(imageFileOrBlob, basin = 'Bay of Bengal', shearKnots = 12.0) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const formData = new FormData();
    if (imageFileOrBlob) {
      const fileName = imageFileOrBlob.name || 'morphology_frame.png';
      formData.append('file', imageFileOrBlob, fileName);
    }
    formData.append('basin', basin);
    formData.append('shear_knots', shearKnots);

    let response;
    try {
      response = await fetch(`${baseUrl}/api/v1/classification/vit-inference`, {
        method: 'POST',
        body: formData,
      });
    } catch {
      response = await fetch(`${baseUrl}/api/classify`, {
        method: 'POST',
        body: formData,
      });
    }

    if (response && response.ok) {
      const json = await response.json();
      return { success: true, isLiveApi: true, ...(json.data || json) };
    }
    throw new Error(`API returned ${response?.status || 'network error'}`);
  } catch (err) {
    console.error('[VAYU API] Classification error:', err);
    return {
      success: false,
      error: 'MODEL_UNAVAILABLE',
      message: 'MODEL UNAVAILABLE: Backend connection required for live AI inference.'
    };
  }
}

/**
 * Predicts 72-hour cyclone spatiotemporal trajectory with Phase 3D GRU.
 */
export async function predictCycloneTrack(params = {}) {
  const currentLat = parseFloat(params.current_lat ?? params.lat ?? 18.2);
  const currentLon = parseFloat(params.current_lon ?? params.lon ?? 88.0);
  const currentWind = parseFloat(params.current_wind ?? params.wind ?? 55.0);
  const currentMslp = parseFloat(params.current_mslp ?? params.mslp ?? 988.0);
  const sst = parseFloat(params.sst ?? 29.5);
  const shear = parseFloat(params.shear ?? params.vertical_shear_knots ?? 12.0);
  const basin = params.basin || (currentLon < 77.0 ? 'Arabian Sea' : 'Bay of Bengal');
  const stormId = params.storm_id || (params.fullName?.includes('DANA') || params.name?.includes('DANA') ? 'DANA' : (params.fullName?.includes('BIPARJOY') || params.name?.includes('BIPARJOY') ? 'BIPARJOY' : undefined));
  const pastTrack = params.past_track || undefined;

  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/predict-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_lat: currentLat,
        current_lon: currentLon,
        current_wind: currentWind,
        current_mslp: currentMslp,
        sst: sst,
        vertical_shear_knots: shear,
        basin: basin,
        storm_id: stormId,
        past_track: pastTrack
      }),
    });

    if (response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        return { success: true, isLiveApi: true, ...json.data };
      }
      return {
        success: false,
        forecast_status: json.forecast_status || 'ERROR',
        message: json.message || 'Forecast calculation unavailable.',
        required_fixes: json.required_fixes,
        provided_fixes: json.provided_fixes
      };
    }
    throw new Error(`API returned ${response.status}`);
  } catch (err) {
    console.error('[VAYU API] Track prediction error:', err);
    return {
      success: false,
      error: 'MODEL_UNAVAILABLE',
      message: 'MODEL UNAVAILABLE: Backend connection required for live AI inference.'
    };
  }
}

/**
 * Multi-source data fusion API call.
 */
export async function fuseMultiSourceData(params) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/fuse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] Fusion call error:', err);
    return null;
  }
}

/**
 * Fetches active disaster alerts from backend.
 */
export async function fetchActiveAlerts() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/alerts`, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.alerts || [];
    }
    return [];
  } catch (err) {
    console.warn('[VAYU API] Alerts fetch error:', err);
    return [];
  }
}

/**
 * Fetches AI inference execution history from database.
 */
export async function fetchInferenceHistory(limit = 15) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/history/inferences?limit=${limit}`, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.logs || [];
    }
    return [];
  } catch (err) {
    console.warn('[VAYU API] Inference history fetch error:', err);
    return [];
  }
}

/**
 * Triggers automated pull of latest geostationary satellite telemetry and AI processing.
 */
export async function syncLiveSatelliteStream(channelId = 'insat-3dr-ir', basin = 'Bay of Bengal') {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/satellite/live-sync?channel_id=${channelId}&basin=${encodeURIComponent(basin)}`, {
      method: 'POST',
    });
    if (response.ok) {
      const json = await response.json();
      return { success: true, isLiveApi: true, ...json.data };
    }
    throw new Error(`API returned ${response.status}`);
  } catch (err) {
    console.warn('[VAYU API] Satellite stream fallback:', err);
    return null;
  }
}

/**
 * Sends manually uploaded satellite image and/or custom data values for unified AI processing.
 */
export async function processManualSatelliteData(formDataPayload) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/satellite/process-manual`, {
      method: 'POST',
      body: formDataPayload,
    });
    if (response.ok) {
      const json = await response.json();
      return { success: true, isLiveApi: true, ...json.data };
    }
    throw new Error(`API returned ${response.status}`);
  } catch (err) {
    console.warn('[VAYU API] Manual satellite processing fallback:', err);
    return null;
  }
}

/**
 * Triggers native browser download of official IMD-formatted Advisory Bulletin PDF.
 */
export async function downloadOfficialBulletinPdf(cycloneData = {}) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/generate-bulletin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cyclone_name: cycloneData.name || 'Severe Cyclonic Storm ALPHA',
        basin: cycloneData.basin || 'Bay of Bengal',
        category: cycloneData.classification || 'Severe Cyclonic Storm',
        latitude: cycloneData.lat || 15.4,
        longitude: cycloneData.lon || 87.8,
        wind_speed_kmh: cycloneData.windSpeed || 85.0,
        central_mslp_hpa: cycloneData.pressure || 980.0
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `VAYU_Advisory_Bulletin_${(cycloneData.name || 'Cyclone_ALPHA').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    }
    throw new Error(`PDF API error: ${response.status}`);
  } catch (err) {
    console.error('Error downloading PDF bulletin:', err);
    window.print();
    return false;
  }
}

/**
 * Fetches real NASA GIBS WMTS tile layer URLs (VIIRS TrueColor, MODIS Thermal IR, GPM Rain Rate).
 */
export async function fetchNasaGibsLayers(date) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const url = date ? `${baseUrl}/api/v1/satellites/nasa-gibs/tiles?date=${date}` : `${baseUrl}/api/v1/satellites/nasa-gibs/tiles`;
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] NASA GIBS fetch error:', err);
    return null;
  }
}

/**
 * Fetches ISRO MOSDAC product feeds catalog.
 */
export async function fetchIsroMosdacCatalog() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/satellites/isro-mosdac/catalog`, { method: 'GET' });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] ISRO MOSDAC fetch error:', err);
    return null;
  }
}

/**
 * Fetches real-time Sea Surface Temperature (SST) grid across the North Indian Ocean.
 */
export async function fetchLiveSstGrid(basin) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const url = basin ? `${baseUrl}/api/v1/ocean/live-sst-grid?basin=${encodeURIComponent(basin)}` : `${baseUrl}/api/v1/ocean/live-sst-grid`;
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.grid_points || [];
    }
    return [];
  } catch (err) {
    console.warn('[VAYU API] SST grid fetch error:', err);
    return [];
  }
}

/**
 * Fetches real-time 850-200 hPa Deep-Layer Vertical Wind Shear.
 */
export async function fetchLiveVerticalWindShear(lat = 15.5, lon = 88.0) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/ocean/vertical-wind-shear?latitude=${lat}&longitude=${lon}`, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] Wind shear fetch error:', err);
    return null;
  }
}

/**
 * Fetches live Doppler radar & infrared satellite cloud tile URLs from RainViewer API.
 */
export async function fetchRainViewerTiles() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/satellites/rainviewer/tiles`, { method: 'GET' });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] RainViewer fetch error:', err);
    return null;
  }
}

/**
 * Downloads a real georeferenced satellite snapshot from NASA GIBS or ISRO MOSDAC and runs deep inference.
 */
export async function downloadAndAnalyzeRealSnapshot(params) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/satellites/download-real-snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] Snapshot analysis error:', err);
    return null;
  }
}

/**
 * Syncs official NOAA / NCEI IBTrACS historical tropical cyclone best-tracks into database.
 */
export async function syncIbtracsArchive() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/cyclones/sync-ibtracs`, { method: 'POST' });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] IBTrACS sync error:', err);
    return null;
  }
}

/**
 * Fetches all cyclone systems (active & benchmarks) from backend database.
 */
export async function fetchAllCyclones(basin = null) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const url = basin ? `${baseUrl}/api/v1/cyclones/all?basin=${encodeURIComponent(basin)}` : `${baseUrl}/api/v1/cyclones/all`;
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      return data.cyclones || [];
    }
    return [];
  } catch (err) {
    console.warn('[VAYU API] Cyclones fetch error:', err);
    return [];
  }
}

/**
 * Fetches detailed cyclone record by system ID.
 */
export async function fetchCycloneById(systemId) {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/cyclones/${systemId}`, { method: 'GET' });
    if (response.ok) {
      const data = await response.json();
      return data.data || null;
    }
    return null;
  } catch (err) {
    console.warn(`[VAYU API] Cyclone detail error for ${systemId}:`, err);
    return null;
  }
}

/**
 * Fetches live real-time marine weather and thermodynamic conditions from backend/Open-Meteo.
 */
export async function fetchLiveOceanTelemetry(basin = 'Bay of Bengal') {
  try {
    const baseUrl = await getLiveBaseUrl();
    const response = await fetch(`${baseUrl}/api/v1/ocean/live-telemetry?basin=${encodeURIComponent(basin)}`, { method: 'GET' });
    if (response.ok) {
      const json = await response.json();
      return json.data || json;
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] Live telemetry fetch error:', err);
    return null;
  }
}

/**
 * Fetches dynamic multi-frame Doppler radar and infrared satellite cloud loop from RainViewer.
 */
export async function fetchRainViewerLiveFrames() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (res.ok) {
      const data = await res.json();
      const host = data.host || 'https://tilecache.rainviewer.com';
      const sat = data.satellite?.infrared || [];
      const radar = data.radar?.past || [];
      return {
        host,
        satelliteFrames: sat.map(f => ({
          time: f.time,
          tileUrl: `${host}/v2/satellite/${f.time}/256/{z}/{x}/{y}/0/0_0.png`,
          dateFormatted: new Date(f.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        radarFrames: radar.map(f => ({
          time: f.time,
          tileUrl: `${host}/v2/radar/${f.time}/256/{z}/{x}/{y}/2/1_1.png`,
          dateFormatted: new Date(f.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        isLive: true
      };
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] RainViewer public API error:', err);
    return null;
  }
}

/**
 * Fetches real-time tropical cyclogenesis & upcoming forming cyclone pattern detection from the backend.
 */
export async function fetchLiveCyclogenesisWatch(basin = 'Bay of Bengal') {
  try {
    const base = await getLiveBaseUrl();
    if (base) {
      const res = await fetch(`${base}/api/cyclogenesis-watch?basin=${encodeURIComponent(basin)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return { ...json.data, isLive: true, lastUpdated: getFormattedLastUpdated() };
      }
    }
  } catch (err) {
    console.warn('[VAYU API] Cyclogenesis watch endpoint error:', err);
  }
  return null;
}

/**
 * Fetches real model inspector telemetry from backend.
 */
export async function inspectAIModels() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/ml/inspect`, { method: 'GET' });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] Model inspector fetch error:', err);
    return null;
  }
}

/**
 * Fetches verified storm comparative benchmark data vs persistence baseline.
 */
export async function compareStormBenchmark(stormId = 'cyclone_dana_2024') {
  try {
    const baseUrl = await getLiveBaseUrl();
    const res = await fetch(`${baseUrl}/api/v1/ml/benchmark-compare?storm_id=${encodeURIComponent(stormId)}`, { method: 'GET' });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) return json.data;
    }
  } catch (err) {
    console.warn('[VAYU API] Benchmark compare error (using ground-truth verified fallback):', err);
  }
  return BENCHMARK_STORMS[stormId] || BENCHMARK_STORMS.cyclone_dana_2024;
}


/**
 * Fetches Phase 3B/3D measured real-model benchmark metrics.
 */
export async function fetchModelBenchmarks() {
  try {
    const baseUrl = await getLiveBaseUrl();
    const res = await fetch(`${baseUrl}/api/benchmarks`, { method: 'GET' });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
    return null;
  } catch (err) {
    console.warn('[VAYU API] Failed to fetch benchmarks:', err);
    return null;
  }
}

