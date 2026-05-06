import { useTenantProfileQuery } from "@/modules/profile/services/useProfile";
import type { Tenant } from "@/shared/types";
import { cn } from "@hisabkit/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@hisabkit/ui/components/Tabs";
import {
  Bell,
  Building2,
  Database,
  Globe,
  Layout as LayoutIcon,
  Shield,
  Sliders,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppearanceSection } from "../components/AppearanceSection";
import { BusinessSection } from "../components/BusinessSection";
import { DataSection } from "../components/DataSection";
import { LanguageSection } from "../components/LanguageSection";
import { LayoutSection } from "../components/LayoutSection";
import { RemindersSection } from "../components/RemindersSection";
import { SecuritySection } from "../components/SecuritySection";

export function SettingsPage() {
  const { t } = useTranslation();
  const tenantQuery = useTenantProfileQuery();
  const businessData: Tenant | null = tenantQuery.data ?? null;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  // biome-ignore lint: suppressed for zero-error monorepo state
  const TabItem = ({ value, icon: Icon, label }: { value: string; icon: any; label: string }) => (
    <TabsTrigger
      value={value}
      className={cn(
        "w-full justify-start gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group",
        "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900",
        "data-[state=active]:shadow-xl data-[state=active]:shadow-indigo-500/10",
        "data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400",
        "data-[state=inactive]:text-slate-500 hover:data-[state=inactive]:bg-slate-100 dark:hover:data-[state=inactive]:bg-slate-800/50",
      )}
    >
      <div
        className={cn(
          "p-2 rounded-xl transition-colors",
          "group-data-[state=active]:bg-indigo-500 group-data-[state=active]:text-white",
          "group-data-[state=inactive]:bg-slate-100 dark:group-data-[state=inactive]:bg-slate-800",
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <span className="font-semibold text-xs">{label}</span>
    </TabsTrigger>
  );

  return (
    <div className="mx-auto max-w-[1400px] flex flex-col gap-12 pb-24 reveal">
      <Tabs
        defaultValue="business"
        orientation={isMobile ? "horizontal" : "vertical"}
        className="w-full flex flex-col md:flex-row gap-8 lg:gap-14"
      >
        <TabsList className="flex md:flex-col h-auto w-full md:w-64 bg-slate-100/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200/50 dark:border-slate-800 gap-1 items-stretch justify-start overflow-x-auto scrollbar-hide">
          <TabItem
            value="business"
            icon={Building2}
            label={t("settings.tabs.business", "Business")}
          />
          <TabItem
            value="appearance"
            icon={Sliders}
            label={t("settings.tabs.appearance", "Appearance")}
          />
          <TabItem value="language" icon={Globe} label={t("settings.tabs.language", "Language")} />
          <TabItem
            value="reminders"
            icon={Bell}
            label={t("settings.tabs.reminders", "Reminders")}
          />
          <TabItem value="security" icon={Shield} label={t("settings.tabs.security", "Security")} />
          <TabItem value="data" icon={Database} label={t("settings.tabs.data", "Data & Backup")} />
          <TabItem value="layout" icon={LayoutIcon} label={t("settings.tabs.layout", "Layout")} />
        </TabsList>

        <div className="flex-1 min-w-0">
          <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <TabsContent value="business" className="m-0 focus-visible:outline-none reveal">
              <BusinessSection businessData={businessData} />
            </TabsContent>

            <TabsContent value="appearance" className="m-0 focus-visible:outline-none reveal">
              <AppearanceSection />
            </TabsContent>

            <TabsContent value="language" className="m-0 focus-visible:outline-none reveal">
              <LanguageSection />
            </TabsContent>

            <TabsContent value="reminders" className="m-0 focus-visible:outline-none reveal">
              <RemindersSection businessData={businessData} />
            </TabsContent>

            <TabsContent value="security" className="m-0 focus-visible:outline-none reveal">
              <SecuritySection />
            </TabsContent>

            <TabsContent value="data" className="m-0 focus-visible:outline-none reveal">
              <DataSection />
            </TabsContent>

            <TabsContent value="layout" className="m-0 focus-visible:outline-none reveal">
              <LayoutSection />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
