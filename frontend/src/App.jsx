import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MasterSBM from './pages/MasterSBM';
import SBMCategoryDetail from './pages/SBMCategoryDetail';
import MasterRKA from './pages/MasterRKA';
import Nominatif from './pages/Nominatif';
import NominatifPage from './pages/NominatifPage';
import NominatifCreate from './pages/NominatifCreate';
import NominatifEditForm from './pages/NominatifEditForm';
import NonNominatif from './pages/NonNominatif';
import NonNominatifCreate from './pages/NonNominatifCreate';
import NonNominatifEdit from './pages/NonNominatifEdit';
import AllStatusNominatif from './pages/AllStatusNominatif';

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
          <Route path="/master-sbm/:category" element={
            <ProtectedRoute>
              <Layout>
                <SBMCategoryDetail />
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
          <Route path="/nominatif/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <NominatifEditForm />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/nominatif/:rkaId" element={
            <ProtectedRoute>
              <Layout>
                <NominatifPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/nominatif/create" element={
            <ProtectedRoute>
              <Layout>
                <NominatifCreate />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/non-nominatif" element={
            <ProtectedRoute>
              <Layout>
                <NonNominatif />
              </Layout>
            </ProtectedRoute>
          } />
            <Route path="/non-nominatif/create" element={
            <ProtectedRoute>
              <Layout>
                <NonNominatifCreate />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/non-nominatif/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <NonNominatifEdit />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/all-status-nominatif" element={
            <ProtectedRoute>
              <Layout>
                <AllStatusNominatif />
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