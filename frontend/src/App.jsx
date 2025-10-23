import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterSBM from './pages/MasterSBM';
import MasterRKA from './pages/MasterRKA';
import Nominatif from './pages/Nominatif';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/master-sbm" element={
            <ProtectedRoute>
              <Layout>
                <MasterSBM />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/master-rka" element={
            <ProtectedRoute>
              <Layout>
                <MasterRKA />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/nominatif" element={
            <ProtectedRoute>
              <Layout>
                <Nominatif />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;