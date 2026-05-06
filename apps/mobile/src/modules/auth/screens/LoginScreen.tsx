import * as Google from "expo-auth-session/providers/google";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { BookOpen, Globe, Lock, LogIn, Mail, Shield, ShieldCheck } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, TextInput as PaperInput, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../../app/providers/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../shared/components/ui/Button";
import { Card } from "../../../shared/components/ui/Card";
import { ENV } from "../../../shared/config/env";

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const theme = useTheme();
  const { login, googleLogin, biometricAvailable } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const [_request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: ENV.GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    clientId: ENV.GOOGLE_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params?.id_token ?? response.authentication?.idToken;
      if (idToken) {
        setGoogleLoading(true);
        googleLogin(idToken).catch((err) => {
          setError(err.message || "Google Login Failed");
          setGoogleLoading(false);
        });
      }
    }
  }, [response]);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <LinearGradient
        colors={[theme.colors.primary, "#4338ca"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.headerContent}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <BookOpen size={42} color="white" strokeWidth={2.5} />
            </View>
          </View>
          <Text variant="displaySmall" style={styles.brandTitle}>
            HisabKit
          </Text>
          <Text variant="bodyMedium" style={styles.tagline}>
            Smart Business Ledger & Khata
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.bottomSheet}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.welcomeRow}>
              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                Welcome Back
              </Text>
              <Text variant="bodyMedium" style={styles.welcomeSub}>
                Secure access to your business accounts
              </Text>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: "#fff1f2" }]}>
                <Text style={{ color: "#e11d48", fontWeight: "800", fontSize: 13 }}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <PaperInput
                label="Username or Email"
                value={username}
                onChangeText={setUsername}
                mode="flat"
                style={styles.input}
                activeUnderlineColor={theme.colors.primary}
                left={<PaperInput.Icon icon={() => <Mail size={22} color="#64748b" />} />}
              />

              <PaperInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="flat"
                style={styles.input}
                activeUnderlineColor={theme.colors.primary}
                left={<PaperInput.Icon icon={() => <Lock size={22} color="#64748b" />} />}
                right={
                  <PaperInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#94a3b8"
                  />
                }
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text
                  variant="labelLarge"
                  style={{ color: theme.colors.primary, fontWeight: "800" }}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                style={styles.loginButton}
                contentStyle={{ height: 56 }}
              >
                Sign In to Business
              </Button>
            </View>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text variant="labelSmall" style={styles.dividerText}>
                SECURE LOGIN
              </Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => promptAsync()}
              disabled={googleLoading}
            >
              <View style={styles.socialIconBox}>
                <Globe size={20} color="#4285F4" />
              </View>
              <Text variant="labelLarge" style={styles.socialText}>
                {googleLoading ? "Signing in..." : "Continue with Google Account"}
              </Text>
            </TouchableOpacity>

            <View style={styles.securityInfo}>
              <Shield size={14} color="#94a3b8" />
              <Text variant="labelSmall" style={styles.securityText}>
                Enterprise-grade AES 256 Encryption
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    gap: 12,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
      },
      default: {
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
      },
    }),
  },
  brandTitle: {
    color: "white",
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  tagline: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "700",
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingTop: 8,
  },
  scrollContainer: {
    padding: 32,
  },
  welcomeRow: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontWeight: "900",
    color: "#1e293b",
  },
  welcomeSub: {
    color: "#64748b",
    marginTop: 4,
    fontWeight: "600",
  },
  errorBox: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: "transparent",
    fontSize: 15,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 18,
    ...Platform.select({
      web: {
        boxShadow: "0 4px 10px rgba(99, 102, 241, 0.3)",
      },
      default: {
        elevation: 4,
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  dividerText: {
    color: "#cbd5e1",
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 9,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    paddingRight: 24,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  socialIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
      default: {
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  socialText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "800",
    color: "#475569",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
  },
  securityText: {
    color: "#94a3b8",
    fontWeight: "800",
    fontSize: 10,
  },
});
