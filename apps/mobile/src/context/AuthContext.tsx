import * as LocalAuthentication from "expo-local-authentication";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as authService from "../modules/auth/services/authService";
import type { AuthData, UserSummary } from "../modules/auth/services/authService";

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  isUnlocked: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  user: UserSummary | null;
  tenantId: string | null;
  login: (username: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  enableBiometricLock: () => Promise<boolean>;
  disableBiometricLock: () => Promise<void>;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const appState = useRef(AppState.currentState);

  const checkBiometricAvailability = useCallback(async () => {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && isEnrolled;
  }, []);

  useEffect(() => {
    console.log("[HisabKit] AuthProvider: Re-hydrating session...");
    Promise.all([
      authService.restoreSession().then((d) => {
        console.log("[HisabKit] Session Restored:", !!d);
        return d;
      }),
      authService.getBiometricEnabled().then((b) => {
        console.log("[HisabKit] Biometric Preference:", b);
        return b;
      }),
      checkBiometricAvailability().then((a) => {
        console.log("[HisabKit] Biometric Hardware:", a);
        return a;
      }),
    ])
      .then(([data, biometricPreference, biometricReady]) => {
        if (data) {
          setAuthData(data);
        }
        setBiometricAvailable(biometricReady);
        setBiometricEnabledState(biometricPreference && biometricReady);
        setIsUnlocked(!(data && biometricPreference && biometricReady));
        setIsLoading(false);
        console.log("[HisabKit] AuthProvider: Initialization Complete");
      })
      .catch((err) => {
        console.error("[HisabKit] AuthProvider Error:", err);
        setIsLoading(false);
      });
  }, [checkBiometricAvailability]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appState.current;
      appState.current = nextState;

      if (
        authData &&
        biometricEnabled &&
        (nextState === "background" || nextState === "inactive") &&
        previousState === "active"
      ) {
        setIsUnlocked(false);
      }
    });

    return () => subscription.remove();
  }, [authData, biometricEnabled]);

  const unlockWithBiometrics = useCallback(async () => {
    if (!authData || !biometricEnabled) {
      setIsUnlocked(true);
      return true;
    }

    const ready = await checkBiometricAvailability();
    setBiometricAvailable(ready);
    if (!ready) {
      setBiometricEnabledState(false);
      await authService.setBiometricEnabled(false);
      throw new Error("Biometric authentication is not available on this device.");
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock HisabKit",
      cancelLabel: "Cancel",
      fallbackLabel: "Use device passcode",
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsUnlocked(true);
      return true;
    }

    return false;
  }, [authData, biometricEnabled, checkBiometricAvailability]);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authService.login(username, password);
    setAuthData(data);
    setIsUnlocked(true);
  }, []);

  const googleLogin = useCallback(async (credential: string) => {
    const data = await authService.googleLogin(credential);
    setAuthData(data);
    setIsUnlocked(true);
  }, []);

  const enableBiometricLock = useCallback(async () => {
    const ready = await checkBiometricAvailability();
    setBiometricAvailable(ready);
    if (!ready) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable biometric lock",
      cancelLabel: "Cancel",
      fallbackLabel: "Use device passcode",
      disableDeviceFallback: false,
    });

    if (!result.success) return false;

    await authService.setBiometricEnabled(true);
    setBiometricEnabledState(true);
    setIsUnlocked(true);
    return true;
  }, [checkBiometricAvailability]);

  const disableBiometricLock = useCallback(async () => {
    await authService.setBiometricEnabled(false);
    setBiometricEnabledState(false);
    setIsUnlocked(true);
  }, []);

  const lockApp = useCallback(() => {
    if (authData && biometricEnabled) {
      setIsUnlocked(false);
    }
  }, [authData, biometricEnabled]);

  const logout = useCallback(async () => {
    await authService.logout();
    setAuthData(null);
    setIsUnlocked(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isLoggedIn: !!authData,
        isUnlocked,
        biometricAvailable,
        biometricEnabled,
        user: authData?.user ?? null,
        tenantId: authData?.tenantId ?? null,
        login,
        googleLogin,
        enableBiometricLock,
        disableBiometricLock,
        unlockWithBiometrics,
        lockApp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
