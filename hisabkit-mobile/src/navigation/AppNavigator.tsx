import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { LedgerScreen } from '../screens/LedgerScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type AppTabParamList = {
  Home: undefined;
  Ledger: undefined;
  Reports: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Ledger"
        component={LedgerScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="book-open-page-variant-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-box-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
