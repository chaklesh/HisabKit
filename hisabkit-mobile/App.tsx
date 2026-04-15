import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from './src/app/providers/AppProviders';
import { useAppTheme } from './src/app/providers/ThemeProvider';
import { RootNavigator } from './src/app/navigation/RootNavigator';

function Root() {
  const { theme, isDark } = useAppTheme();

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
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

