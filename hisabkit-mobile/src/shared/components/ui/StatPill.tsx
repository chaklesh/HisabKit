import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface StatPillProps {
  label: string;
  value: string;
  tone?: 'primary' | 'success' | 'danger' | 'warning';
}

export const StatPill = ({ label, value, tone = 'primary' }: StatPillProps) => {
  const theme = useTheme();

  const getToneColors = () => {
    switch (tone) {
      case 'success':
        return { text: '#10b981', bg: '#ecfdf5' };
      case 'danger':
        return { text: '#ef4444', bg: '#fef2f2' };
      case 'warning':
        return { text: '#f59e0b', bg: '#fffbeb' };
      default:
        return { text: theme.colors.primary, bg: `${theme.colors.primary}15` };
    }
  };

  const colors = getToneColors();

  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
  },
});
