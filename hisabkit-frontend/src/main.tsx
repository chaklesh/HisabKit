import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import createQueryClient from './shared/lib/queryClient';
import App from './App.tsx';
import './index.css';
import './i18n/i18n.ts';
import { AuthProvider } from './context/AuthContext.tsx';
import { env } from './config/env.ts';

const googleClientId = env.googleClientId;
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const qc = createQueryClient();

const app = (
  <React.StrictMode>
    <AuthProvider>
      <QueryClientProvider client={qc}>
        {googleClientId ? (
          <GoogleOAuthProvider clientId={googleClientId}>
            <App />
          </GoogleOAuthProvider>
        ) : (
          <App />
        )}
      </QueryClientProvider>
    </AuthProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(rootElement).render(app);
