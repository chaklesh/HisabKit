/**
 * Layout and preferences settings component
 * Manages dashboard density, default views, and layout options
 */

import { useLayout } from "@/shared/context/LayoutContext";
import { cn } from "@hisabkit/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hisabkit/ui/components/Card";
import { Separator } from "@hisabkit/ui/components/Separator";
// Removed unused React imports
import { Check, Layout } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { DashboardDensity, LayoutSettings } from "../types/settingsTypes";

const densityOptions: Array<{ value: DashboardDensity; label: string; description: string }> = [
  {
    value: "compact",
    label: "Compact",
    description: "Minimal spacing, more information visible at once",
  },
  {
    value: "comfortable",
    label: "Comfortable",
    description: "Balanced spacing for general use",
  },
  {
    value: "spacious",
    label: "Spacious",
    description: "Extra spacing for easy touch input",
  },
];

export function LayoutSection() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useLayout();

  const handleDensityChange = (density: DashboardDensity) => {
    updateSettings({ dashboardDensity: density });
    toast.success(t("settings.layout.density_changed", `Changed to ${density} layout`));
  };

  const handleToggle = (key: keyof LayoutSettings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-2.5">
            <Layout className="size-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">
              {t("settings.layout.title", "Interface & Layout")}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {t(
                "settings.layout.description",
                "Personalize your workspace layout and navigation style",
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Dashboard Density */}
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("settings.layout.density", "Information Density")}
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              {t(
                "settings.layout.density_description",
                "Adjust the spacing of elements on your dashboard",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {densityOptions.map(({ value, label, description }) => {
              const isActive = settings.dashboardDensity === value;
              return (
                <button
                  key={value}
                  onClick={() => handleDensityChange(value)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200 group",
                    isActive
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-600/20"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/50",
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <p
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500",
                      )}
                    >
                      {label}
                    </p>
                    {isActive && (
                      <Check className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-slate-100 dark:bg-slate-800/60" />

        {/* Navigation Options */}
        <div className="space-y-5">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {t("settings.layout.navigation", "Sidebar Preferences")}
            </p>
            <p className="text-[11px] font-medium text-slate-500">
              {t(
                "settings.layout.navigation_description",
                "Configure how the main navigation behaves",
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() =>
                handleToggle("compactNavigationSidebar", !settings.compactNavigationSidebar)
              }
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all group",
                settings.compactNavigationSidebar
                  ? "border-indigo-600 bg-indigo-50/30"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
              )}
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t("settings.layout.compact_sidebar", "Compact Sidebar")}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {t("settings.layout.compact_sidebar_desc", "Show only icons for maximum space")}
                </p>
              </div>
              <div
                className={cn(
                  "w-9 h-5 rounded-full transition-colors relative flex items-center px-1",
                  settings.compactNavigationSidebar
                    ? "bg-indigo-600"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                    settings.compactNavigationSidebar ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </div>
            </button>

            <button
              onClick={() => handleToggle("hidePlannedModules", !settings.hidePlannedModules)}
              className={cn(
                "flex items-center justify-between rounded-xl border p-4 text-left transition-all group",
                settings.hidePlannedModules
                  ? "border-indigo-600 bg-indigo-50/30"
                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
              )}
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t("settings.layout.hide_planned", "Essential View")}
                </p>
                <p className="text-[10px] font-medium text-slate-400">
                  {t("settings.layout.hide_planned_desc", "Hide all coming soon features")}
                </p>
              </div>
              <div
                className={cn(
                  "w-9 h-5 rounded-full transition-colors relative flex items-center px-1",
                  settings.hidePlannedModules ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <div
                  className={cn(
                    "w-3 h-3 bg-white rounded-full transition-transform shadow-sm",
                    settings.hidePlannedModules ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4 border border-slate-100 dark:border-slate-800/60">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Check className="size-3" />
            {t("settings.layout.note", "Stored locally on this device")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
