import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function ReportsScreen() {
  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>Reports</Text>
        <Text style={styles.title}>Standalone reporting panel</Text>
      </View>

      <Card title="Search and filter" subtitle="This screen will hold customer search, balance filters, due date filters, and exports.">
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Report filters and export actions will be wired here next.</Text>
        </View>
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
  placeholder: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: 18,
  },
  placeholderText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
