import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Welcome from './pages/Welcome';
import StateWeather from './pages/StateWeather';
import CityTracker from './pages/CityTracker';
import ThreatMap from './pages/ThreatMap';
import Bulletins from './pages/Bulletins';
import SafetyGuide from './pages/SafetyGuide';
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
import { isDashboardSubdomain, isProductionDomain, getDashboardUrl } from './utils/domain';

// Redirect helper when accessing /dashboard on www.autonex.studio
const ProductionDashboardRedirect = () => {
  const location = useLocation();
  useEffect(() => {
    // Preserve sub-path (e.g., /dashboard/track -> dashboard.autonex.studio/track)
    const subPath = location.pathname.replace(/^\/dashboard/, '');
    window.location.href = getDashboardUrl(subPath);
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-xs">
      <span>Redirecting to command dashboard...</span>
    </div>
  );
};

function App() {
  const isDashboard = isDashboardSubdomain();
  const isProd = isProductionDomain();

  // ROUTE SET 1: When user is on dashboard.autonex.studio
  if (isDashboard) {
    return (
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Root on dashboard.autonex.studio renders Dashboard */}
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

          {/* Legacy /dashboard/* aliases so relative internal links keep working */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/track" element={<TrackMap />} />
          <Route path="dashboard/satellite" element={<Satellite />} />
          <Route path="dashboard/detection" element={<Detection />} />
          <Route path="dashboard/classification" element={<Classification />} />
          <Route path="dashboard/prediction" element={<Prediction />} />
          <Route path="dashboard/training" element={<ModelTraining />} />
          <Route path="dashboard/alerts" element={<Alerts />} />
          <Route path="dashboard/analytics" element={<Analytics />} />
          <Route path="dashboard/performance" element={<Performance />} />
          <Route path="dashboard/architecture" element={<Architecture />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ROUTE SET 2: When user is on www.autonex.studio (or local dev)
  return (
    <Routes>
      {/* Official MoES / IMD Public Cyclone Intelligence Portal */}
      <Route path="/" element={<Welcome />} />

      {/* 100+ Coastal Cities & High-Risk Danger Hotspots Directory */}
      <Route path="/city-tracker" element={<CityTracker />} />
      <Route path="/cities" element={<CityTracker />} />

      {/* Unified Threat Map (GIS Doppler Radar & Coastal Threat Matrix) */}
      <Route path="/threat-map" element={<ThreatMap />} />
      <Route path="/radar" element={<ThreatMap />} />
      <Route path="/gis-radar" element={<ThreatMap />} />
      <Route path="/threat-matrix" element={<ThreatMap />} />

      {/* Official IMD Meteorological Bulletins & Sea Warnings */}
      <Route path="/bulletins" element={<Bulletins />} />

      {/* Disaster Safety Protocol (NDMA Citizen Guidelines) */}
      <Route path="/safety-guide" element={<SafetyGuide />} />
      <Route path="/safety" element={<SafetyGuide />} />

      {/* State-Specific Weather & Cyclone Early Warning Directory */}
      <Route path="/state/:stateSlug" element={<StateWeather />} />
      <Route path="/state" element={<StateWeather />} />

      {/* Official Department Officer Gateway */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard route handling:
          - On production www.autonex.studio: redirects to dept.autonex.studio
          - On local dev / preview: loads DashboardLayout with ProtectedRoute
      */}
      {isProd ? (
        <Route path="/dashboard/*" element={<ProductionDashboardRedirect />} />
      ) : (
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
        </Route>
      )}

      {/* Catch-all redirect to Public Portal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
