import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from "react-native-paper";
import { palette } from "./palette";

const { LightTheme: AdaptLightTheme, DarkTheme: AdaptDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

export const AppLightTheme = {
  ...MD3LightTheme,
  ...AdaptLightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...AdaptLightTheme.colors,
    primary: palette.light.primary,
    onPrimary: palette.light.primaryForeground,
    secondary: palette.light.secondary,
    onSecondary: palette.light.secondaryForeground,
    background: palette.light.background,
    onBackground: palette.light.foreground,
    surface: palette.light.card,
    onSurface: palette.light.cardForeground,
    outline: palette.light.border,
    error: palette.light.destructive,
    onError: palette.light.destructiveForeground,
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  ...AdaptDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...AdaptDarkTheme.colors,
    primary: palette.dark.primary,
    onPrimary: palette.dark.primaryForeground,
    secondary: palette.dark.secondary,
    onSecondary: palette.dark.secondaryForeground,
    background: palette.dark.background,
    onBackground: palette.dark.foreground,
    surface: palette.dark.card,
    onSurface: palette.dark.cardForeground,
    outline: palette.dark.border,
    error: palette.dark.destructive,
    onError: palette.dark.destructiveForeground,
  },
};
