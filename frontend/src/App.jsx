import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import StateWeather from './pages/StateWeather';
import CityTracker from './pages/CityTracker';
import ThreatMap from './pages/ThreatMap';
import SafetyUpdates from './pages/SafetyUpdates';
import CityForecast from './pages/CityForecast';
import AICycloneIntelligence from './pages/AICycloneIntelligence';
import RainfallIntelligence from './pages/RainfallIntelligence';
import AtmosphericPatterns from './pages/AtmosphericPatterns';
import CycloneIntelligencePage from './pages/CycloneIntelligencePage';
import ClimateOceanAnomalies from './pages/ClimateOceanAnomalies';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import TrackMap from './pages/TrackMap';
import Satellite from './pages/Satellite';
import Detection from './pages/Detection';
import Classification from './pages/Classification';
import Prediction from './pages/Prediction';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Performance from './pages/Performance';
import Architecture from './pages/Architecture';
import ModelTraining from './pages/ModelTraining';
import { ProtectedRoute } from './components/auth/ClerkAuth';
import { isAuthSubdomain, isProductionDomain, getAuthUrl } from './utils/domain';

// Redirect helper when accessing /login on production apex domain (vayusat.live)
const ProductionLoginRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    window.location.href = getAuthUrl(location.pathname + location.search);
  }, [location]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-xs font-mono">
      <span>Redirecting to secure login gateway (login.vayusat.live)...</span>
    </div>
  );
};

function App() {
  const isAuth = isAuthSubdomain();
  const isProd = isProductionDomain();

  // ROUTE SET 1: When user is on login.vayusat.live
  if (isAuth) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // ROUTE SET 2: When user is on vayusat.live (or local development)
  return (
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
      <Route path="/state" element={<StateWeather />} />

      {/* Official Authentication Gateway:
          - On production vayusat.live: redirects to login.vayusat.live
          - On local dev / preview: loads Login component directly
      */}
      {isProd ? (
        <Route path="/login" element={<ProductionLoginRedirect />} />
      ) : (
        <Route path="/login" element={<Login />} />
      )}

      {/* Protected Meteorological Command Dashboard (https://vayusat.live/dashboard) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="track" element={<TrackMap />} />
        <Route path="satellite" element={<Satellite />} />
        <Route path="detection" element={<Detection />} />
        <Route path="classification" element={<Classification />} />
        <Route path="prediction" element={<Prediction />} />
        <Route path="training" element={<ModelTraining />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="performance" element={<Performance />} />
        <Route path="architecture" element={<Architecture />} />
        <Route path="ai-cyclone" element={<AICycloneIntelligence />} />
      </Route>

      {/* Catch-all redirect to Public Portal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
