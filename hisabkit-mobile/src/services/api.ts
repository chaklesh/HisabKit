import axios from 'axios';

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
});

export function setAuthToken(token?: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }

  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
