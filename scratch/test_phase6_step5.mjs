import { 
  buildCyclonePromptContext, 
  buildAiActionContext,
  buildBulletinPromptContext
} from '/Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My Drive/Tahoe/Documents/ai-cyclone/frontend/src/services/cycloneContextSerializer.js';
import { 
  generateBulletinNarrative,
  buildGroundingDirectives,
  formatCycloneContext
} from '/Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My Drive/Tahoe/Documents/ai-cyclone/frontend/src/services/puterAiService.js';
import assert from 'assert';

console.log('================================================================');
console.log('PHASE 6 — STEP 5: AI BULLETIN DRAFT TEST SUITE');
console.log('================================================================');

// 1. Mock Full Historical Session (Cyclone DANA 2024)
const danaFullSession = {
  currentInput: {
    sessionId: 'session_dana_2024',
    name: 'Cyclone DANA (2024)',
    basin: 'Bay of Bengal',
    date: '2024-10-24',
    observation_date: '2024-10-24',
    sourceType: 'benchmark',
    presetId: 'dana-2024'
  },
  detectionResult: {
    source: 'MobileNetV3-DualHead',
    cyclone_detected: true,
    objectness: 0.945,
    coordinates: { lat: 18.2, lon: 88.0 },
    eye_visible: true,
    is_georeferenced: true
  },
  classificationResult: {
    source: 'ResNet18-Dvorak',
    primary_class: 'Curved Band Pattern',
    dvorak_t_number: 'T4.5',
    confidence_percentage: 88.5,
    pattern_probabilities: {
      'Curved Band Pattern': 0.885,
      'Central Dense Overcast': 0.082
    },
    peak_sustained_wind_kmh: 120.0,
    lowest_mslp_hpa: 982.0
  },
  trajectoryResult: {
    source: 'Trajectory-GRU-Seq2Seq',
    forecast_status: 'OPERATIONAL',
    mc_dropout_samples: 25,
    uncertainty_envelope_km: 45.0,
    trajectory_forecast: [
      { hours: 0, step: 'NOW', lat: 18.2, lon: 88.0, wind: 65, pressure: 982, uncertainty_radius_km: 15.0 },
      { hours: 6, step: '+6h', lat: 18.7, lon: 87.8, wind: 67, pressure: 981, uncertainty_radius_km: 20.0 },
      { hours: 12, step: '+12h', lat: 19.2, lon: 87.5, wind: 68, pressure: 980, uncertainty_radius_km: 25.0 },
      { hours: 24, step: '+24h', lat: 20.2, lon: 87.1, wind: 70, pressure: 978, uncertainty_radius_km: 35.0 },
      { hours: 48, step: '+48h', lat: 21.5, lon: 86.8, wind: 55, pressure: 988, uncertainty_radius_km: 55.0 },
      { hours: 72, step: '+72h', lat: 22.8, lon: 86.2, wind: 35, pressure: 1000, uncertainty_radius_km: 80.0 }
    ],
    landfall_prediction: {
      is_landfall: true,
      target_sector: 'Northern Odisha Coast between Dhamra and Bhitarkanika',
      landfall_window: '+22h to +26h',
      peak_wind_kmh: 125.0,
      surge_height_m: '2.0 - 2.5m',
      lat: 20.8,
      lon: 86.9
    },
    coastal_strike_probabilities: [
      { district: 'Bhadrak', state: 'Odisha', strike_prob_pct: 94.8, threat_level: 'CATASTROPHIC' },
      { district: 'Kendrapara', state: 'Odisha', strike_prob_pct: 87.2, threat_level: 'HIGH' }
    ]
  },
  environmentalResult: {
    sea_surface_temperature_c: 29.5,
    vertical_wind_shear_knots: 12.0,
    mid_level_relative_humidity_pct: 78.0,
    maximum_potential_intensity_kmh: 185.0,
    rapid_intensification: {
      is_probable: true,
      ri_probability_pct: 72.5
    }
  },
  windTelemetry: {
    lat: 18.2,
    lon: 88.0,
    wind_speed_kmh: 120.0,
    mslp_hpa: 982.0
  }
};

