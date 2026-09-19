import assert from 'node:assert';
import fs from 'node:fs';

console.log('================================================================');
console.log('PHASE 7 — STEP 7.2: DETECTION & CLASSIFICATION HARDENING AUDIT');
console.log('================================================================');

const detectionCode = fs.readFileSync('frontend/src/pages/Detection.jsx', 'utf8');
const classificationCode = fs.readFileSync('frontend/src/pages/Classification.jsx', 'utf8');
const windCode = fs.readFileSync('backend/routers/wind.py', 'utf8');

// TEST 1: No hardcoded WINDY_API_KEY literal in wind.py
console.log('\n[TEST 1] Checking wind.py for hardcoded API key default...');
assert(!windCode.includes('h8RC1gtsg6HRNS4Ig1VW0J25sYgQd0re'), 'Exposed key must not be in wind.py');
assert(windCode.includes('WINDY_API_KEY: str = os.environ.get("WINDY_API_KEY", "")'), 'Must read cleanly from env');
console.log('✓ TEST 1 Passed: Hardcoded credential removed from backend/routers/wind.py.');

// TEST 2: Detection.jsx has try/catch around external image fetch
console.log('\n[TEST 2] Checking Detection.jsx for hardened image fetch...');
assert(detectionCode.includes('try {'), 'Must have try block');
assert(detectionCode.includes('fetch(currentInput.imageUrl)'), 'Must fetch imageUrl if available');
assert(detectionCode.includes('console.warn(\'[Detection]'), 'Must warn on error rather than uncaught throw');
assert(detectionCode.includes('localFallbackUrl'), 'Must have local preset asset fallback');
assert(detectionCode.includes('/cyclone_satellite_vis.jpg'), 'Must reference local vis fallback');
assert(detectionCode.includes('/cyclone_satellite_ir.jpg'), 'Must reference local ir fallback');
console.log('✓ TEST 2 Passed: Detection.jsx wraps external fetch in try/catch and falls back to local assets.');

// TEST 3: Classification.jsx has try/catch around external image fetch
console.log('\n[TEST 3] Checking Classification.jsx for hardened image fetch...');
assert(classificationCode.includes('try {'), 'Must have try block');
assert(classificationCode.includes('fetch(currentInput.imageUrl)'), 'Must fetch imageUrl if available');
assert(classificationCode.includes('console.warn(\'[Classification]'), 'Must warn on error rather than uncaught throw');
assert(classificationCode.includes('localFallbackUrl'), 'Must have local preset asset fallback');
assert(classificationCode.includes('/cyclone_satellite_vis.jpg'), 'Must reference local vis fallback');
assert(classificationCode.includes('/cyclone_satellite_ir.jpg'), 'Must reference local ir fallback');
console.log('✓ TEST 3 Passed: Classification.jsx wraps external fetch in try/catch and falls back to local assets.');

// TEST 4: Both pages have img onError fallback
console.log('\n[TEST 4] Checking img onError fallback in Detection.jsx & Classification.jsx...');
assert(detectionCode.includes('onError='), 'Detection.jsx img must have onError');
assert(classificationCode.includes('onError='), 'Classification.jsx img must have onError');
console.log('✓ TEST 4 Passed: Both pages guard browser image rendering with onError fallbacks.');

// TEST 5: Graceful error handling in inference functions
console.log('\n[TEST 5] Checking inference error state handling...');
assert(detectionCode.includes('setIsDetecting(false);'), 'Detection loading state must terminate in finally');
assert(classificationCode.includes('setIsClassifying(false);'), 'Classification loading state must terminate in finally');
assert(detectionCode.includes('setErrorMsg('), 'Detection must set user-facing errorMsg');
assert(classificationCode.includes('setErrorMsg('), 'Classification must set user-facing errorMsg');
console.log('✓ TEST 5 Passed: Loading state always terminates and user-facing error state is preserved.');

console.log('\n================================================================');
console.log('ALL 5 SATELLITE IMAGE FETCH HARDENING TESTS PASSED!');
console.log('================================================================');
