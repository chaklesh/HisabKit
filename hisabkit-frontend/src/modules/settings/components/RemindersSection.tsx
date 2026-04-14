/**
 * Reminders and notification templates settings component
 * Manages SMS and WhatsApp message templates
 */

import { FormEvent, useEffect, useState } from 'react';
import { Bell, Copy, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Tenant } from '../../../shared/types/domain';
import { useUpdateTenantProfile } from '../../../features/profile/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const TEMPLATE_HELP = {
  customerName: 'Customer name',
  balance: 'Outstanding balance amount',
  balanceType: '"to collect" or "to pay"',
  businessName: 'Your business name',
  customerPhone: 'Customer phone number',
};

const DEFAULT_TEMPLATE = 'Hi {{customerName}}, this is {{businessName}}. Your outstanding balance is {{balance}} ({{balanceType}}). Please settle when convenient. Thank you!';

interface RemindersSectionProps {
  businessData?: Tenant | null;
}

export function RemindersSection({ businessData }: RemindersSectionProps) {
  const { t } = useTranslation();
  const updateTenant = useUpdateTenantProfile();
  const [smsTemplate, setSmsTemplate] = useState('');
  const [whatsappTemplate, setWhatsappTemplate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (businessData) {
      setSmsTemplate(businessData.smsTemplate || DEFAULT_TEMPLATE);
      setWhatsappTemplate(businessData.whatsappTemplate || businessData.smsTemplate || DEFAULT_TEMPLATE);
    }
  }, [businessData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await updateTenant.mutateAsync({
        name: businessData?.name || '',
        smsTemplate: smsTemplate || undefined,
        whatsappTemplate: whatsappTemplate || undefined,
      });
      toast.success(t('settings.reminders.saved', 'Templates updated'));
    } catch (err: any) {
      const message = err.response?.data?.message || t('settings.reminders.error', 'Unable to save templates');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToWhatsapp = () => {
    setWhatsappTemplate(smsTemplate);
    toast.success('SMS template copied to WhatsApp');
  };

  const resetSmsTemplate = () => {
    setSmsTemplate(DEFAULT_TEMPLATE);
  };

  const resetWhatsappTemplate = () => {
    setWhatsappTemplate(DEFAULT_TEMPLATE);
  };

  const textareaClasses = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono';
  const labelClasses = 'text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Bell className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t('settings.reminders.title', 'Notification Templates')}</CardTitle>
            <CardDescription>
              {t('settings.reminders.description', 'Customize messages sent to customers via SMS and WhatsApp')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

          {/* Template variables help */}
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t('settings.reminders.available_variables', 'Available variables')}
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(TEMPLATE_HELP).map(([key, desc]) => (
                <div key={key} className="text-xs">
                  <code className="font-mono font-semibold">
                    {'{'}
                    {'{'}
                    {key}
                    {'}'}
                    {'}'}
                  </code>
                  <span className="ml-2 text-muted-foreground">— {desc}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* SMS Template */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className={labelClasses}>{t('settings.reminders.sms_template', 'SMS template')}</label>
              <Button type="button" variant="outline" size="sm" onClick={resetSmsTemplate}>
                <RotateCcw className="mr-1 size-3" />
                {t('common.reset', 'Reset')}
              </Button>
            </div>
            <textarea
              value={smsTemplate}
              onChange={(e) => setSmsTemplate(e.target.value)}
              rows={4}
              placeholder="Enter SMS template..."
              className={textareaClasses}
            />
            <p className="text-xs text-muted-foreground">{smsTemplate.length}/160 characters (SMS length)</p>
          </div>

          <Separator />

          {/* WhatsApp Template */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className={labelClasses}>{t('settings.reminders.whatsapp_template', 'WhatsApp template')}</label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={copyToWhatsapp}>
                  <Copy className="mr-1 size-3" />
                  {t('settings.reminders.copy_from_sms', 'Copy from SMS')}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={resetWhatsappTemplate}>
                  <RotateCcw className="mr-1 size-3" />
                  {t('common.reset', 'Reset')}
                </Button>
              </div>
            </div>
            <textarea
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              rows={4}
              placeholder="Enter WhatsApp template..."
              className={textareaClasses}
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.reminders.whatsapp_note', 'WhatsApp allows longer messages and media support')}
            </p>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save changes')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
