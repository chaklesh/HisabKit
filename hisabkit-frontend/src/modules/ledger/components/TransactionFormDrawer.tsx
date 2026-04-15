/**
 * modules/ledger/components/TransactionFormDrawer.tsx
 * Transaction create/edit form in a Sheet drawer.
 * Uses React Hook Form + Zod for validation.
 * Financial amounts use HALF_UP precision consistent with the backend.
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { CalendarDays, FileUp, Loader2, Save } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import type { TransactionForm } from '../types/ledgerTypes';

// ── Validation schema ─────────────────────────────────────────────────────────
const schema = z
  .object({
    type: z.enum(['SALE', 'PAYMENT']),
    totalAmount: z.string(),
    paidAmount: z.string(),
    description: z.string().max(255).optional().or(z.literal('')),
    transactionDate: z.string().min(1, 'Transaction date is required'),
    customerId: z.string(),
  })
  .superRefine((data, ctx) => {
    const total = Number(data.totalAmount || 0);
    const paid = Number(data.paidAmount || 0);

    if (data.type === 'SALE') {
      if (total <= 0) {
        ctx.addIssue({ code: 'custom', path: ['totalAmount'], message: 'Sale amount must be greater than 0' });
      }
      if (paid < 0) {
        ctx.addIssue({ code: 'custom', path: ['paidAmount'], message: 'Paid amount cannot be negative' });
      }
      if (paid > total) {
        ctx.addIssue({ code: 'custom', path: ['paidAmount'], message: 'Paid amount cannot exceed total amount' });
      }
    }

    if (data.type === 'PAYMENT') {
      if (paid <= 0) {
        ctx.addIssue({ code: 'custom', path: ['paidAmount'], message: 'Payment amount must be greater than 0' });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

interface TransactionFormDrawerProps {
  isOpen: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  initialValues: TransactionForm;
  attachmentFile?: File | null;
  onClose: () => void;
  onSubmit: (values: TransactionForm) => void;
  onFileChange: (file: File | null) => void;
}

export function TransactionFormDrawer({
  isOpen,
  isSubmitting,
  isEditing,
  initialValues,
  attachmentFile,
  onClose,
  onSubmit,
  onFileChange,
}: TransactionFormDrawerProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const txType = watch('type');
  const isSale = txType === 'SALE';

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const handleClose = () => {
    reset(initialValues);
    onClose();
  };

  const handleTypeChange = (value: 'SALE' | 'PAYMENT') => {
    setValue('type', value, { shouldValidate: false });
    // Clear irrelevant amounts when switching type
    if (value === 'PAYMENT') setValue('totalAmount', '');
    if (value === 'SALE') setValue('paidAmount', '');
  };

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      customerId: values.customerId,
      type: values.type,
      totalAmount: values.totalAmount,
      paidAmount: values.paidAmount,
      description: values.description ?? '',
      transactionDate: values.transactionDate,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing
              ? t('ledger.transaction.edit', 'Edit Transaction')
              : t('ledger.transaction.new', 'New Transaction')}
          </SheetTitle>
        </SheetHeader>

        <form
          id="transaction-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="mt-6 space-y-4"
        >
          {/* Transaction Type */}
          <FormField
            label={t('ledger.transaction.type', 'Type')}
            htmlFor="txn-type"
            error={errors.type?.message}
          >
            <div className="flex gap-2">
              <Button
                type="button"
                id="txn-type"
                size="sm"
                variant={isSale ? 'default' : 'outline'}
                onClick={() => handleTypeChange('SALE')}
                className="flex-1"
                aria-pressed={isSale}
              >
                {t('ledger.transaction.sale', 'Sale / Credit')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!isSale ? 'default' : 'outline'}
                onClick={() => handleTypeChange('PAYMENT')}
                className="flex-1"
                aria-pressed={!isSale}
              >
                {t('ledger.transaction.payment', 'Payment Received')}
              </Button>
            </div>
          </FormField>

          {/* Amounts */}
          <div className="grid gap-3 sm:grid-cols-2">
            {isSale && (
              <FormField
                label={t('ledger.transaction.total_amount', 'Total Amount')}
                required={isSale}
                htmlFor="txn-total"
                error={errors.totalAmount?.message}
              >
                <Input
                  id="txn-total"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-invalid={!!errors.totalAmount}
                  {...register('totalAmount')}
                />
              </FormField>
            )}
            <FormField
              label={
                isSale
                  ? t('ledger.transaction.paid_now_optional', 'Paid Now (optional)')
                  : t('ledger.transaction.payment_amount', 'Payment Amount')
              }
              required={!isSale}
              htmlFor="txn-paid"
              error={errors.paidAmount?.message}
            >
              <Input
                id="txn-paid"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                aria-invalid={!!errors.paidAmount}
                {...register('paidAmount')}
              />
            </FormField>
          </div>

          {/* Date */}
          <FormField
            label={t('ledger.transaction.date', 'Date')}
            required
            htmlFor="txn-date"
            error={errors.transactionDate?.message}
          >
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="txn-date"
                type="date"
                className="pl-9"
                aria-invalid={!!errors.transactionDate}
                {...register('transactionDate')}
              />
            </div>
          </FormField>

          {/* Description */}
          <FormField
            label={t('ledger.transaction.description', 'Description')}
            htmlFor="txn-description"
            error={errors.description?.message}
          >
            <Input
              id="txn-description"
              type="text"
              placeholder={t('ledger.transaction.description_placeholder', 'e.g. Paint, Hardware purchase')}
              {...register('description')}
            />
          </FormField>

          {/* Attachment */}
          {!isEditing && (
            <div>
              <label
                htmlFor="txn-attachment"
                className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
              >
                <FileUp className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {attachmentFile ? attachmentFile.name : t('ledger.transaction.attachment', 'Attach invoice / receipt')}
                </span>
                <input
                  id="txn-attachment"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2 border-t pt-4">
            <Button
              type="submit"
              form="transaction-form"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? t('ledger.buttons.update', 'Update') : t('ledger.buttons.save', 'Save')}
            </Button>
            <Button type="button" onClick={handleClose} variant="outline">
              {t('ledger.buttons.cancel', 'Cancel')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
