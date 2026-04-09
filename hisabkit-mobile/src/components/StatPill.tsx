import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function StatPill({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'brand' | 'success' | 'danger' | 'neutral' }) {
  const toneStyle =
    tone === 'brand'
      ? styles.brand
      : tone === 'success'
        ? styles.success
        : tone === 'danger'
          ? styles.danger
          : styles.neutral;

  return (
    <View style={[styles.wrap, toneStyle]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  brand: {
    backgroundColor: '#1b2438',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  success: {
    backgroundColor: '#10261f',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  danger: {
    backgroundColor: '#28121a',
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  neutral: {
    backgroundColor: '#121a2a',
    borderColor: colors.border,
  },
});
