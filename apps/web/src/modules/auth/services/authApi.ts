import api from "@/shared/api/client";
import type { AuthSession } from "@/shared/types";

export const loginWithUsernamePassword = (payload: { username: string; password: string }) =>
  api.post<AuthSession>("/auth/login", payload);

export const loginWithGoogleCredential = (credential: string) =>
  api.post<AuthSession>("/auth/social/google", { idToken: credential, credential });
