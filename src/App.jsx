import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
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

function App() {
  return (
    <Routes>
      {/* Official Home & Portal Entry */}
      <Route path="/" element={<Landing />} />

      {/* Unified AI/ML Command & Prediction Platform */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="track" element={<TrackMap />} />
        <Route path="satellite" element={<Satellite />} />
        <Route path="detection" element={<Detection />} />
        <Route path="classification" element={<Classification />} />
        <Route path="prediction" element={<Prediction />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="performance" element={<Performance />} />
        <Route path="architecture" element={<Architecture />} />
      </Route>

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

