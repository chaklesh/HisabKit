import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BarChart3, BookOpen, LayoutDashboard, Settings } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useAppTheme } from "../providers/ThemeProvider";

import { AdminOverviewScreen } from "../../modules/admin/screens/AdminOverviewScreen";
import { LockScreen } from "../../modules/auth/screens/LockScreen";
import { LoginScreen } from "../../modules/auth/screens/LoginScreen";
import { HomeScreen } from "../../modules/dashboard/screens/HomeScreen";
import { CustomerKhataScreen } from "../../modules/ledger/screens/CustomerKhataScreen";
import { LedgerListScreen } from "../../modules/ledger/screens/LedgerListScreen";
import { ReportsScreen } from "../../modules/reports/screens/ReportsScreen";
import { SettingsScreen } from "../../modules/settings/screens/SettingsScreen";
import type { Customer } from "../../shared/types/ledger";

export type AppTabParamList = {
  Dashboard: undefined;
  LedgerStackRoute: NavigatorScreenParams<LedgerStackParamList>;
  Reports: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AdminOverview: undefined;
};

export type LedgerStackParamList = {
  LedgerList: undefined;
  CustomerKhata: { customer: Customer };
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const LedgerStack = createNativeStackNavigator<LedgerStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function LedgerStackNavigator() {
  return (
    <LedgerStack.Navigator screenOptions={{ headerShown: false }}>
      <LedgerStack.Screen name="LedgerList" component={LedgerListScreen} />
      <LedgerStack.Screen name="CustomerKhata" component={CustomerKhataScreen} />
    </LedgerStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} />
      <SettingsStack.Screen name="AdminOverview" component={AdminOverviewScreen} />
    </SettingsStack.Navigator>
  );
}

export function RootNavigator() {
  const { isLoading, isLoggedIn, isUnlocked } = useAuth();
  const { theme } = useAppTheme();

  console.log("[HisabKit] RootNavigator Status:", { isLoading, isLoggedIn, isUnlocked });

  if (isLoading) {
    console.log("[HisabKit] Rendering Loader Screen");
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          variant="labelLarge"
          style={{ marginTop: 20, color: theme.colors.onSurfaceVariant, fontWeight: "800" }}
        >
          Initializing Enterprise Ledger...
        </Text>
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
        tabBarInactiveTintColor: "#94a3b8",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          ...Platform.select({
            web: {
              boxShadow: "0 -10px 20px rgba(0,0,0,0.1)",
            },
            default: {
              elevation: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800",
          marginTop: -4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <LayoutDashboard
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="LedgerStackRoute"
        component={LedgerStackNavigator}
        options={{
          tabBarLabel: "Ledger",
          tabBarIcon: ({ color, focused, size }) => (
            <BookOpen
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, focused, size }) => (
            <BarChart3
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Settings size={focused ? 24 : 22} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
