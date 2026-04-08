import { LogOut, ShieldCheck, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appModules } from '../modules/moduleRegistry';
import { useAuth } from '../context/AuthContext';

const titleByRoute: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ledger': 'Customer Ledger',
  '/admin': 'Admin Console',
  '/profile': 'Profile Settings',
};

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const title = titleByRoute[location.pathname] || 'HisabKit';

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <aside className="hidden border-r border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">HisabKit</p>
            <h1 className="mt-1 text-lg font-black text-slate-900">MSME Finance</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {appModules.map((module) => {
              const Icon = module.icon;
              const isActive = location.pathname === module.route;
              const label = t(`shell.modules.${module.id}`, module.label);
              if (!module.enabled) {
                return (
                  <div key={module.id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {t('shell.soon', 'Soon')}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={module.id}
                  to={module.route}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-[#1e293b] text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}

            {user?.role === 'SUPER_ADMIN' ? (
              <Link
                to="/admin"
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  location.pathname === '/admin' ? 'bg-[#1e293b] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Console
              </Link>
            ) : null}

            <Link
              to="/profile"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                location.pathname === '/profile' ? 'bg-[#1e293b] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <UserRound className="h-4 w-4" />
              Profile
            </Link>
          </nav>

          <div className="border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              {t('common.logout', 'Logout')}
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t('shell.workspace', 'Workspace')}</p>
              <h2 className="text-lg font-black text-slate-900">{title}</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {user?.username}
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {appModules
              .filter((module) => module.enabled)
              .map((module) => {
                const isActive = location.pathname === module.route;
                return (
                  <Link
                    key={module.id}
                    to={module.route}
                    className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {t(`shell.modules.${module.id}`, module.label)}
                  </Link>
                );
              })}
            {user?.role === 'SUPER_ADMIN' ? (
              <Link
                to="/admin"
                className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                  location.pathname === '/admin'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                {t('shell.admin', 'Admin')}
              </Link>
            ) : null}
            <Link
              to="/profile"
              className={`whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                location.pathname === '/profile'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}
            >
              {t('shell.profile', 'Profile')}
            </Link>
          </div>
        </header>

        <main className="px-3 py-4 sm:px-5">{children}</main>
      </div>
    </div>
  );
};
