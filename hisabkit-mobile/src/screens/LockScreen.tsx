import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function LockScreen() {
  const { unlockWithBiometrics, logout } = useAuth();
  const { colors } = useTheme();
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    setUnlocking(true);
    setError('');
    try {
      const unlocked = await unlockWithBiometrics();
      if (!unlocked) {
        setError('Unlock cancelled. Use fingerprint or Face ID to continue.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to unlock right now.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <LinearGradient colors={[colors.backgroundAccent, colors.background]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.badge, { backgroundColor: colors.brandSoft }]}>
              <MaterialCommunityIcons name="shield-lock-outline" size={34} color={colors.brand} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>HisabKit is locked</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Unlock your khata with fingerprint or Face ID before viewing balances and customer entries.
            </Text>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerSoft }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.brand }]}
              onPress={handleUnlock}
              disabled={unlocking}
            >
              {unlocking ? (
                <ActivityIndicator color={colors.onBrand} size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="fingerprint" size={18} color={colors.onBrand} />
                  <Text style={[styles.primaryButtonText, { color: colors.onBrand }]}>Unlock now</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surfaceSoft }]}
              onPress={logout}
              disabled={unlocking}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Logout instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    gap: 18,
  },
  badge: {
    alignSelf: 'flex-start',
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: { fontSize: 15, lineHeight: 22 },
  errorBox: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: { fontSize: 13, fontWeight: '700' },
  primaryButton: {
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: { fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '800' },
});
