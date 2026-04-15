/**
 * Layout and preferences settings component
 * Manages dashboard density, default views, and layout options
 */

import { Check, Layout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import type { DashboardDensity, LayoutSettings } from '../types/settingsTypes';
import { useLayoutSettings } from '../hooks/useSettingsHooks';

const densityOptions: Array<{ value: DashboardDensity; label: string; description: string }> = [
  {
    value: 'compact',
    label: 'Compact',
    description: 'Minimal spacing, more information visible at once',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    description: 'Balanced spacing for general use',
  },
  {
    value: 'spacious',
    label: 'Spacious',
    description: 'Extra spacing for easy touch input',
  },
];

export function LayoutSection() {
  const { t } = useTranslation();
  const { loadLayoutSettings, saveLayoutSettings } = useLayoutSettings();
  const [settings, setSettings] = useState<LayoutSettings>({
    dashboardDensity: 'comfortable',
    defaultView: 'dashboard',
    hidePlannedModules: false,
    compactNavigationSidebar: false,
  });

  useEffect(() => {
    const loaded = loadLayoutSettings();
    if (loaded) {
      setSettings(loaded);
    }
  }, []);

  const handleDensityChange = (density: DashboardDensity) => {
    const updated = { ...settings, dashboardDensity: density };
    setSettings(updated);
    saveLayoutSettings(updated);
    toast.success(t('settings.layout.density_changed', `Changed to ${density} layout`));
  };

  const handleToggle = (key: keyof LayoutSettings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveLayoutSettings(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Layout className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t('settings.layout.title', 'Layout & Preferences')}</CardTitle>
            <CardDescription>
              {t('settings.layout.description', 'Customize dashboard appearance and navigation behavior')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dashboard Density */}
        <div className="space-y-4">
          <div>
            <p className="font-medium">{t('settings.layout.density', 'Dashboard Density')}</p>
            <p className="text-xs text-muted-foreground">
              {t('settings.layout.density_description', 'Choose how much space elements should occupy')}
            </p>
          </div>

          <div className="grid gap-3">
            {densityOptions.map(({ value, label, description }) => {
              const isActive = settings.dashboardDensity === value;
              return (
                <button
                  key={value}
                  onClick={() => handleDensityChange(value)}
                  className={cn(
                    'flex items-start justify-between rounded-lg border p-4 text-left transition',
                    isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                  )}
                >
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  {isActive ? <Check className="mt-1 size-4 text-primary flex-shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Navigation Options */}
        <div className="space-y-4">
          <div>
            <p className="font-medium">{t('settings.layout.navigation', 'Navigation')}</p>
            <p className="text-xs text-muted-foreground">
              {t('settings.layout.navigation_description', 'Customize how navigation is displayed')}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleToggle('compactNavigationSidebar', !settings.compactNavigationSidebar)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 text-left transition',
                settings.compactNavigationSidebar ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
              )}
            >
              <div>
                <p className="text-sm font-medium">{t('settings.layout.compact_sidebar', 'Compact sidebar')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.layout.compact_sidebar_desc', 'Show icons only, hide labels')}</p>
              </div>
              <input type="checkbox" checked={settings.compactNavigationSidebar} onChange={() => {}} className="size-4" />
            </button>

            <button
              onClick={() => handleToggle('hidePlannedModules', !settings.hidePlannedModules)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-3 text-left transition',
                settings.hidePlannedModules ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
              )}
            >
              <div>
                <p className="text-sm font-medium">{t('settings.layout.hide_planned', 'Hide planned modules')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.layout.hide_planned_desc', 'Show only available features, hide coming soon')}
                </p>
              </div>
              <input type="checkbox" checked={settings.hidePlannedModules} onChange={() => {}} className="size-4" />
            </button>
          </div>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground">
          {t('settings.layout.note', 'Layout preferences are stored locally on this device and are not shared with your workspace.')}
        </div>
      </CardContent>
    </Card>
  );
}
