import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout & Security Infrastructure (direct static import for rock-solid shell)
import DashboardLayout from './components/DashboardLayout';
import VayuRouteLoader from './components/VayuRouteLoader';
import { ProtectedRoute } from './components/auth/ClerkAuth';
import { 
  isAuthSubdomain, 
  isPortalSubdomain, 
  isStatusSubdomain,
  isProductionDomain, 
  getAuthUrl, 
  getPortalUrl,
  getStatusUrl 
} from './utils/domain';

// Lazy-loaded Public Pages
const Welcome = lazy(() => import('./pages/Welcome'));
const StateWeather = lazy(() => import('./pages/StateWeather'));
const CityTracker = lazy(() => import('./pages/CityTracker'));
const ThreatMap = lazy(() => import('./pages/ThreatMap'));
const SafetyUpdates = lazy(() => import('./pages/SafetyUpdates'));
const CityForecast = lazy(() => import('./pages/CityForecast'));
const AICycloneIntelligence = lazy(() => import('./pages/AICycloneIntelligence'));
const RainfallIntelligence = lazy(() => import('./pages/RainfallIntelligence'));
const AtmosphericPatterns = lazy(() => import('./pages/AtmosphericPatterns'));
const CycloneIntelligencePage = lazy(() => import('./pages/CycloneIntelligencePage'));
const ClimateOceanAnomalies = lazy(() => import('./pages/ClimateOceanAnomalies'));
const Login = lazy(() => import('./pages/Login'));

// Lazy-loaded Operations / Portal Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Satellite = lazy(() => import('./pages/Satellite'));
const Detection = lazy(() => import('./pages/Detection'));
const Classification = lazy(() => import('./pages/Classification'));
const Prediction = lazy(() => import('./pages/Prediction'));
const Impact = lazy(() => import('./pages/Impact'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ModelTraining = lazy(() => import('./pages/ModelTraining'));
const Bulletin = lazy(() => import('./pages/Bulletin'));
const VayuEarth = lazy(() => import('./pages/VayuEarth'));
const StatusPage = lazy(() => import('./pages/StatusPage'));

// Redirect helper when accessing /login on production apex domain (vayusat.live)
const ProductionLoginRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    window.location.href = getAuthUrl(location.pathname + location.search);
  }, [location]);

<<<<<<< HEAD
  return (
    <VayuRouteLoader message="Redirecting to secure login gateway..." />
  );
=======
  return <VayuRouteLoader message="Redirecting to secure login gateway..." />;
>>>>>>> d2bda6f92485f3a0e192f4013f0420e0ec7ea10c
};

// Redirect helper when accessing /dashboard on production apex domain (vayusat.live)
const ProductionPortalRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    const subPath = location.pathname.replace(/^\/dashboard\/?/, '');
    window.location.href = getPortalUrl(subPath + location.search);
  }, [location]);

<<<<<<< HEAD
  return (
    <VayuRouteLoader message="Redirecting to VAYU Operations Portal (portal.vayusat.live)..." />
  );
=======
  return <VayuRouteLoader message="Opening VAYU Operations Portal..." />;
>>>>>>> d2bda6f92485f3a0e192f4013f0420e0ec7ea10c
};

// Redirect helper when accessing /status on production apex domain (vayusat.live)
const ProductionStatusRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    const subPath = location.pathname.replace(/^\/status\/?/, '');
    window.location.href = getStatusUrl(subPath + location.search);
  }, [location]);

<<<<<<< HEAD
  return (
    <VayuRouteLoader message="Redirecting to VAYU Live Status (status.vayusat.live)..." />
  );
=======
  return <VayuRouteLoader message="Opening VAYU Live Status..." />;
>>>>>>> d2bda6f92485f3a0e192f4013f0420e0ec7ea10c
};

