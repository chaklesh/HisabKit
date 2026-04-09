import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { fetchSummary } from '../services/ledger';

export function HomeScreen() {
  const { user } = useAuth();
  const { isOnline, pendingCount } = useNetwork();
  const [summary, setSummary] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchSummary();
    if (data) setSummary(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const totalSales = summary?.totalSales ?? 0;
  const totalPayments = summary?.totalPayments ?? 0;
  const outstanding = summary?.outstandingDue ?? 0;

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}>
      {/* Offline banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons name="wifi-off" size={16} color={colors.text} />
          <Text style={styles.offlineText}>Offline mode — data from cache</Text>
        </View>
      )}
      {pendingCount > 0 && (
        <View style={styles.pendingBanner}>
          <MaterialCommunityIcons name="cloud-sync-outline" size={16} color={colors.brand} />
          <Text style={styles.pendingText}>{pendingCount} pending sync</Text>
        </View>
      )}

      <View style={styles.hero}>
        <Text style={styles.kicker}>HisabKit Mobile</Text>
        <Text style={styles.title}>Welcome{user?.fullName ? `, ${user.fullName}` : ''}.</Text>
        <Text style={styles.body}>Your business ledger at a glance.</Text>
      </View>

      <View style={styles.metricsRow}>
        <Card title="Total Sales" subtitle="Period total">
          <Text style={styles.metricValue}>₹{Number(totalSales).toLocaleString('en-IN')}</Text>
        </Card>
        <Card title="Payments" subtitle="Collected">
          <Text style={styles.metricValueSuccess}>₹{Number(totalPayments).toLocaleString('en-IN')}</Text>
        </Card>
      </View>

      <Card title="Outstanding Due" subtitle="Amount yet to collect">
        <Text style={styles.metricValueDanger}>₹{Number(outstanding).toLocaleString('en-IN')}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.15)', borderRadius: 12, padding: 10,
  },
  offlineText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: 12, padding: 10,
  },
  pendingText: { color: colors.brand, fontSize: 13, fontWeight: '600' },
  hero: { paddingVertical: 8, gap: 10 },
  kicker: { color: colors.brand, textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, fontWeight: '800' },
  title: { color: colors.text, fontSize: 34, lineHeight: 38, fontWeight: '900' },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  metricsRow: { flexDirection: 'row', gap: 12 },
  metricValue: { color: colors.text, fontSize: 26, fontWeight: '900' },
  metricValueSuccess: { color: colors.success, fontSize: 26, fontWeight: '900' },
  metricValueDanger: { color: colors.danger, fontSize: 26, fontWeight: '900' },
});
