import { env } from "@/shared/config/env";
import type { AuthSession } from "@/shared/types";
/**
 * shared/api/client.ts
 * Single Axios instance used across the entire app.
 * - Attaches JWT + X-TenantID on every request.
 * - Handles 401 by clearing auth and redirecting to login.
 */
import axios from "axios";

const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("hisabkit_token");
  const tenantId = localStorage.getItem("hisabkit_tenant_id");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tenantId) config.headers["X-TenantID"] = tenantId;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("hisabkit_token");
      localStorage.removeItem("hisabkit_tenant_id");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth normalization helpers used by multiple modules
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const normalizeAvatarUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const s = value.trim();
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return undefined;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("http://")) return `https://${s.slice(7)}`;
  return s;
};

export const normalizeAuthSession = (value: unknown): AuthSession => {
  if (!isRecord(value)) throw new Error("Invalid auth response");

  const token = typeof value.token === "string" ? value.token : "";
  const tenantId = typeof value.tenantId === "string" ? value.tenantId : "";
  const tenantSlug = typeof value.tenantSlug === "string" ? value.tenantSlug : undefined;
  const user = isRecord(value.user)
    ? {
        username: typeof value.user.username === "string" ? value.user.username : "",
        role: typeof value.user.role === "string" ? value.user.role : "",
        fullName: typeof value.user.fullName === "string" ? value.user.fullName : undefined,
        email: typeof value.user.email === "string" ? value.user.email : undefined,
        mobile: typeof value.user.mobile === "string" ? value.user.mobile : undefined,
        avatarUrl: normalizeAvatarUrl(value.user.avatarUrl),
      }
    : { username: "", role: "" };

  if (!token || !tenantId || !user.username || !user.role) {
    throw new Error("Invalid auth response");
  }
  return { token, tenantId, tenantSlug, user };
};

export default api;
