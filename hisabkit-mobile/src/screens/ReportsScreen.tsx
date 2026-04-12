import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { SectionHeader } from '../components/SectionHeader';
import { fetchCustomers, fetchSummary } from '../services/ledger';
import type { Customer, LedgerSummary } from '../types/ledger';
import { formatCurrency } from '../utils/format';
import { useTheme } from '../context/ThemeContext';

type BalanceFilter = 'ALL' | 'COLLECT' | 'PAY' | 'SETTLED';

export function ReportsScreen() {
  const { colors } = useTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<LedgerSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<BalanceFilter>('ALL');

  const load = useCallback(async () => {
    const [customerData, summaryData] = await Promise.all([fetchCustomers(), fetchSummary()]);
    setCustomers(customerData);
    setSummary(summaryData);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers
      .filter((customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (filter === 'COLLECT') return balance > 0;
        if (filter === 'PAY') return balance < 0;
        if (filter === 'SETTLED') return balance === 0;
        return true;
      })
      .filter((customer) => {
        if (!term) return true;
        return [customer.name, customer.phone, customer.email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      })
      .sort((left, right) => Math.abs(Number(right.totalBalance ?? 0)) - Math.abs(Number(left.totalBalance ?? 0)));
  }, [customers, filter, search]);

  const totals = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (balance > 0) {
          acc.toCollect += balance;
          acc.collectCount += 1;
        } else if (balance < 0) {
          acc.toPay += Math.abs(balance);
          acc.payCount += 1;
        } else {
          acc.settledCount += 1;
        }
        return acc;
      },
      { toCollect: 0, toPay: 0, collectCount: 0, payCount: 0, settledCount: 0 }
    );
  }, [customers]);

  return (
    <Screen refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}>
      <SectionHeader title="Business reports" subtitle="See dues, advances, and focus customers in one place." />

      <View style={styles.metricGrid}>
        <Card title="To collect" subtitle={`${totals.collectCount} customer(s)`}>
          <Text style={[styles.metricValue, { color: colors.danger }]}>{formatCurrency(totals.toCollect)}</Text>
        </Card>
        <Card title="To pay" subtitle={`${totals.payCount} customer(s)`}>
          <Text style={[styles.metricValue, { color: colors.success }]}>{formatCurrency(totals.toPay)}</Text>
        </Card>
      </View>

      <View style={styles.metricGrid}>
        <Card title="Sales" subtitle="Current summary">
          <Text style={[styles.metricValue, { color: colors.text }]}>{formatCurrency(summary?.totalSales ?? 0)}</Text>
        </Card>
        <Card title="Payments" subtitle="Current summary">
          <Text style={[styles.metricValue, { color: colors.brand }]}>{formatCurrency(summary?.totalPayments ?? 0)}</Text>
        </Card>
      </View>

      <Card title="Focus customers" subtitle="Search and narrow down accounts that need follow-up.">
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
          placeholder="Search by customer, phone, or email"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {(['ALL', 'COLLECT', 'PAY', 'SETTLED'] as BalanceFilter[]).map((option) => {
            const active = option === filter;
            const label = option === 'ALL' ? 'All' : option === 'COLLECT' ? 'Collect' : option === 'PAY' ? 'Pay' : 'Settled';

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.brandSoft : colors.surfaceSoft,
                    borderColor: active ? colors.brand : colors.border,
                  },
                ]}
                onPress={() => setFilter(option)}
              >
                <Text style={[styles.filterChipText, { color: active ? colors.brand : colors.textMuted }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredCustomers.length === 0 ? (
          <View style={[styles.placeholder, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="file-search-outline" size={28} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>No customers match the current filters.</Text>
          </View>
        ) : (
          filteredCustomers.slice(0, 12).map((customer) => {
            const balance = Number(customer.totalBalance ?? 0);
            const tone = balance < 0 ? colors.success : balance > 0 ? colors.danger : colors.textMuted;
            const status = balance < 0 ? 'Advance paid' : balance > 0 ? 'Payment due' : 'Settled';

            return (
              <View key={customer.id} style={[styles.customerRow, { borderBottomColor: colors.border }]}>
                <View style={styles.customerInfo}>
                  <Text style={[styles.customerName, { color: colors.text }]}>{customer.name}</Text>
                  <Text style={[styles.customerMeta, { color: colors.textMuted }]}>{customer.phone || customer.email || status}</Text>
                </View>
                <View style={styles.customerAmountWrap}>
                  <Text style={[styles.customerAmount, { color: tone }]}>{formatCurrency(Math.abs(balance))}</Text>
                  <Text style={[styles.customerStatus, { color: colors.textMuted }]}>{status}</Text>
                </View>
              </View>
            );
          })
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metricGrid: { flexDirection: 'row', gap: 12 },
  metricValue: { fontSize: 24, fontWeight: '900' },
  searchInput: { borderWidth: 1, borderRadius: 14, fontSize: 15, paddingHorizontal: 14, paddingVertical: 10, marginTop: 4, marginBottom: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  placeholder: { minHeight: 140, alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 20, borderWidth: 1, padding: 18 },
  placeholderText: { textAlign: 'center', lineHeight: 20 },
  customerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '800' },
  customerMeta: { fontSize: 12, marginTop: 3 },
  customerAmountWrap: { alignItems: 'flex-end' },
  customerAmount: { fontSize: 15, fontWeight: '900' },
  customerStatus: { fontSize: 11, marginTop: 3 },
});
