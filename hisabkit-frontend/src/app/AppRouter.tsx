/**
 * app/AppRouter.tsx
 * Root router: defines all routes, handles auth-guarding, and code-splits
 * every module entry point via React.lazy.
 */
import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOneTapAuth } from '@/shared/components/GoogleOneTapAuth';
import { ProtectedRoute } from '@/shared/components/ProtectedRoute';
import { PageLoader } from '@/shared/components/ui/page-loader';
import { env } from '@/shared/config/env';
import { useAuth } from '@/shared/context/AuthContext';
import { ProtectedAppLayout } from '@/layout/ProtectedAppLayout';
import { LandingPage } from '@/modules/auth/pages/LandingPage';
import { LoginPage } from '@/modules/auth/pages/LoginPage';
import { ModuleComingSoonPage } from '@/shared/components/ModuleComingSoonPage';

// ── Lazy-loaded module entries (route-level code splitting) ───────────────────
const LedgerPage = React.lazy(() =>
  import('@/modules/ledger').then((m) => ({ default: m.LedgerPage }))
);
const DashboardHomePage = React.lazy(() =>
  import('@/modules/dashboard').then((m) => ({ default: m.DashboardHomePage }))
);
const AdminDashboard = React.lazy(() =>
  import('@/modules/admin').then((m) => ({ default: m.AdminDashboard }))
);
const ProfilePage = React.lazy(() =>
  import('@/modules/profile').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = React.lazy(() =>
  import('@/modules/settings').then((m) => ({ default: m.SettingsPage }))
);
const ReportsPage = React.lazy(() =>
  import('@/modules/reports').then((m) => ({ default: m.ReportsPage }))
);

// ── Route tree ────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Protected shell */}
      <Route element={<ProtectedRoute><ProtectedAppLayout /></ProtectedRoute>}>
        <Route
          path="/dashboard"
          element={<Suspense fallback={<PageLoader />}><DashboardHomePage /></Suspense>}
        />
        <Route
          path="/ledger"
          element={<Suspense fallback={<PageLoader />}><LedgerPage /></Suspense>}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>}
        />
        <Route
          path="/settings"
          element={<Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>}
        />
        <Route
          path="/reports"
          element={<Suspense fallback={<PageLoader />}><ReportsPage /></Suspense>}
        />
        {/* Module placeholders */}
        <Route path="/inventory" element={<ModuleComingSoonPage />} />
        <Route path="/suppliers" element={<ModuleComingSoonPage />} />
        <Route path="/lending" element={<ModuleComingSoonPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      {env.googleClientId ? <GoogleOneTapAuth /> : null}
      <AppRoutes />
    </BrowserRouter>
  );
}
