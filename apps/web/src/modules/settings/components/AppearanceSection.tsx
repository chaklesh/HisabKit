import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hisabkit/ui/components/Card";
import { Check, Monitor, MoonStar, Sparkles, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ThemeChoice } from "../types/settingsTypes";

type IconType = typeof SunMedium;

const themeChoices: Array<{ value: ThemeChoice; icon: IconType; color: string }> = [
  { value: "light", icon: SunMedium, color: "text-amber-500" },
  { value: "dark", icon: MoonStar, color: "text-indigo-400" },
  { value: "system", icon: Monitor, color: "text-slate-500" },
];

export function AppearanceSection() {
  const { t } = useTranslation();
  const { resolvedTheme, theme, setTheme } = useTheme();

  const handleThemeChange = (nextTheme: ThemeChoice) => {
    setTheme(nextTheme);
    toast.success(t("settings.toast.theme_updated", "Appearance updated"), {
      description: `Switched to ${nextTheme} mode`,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-indigo-100 bg-indigo-50 text-indigo-700 uppercase tracking-widest"
            >
              Personalization
            </Badge>
          </div>
          <CardTitle className="text-xl font-black tracking-tight">Interface Theme</CardTitle>
          <CardDescription>
            Tailor the application visual style to your workspace environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {themeChoices.map(({ value, icon: Icon, color }) => {
              const isActive = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleThemeChange(value)}
                  className={cn(
                    "group relative flex flex-col gap-4 rounded-2xl border p-5 text-left transition-all duration-300",
                    isActive
                      ? "border-indigo-500 bg-indigo-50/30 shadow-md ring-4 ring-indigo-50/50"
                      : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        isActive ? "bg-indigo-100" : "bg-slate-100 group-hover:bg-indigo-50",
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : color)} />
                    </div>
                    {isActive && (
                      <div className="bg-indigo-600 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 capitalize">{value}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {value === "system"
                        ? "Syncs with device mode"
                        : `Optimize for ${value} environments`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Dynamic system resolution</p>
                <p className="text-[11px] text-slate-500">
                  Currently active mode:{" "}
                  <span className="font-bold text-indigo-600 uppercase">{resolvedTheme}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
