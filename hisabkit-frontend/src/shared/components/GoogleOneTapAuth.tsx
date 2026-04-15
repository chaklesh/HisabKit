import { useEffect, useRef } from 'react';
import { useGoogleOneTapLogin } from '@react-oauth/google';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginWithGoogleCredential, normalizeAuthSession } from '@/shared/api/client';
import { useAuth } from '@/context/AuthContext';

const publicPaths = new Set(['/','/login']);

export const GoogleOneTapAuth = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inFlightRef = useRef(false);
  const disabled = Boolean(user) || !publicPaths.has(location.pathname);

  useGoogleOneTapLogin({
    disabled,
    auto_select: true,
    cancel_on_tap_outside: false,
    onSuccess: async (credentialResponse) => {
      const credential = credentialResponse.credential;
      if (!credential || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      try {
        const response = await loginWithGoogleCredential(credential);
        const session = normalizeAuthSession(response.data);
        login(session.token, session.user, session.tenantId);
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Google sign-in failed. Please continue with your registered account.';
        navigate('/login', { replace: true, state: { authError: message } });
      } finally {
        inFlightRef.current = false;
      }
    },
    onError: () => {
      console.warn('Google One Tap prompt failed to initialize');
    },
  });

  useEffect(() => {
    if (user && publicPaths.has(location.pathname)) {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate, user]);

  return null;
};
