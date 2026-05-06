import { cn } from "@hisabkit/lib/utils";
import { FormField } from "@hisabkit/ui/components/FormField";
import { Input } from "@hisabkit/ui/components/Input";
import { CalendarDays, FileText, FileUp, Paperclip, Trash2, X } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { AuthenticatedImage } from "../AuthenticatedImage";

import type { Attachment } from "@hisabkit/types";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

export interface TransactionFormBodyProps {
  isSale: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  register: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  errors: FieldErrors<any>;
  handleTypeToggle: (type: "SALE" | "PAYMENT") => void;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  attachmentFiles: File[];
  existingAttachments: Attachment[];
  onFileChange: (file: File | null) => void;
  onDeleteAttachment?: (attachmentId: string) => void;
  onRemoveNewFile?: (index: number) => void;
}

export function TransactionFormBody({
  isSale,
  register,
  errors,
  handleTypeToggle,
  dateInputRef,
  attachmentFiles,
  existingAttachments,
  onFileChange,
  onDeleteAttachment,
  onRemoveNewFile,
}: TransactionFormBodyProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Type Toggle */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl gap-1 border border-slate-200/50 dark:border-slate-800/50 shadow-inner">
        <button
          type="button"
          onClick={() => handleTypeToggle("SALE")}
          className={cn(
            "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            isSale ? "bg-white dark:bg-slate-800 text-rose-600 shadow-md" : "text-slate-400",
          )}
        >
          {t("ledger.transaction.gave_label", "Gave (Udhaar)")}
        </button>
        <button
          type="button"
          onClick={() => handleTypeToggle("PAYMENT")}
          className={cn(
            "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            !isSale ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-md" : "text-slate-400",
          )}
        >
          {t("ledger.transaction.got_label", "Got (Cash)")}
        </button>
      </div>

      {/* Financials */}
      <FinancialFields isSale={isSale} register={register} errors={errors} t={t} />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={t("ledger.transaction.date_label", "Date")}
          required
          htmlFor="txn-date"
          error={errors.transactionDate?.message as string}
        >
          <div
            className="relative group cursor-pointer"
            onClick={() => dateInputRef.current?.showPicker()}
          >
            <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="txn-date"
              type="date"
              className="input-premium pl-10 h-12 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold cursor-pointer"
              {...register("transactionDate")}
              ref={(e: HTMLInputElement | null) => {
                register("transactionDate").ref(e);
                if (dateInputRef)
                  (dateInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
              }}
            />
          </div>
        </FormField>
        <FormField
          label={t("ledger.transaction.details_label", "Details / Bill No")}
          htmlFor="txn-description"
          error={errors.description?.message as string}
        >
          <div className="relative group">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="txn-description"
              className="input-premium pl-10 h-12 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold"
              placeholder={t("ledger.transaction.remarks_placeholder", "Remarks")}
              {...register("description")}
            />
          </div>
        </FormField>
      </div>

      {/* Attachment Area */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t("ledger.transaction.attachments", "Evidence (Bills/Receipts)")}
          </span>
          <span className="text-[9px] font-bold text-slate-300">
            {existingAttachments.length + attachmentFiles.length} files
          </span>
        </div>

        {/* Attachment Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Existing Attachments */}
          {existingAttachments.map((att) => {
            const ext = att.fileName?.split(".").pop()?.toLowerCase() || "";
            const isImage =
              att.fileType?.startsWith("image/") ||
              ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

            return (
              <div
                key={att.id}
                className="group relative h-24 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {isImage ? (
                  <AuthenticatedImage
                    url={`/ledger/attachments/${att.id}/content`}
                    alt={att.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-rose-50/20 dark:bg-rose-950/20">
                    <FileText className="w-6 h-6 text-rose-500 mb-1" />
                    <span className="text-[8px] font-black uppercase text-rose-600 truncate w-full px-2 text-center">
                      {ext || "PDF"}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteAttachment?.(att.id)}
                  className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Newly Selected Files */}
          {attachmentFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="group relative h-24 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/20 overflow-hidden shadow-sm"
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-2">
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover opacity-50 grayscale"
                    alt="Preview"
                  />
                ) : (
                  <FileUp className="w-6 h-6 text-indigo-500 mb-1" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-500/10">
                  <span className="text-[8px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md shadow-sm">
                    New Upload
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveNewFile?.(idx)}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 hover:scale-100 active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Add New Trigger */}
          <label className="h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-900 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group">
            <Paperclip className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
            <span className="text-[8px] font-black uppercase text-slate-400 group-hover:text-indigo-600 transition-colors">
              {t("ledger.transaction.add_more", "Add More")}
            </span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => {
                const files = e.target.files;
                if (files) {
                  // biome-ignore lint: suppressed for zero-error monorepo state
                  Array.from(files).forEach((file) => onFileChange(file));
                }
              }}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function FinancialFields({
  isSale,
  register,
  errors,
  t,
}: {
  isSale: boolean;
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  t: TFunction;
}) {
  return (
    <div className="space-y-6">
      {isSale && (
        <FormField
          label={t("ledger.transaction.bill_value", "Bill Value")}
          required
          htmlFor="txn-total"
          error={errors.totalAmount?.message as string}
        >
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-rose-500 italic">
              ₹
            </span>
            <Input
              id="txn-total"
              type="number"
              step="0.01"
              className="input-premium pl-10 h-14 text-2xl font-black rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800"
              placeholder={t("ledger.transaction.amount_placeholder", "0.00")}
              {...register("totalAmount")}
            />
          </div>
        </FormField>
      )}
      <FormField
        label={
          isSale
            ? t("ledger.transaction.cash_received", "Cash Received")
            : t("ledger.transaction.amount_got", "Amount Got")
        }
        required={!isSale}
        htmlFor="txn-paid"
        error={errors.paidAmount?.message as string}
      >
        <div className="relative group">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-emerald-500 italic">
            ₹
          </span>
          <Input
            id="txn-paid"
            type="number"
            step="0.01"
            className="input-premium pl-10 h-14 text-2xl font-black rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-800"
            placeholder={t("ledger.transaction.amount_placeholder", "0.00")}
            {...register("paidAmount")}
          />
        </div>
      </FormField>
    </div>
  );
}
