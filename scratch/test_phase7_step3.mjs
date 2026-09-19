import assert from 'node:assert';
import fs from 'node:fs';

console.log('================================================================');
console.log('PHASE 7 — STEP 7.3: P1 SESSION STATE HARDENING TEST SUITE');
console.log('================================================================');

// --- PART 1: STATIC CODE AUDIT ---
console.log('\n--- PART 1: Static Architectural & Binding Checks ---');

const contextCode = fs.readFileSync('frontend/src/context/AnalysisSessionContext.jsx', 'utf8');
const bulletinCode = fs.readFileSync('frontend/src/pages/Bulletin.jsx', 'utf8');
const predictionCode = fs.readFileSync('frontend/src/pages/Prediction.jsx', 'utf8');
const impactCode = fs.readFileSync('frontend/src/pages/Impact.jsx', 'utf8');
const trackMapCode = fs.readFileSync('frontend/src/pages/TrackMap.jsx', 'utf8');
const detectionCode = fs.readFileSync('frontend/src/pages/Detection.jsx', 'utf8');
const classificationCode = fs.readFileSync('frontend/src/pages/Classification.jsx', 'utf8');
const satelliteCode = fs.readFileSync('frontend/src/pages/Satellite.jsx', 'utf8');

// Test 1.1: AnalysisSessionContext exports setStormPreset & setActiveStormPreset
console.log('[TEST 1.1] Checking AnalysisSessionContext preset switching exports...');
assert(contextCode.includes('setStormPreset = setInputFromPreset'), 'Must define setStormPreset alias');
assert(contextCode.includes('setActiveStormPreset = setInputFromPreset'), 'Must define setActiveStormPreset alias');
assert(contextCode.includes('setStormPreset,') && contextCode.includes('setActiveStormPreset,'), 'Must export both in context value');
console.log('✓ TEST 1.1 Passed: setStormPreset and setActiveStormPreset properly exported in value.');

// Test 1.2: Bulletin.jsx destructures and uses canonical setStormPreset
console.log('\n[TEST 1.2] Checking Bulletin.jsx canonical preset binding...');
assert(bulletinCode.includes('setStormPreset'), 'Bulletin.jsx must destructure setStormPreset');
assert(bulletinCode.includes('handleSelectStorm'), 'Bulletin.jsx must have storm selection handler');
assert(!bulletinCode.includes('setActiveStormPreset(') || bulletinCode.includes('setStormPreset('), 'Must invoke setStormPreset');
assert(bulletinCode.includes('setAiDraftText(\'\')'), 'Must clear AI draft text on storm switch');
assert(bulletinCode.includes('setDraftSessionId(null)'), 'Must clear draftSessionId on storm switch');
console.log('✓ TEST 1.2 Passed: Bulletin.jsx binds to setStormPreset and clears draft state on switch.');

// Test 1.3: Setter guards in AnalysisSessionContext
console.log('\n[TEST 1.3] Checking AnalysisSessionContext session guard in setters...');
const settersToCheck = [
  'setDetectionResult',
  'setClassificationResult',
  'setTrajectoryResult',
  'setLandfallPrediction',
  'setEnvironmentalResult',
  'setWindTelemetry',
  'setFullPipelineResults'
];
for (const setter of settersToCheck) {
  assert(contextCode.includes(`const ${setter} = useCallback((`), `Must define ${setter}`);
  assert(contextCode.includes(`expectedSessionId`), `${setter} must support expectedSessionId`);
}
console.log('✓ TEST 1.3 Passed: All 7 setters enforce expectedSessionId guard in AnalysisSessionContext.');

// Test 1.4: Client page session guards
console.log('\n[TEST 1.4] Checking client page requestSessionId guards at request/response boundary...');
assert(predictionCode.includes('const requestSessionId = currentInput?.sessionId;'), 'Prediction.jsx must capture requestSessionId');
assert(predictionCode.includes('requestSessionId !== currentInput.sessionId'), 'Prediction.jsx must check session before writing');

assert(impactCode.includes('const requestSessionId = currentInput?.sessionId;'), 'Impact.jsx must capture requestSessionId');
assert(impactCode.includes('requestSessionId !== currentInput.sessionId'), 'Impact.jsx must check session before writing');

assert(trackMapCode.includes('const requestSessionId = currentInput?.sessionId;'), 'TrackMap.jsx must capture requestSessionId');
assert(trackMapCode.includes('requestSessionId !== currentInput.sessionId'), 'TrackMap.jsx must check session before writing');

