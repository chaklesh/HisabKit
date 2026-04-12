import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { StatPill } from '../components/StatPill';
import { useAuth } from '../context/AuthContext';
import { useNetwork } from '../context/NetworkContext';
import { useTheme } from '../context/ThemeContext';
import { fetchCustomers, fetchSummary } from '../services/ledger';
import type { Customer, LedgerSummary } from '../types/ledger';
import { formatCurrency } from '../utils/format';

export function HomeScreen() {
  const { user } = useAuth();
  const { isOnline, pendingCount } = useNetwork();
  const { colors } = useTheme();
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [summaryData, customersData] = await Promise.all([fetchSummary(), fetchCustomers()]);
    setSummary(summaryData);
    setCustomers(customersData);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const businessStats = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (balance > 0) {
          acc.toCollect += balance;
          acc.collectCount += 1;
        } else if (balance < 0) {
          acc.toPay += Math.abs(balance);
          acc.payCount += 1;
        }
        return acc;
      },
      { toCollect: 0, toPay: 0, collectCount: 0, payCount: 0 }
    );
  }, [customers]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}>
      <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.kicker, { color: colors.brand }]}>Daily Ledger</Text>
            <Text style={[styles.title, { color: colors.text }]}>Namaste{user?.fullName ? `, ${user.fullName}` : ''}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>Keep collections, payments, and customer balances under control.</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: colors.brandSoft }]}>
            <MaterialCommunityIcons name="notebook-outline" size={28} color={colors.brand} />
          </View>
        </View>

        <View style={styles.heroStats}>
          <StatPill label="Collect" value={formatCurrency(businessStats.toCollect)} tone="danger" />
          <StatPill label="Pay" value={formatCurrency(businessStats.toPay)} tone="success" />
        </View>
      </View>

      {!isOnline && (
        <View style={[styles.banner, { backgroundColor: colors.warningSoft }]}>
          <MaterialCommunityIcons name="wifi-off" size={16} color={colors.warning} />
          <Text style={[styles.bannerText, { color: colors.warning }]}>Offline mode: showing cached data.</Text>
        </View>
      )}

      {pendingCount > 0 && (
        <View style={[styles.banner, { backgroundColor: colors.brandSoft }]}>
          <MaterialCommunityIcons name="cloud-sync-outline" size={16} color={colors.brand} />
          <Text style={[styles.bannerText, { color: colors.brand }]}>{pendingCount} item(s) waiting to sync.</Text>
        </View>
      )}

      <SectionHeader title="Today at a glance" subtitle="Critical cashflow numbers and customer health." />

      <View style={styles.metricRow}>
        <Card title="Outstanding" subtitle={`${businessStats.collectCount} customer(s)`}>
          <Text style={[styles.metricValue, { color: colors.danger }]}>{formatCurrency(summary?.outstandingDue ?? 0)}</Text>
        </Card>
        <Card title="Received" subtitle="Payments">
          <Text style={[styles.metricValue, { color: colors.success }]}>{formatCurrency(summary?.totalPayments ?? 0)}</Text>
        </Card>
      </View>

      <Card title="Sales book" subtitle="Business entered in the current summary window">
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Sales value</Text>
          <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(summary?.totalSales ?? 0)}</Text>
        </View>
        <View style={[styles.row, styles.rowLast]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Active customers</Text>
          <Text style={[styles.value, { color: colors.text }]}>{customers.length}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    gap: 16,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
  },
  kicker: { textTransform: 'uppercase', letterSpacing: 1.4, fontSize: 11, fontWeight: '800', marginBottom: 6 },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '900' },
  body: { fontSize: 14, lineHeight: 20, maxWidth: '88%' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: { fontSize: 13, fontWeight: '700' },
  metricRow: { flexDirection: 'row', gap: 12 },
  metricValue: { fontSize: 24, fontWeight: '900' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  label: { fontSize: 13 },
  value: { fontSize: 15, fontWeight: '800' },
});
