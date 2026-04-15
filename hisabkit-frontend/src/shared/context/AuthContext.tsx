import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { AuthUserSummary } from '@/shared/types';

interface AuthContextType {
  user: AuthUserSummary | null;
  token: string | null;
  tenantId: string | null;
  login: (token: string, user: AuthUserSummary, tenantId: string) => void;
  setUserProfile: (user: AuthUserSummary) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUserSummary | null>(() => {
    const savedUser = localStorage.getItem('hisabkit_user');
    if (!savedUser) {
      return null;
    }

    try {
      const parsed = JSON.parse(savedUser) as Partial<AuthUserSummary>;
      if (typeof parsed.username === 'string' && typeof parsed.role === 'string') {
        return parsed as AuthUserSummary;
      }
      return null;
    } catch {
      localStorage.removeItem('hisabkit_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('hisabkit_token'));
  const [tenantId, setTenantId] = useState<string | null>(localStorage.getItem('hisabkit_tenant_id'));

  const login = (newToken: string, newUser: AuthUserSummary, newTenantId: string) => {
    setToken(newToken);
    setUser(newUser);
    setTenantId(newTenantId);
    localStorage.setItem('hisabkit_token', newToken);
    localStorage.setItem('hisabkit_user', JSON.stringify(newUser));
    localStorage.setItem('hisabkit_tenant_id', newTenantId);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenantId(null);
    localStorage.removeItem('hisabkit_token');
    localStorage.removeItem('hisabkit_user');
    localStorage.removeItem('hisabkit_tenant_id');
  };

  const setUserProfile = (nextUser: AuthUserSummary) => {
    setUser(nextUser);
    localStorage.setItem('hisabkit_user', JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, tenantId, login, setUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
