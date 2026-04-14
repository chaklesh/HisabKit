/**
 * Business profile settings component
 * Manages business/tenant configuration
 * Bridges settings module with existing profile API
 */

import { FormEvent, useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Tenant } from '../../../shared/types/domain';
import { useUpdateTenantProfile } from '../../../features/profile/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import type { BusinessProfile } from '../types/settingsTypes';

interface BusinessSectionProps {
  businessData?: Tenant | null;
  onLoaded?: (data: Tenant) => void;
}

export function BusinessSection({ businessData, onLoaded }: BusinessSectionProps) {
  const { t } = useTranslation();
  const updateTenant = useUpdateTenantProfile();
  const [form, setForm] = useState<BusinessProfile>({
    name: '',
    businessType: '',
    ownerName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    gstNumber: '',
    logoUrl: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (businessData) {
      setForm({
        name: businessData.name || '',
        businessType: businessData.businessType || '',
        ownerName: businessData.ownerName || '',
        businessPhone: businessData.businessPhone || '',
        businessEmail: businessData.businessEmail || '',
        businessAddress: businessData.businessAddress || '',
        gstNumber: businessData.gstNumber || '',
        logoUrl: businessData.logoUrl || '',
      });
      onLoaded?.(businessData);
    }
  }, [businessData, onLoaded]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await updateTenant.mutateAsync({
        name: form.name,
        businessType: form.businessType || undefined,
        ownerName: form.ownerName || undefined,
        businessPhone: form.businessPhone || undefined,
        businessEmail: form.businessEmail || undefined,
        businessAddress: form.businessAddress || undefined,
        gstNumber: form.gstNumber || undefined,
        logoUrl: form.logoUrl || undefined,
      });
      toast.success(t('settings.business.saved', 'Business profile updated'));
    } catch (err: any) {
      const message = err.response?.data?.message || t('settings.business.error', 'Unable to save business profile');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const labelClasses = 'text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Building2 className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t('settings.business.title', 'Business Profile')}</CardTitle>
            <CardDescription>
              {t('settings.business.description', 'Configure your business details and branding')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className={labelClasses}>{t('settings.business.business_name', 'Business name')}</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your business name"
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>{t('settings.business.owner_name', 'Owner name')}</label>
              <Input
                type="text"
                value={form.ownerName || ''}
                onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                placeholder="Owner or manager name"
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>{t('settings.business.business_type', 'Business type')}</label>
              <Input
                type="text"
                value={form.businessType || ''}
                onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
                placeholder="e.g., Retail, Trading, Services"
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>{t('settings.business.business_phone', 'Business phone')}</label>
              <Input
                type="tel"
                value={form.businessPhone || ''}
                onChange={(e) => setForm((p) => ({ ...p, businessPhone: e.target.value }))}
                placeholder="+91 XXXXX XXXXX"
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>{t('settings.business.business_email', 'Business email')}</label>
              <Input
                type="email"
                value={form.businessEmail || ''}
                onChange={(e) => setForm((p) => ({ ...p, businessEmail: e.target.value }))}
                placeholder="business@example.com"
                className={inputClasses}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>{t('settings.business.gst_number', 'GST Number')}</label>
              <Input
                type="text"
                value={form.gstNumber || ''}
                onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
                placeholder="22AABVU1234H1Z0"
                className={inputClasses}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className={labelClasses}>{t('settings.business.business_address', 'Business address')}</label>
              <Input
                type="text"
                value={form.businessAddress || ''}
                onChange={(e) => setForm((p) => ({ ...p, businessAddress: e.target.value }))}
                placeholder="Street address, city, state, zip"
                className={inputClasses}
              />
            </div>
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
