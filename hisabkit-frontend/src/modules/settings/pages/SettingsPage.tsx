import { useTranslation } from 'react-i18next';
import { Paintbrush, Settings2 } from 'lucide-react';
import { useTenantProfileQuery } from '@/modules/profile/services/useProfile';
import type { Tenant } from '@/shared/types';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { AppearanceSection } from '../components/AppearanceSection';
import { LanguageSection } from '../components/LanguageSection';
import { BusinessSection } from '../components/BusinessSection';
import { RemindersSection } from '../components/RemindersSection';
import { SecuritySection } from '../components/SecuritySection';
import { LayoutSection } from '../components/LayoutSection';

export function SettingsPage() {
  const { t } = useTranslation();
  const tenantQuery = useTenantProfileQuery();
  const businessData: Tenant | null = tenantQuery.data ?? null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-none shadow-md bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <CardHeader className="md:px-8 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-white/50 text-slate-600 dark:text-slate-300 backdrop-blur-sm px-3 py-1 text-xs tracking-widest font-semibold uppercase">
                <Settings2 className="w-3.5 h-3.5 mr-1.5 inline-block text-emerald-600" />
                {t('settings.badge', 'Workspace Configuration')}
              </Badge>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                {t('settings.title', 'Settings & Preferences')}
              </CardTitle>
              <CardDescription className="text-lg text-slate-500 dark:text-slate-400 max-w-xl">
                {t(
                  'settings.subtitle',
                  'Configure your business identity, workspace layout, security policies, and localization preferences from this central dashboard.'
                )}
              </CardDescription>
            </div>
            
            <div className="hidden md:flex rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 p-5 px-6 border border-indigo-100 dark:border-indigo-800/30 text-indigo-800 dark:text-indigo-300 max-w-sm w-full gap-4 items-center">
              <div className="bg-indigo-100 dark:bg-indigo-800 p-2.5 rounded-full shrink-0">
                <Paintbrush className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm leading-relaxed font-medium">
                {t(
                  'settings.alert.description',
                  'Your workspace preferences synchronize securely across all your devices.'
                )}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="business" className="w-full flex flex-col md:flex-row gap-6 lg:gap-10">
        <TabsList className="flex md:flex-col h-auto w-full md:w-64 bg-transparent gap-2 items-start justify-start overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          <TabsTrigger value="business" className="w-full justify-start text-left px-5 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-bold transition-all border border-transparent data-[state=active]:border-slate-200">
            {t('settings.tabs.business', 'Business Identity')}
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start text-left px-5 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-bold transition-all border border-transparent data-[state=active]:border-slate-200">
            {t('settings.tabs.appearance', 'Appearance & Theme')}
          </TabsTrigger>
          <TabsTrigger value="language" className="w-full justify-start text-left px-5 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-bold transition-all border border-transparent data-[state=active]:border-slate-200">
            {t('settings.tabs.language', 'Localization')}
          </TabsTrigger>
          <TabsTrigger value="reminders" className="w-full justify-start text-left px-5 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-bold transition-all border border-transparent data-[state=active]:border-slate-200">
            {t('settings.tabs.reminders', 'Auto-Reminders')}
          </TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start text-left px-5 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-bold transition-all border border-transparent data-[state=active]:border-slate-200">
            {t('settings.tabs.security', 'Security & Access')}
          </TabsTrigger>
          <TabsTrigger value="layout" className="w-full justify-start text-left px-5 py-3 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 data-[state=active]:font-bold transition-all border border-transparent data-[state=active]:border-slate-200">
            {t('settings.tabs.layout', 'Interface Layout')}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0 pb-12">
          <TabsContent value="business" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <BusinessSection businessData={businessData} />
          </TabsContent>
          
          <TabsContent value="appearance" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <AppearanceSection />
          </TabsContent>

          <TabsContent value="language" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <LanguageSection />
          </TabsContent>

          <TabsContent value="reminders" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <RemindersSection businessData={businessData} />
          </TabsContent>

          <TabsContent value="security" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <SecuritySection />
          </TabsContent>

          <TabsContent value="layout" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-right-4 duration-500">
            <LayoutSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