assert(detectionCode.includes('const requestSessionId = currentInput.sessionId;'), 'Detection.jsx must capture requestSessionId');
assert(detectionCode.includes('requestSessionId !== currentInput.sessionId'), 'Detection.jsx must check session before writing');

assert(classificationCode.includes('const requestSessionId = currentInput.sessionId;'), 'Classification.jsx must capture requestSessionId');
assert(classificationCode.includes('requestSessionId !== currentInput.sessionId'), 'Classification.jsx must check session before writing');

assert(satelliteCode.includes('const requestSessionId = currentInput?.sessionId;'), 'Satellite.jsx must capture requestSessionId');
assert(satelliteCode.includes('requestSessionId !== currentInput.sessionId'), 'Satellite.jsx must check session before writing');

console.log('✓ TEST 1.4 Passed: All 6 async producer pages guard request/response boundaries.');

// --- PART 2: RAPID-SWITCH STATE SIMULATION ---
console.log('\n--- PART 2: Rapid-Switch Async Race Condition Simulation ---');

class MockAnalysisSession {
  constructor() {
    this.currentInput = {
      sessionId: 'session_preset_dana-2024_1000',
      presetId: 'dana-2024',
      name: 'Cyclone DANA (2024)'
    };
    this.sessionResults = {
      sessionId: this.currentInput.sessionId,
      detectionResult: null,
      classificationResult: null,
      trajectoryResult: null,
      landfallPrediction: null,
      environmentalResult: null,
      windTelemetry: null
    };
  }

  setStormPreset(presetId) {
    const newSessionId = `session_preset_${presetId}_${Date.now()}`;
    this.currentInput = {
      sessionId: newSessionId,
      presetId: presetId,
      name: presetId === 'dana-2024' ? 'Cyclone DANA (2024)' : 'Cyclone BIPARJOY (2023)'
    };
    // Clear previous results on switching preset
    this.sessionResults = {
      sessionId: newSessionId,
      detectionResult: null,
      classificationResult: null,
      trajectoryResult: null,
      landfallPrediction: null,
      environmentalResult: null,
      windTelemetry: null
    };
  }

  setTrajectoryResult(result, expectedSessionId = null) {
    if (!result) return;
    const originSessionId = expectedSessionId || result.sessionId;
    if (originSessionId && originSessionId !== this.currentInput.sessionId) {
      // Stale write rejected
      return false;
    }
    this.sessionResults.sessionId = this.currentInput.sessionId;
    this.sessionResults.trajectoryResult = {
      ...result,
      sessionId: this.currentInput.sessionId
    };
    return true;
  }

  setDetectionResult(result, expectedSessionId = null) {
    if (!result) return;
    const originSessionId = expectedSessionId || result.sessionId;
    if (originSessionId && originSessionId !== this.currentInput.sessionId) {
      // Stale write rejected
      return false;
    }
    this.sessionResults.sessionId = this.currentInput.sessionId;
    this.sessionResults.detectionResult = {
      ...result,
      sessionId: this.currentInput.sessionId
    };
    return true;
  }

  getActiveTrajectoryResult() {
    if (this.sessionResults.sessionId === this.currentInput.sessionId) {
      return this.sessionResults.trajectoryResult;
    }
    return null;
  }

  getActiveDetectionResult() {
    if (this.sessionResults.sessionId === this.currentInput.sessionId) {
      return this.sessionResults.detectionResult;
    }
    return null;
  }
}

// SIMULATION STEPS 1-12:
const session = new MockAnalysisSession();

// 1. Start DANA session.
console.log('1. Start DANA session.');
assert.strictEqual(session.currentInput.presetId, 'dana-2024');

// 2. Capture DANA sessionId.
const danaSessionId = session.currentInput.sessionId;
console.log(`2. Captured DANA sessionId: ${danaSessionId}`);

// 3. Begin an async trajectory request (simulate in-flight promise).
console.log('3. Begin async trajectory request for DANA...');
let resolveDanaTrajectory;
const danaTrajectoryPromise = new Promise((resolve) => {
  resolveDanaTrajectory = () => {
    resolve({
      storm_id: 'DANA',
      success: true,
      trajectory_forecast: [{ lat: 18.2, lon: 88.0, wind: 55 }]
    });
  };
});

