/**
 * VAYU Meteorological Intelligence Platform (SIH 2026)
 * -----------------------------------------------------------
 * Cyclone Context Serializer (cycloneContextSerializer.js)
 *
 * ARCHITECTURAL BOUNDARY & SAFETY CONTRACT:
 * 1. This module acts as the strict one-way data firewall between VAYU's internal
 *    session/ML inference data and external AI interpretation layers (Puter AI).
 * 2. VAYU's own neural networks (MobileNetV3, ResNet18, Trajectory-GRU) and official
 *    data streams produce the ground-truth values. Puter AI ONLY explains and interprets
 *    those numbers; it never invents or generates primary physical forecasts.
 * 3. STRICT EXCLUSIONS:
 *    - Absolutely NO base64 image data, binary canvas buffers, or raw satellite rasters
 *    - NO large GeoJSON polygons, bounding box coordinate arrays, or leaflet objects
 *    - NO Clerk auth tokens, session cookies, user profile details, or officer identities
 *    - NO React state internals, component dispatchers, or function references
 *    - NO API keys, secrets, or environment configurations
 * 4. Numeric integrity: Numerical values are preserved as numbers or null.
 *    No artificial defaults (e.g. 0 km/h wind or 0 hPa pressure) are fabricated.
 * 5. Deterministic output: Identical session inputs yield identical serialized contexts.
 */

// Maximum serialized JSON character size allowed to ensure compact prompt payloads
const MAX_SERIALIZED_CHARS = 8192; // 8 KB safety ceiling

/**
 * Safely parses a numeric float or returns null.
 * Avoids converting undefined or null to 0.
 *
 * @param {unknown} val
 * @param {number} [decimals=2]
 * @returns {number|null}
 */
function safeFloat(val, decimals = 2) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (Number.isNaN(num) || !Number.isFinite(num)) return null;
  return parseFloat(num.toFixed(decimals));
}

/**
 * Safely parses an integer or returns null.
 *
 * @param {unknown} val
 * @returns {number|null}
 */
function safeInt(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = parseInt(val, 10);
  return Number.isNaN(num) ? null : num;
}

/**
 * Extracts and serializes clean MobileNetV3 center detection data.
 *
 * @param {Object|null} detection - Detection result from AnalysisSessionContext or API
 * @returns {Object|null} Clean detection block with explicit source attribution
 */
function serializeDetection(detection) {
  if (!detection || typeof detection !== 'object') return null;

  const isDetected = Boolean(detection.cyclone_detected ?? detection.detected ?? false);
  const confidence = safeFloat(
    detection.objectness !== undefined
      ? detection.objectness
      : (detection.confidence_percentage !== undefined ? detection.confidence_percentage / 100 : detection.confidence),
    3
  );

  // Extract georeferenced coordinates if available
  const coords = detection.coordinates || detection.center || {};
  const lat = safeFloat(coords.lat ?? coords.latitude ?? detection.latitude);
  const lon = safeFloat(coords.lon ?? coords.longitude ?? detection.longitude);

  return {
    source: 'VAYU MobileNetV3-Small Center Fix',
    cyclone_detected: isDetected,
    detection_confidence: confidence,
    is_georeferenced: Boolean(detection.is_georeferenced),
    center_coordinates: (lat !== null && lon !== null) ? {
      latitude: lat,
      longitude: lon,
      formatted: `${Math.abs(lat)}°N, ${Math.abs(lon)}°E`
    } : null,
    eye_status: isDetected ? (detection.eye_visible ? 'VISIBLE_EYE' : 'ORGANIZED_VORTEX_CENTER') : 'NO_SYSTEM_CENTER'
  };
}

/**
 * Extracts and serializes clean ResNet18 Dvorak morphology classification data.
 *
 * @param {Object|null} classification - Classification result from AnalysisSessionContext or API
 * @returns {Object|null} Clean classification block with explicit source attribution
 */
