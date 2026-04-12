import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ENV } from '../config/env';

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const { login, googleLogin, biometricAvailable } = useAuth();
  const { colors } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    clientId: ENV.GOOGLE_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      if (response?.type === 'error') {
        setGoogleLoading(false);
        setError('Google sign-in could not be completed.');
      }
      return;
    }

    const idToken = response.params?.id_token ?? response.authentication?.idToken;
    if (!idToken) {
      setGoogleLoading(false);
      setError('Google sign-in did not return an ID token.');
      return;
    }

    setError('');
    googleLogin(idToken)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Google sign-in failed';
        setError(msg);
      })
      .finally(() => setGoogleLoading(false));
  }, [googleLogin, response]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Login failed'
          : err instanceof Error
            ? err.message
            : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!request) {
      setError('Google sign-in is not configured yet. Add the Google client IDs in .env first.');
      return;
    }

    setError('');
    setGoogleLoading(true);
    const result = await promptAsync();
    if (result.type !== 'success') {
      setGoogleLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.backgroundAccent, colors.background]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.logoBadge, { backgroundColor: colors.brandSoft }]}>
                <MaterialCommunityIcons name="book-open-page-variant" size={34} color={colors.brand} />
              </View>
              <Text style={[styles.brandName, { color: colors.text }]}>HisabKit</Text>
              <Text style={[styles.tagline, { color: colors.textMuted }]}>Fast khata bookkeeping for daily business.</Text>
              <View style={styles.heroStats}>
                <InfoChip label="Collect faster" value="Dues" colors={colors} />
                <InfoChip label="Track entries" value="Khata" colors={colors} />
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Sign in</Text>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: colors.dangerSoft }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
                  <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Username</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textMuted }]}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={[styles.loginBtn, { backgroundColor: colors.brand }, loading && styles.loginBtnDisabled]} onPress={handleLogin} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={colors.onBrand} size="small" />
                ) : (
                  <Text style={[styles.loginBtnText, { color: colors.onBrand }]}>Continue to ledger</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textMuted }]}>OR</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.socialBtn, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}
                onPress={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color={colors.brand} size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="google" size={18} color={colors.brand} />
                    <Text style={[styles.socialBtnText, { color: colors.text }]}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={[styles.helperStrip, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
                <MaterialCommunityIcons
                  name={biometricAvailable ? 'fingerprint' : 'shield-check-outline'}
                  size={16}
                  color={colors.brand}
                />
                <Text style={[styles.helperText, { color: colors.textMuted }]}>
                  {biometricAvailable
                    ? 'Turn on fingerprint or Face ID lock from Profile after sign-in.'
                    : 'Google sign-in is ready. Biometric lock appears when the device supports it.'}
                </Text>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function InfoChip({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>['colors'] }) {
  return (
    <View style={[styles.infoChip, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <Text style={[styles.infoChipLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoChipValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 22 },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 12,
  },
  logoBadge: {
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 18,
  },
  brandName: { fontSize: 34, fontWeight: '900' },
  tagline: { fontSize: 15, lineHeight: 22 },
  heroStats: { flexDirection: 'row', gap: 10 },
  infoChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  infoChipLabel: { fontSize: 12, fontWeight: '700' },
  infoChipValue: { fontSize: 20, fontWeight: '900' },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  cardTitle: { fontSize: 20, fontWeight: '800' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 10,
  },
  errorText: { fontSize: 13, flex: 1 },
  inputGroup: { gap: 6 },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 44 },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  loginBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: 16, fontWeight: '800' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  socialBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  socialBtnText: { fontSize: 15, fontWeight: '800' },
  helperStrip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  helperText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
