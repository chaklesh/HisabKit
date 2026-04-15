import React, { createContext, useContext, useState } from 'react';
import type { LayoutSettings } from '@/modules/settings/types/settingsTypes';

type LayoutContextType = {
  settings: LayoutSettings;
  updateSettings: (newSettings: Partial<LayoutSettings>) => void;
};

const DEFAULT_SETTINGS: LayoutSettings = {
  dashboardDensity: 'comfortable',
  defaultView: 'dashboard',
  hidePlannedModules: false,
  compactNavigationSidebar: false,
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<LayoutSettings>(() => {
    try {
      const stored = localStorage.getItem('hisabkit_layout_settings');
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSettings = (newSettings: Partial<LayoutSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('hisabkit_layout_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <LayoutContext.Provider value={{ settings, updateSettings }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}

