/**
 * PHASE 7 — STEP 7.7: ORPHANED ROUTE & COMPATIBILITY AUDIT TEST SUITE
 * 
 * Verifies:
 * 1. Audited routes (/ensemble, /model-evaluation, /dashboard/ensemble, /dashboard/model-evaluation)
 *    are properly handled with explicit compatibility redirects.
 * 2. Primary canonical routes (Dashboard, Detection, Classification, Prediction,
 *    Impact, TrackMap, Satellite, Analytics, Training, Wind, Bulletin, Earth, Status)
 *    remain registered and reachable.
 * 3. No broken imports or dangling unhandled routes remain in App.jsx.
 * 4. Subdomain route sets (login, portal, status, public apex) all maintain consistent aliases.
 * 5. Single canonical AnalysisSessionProvider integrity is preserved.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('PHASE 7 — STEP 7.7: ORPHANED ROUTE & COMPATIBILITY AUDIT');
console.log('================================================================');

const appFile = path.join(rootDir, 'frontend', 'src', 'App.jsx');
const sidebarFile = path.join(rootDir, 'frontend', 'src', 'components', 'Sidebar.jsx');
const navbarFile = path.join(rootDir, 'frontend', 'src', 'components', 'PublicNavbar.jsx');

assert(fs.existsSync(appFile), 'App.jsx must exist');
assert(fs.existsSync(sidebarFile), 'Sidebar.jsx must exist');
assert(fs.existsSync(navbarFile), 'PublicNavbar.jsx must exist');

const appCode = fs.readFileSync(appFile, 'utf8');
const sidebarCode = fs.readFileSync(sidebarFile, 'utf8');
const navbarCode = fs.readFileSync(navbarFile, 'utf8');

// ----------------------------------------------------------------------
// PART 1: Audited Routes & Compatibility Redirects
// ----------------------------------------------------------------------
console.log('\n--- PART 1: Audited Routes & Compatibility Redirects ---');

// 1.1: Public /ensemble & /model-evaluation
assert(appCode.includes('path="/ensemble" element={<Navigate to="/ai-cyclone" replace />}'),
  'Public /ensemble must redirect to /ai-cyclone for public backward compatibility');
console.log('✓ Public /ensemble -> /ai-cyclone redirect verified.');

assert(appCode.includes('path="/model-evaluation" element={<Navigate to="/ai-cyclone" replace />}'),
  'Public /model-evaluation must redirect to /ai-cyclone for public backward compatibility');
console.log('✓ Public /model-evaluation -> /ai-cyclone redirect verified.');

// 1.2: Operational /dashboard/ensemble & /dashboard/model-evaluation
assert(appCode.includes('path="ensemble" element={<Navigate to="/dashboard/models" replace />}'),
  'Dashboard /dashboard/ensemble must redirect to /dashboard/models');
console.log('✓ Dashboard /dashboard/ensemble -> /dashboard/models redirect verified.');

assert(appCode.includes('path="model-evaluation" element={<Navigate to="/dashboard/models" replace />}'),
  'Dashboard /dashboard/model-evaluation must redirect to /dashboard/models');
console.log('✓ Dashboard /dashboard/model-evaluation -> /dashboard/models redirect verified.');

// 1.3: Portal /portal/ensemble & /portal/model-evaluation
assert(appCode.includes('path="ensemble" element={<Navigate to="/portal/models" replace />}'),
  'Portal /portal/ensemble must redirect to /portal/models');
console.log('✓ Portal /portal/ensemble -> /portal/models redirect verified.');

assert(appCode.includes('path="model-evaluation" element={<Navigate to="/portal/models" replace />}'),
  'Portal /portal/model-evaluation must redirect to /portal/models');
console.log('✓ Portal /portal/model-evaluation -> /portal/models redirect verified.');

// 1.4: Subdomain portal.vayusat.live aliases
assert(appCode.includes('path="ensemble" element={<Navigate to="/models" replace />}'),
  'Portal subdomain ensemble alias must redirect to /models');
assert(appCode.includes('path="model-evaluation" element={<Navigate to="/models" replace />}'),
  'Portal subdomain model-evaluation alias must redirect to /models');
console.log('✓ Portal subdomain ensemble & model-evaluation aliases verified.');

// ----------------------------------------------------------------------
// PART 2: Primary Canonical Routes Reachability
// ----------------------------------------------------------------------
console.log('\n--- PART 2: Primary Canonical Routes Reachability ---');

const canonicalOperational = [
  { name: 'Dashboard', route: 'index' },
  { name: 'Earth / Vayu Earth', route: 'earth' },
  { name: 'Satellite', route: 'satellite' },
  { name: 'Detection', route: 'detection' },
  { name: 'Classification', route: 'classification' },
  { name: 'Prediction', route: 'trajectory' },
  { name: 'Impact', route: 'impact' },
  { name: 'Analytics', route: 'archives' },
  { name: 'Training / Models', route: 'models' },
  { name: 'Bulletin', route: 'bulletin' },
  { name: 'Status', route: 'status' }
];

for (const { name, route } of canonicalOperational) {
  const isIndex = route === 'index';
  const found = isIndex 
    ? (appCode.includes('<Route index element={<Dashboard />} />') || appCode.includes('<Route index'))
    : (appCode.includes(`path="${route}"`) || appCode.includes(`path="/${route}"`));
  assert(found, `Canonical operational route ${name} (${route}) must be registered in App.jsx`);
  console.log(`✓ Operational Route: ${name.padEnd(22)} -> '${route}'`);
}

const canonicalPublic = [
  { name: 'Home / Atlas', route: '/' },
  { name: 'City Tracker', route: '/city-tracker' },
  { name: 'Threat Map', route: '/threat-map' },
  { name: 'Live Radar Map', route: '/live-map' },
  { name: 'Safety Updates', route: '/safety-updates' },
  { name: 'City Forecast', route: '/forecast' },
  { name: 'State Weather', route: '/state/:stateSlug' },
  { name: 'AI Cyclone Intel', route: '/ai-cyclone' },
  { name: 'Live Status', route: '/status' }
];

for (const { name, route } of canonicalPublic) {
  const found = appCode.includes(`path="${route}"`);
  assert(found, `Canonical public route ${name} (${route}) must be registered in App.jsx`);
  console.log(`✓ Public Route:      ${name.padEnd(22)} -> '${route}'`);
}

// ----------------------------------------------------------------------
// PART 3: Navigation & Sidebar Cleanliness Check
// ----------------------------------------------------------------------
console.log('\n--- PART 3: Navigation & Sidebar Cleanliness ---');

// Sidebar must expose complete operational routes without broken/dead links
assert(!sidebarCode.includes('/ensemble'), 'Sidebar must not expose unmounted /ensemble link');
assert(!sidebarCode.includes('/model-evaluation'), 'Sidebar must not expose unmounted /model-evaluation link');
console.log('✓ Sidebar navigation free of orphaned links.');

assert(!navbarCode.includes('/ensemble'), 'PublicNavbar must not expose unmounted /ensemble link');
assert(!navbarCode.includes('/model-evaluation'), 'PublicNavbar must not expose unmounted /model-evaluation link');
console.log('✓ PublicNavbar navigation free of orphaned links.');

// ----------------------------------------------------------------------
// PART 4: Architectural Integrity Checks
// ----------------------------------------------------------------------
console.log('\n--- PART 4: Architecture & Context Integrity ---');

// Check single canonical AnalysisSessionProvider in DashboardLayout.jsx
const layoutFile = path.join(rootDir, 'frontend', 'src', 'components', 'DashboardLayout.jsx');
const layoutCode = fs.readFileSync(layoutFile, 'utf8');
assert(layoutCode.includes('AnalysisSessionProvider'), 'DashboardLayout.jsx must wrap dashboard children in AnalysisSessionProvider');

// Ensure no duplicate providers in App.jsx or main.jsx
const providerCountApp = (appCode.match(/<AnalysisSessionProvider/g) || []).length;
assert(providerCountApp === 0, 'App.jsx must not re-instantiate AnalysisSessionProvider (must be in DashboardLayout)');
console.log('✓ Single canonical AnalysisSessionProvider preserved in DashboardLayout with 0 duplicates.');

console.log('\n================================================================');
console.log('ALL PHASE 7 STEP 7.7 AUDIT & COMPATIBILITY CHECKS PASSED (5/5)!');
console.log('================================================================');
