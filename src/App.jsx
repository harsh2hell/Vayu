import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import StateWeather from './pages/StateWeather';
import CityTracker from './pages/CityTracker';
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

function App() {
  return (
    <Routes>
      {/* Official Government of India / MoES Public Cyclone Intelligence Portal */}
      <Route path="/" element={<Welcome />} />

      {/* 100+ Coastal Cities & High-Risk Danger Hotspots Directory */}
      <Route path="/city-tracker" element={<CityTracker />} />
      <Route path="/cities" element={<CityTracker />} />

      {/* State-Specific Weather & Cyclone Early Warning Directory */}
      <Route path="/state/:stateSlug" element={<StateWeather />} />
      <Route path="/state" element={<StateWeather />} />

      {/* Official Department Officer Gateway */}
      <Route path="/login" element={<Login />} />

      {/* Unified Internal AI/ML Command & Prediction Platform */}
      <Route path="/dashboard" element={<DashboardLayout />}>
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

      {/* Catch-all redirect to Public Portal */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
