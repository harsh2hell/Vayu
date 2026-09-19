import { 
  buildCyclonePromptContext, 
  buildAiActionContext,
  buildCycloneContextSummary 
} from '/Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My Drive/Tahoe/Documents/ai-cyclone/frontend/src/services/cycloneContextSerializer.js';
import { askAnalyst, explainCyclone } from '/Users/harsh/Library/CloudStorage/GoogleDrive-harendrapratap5828@gmail.com/My Drive/Tahoe/Documents/ai-cyclone/frontend/src/services/puterAiService.js';
import assert from 'assert';

console.log('================================================================');
console.log('PHASE 6 — STEP 3B: MODULE-AWARE VAYU AI ACTIONS TEST SUITE');
console.log('================================================================');

// Baseline populated mock data
const mockDetection = {
  cyclone_detected: true,
  objectness: 0.942,
  coordinates: { lat: 18.2, lon: 88.0 },
  eye_visible: true,
  is_georeferenced: true
};

const mockClassification = {
  primary_class: 'Curved Band Pattern',
  dvorak_t_number: 'T4.5',
  confidence_percentage: 88.5,
  class_distribution: {
    'Curved Band': 0.885,
    'Eye Pattern': 0.080,
    'Sheared': 0.035
  },
  peak_sustained_wind_kmh: 120.0,
  lowest_mslp_hpa: 982.0
};

const mockTrajectory = {
  forecast_status: 'OPERATIONAL',
  mc_dropout_samples: 25,
  trajectory_forecast: [
    { hours: 0, step: 'NOW', lat: 18.2, lon: 88.0, wind: 65, pressure: 982, uncertainty_radius_km: 15.0, stage: 'Severe Cyclonic Storm' },
    { hours: 24, step: '+24h', lat: 20.2, lon: 87.1, wind: 70, pressure: 978, uncertainty_radius_km: 35.0, stage: 'Very Severe Cyclonic Storm' },
    { hours: 48, step: '+48h', lat: 21.5, lon: 86.8, wind: 55, pressure: 988, uncertainty_radius_km: 55.0, stage: 'Cyclonic Storm' }
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
    { district: 'Bhadrak', state: 'Odisha', strike_prob_pct: 94.8, surge_height_m: '2.5m', threat_level: 'CATASTROPHIC' },
    { district: 'Kendrapara', state: 'Odisha', strike_prob_pct: 91.2, surge_height_m: '2.0m', threat_level: 'CATASTROPHIC' },
    { district: 'Balasore', state: 'Odisha', strike_prob_pct: 88.5, surge_height_m: '1.8m', threat_level: 'CRITICAL' }
  ]
};

const mockEnvironment = {
  sea_surface_temp_c: 29.5,
  vertical_wind_shear_knots: 11.2,
  mid_level_relative_humidity_pct: 85.0,
  max_potential_intensity_kmh: 245.0,
  rapid_intensification_analysis: {
    ri_probability_pct: 22.0,
    ri_threat_level: 'MODERATE'
  }
};

const fullSession = {
  currentInput: {
    sessionId: 'session_dana_full',
    name: 'Cyclone DANA',
    date: '2024-10-24',
    observation_date: '2024-10-24',
    sourceType: 'benchmark',
    presetId: 'dana-2024'
  },
  detectionResult: mockDetection,
  classificationResult: mockClassification,
  trajectoryResult: mockTrajectory,
  landfallPrediction: mockTrajectory.landfall_prediction,
  environmentalResult: mockEnvironment
};

// -------------------------------------------------------------
// TEST 1: Dvorak action with classificationResult populated
// -------------------------------------------------------------
const dvorakCtx = buildAiActionContext('dvorak', fullSession);
assert.strictEqual(dvorakCtx.action_focus, 'dvorak_morphology');
assert.notStrictEqual(dvorakCtx.classification, null);
assert.strictEqual(dvorakCtx.classification.primary_pattern, 'Curved Band Pattern');
assert.strictEqual(dvorakCtx.classification.dvorak_t_number, 'T4.5');
assert.strictEqual(dvorakCtx.classification.confidence_percentage, 88.5);
assert.strictEqual(dvorakCtx.trajectory, null, 'Trajectory must be null in Dvorak action');
assert.strictEqual(dvorakCtx.environmental_conditions, null, 'Environment must be null in Dvorak action');
console.log('✓ TEST 1 Passed: Dvorak action with classificationResult populated correctly.');

// -------------------------------------------------------------
// TEST 2: Dvorak action with classificationResult null
// -------------------------------------------------------------
const dvorakNullSession = { ...fullSession, classificationResult: null };
const dvorakNullCtx = buildAiActionContext('dvorak', dvorakNullSession);
assert.strictEqual(dvorakNullCtx.classification, null);
const dvorakNullRes = await askAnalyst('Explain Dvorak Analysis', dvorakNullCtx);
assert.strictEqual(dvorakNullRes.success, true);
assert.strictEqual(dvorakNullRes.text, 'Data unavailable in current session.');
console.log('✓ TEST 2 Passed: Dvorak action with classificationResult null returns "Data unavailable in current session."');

