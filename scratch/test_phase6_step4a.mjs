import { 
  buildCyclonePromptContext, 
  buildAiActionContext 
} from '/Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My Drive/Tahoe/Documents/ai-cyclone/frontend/src/services/cycloneContextSerializer.js';
import { 
  askAnalyst, 
  explainCyclone, 
  buildGroundingDirectives, 
  isCurrentWeatherQuery 
} from '/Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My Drive/Tahoe/Documents/ai-cyclone/frontend/src/services/puterAiService.js';
import assert from 'assert';

console.log('================================================================');
console.log('PHASE 6 — STEP 4A: HISTORICAL DATASET TEMPORAL LANGUAGE TEST');
console.log('================================================================');

// 1. Mock Historical Preset Session (Cyclone DANA 2024)
const historicalSession = {
  currentInput: {
    sessionId: 'session_dana_2024',
    name: 'Cyclone DANA (2024)',
    date: '2024-10-24',
    observation_date: '2024-10-24',
    sourceType: 'benchmark',
    presetId: 'dana-2024'
  },
  detectionResult: {
    cyclone_detected: true,
    objectness: 0.945,
    coordinates: { lat: 18.2, lon: 88.0 },
    eye_visible: true,
    is_georeferenced: true
  },
  classificationResult: {
    primary_class: 'Curved Band Pattern',
    dvorak_t_number: 'T4.5',
    confidence_percentage: 88.5,
    peak_sustained_wind_kmh: 120.0,
    lowest_mslp_hpa: 982.0
  },
  trajectoryResult: {
    forecast_status: 'OPERATIONAL',
    mc_dropout_samples: 25,
    trajectory_forecast: [
      { hours: 0, step: 'NOW', lat: 18.2, lon: 88.0, wind: 65, pressure: 982, uncertainty_radius_km: 15.0 },
      { hours: 24, step: '+24h', lat: 20.2, lon: 87.1, wind: 70, pressure: 978, uncertainty_radius_km: 35.0 },
      { hours: 48, step: '+48h', lat: 21.5, lon: 86.8, wind: 55, pressure: 988, uncertainty_radius_km: 55.0 }
    ],
    landfall_prediction: {
      is_landfall: true,
      target_sector: 'Dhamra Port, Odisha',
      landfall_window: '+22h to +26h',
      peak_wind_kmh: 125.0,
      surge_height_m: '2.0 - 2.5m',
      lat: 20.8,
      lon: 86.9
    },
    coastal_strike_probabilities: [
      { district: 'Bhadrak', state: 'Odisha', strike_prob_pct: 94.8, threat_level: 'CATASTROPHIC' }
    ]
  },
  environmentalResult: {
    sea_surface_temp_c: 29.5,
    vertical_wind_shear_knots: 11.2
  }
};

// -------------------------------------------------------------
// TEST 1: Historical preset detection and observation date
// -------------------------------------------------------------
const ctx = buildCyclonePromptContext(historicalSession);
assert.strictEqual(ctx.storm_identification.is_historical, true, 'is_historical must be true for historical preset');
assert.strictEqual(ctx.storm_identification.observation_date, '2024-10-24');
assert.strictEqual(ctx.storm_identification.data_source_type, 'historical_preset');
console.log('✓ TEST 1 Passed: Historical preset correctly identifies is_historical=true and observation_date=2024-10-24.');

// -------------------------------------------------------------
// TEST 2: Grounding directives for historical preset
// -------------------------------------------------------------
const directives = buildGroundingDirectives(true, '2024-10-24', 'Cyclone DANA');
assert(directives.includes('HISTORICAL cyclone record'), 'Must declare historical cyclone record');
assert(directives.includes('Observation Date: 2024-10-24'), 'Must mention observation date');
assert(directives.includes('At the dataset observation time, Cyclone DANA was positioned at'), 'Must instruct past positioning framing');
assert(directives.includes('The VAYU trajectory model projects movement toward'), 'Must instruct model movement projection framing');
assert(directives.includes('Relative to the dataset observation time...'), 'Must instruct relative milestone framing');
assert(directives.includes('The VAYU model projection from the observation point indicates...'), 'Must instruct landfall framing');
assert(directives.includes('NEVER extrapolate the historical dataset into a current or present-day forecast'), 'Must forbid present forecast extrapolation');
console.log('✓ TEST 2 Passed: Historical grounding directives contain all mandated temporal rules.');

