import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';

export function ProfileScreen() {
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
  const { mode, setMode, colors } = useTheme();

  const handleSync = async () => {
    const synced = await syncNow();
    Alert.alert('Sync', synced > 0 ? `${synced} items synced successfully.` : 'Nothing to sync.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      await disableBiometricLock();
      Alert.alert('Biometric lock', 'Fingerprint / Face ID lock has been turned off.');
      return;
    }

    const enabled = await enableBiometricLock();
    if (!enabled) {
      Alert.alert('Biometric lock', 'Set up fingerprint or Face ID on this device before enabling app lock.');
      return;
    }

    Alert.alert('Biometric lock', 'Fingerprint / Face ID lock is now active for HisabKit.');
  };

  const handleLockNow = () => {
    lockApp();
  };

  return (
    <Screen>
      <SectionHeader title="Profile & settings" subtitle="Control sync status, account details, and visual theme." />

      <Card>
        <View style={styles.profileTop}>
          <View style={[styles.avatar, { backgroundColor: colors.brandSoft }]}>
            <Text style={[styles.avatarText, { color: colors.brand }]}>{(user?.fullName || user?.username || 'U').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || user?.username || 'HisabKit user'}</Text>
            <Text style={[styles.profileMeta, { color: colors.textMuted }]}>{user?.email || 'No email on profile'}</Text>
          </View>
        </View>
      </Card>

      <Card title="Theme mode" subtitle="Users can switch instantly instead of being forced into one look.">
        <View style={styles.themeRow}>
          {(['light', 'dark'] as const).map((themeMode) => {
            const active = themeMode === mode;
            return (
              <TouchableOpacity
                key={themeMode}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: active ? colors.brandSoft : colors.surfaceSoft,
                    borderColor: active ? colors.brand : colors.border,
                  },
                ]}
                onPress={() => setMode(themeMode)}
              >
                <MaterialCommunityIcons
                  name={themeMode === 'light' ? 'white-balance-sunny' : 'moon-waning-crescent'}
                  size={18}
                  color={active ? colors.brand : colors.textMuted}
                />
                <Text style={[styles.themeChipText, { color: active ? colors.brand : colors.textMuted }]}>
                  {themeMode === 'light' ? 'Light' : 'Dark'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card title="Account">
        <Row label="Username" value={user?.username ?? '-'} colors={colors} />
        <Row label="Name" value={user?.fullName ?? '-'} colors={colors} />
        <Row label="Email" value={user?.email ?? '-'} colors={colors} />
        <Row label="Role" value={user?.role ?? '-'} colors={colors} />
      </Card>

      <Card title="App lock" subtitle="A familiar khata-app safety pattern for shared shop devices.">
        <Row
          label="Biometric support"
          value={biometricAvailable ? 'Available' : 'Unavailable'}
          colors={colors}
        />
        <Row
          label="App lock status"
          value={biometricEnabled ? 'Enabled' : 'Disabled'}
          colors={colors}
        />
        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: colors.brand }]} onPress={handleBiometricToggle}>
          <MaterialCommunityIcons
            name={biometricEnabled ? 'fingerprint-off' : 'fingerprint'}
            size={18}
            color={colors.onBrand}
          />
          <Text style={[styles.syncBtnText, { color: colors.onBrand }]}>
            {biometricEnabled ? 'Disable biometric lock' : 'Enable biometric lock'}
          </Text>
        </TouchableOpacity>
        {biometricEnabled ? (
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}
            onPress={handleLockNow}
          >
            <MaterialCommunityIcons name="lock-outline" size={18} color={colors.text} />
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Lock app now</Text>
          </TouchableOpacity>
        ) : null}
      </Card>

      <Card title="Sync status">
        <Row label="Network" value={isOnline ? 'Online' : 'Offline'} colors={colors} />
        <Row label="Pending queue" value={`${pendingCount} operation(s)`} colors={colors} />
        <TouchableOpacity style={[styles.syncBtn, { backgroundColor: colors.brand }]} onPress={handleSync}>
          <MaterialCommunityIcons name="cloud-sync-outline" size={18} color={colors.onBrand} />
          <Text style={[styles.syncBtnText, { color: colors.onBrand }]}>Sync now</Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.dangerSoft }]} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
      </TouchableOpacity>
    </Screen>
  );
}

function Row({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '900' },
  profileMeta: { fontSize: 13, marginTop: 2 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  themeChipText: { fontSize: 14, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 13 },
  value: { fontSize: 13, fontWeight: '700' },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 8,
  },
  syncBtnText: { fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 10,
    borderWidth: 1,
  },
  secondaryBtnText: { fontWeight: '800', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutText: { fontWeight: '800', fontSize: 15 },
});
