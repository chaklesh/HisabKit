/**
 * Centralized environment configuration.
 * All env vars are read from .env via Expo's EXPO_PUBLIC_ prefix.
 * Change values in .env — never hardcode here.
 */

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
} as const;

if (!ENV.API_BASE_URL) {
  console.error('[HisabKit] EXPO_PUBLIC_API_BASE_URL is missing from .env');
}
