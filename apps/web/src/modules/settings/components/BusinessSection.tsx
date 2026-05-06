import { useUpdateTenantProfile } from "@/modules/profile/services/useProfile";
import type { Tenant } from "@/shared/types";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hisabkit/ui/components/Card";
import { BadgeCheck, Briefcase, Building2, Globe, Mail, MapPin, Phone, Save } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { BusinessProfile } from "../types/settingsTypes";

interface BusinessSectionProps {
  businessData?: Tenant | null;
  onLoaded?: (data: Tenant) => void;
}

export function BusinessSection({ businessData, onLoaded }: BusinessSectionProps) {
  const { t } = useTranslation();
  const updateTenant = useUpdateTenantProfile();
  const [form, setForm] = useState<BusinessProfile>({
    name: "",
    businessType: "",
    ownerName: "",
    businessPhone: "",
    businessEmail: "",
    businessAddress: "",
    gstNumber: "",
    logoUrl: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (businessData) {
      setForm({
        name: businessData.name || "",
        businessType: businessData.businessType || "",
        ownerName: businessData.ownerName || "",
        businessPhone: businessData.businessPhone || "",
        businessEmail: businessData.businessEmail || "",
        businessAddress: businessData.businessAddress || "",
        gstNumber: businessData.gstNumber || "",
        logoUrl: businessData.logoUrl || "",
      });
      onLoaded?.(businessData);
    }
  }, [businessData, onLoaded]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await updateTenant.mutateAsync({
        name: form.name,
        businessType: form.businessType || undefined,
        ownerName: form.ownerName || undefined,
        businessPhone: form.businessPhone || undefined,
        businessEmail: form.businessEmail || undefined,
        businessAddress: form.businessAddress || undefined,
        gstNumber: form.gstNumber || undefined,
        logoUrl: form.logoUrl || undefined,
      });
      toast.success(t("settings.business.saved", "Business profile updated"), {
        description: "Your public business card has been synchronized.",
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        t("settings.business.error", "Unable to save business profile");
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900 dark:border-slate-800 outline-none";
  const labelClasses =
    "text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1.5 block";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm flex items-center justify-center shrink-0">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-indigo-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 text-[9px] font-black uppercase tracking-widest px-1.5 h-5">
                      <BadgeCheck className="w-3 h-3 mr-1" /> Verified Store
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight">
                    {form.name || "Your Business Name"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    {form.businessEmail || "public-business-profile"}
                  </CardDescription>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl px-6 h-11 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-200 dark:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save changes
                  </span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            {error && (
              <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-3 animate-in shake duration-300">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="space-y-2 lg:col-span-2">
                <label htmlFor="business-name" className={labelClasses}>
                  Legal Business Entity Name
                </label>
                <input
                  id="business-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your registered business name"
                  className={inputClasses}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="business-owner" className={labelClasses}>
                  Business Owner / MD
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="business-owner"
                    type="text"
                    value={form.ownerName || ""}
                    onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                    placeholder="Primary contact person"
                    className={cn(inputClasses, "pl-11")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="business-type" className={labelClasses}>
                  Industry / Niche
                </label>
                <input
                  id="business-type"
                  type="text"
                  value={form.businessType || ""}
                  onChange={(e) => setForm((p) => ({ ...p, businessType: e.target.value }))}
                  placeholder="e.g., General Stores, Pharmacy, etc."
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="business-phone" className={labelClasses}>
                  Help-desk Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="business-phone"
                    type="tel"
                    value={form.businessPhone || ""}
                    onChange={(e) => setForm((p) => ({ ...p, businessPhone: e.target.value }))}
                    placeholder="+91 00000 00000"
                    className={cn(inputClasses, "pl-11")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="business-email" className={labelClasses}>
                  Support Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="business-email"
                    type="email"
                    value={form.businessEmail || ""}
                    onChange={(e) => setForm((p) => ({ ...p, businessEmail: e.target.value }))}
                    placeholder="support@yourbrand.com"
                    className={cn(inputClasses, "pl-11")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="business-tax" className={labelClasses}>
                  GST / VAT Registration
                </label>
                <input
                  id="business-tax"
                  type="text"
                  value={form.gstNumber || ""}
                  onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
                  placeholder="TAX Identification Number"
                  className={inputClasses}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="business-hq" className={labelClasses}>
                  Physical Business Headquarters
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  <textarea
                    id="business-hq"
                    value={form.businessAddress || ""}
                    onChange={(e) => setForm((p) => ({ ...p, businessAddress: e.target.value }))}
                    placeholder="Street, City, Building, Zip"
                    rows={2}
                    className={cn(inputClasses, "pl-11 resize-none py-2")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
