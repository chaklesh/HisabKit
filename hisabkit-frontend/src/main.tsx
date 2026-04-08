import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
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

const app = (
  <React.StrictMode>
    <AuthProvider>
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <App />
        </GoogleOAuthProvider>
      ) : (
        <App />
      )}
    </AuthProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(rootElement).render(app);
