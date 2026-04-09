import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import type { Customer } from '../types/ledger';

const sampleCustomers: Customer[] = [
  { id: '1', name: 'Aman Traders', address: 'Indore, MP', dueDate: '2026-04-15', totalBalance: 12500 },
  { id: '2', name: 'Maa Hardware', address: 'Bhopal, MP', dueDate: '2026-04-20', totalBalance: -4200 },
  { id: '3', name: 'Soni Enterprises', address: 'Ujjain, MP', totalBalance: 7800 },
];

export function LedgerScreen() {
  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>Ledger</Text>
        <Text style={styles.title}>Customers and balances</Text>
      </View>

      <Card title="Quick actions" subtitle="Designed for one-hand use.">
        <View style={styles.actionRow}>
          <View style={styles.actionPill}><Text style={styles.actionText}>Add customer</Text></View>
          <View style={styles.actionPill}><Text style={styles.actionText}>Sale</Text></View>
          <View style={styles.actionPill}><Text style={styles.actionText}>Payment</Text></View>
        </View>
      </Card>

      <Card title="Customer list" subtitle="Search, open, and act fast.">
        <FlatList
          data={sampleCustomers}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.customerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerMeta}>{item.address || 'No address'}</Text>
                {item.dueDate ? <Text style={styles.customerDue}>Due {item.dueDate}</Text> : null}
              </View>
              <Text style={[styles.balance, item.totalBalance && item.totalBalance < 0 ? styles.balancePay : styles.balanceCollect]}>
                ₹{Math.abs(item.totalBalance || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          )}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
  },
  actionText: {
    color: colors.text,
    fontWeight: '700',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  customerName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  customerMeta: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12,
  },
  customerDue: {
    color: colors.brand,
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  balance: {
    fontSize: 16,
    fontWeight: '900',
  },
  balanceCollect: {
    color: colors.success,
  },
  balancePay: {
    color: colors.danger,
  },
});