// TEST 1: Populated Bulletin Context
const ctx1 = buildBulletinPromptContext(danaFullSession);
assert.strictEqual(ctx1.action_focus, 'bulletin_draft', 'action_focus should be bulletin_draft');
assert.strictEqual(ctx1.storm_identification.name, 'Cyclone DANA (2024)');
assert.strictEqual(ctx1.storm_identification.is_historical, true);
assert.strictEqual(ctx1.storm_identification.observation_date, '2024-10-24');
assert.strictEqual(ctx1.current_observation.estimated_center.formatted, '18.2°N, 88°E');
assert.strictEqual(ctx1.classification.primary_pattern, 'Curved Band Pattern');
assert.strictEqual(ctx1.classification.dvorak_t_number, 'T4.5');
assert.ok(ctx1.trajectory.trajectory_milestones.length >= 5, 'Should contain key trajectory milestones');
assert.strictEqual(ctx1.trajectory.landfall_projection.is_landfall_projected, true);
assert.strictEqual(ctx1.trajectory.landfall_projection.coastal_strike_probabilities.length, 2);
assert.strictEqual(ctx1.environmental_conditions.sea_surface_temperature_c, 29.5);
console.log('✓ TEST 1 Passed: Populated bulletin context has all verified modules and focused fields.');

// TEST 2: Missing Classification
const sessionNoClass = { ...danaFullSession, classificationResult: null };
const ctx2 = buildBulletinPromptContext(sessionNoClass);
assert.strictEqual(ctx2.classification, null, 'Classification should be null');
assert.ok(ctx2.detection !== null, 'Detection should still be present');
assert.ok(ctx2.trajectory !== null, 'Trajectory should still be present');
console.log('✓ TEST 2 Passed: Missing classification handled gracefully without failure.');

// TEST 3: Missing Trajectory
const sessionNoTraj = { ...danaFullSession, trajectoryResult: null };
const ctx3 = buildBulletinPromptContext(sessionNoTraj);
assert.strictEqual(ctx3.trajectory, null, 'Trajectory should be null');
assert.ok(ctx3.classification !== null, 'Classification should still be present');
console.log('✓ TEST 3 Passed: Missing trajectory handled gracefully without fabricated milestones.');

// TEST 4: Missing Landfall Projection
const sessionNoLandfall = {
  ...danaFullSession,
  trajectoryResult: {
    ...danaFullSession.trajectoryResult,
    landfall_prediction: null,
    coastal_strike_probabilities: null
  }
};
const ctx4 = buildBulletinPromptContext(sessionNoLandfall);
assert.ok(ctx4.trajectory !== null, 'Trajectory exists');
assert.strictEqual(ctx4.trajectory.landfall_projection, null, 'Landfall projection should be null when missing');
console.log('✓ TEST 4 Passed: Missing landfall handled cleanly without false landfalls.');

// TEST 5: Missing Environmental Data
const sessionNoEnv = { ...danaFullSession, environmentalResult: null };
const ctx5 = buildBulletinPromptContext(sessionNoEnv);
assert.strictEqual(ctx5.environmental_conditions, null, 'Environmental conditions should be null');
console.log('✓ TEST 5 Passed: Missing environmental data is omitted and not fabricated.');

// TEST 6: Historical DANA Temporal Framing Directives
const directivesHistorical = buildGroundingDirectives(true, '2024-10-24', 'Cyclone DANA');
assert.ok(directivesHistorical.includes('HISTORICAL cyclone record'), 'Must declare historical cyclone record');
assert.ok(directivesHistorical.includes('DO NOT use present-tense live descriptions'), 'Must forbid present-tense live descriptions');
assert.ok(directivesHistorical.includes('2024-10-24'), 'Must include observation date 2024-10-24');
console.log('✓ TEST 6 Passed: Historical DANA temporal framing directives strictly enforced.');

// TEST 7: Live/Operational Temporal Framing Directives
const directivesLive = buildGroundingDirectives(false, null, 'Cyclone BIPARJOY');
assert.ok(directivesLive.includes('real-time operational observations'), 'Must declare real-time operational context');
assert.ok(!directivesLive.includes('HISTORICAL cyclone record'), 'Must not declare historical record for live');
console.log('✓ TEST 7 Passed: Live operational temporal framing properly applied.');

// TEST 8: Exact Numerical Value Preservation
assert.strictEqual(ctx1.current_observation.current_wind_speed_kmh, 120.0);
assert.strictEqual(ctx1.current_observation.current_central_pressure_hpa, 982.0);
assert.strictEqual(ctx1.classification.confidence_percentage, 88.5);
assert.strictEqual(ctx1.trajectory.mc_dropout_samples, 25);
assert.strictEqual(ctx1.trajectory.uncertainty_envelope_km.initial_radius_km, 15.0);
assert.strictEqual(ctx1.trajectory.uncertainty_envelope_km.horizon_24h_radius_km, 35.0);
assert.strictEqual(ctx1.trajectory.uncertainty_envelope_km.horizon_72h_radius_km, 80.0);
console.log('✓ TEST 8 Passed: Exact numerical values preserved 100% without rounding or drift.');

