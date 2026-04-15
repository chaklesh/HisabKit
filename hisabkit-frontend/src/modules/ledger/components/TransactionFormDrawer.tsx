import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarDays, FileUp, Loader2, Save, X, ShoppingBag, Landmark, Info, Paperclip, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FormField } from '@/shared/components/ui/form-field';
import type { TransactionForm } from '../types/ledgerTypes';
import { cn } from '@/shared/lib/utils';

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
  existingAttachment?: any | null;
  onClose: () => void;
  onSubmit: (values: TransactionForm) => void;
  onFileChange: (file: File | null) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
}

export function TransactionFormDrawer({
  isOpen,
  isSubmitting,
  isEditing,
  initialValues,
  attachmentFile,
  existingAttachment,
  onClose,
  onSubmit,
  onFileChange,
  onDeleteAttachment,
}: TransactionFormDrawerProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const txType = watch('type');
  const isSale = txType === 'SALE';

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [isOpen, initialValues, reset]);

  const handleTypeChange = (value: 'SALE' | 'PAYMENT') => {
    setValue('type', value, { shouldValidate: false });
    if (value === 'PAYMENT') setValue('totalAmount', '');
    if (value === 'SALE') setValue('paidAmount', '');
  };

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      customerId: values.customerId,
      type: values.type,
      totalAmount: values.totalAmount,
      paidAmount: values.paidAmount,
      description: values.description || '',
      transactionDate: values.transactionDate,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="sm:max-w-md p-0 overflow-hidden border-none glass-card focus-visible:ring-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 pb-4 space-y-2 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "p-2.5 rounded-2xl shadow-sm transition-colors",
                     isSale ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                   )}>
                      {isSale ? <ShoppingBag className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                   </div>
                   <SheetTitle className="text-xl font-bold text-slate-900 dark:text-white">
                     {isEditing ? 'Edit Transaction' : (isSale ? 'New Sale' : 'New Payment')}
                   </SheetTitle>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <X className="w-5 h-5 text-slate-500" />
                </button>
             </div>
             <SheetDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
               {isEditing ? 'Update transaction details' : 'Record a new transaction'}
             </SheetDescription>
          </div>

          {/* Form Area */}
          <form
            id="transaction-form"
            onSubmit={handleSubmit(onFormSubmit)}
            noValidate
            className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar"
          >
            {/* Classification */}
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <Info className="w-4 h-4 text-slate-400 cursor-help" />
                 <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Transaction Type</span>
              </div>
              <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl gap-2">
                <Button
                  type="button"
                  onClick={() => handleTypeChange('SALE')}
                  variant={isSale ? 'default' : 'ghost'}
                  className={cn(
                    "flex-1 h-12 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                    isSale ? "bg-white text-rose-600 shadow-md hover:bg-white" : "text-slate-500 hover:bg-slate-200/50"
                  )}
                >
                  Sale
                </Button>
                <Button
                  type="button"
                  onClick={() => handleTypeChange('PAYMENT')}
                  variant={!isSale ? 'default' : 'ghost'}
                  className={cn(
                    "flex-1 h-10 rounded-lg text-xs font-bold transition-all",
                    !isSale ? "bg-white text-emerald-600 shadow-sm hover:bg-white" : "text-slate-600 hover:bg-slate-200/50"
                  )}
                >
                  Payment
                </Button>
              </div>
            </div>

            {/* Financials */}
            <div className="space-y-4">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Amount Details</span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {isSale && (
                   <FormField
                     label="Total Amount"
                     required
                     htmlFor="txn-total"
                     error={errors.totalAmount?.message}
                   >
                     <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
                        <Input
                          id="txn-total"
                          type="number"
                          step="0.01"
                          className="input-premium pl-8 h-14 text-lg font-black"
                          placeholder="0.00"
                          {...register('totalAmount')}
                        />
                     </div>
                   </FormField>
                 )}
                 <FormField
                   label={isSale ? "Amount Paid" : "Payment Amount"}
                   required={!isSale}
                   htmlFor="txn-paid"
                   error={errors.paidAmount?.message}
                 >
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
                      <Input
                        id="txn-paid"
                        type="number"
                        step="0.01"
                        className="input-premium pl-8 h-14 text-lg font-black"
                        placeholder="0.00"
                        {...register('paidAmount')}
                      />
                   </div>
                 </FormField>
               </div>
            </div>

            {/* Metadata */}
            <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                   label="Date"
                   required
                   htmlFor="txn-date"
                   error={errors.transactionDate?.message}
                 >
                   <div className="relative">
                      <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <Input
                        id="txn-date"
                        type="date"
                        className="input-premium pl-11 h-14"
                        {...register('transactionDate')}
                      />
                   </div>
                 </FormField>
                 <FormField
                   label="Description"
                   htmlFor="txn-description"
                 >
                   <Input
                     id="txn-description"
                     className="input-premium h-14"
                     placeholder="Itemized details..."
                     {...register('description')}
                   />
                 </FormField>
               </div>
            </div>

            {/* Attachment */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Proof / Document</span>
              </div>

              {existingAttachment && !attachmentFile ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {existingAttachment.fileName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Already Uploaded
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button"
                    onClick={() => onDeleteAttachment?.(existingAttachment.id)}
                    className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="group block cursor-pointer">
                  <div className={cn(
                    "flex flex-col items-center justify-center gap-3 p-8 rounded-[2rem] border-2 border-dashed transition-all duration-300",
                    attachmentFile 
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20" 
                      : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                  )}>
                    <div className={cn(
                      "p-4 rounded-2xl transition-colors",
                      attachmentFile ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500"
                    )}>
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {attachmentFile ? attachmentFile.name : (isEditing ? 'Update Receipt' : 'Attach Receipt')}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">
                        JPG, PNG, PDF • Max 10MB
                      </p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
             <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  form="transaction-form"
                  disabled={isSubmitting || (!isDirty && isEditing)}
                  className={cn(
                    "btn-premium h-14 w-full shadow-xl",
                    (!isDirty && isEditing) && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Save Changes' : 'Save Transaction'}
                </Button>
                <Button 
                   type="button" 
                   onClick={onClose} 
                   variant="ghost"
                   className="h-10 w-full rounded-lg text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancel
                </Button>
             </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
