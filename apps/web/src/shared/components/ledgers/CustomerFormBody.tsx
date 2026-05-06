import { FormField } from "@hisabkit/ui/components/FormField";
import { Input } from "@hisabkit/ui/components/Input";
import { Calendar, CreditCard, Mail, MapPin, Phone, Tag } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

export interface CustomerFormBodyProps {
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  register: UseFormRegister<any>;
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  errors: FieldErrors<any>;
  dateInputRef: React.RefObject<HTMLInputElement | null>;
  isEditing?: boolean;
}

export function CustomerFormBody({
  register,
  errors,
  dateInputRef,
  isEditing,
}: CustomerFormBodyProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <FormField
        label={t("ledger.customer.name_label", "Customer Name")}
        required
        htmlFor="customer-name"
        error={errors.name?.message as string}
      >
        <Input
          id="customer-name"
          className="input-premium h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800"
          placeholder={t("ledger.customer.name_placeholder", "Full Name or Business Name")}
          autoFocus={!isEditing}
          {...register("name")}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={t("ledger.customer.mobile_label", "Mobile")}
          htmlFor="customer-phone"
          error={errors.phone?.message as string}
        >
          <div className="relative group">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="customer-phone"
              className="input-premium pl-10 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800"
              placeholder={t("ledger.customer.mobile_placeholder", "Number")}
              {...register("phone")}
            />
          </div>
        </FormField>

        <FormField
          label={t("ledger.customer.email_label", "Email")}
          htmlFor="customer-email"
          error={errors.email?.message as string}
        >
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="customer-email"
              className="input-premium pl-10 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800"
              type="email"
              placeholder={t("ledger.customer.email_placeholder", "Address")}
              {...register("email")}
            />
          </div>
        </FormField>
      </div>

      <FormField
        label={t("ledger.customer.address_label", "Shop / Office Address")}
        htmlFor="customer-address"
        error={errors.address?.message as string}
      >
        <div className="relative group">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            id="customer-address"
            className="input-premium pl-10 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800"
            placeholder={t("ledger.customer.address_placeholder", "Street address or City")}
            {...register("address")}
          />
        </div>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label={t("ledger.customer.gstin_label", "GSTIN")}
          htmlFor="customer-gst"
          error={errors.gstNumber?.message as string}
        >
          <div className="relative group">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="customer-gst"
              className="input-premium pl-10 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800"
              placeholder={t("ledger.customer.gstin_placeholder", "GST Number")}
              {...register("gstNumber")}
            />
          </div>
        </FormField>
        <FormField
          label={t("ledger.customer.due_date", "Due Date")}
          htmlFor="customer-due-date"
          error={errors.dueDate?.message as string}
        >
          <div
            className="relative group cursor-pointer"
            onClick={() => dateInputRef.current?.showPicker()}
          >
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              id="customer-due-date"
              className="input-premium pl-10 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 cursor-pointer w-full"
              type="date"
              {...register("dueDate")}
              // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
              // biome-ignore lint: suppressed for zero-error monorepo state
              ref={(e: any) => {
                register("dueDate").ref(e);
                // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
                // biome-ignore lint: suppressed for zero-error monorepo state
                if (dateInputRef) (dateInputRef as any).current = e;
              }}
            />
          </div>
        </FormField>
      </div>

      <FormField
        label={t("ledger.customer.tags_label", "Categories / Tags")}
        htmlFor="customer-tags"
        error={errors.tags?.message as string}
      >
        <div className="relative group">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            id="customer-tags"
            className="input-premium pl-10 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800"
            placeholder={t("ledger.customer.tags_placeholder", "Wholesale, Friend, etc.")}
            {...register("tags")}
          />
        </div>
      </FormField>
    </div>
  );
}