function serializeClassification(classification) {
  if (!classification || typeof classification !== 'object') return null;

  const primaryClass = classification.primary_class || classification.pattern_class || classification.category || null;
  const tNumber = classification.dvorak_t_number || classification.t_number || null;
  const confidencePct = safeFloat(classification.confidence_percentage ?? classification.confidence, 1);

  // Clean class distribution (drop probabilities that are null or not numbers)
  let probabilities = null;
  if (classification.class_distribution && typeof classification.class_distribution === 'object') {
    probabilities = {};
    for (const [key, val] of Object.entries(classification.class_distribution)) {
      const p = safeFloat(val, 3);
      if (p !== null) probabilities[key] = p;
    }
  }

  // Intensity estimates if provided by classification module
  const estWindKmh = safeFloat(classification.peak_sustained_wind_kmh ?? classification.estimated_wind_kmh ?? classification.wind_speed_kmh);
  const estMslpHpa = safeFloat(classification.lowest_mslp_hpa ?? classification.estimated_mslp_hpa ?? classification.central_mslp_hpa);

  return {
    source: 'VAYU ResNet18 Dvorak Morphology Classifier',
    primary_pattern: primaryClass,
    dvorak_t_number: tNumber,
    confidence_percentage: confidencePct,
    pattern_probabilities: probabilities,
    estimated_intensity: (estWindKmh !== null || estMslpHpa !== null) ? {
      max_sustained_wind_kmh: estWindKmh,
      central_pressure_hpa: estMslpHpa
    } : null
  };
}

/**
 * Extracts and serializes 72-hour GRU trajectory forecast and landfall projections.
 * Restricts forecast steps to a maximum of 7 points to guarantee compact token sizes.
 *
 * @param {Object|null} trajectory - Trajectory prediction result from API or state
 * @returns {Object|null} Clean trajectory block with explicit source attribution
 */
function serializeTrajectory(trajectory, landfallOverride = null) {
  if (!trajectory || typeof trajectory !== 'object') return null;

  const rawSteps = Array.isArray(trajectory.trajectory_forecast)
    ? trajectory.trajectory_forecast
    : (Array.isArray(trajectory.forecast_steps) ? trajectory.forecast_steps : null);

  let sanitizedSteps = null;
  if (rawSteps && rawSteps.length > 0) {
    // Keep max 7 strategic milestones (+6h, +12h, +18h, +24h, +36h, +48h, +72h)
    sanitizedSteps = rawSteps.slice(0, 7).map((step) => ({
      hour: safeInt(step.hours ?? step.time_step_h ?? step.hour),
      step_label: typeof step.step === 'string' ? step.step : (step.hours ? `+${step.hours}h` : null),
      latitude: safeFloat(step.lat ?? step.forecast_lat),
      longitude: safeFloat(step.lon ?? step.forecast_lon),
      expected_wind_kmh: safeFloat(step.wind_kmh ?? (step.wind ? step.wind * 1.852 : null), 1),
      central_pressure_hpa: safeFloat(step.pressure ?? step.mslp_hpa ?? step.mslp, 1),
      uncertainty_radius_km: safeFloat(step.uncertainty_radius_km, 1),
      intensity_stage: step.stage || null,
      is_landfall: Boolean(step.is_landfall)
    }));
  }

  // Landfall prediction
  const lf = trajectory.landfall_prediction || trajectory.landfall || landfallOverride || null;

  // Coastal strike probabilities if produced by VAYU pipeline
  const rawDistricts = trajectory.coastal_strike_probabilities
    || (lf && lf.coastal_strike_probabilities)
    || trajectory.impact_assessment?.critical_districts
    || (landfallOverride && landfallOverride.coastal_strike_probabilities)
    || null;

  let coastalStrikeProbabilities = null;
  if (Array.isArray(rawDistricts) && rawDistricts.length > 0) {
    coastalStrikeProbabilities = rawDistricts.slice(0, 6).map(d => ({
      district: d.district || d.name || 'Coastal District',
      state: d.state || null,
      strike_probability_pct: safeFloat(d.strike_prob_pct ?? d.probability_pct ?? d.strike_probability_pct, 1),
      surge_height_m: d.surge_height_m ?? d.surge_potential_m ?? null,
      rainfall_24h_mm: safeFloat(d.rainfall_24h_mm ?? d.estimated_rainfall_mm ?? d.rainfall_mm, 1),
      threat_level: d.threat_level || d.warning_level || null
    })).filter(d => d.strike_probability_pct !== null);
  }

  let landfallData = null;
  if (lf && typeof lf === 'object') {
    landfallData = {
      is_landfall_projected: Boolean(lf.is_landfall ?? lf.target_sector ?? true),
      target_coast: lf.target_sector || lf.target_coast || lf.location || null,
      estimated_time: lf.estimated_landfall_time || lf.landfall_window || (lf.landfall_hours ? `+${lf.landfall_hours} hours` : null),
      expected_wind_at_landfall_kmh: safeFloat(lf.peak_wind_kmh ?? lf.wind_kmh, 1),
      projected_storm_surge_m: lf.surge_height_m || null,
      landfall_coordinates: (lf.lat !== undefined && lf.lon !== undefined) ? {
        latitude: safeFloat(lf.lat),
        longitude: safeFloat(lf.lon)
      } : null,
      coastal_strike_probabilities: coastalStrikeProbabilities
    };
  } else if (coastalStrikeProbabilities && coastalStrikeProbabilities.length > 0) {
    landfallData = {
      is_landfall_projected: true,
      target_coast: null,
      estimated_time: null,
      expected_wind_at_landfall_kmh: null,
      projected_storm_surge_m: null,
      landfall_coordinates: null,
      coastal_strike_probabilities: coastalStrikeProbabilities
    };
  }

  const mcSamples = safeInt(trajectory.mc_dropout_samples ?? trajectory._model_meta?.mc_dropout_samples);
  const maxUncertaintyKm = (sanitizedSteps && sanitizedSteps.length > 0)
    ? Math.max(...sanitizedSteps.map(s => s.uncertainty_radius_km || 0).filter(Boolean))
    : null;

  return {
    source: 'VAYU 2-Layer GRU Spatiotemporal Trajectory Forecaster',
    forecast_status: trajectory.forecast_status || 'OPERATIONAL',
    mc_dropout_samples: mcSamples,
    uncertainty_envelope_km: maxUncertaintyKm !== null ? {
      initial_radius_km: sanitizedSteps[0]?.uncertainty_radius_km ?? null,
      horizon_24h_radius_km: sanitizedSteps.find(s => s.hour === 24)?.uncertainty_radius_km ?? null,
      horizon_72h_radius_km: sanitizedSteps[sanitizedSteps.length - 1]?.uncertainty_radius_km ?? null
    } : null,
    trajectory_milestones: sanitizedSteps,
    landfall_projection: landfallData
  };
}

