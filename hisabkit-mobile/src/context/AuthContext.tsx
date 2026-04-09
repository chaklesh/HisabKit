import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/auth';
import type { AuthData, UserSummary } from '../services/auth';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: UserSummary | null;
  tenantId: string | null;
  login: (username: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<AuthData | null>(null);

  useEffect(() => {
    authService.restoreSession().then((data) => {
      if (data) setAuthData(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authService.login(username, password);
    setAuthData(data);
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const data = await authService.googleLogin(credential);
    setAuthData(data);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthData(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn: !!authData,
        user: authData?.user ?? null,
        tenantId: authData?.tenantId ?? null,
        login,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
