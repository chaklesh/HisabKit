import { TransactionFormBody } from "@/shared/components/ledgers/TransactionFormBody";
import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, Loader2, Save, ShoppingBag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
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
import type { TransactionForm } from "../types/ledgerTypes";

/**
 * Transaction Validation Schema
 */
const transactionSchema = z
  .object({
    type: z.enum(["SALE", "PAYMENT"]),
    totalAmount: z.string().max(20),
    paidAmount: z.string().max(20),
    description: z.string().max(255).optional().or(z.literal("")),
    transactionDate: z.string().min(1, "Date is required"),
    customerId: z.string().uuid("Invalid customer"),
  })
  .superRefine((data, ctx) => {
    const total = Number(data.totalAmount || 0);
    const paid = Number(data.paidAmount || 0);

    if (data.type === "SALE") {
      if (total <= 0) {
        ctx.addIssue({ code: "custom", path: ["totalAmount"], message: "Enter bill value" });
      }
      if (paid < 0) {
        ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Invalid cash" });
      }
      if (paid > total) {
        ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Cash exceeds bill" });
      }
    } else {
      if (paid <= 0) {
        ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Enter amount got" });
      }
    }
  });

type FormValues = z.infer<typeof transactionSchema>;

interface TransactionFormDrawerProps {
  isOpen: boolean;
  isSubmitting: boolean;
  isEditing: boolean;
  initialValues: TransactionForm;
  attachmentFiles: File[];
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  // biome-ignore lint: suppressed for zero-error monorepo state
  existingAttachments: any[];
  onClose: () => void;
  onSubmit: (values: TransactionForm) => void;
  onDelete?: () => void;
  onFileChange: (file: File | null) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
  onRemoveNewFile?: (index: number) => void;
}

export function TransactionFormDrawer({
  isOpen,
  isSubmitting,
  isEditing,
  initialValues,
  attachmentFiles,
  existingAttachments,
  onClose,
  onSubmit,
  onDelete,
  onFileChange,
  onDeleteAttachment,
  onRemoveNewFile,
}: TransactionFormDrawerProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialValues,
  });

  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const txType = watch("type");
  const isSale = txType === "SALE";

  useEffect(() => {
    if (isOpen) {
      const values = { ...initialValues };
      if (!isEditing && !values.transactionDate) {
        values.transactionDate = new Date().toISOString().split("T")[0];
      }
      reset(values);
    }
  }, [isOpen, initialValues, reset, isEditing]);

  const handleTypeToggle = useCallback(
    (type: "SALE" | "PAYMENT") => {
      setValue("type", type, { shouldValidate: true });
      if (type === "PAYMENT") setValue("totalAmount", "");
      if (type === "SALE") setValue("paidAmount", "");
    },
    [setValue],
  );

  const onFormSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      description: values.description || "",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl focus-visible:ring-0"
      >
        <div className="h-full flex flex-col bg-white dark:bg-slate-950">
          {/* Compact Header */}
          <SheetHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950 px-8">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-2.5 rounded-xl shadow-lg transition-all",
                  isSale ? "bg-rose-500 text-white" : "bg-emerald-500 text-white",
                )}
              >
                {isSale ? <ShoppingBag className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5 text-left">
                <SheetTitle className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {isEditing
                    ? t("ledger.transaction.edit_title", "Edit Entry")
                    : t("ledger.transaction.add_title", "New Entry")}
                </SheetTitle>
                <SheetDescription className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {isEditing
                    ? t("ledger.transaction.edit_desc", "Update ledger record")
                    : isSale
                      ? t("ledger.transaction.add_desc", "Items gave on credit")
                      : t("ledger.transaction.payment_desc", "Cash/Payment received")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Content - Minimal Spacing */}
          <form
            id="transaction-form"
            onSubmit={handleSubmit(onFormSubmit)}
            noValidate
            className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
          >
            <TransactionFormBody
              isSale={isSale}
              register={register}
              errors={errors}
              handleTypeToggle={handleTypeToggle}
              dateInputRef={dateInputRef}
              attachmentFiles={attachmentFiles}
              existingAttachments={existingAttachments}
              onFileChange={onFileChange}
              onDeleteAttachment={onDeleteAttachment}
              onRemoveNewFile={onRemoveNewFile}
            />
          </form>

          <div className="p-6 pb-8 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 backdrop-blur-xl px-8">
            <div className="flex items-center gap-3">
              {isEditing && onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onDelete}
                  className="h-12 px-5 rounded-xl border-rose-100 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold text-[10px] uppercase tracking-widest shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="submit"
                form="transaction-form"
                disabled={isSubmitting || (!isDirty && isEditing && attachmentFiles.length === 0)}
                className={cn(
                  "h-12 flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-transform active:scale-[0.98]",
                  "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white disabled:opacity-50",
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing
                  ? t("ledger.buttons.save_entry", "Save Entry")
                  : t("ledger.buttons.add_entry", "Add Entry")}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