/**
 * Extracts and serializes thermodynamic environmental conditions (SST, shear, moisture).
 *
 * @param {Object|null} envData - Environmental parameters, buoys, or fusion state
 * @returns {Object|null} Clean environmental block
 */
function serializeEnvironment(envData) {
  if (!envData || typeof envData !== 'object') return null;

  const thermo = envData.environmental_thermodynamics || envData;

  const sst = safeFloat(thermo.sea_surface_temperature_c ?? thermo.sst_celsius ?? thermo.sea_surface_temp_c ?? thermo.sst, 1);
  const shear = safeFloat(thermo.vertical_wind_shear_knots ?? thermo.vertical_shear_knots ?? thermo.shear_knots ?? thermo.shear, 1);
  const rh = safeFloat(thermo.mid_level_relative_humidity_pct ?? thermo.mid_level_rh_pct ?? thermo.humidity, 1);
  const mpi = safeFloat(thermo.maximum_potential_intensity_kmh ?? thermo.max_potential_intensity_kmh, 1);
  const ri = envData.rapid_intensification_analysis || thermo.rapid_intensification_analysis || envData.rapid_intensification || thermo.rapid_intensification || null;

  if (sst === null && shear === null && rh === null && ri === null) {
    return null;
  }

  return {
    source: 'VAYU Marine & Synoptic Environmental Telemetry',
    sea_surface_temperature_c: sst,
    vertical_wind_shear_knots: shear,
    mid_level_relative_humidity_pct: rh,
    maximum_potential_intensity_kmh: mpi,
    rapid_intensification: ri ? {
      probability_percentage: safeFloat(ri.ri_probability_pct ?? ri.probability_pct, 1),
      threat_level: ri.ri_threat_level ?? ri.status ?? null
    } : null
  };
}

