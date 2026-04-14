import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOneTapAuth } from '../components/GoogleOneTapAuth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { env } from '../config/env';
import { useAuth } from '../context/AuthContext';
import { ProtectedAppLayout } from '../layout/ProtectedAppLayout';
import { AdminDashboard } from '../pages/AdminDashboard';
import { DashboardHomePage } from '../pages/DashboardHomePage';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { ModuleComingSoonPage } from '../pages/ModuleComingSoonPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../modules/settings/pages/SettingsPage';

// Lazy-loaded routes for code splitting
const LedgerPage = React.lazy(() => import('../modules/ledger').then((mod) => ({ default: mod.LedgerPage })));

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <ProtectedAppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHomePage />} />
        <Route
          path="/ledger"
          element={
            <Suspense fallback={<div className="flex items-center justify-center p-8">Loading ledger...</div>}>
              <LedgerPage />
            </Suspense>
          }
        />
        <Route path="/inventory" element={<ModuleComingSoonPage />} />
        <Route path="/suppliers" element={<ModuleComingSoonPage />} />
        <Route path="/lending" element={<ModuleComingSoonPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export function AppRouter() {
  const googleClientId = env.googleClientId;

  return (
    <BrowserRouter>
      {googleClientId ? <GoogleOneTapAuth /> : null}
      <AppRoutes />
    </BrowserRouter>
  );
}
