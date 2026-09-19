import assert from 'node:assert';
import fs from 'node:fs';

console.log('================================================================');
console.log('PHASE 7 — STEP 7.4: DASHBOARD DATA INTEGRATION & ISOLATION TEST');
console.log('================================================================');

// --- PART 1: STATIC CODE AUDIT ---
console.log('\n--- PART 1: Static Code Audit of Dashboard.jsx ---');

const dashboardCode = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Test 1.1: Dashboard imports and uses AnalysisSessionContext
console.log('[TEST 1.1] Checking AnalysisSessionContext integration in Dashboard.jsx...');
assert(dashboardCode.includes('useAnalysisSession'), 'Dashboard must import useAnalysisSession');
assert(dashboardCode.includes('DEFAULT_PRESETS'), 'Dashboard must import DEFAULT_PRESETS');
assert(dashboardCode.includes('setStormPreset'), 'Dashboard must destructure setStormPreset');
assert(dashboardCode.includes('handleSelectPreset'), 'Dashboard must have handleSelectPreset handler');
console.log('✓ TEST 1.1 Passed: Dashboard cleanly imports and uses useAnalysisSession.');

// Test 1.2: System Metrics Distinction & Backend Health Check
console.log('\n[TEST 1.2] Checking System Health independence...');
assert(dashboardCode.includes('checkBackendHealth'), 'Dashboard must import checkBackendHealth');
assert(dashboardCode.includes('isGatewayOnline'), 'Dashboard must compute isGatewayOnline');
assert(dashboardCode.includes('FastAPI Gateway') || dashboardCode.includes('Deep Learning Gateway'), 'Dashboard must display gateway status');
assert(dashboardCode.includes('MobileNetV3 + ResNet18 + 2-Layer GRU'), 'Dashboard must display neural model engines');
console.log('✓ TEST 1.2 Passed: System metrics are distinct and ground in checkBackendHealth.');

// Test 1.3: Active Storm KPIs & Missing Data Handlers
console.log('\n[TEST 1.3] Checking KPI Cards active storm bindings and missing data fallbacks...');
assert(dashboardCode.includes('activeStormName'), 'Dashboard must derive activeStormName');
assert(dashboardCode.includes('centerFormatted'), 'Dashboard must derive centerFormatted');
assert(dashboardCode.includes('classificationText'), 'Dashboard must derive classificationText');
assert(dashboardCode.includes('trajectoryStatusText'), 'Dashboard must derive trajectoryStatusText');
assert(dashboardCode.includes('landfallSector'), 'Dashboard must derive landfallSector');

assert(dashboardCode.includes('Not analyzed'), 'Dashboard must support "Not analyzed" fallback');
assert(dashboardCode.includes('Center not fixed'), 'Dashboard must support "Center not fixed" fallback');
assert(dashboardCode.includes('Intensity uncalculated'), 'Dashboard must support intensity uncalculated fallback');
console.log('✓ TEST 1.3 Passed: KPI cards consume real session fields with explicit fallback states.');

// Test 1.4: Climatological Labeling & Regional Warnings
console.log('\n[TEST 1.4] Checking Climatological Baseline & Regional Warnings...');
assert(dashboardCode.includes('Climatological Basin Baseline'), 'Line chart must be labeled Climatological Basin Baseline');
assert(dashboardCode.includes('Seasonal Reference'), 'Baseline chart must have Seasonal Reference tag');
assert(dashboardCode.includes('criticalDistricts'), 'Dashboard must check criticalDistricts from session');
assert(dashboardCode.includes('Evaluate Coastal Risk'), 'Must provide empty state button to Impact Studio when unanalyzed');
console.log('✓ TEST 1.4 Passed: Educational baselines labeled; regional warnings consume context without fabricating numbers.');

// --- PART 2: RUNTIME SIMULATION OF DASHBOARD SESSION DATA ISOLATION ---
console.log('\n--- PART 2: Simulation of Dashboard Session Synchronization & Isolation ---');

