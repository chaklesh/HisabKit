import { useTranslation } from 'react-i18next';
import { Paintbrush } from 'lucide-react';
import { useTenantProfileQuery } from '../../../features/profile/useProfile';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppearanceSection } from '../components/AppearanceSection';
import { LanguageSection } from '../components/LanguageSection';
import { BusinessSection } from '../components/BusinessSection';
import { RemindersSection } from '../components/RemindersSection';
import { SecuritySection } from '../components/SecuritySection';
import { LayoutSection } from '../components/LayoutSection';
import { RoadmapSection } from '../components/RoadmapSection';

export function SettingsPage() {
  const { t } = useTranslation();
  const tenantQuery = useTenantProfileQuery();
  const businessData = tenantQuery.data as any;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="secondary">{t('settings.badge', 'Workspace preferences')}</Badge>
              <CardTitle className="text-2xl">{t('settings.title', 'Settings')}</CardTitle>
              <CardDescription>
                {t(
                  'settings.subtitle',
                  'Manage appearance, language, business profile, and workspace controls in one place.'
                )}
              </CardDescription>
            </div>
            <Alert className="max-w-md">
              <Paintbrush data-icon="inline-start" />
              <AlertTitle>{t('settings.alert.title', 'Workspace control center')}</AlertTitle>
              <AlertDescription>
                {t(
                  'settings.alert.description',
                  'Theme, language, business profile, reminders, and security settings are organized here. Your workspace settings synchronize where available.'
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="appearance" className="gap-4">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
          <TabsTrigger value="appearance">{t('settings.tabs.appearance', 'Appearance')}</TabsTrigger>
          <TabsTrigger value="language">{t('settings.tabs.language', 'Language')}</TabsTrigger>
          <TabsTrigger value="business">{t('settings.tabs.business', 'Business')}</TabsTrigger>
          <TabsTrigger value="reminders">{t('settings.tabs.reminders', 'Reminders')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security', 'Security')}</TabsTrigger>
          <TabsTrigger value="layout">{t('settings.tabs.layout', 'Layout')}</TabsTrigger>
          <TabsTrigger value="roadmap">{t('settings.tabs.roadmap', 'Roadmap')}</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <AppearanceSection />
        </TabsContent>

        <TabsContent value="language">
          <LanguageSection />
        </TabsContent>

        <TabsContent value="business">
          <BusinessSection businessData={businessData} />
        </TabsContent>

        <TabsContent value="reminders">
          <RemindersSection businessData={businessData} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySection />
        </TabsContent>

        <TabsContent value="layout">
          <LayoutSection />
        </TabsContent>

        <TabsContent value="roadmap">
          <RoadmapSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