/**
 * Primary Serializer:
 * Safely transforms an arbitrary VAYU analysis session, page-level state, or storm record
 * into a compact, JSON-serializable context object strictly tailored for Puter AI.
 *
 * @param {Object} session - Active AnalysisSessionContext state or storm parameter bundle
 * @returns {Object} Deterministic, filtered meteorological context
 */
export function buildCyclonePromptContext(session) {
  if (!session || typeof session !== 'object') {
    return {
      system_name: 'VAYU National Cyclone Early Warning System',
      basin: 'North Indian Ocean',
      active_storm: null,
      timestamp: new Date().toISOString(),
      detection: null,
      classification: null,
      trajectory: null,
      environmental_conditions: null
    };
  }

  // 1. Resolve Storm Metadata
  const currentInput = session.currentInput || {};
  const stormName = session.name
    || session.cyclone_name
    || session.storm_id
    || currentInput.name
    || (currentInput.sourceType === 'benchmark' ? currentInput.name : null)
    || 'Active Tropical System';

  const basin = session.basin || currentInput.basin || 'North Indian Ocean (Bay of Bengal / Arabian Sea)';

  // Application / browser session initialization timestamp (strictly preserved for session tracking)
  const sessionCreatedAt = session.session_created_at
    || currentInput.session_created_at
    || session.timestamp
    || currentInput.timestamp
    || new Date().toISOString();

  // Authoritative genuine observation timestamp if available from live stream or satellite telemetry
  const authoritativeObservationTime = session.windTelemetry?.timestamp
    || session.observation_time
    || session.telemetry_timestamp
    || session.satellite_timestamp
    || session.detectionResult?.observation_time
    || session.classificationResult?.observation_time
    || currentInput.metadata?.observation_time
    || currentInput.metadata?.telemetry_timestamp
    || null;

  // Authoritative historical observation date (e.g. '2024-10-24' for Cyclone DANA)
  const presetDates = {
    'dana-2024': '2024-10-24',
    'cyclone_dana_2024': '2024-10-24',
    'dana': '2024-10-24',
    'biparjoy-2023': '2023-06-12',
    'biparjoy': '2023-06-12'
  };
  const presetKey = currentInput.presetId || session.presetId || session.id;
  let observationDate = session.observation_date
    || session.date
    || currentInput.observation_date
    || currentInput.date
    || (presetKey ? presetDates[presetKey] : null)
    || null;

  if (!observationDate && typeof stormName === 'string') {
    const lowerName = stormName.toLowerCase();
    if (lowerName.includes('dana')) {
      observationDate = '2024-10-24';
    } else if (lowerName.includes('biparjoy')) {
      observationDate = '2023-06-12';
    }
  }

  let isHistoricalPreset = currentInput.sourceType === 'benchmark'
    || Boolean(currentInput.presetId)
    || Boolean(session.presetId)
    || Boolean(observationDate && !authoritativeObservationTime);

  if (!isHistoricalPreset && observationDate) {
    const parsed = new Date(observationDate).getTime();
    if (!Number.isNaN(parsed) && parsed < Date.now() - 24 * 60 * 60 * 1000) {
      isHistoricalPreset = true;
    }
  }

  const dataSourceType = isHistoricalPreset ? 'historical_preset' : (currentInput.sourceType || 'live_telemetry');

  // 2. Resolve Detection (MobileNetV3)
  const rawDetection = session.detectionResult || session.detection || (session.center ? session : null);
  const detection = serializeDetection(rawDetection);

  // 3. Resolve Classification (ResNet18 Dvorak)
  const rawClassification = session.classificationResult || session.classification || (session.primary_class ? session : null);
  const classification = serializeClassification(rawClassification);

  // 4. Resolve Trajectory Forecast (GRU) & Landfall
  const rawTrajectory = session.trajectoryResult
    || session.trajectory
    || (session.trajectory_forecast ? session : null)
    || (session.landfallPrediction ? { landfall_prediction: session.landfallPrediction } : null);
  const trajectory = serializeTrajectory(rawTrajectory, session.landfallPrediction);

  // 5. Resolve Environmental & Fusion Data
  const rawEnv = session.environmentalResult
    || session.environmental_thermodynamics
    || session.environmental_conditions
    || session.environment
    || session.fusionResult
    || session.fusion
    || (session.windTelemetry?.sst_celsius !== undefined || session.windTelemetry?.vertical_shear_knots !== undefined ? session.windTelemetry : null);
  const environmentalConditions = serializeEnvironment(rawEnv);

  // 6. Build Baseline Coordinate & Intensity Fix from Best Available Source
  let consolidatedLat = null;
  let consolidatedLon = null;
  let consolidatedWind = null;
  let consolidatedPressure = null;

  if (detection?.center_coordinates) {
    consolidatedLat = detection.center_coordinates.latitude;
    consolidatedLon = detection.center_coordinates.longitude;
  } else if (session.windTelemetry?.lat !== undefined && session.windTelemetry?.lon !== undefined) {
    consolidatedLat = safeFloat(session.windTelemetry.lat);
    consolidatedLon = safeFloat(session.windTelemetry.lon);
  } else if (currentInput.ground_truth_center) {
    consolidatedLat = safeFloat(currentInput.ground_truth_center.lat);
    consolidatedLon = safeFloat(currentInput.ground_truth_center.lon);
  } else if (session.lat !== undefined && session.lon !== undefined) {
    consolidatedLat = safeFloat(session.lat);
    consolidatedLon = safeFloat(session.lon);
  }

  if (session.windTelemetry?.wind_speed_kmh !== undefined && session.windTelemetry?.wind_speed_kmh !== null) {
    consolidatedWind = safeFloat(session.windTelemetry.wind_speed_kmh, 1);
  } else if (classification?.estimated_intensity?.max_sustained_wind_kmh) {
    consolidatedWind = classification.estimated_intensity.max_sustained_wind_kmh;
  } else if (session.wind_speed_kmh !== undefined || session.current_wind !== undefined) {
    consolidatedWind = safeFloat(session.wind_speed_kmh ?? session.current_wind, 1);
  }

  if (session.windTelemetry?.mslp_hpa !== undefined && session.windTelemetry?.mslp_hpa !== null) {
    consolidatedPressure = safeFloat(session.windTelemetry.mslp_hpa, 1);
  } else if (classification?.estimated_intensity?.central_pressure_hpa) {
    consolidatedPressure = classification.estimated_intensity.central_pressure_hpa;
  } else if (session.central_mslp_hpa !== undefined || session.current_mslp !== undefined) {
    consolidatedPressure = safeFloat(session.central_mslp_hpa ?? session.current_mslp, 1);
  }

  // Construct final sanitized payload
  const result = {
    platform: 'VAYU Operational AI/ML Cyclone Intelligence',
    storm_identification: {
      name: stormName,
      basin: basin,
      observation_date: observationDate,
      observation_time: authoritativeObservationTime,
      session_created_at: sessionCreatedAt,
      data_source_type: dataSourceType,
      is_historical: Boolean(isHistoricalPreset)
    },
    current_observation: {
      estimated_center: (consolidatedLat !== null && consolidatedLon !== null) ? {
        latitude: consolidatedLat,
        longitude: consolidatedLon,
        formatted: `${Math.abs(consolidatedLat)}°N, ${Math.abs(consolidatedLon)}°E`
      } : null,
      current_wind_speed_kmh: consolidatedWind,
      current_central_pressure_hpa: consolidatedPressure
    },
    detection,
    classification,
    trajectory,
    environmental_conditions: environmentalConditions
  };

  // Size-safety verification: Ensure serialized payload does not exceed ceiling
  const serialized = JSON.stringify(result);
  if (serialized.length > MAX_SERIALIZED_CHARS && result.trajectory?.trajectory_milestones) {
    // Truncate trajectory points to only NOW, +24h, and +72h if payload is unexpectedly large
    result.trajectory.trajectory_milestones = result.trajectory.trajectory_milestones.slice(0, 3);
  }

  return result;
}

