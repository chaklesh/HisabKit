import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { LayoutDashboard, BookOpen, BarChart3, Settings } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../providers/ThemeProvider';

// Import screens from modules
import { LoginScreen } from '../../modules/auth/screens/LoginScreen';
import { LockScreen } from '../../modules/auth/screens/LockScreen';
import { HomeScreen } from '../../modules/dashboard/screens/HomeScreen';
import { LedgerListScreen } from '../../modules/ledger/screens/LedgerListScreen';
import { CustomerKhataScreen } from '../../modules/ledger/screens/CustomerKhataScreen';
import { ReportsScreen } from '../../modules/reports/screens/ReportsScreen';
import { SettingsScreen } from '../../modules/settings/screens/SettingsScreen';

export type AppTabParamList = {
  Dashboard: undefined;
  LedgerStackRoute: NavigatorScreenParams<LedgerStackParamList>;
  Reports: undefined;
  Settings: undefined;
};

export type LedgerStackParamList = {
  LedgerList: undefined;
  CustomerKhata: { customer: any }; // Replace any with proper type from shared
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const LedgerStack = createNativeStackNavigator<LedgerStackParamList>();

function LedgerStackNavigator() {
  return (
    <LedgerStack.Navigator screenOptions={{ headerShown: false }}>
      <LedgerStack.Screen name="LedgerList" component={LedgerListScreen} />
      <LedgerStack.Screen name="CustomerKhata" component={CustomerKhataScreen} />
    </LedgerStack.Navigator>
  );
}

export function RootNavigator() {
  const { isLoading, isLoggedIn, isUnlocked } = useAuth();
  const { theme } = useAppTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => <LayoutDashboard size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      <Tab.Screen
        name="LedgerStackRoute"
        component={LedgerStackNavigator}
        options={{
          tabBarLabel: 'Ledger',
          tabBarIcon: ({ color, focused }) => <BookOpen size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => <BarChart3 size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => <Settings size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />,
        }}
      />
    </Tab.Navigator>
  );
}
