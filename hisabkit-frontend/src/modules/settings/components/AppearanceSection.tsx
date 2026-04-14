/**
 * Appearance settings component
 * Manages theme preference (light/dark/system)
 */

import { Check, Monitor, MoonStar, SunMedium } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ThemeChoice } from '../types/settingsTypes';

type IconType = typeof SunMedium;

const themeChoices: Array<{ value: ThemeChoice; icon: IconType }> = [
  { value: 'light', icon: SunMedium },
  { value: 'dark', icon: MoonStar },
  { value: 'system', icon: Monitor },
];

export function AppearanceSection() {
  const { t } = useTranslation();
  const { resolvedTheme, theme, setTheme } = useTheme();

  const handleThemeChange = (nextTheme: ThemeChoice) => {
    setTheme(nextTheme);
    toast.success(t('settings.toast.theme_updated', 'Appearance updated'), {
      description: t(`settings.theme.${nextTheme}.description`),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.appearance.title', 'Theme preference')}</CardTitle>
        <CardDescription>
          {t('settings.appearance.description', 'Keep the app readable in bright shops, low-light counters, and device-driven system mode.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          {themeChoices.map(({ value, icon: Icon }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleThemeChange(value)}
                className={cn(
                  'flex flex-col gap-4 rounded-xl border p-4 text-left transition hover:bg-muted',
                  isActive ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'border-border'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="size-4" />
                  </div>
                  {isActive ? <Check className="size-4 text-primary" /> : null}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{t(`settings.theme.${value}.label`)}</p>
                  <p className="text-sm text-muted-foreground">{t(`settings.theme.${value}.description`)}</p>
                </div>
              </button>
            );
          })}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Monitor className="size-4" />
          <span>
            {t('settings.appearance.active_theme', 'Active resolved theme')}:&nbsp;
            <span className="font-medium text-foreground">
              {resolvedTheme === 'dark' ? t('settings.theme.dark.label') : t('settings.theme.light.label')}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
