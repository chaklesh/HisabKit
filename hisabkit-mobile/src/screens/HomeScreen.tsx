import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function HomeScreen() {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>HisabKit Mobile</Text>
        <Text style={styles.title}>Ledger in your pocket.</Text>
        <Text style={styles.body}>Fast customer lookup, quick sale/payment entry, balance visibility, and report export built for mobile use.</Text>
      </View>

      <View style={styles.metricsRow}>
        <Card title="You collect" subtitle="Outstanding receivables">
          <Text style={styles.metricValue}>₹0.00</Text>
        </Card>
        <Card title="You pay" subtitle="Payables">
          <Text style={styles.metricValueDanger}>₹0.00</Text>
        </Card>
      </View>

      <Card title="Next step" subtitle="This mobile app will reuse your existing backend and auth flow.">
        <View style={styles.stepRow}>
          <MaterialCommunityIcons name="check-circle-outline" color={colors.brand} size={20} />
          <Text style={styles.stepText}>Connect login and tenant context</Text>
        </View>
        <View style={styles.stepRow}>
          <MaterialCommunityIcons name="check-circle-outline" color={colors.brand} size={20} />
          <Text style={styles.stepText}>Load customer list and balances</Text>
        </View>
        <View style={styles.stepRow}>
          <MaterialCommunityIcons name="check-circle-outline" color={colors.brand} size={20} />
          <Text style={styles.stepText}>Add quick-sale and payment actions</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingVertical: 8,
    gap: 10,
  },
  kicker: {
    color: colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '900',
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricValue: {
    color: colors.success,
    fontSize: 26,
    fontWeight: '900',
  },
  metricValueDanger: {
    color: colors.danger,
    fontSize: 26,
    fontWeight: '900',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  stepText: {
    color: colors.text,
    fontSize: 14,
  },
});
