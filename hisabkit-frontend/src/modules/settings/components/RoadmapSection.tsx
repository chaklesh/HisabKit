/**
 * Roadmap section component
 * Shows planned features and implementation status
 */

import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

interface RoadmapItem {
  key: string;
  status: 'implemented' | 'in_progress' | 'planned';
}

const roadmapItems: RoadmapItem[] = [
  { key: 'business_profile', status: 'implemented' },
  { key: 'reminders', status: 'implemented' },
  { key: 'security', status: 'implemented' },
  { key: 'layout', status: 'implemented' },
  { key: 'mobile_sync', status: 'in_progress' },
];

function getStatusBadge(status: RoadmapItem['status']) {
  switch (status) {
    case 'implemented':
      return <Badge className="bg-green-100 text-green-800">Live</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
    case 'planned':
      return <Badge variant="outline">Planned</Badge>;
  }
}

export function RoadmapSection() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.roadmap.title', 'Settings roadmap')}</CardTitle>
        <CardDescription>
          {t(
            'settings.roadmap.description',
            'These are the settings sections available and planned as we streamline workspace controls.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('settings.roadmap.note', 'Your workspace settings are synchronized across the web app, mobile (when available), and shared with your team.')}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {roadmapItems.map(({ key, status }) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">{t(`settings.roadmap.items.${key}`, key)}</p>
                <p className="text-xs text-muted-foreground">{t(`settings.roadmap.items.${key}_desc`, '')}</p>
              </div>
              {getStatusBadge(status)}
            </div>
          ))}
        </div>

        <Separator />

        <p className="text-xs text-muted-foreground">
          {t(
            'settings.roadmap.footer',
            'Settings that sync across web and mobile help your team stay coordinated. Appearance and language are user-specific; business, reminders, and security settings apply to your workspace.'
          )}
        </p>
      </CardContent>
    </Card>
  );
}
