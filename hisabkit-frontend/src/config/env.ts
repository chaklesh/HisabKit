const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const rawGoogleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

const isProd = import.meta.env.PROD;

if (isProd && !rawApiUrl) {
  throw new Error('VITE_API_URL is required in production');
}

export const env = {
  apiUrl: rawApiUrl || 'http://localhost:8080/api',
  googleClientId: rawGoogleClientId || '',
} as const;
