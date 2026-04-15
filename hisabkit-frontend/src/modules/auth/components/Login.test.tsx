import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Login } from './Login';
import * as client from '@/shared/api/client';
import { useAuth } from '@/shared/context/AuthContext';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, def?: string) => def || key,
    i18n: { changeLanguage: vi.fn(), resolvedLanguage: 'en' },
  }),
}));

vi.mock('@/shared/api/client', () => ({
  loginWithUsernamePassword: vi.fn(),
  loginWithGoogleCredential: vi.fn(),
  normalizeAuthSession: vi.fn(),
}));

vi.mock('@/shared/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
    });
    (client.normalizeAuthSession as any).mockReturnValue({
      token: 'test-token',
      user: { username: 'testuser', role: 'ADMIN' },
      tenantId: 'test-tenant',
    });
  });

  it('submits the form and calls login on success', async () => {
    (client.loginWithUsernamePassword as any).mockResolvedValue({ data: {} });

    render(
      <GoogleOAuthProvider clientId="test-id">
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign in with password/i }));

    await waitFor(() => {
      expect(client.loginWithUsernamePassword).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith('test-token', expect.anything(), 'test-tenant');
    });
  });

  it('displays error message on login failure', async () => {
    (client.loginWithUsernamePassword as any).mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(
      <GoogleOAuthProvider clientId="test-id">
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </GoogleOAuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Sign in with password/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeDefined();
  });
});
