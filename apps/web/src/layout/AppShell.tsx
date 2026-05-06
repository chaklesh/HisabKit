import { listModuleCatalog } from "@/shared/api/commonApi";
import { useAuth } from "@/shared/context/AuthContext";
import { useLayout } from "@/shared/context/LayoutContext";
import type { ModuleCatalogItem } from "@/shared/types";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@hisabkit/ui/components/DropdownMenu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@hisabkit/ui/components/Sheet";
import {
  ChevronLeft,
  ChevronRight,
  HandCoins,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { type AppModule, appModules } from "../modules/moduleRegistry";

const titleKeyByRoute: Record<string, string> = {
  "/dashboard": "shell.titles.dashboard",
  "/ledger": "shell.titles.ledger",
  "/inventory": "shell.titles.inventory",
  "/suppliers": "shell.titles.suppliers",
  "/lending": "shell.titles.lending",
  "/admin": "shell.titles.admin",
  "/profile": "shell.titles.profile",
  "/settings": "shell.titles.settings",
  "/reports": "shell.titles.reports",
};

type AppShellProps = {
  children: ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useLayout();
  const [catalog, setCatalog] = useState<ModuleCatalogItem[] | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    let active = true;
    void listModuleCatalog()
      .then((response) => {
        if (active) setCatalog(response.data);
      })
      .catch(() => {
        if (active) setCatalog(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const modules = useMemo<AppModule[]>(() => {
    return appModules
      .map((module) => {
        // If we have a catalog from backend, sync enabled status
        const catalogItem = catalog?.find((c) => c.route === module.route);
        return {
          ...module,
          enabled: catalogItem ? catalogItem.enabled : module.enabled,
          phase:
            catalogItem?.status === "LIVE" || module.enabled
              ? ("live" as const)
              : ("planned" as const),
        };
      })
      .filter((m) => !settings.hidePlannedModules || m.enabled);
  }, [catalog, settings.hidePlannedModules]);

  const title = t(titleKeyByRoute[location.pathname] || "shell.titles.default", "HisabKit");

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const IconLink = ({
    to,
    icon: Icon,
    label,
    isActive,
    enabled = true,
    mobile = false,
    showLabel = true,
    variant = "default",
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    enabled?: boolean;
    mobile?: boolean;
    showLabel?: boolean;
    variant?: "default" | "indigo";
  }) => (
    <Link
      to={to}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      className={cn(
        "group flex items-center gap-3 rounded-2xl transition-all duration-300",
        !showLabel ? "justify-center w-14 h-14 mx-auto p-0" : "px-4 py-2 text-sm font-bold",
        isActive
          ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400",
        !enabled && !isActive && "opacity-70"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-xl transition-all",
          isActive
            ? "bg-white/10 dark:bg-white/20"
            : variant === "indigo"
              ? "bg-indigo-50 dark:bg-indigo-950/40"
              : "bg-slate-100 dark:bg-slate-800",
        )}
      >
        <Icon
          className={cn(
            "transition-transform group-hover:rotate-6",
            isActive
              ? "text-white"
              : variant === "indigo"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
            !showLabel ? "w-6 h-6" : "w-4 h-4",
          )}
        />
      </div>
      {showLabel && <span className="truncate">{label}</span>}
      {showLabel && enabled && isActive && <ChevronRight className="ml-auto w-4 h-4 opacity-30" />}
      {showLabel && !enabled && (
        <Badge
          variant="secondary"
          className="ml-auto text-[8px] font-black tracking-tighter uppercase px-1 h-4 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-none"
        >
          {t("shell.soon", "Soon")}
        </Badge>
      )}
    </Link>
  );

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn("flex h-full flex-col relative", mobile ? "pt-2" : "")}>
      <div
        className={cn(
          "px-8 pt-8 pb-6",
          mobile && "px-4",
          !mobile && settings.compactNavigationSidebar && "px-0 flex flex-col items-center",
        )}
      >
        <NavBrand compact={!mobile && !!settings.compactNavigationSidebar} />
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto py-4 custom-scrollbar">
        <NavModules
          mobile={mobile}
          compact={!mobile && !!settings.compactNavigationSidebar}
          modules={modules}
          location={location}
          t={t}
          IconLink={IconLink}
        />
        <NavAdmin
          mobile={mobile}
          compact={!mobile && !!settings.compactNavigationSidebar}
          user={user}
          location={location}
          IconLink={IconLink}
        />
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className={cn(
            "group flex items-center gap-3 rounded-2xl transition-all text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400",
            !mobile && settings.compactNavigationSidebar
              ? "justify-center w-14 h-14 mx-auto p-0"
              : "w-full px-4 py-3 text-sm font-bold",
          )}
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50">
            <LogOut className="w-4 h-4" />
          </div>
          {!mobile && settings.compactNavigationSidebar ? null : t("shell.logout", "Sign out")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300 z-50",
          settings.compactNavigationSidebar ? "w-24" : "w-72",
        )}
      >
        <NavContent />

        {/* Compact Toggle Button */}
        <button
          onClick={() =>
            updateSettings({ compactNavigationSidebar: !settings.compactNavigationSidebar })
          }
          className={cn(
            "absolute -right-3.5 top-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900",
            settings.compactNavigationSidebar ? "rotate-0" : "rotate-0",
          )}
        >
          {settings.compactNavigationSidebar ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      <div
        className={cn(
          "transition-all duration-300",
          settings.compactNavigationSidebar ? "lg:pl-24" : "lg:pl-72",
        )}
      >
        {/* Header Glassmorphism */}
        <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800"
                    >
                      <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="p-0 w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                  >
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <NavContent mobile />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-400 leading-none mb-1">
                  {t("shell.workspace", "Active Organization")}
                </p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  {title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:ring-2 hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all"
                  >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-2xl border-slate-200 dark:border-slate-800 p-2"
                >
                  <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="rounded-xl gap-2 font-bold cursor-pointer"
                  >
                    <Sun className="h-4 w-4 text-amber-500" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="rounded-xl gap-2 font-bold cursor-pointer"
                  >
                    <Moon className="h-4 w-4 text-indigo-400" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className="rounded-xl gap-2 font-bold cursor-pointer"
                  >
                    <Monitor className="h-4 w-4 text-slate-500" /> System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                        {user?.role?.replace("ROLE_", "").replace("_", " ")}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden shadow-sm hover:ring-4 hover:ring-indigo-100 dark:hover:ring-indigo-900/40 transition-all">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl"
                >
                  <div className="px-3 py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-[9px] font-medium text-slate-400 truncate uppercase tracking-tighter">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => navigate("/profile")}
                    className="rounded-xl gap-3 py-2.5 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <UserRound className="w-4 h-4 text-indigo-500" />{" "}
                    {t("shell.profile", "Workspace Profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate("/settings")}
                    className="rounded-xl gap-3 py-2.5 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <Settings className="w-4 h-4 text-indigo-500" />{" "}
                    {t("shell.settings", "Preferences")}
                  </DropdownMenuItem>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl gap-3 py-2.5 font-bold cursor-pointer text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <LogOut className="w-4 h-4" /> {t("shell.logout", "Terminate Session")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

const NavBrand = ({ compact }: { compact: boolean }) => (
  <div className={cn("flex items-center gap-3", compact && "flex-col gap-0 items-center")}>
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
      <HandCoins className="text-white w-6 h-6" />
    </div>
    {!compact && (
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          HisabKit
        </h1>
        <p className="text-xs font-semibold text-indigo-500 opacity-80">Enterprise</p>
      </div>
    )}
  </div>
);

const NavModules = ({
  mobile,
  compact,
  modules,
  location,
  t,
  IconLink,
}: {
  mobile: boolean;
  compact: boolean;
  modules: {
    id: string;
    label: string;
    route: string;
    icon: React.ElementType;
    enabled: boolean;
  }[];
  location: { pathname: string };
  t: (key: string, def: string) => string;
  IconLink: React.ElementType;
}) => (
  <div>
    {!compact && <p className="px-4 text-xs font-bold text-slate-400 mb-4">Core Modules</p>}
    <nav className={cn("space-y-1.5", compact && "flex flex-col items-center px-0")}>
      {modules.map((module) => (
        <IconLink
          key={module.id}
          to={module.enabled ? module.route : "#"}
          icon={module.icon}
          label={t(`shell.modules.${module.id}`, module.label)}
          isActive={location.pathname === module.route}
          enabled={module.enabled}
          mobile={mobile}
          showLabel={!compact}
        />
      ))}
    </nav>
  </div>
);

const NavAdmin = ({
  compact,
  user,
  location,
  IconLink,
  mobile,
}: {
  compact: boolean;
  user: { role?: string } | null;
  location: { pathname: string };
  IconLink: React.ElementType;
  mobile: boolean;
}) => (
  <div>
    {!compact && <p className="px-4 text-xs font-bold text-slate-400 mb-4">Administration</p>}
    <nav className={cn("space-y-1.5", compact && "items-center")}>
      {(user?.role === "SUPER_ADMIN" || user?.role === "ROLE_SUPER_ADMIN") && (
        <IconLink
          to="/admin"
          icon={ShieldCheck}
          label="Admin Console"
          isActive={location.pathname === "/admin"}
          mobile={mobile}
          showLabel={!compact}
          variant="indigo"
        />
      )}
      <IconLink
        to="/profile"
        icon={UserRound}
        label="Workspace Profile"
        isActive={location.pathname === "/profile"}
        mobile={mobile}
        showLabel={!compact}
        variant="default"
      />
      <IconLink
        to="/settings"
        icon={Settings}
        label="Preferences"
        isActive={location.pathname === "/settings"}
        mobile={mobile}
        showLabel={!compact}
        variant="default"
      />
    </nav>
  </div>
);