// -------------------------------------------------------------
// TEST 3: Trajectory action with trajectoryResult populated
// -------------------------------------------------------------
const trajCtx = buildAiActionContext('trajectory', fullSession);
assert.strictEqual(trajCtx.action_focus, 'spatiotemporal_trajectory');
assert.notStrictEqual(trajCtx.trajectory, null);
assert.strictEqual(trajCtx.trajectory.trajectory_milestones.length, 3);
assert.strictEqual(trajCtx.trajectory.mc_dropout_samples, 25);
assert.strictEqual(trajCtx.classification, null, 'Classification class distribution must be null in Trajectory action');
assert.strictEqual(trajCtx.environmental_conditions.vertical_wind_shear_knots, 11.2, 'Steering shear preserved');
console.log('✓ TEST 3 Passed: Trajectory action with trajectoryResult populated correctly.');

// -------------------------------------------------------------
// TEST 4: Trajectory action with trajectoryResult null
// -------------------------------------------------------------
const trajNullSession = { ...fullSession, trajectoryResult: null, landfallPrediction: null };
const trajNullCtx = buildAiActionContext('trajectory', trajNullSession);
assert.strictEqual(trajNullCtx.trajectory, null);
const trajNullRes = await askAnalyst('Analyze Trajectory', trajNullCtx);
assert.strictEqual(trajNullRes.success, true);
assert.strictEqual(trajNullRes.text, 'Data unavailable in current session.');
console.log('✓ TEST 4 Passed: Trajectory action with trajectoryResult null returns "Data unavailable in current session."');

// -------------------------------------------------------------
// TEST 5: Landfall action with landfallPrediction populated
// -------------------------------------------------------------
const landfallCtx = buildAiActionContext('landfall', fullSession);
assert.strictEqual(landfallCtx.action_focus, 'coastal_landfall_risk');
assert.notStrictEqual(landfallCtx.trajectory?.landfall_projection, null);
assert.strictEqual(landfallCtx.trajectory.landfall_projection.target_coast, 'Dhamra Port, Odisha');
assert.strictEqual(landfallCtx.trajectory.landfall_projection.expected_wind_at_landfall_kmh, 125.0);
assert.strictEqual(landfallCtx.classification, null);
assert.strictEqual(landfallCtx.environmental_conditions, null);
console.log('✓ TEST 5 Passed: Landfall action with landfallPrediction populated correctly.');

// -------------------------------------------------------------
// TEST 6: Landfall action with landfallPrediction null
// -------------------------------------------------------------
const lfNullSession = { 
  ...fullSession, 
  trajectoryResult: { ...mockTrajectory, landfall_prediction: null, coastal_strike_probabilities: null },
  landfallPrediction: null 
};
const lfNullCtx = buildAiActionContext('landfall', lfNullSession);
const lfNullRes = await askAnalyst('Assess Landfall Risk', lfNullCtx);
assert.strictEqual(lfNullRes.success, true);
assert.strictEqual(lfNullRes.text, 'Data unavailable in current session.');
console.log('✓ TEST 6 Passed: Landfall action with landfallPrediction null returns "Data unavailable in current session."');

// -------------------------------------------------------------
// TEST 7: Landfall action with coastal strike probabilities populated
// -------------------------------------------------------------
assert.strictEqual(Array.isArray(landfallCtx.trajectory.landfall_projection.coastal_strike_probabilities), true);
assert.strictEqual(landfallCtx.trajectory.landfall_projection.coastal_strike_probabilities.length, 3);
assert.strictEqual(landfallCtx.trajectory.landfall_projection.coastal_strike_probabilities[0].district, 'Bhadrak');
assert.strictEqual(landfallCtx.trajectory.landfall_projection.coastal_strike_probabilities[0].strike_probability_pct, 94.8);
assert.strictEqual(landfallCtx.trajectory.landfall_projection.coastal_strike_probabilities[0].threat_level, 'CATASTROPHIC');
console.log('✓ TEST 7 Passed: Coastal strike probabilities serialized with intact original values.');

// -------------------------------------------------------------
// TEST 8: Landfall action without coastal strike probabilities
// -------------------------------------------------------------
const lfNoStrikesSession = {
  ...fullSession,
  trajectoryResult: {
    ...mockTrajectory,
    coastal_strike_probabilities: null
  }
};
const lfNoStrikesCtx = buildAiActionContext('landfall', lfNoStrikesSession);
assert.strictEqual(lfNoStrikesCtx.trajectory.landfall_projection.coastal_strike_probabilities, null);
assert.strictEqual(lfNoStrikesCtx.trajectory.landfall_projection.target_coast, 'Dhamra Port, Odisha');
console.log('✓ TEST 8 Passed: Landfall action without coastal strike probabilities handles absence cleanly.');

