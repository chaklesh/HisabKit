import axios from "axios";
import { ENV } from "../config/env";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token?: string | null) {
  if (!token) {
    api.defaults.headers.common.Authorization = undefined;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function setTenantId(tenantId?: string | null) {
  if (!tenantId) {
    api.defaults.headers.common["X-Tenant-ID"] = undefined;
    return;
  }
  api.defaults.headers.common["X-Tenant-ID"] = tenantId;
}
