import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors } from '../theme/colors';

export function ProfileScreen() {
  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>Profile</Text>
        <Text style={styles.title}>Tenant and app settings</Text>
      </View>

      <Card title="Account" subtitle="Login, tenant, branding, and sync settings belong here.">
        <View style={styles.row}><Text style={styles.label}>Business name</Text><Text style={styles.value}>HisabKit</Text></View>
        <View style={styles.row}><Text style={styles.label}>Theme</Text><Text style={styles.value}>Dark / gold</Text></View>
        <View style={styles.row}><Text style={styles.label}>Sync</Text><Text style={styles.value}>Backend API</Text></View>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
  },
  value: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