// -------------------------------------------------------------
// TEST 9: Model Confidence with detection + classification + GRU uncertainty
// -------------------------------------------------------------
const confCtx = buildAiActionContext('confidence', fullSession);
assert.strictEqual(confCtx.action_focus, 'model_confidence_and_uncertainty');
assert.strictEqual(confCtx.detection.detection_confidence, 0.942);
assert.strictEqual(confCtx.classification.confidence_percentage, 88.5);
assert.strictEqual(confCtx.trajectory.mc_dropout_samples, 25);
assert.strictEqual(confCtx.trajectory.uncertainty_envelope_km.initial_radius_km, 15.0);
assert.strictEqual(confCtx.trajectory.uncertainty_envelope_km.horizon_72h_radius_km, 55.0);
// Conf action must only contain uncertainty fields, not coordinate tracks
assert.strictEqual(confCtx.trajectory.trajectory_milestones[0].latitude, undefined);
assert.strictEqual(confCtx.trajectory.trajectory_milestones[0].uncertainty_radius_km, 15.0);
console.log('✓ TEST 9 Passed: Model Confidence includes detection, classification, and GRU uncertainty envelope.');

// -------------------------------------------------------------
// TEST 10: Model Confidence with only detection/classification (no GRU)
// -------------------------------------------------------------
const confPartialSession = {
  ...fullSession,
  trajectoryResult: null,
  landfallPrediction: null
};
const confPartialCtx = buildAiActionContext('confidence', confPartialSession);
assert.notStrictEqual(confPartialCtx.detection, null);
assert.notStrictEqual(confPartialCtx.classification, null);
assert.strictEqual(confPartialCtx.trajectory, null, 'Trajectory uncertainty should be null');
console.log('✓ TEST 10 Passed: Model Confidence handles missing GRU uncertainty gracefully.');

// -------------------------------------------------------------
// TEST 11: Verify unrelated context is not included in focused actions
// -------------------------------------------------------------
// Dvorak has no trajectory, no landfall, no environment
assert.strictEqual(dvorakCtx.trajectory, null);
assert.strictEqual(dvorakCtx.environmental_conditions, null);

// Trajectory has no classification class distribution
assert.strictEqual(trajCtx.classification, null);

// Landfall has no classification, no full milestone trajectory coords
assert.strictEqual(landfallCtx.classification, null);
assert.strictEqual(landfallCtx.environmental_conditions, null);
console.log('✓ TEST 11 Passed: Focused actions strictly isolate relevant modules and omit unrelated data.');

// -------------------------------------------------------------
// TEST 12: Verify Summary still receives complete context
// -------------------------------------------------------------
const summaryCtx = buildAiActionContext('summarize', fullSession);
assert.strictEqual(summaryCtx.action_focus, 'comprehensive_summary');
assert.notStrictEqual(summaryCtx.detection, null);
assert.notStrictEqual(summaryCtx.classification, null);
assert.notStrictEqual(summaryCtx.trajectory, null);
assert.notStrictEqual(summaryCtx.environmental_conditions, null);
assert.strictEqual(summaryCtx.trajectory.landfall_projection.target_coast, 'Dhamra Port, Odisha');
console.log('✓ TEST 12 Passed: Summary action retains full comprehensive multi-module context.');

// -------------------------------------------------------------
// TEST 13: Verify session isolation remains intact
// -------------------------------------------------------------
const sessionA = { ...fullSession, currentInput: { sessionId: 'A', name: 'Cyclone A' } };
const sessionB = { ...fullSession, currentInput: { sessionId: 'B', name: 'Cyclone B' } };
const ctxA = buildCyclonePromptContext(sessionA);
const ctxB = buildCyclonePromptContext(sessionB);
assert.strictEqual(ctxA.storm_identification.name, 'Cyclone A');
assert.strictEqual(ctxB.storm_identification.name, 'Cyclone B');
assert.notStrictEqual(ctxA.storm_identification.name, ctxB.storm_identification.name);
console.log('✓ TEST 13 Passed: Session isolation prevents cross-storm leakage.');

// -------------------------------------------------------------
// TEST 14: Verify no fabricated values are introduced
// -------------------------------------------------------------
const emptyNullSession = {
  currentInput: { sessionId: 'empty', name: 'Empty Storm' },
  detectionResult: null,
  classificationResult: null,
  trajectoryResult: null,
  landfallPrediction: null,
  environmentalResult: null,
  windTelemetry: null
};
const emptyCtx = buildCyclonePromptContext(emptyNullSession);
assert.strictEqual(emptyCtx.detection, null);
assert.strictEqual(emptyCtx.classification, null);
assert.strictEqual(emptyCtx.trajectory, null);
assert.strictEqual(emptyCtx.environmental_conditions, null);
assert.strictEqual(emptyCtx.current_observation.current_wind_speed_kmh, null, 'Wind must be null, not 0');
assert.strictEqual(emptyCtx.current_observation.current_central_pressure_hpa, null, 'Pressure must be null, not 0');
console.log('✓ TEST 14 Passed: No fabricated values (0 km/h or fake measurements) introduced.');

console.log('================================================================');
console.log('ALL 14 PHASE 6 STEP 3B TESTS PASSED SUCCESSFULLY!');
console.log('================================================================');