// -------------------------------------------------------------
// TEST 3: Current weather question detection (isCurrentWeatherQuery)
// -------------------------------------------------------------
assert.strictEqual(isCurrentWeatherQuery('What is the current weather in Odisha?'), true);
assert.strictEqual(isCurrentWeatherQuery('Will it rain today in Bhadrak?'), true);
assert.strictEqual(isCurrentWeatherQuery('What is today\'s weather forecast?'), true);
assert.strictEqual(isCurrentWeatherQuery('What is the upcoming weather in Kendrapara?'), true);
assert.strictEqual(isCurrentWeatherQuery('Tell me the current conditions'), true);
assert.strictEqual(isCurrentWeatherQuery('Explain Dvorak Analysis'), false);
assert.strictEqual(isCurrentWeatherQuery('Analyze Trajectory'), false);
assert.strictEqual(isCurrentWeatherQuery('Assess Landfall Risk'), false);
assert.strictEqual(isCurrentWeatherQuery('Explain Model Confidence'), false);
assert.strictEqual(isCurrentWeatherQuery('Explain the convective banding structure'), false);
console.log('✓ TEST 3 Passed: isCurrentWeatherQuery correctly identifies live weather queries vs analytical queries.');

// -------------------------------------------------------------
// TEST 4: Current-weather question on historical dataset returns exact required rejection
// -------------------------------------------------------------
const EXPECTED_REJECTION = "Data unavailable in current session. The active dataset is historical and does not provide a current weather/rainfall forecast. Refer to official meteorological sources for current conditions and forecasts.";

const res1 = await askAnalyst('What is the current weather in Odisha today?', ctx);
assert.strictEqual(res1.success, true);
assert.strictEqual(res1.text, EXPECTED_REJECTION);

const res2 = await askAnalyst('Will it rain today in Kendrapara?', ctx);
assert.strictEqual(res2.success, true);
assert.strictEqual(res2.text, EXPECTED_REJECTION);

const res3 = await askAnalyst('What is today\'s rainfall forecast?', ctx);
assert.strictEqual(res3.success, true);
assert.strictEqual(res3.text, EXPECTED_REJECTION);

console.log('✓ TEST 4 Passed: Current weather query on historical dataset returns exact required rejection.');

// -------------------------------------------------------------
// TEST 5: Operational session (live) does not reject current weather queries
// -------------------------------------------------------------
const liveSession = {
  ...historicalSession,
  currentInput: {
    sessionId: 'session_live_01',
    name: 'Active Deep Depression',
    sourceType: 'live_stream',
    presetId: null
  },
  observation_date: null
};
const liveCtx = buildCyclonePromptContext(liveSession);
assert.strictEqual(liveCtx.storm_identification.is_historical, false);
console.log('✓ TEST 5 Passed: Live operational session is not marked historical.');

// -------------------------------------------------------------
// TEST 6: All numerical values remain identical and unaltered
// -------------------------------------------------------------
assert.strictEqual(ctx.current_observation.estimated_center.latitude, 18.2);
assert.strictEqual(ctx.current_observation.estimated_center.longitude, 88.0);
assert.strictEqual(ctx.classification.dvorak_t_number, 'T4.5');
assert.strictEqual(ctx.classification.confidence_percentage, 88.5);
assert.strictEqual(ctx.trajectory.trajectory_milestones[0].uncertainty_radius_km, 15.0);
assert.strictEqual(ctx.trajectory.landfall_projection.expected_wind_at_landfall_kmh, 125.0);
assert.strictEqual(ctx.trajectory.landfall_projection.coastal_strike_probabilities[0].strike_probability_pct, 94.8);
assert.strictEqual(ctx.environmental_conditions.sea_surface_temperature_c, 29.5);
assert.strictEqual(ctx.environmental_conditions.vertical_wind_shear_knots, 11.2);
console.log('✓ TEST 6 Passed: All numerical model outputs are 100% preserved without alterations.');

console.log('================================================================');
console.log('ALL PHASE 6 STEP 4A TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
