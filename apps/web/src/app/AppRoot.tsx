import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { AppProviders } from "./AppProviders";
import { AppRouter } from "./AppRouter";

export function AppRoot() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  );
}
