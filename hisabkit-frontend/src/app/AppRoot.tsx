import { AppProviders } from './AppProviders';
import { AppRouter } from './AppRouter';

export function AppRoot() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
