/**
 * Centralized environment configuration.
 * All env vars are read from .env via Expo's EXPO_PUBLIC_ prefix.
 * Change values in .env — never hardcode here.
 */

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || (__DEV__ ? 'http://localhost:8010/api' : 'https://hisabkit.nayag.com/api'),
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  GOOGLE_ANDROID_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  GOOGLE_IOS_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
} as const;

if (__DEV__ && !ENV.API_BASE_URL) {
  console.warn('[HisabKit] EXPO_PUBLIC_API_BASE_URL is missing from .env');
}