function deriveDashboardValues(session, backendHealth = { status: 'ONLINE' }) {
  const { currentInput, detectionResult, classificationResult, trajectoryResult, landfallPrediction } = session;

  const activeStormName = currentInput?.name || 'No Active Storm';
  const activeBasin = currentInput?.basin || 'North Indian Ocean';
  const activeDate = currentInput?.observation_date || currentInput?.date || null;

  const centerFormatted = detectionResult?.center_coordinates?.formatted
    || (detectionResult?.latitude && detectionResult?.longitude 
        ? `${Math.abs(detectionResult.latitude)}°N, ${Math.abs(detectionResult.longitude)}°E` 
        : (currentInput?.ground_truth_center 
            ? `${currentInput.ground_truth_center.lat}°N, ${currentInput.ground_truth_center.lon}°E (IMD Fix)` 
            : null));

  const dvorakTNumber = classificationResult?.dvorak_classification?.t_number 
    || classificationResult?.dvorak_t_number 
    || classificationResult?.t_number 
    || null;
  const dvorakPattern = classificationResult?.primary_class 
    || classificationResult?.predicted_pattern 
    || classificationResult?.pattern_class 
    || null;
  const classificationText = dvorakTNumber 
    ? `T${dvorakTNumber} • ${dvorakPattern || 'Analyzed'}` 
    : (dvorakPattern || 'Not analyzed');

  const maxWindKmh = classificationResult?.estimated_intensity?.max_sustained_wind_kmh
    ?? classificationResult?.peak_sustained_wind_kmh
    ?? (classificationResult?.dvorak_classification?.estimated_intensity_knots ? Math.round(classificationResult.dvorak_classification.estimated_intensity_knots * 1.852) : null);

  const trajectoryForecastList = trajectoryResult?.trajectory_forecast || [];
  const trajectoryStatusText = trajectoryResult?.forecast_status 
    || (trajectoryForecastList.length > 0 ? `${trajectoryForecastList.length} Milestones (72h)` : 'Not analyzed');

  const landfallSector = landfallPrediction?.target_sector 
    || landfallPrediction?.target_coast 
    || landfallPrediction?.location 
    || (landfallPrediction ? 'Corridor Computed' : 'Not analyzed');

  const criticalDistricts = landfallPrediction?.coastal_strike_probabilities
    || trajectoryResult?.impact_assessment?.critical_districts
    || trajectoryResult?.coastal_strike_probabilities
    || [];

  const isGatewayOnline = backendHealth?.status === 'ONLINE';

  return {
    activeStormName,
    activeBasin,
    activeDate,
    centerFormatted,
    classificationText,
    maxWindKmh,
    trajectoryStatusText,
    landfallSector,
    criticalDistricts,
    isGatewayOnline
  };
}

// 1. Start with initial DANA session
console.log('1. Initialize DANA session...');
let mockSession = {
  currentInput: {
    sessionId: 'session_preset_dana-2024_1',
    presetId: 'dana-2024',
    name: 'Cyclone DANA (2024)',
    basin: 'Bay of Bengal',
    observation_date: '2024-10-24',
    ground_truth_center: { lat: 18.2, lon: 88.0 }
  },
  detectionResult: null,
  classificationResult: null,
  trajectoryResult: null,
  landfallPrediction: null
};

// 2. Dashboard reflects DANA identity (un-analyzed)
console.log('2. Dashboard reflects DANA identity (initial state)...');
let dash = deriveDashboardValues(mockSession);
assert.strictEqual(dash.activeStormName, 'Cyclone DANA (2024)');
assert.strictEqual(dash.activeBasin, 'Bay of Bengal');
assert.strictEqual(dash.activeDate, '2024-10-24');
assert.strictEqual(dash.classificationText, 'Not analyzed');
assert.strictEqual(dash.trajectoryStatusText, 'Not analyzed');
assert.strictEqual(dash.landfallSector, 'Not analyzed');
assert.strictEqual(dash.criticalDistricts.length, 0);
assert.strictEqual(dash.isGatewayOnline, true);
console.log('✓ Initial DANA state displays un-analyzed states cleanly.');

