/**
 * CustomerFormDrawer component
 * Form for creating/editing customers
 * Uses shadcn/ui components with i18n
 */

import { useTranslation } from 'react-i18next';
import { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CustomerForm } from '../types/ledgerTypes';

interface CustomerFormDrawerProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  form: CustomerForm;
  onClose: () => void;
  onFormChange: (field: keyof CustomerForm, value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onDelete?: () => void;
}

export function CustomerFormDrawer({
  isOpen,
  isEditing,
  isSubmitting,
  form,
  onClose,
  onFormChange,
  onSubmit,
  onDelete,
}: CustomerFormDrawerProps) {
  const { t } = useTranslation();
  const labelClasses = 'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('ledger.customer.title') : t('ledger.customer.title')}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label className={labelClasses}>
              {t('ledger.customer.name')} *
            </label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder={t('ledger.customer.name')}
              required
            />
          </div>

          {/* Phone & Email */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClasses}>
                {t('ledger.customer.phone')}
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
                placeholder={t('ledger.customer.phone')}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>
                {t('ledger.customer.email')}
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => onFormChange('email', e.target.value)}
                placeholder={t('ledger.customer.email')}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className={labelClasses}>
              {t('ledger.customer.address')}
            </label>
            <Input
              type="text"
              value={form.address}
              onChange={(e) => onFormChange('address', e.target.value)}
              placeholder={t('ledger.customer.address')}
            />
          </div>

          {/* GST & Due Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClasses}>
                {t('ledger.customer.gst_number')}
              </label>
              <Input
                type="text"
                value={form.gstNumber}
                onChange={(e) => onFormChange('gstNumber', e.target.value)}
                placeholder={t('ledger.customer.gst_number')}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>
                {t('ledger.customer.due_date')}
              </label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => onFormChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2 border-t pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !form.name.trim()}
              className="flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isEditing ? t('ledger.buttons.update') : t('ledger.buttons.create')}
            </Button>
            {isEditing ? (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={onDelete}
                variant="destructive"
                className="flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('ledger.buttons.delete')}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => onFormChange('name', '')}
                variant="outline"
              >
                {t('ledger.buttons.clear')}
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
