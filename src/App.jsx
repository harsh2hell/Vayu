import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      {/* Official Home & Portal Entry */}
      <Route path="/" element={<Landing />} />

      {/* Unified AI/ML Command & Prediction Platform */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
      </Route>

      {/* Catch-all redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
