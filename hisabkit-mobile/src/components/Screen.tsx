import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient colors={[colors.background, '#111b31', '#0b1120']} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
});
