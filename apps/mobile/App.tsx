import "react-native-gesture-handler";
import "./src/shared/i18n";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { RootNavigator } from "./src/core/navigation/RootNavigator";
import { AppProviders } from "./src/core/providers/AppProviders";
import { useAppTheme } from "./src/core/providers/ThemeProvider";

function Root() {
  const { theme, isDark } = useAppTheme();
  console.log("[HisabKit] Root Rendering - Theme:", isDark ? "Dark" : "Light");

  return (
    <NavigationContainer
      theme={theme}
      onReady={() => console.log("[HisabKit] Navigation Container Ready")}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProviders>
      <Root />
    </AppProviders>
  );
}
