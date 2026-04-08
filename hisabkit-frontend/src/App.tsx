import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { GoogleOneTapAuth } from './components/GoogleOneTapAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { env } from './config/env';
import { useAuth } from './context/AuthContext';
import { ProtectedAppLayout } from './layout/ProtectedAppLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { DashboardHomePage } from './pages/DashboardHomePage';
import { LandingPage } from './pages/LandingPage';
import { LedgerDashboard } from './pages/LedgerDashboard';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

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
        <Route path="/ledger" element={<LedgerDashboard />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

function App() {
  const googleClientId = env.googleClientId;

  return (
    <BrowserRouter>
      {googleClientId ? <GoogleOneTapAuth /> : null}
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