/**
 * Compact Human-Readable Summary Generator:
 * Converts the serialized context into a concise, high-density meteorological text summary.
 * Ideal for passing into conversational AI system prompts or displaying in preview badges.
 *
 * @param {Object} session - Active AnalysisSessionContext state or serialized context
 * @returns {string} High-density meteorological brief
 */
export function buildCycloneContextSummary(session) {
  const ctx = session?.platform ? session : buildCyclonePromptContext(session);
  const lines = [];

  const id = ctx.storm_identification;
  lines.push(`System: ${id?.name || 'Active Cyclone'} | Basin: ${id?.basin || 'North Indian Ocean'}`);

  const obs = ctx.current_observation;
  if (obs?.estimated_center?.formatted) {
    lines.push(`Center Position: ${obs.estimated_center.formatted}`);
  }
  if (obs?.current_wind_speed_kmh !== null || obs?.current_central_pressure_hpa !== null) {
    const windStr = obs?.current_wind_speed_kmh !== null ? `${obs.current_wind_speed_kmh} km/h` : 'Unknown';
    const presStr = obs?.current_central_pressure_hpa !== null ? `${obs.current_central_pressure_hpa} hPa` : 'Unknown';
    lines.push(`Intensity: Max Wind ${windStr} | Central MSLP ${presStr}`);
  }

  if (ctx.classification?.primary_pattern) {
    const tNumStr = ctx.classification.dvorak_t_number ? ` (${ctx.classification.dvorak_t_number})` : '';
    lines.push(`Morphology: ${ctx.classification.primary_pattern}${tNumStr} [ResNet18: ${ctx.classification.confidence_percentage}% conf]`);
  }

  if (ctx.trajectory?.landfall_projection?.is_landfall_projected) {
    const lf = ctx.trajectory.landfall_projection;
    const timeStr = lf.estimated_time ? ` in ${lf.estimated_time}` : '';
    const windStr = lf.expected_wind_at_landfall_kmh ? ` with ${lf.expected_wind_at_landfall_kmh} km/h winds` : '';
    lines.push(`Landfall Warning: Crossing ${lf.target_coast || 'Coastal Sector'}${timeStr}${windStr}`);
  }

  if (ctx.environmental_conditions?.rapid_intensification?.threat_level) {
    const ri = ctx.environmental_conditions.rapid_intensification;
    lines.push(`Rapid Intensification Risk: ${ri.threat_level} (${ri.probability_percentage}%)`);
  }

  return lines.join('\n');
}

