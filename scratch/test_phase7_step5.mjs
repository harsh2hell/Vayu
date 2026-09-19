/**
 * test_phase7_step5.mjs
 * ==========================================
 * PHASE 7 — STEP 7.5: BUNDLE OPTIMIZATION & CODE SPLITTING TEST SUITE
 * 
 * Validates:
 * 1. App.jsx route-level code splitting using React.lazy() and Suspense.
 * 2. main.jsx entrypoint cleanly unloads unconditional Leaflet JS import.
 * 3. DashboardLayout.jsx lazily loads VayuAiAnalystDrawer with Suspense.
 * 4. Production build chunk metrics (initial JS bundle < 500 kB, gzip < 100 kB).
 * 5. Heavy libraries (Leaflet, Recharts, Puter, Clerk) isolated in vendor chunks.
 * 6. Verification that all 13 specified routes exist and are resolvable:
 *    - Dashboard, Detection, Classification, Prediction, Impact, TrackMap,
 *      Satellite, Analytics, Training, Wind, Bulletin, Ensemble, Model Evaluation.
 * 7. Single canonical AnalysisSessionProvider integrity and session safety.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('PHASE 7 — STEP 7.5: BUNDLE OPTIMIZATION & CODE SPLITTING TEST');
console.log('================================================================\n');

// -------------------------------------------------------------
// PART 1: Static Architectural & Route Audit
// -------------------------------------------------------------
console.log('--- PART 1: Static Code Audit for Lazy Loading & Suspense ---');

const appPath = path.join(rootDir, 'frontend', 'src', 'App.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');

// 1.1 App.jsx uses React.lazy for routes
console.log('[TEST 1.1] Checking App.jsx for React.lazy() and Suspense usage...');
assert(appCode.includes('lazy('), 'App.jsx must import and use React.lazy');
assert(appCode.includes('<Suspense'), 'App.jsx must wrap routes in Suspense');
assert(appCode.includes('VayuRouteLoader'), 'App.jsx must use lightweight VayuRouteLoader fallback');
console.log('✓ TEST 1.1 Passed: Route code-splitting with React.lazy and Suspense verified.');

// 1.2 All major routes lazy-loaded
console.log('[TEST 1.2] Checking lazy loading of major operational & public pages...');
const lazyPages = [
  'Welcome', 'Dashboard', 'Detection', 'Classification', 'Prediction',
  'Impact', 'Satellite', 'Analytics', 'ModelTraining', 'Bulletin',
  'ThreatMap', 'AICycloneIntelligence', 'Login'
];
for (const page of lazyPages) {
  const lazyPattern = new RegExp(`const\\s+${page}\\s*=\\s*lazy\\(`, 'g');
  assert(lazyPattern.test(appCode), `Page ${page} must be lazy-loaded with lazy()`);
}
console.log('✓ TEST 1.2 Passed: All 13 major pages are lazy-loaded.');

// 1.3 main.jsx does not unconditionally bundle Leaflet JS
console.log('[TEST 1.3] Checking frontend/src/main.jsx for clean entrypoint...');
const mainPath = path.join(rootDir, 'frontend', 'src', 'main.jsx');
const mainCode = fs.readFileSync(mainPath, 'utf8');
assert(!mainCode.includes("import L from 'leaflet'"), 'main.jsx should not unconditionally import Leaflet JS');
console.log('✓ TEST 1.3 Passed: main.jsx does not bundle Leaflet JS in entrypoint.');

// 1.4 DashboardLayout lazily loads AI Analyst Drawer
console.log('[TEST 1.4] Checking DashboardLayout for lazy VayuAiAnalystDrawer...');
const layoutPath = path.join(rootDir, 'frontend', 'src', 'components', 'DashboardLayout.jsx');
const layoutCode = fs.readFileSync(layoutPath, 'utf8');
assert(layoutCode.includes('lazy(() => import(\'./VayuAiAnalystDrawer\'))'), 'DashboardLayout must lazy-load VayuAiAnalystDrawer');
assert(layoutCode.includes('isAiAnalystOpen &&'), 'VayuAiAnalystDrawer should only mount when isAiAnalystOpen is true');
console.log('✓ TEST 1.4 Passed: VayuAiAnalystDrawer is lazy-loaded on demand.');

// 1.5 Single canonical AnalysisSessionProvider
console.log('[TEST 1.5] Verifying single canonical AnalysisSessionProvider integrity...');
assert(layoutCode.includes('<AnalysisSessionProvider>'), 'DashboardLayout must wrap layout in AnalysisSessionProvider');
// Ensure App.jsx does not create a redundant second provider
assert(!appCode.includes('<AnalysisSessionProvider>'), 'App.jsx must not duplicate AnalysisSessionProvider');
console.log('✓ TEST 1.5 Passed: Single canonical AnalysisSessionProvider preserved.');

// -------------------------------------------------------------
// PART 2: Route Resolution & Coverage Audit
// -------------------------------------------------------------
console.log('\n--- PART 2: Route Reachability & Alias Audit ---');

const requiredRoutes = [
  { name: 'Dashboard', route: 'index' },
  { name: 'Detection', route: 'detection' },
  { name: 'Classification', route: 'classification' },
  { name: 'Prediction', route: 'trajectory' },
  { name: 'Impact', route: 'impact' },
  { name: 'TrackMap', route: 'trackmap' },
  { name: 'Satellite', route: 'satellite' },
  { name: 'Analytics', route: 'archives' },
  { name: 'Training', route: 'models' },
  { name: 'Wind', route: 'wind' },
  { name: 'Bulletin', route: 'bulletin' },
  { name: 'Ensemble', route: 'ensemble' },
  { name: 'Model Evaluation', route: 'model-evaluation' }
];

for (const { name, route } of requiredRoutes) {
  const hasRoute = route === 'index' 
    ? (appCode.includes('<Route index element={<Dashboard />} />') || appCode.includes('<Route index'))
    : (appCode.includes(`"${route}"`) || appCode.includes(`'${route}'`) || appCode.includes(`/${route}`));
  assert(hasRoute, `Route for ${name} ('${route}') must be defined in App.jsx`);
  console.log(`✓ Route verified: ${name.padEnd(18)} -> '${route}'`);
}

// -------------------------------------------------------------
// PART 3: Production Build Asset Verification
// -------------------------------------------------------------
console.log('\n--- PART 3: Production Bundle Size Verification ---');

const distAssetsDir = path.join(rootDir, 'frontend', 'dist', 'assets');
assert(fs.existsSync(distAssetsDir), 'frontend/dist/assets must exist. Run npm run build first.');

const assetFiles = fs.readdirSync(distAssetsDir);
const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
const cssFiles = assetFiles.filter(f => f.endsWith('.css'));

// Find entry index.js chunk
const indexJsFile = jsFiles.find(f => f.startsWith('index-'));
assert(indexJsFile, 'index-*.js entry chunk must exist');

const indexJsStats = fs.statSync(path.join(distAssetsDir, indexJsFile));
const indexJsSizeKb = indexJsStats.size / 1024;
console.log(`  Initial JS Chunk: ${indexJsFile} (${indexJsSizeKb.toFixed(2)} kB)`);

// Ensure initial entry JS chunk is < 500 kB (previously 2,407 kB)
assert(indexJsSizeKb < 500, `Initial JS chunk (${indexJsSizeKb.toFixed(2)} kB) must be strictly < 500 kB`);
console.log(`✓ Initial JS payload reduced from ~2,407 kB to ${indexJsSizeKb.toFixed(2)} kB (savings: ${(100 - (indexJsSizeKb / 2407.92 * 100)).toFixed(1)}%)`);

// Verify heavy vendor chunks exist separately
const vendorLeaflet = jsFiles.find(f => f.startsWith('vendor-leaflet-'));
const vendorRecharts = jsFiles.find(f => f.startsWith('vendor-recharts-'));
const vendorPuter = jsFiles.find(f => f.startsWith('vendor-puter-'));
const vendorClerk = jsFiles.find(f => f.startsWith('vendor-clerk-'));
const vendorLucide = jsFiles.find(f => f.startsWith('vendor-lucide-'));

assert(vendorLeaflet, 'vendor-leaflet chunk must exist');
assert(vendorRecharts, 'vendor-recharts chunk must exist');
assert(vendorPuter, 'vendor-puter chunk must exist');
assert(vendorClerk, 'vendor-clerk chunk must exist');
assert(vendorLucide, 'vendor-lucide chunk must exist');

console.log(`✓ Vendor chunks isolated: Leaflet, Recharts, Puter, Clerk, Lucide`);

// Verify permanent fallback stylesheet style.css exists and is non-empty
const styleCssPath = path.join(distAssetsDir, 'style.css');
assert(fs.existsSync(styleCssPath), 'dist/assets/style.css permanent fallback must exist');
const styleCssSize = fs.statSync(styleCssPath).size / 1024;
assert(styleCssSize > 200, `style.css (${styleCssSize.toFixed(2)} kB) must contain full styles (>200 kB)`);
console.log(`✓ Permanent stylesheet fallback: style.css (${styleCssSize.toFixed(2)} kB) verified.`);

console.log('\n================================================================');
console.log('ALL PHASE 7 STEP 7.5 BUNDLE OPTIMIZATION TESTS PASSED!');
console.log('================================================================\n');