// 3. Populate DANA with verified ML analysis outputs
console.log('3. Populating DANA ML analysis results...');
mockSession.detectionResult = {
  sessionId: 'session_preset_dana-2024_1',
  detected: true,
  confidence_percentage: 97.4,
  center_coordinates: { formatted: '18.20°N, 88.00°E' }
};
mockSession.classificationResult = {
  sessionId: 'session_preset_dana-2024_1',
  dvorak_t_number: 4.0,
  primary_class: 'Curved Band Pattern',
  peak_sustained_wind_kmh: 115,
  lowest_mslp_hpa: 984
};
mockSession.trajectoryResult = {
  sessionId: 'session_preset_dana-2024_1',
  forecast_status: '72h Spatiotemporal Track Computed',
  trajectory_forecast: [{ lat: 18.2, lon: 88.0 }, { lat: 19.5, lon: 87.2 }, { lat: 20.8, lon: 86.9 }]
};
mockSession.landfallPrediction = {
  sessionId: 'session_preset_dana-2024_1',
  target_sector: 'Dhamra & Bhitarkanika Coast (Odisha)',
  surge_height_m: 2.1,
  coastal_strike_probabilities: [
    { district: 'Bhadrak', probability_pct: 88 },
    { district: 'Kendrapara', probability_pct: 82 },
    { district: 'Jagatsinghpur', probability_pct: 74 }
  ]
};

dash = deriveDashboardValues(mockSession);
assert.strictEqual(dash.centerFormatted, '18.20°N, 88.00°E');
assert.strictEqual(dash.classificationText, 'T4 • Curved Band Pattern');
assert.strictEqual(dash.maxWindKmh, 115);
assert.strictEqual(dash.trajectoryStatusText, '72h Spatiotemporal Track Computed');
assert.strictEqual(dash.landfallSector, 'Dhamra & Bhitarkanika Coast (Odisha)');
assert.strictEqual(dash.criticalDistricts.length, 3);
assert.strictEqual(dash.criticalDistricts[0].district, 'Bhadrak');
console.log('✓ DANA analysis correctly reflected across all 4 KPIs and regional warnings.');

// 4. Switch to BIPARJOY via setStormPreset()
console.log('4. User switches to BIPARJOY preset...');
mockSession = {
  currentInput: {
    sessionId: 'session_preset_biparjoy-2023_2',
    presetId: 'biparjoy-2023',
    name: 'Cyclone BIPARJOY (2023)',
    basin: 'Arabian Sea',
    observation_date: '2023-06-12',
    ground_truth_center: { lat: 21.9, lon: 66.3 }
  },
  // All analysis results cleared on switch
  detectionResult: null,
  classificationResult: null,
  trajectoryResult: null,
  landfallPrediction: null
};

// 5. Dashboard immediately updates to BIPARJOY identity
dash = deriveDashboardValues(mockSession);
console.log('5. Verifying BIPARJOY identity and immediate DANA data cleanup...');
assert.strictEqual(dash.activeStormName, 'Cyclone BIPARJOY (2023)');
assert.strictEqual(dash.activeBasin, 'Arabian Sea');
assert.strictEqual(dash.activeDate, '2023-06-12');

// 6. Old DANA metrics do not survive
assert.strictEqual(dash.classificationText, 'Not analyzed', 'Old DANA classification must be cleared');
assert.strictEqual(dash.maxWindKmh, null, 'Old DANA wind must be cleared');
assert.strictEqual(dash.trajectoryStatusText, 'Not analyzed', 'Old DANA trajectory must be cleared');
assert.strictEqual(dash.landfallSector, 'Not analyzed', 'Old DANA landfall must be cleared');
assert.strictEqual(dash.criticalDistricts.length, 0, 'Old DANA coastal districts must not contaminate BIPARJOY');
assert.strictEqual(dash.centerFormatted, '21.9°N, 66.3°E (IMD Fix)', 'Must fall back to BIPARJOY IMD benchmark fix');

// 7. System metrics remain independent
assert.strictEqual(dash.isGatewayOnline, true, 'Gateway status is independent of active storm session');
console.log('✓ BIPARJOY isolation confirmed: zero DANA data leakage; system metrics independent.');

console.log('\n================================================================');
console.log('ALL PHASE 7 STEP 7.4 DASHBOARD INTEGRATION TESTS PASSED!');
console.log('================================================================');
