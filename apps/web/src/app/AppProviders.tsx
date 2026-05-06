import { env } from "@/shared/config/env";
import { AuthProvider } from "@/shared/context/AuthContext";
import { Toaster } from "@hisabkit/ui/components/Sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import queryClient from "../shared/lib/queryClient";
import { ThemeProvider } from "./ThemeProvider";

import { LayoutProvider } from "@/shared/context/LayoutContext";

export function AppProviders({ children }: PropsWithChildren) {
  const googleClientId = env.googleClientId;
  const content = googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
  ) : (
    children
  );

  return (
    <ThemeProvider>
      <LayoutProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {content}
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </AuthProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
}
