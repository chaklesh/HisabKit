import { LogOut, Settings, ShieldCheck, UserRound, HandCoins, ChevronRight, Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appModules, type AppModule } from '../modules/moduleRegistry';
import { listModuleCatalog } from '@/shared/api/client';
import type { ModuleCatalogItem } from '@/shared/types';
import { useAuth } from '@/shared/context/AuthContext';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { useLayout } from '@/shared/context/LayoutContext';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';

const titleKeyByRoute: Record<string, string> = {
  '/dashboard': 'shell.titles.dashboard',
  '/ledger': 'shell.titles.ledger',
  '/inventory': 'shell.titles.inventory',
  '/suppliers': 'shell.titles.suppliers',
  '/lending': 'shell.titles.lending',
  '/admin': 'shell.titles.admin',
  '/profile': 'shell.titles.profile',
  '/settings': 'shell.titles.settings',
  '/reports': 'shell.titles.reports',
};

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useLayout();
  const [catalog, setCatalog] = useState<ModuleCatalogItem[] | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    return appModules
      .map((module) => {
        // If we have a catalog from backend, sync enabled status
        const catalogItem = catalog?.find((c) => c.route === module.route);
        return {
          ...module,
          enabled: catalogItem ? catalogItem.enabled : module.enabled,
          phase: (catalogItem?.status === 'LIVE' || module.enabled) ? 'live' as const : 'planned' as const,
        };
      })
      .filter((m) => !settings.hidePlannedModules || m.enabled);
  }, [catalog, settings.hidePlannedModules]);

  const title = t(titleKeyByRoute[location.pathname] || 'shell.titles.default', 'HisabKit');

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex h-full flex-col", mobile ? "pt-2" : "")}>
      <div className={cn("px-8 pt-8 pb-6", mobile && "px-4", !mobile && settings.compactNavigationSidebar && "px-0 flex justify-center")}>
        <div className={cn("flex items-center gap-3", !mobile && settings.compactNavigationSidebar && "flex-col gap-1")}>
           <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <HandCoins className="text-white w-6 h-6" />
           </div>
            {(!mobile && settings.compactNavigationSidebar) ? null : (
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">HisabKit</h1>
                <p className="text-xs font-semibold text-indigo-500 opacity-80">Enterprise</p>
             </div>
            )}
        </div>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto py-4 custom-scrollbar">
        <div>
          {(!mobile && settings.compactNavigationSidebar) ? null : (
            <p className="px-4 text-xs font-bold text-slate-400 mb-4">Core Modules</p>
          )}
          <nav className={cn("space-y-1.5", !mobile && settings.compactNavigationSidebar && "flex flex-col items-center px-0")}>
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = location.pathname === module.route;
              const label = t(`shell.modules.${module.id}`, module.label);
              
              return (
                <Link
                  key={module.id}
                  to={module.enabled ? module.route : '#'}
                  onClick={() => mobile && setIsMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-200",
                    !mobile && settings.compactNavigationSidebar ? "justify-center px-0" : "justify-between",
                    !module.enabled && "opacity-50 cursor-not-allowed",
                    isActive 
                      ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                  )}
                >
                  <div className={cn("flex items-center gap-3", !mobile && settings.compactNavigationSidebar && "justify-center")}>
                    <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-400")} />
                    {(!mobile && settings.compactNavigationSidebar) ? null : label}
                  </div>
                  {(!mobile && settings.compactNavigationSidebar) ? null : (
                    !module.enabled ? (
                      <Badge variant="secondary" className="text-[9px] font-black tracking-tighter uppercase px-1.5 h-5 bg-slate-100">Soon</Badge>
                    ) : (
                      isActive && <ChevronRight className="w-4 h-4 opacity-50" />
                    )
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          {(!mobile && settings.compactNavigationSidebar) ? null : (
            <p className="px-4 text-xs font-bold text-slate-400 mb-4">Administration</p>
          )}
          <nav className={cn("space-y-1.5", !mobile && settings.compactNavigationSidebar && "items-center")}>
            {user?.role === 'SUPER_ADMIN' && (
              <Link
                to="/admin"
                onClick={() => mobile && setIsMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                  !mobile && settings.compactNavigationSidebar ? "justify-center px-0" : "",
                  location.pathname === '/admin' ? "bg-slate-900 dark:bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400"
                )}
              >
                <div className={cn("p-1.5 rounded-lg", location.pathname === '/admin' ? "bg-white/10 dark:bg-white/20" : "bg-indigo-50 dark:bg-indigo-950/50")}>
                  <ShieldCheck className={cn("w-4 h-4", location.pathname === '/admin' ? "text-indigo-100" : "text-indigo-600 dark:text-indigo-400")} />
                </div>
                {(!mobile && settings.compactNavigationSidebar) ? null : "Admin Console"}
              </Link>
            )}
            <Link
              to="/profile"
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                !mobile && settings.compactNavigationSidebar ? "justify-center px-0" : "",
                location.pathname === '/profile' ? "bg-slate-900 dark:bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
            >
              <div className={cn("p-1.5 rounded-lg", location.pathname === '/profile' ? "bg-white/10 dark:bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
                <UserRound className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              {(!mobile && settings.compactNavigationSidebar) ? null : "My Profile"}
            </Link>
            <Link
              to="/settings"
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
                !mobile && settings.compactNavigationSidebar ? "justify-center px-0" : "",
                location.pathname === '/settings' ? "bg-slate-900 dark:bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400"
              )}
            >
              <div className={cn("p-1.5 rounded-lg", location.pathname === '/settings' ? "bg-white/10 dark:bg-white/20" : "bg-slate-100 dark:bg-slate-800")}>
                <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </div>
              {(!mobile && settings.compactNavigationSidebar) ? null : "Preferences"}
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className={cn(
            "group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400",
            !mobile && settings.compactNavigationSidebar && "justify-center px-0"
          )}
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50">
            <LogOut className="w-4 h-4" />
          </div>
          {(!mobile && settings.compactNavigationSidebar) ? null : t('shell.logout', 'Sign out')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300",
        settings.compactNavigationSidebar ? "w-24" : "w-72"
      )}>
        <NavContent />
      </aside>

      <div className={cn("transition-all duration-300", settings.compactNavigationSidebar ? "lg:pl-24" : "lg:pl-72")}>
        {/* Header Glassmorphism */}
        <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               {/* Mobile Menu Toggle */}
               <div className="lg:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800">
                        <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <NavContent mobile />
                    </SheetContent>
                  </Sheet>
               </div>
               
               <div className="hidden sm:block">
                  <p className="text-xs font-bold text-slate-400 leading-none mb-1">
                    {t('shell.workspace', 'Active Organization')}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{title}</h2>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-slate-500 font-medium">Store Management</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden shadow-sm hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all cursor-pointer">
                  {user?.username?.charAt(0).toUpperCase()}
               </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto min-h-[calc(100vh-80px)] p-6 lg:p-10 relative animate-in-fade">
          {children}
        </main>
      </div>
    </div>
  );
};
