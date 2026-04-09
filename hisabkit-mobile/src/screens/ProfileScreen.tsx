import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isOnline, pendingCount, syncNow } = useNetwork();

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

  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>Profile</Text>
        <Text style={styles.title}>Account & Settings</Text>
      </View>

      <Card title="Account">
        <Row label="Username" value={user?.username ?? '-'} />
        <Row label="Name" value={user?.fullName ?? '-'} />
        <Row label="Email" value={user?.email ?? '-'} />
        <Row label="Role" value={user?.role ?? '-'} />
      </Card>

      <Card title="Sync Status">
        <Row label="Network" value={isOnline ? 'Online' : 'Offline'} />
        <Row label="Pending" value={`${pendingCount} operation(s)`} />
        <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
          <MaterialCommunityIcons name="cloud-sync-outline" size={18} color={colors.background} />
          <Text style={styles.syncBtnText}>Sync now</Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.brand, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, fontWeight: '800', marginBottom: 6 },
  title: { color: colors.text, fontSize: 28, fontWeight: '900' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { color: colors.textMuted, fontSize: 13 },
  value: { color: colors.text, fontSize: 13, fontWeight: '700' },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 12, marginTop: 8,
  },
  syncBtnText: { color: colors.background, fontWeight: '800', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.12)', borderRadius: 14, paddingVertical: 14,
  },
  logoutText: { color: colors.danger, fontWeight: '800', fontSize: 15 },
});
