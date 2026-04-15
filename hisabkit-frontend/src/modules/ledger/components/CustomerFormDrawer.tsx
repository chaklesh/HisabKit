/**
 * modules/ledger/components/CustomerFormDrawer.tsx
 * Customer create/edit form in a Sheet drawer.
 * Uses React Hook Form + Zod for validation.
 * Accessibility: all fields have IDs, errors use role="alert".
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Trash2 } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import type { CustomerForm } from '../types/ledgerTypes';

// ── Validation schema ─────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, 'Customer name is required').max(120),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  gstNumber: z
    .string()
    .max(15)
    .regex(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
    .optional()
    .or(z.literal('')),
  dueDate: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormDrawerProps {
  isOpen: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  /** Initial values for the form. When editing, populate from selected customer. */
  initialValues: CustomerForm;
  onClose: () => void;
  onSubmit: (values: CustomerForm) => void;
  onDelete?: () => void;
}

export function CustomerFormDrawer({
  isOpen,
  isEditing,
  isSubmitting,
  initialValues,
  onClose,
  onSubmit,
  onDelete,
}: CustomerFormDrawerProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  // Sync initial values when the drawer opens with a different customer
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const handleClose = () => {
    reset(initialValues);
    onClose();
  };

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      phone: values.phone ?? '',
      email: values.email ?? '',
      address: values.address ?? '',
      gstNumber: values.gstNumber ?? '',
      dueDate: values.dueDate ?? '',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isEditing ? t('ledger.customer.edit_title', 'Edit Customer') : t('ledger.customer.add_title', 'Add Customer')}
          </SheetTitle>
        </SheetHeader>

        <form
          id="customer-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="mt-6 space-y-4"
        >
          {/* Name */}
          <FormField
            label={t('ledger.customer.name', 'Name')}
            required
            htmlFor="customer-name"
            error={errors.name?.message}
          >
            <Input
              id="customer-name"
              type="text"
              placeholder={t('ledger.customer.name_placeholder', 'e.g. Ramesh Traders')}
              aria-invalid={!!errors.name}
              {...register('name')}
            />
          </FormField>

          {/* Phone & Email */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label={t('ledger.customer.phone', 'Phone')}
              htmlFor="customer-phone"
              error={errors.phone?.message}
            >
              <Input
                id="customer-phone"
                type="tel"
                placeholder="9876543210"
                aria-invalid={!!errors.phone}
                {...register('phone')}
              />
            </FormField>
            <FormField
              label={t('ledger.customer.email', 'Email')}
              htmlFor="customer-email"
              error={errors.email?.message}
            >
              <Input
                id="customer-email"
                type="email"
                placeholder="name@shop.com"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </FormField>
          </div>

          {/* Address */}
          <FormField
            label={t('ledger.customer.address', 'Address')}
            htmlFor="customer-address"
            error={errors.address?.message}
          >
            <Input
              id="customer-address"
              type="text"
              placeholder={t('ledger.customer.address_placeholder', 'Shop #12, Market Road')}
              {...register('address')}
            />
          </FormField>

          {/* GST & Due Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              label={t('ledger.customer.gst_number', 'GST Number')}
              htmlFor="customer-gst"
              error={errors.gstNumber?.message}
            >
              <Input
                id="customer-gst"
                type="text"
                placeholder="29AAAAA0000A1Z5"
                className="uppercase"
                {...register('gstNumber')}
              />
            </FormField>
            <FormField
              label={t('ledger.customer.due_date', 'Due Date')}
              htmlFor="customer-due-date"
              error={errors.dueDate?.message}
              hint={t('ledger.customer.due_date_hint', 'Payment due reminder')}
            >
              <Input
                id="customer-due-date"
                type="date"
                {...register('dueDate')}
              />
            </FormField>
          </div>

          {/* Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2 border-t pt-4">
            <Button
              type="submit"
              form="customer-form"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isEditing ? t('ledger.buttons.update', 'Update') : t('ledger.buttons.create', 'Add Customer')}
            </Button>

            {isEditing && onDelete ? (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={onDelete}
                variant="destructive"
                className="flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('ledger.buttons.delete', 'Delete')}
              </Button>
            ) : (
              <Button type="button" onClick={handleClose} variant="outline">
                {t('ledger.buttons.cancel', 'Cancel')}
              </Button>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
