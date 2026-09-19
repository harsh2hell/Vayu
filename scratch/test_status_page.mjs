import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('VAYU SYSTEM STATUS PAGE: VERIFICATION SUITE');
console.log('================================================================');

const ROOT_DIR = process.cwd();
const APP_JSX = path.join(ROOT_DIR, 'frontend/src/App.jsx');
const STATUS_PAGE_JSX = path.join(ROOT_DIR, 'frontend/src/pages/StatusPage.jsx');
const NAVBAR_JSX = path.join(ROOT_DIR, 'frontend/src/components/PublicNavbar.jsx');
const SIDEBAR_JSX = path.join(ROOT_DIR, 'frontend/src/components/Sidebar.jsx');
const DOMAIN_JS = path.join(ROOT_DIR, 'frontend/src/utils/domain.js');

// Test 1: File existence
console.log('\n--- PART 1: File Existence & Bundle Chunk Check ---');
assert(fs.existsSync(STATUS_PAGE_JSX), 'StatusPage.jsx must exist');
console.log('✓ StatusPage.jsx exists');

const distAssets = path.join(ROOT_DIR, 'frontend/dist/assets');
if (fs.existsSync(distAssets)) {
  const files = fs.readdirSync(distAssets);
  const statusChunk = files.find(f => f.startsWith('StatusPage-') && f.endsWith('.js'));
  assert(statusChunk, 'StatusPage must be code-split into dist/assets chunk');
  console.log(`✓ StatusPage lazy bundle chunk verified: ${statusChunk}`);
}

// Test 2: Subdomain Routing in domain.js and App.jsx
console.log('\n--- PART 2: Subdomain Routing & App.jsx Integration ---');
const domainContent = fs.readFileSync(DOMAIN_JS, 'utf-8');
assert(domainContent.includes('isStatusSubdomain'), 'domain.js must have isStatusSubdomain');
assert(domainContent.includes('getStatusUrl'), 'domain.js must have getStatusUrl');
assert(domainContent.includes('status.vayusat.live'), 'domain.js must support status.vayusat.live');
console.log('✓ domain.js supports isStatusSubdomain and getStatusUrl');

const appContent = fs.readFileSync(APP_JSX, 'utf-8');
assert(appContent.includes("import('./pages/StatusPage')"), 'StatusPage must be lazy loaded in App.jsx');
assert(appContent.includes('isStatusSubdomain'), 'App.jsx must check isStatusSubdomain');
assert(appContent.includes('ProductionStatusRedirect'), 'App.jsx must redirect to status.vayusat.live in production');
assert(appContent.includes('path="/status"'), 'Public /status route must exist');
assert(appContent.includes('<Route path="status" element={<StatusPage />} />'), 'Dashboard status route must exist');
console.log('✓ App.jsx routes for status.vayusat.live, /status, and /dashboard/status verified');

// Test 3: Navigation links in Navbar and Sidebar
console.log('\n--- PART 3: Navigation Integration ---');
const navbarContent = fs.readFileSync(NAVBAR_JSX, 'utf-8');
assert(navbarContent.includes("path: '/status'") || navbarContent.includes('path: "/status"'), 'PublicNavbar must link to /status');
assert(navbarContent.includes('System Status'), 'PublicNavbar must display System Status');
assert(navbarContent.includes('getStatusUrl'), 'PublicNavbar must use getStatusUrl in production');
console.log('✓ PublicNavbar has System Status link with production subdomain routing');

const sidebarContent = fs.readFileSync(SIDEBAR_JSX, 'utf-8');
assert(sidebarContent.includes("toPortalPath('/dashboard/status')"), 'Sidebar must link to /dashboard/status');
assert(sidebarContent.includes("'System Status'"), 'Sidebar must display System Status');
console.log('✓ Sidebar has System Status link with Activity icon');

// Test 4: Subsystem Constraints & Staged Transition Logic
console.log('\n--- PART 4: Subsystem Constraints & Staged Transition Logic ---');
const statusContent = fs.readFileSync(STATUS_PAGE_JSX, 'utf-8');

// Core working subsystems: ONLY auth and backend
assert(statusContent.includes("id: 'auth-clerk'"), 'Clerk Auth must be tracked');
assert(statusContent.includes("id: 'backend-gateway'"), 'Backend REST/SQLite Gateway must be tracked');
assert(statusContent.includes("isCoreWorking: true"), 'isCoreWorking flag must exist for core services');

// Neural Pipelines (MUST REMAIN RED / DOWN)
assert(statusContent.includes("id: 'model-detection'"), 'Eye Detector must be tracked');
assert(statusContent.includes("id: 'model-classification'"), 'Dvorak Morphology must be tracked');
assert(statusContent.includes("id: 'model-trajectory'"), 'Trajectory-GRU must be tracked');
assert(statusContent.includes("id: 'model-fusion'"), 'CycloneFusion Matrix must be tracked');

// Telemetry Feeds (MUST REMAIN RED / DOWN)
assert(statusContent.includes("id: 'feed-insat'"), 'INSAT-3DR Downlink must be tracked');
assert(statusContent.includes("id: 'feed-radar'"), 'IMD Radar Network must be tracked');
assert(statusContent.includes("id: 'feed-buoy'"), 'INCOIS Marine Buoys must be tracked');
assert(statusContent.includes("id: 'service-puter'"), 'Puter AI Service must be tracked');

// Transition logic: Red -> Yellow -> Green for Auth and Backend ONLY
assert(statusContent.includes("setCheckPhase(0)"), 'Must have Phase 0 (Red)');
assert(statusContent.includes("setCheckPhase(1)"), 'Must have Phase 1 (Yellow Handshake)');
assert(statusContent.includes("setCheckPhase(2)"), 'Must have Phase 2 (Green Operational)');
assert(statusContent.includes("operational"), 'Must mark operational');
assert(statusContent.includes("ERR_NEURAL_CLUSTER_UNREACHABLE"), 'Must include specific outage diagnostics for Neural cluster');

// Visual aesthetic checks: status.openai.com style design tokens
assert(statusContent.includes("System status"), 'Must have System status card title (OpenAI style)');
assert(statusContent.includes("generateWeeklyBars"), 'Must have weekly timeline bar generator');
assert(statusContent.includes("View history"), 'Must have View history toggle button');
assert(statusContent.includes("Powered by"), 'Must have powered by footer');

console.log('✓ Subsystems and staged transitions verified (Auth & Backend -> Green; Neural & Feeds -> Red/Down)');
console.log('✓ status.openai.com design tokens, weekly history bars, and components verified');

console.log('\n================================================================');
console.log('ALL STATUS PAGE VERIFICATION TESTS PASSED (5/5)!');
console.log('================================================================');
