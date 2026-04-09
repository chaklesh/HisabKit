import axios from 'axios';
import { ENV } from '../config/env';

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token?: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
