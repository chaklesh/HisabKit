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
} from '@/shared/api/client';
import { env } from '@/shared/config/env';
import { useAuth } from '@/shared/context/AuthContext';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';

const googleClientId = env.googleClientId;

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { i18n, t } = useTranslation();
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
      setError(apiError.response?.data?.message || t('login.error', 'Invalid username or password'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError(t('login.google_no_token', 'Google did not return an ID token. Please try again.'));
      return;
    }

    setIsGoogleLoading(true);
    setError('');

    try {
      const response = await loginWithGoogleCredential(credentialResponse.credential);
      finishAuth(response.data);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || t('login.google_failed', 'Google sign-in failed. Please try again.'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.resolvedLanguage === 'hi' ? 'en' : 'hi';
    void i18n.changeLanguage(nextLang);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(46,58,89,0.15),_transparent_34%),linear-gradient(180deg,var(--color-surface-subtle)_0%,#eef2ff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(46,58,89,0.3),_transparent_34%),linear-gradient(180deg,#0f172a_0%,#020617_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-slate-200/10 bg-slate-900 p-6 text-white shadow-2xl shadow-slate-300/40 sm:p-8 dark:border-slate-800">
            <div className="flex items-start justify-between gap-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('login.back_to_landing', 'Back to landing')}
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="rounded-full border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
              >
                <Languages className="h-4 w-4 mr-2" />
                {i18n.resolvedLanguage === 'hi' ? t('login.switch_to_english', 'English') : t('login.switch_to_hindi', 'Hindi')}
              </Button>
            </div>

            <div className="mt-10 space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-medium text-emerald-200">
                <Sparkles className="h-4 w-4" />
                {t('login.secure_access', 'Secure access to HisabKit')}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{t('login.hero_title', 'Login to your Shop')}</h1>
                <p className="max-w-xl text-base leading-7 text-slate-300">
                  {t(
                    'login.hero_description',
                    'Access your enterprise ledger to manage customer accounts, credits, and file attachments securely.'
                  )}
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <h2 className="mt-4 text-sm font-bold text-white">{t('login.feature_data_title', 'Isolated Shop Data')}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {t('login.feature_data_description', 'Every request is scoped to your specific shop ensuring absolute data privacy.')}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <LockKeyhole className="h-6 w-6 text-sky-300" />
                <h2 className="mt-4 text-sm font-bold text-white">{t('login.feature_i18n_title', 'Multilingual Support')}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {t('login.feature_i18n_description', 'Switch seamlessly between English and Hindi interface after logging in.')}
                </p>
              </div>
            </div>
          </section>

          <Card className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/40 sm:p-8 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('login.sign_in', 'Sign in')}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{t('login.shopkeeper_login', 'Shopkeeper Login')}</h2>
              </div>
              <div className="rounded-2xl bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {t('login.enterprise_security', 'Enterprise Security')}
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('login.username', 'Username')}</span>
                <Input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="rounded-2xl border-slate-300 dark:border-slate-700 h-12"
                  placeholder={t('login.username_placeholder', 'Enter your username')}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('login.password', 'Password')}</span>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="rounded-2xl border-slate-300 dark:border-slate-700 h-12"
                  placeholder={t('login.password_placeholder', 'Enter your password')}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-900/20 dark:border-rose-900/30 dark:text-rose-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isLoading ? t('login.signing_in', 'Signing in...') : t('login.sign_in_password', 'Sign in with password')}
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('common.or', 'or')}</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="space-y-4">
              {googleClientId ? (
                <div className="flex justify-center w-full max-w-[400px] mx-auto">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError(t('login.google_start_failed', 'Google sign-in could not start. Please try again.'))}
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400">
                  {t('login.google_not_configured_prefix', 'Google sign-in is not configured yet. Add')}{' '}
                  <span className="font-semibold">VITE_GOOGLE_CLIENT_ID</span>{' '}
                  {t('login.google_not_configured_suffix', 'to enable it. Password sign-in is still available.')}
                </div>
              )}

              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                {t('login.footer_note', 'Manage your MSME business finances with peace of mind.')}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
