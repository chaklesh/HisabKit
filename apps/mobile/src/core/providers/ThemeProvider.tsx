import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { AppDarkTheme, AppLightTheme } from "../../shared/theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  theme: typeof AppLightTheme;
}

const THEME_STORAGE_KEY = "@hisabkit_theme_mode";
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value) setThemeModeState(value as ThemeMode);
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const isDark = themeMode === "system" ? systemColorScheme === "dark" : themeMode === "dark";

  const theme = isDark ? AppDarkTheme : AppLightTheme;

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      isDark,
      theme,
    }),
    [themeMode, isDark, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useAppTheme must be used within ThemeProvider");
  return context;
};
