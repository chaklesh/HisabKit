import { Outlet } from 'react-router-dom';
import { AppShell } from './AppShell';

export const ProtectedAppLayout = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};
