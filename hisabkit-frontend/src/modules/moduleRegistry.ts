import { Boxes, HandCoins, LayoutDashboard, NotebookTabs, Users2, BarChart3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ModuleId = 'dashboard' | 'ledger' | 'inventory' | 'suppliers' | 'lending' | 'reports';

export type AppModule = {
  id: ModuleId;
  label: string;
  route: string;
  icon: LucideIcon;
  enabled: boolean;
  phase: 'live' | 'planned';
};

export const appModules: AppModule[] = [
  { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard, enabled: true, phase: 'live' },
  { id: 'ledger', label: 'Customer Ledger', route: '/ledger', icon: NotebookTabs, enabled: true, phase: 'live' },
  { id: 'reports', label: 'Reports & Analytics', route: '/reports', icon: BarChart3, enabled: true, phase: 'live' },
  { id: 'inventory', label: 'Inventory', route: '/inventory', icon: Boxes, enabled: false, phase: 'planned' },
  { id: 'suppliers', label: 'Suppliers', route: '/suppliers', icon: Users2, enabled: false, phase: 'planned' },
  { id: 'lending', label: 'Money Lending', route: '/lending', icon: HandCoins, enabled: false, phase: 'planned' },
];

export const enabledAppModules = appModules.filter((module) => module.enabled);
