import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Loader2, UserPlus, Save, Trash2, X, Briefcase, Phone, Mail, Map, CreditCard, Calendar } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import type { CustomerForm } from '../types/ledgerTypes';
import { cn } from '@/shared/lib/utils';

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
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen, initialValues, reset]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      ...data,
      phone: data.phone ?? '',
      email: data.email ?? '',
      address: data.address ?? '',
      gstNumber: data.gstNumber ?? '',
      dueDate: data.dueDate ?? '',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md p-0 overflow-hidden border-none glass-card focus-visible:ring-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="p-8 pb-4 space-y-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {isEditing ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                   </div>
                   <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white">
                     {isEditing ? 'Edit Customer' : 'Add Customer'}
                   </SheetTitle>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                </button>
             </div>
             <SheetDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
               {isEditing ? 'Update customer details' : 'Enter customer information'}
             </SheetDescription>
          </SheetHeader>

          {/* Form Area */}
          <form
            id="customer-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
          >
            {/* Identity Group */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-slate-400 cursor-help" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Identity Details</span>
               </div>
               
               <FormField
                 label={t('ledger.customer.name', 'Name')}
                 required
                 htmlFor="customer-name"
                 error={errors.name?.message}
               >
                 <Input
                   id="customer-name"
                   className="input-premium h-14"
                   placeholder="e.g. Acme Corp or John Doe"
                   {...register('name')}
                 />
               </FormField>

               <div className="grid grid-cols-2 gap-4">
                 <FormField
                   label="Phone"
                   htmlFor="customer-phone"
                   error={errors.phone?.message}
                 >
                   <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        id="customer-phone"
                        className="input-premium pl-11 h-14"
                        placeholder="9876..."
                        {...register('phone')}
                      />
                   </div>
                 </FormField>
                 <FormField
                   label="Email"
                   htmlFor="customer-email"
                   error={errors.email?.message}
                 >
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        id="customer-email"
                        className="input-premium pl-11 h-14"
                        type="email"
                        placeholder="bill@..."
                        {...register('email')}
                      />
                   </div>
                 </FormField>
               </div>
            </div>

            {/* Logistics Group */}
            <div className="space-y-6">
               <div className="flex items-center gap-2 mb-2">
                  <Map className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Logistics & Tax</span>
               </div>
               
               <FormField
                 label="Address"
                 htmlFor="customer-address"
                 error={errors.address?.message}
               >
                 <Input
                   id="customer-address"
                   className="input-premium h-14"
                   placeholder="Unit #, Street, City"
                   {...register('address')}
                 />
               </FormField>

               <div className="grid grid-cols-2 gap-4">
                 <FormField
                   label="GST Number"
                   htmlFor="customer-gst"
                   error={errors.gstNumber?.message}
                 >
                   <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        id="customer-gst"
                        className="input-premium pl-11 uppercase h-14"
                        placeholder="29AAA..."
                        {...register('gstNumber')}
                      />
                   </div>
                 </FormField>
                 <FormField
                   label="Due Date"
                   htmlFor="customer-due-date"
                   error={errors.dueDate?.message}
                 >
                   <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        id="customer-due-date"
                        className="input-premium pl-11 h-14"
                        type="date"
                        {...register('dueDate')}
                      />
                   </div>
                 </FormField>
               </div>
            </div>
          </form>

          {/* Actions Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
             <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  form="customer-form"
                  disabled={isSubmitting || (!isDirty && isEditing)}
                  className={cn(
                    "btn-premium h-14 w-full shadow-xl",
                    (!isDirty && isEditing) && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    isEditing ? <Save className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Save Changes' : 'Add Customer'}
                </Button>

                {isEditing && onDelete ? (
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={onDelete}
                    variant="ghost"
                    className="h-10 w-full rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-all font-semibold"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Customer
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={onClose} 
                    variant="ghost"
                    className="h-10 w-full rounded-lg text-slate-600 dark:text-slate-400 font-semibold"
                  >
                    Cancel
                  </Button>
                )}
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