// TEST 9: Coastal Strike Probability Preservation
const strikes = ctx1.trajectory.landfall_projection.coastal_strike_probabilities;
assert.strictEqual(strikes[0].district, 'Bhadrak');
assert.strictEqual(strikes[0].strike_probability_pct, 94.8);
assert.strictEqual(strikes[0].threat_level, 'CATASTROPHIC');
assert.strictEqual(strikes[1].district, 'Kendrapara');
assert.strictEqual(strikes[1].strike_probability_pct, 87.2);
console.log('✓ TEST 9 Passed: Coastal strike probabilities preserved with exact district values.');

// TEST 10: No Fabricated Values
const sparseSession = {
  currentInput: {
    sessionId: 'session_sparse',
    name: 'Unspecified Cyclone',
    basin: 'Bay of Bengal'
  }
};
const ctxSparse = buildBulletinPromptContext(sparseSession);
assert.strictEqual(ctxSparse.current_observation.estimated_center, null);
assert.strictEqual(ctxSparse.current_observation.current_wind_speed_kmh, null);
assert.strictEqual(ctxSparse.current_observation.current_central_pressure_hpa, null);
assert.strictEqual(ctxSparse.detection, null);
assert.strictEqual(ctxSparse.classification, null);
assert.strictEqual(ctxSparse.trajectory, null);
assert.strictEqual(ctxSparse.environmental_conditions, null);
console.log('✓ TEST 10 Passed: No fabricated coordinates, winds, or pressures in sparse session.');

// TEST 11: Session Isolation (Switching Storms)
const biparjoySession = {
  currentInput: {
    sessionId: 'session_biparjoy_2023',
    name: 'Cyclone BIPARJOY (2023)',
    basin: 'Arabian Sea',
    date: '2023-06-12',
    observation_date: '2023-06-12',
    sourceType: 'benchmark',
    presetId: 'biparjoy-2023'
  },
  windTelemetry: {
    lat: 20.5,
    lon: 67.2,
    wind_speed_kmh: 140.0,
    mslp_hpa: 966.0
  }
};
const ctxBiparjoy = buildBulletinPromptContext(biparjoySession);
assert.strictEqual(ctxBiparjoy.storm_identification.name, 'Cyclone BIPARJOY (2023)');
assert.strictEqual(ctxBiparjoy.storm_identification.basin, 'Arabian Sea');
assert.strictEqual(ctxBiparjoy.current_observation.estimated_center.formatted, '20.5°N, 67.2°E');
assert.strictEqual(ctxBiparjoy.current_observation.current_wind_speed_kmh, 140.0);
assert.strictEqual(ctxBiparjoy.current_observation.current_central_pressure_hpa, 966.0);
// Ensure DANA coordinates or name are not present
assert.notStrictEqual(ctxBiparjoy.current_observation.estimated_center.formatted, '18.2°N, 88°E');
console.log('✓ TEST 11 Passed: Session isolation prevents leakage between different storms.');

// TEST 12: Empty Session Handling in generateBulletinNarrative
const emptyResult = await generateBulletinNarrative({});
assert.strictEqual(emptyResult.success, true);
assert.ok(emptyResult.text.includes('Data unavailable in current session'), 'Must return unavailable notice');
console.log('✓ TEST 12 Passed: Empty session returns explicit data unavailable message.');

// TEST 13: Operational Grounding and Context Formatting
const formatted = formatCycloneContext(ctx1);
assert.ok(formatted.includes('[SYSTEM IDENTIFICATION]'), 'Formatted context exists');
assert.ok(formatted.includes('• Storm Name: Cyclone DANA (2024)'), 'Storm name present');
assert.ok(formatted.includes('• Dataset Observation Date: 2024-10-24'), 'Observation date present');
assert.ok(formatted.includes('HISTORICAL BENCHMARK DATASET'), 'Analysis mode historical present');
assert.ok(formatted.includes('Bhadrak (Odisha): 94.8% Strike Probability'), 'Coastal strike formatted');
console.log('✓ TEST 13 Passed: Context formatting produces clean synoptic dossier for AI.');

console.log('================================================================');
console.log('ALL 13 PHASE 6 STEP 5 TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