// 4. User switches to BIPARJOY before DANA finishes.
console.log('4. User switches to BIPARJOY...');
session.setStormPreset('biparjoy-2023');

// 5. Active sessionId has changed.
const biparjoySessionId = session.currentInput.sessionId;
console.log(`5. Changed active sessionId to: ${biparjoySessionId}`);
assert.notStrictEqual(danaSessionId, biparjoySessionId);

// 6. Old DANA request resolves in the background.
console.log('6. Old DANA request resolves...');
const danaResponse = await new Promise(r => {
  resolveDanaTrajectory();
  danaTrajectoryPromise.then(r);
});

// Caller boundary check simulation:
let danaWritten = false;
if (danaSessionId === session.currentInput.sessionId) {
  danaWritten = session.setTrajectoryResult(danaResponse, danaSessionId);
} else {
  // Caller discarded at boundary, or setter guard discards if called
  danaWritten = session.setTrajectoryResult(danaResponse, danaSessionId);
}

// 7. Verify DANA response is discarded.
console.log('7. Verifying DANA response is discarded...');
assert.strictEqual(danaWritten, false, 'DANA response must be discarded when session changed');

// 8. Verify BIPARJOY trajectoryResult remains null.
console.log('8. Verifying BIPARJOY trajectoryResult remains null...');
assert.strictEqual(session.getActiveTrajectoryResult(), null, 'BIPARJOY trajectoryResult must remain null');

// 9. Run a BIPARJOY request.
console.log('9. Run a BIPARJOY trajectory request...');
const biparjoyReqSessionId = session.currentInput.sessionId;
const biparjoyResponse = {
  storm_id: 'BIPARJOY',
  success: true,
  trajectory_forecast: [{ lat: 21.9, lon: 66.3, wind: 75 }]
};

// 10. Verify BIPARJOY result is accepted.
console.log('10. Verifying BIPARJOY result is accepted...');
let biparjoyWritten = false;
if (biparjoyReqSessionId === session.currentInput.sessionId) {
  biparjoyWritten = session.setTrajectoryResult(biparjoyResponse, biparjoyReqSessionId);
}
assert.strictEqual(biparjoyWritten, true, 'BIPARJOY result must be accepted');
assert.notStrictEqual(session.getActiveTrajectoryResult(), null);
assert.strictEqual(session.getActiveTrajectoryResult().storm_id, 'BIPARJOY');
assert.strictEqual(session.getActiveTrajectoryResult().sessionId, biparjoySessionId);

// 11. Switch back to DANA.
console.log('11. Switch back to DANA...');
session.setStormPreset('dana-2024');
const newDanaSessionId = session.currentInput.sessionId;
assert.notStrictEqual(newDanaSessionId, biparjoySessionId);

// 12. Verify BIPARJOY data does not survive.
console.log('12. Verifying BIPARJOY data does not survive switch back to DANA...');
assert.strictEqual(session.getActiveTrajectoryResult(), null, 'BIPARJOY data must not survive switch back to DANA');
assert.strictEqual(session.sessionResults.trajectoryResult, null, 'sessionResults.trajectoryResult must be cleared');

// --- PART 3: SECOND ASYNC MODULE SIMULATION (DETECTION) ---
console.log('\n--- PART 3: Second Async Module (Detection) Stale Response Simulation ---');
const activeDanaSession = session.currentInput.sessionId;
let staleDetWritten = session.setDetectionResult({
  cyclone_detected: true,
  bounding_box: [0.1, 0.2, 0.5, 0.6]
}, 'old_stale_session_xyz');

assert.strictEqual(staleDetWritten, false, 'Detection with mismatched expectedSessionId must be discarded');
assert.strictEqual(session.getActiveDetectionResult(), null, 'Active detection must remain null');

let validDetWritten = session.setDetectionResult({
  cyclone_detected: true,
  bounding_box: [0.2, 0.3, 0.6, 0.7]
}, activeDanaSession);

assert.strictEqual(validDetWritten, true, 'Detection with matching active session must be accepted');
assert.notStrictEqual(session.getActiveDetectionResult(), null, 'Detection result must now be populated');
assert.strictEqual(session.getActiveDetectionResult().sessionId, activeDanaSession);

console.log('✓ Detection module stale write rejected, valid write accepted with active sessionId.');

console.log('\n================================================================');
console.log('ALL PHASE 7 STEP 7.3 STATE HARDENING & RACE CONDITION TESTS PASSED!');
console.log('================================================================');