function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    try {
      localStorage.removeItem('theme');
    } catch {}
  }, []);

  const isAuth = isAuthSubdomain();
  const isPortal = isPortalSubdomain();
  const isStatus = isStatusSubdomain();
  const isProd = isProductionDomain();

  // ROUTE SET 0: When user is on status.vayusat.live
  if (isStatus) {
    return (
      <Suspense fallback={<VayuRouteLoader message="Connecting to VAYU Live Status Telemetry..." />}>
        <Routes>
          <Route path="*" element={<StatusPage />} />
        </Routes>
      </Suspense>
    );
  }

  // ROUTE SET 1: When user is on login.vayusat.live
  if (isAuth) {
    return (
      <Suspense fallback={<VayuRouteLoader message="Connecting to secure authentication gateway..." />}>
        <Routes>
          <Route path="/sign-up" element={<Login initialMode="signUp" />} />
          <Route path="/signup" element={<Login initialMode="signUp" />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    );
  }

  // ROUTE SET 2: When user is on portal.vayusat.live
  if (isPortal) {
    return (
      <Suspense fallback={<VayuRouteLoader message="Initializing Operations Command Portal..." />}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* 1. COMMAND OVERVIEW & GEOSPATIAL EARTH */}
            <Route index element={<Dashboard />} />
            <Route path="earth" element={<Navigate to="/trajectory" replace />} />
            <Route path="vayu-earth" element={<Navigate to="/trajectory" replace />} />

            {/* 2. AI VISION */}
            <Route path="satellite" element={<Satellite />} />
            <Route path="detection" element={<Detection />} />
            <Route path="classification" element={<Classification />} />

            {/* 3. FORECAST */}
            <Route path="trajectory" element={<Prediction />} />
            <Route path="impact" element={<Impact />} />

            {/* 4. HISTORICAL */}
            <Route path="archives" element={<Analytics />} />

            {/* 5. AI SYSTEM */}
            <Route path="models" element={<ModelTraining />} />

            {/* 6. REPORTS & STATUS */}
            <Route path="bulletin" element={<Bulletin />} />
            <Route path="status" element={<StatusPage />} />

            {/* Seamless backward compatibility for /dashboard prefix on portal subdomain */}
            <Route path="dashboard">
              <Route index element={<Dashboard />} />
              <Route path="earth" element={<Navigate to="/trajectory" replace />} />
              <Route path="vayu-earth" element={<Navigate to="/trajectory" replace />} />
              <Route path="satellite" element={<Satellite />} />
              <Route path="detection" element={<Detection />} />
              <Route path="classification" element={<Classification />} />
              <Route path="trajectory" element={<Prediction />} />
              <Route path="impact" element={<Impact />} />
              <Route path="archives" element={<Analytics />} />
              <Route path="models" element={<ModelTraining />} />
              <Route path="bulletin" element={<Bulletin />} />
              <Route path="status" element={<StatusPage />} />
              <Route path="track" element={<Navigate to="/trajectory" replace />} />
              <Route path="trackmap" element={<Navigate to="/trajectory" replace />} />
              <Route path="prediction" element={<Navigate to="/trajectory" replace />} />
              <Route path="wind" element={<Navigate to="/trajectory" replace />} />
              <Route path="alerts" element={<Navigate to="/impact" replace />} />
              <Route path="analytics" element={<Navigate to="/archives" replace />} />
              <Route path="training" element={<Navigate to="/models" replace />} />
              <Route path="performance" element={<Navigate to="/models" replace />} />
              <Route path="architecture" element={<Navigate to="/models" replace />} />
              <Route path="ensemble" element={<Navigate to="/models" replace />} />
              <Route path="model-evaluation" element={<Navigate to="/models" replace />} />
            </Route>

            {/* Operational Route Aliases */}
            <Route path="track" element={<Navigate to="/trajectory" replace />} />
            <Route path="trackmap" element={<Navigate to="/trajectory" replace />} />
            <Route path="prediction" element={<Navigate to="/trajectory" replace />} />
            <Route path="wind" element={<Navigate to="/trajectory" replace />} />
            <Route path="alerts" element={<Navigate to="/impact" replace />} />
            <Route path="analytics" element={<Navigate to="/archives" replace />} />
            <Route path="training" element={<Navigate to="/models" replace />} />
            <Route path="performance" element={<Navigate to="/models" replace />} />
            <Route path="architecture" element={<Navigate to="/models" replace />} />
            <Route path="ensemble" element={<Navigate to="/models" replace />} />
            <Route path="model-evaluation" element={<Navigate to="/models" replace />} />
          </Route>

          {/* Catch-all redirect to portal root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // ROUTE SET 3: When user is on vayusat.live (or local development)
  return (
    <Suspense fallback={<VayuRouteLoader message="Loading VAYU Meteorological Intelligence..." />}>
      <Routes>
        {/* Official MoES / IMD Public Cyclone Intelligence Portal */}
        <Route path="/" element={<Welcome />} />

        {/* SIH AI/ML Cyclone Intelligence Hub */}
        <Route path="/ai-cyclone" element={<AICycloneIntelligence />} />
        <Route path="/ai-intelligence" element={<AICycloneIntelligence />} />

        {/* Service Dashboard Pages (from Homepage Service Cards) */}
        <Route path="/rainfall-intelligence" element={<RainfallIntelligence />} />
        <Route path="/atmospheric-patterns" element={<AtmosphericPatterns />} />
        <Route path="/cyclone-intelligence" element={<CycloneIntelligencePage />} />
        <Route path="/climate-ocean-anomalies" element={<ClimateOceanAnomalies />} />
        <Route path="/cyclone-ai" element={<AICycloneIntelligence />} />

        {/* 100+ Coastal Cities & High-Risk Danger Hotspots Directory */}
        <Route path="/city-tracker" element={<CityTracker />} />
        <Route path="/cities" element={<CityTracker />} />

        {/* Unified Threat Map (GIS Doppler Radar & Coastal Threat Matrix) */}
        <Route path="/threat-map" element={<ThreatMap />} />
        <Route path="/radar" element={<ThreatMap />} />
        <Route path="/gis-radar" element={<ThreatMap />} />
        <Route path="/threat-matrix" element={<ThreatMap />} />

        {/* Live Interactive Earth & Threat Matrix Console */}
        <Route path="/live-map"   element={<Navigate to="/threat-map" replace />} />
        <Route path="/live-earth" element={<Navigate to="/threat-map" replace />} />
        <Route path="/3d-earth"   element={<Navigate to="/threat-map" replace />} />
        <Route path="/earth"      element={<Navigate to="/threat-map" replace />} />
        <Route path="/vayu-earth" element={<Navigate to="/threat-map" replace />} />

        {/* Unified Safety & Updates (IMD Bulletins & NDMA Safety Protocol) */}
        <Route path="/safety-updates" element={<SafetyUpdates />} />
        <Route path="/bulletins" element={<SafetyUpdates initialTab="bulletins" />} />
        <Route path="/safety-guide" element={<SafetyUpdates initialTab="safety" />} />
        <Route path="/safety" element={<SafetyUpdates initialTab="safety" />} />
        <Route path="/updates" element={<SafetyUpdates initialTab="bulletins" />} />

        {/* Dedicated City 7-Day Extended Weather Forecast */}
        <Route path="/forecast/:cityId" element={<CityForecast />} />
        <Route path="/city-forecast/:cityId" element={<CityForecast />} />
        <Route path="/forecast" element={<CityForecast />} />

        {/* State-Specific Weather & Cyclone Early Warning Directory */}
        <Route path="/state/:stateSlug" element={<StateWeather />} />
        {/* Live System Telemetry Status (redirects to status.vayusat.live in production, loads directly in local dev) */}
        <Route path="/status" element={isProd ? <ProductionStatusRedirect /> : <StatusPage />} />

        {/* Operational Public Aliases */}
        <Route path="/wind" element={<Navigate to="/threat-map" replace />} />
        <Route path="/trackmap" element={<Navigate to="/threat-map" replace />} />
        <Route path="/ensemble" element={<Navigate to="/ai-cyclone" replace />} />
        <Route path="/model-evaluation" element={<Navigate to="/ai-cyclone" replace />} />

        {/* Official Authentication Gateway:
            - On production vayusat.live: redirects to login.vayusat.live
            - On local dev / preview: loads Login component directly
        */}
        {isProd ? (
          <>
            <Route path="/login" element={<ProductionLoginRedirect />} />
            <Route path="/sign-up" element={<ProductionLoginRedirect />} />
            <Route path="/signup" element={<ProductionLoginRedirect />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<Login initialMode="signUp" />} />
            <Route path="/signup" element={<Login initialMode="signUp" />} />
          </>
        )}

        {/* Meteorological Operations Portal Routing:
            - On production apex vayusat.live: redirects /dashboard to portal.vayusat.live
            - On local development: renders protected Command Dashboard under /dashboard & /portal
        */}
        {isProd ? (
          <Route path="/dashboard/*" element={<ProductionPortalRedirect />} />
        ) : (
          <>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* 1. COMMAND & VAYU EARTH */}
              <Route index element={<Dashboard />} />
              <Route path="earth" element={<VayuEarth />} />
              <Route path="vayu-earth" element={<VayuEarth />} />

              {/* 2. AI VISION */}
              <Route path="satellite" element={<Satellite />} />
              <Route path="detection" element={<Detection />} />
              <Route path="classification" element={<Classification />} />

              {/* 3. FORECAST */}
              <Route path="trajectory" element={<Prediction />} />
              <Route path="impact" element={<Impact />} />

              {/* 4. HISTORICAL */}
              <Route path="archives" element={<Analytics />} />

              {/* 5. AI SYSTEM */}
              <Route path="models" element={<ModelTraining />} />

              {/* 6. REPORTS & STATUS */}
              <Route path="bulletin" element={<Bulletin />} />
              <Route path="status" element={<StatusPage />} />

              {/* Backward-Compatible Route Aliases & Redirects */}
              <Route path="track" element={<Navigate to="/dashboard/trajectory" replace />} />
              <Route path="trackmap" element={<Navigate to="/dashboard/trajectory" replace />} />
              <Route path="prediction" element={<Navigate to="/dashboard/trajectory" replace />} />
              <Route path="wind" element={<Navigate to="/dashboard/trajectory" replace />} />
              <Route path="alerts" element={<Navigate to="/dashboard/impact" replace />} />
              <Route path="analytics" element={<Navigate to="/dashboard/archives" replace />} />
              <Route path="training" element={<Navigate to="/dashboard/models" replace />} />
              <Route path="performance" element={<Navigate to="/dashboard/models" replace />} />
              <Route path="architecture" element={<Navigate to="/dashboard/models" replace />} />
              <Route path="ensemble" element={<Navigate to="/dashboard/models" replace />} />
              <Route path="model-evaluation" element={<Navigate to="/dashboard/models" replace />} />
              <Route path="ai-cyclone" element={<Navigate to="/ai-cyclone" replace />} />
            </Route>

            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="earth" element={<VayuEarth />} />
              <Route path="vayu-earth" element={<VayuEarth />} />
              <Route path="satellite" element={<Satellite />} />
              <Route path="detection" element={<Detection />} />
              <Route path="classification" element={<Classification />} />
              <Route path="trajectory" element={<Prediction />} />
              <Route path="impact" element={<Impact />} />
              <Route path="archives" element={<Analytics />} />
              <Route path="models" element={<ModelTraining />} />
              <Route path="bulletin" element={<Bulletin />} />
              <Route path="status" element={<StatusPage />} />
              <Route path="track" element={<Navigate to="/portal/trajectory" replace />} />
              <Route path="trackmap" element={<Navigate to="/portal/trajectory" replace />} />
              <Route path="prediction" element={<Navigate to="/portal/trajectory" replace />} />
              <Route path="wind" element={<Navigate to="/portal/trajectory" replace />} />
              <Route path="alerts" element={<Navigate to="/portal/impact" replace />} />
              <Route path="analytics" element={<Navigate to="/portal/archives" replace />} />
              <Route path="training" element={<Navigate to="/portal/models" replace />} />
              <Route path="performance" element={<Navigate to="/portal/models" replace />} />
              <Route path="architecture" element={<Navigate to="/portal/models" replace />} />
              <Route path="ensemble" element={<Navigate to="/portal/models" replace />} />
              <Route path="model-evaluation" element={<Navigate to="/portal/models" replace />} />
            </Route>
          </>
        )}

        {/* Catch-all redirect to Public Portal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
