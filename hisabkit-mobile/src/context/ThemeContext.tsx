import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { darkColors, lightColors, type ThemeColors } from '../theme/colors';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
  statusBarStyle: 'light' | 'dark';
  navigationTheme: NavigationTheme;
};

const STORAGE_KEY = '@hisabkit_theme_mode';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'light' || value === 'dark') {
          setModeState(value);
        }
      })
      .catch(() => undefined);
  }, []);

  const setMode = async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await AsyncStorage.setItem(STORAGE_KEY, nextMode);
  };

  const toggleMode = async () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    await setMode(nextMode);
  };

  const colors = mode === 'light' ? lightColors : darkColors;
  const statusBarStyle = mode === 'light' ? 'dark' as const : 'light' as const;

  const navigationTheme = useMemo<NavigationTheme>(() => {
    const base = mode === 'light' ? DefaultTheme : DarkTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.tabBar,
        primary: colors.brand,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, mode]);

  const value = useMemo(
    () => ({ mode, colors, setMode, toggleMode, statusBarStyle, navigationTheme }),
    [mode, colors, statusBarStyle, navigationTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
