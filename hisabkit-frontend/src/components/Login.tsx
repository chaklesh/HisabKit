import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { ArrowLeft, Languages, Loader2, Sparkles, ShieldCheck, LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  loginWithGoogleCredential,
  loginWithUsernamePassword,
  normalizeAuthSession,
} from '../api/api';
import { env } from '../config/env';
import { useAuth } from '../context/AuthContext';

const googleClientId = env.googleClientId;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const incomingError = (location.state as { authError?: string } | null)?.authError;
    if (incomingError) {
      setError(incomingError);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const finishAuth = (payload: unknown) => {
    const session = normalizeAuthSession(payload);
    login(session.token, session.user, session.tenantId);
    navigate('/dashboard', { replace: true });
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginWithUsernamePassword({ username, password });
      finishAuth(response.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError('Google did not return an ID token. Please try again.');
      return;
    }

    setIsGoogleLoading(true);
    setError('');

    try {
      const response = await loginWithGoogleCredential(credentialResponse.credential);
      finishAuth(response.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.resolvedLanguage === 'hi' ? 'en' : 'hi';
    void i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(46,58,89,0.15),_transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-[#111827] p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to landing
              </Link>

              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                <Languages className="h-4 w-4" />
                {i18n.resolvedLanguage === 'hi' ? 'English' : 'Hindi'}
              </button>
            </div>

            <div className="mt-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-200">
                <Sparkles className="h-4 w-4" />
                Secure access to HisabKit
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Login to your Shop</h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  Access your enterprise ledger to manage customer accounts, credits, and file attachments securely.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <h2 className="mt-4 text-sm font-bold text-white">Isolated Shop Data</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Every request is scoped to your specific shop ensuring absolute data privacy.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <LockKeyhole className="h-6 w-6 text-sky-300" />
                <h2 className="mt-4 text-sm font-bold text-white">Multilingual Support</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Switch seamlessly between English and Hindi interface after logging in.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/40 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Sign in</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Shopkeeper Login</h2>
              </div>
              <div className="rounded-2xl bg-[#2E3A59]/10 px-3 py-2 text-xs font-semibold text-[#2E3A59]">
                Enterprise Security
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Username</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#2E3A59] focus:ring-4 focus:ring-[#2E3A59]/10"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-[#2E3A59] focus:ring-4 focus:ring-[#2E3A59]/10"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E3A59] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#1f2840] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Signing in...' : 'Sign in with password'}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-4">
              {googleClientId ? (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Google sign-in could not start. Please try again.')}
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                    width="100%"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  Google sign-in is not configured yet. Add <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span>{' '}
                  to enable it. Password sign-in is still available.
                </div>
              )}

              <p className="text-sm leading-6 text-slate-500">
                Manage your building material or hardware business with peace of mind.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
