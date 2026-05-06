import { CustomerFormBody } from "@/shared/components/ledgers/CustomerFormBody";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact2, Loader2, Save, Trash2, UserPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { cn } from "@hisabkit/lib/utils";
import { Button } from "@hisabkit/ui/components/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@hisabkit/ui/components/Sheet";
import type { CustomerForm } from "../types/ledgerTypes";

/**
 * Validation Schema - Aligned with Backend CreateCustomerRequest DTO
 */
const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(120),
  phone: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  gstNumber: z.string().max(15).optional().or(z.literal("")),
  tags: z.string().max(100).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof customerSchema>;

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
    resolver: zodResolver(customerSchema),
    defaultValues: initialValues,
  });

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal state and prefill due date for new accounts
  useEffect(() => {
    if (isOpen) {
      const values = { ...initialValues };
      if (!isEditing && !values.dueDate) {
        // Keep it empty by default
      }
      reset(values);
    }
  }, [isOpen, initialValues, reset, isEditing]);

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      gstNumber: data.gstNumber || "",
      tags: data.tags || "",
      dueDate: data.dueDate || "",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl focus-visible:ring-0"
      >
        <div className="h-full flex flex-col bg-white dark:bg-slate-950">
          {/* Compact Header Section */}
          <SheetHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950 px-8">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
                {isEditing ? <Contact2 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <SheetTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isEditing
                    ? t("ledger.customer.edit_title", "Edit Customer")
                    : t("ledger.customer.add_title", "Add New Customer")}
                </SheetTitle>
                <SheetDescription className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {isEditing
                    ? t("ledger.customer.edit_desc", "Modify account details")
                    : t("ledger.customer.add_desc", "Register a new customer in ledger")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content - Compact Scrollable Area */}
          <form
            id="customer-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar"
          >
            <CustomerFormBody
              register={register}
              errors={errors}
              dateInputRef={dateInputRef}
              isEditing={isEditing}
            />
          </form>

          {/* Compact Footer Actions */}
          <div className="p-6 pb-8 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-xl px-8">
            <div className="flex items-center gap-3">
              {isEditing && onDelete && (
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onDelete}
                  variant="ghost"
                  className="h-12 flex-1 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-[9px] uppercase tracking-widest border border-rose-100 dark:border-rose-900/30"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("ledger.buttons.archive_party", "Delete")}
                </Button>
              )}
              <Button
                type="submit"
                form="customer-form"
                disabled={isSubmitting || (!isDirty && isEditing)}
                className={cn(
                  "h-12 flex-[2] rounded-xl font-black text-[10px] uppercase tracking-widest transition-transform active:scale-[0.98] shadow-lg",
                  "bg-slate-900 hover:bg-black dark:bg-white dark:text-slate-900 text-white disabled:opacity-50",
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : isEditing ? (
                  <Save className="h-4 w-4 mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isEditing
                  ? t("ledger.buttons.save_party", "Save Customer")
                  : t("ledger.buttons.create_party", "Add Customer")}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
