import * as client from "@/shared/api/client";
import { useAuth } from "@/shared/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authApi from "../services/authApi";
import { Login } from "./Login";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, def?: string) => def || key,
    i18n: { changeLanguage: vi.fn(), resolvedLanguage: "en" },
  }),
}));

vi.mock("@/shared/api/client", () => ({
  normalizeAuthSession: vi.fn(),
}));

vi.mock("../services/authApi", () => ({
  loginWithUsernamePassword: vi.fn(),
  loginWithGoogleCredential: vi.fn(),
}));

vi.mock("@/shared/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("Login Component", () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (useAuth as any).mockReturnValue({
      login: mockLogin,
    });
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (client.normalizeAuthSession as any).mockReturnValue({
      token: "test-token",
      user: { username: "testuser", role: "ADMIN" },
      tenantId: "test-tenant",
    });
  });

  it("submits the form and calls login on success", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (authApi.loginWithUsernamePassword as any).mockResolvedValue({ data: {} });

    render(
      <GoogleOAuthProvider clientId="test-id">
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </GoogleOAuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign in with password/i }));

    await waitFor(() => {
      expect(authApi.loginWithUsernamePassword).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      });
      expect(mockLogin).toHaveBeenCalledWith("test-token", expect.anything(), "test-tenant");
    });
  });

  it("displays error message on login failure", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (authApi.loginWithUsernamePassword as any).mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(
      <GoogleOAuthProvider clientId="test-id">
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </GoogleOAuthProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter your username/i), {
      target: { value: "wronguser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign in with password/i }));

    expect(await screen.findByText(/Invalid credentials/i)).toBeDefined();
  });
});