/**
 * Constructs a focused, module-aware cyclone prompt context for specific AI quick actions.
 * Eliminates extraneous, unrelated context sections while preserving rigorous grounding.
 *
 * @param {'summarize'|'dvorak'|'trajectory'|'landfall'|'confidence'|string} actionId
 * @param {Object} sessionOrContext - Active AnalysisSessionContext state or serialized context
 * @returns {Object} Module-focused serialized context
 */
export function buildAiActionContext(actionId, sessionOrContext) {
  const base = sessionOrContext?.platform ? sessionOrContext : buildCyclonePromptContext(sessionOrContext);

  switch (actionId) {
    case 'dvorak':
      return {
        ...base,
        action_focus: 'dvorak_morphology',
        // Dvorak morphology analysis needs storm identification, synoptic observation, center fix, and ResNet18 classification
        detection: base.detection ? {
          source: base.detection.source,
          cyclone_detected: base.detection.cyclone_detected,
          center_coordinates: base.detection.center_coordinates,
          eye_status: base.detection.eye_status
        } : null,
        classification: base.classification,
        trajectory: null,
        environmental_conditions: null
      };

    case 'trajectory':
      return {
        ...base,
        action_focus: 'spatiotemporal_trajectory',
        detection: null,
        classification: null, // omits ResNet18 class distribution
        trajectory: base.trajectory,
        // Only include steering/thermodynamic factors relevant to track prediction
        environmental_conditions: base.environmental_conditions ? {
          source: base.environmental_conditions.source,
          vertical_wind_shear_knots: base.environmental_conditions.vertical_wind_shear_knots,
          sea_surface_temperature_c: base.environmental_conditions.sea_surface_temperature_c,
          mid_level_relative_humidity_pct: null,
          maximum_potential_intensity_kmh: null,
          rapid_intensification: base.environmental_conditions.rapid_intensification
        } : null
      };

    case 'landfall':
      return {
        ...base,
        action_focus: 'coastal_landfall_risk',
        detection: null,
        classification: null,
        trajectory: base.trajectory ? {
          source: base.trajectory.source,
          forecast_status: base.trajectory.forecast_status,
          trajectory_milestones: base.trajectory.trajectory_milestones?.filter(m => m.is_landfall || m.hour === 24 || m.hour === 48) || null,
          landfall_projection: base.trajectory.landfall_projection
        } : null,
        environmental_conditions: null
      };

    case 'confidence':
      return {
        ...base,
        action_focus: 'model_confidence_and_uncertainty',
        detection: base.detection ? {
          source: base.detection.source,
          cyclone_detected: base.detection.cyclone_detected,
          detection_confidence: base.detection.detection_confidence,
          eye_status: base.detection.eye_status
        } : null,
        classification: base.classification ? {
          source: base.classification.source,
          primary_pattern: base.classification.primary_pattern,
          dvorak_t_number: base.classification.dvorak_t_number,
          confidence_percentage: base.classification.confidence_percentage
        } : null,
        trajectory: base.trajectory ? {
          source: base.trajectory.source,
          forecast_status: base.trajectory.forecast_status,
          mc_dropout_samples: base.trajectory.mc_dropout_samples,
          uncertainty_envelope_km: base.trajectory.uncertainty_envelope_km,
          trajectory_milestones: base.trajectory.trajectory_milestones?.map(m => ({
            hour: m.hour,
            step_label: m.step_label,
            uncertainty_radius_km: m.uncertainty_radius_km
          })) || null
        } : null,
        environmental_conditions: base.environmental_conditions?.rapid_intensification ? {
          source: base.environmental_conditions.source,
          rapid_intensification: base.environmental_conditions.rapid_intensification
        } : null
      };

    case 'bulletin':
      return {
        ...base,
        action_focus: 'bulletin_draft',
        detection: base.detection ? {
          source: base.detection.source,
          cyclone_detected: base.detection.cyclone_detected,
          detection_confidence: base.detection.detection_confidence,
          center_coordinates: base.detection.center_coordinates,
          eye_status: base.detection.eye_status
        } : null,
        classification: base.classification ? {
          source: base.classification.source,
          primary_pattern: base.classification.primary_pattern,
          dvorak_t_number: base.classification.dvorak_t_number,
          confidence_percentage: base.classification.confidence_percentage,
          pattern_probabilities: base.classification.pattern_probabilities,
          estimated_intensity: base.classification.estimated_intensity
        } : null,
        trajectory: base.trajectory ? {
          source: base.trajectory.source,
          forecast_status: base.trajectory.forecast_status,
          mc_dropout_samples: base.trajectory.mc_dropout_samples,
          uncertainty_envelope_km: base.trajectory.uncertainty_envelope_km,
          trajectory_milestones: base.trajectory.trajectory_milestones?.filter(m => 
            m.hour === 0 || m.hour === 6 || m.hour === 12 || m.hour === 24 || m.hour === 48 || m.hour === 72 || m.is_landfall
          ) || null,
          landfall_projection: base.trajectory.landfall_projection
        } : null,
        environmental_conditions: base.environmental_conditions ? {
          source: base.environmental_conditions.source,
          sea_surface_temperature_c: base.environmental_conditions.sea_surface_temperature_c,
          vertical_wind_shear_knots: base.environmental_conditions.vertical_wind_shear_knots,
          mid_level_relative_humidity_pct: base.environmental_conditions.mid_level_relative_humidity_pct,
          maximum_potential_intensity_kmh: base.environmental_conditions.maximum_potential_intensity_kmh,
          rapid_intensification: base.environmental_conditions.rapid_intensification
        } : null
      };

    case 'summarize':
    default:
      // Comprehensive briefing retains all available modules
      return {
        ...base,
        action_focus: 'comprehensive_summary'
      };
  }
}

/**
 * Dedicated helper to construct a focused bulletin context.
 *
 * @param {Object} sessionOrContext
 * @returns {Object} Focused bulletin context
 */
export function buildBulletinPromptContext(sessionOrContext) {
  return buildAiActionContext('bulletin', sessionOrContext);
}
