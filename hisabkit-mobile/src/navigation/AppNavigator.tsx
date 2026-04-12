import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LedgerScreen } from '../screens/LedgerScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CustomerKhataScreen } from '../screens/CustomerKhataScreen';
import { LockScreen } from '../screens/LockScreen';

export type AppTabParamList = {
  Home: undefined;
  LedgerStackRoute: NavigatorScreenParams<LedgerStackParamList>;
  Reports: undefined;
  Profile: undefined;
};

export type LedgerStackParamList = {
  LedgerList: undefined;
  CustomerKhata: { customer: import('../types/ledger').Customer };
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const LedgerStack = createNativeStackNavigator<LedgerStackParamList>();

function LedgerStackNavigator() {
  return (
    <LedgerStack.Navigator screenOptions={{ headerShown: false }}>
      <LedgerStack.Screen name="LedgerList" component={LedgerScreen} />
      <LedgerStack.Screen name="CustomerKhata" component={CustomerKhataScreen} />
    </LedgerStack.Navigator>
  );
}

export function AppNavigator() {
  const { isLoading, isLoggedIn, isUnlocked } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (!isUnlocked) {
    return <LockScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="LedgerStackRoute"
        component={LedgerStackNavigator}
        options={{
          tabBarLabel: 'Ledger',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="book-open-page-variant-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-timeline-variant" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
