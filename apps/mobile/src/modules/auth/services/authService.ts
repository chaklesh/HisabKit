import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken, setTenantId } from "../../../shared/api/apiClient";

const TOKEN_KEY = "@hisabkit_token";
const USER_KEY = "@hisabkit_user";
const TENANT_KEY = "@hisabkit_tenant";
const BIOMETRIC_KEY = "@hisabkit_biometric_enabled";

export interface UserSummary {
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

export interface AuthData {
  token: string;
  tenantId: string;
  tenantSlug: string;
  user: UserSummary;
}

export async function login(username: string, password: string): Promise<AuthData> {
  const res = await api.post("/auth/login", { username, password });
  const data = res.data as AuthData;
  await persistAuth(data);
  return data;
}

export async function googleLogin(credential: string): Promise<AuthData> {
  const res = await api.post("/auth/social/google", { credential });
  const data = res.data as AuthData;
  await persistAuth(data);
  return data;
}

export async function logout() {
  setAuthToken(null);
  setTenantId(null);
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, TENANT_KEY]);
}

export async function restoreSession(): Promise<AuthData | null> {
  const [token, userJson, tenantJson] = await AsyncStorage.multiGet([
    TOKEN_KEY,
    USER_KEY,
    TENANT_KEY,
  ]);
  if (!token[1] || !userJson[1] || !tenantJson[1]) return null;

  setAuthToken(token[1]);
  const tenant = JSON.parse(tenantJson[1]);
  setTenantId(tenant.tenantId);
  return {
    token: token[1],
    tenantId: tenant.tenantId,
    tenantSlug: tenant.tenantSlug,
    user: JSON.parse(userJson[1]),
  };
}

async function persistAuth(data: AuthData) {
  setAuthToken(data.token);
  setTenantId(data.tenantId);
  await AsyncStorage.multiSet([
    [TOKEN_KEY, data.token],
    [USER_KEY, JSON.stringify(data.user)],
    [TENANT_KEY, JSON.stringify({ tenantId: data.tenantId, tenantSlug: data.tenantSlug })],
  ]);
}

export async function getBiometricEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(BIOMETRIC_KEY)) === "true";
}

export async function setBiometricEnabled(enabled: boolean) {
  await AsyncStorage.setItem(BIOMETRIC_KEY, enabled ? "true" : "false");
}
