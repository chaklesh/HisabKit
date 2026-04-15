import { LogOut, Settings, ShieldCheck, UserRound, LayoutDashboard, HandCoins, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appModules, type AppModule } from '../modules/moduleRegistry';
import { listModuleCatalog } from '@/shared/api/client';
import type { ModuleCatalogItem } from '@/shared/types';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';

const titleKeyByRoute: Record<string, string> = {
  '/dashboard': 'shell.titles.dashboard',
  '/ledger': 'shell.titles.ledger',
  '/inventory': 'shell.titles.inventory',
  '/suppliers': 'shell.titles.suppliers',
  '/lending': 'shell.titles.lending',
  '/admin': 'shell.titles.admin',
  '/profile': 'shell.titles.profile',
  '/settings': 'shell.titles.settings',
};

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [catalog, setCatalog] = useState<ModuleCatalogItem[] | null>(null);

  useEffect(() => {
    let active = true;
    void listModuleCatalog()
      .then((response) => {
        if (active) setCatalog(response.data);
      })
      .catch(() => {
        if (active) setCatalog(null);
      });
    return () => { active = false; };
  }, []);

  const modules = useMemo<AppModule[]>(() => {
    const source = catalog || appModules.map((m) => ({
      key: m.id.toUpperCase(),
      label: m.label,
      route: m.route,
      status: m.enabled ? 'LIVE' : 'PLANNED',
      enabled: m.enabled,
    }));

    return source.map((module) => {
       const fallback = appModules.find((c) => c.route === module.route);
       return {
         id: fallback?.id || 'dashboard',
         label: module.label,
         route: module.route,
         icon: fallback?.icon || LayoutDashboard,
         enabled: module.enabled,
         phase: (module.status === 'LIVE' || module.enabled) ? 'live' : 'planned',
       };
    });
  }, [catalog]);

  const title = t(titleKeyByRoute[location.pathname] || 'shell.titles.default', 'HisabKit');

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-72 border-r border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="flex h-full flex-col">
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <HandCoins className="text-white w-6 h-6" />
               </div>
               <div>
                  <h1 className="text-xl font-black tracking-tighter text-slate-900">HisabKit</h1>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 opacity-80">Enterprise</p>
               </div>
            </div>
          </div>

          <div className="flex-1 px-4 space-y-8 overflow-y-auto py-4 custom-scrollbar">
            <div>
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Core Modules</p>
              <nav className="space-y-1.5">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isActive = location.pathname === module.route;
                  const label = t(`shell.modules.${module.id}`, module.label);
                  
                  return (
                    <Link
                      key={module.id}
                      to={module.enabled ? module.route : '#'}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                        !module.enabled && "opacity-50 cursor-not-allowed",
                        isActive 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-400")} />
                        {label}
                      </div>
                      {!module.enabled ? (
                        <Badge variant="secondary" className="text-[9px] font-black tracking-tighter uppercase px-1.5 h-5 bg-slate-100">Soon</Badge>
                      ) : (
                        isActive && <ChevronRight className="w-4 h-4 opacity-50" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Administration</p>
              <nav className="space-y-1.5">
                {user?.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/admin"
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                      location.pathname === '/admin' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                    )}
                  >
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    Admin Console
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                    location.pathname === '/profile' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  )}
                >
                  <UserRound className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  My Profile
                </Link>
                <Link
                  to="/settings"
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                    location.pathname === '/settings' ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                  )}
                >
                  <Settings className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  Preferences
                </Link>
              </nav>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100 hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        {/* Header Glassmorphism */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="lg:hidden w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">H</div>
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t('shell.workspace', 'Active Organization')}</p>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col items-end">
                  <p className="text-xs font-black text-slate-900">{user?.fullName || user?.username}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Store Management</p>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden shadow-sm">
                  {user?.username?.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
