/**
 * TransactionFormDrawer component
 * Form for creating/editing transactions
 * Uses shadcn/ui components with i18n
 */

import { useTranslation } from 'react-i18next';
import { FormEvent } from 'react';
import { FileUp, CalendarDays, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TransactionForm } from '../types/ledgerTypes';

interface TransactionFormDrawerProps {
  isOpen: boolean;
  isSubmitting: boolean;
  form: TransactionForm;
  isEditing: boolean;
  onClose: () => void;
  onFormChange: (field: keyof TransactionForm, value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: (e: FormEvent) => void;
  attachmentFile?: File | null;
}

export function TransactionFormDrawer({
  isOpen,
  isSubmitting,
  form,
  isEditing,
  onClose,
  onFormChange,
  onFileChange,
  onSubmit,
  attachmentFile,
}: TransactionFormDrawerProps) {
  const { t } = useTranslation();
  const labelClasses = 'text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground';
  const isSale = form.type === 'SALE';

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('ledger.transaction.edit') : t('ledger.transaction.new')}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <label className={labelClasses}>
              {t('ledger.transaction.type')}
            </label>
            <select
              value={form.type}
              onChange={(e) => onFormChange('type', e.target.value as any)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-1"
            >
              <option value="SALE">{t('ledger.transaction.sale')}</option>
              <option value="PAYMENT">{t('ledger.transaction.payment')}</option>
            </select>
          </div>

          {/* Amount fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className={labelClasses}>
                {t('ledger.transaction.total_amount')}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.totalAmount}
                onChange={(e) => onFormChange('totalAmount', e.target.value)}
                placeholder="0.00"
                required={isSale}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClasses}>
                {isSale
                  ? t('ledger.transaction.paid_now_optional')
                  : t('ledger.transaction.payment_amount')}
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.paidAmount}
                onChange={(e) => onFormChange('paidAmount', e.target.value)}
                placeholder="0.00"
                required={!isSale}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className={labelClasses}>
              {t('ledger.transaction.date')}
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={form.transactionDate}
                onChange={(e) => onFormChange('transactionDate', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className={labelClasses}>
              {t('ledger.transaction.description')}
            </label>
            <Input
              type="text"
              value={form.description}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder={t('ledger.transaction.description')}
            />
          </div>

          {/* Attachment */}
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">
            <FileUp className="h-4 w-4" />
            <span>{attachmentFile ? attachmentFile.name : t('ledger.transaction.attachment')}</span>
            <input
              type="file"
              onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2 border-t pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {isEditing ? t('ledger.transaction.edit') : t('ledger.buttons.save')}
            </Button>
            <Button type="button" onClick={onClose} variant="outline">
              {t('ledger.buttons.close')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
