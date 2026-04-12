import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function StatPill({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'brand' | 'success' | 'danger' | 'neutral' }) {
  const { colors } = useTheme();

  const toneStyle =
    tone === 'brand'
      ? { backgroundColor: colors.brandSoft, borderColor: colors.border }
      : tone === 'success'
        ? { backgroundColor: colors.successSoft, borderColor: colors.border }
        : tone === 'danger'
          ? { backgroundColor: colors.dangerSoft, borderColor: colors.border }
          : { backgroundColor: colors.surfaceSoft, borderColor: colors.border };

  return (
    <View style={[styles.wrap, toneStyle]}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
});
