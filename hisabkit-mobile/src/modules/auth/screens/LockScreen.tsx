import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ShieldCheck, Fingerprint, LogOut } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/components/ui/Button';
import { useAuth } from '../../../context/AuthContext';

export function LockScreen() {
  const theme = useTheme();
  const { unlockWithBiometrics, logout } = useAuth();
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');

  const handleUnlock = async () => {
    setUnlocking(true);
    setError('');
    try {
      const unlocked = await unlockWithBiometrics();
      if (!unlocked) {
        setError('Unlock cancelled. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to unlock right now.');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#1e293b', '#0f172a']} 
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <ShieldCheck size={48} color={theme.colors.primary} />
        </View>
        
        <Text variant="headlineMedium" style={styles.title}>HisabKit Locked</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Secure access required. Use biometric authentication to unlock your khata ledger.
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text variant="bodySmall" style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleUnlock}
            loading={unlocking}
            icon={() => <Fingerprint size={20} color="white" />}
            style={styles.primaryButton}
          >
            Unlock with Biometrics
          </Button>

          <Button
            mode="text"
            onPress={logout}
            icon={() => <LogOut size={18} color={theme.colors.primary} />}
            labelStyle={{ color: theme.colors.primary }}
          >
            Sign Out
          </Button>
        </View>
      </View>
      
      <Text variant="labelSmall" style={styles.footerText}>
        PROTECTED BY HISABKIT SECURITY
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    color: 'white',
    fontWeight: '900',
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    color: '#f87171',
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 4,
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 2,
    fontWeight: '800',
  },
});
