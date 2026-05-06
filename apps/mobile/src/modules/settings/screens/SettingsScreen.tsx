import { type NavigationProp, useNavigation } from "@react-navigation/native";
import {
  Bell,
  ChevronRight,
  FileText,
  Fingerprint,
  Globe,
  HelpCircle,
  LogOut,
  Mail,
  Moon,
  RefreshCcw,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react-native";
import type React from "react";
import { Alert, Platform, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { Avatar, Divider, Text, useTheme } from "react-native-paper";
import { useAppTheme } from "../../../app/providers/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { useNetwork } from "../../../context/NetworkContext";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { Screen } from "../../../shared/components/ui/Screen";

export function SettingsScreen() {
  const theme = useTheme();
  const {
    user,
    logout,
    biometricAvailable,
    biometricEnabled,
    enableBiometricLock,
    disableBiometricLock,
    lockApp,
  } = useAuth();


  const { isOnline, pendingCount, syncNow } = useNetwork();
  const { themeMode, setThemeMode } = useAppTheme();
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  const navigation = useNavigation<NavigationProp<any>>();

  const handleSync = async () => {
    const synced = await syncNow();
    Alert.alert(
      "Sync Complete",
      synced > 0 ? `${synced} operations synchronized.` : "Everything is already up to date.",
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const name = user?.fullName || user?.username || "HisabKit User";
  const email = user?.email || "Configure email in dashboard";

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Settings
        </Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Avatar.Text
          size={80}
          label={name.slice(0, 1).toUpperCase()}
          style={styles.avatar}
          labelStyle={styles.avatarLabel}
        />
        <Text variant="headlineSmall" style={styles.profileName}>
          {name}
        </Text>
        <Text variant="bodyMedium" style={styles.profileEmail}>
          {email}
        </Text>
        <TouchableOpacity style={styles.editBadge} onPress={() => {}}>
          <Text variant="labelSmall" style={styles.editBadgeText}>
            EDIT PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            PREFERENCES
          </Text>
        </View>
        <Card style={styles.groupCard}>
          <SettingItem
            icon={
              <Sun size={20} color={themeMode === "light" ? theme.colors.primary : "#64748b"} />
            }
            label="Light Theme"
            onPress={() => setThemeMode("light")}
            right={
              <Switch
                value={themeMode === "light"}
                onValueChange={(val) => {
                  if (val) setThemeMode("light");
                }}
              />
            }
          />
          <Divider style={styles.divider} />
          <SettingItem
            icon={
              <Moon size={20} color={themeMode === "dark" ? theme.colors.primary : "#64748b"} />
            }
            label="Dark Theme"
            onPress={() => setThemeMode("dark")}
            right={
              <Switch
                value={themeMode === "dark"}
                onValueChange={(val) => {
                  if (val) setThemeMode("dark");
                }}
              />
            }
          />
          <Divider style={styles.divider} />
          <SettingItem
            icon={<Globe size={20} color="#64748b" />}
            label="Language"
            right={
              <Text variant="bodyMedium" style={styles.rightVal}>
                English (IN)
              </Text>
            }
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            SECURITY & DATA
          </Text>
        </View>
        <Card style={styles.groupCard}>
          {biometricAvailable && (
            <>
              <SettingItem
                icon={
                  <Fingerprint
                    size={20}
                    color={biometricEnabled ? theme.colors.primary : "#64748b"}
                  />
                }
                label="Biometric Lock"
                right={
                  <Switch
                    value={biometricEnabled}
                    onValueChange={(val) => {
                      if (val) enableBiometricLock();
                      else disableBiometricLock();
                    }}
                  />
                }
              />
              <Divider style={styles.divider} />
            </>
          )}
          <SettingItem
            icon={<RefreshCcw size={20} color="#64748b" />}
            label="Cloud Sync"
            onPress={handleSync}
            right={
              <View style={styles.syncRight}>

                {pendingCount > 0 && <View style={styles.dot} />}
                <ChevronRight size={18} color="#cbd5e1" />
              </View>
            }
          />
        </Card>

        {(user?.role === "SUPER_ADMIN" || user?.role === "ROLE_SUPER_ADMIN") && (
          <>
            <View style={styles.sectionHeader}>
              <Text variant="labelLarge" style={styles.sectionLabel}>
                ADMINISTRATION
              </Text>
            </View>
            <Card style={styles.groupCard}>
              <SettingItem
                icon={<ShieldCheck size={20} color={theme.colors.primary} />}
                label="Admin Console"
                onPress={() => navigation.navigate("AdminOverview")}
                right={<ChevronRight size={18} color="#cbd5e1" />}
              />
            </Card>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            SUPPORT
          </Text>
        </View>
        <Card style={styles.groupCard}>
          <SettingItem icon={<HelpCircle size={20} color="#64748b" />} label="Help Center" />
          <Divider style={styles.divider} />
          <SettingItem icon={<FileText size={20} color="#64748b" />} label="Terms of Service" />
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text variant="titleMedium" style={styles.logoutText}>
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text variant="labelSmall" style={styles.version}>
          HISABKIT V1.2.0 PRE-RELEASE
        </Text>
      </View>
    </Screen>
  );
}

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

const SettingItem = ({ icon, label, right, onPress }: SettingItemProps) => (
  <TouchableOpacity style={styles.item} onPress={onPress} disabled={!onPress}>
    <View style={styles.itemLeft}>
      <View style={styles.iconBox}>{icon}</View>
      <Text variant="bodyLarge" style={styles.itemLabel}>
        {label}
      </Text>
    </View>
    {right}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontWeight: "900",
    color: "#1e293b",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: "#f1f5f9",
    ...Platform.select({
      web: {
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      },
      default: {
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  avatarLabel: {
    color: "#6366f1",
    fontWeight: "900",
    fontSize: 32,
  },
  profileName: {
    fontWeight: "900",
    marginTop: 16,
    color: "#1e293b",
  },
  profileEmail: {
    color: "#64748b",
    marginTop: 4,
  },
  editBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    marginTop: 12,
  },
  editBadgeText: {
    color: "#6366f1",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sectionLabel: {
    color: "#94a3b8",
    fontWeight: "900",
    letterSpacing: 2,
    fontSize: 10,
  },
  groupCard: {
    borderRadius: 24,
    paddingVertical: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  itemLabel: {
    fontWeight: "700",
    color: "#334155",
  },
  rightVal: {
    color: "#6366f1",
    fontWeight: "700",
  },
  syncRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
  },
  divider: {
    marginHorizontal: 16,
    opacity: 0.5,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fee2e2",
    ...Platform.select({
      web: {
        boxShadow: "0 2px 5px rgba(239, 68, 68, 0.1)",
      },
      default: {
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
    }),
  },
  logoutText: {
    color: "#ef4444",
    fontWeight: "900",
  },
  version: {
    textAlign: "center",
    marginTop: 32,
    color: "#cbd5e1",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
