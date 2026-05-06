import { BarChart3, Boxes, HandCoins, LayoutDashboard, NotebookTabs, Users2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModuleId = "dashboard" | "customers" | "ledger" | "inventory" | "suppliers" | "lending" | "analytics";

export type AppModule = {
  id: ModuleId;
  label: string;
  route: string;
  icon: LucideIcon;
  enabled: boolean;
  phase: "live" | "planned";
};

export const appModules: AppModule[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    icon: LayoutDashboard,
    enabled: true,
    phase: "live",
  },
  {
    id: "customers",
    label: "CRM",
    route: "/customers",
    icon: Users2,
    enabled: true,
    phase: "live",
  },
  {
    id: "ledger",
    label: "Customer Ledger",
    route: "/ledger",
    icon: NotebookTabs,
    enabled: true,
    phase: "live",
  },
  {
    id: "analytics",
    label: "Portfolio Analytics",
    route: "/analytics",
    icon: BarChart3,
    enabled: true,
    phase: "live",
  },
  {
    id: "inventory",
    label: "Inventory Management",
    route: "/inventory",
    icon: Boxes,
    enabled: false,
    phase: "planned",
  },
  {
    id: "suppliers",
    label: "Supplier Management",
    route: "/suppliers",
    icon: Users2,
    enabled: false,
    phase: "planned",
  },
  {
    id: "lending",
    label: "Money Lending",
    route: "/lending",
    icon: HandCoins,
    enabled: false,
    phase: "planned",
  },
];

export const enabledAppModules = appModules.filter((module) => module.enabled);
