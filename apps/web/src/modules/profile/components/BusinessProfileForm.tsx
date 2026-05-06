import type { Tenant } from "@/shared/types";
import { Button } from "@hisabkit/ui/components/Button";
import {
  Briefcase,
  Building2,
  CreditCard,
  Info,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Quote,
  Save,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type BusinessProfileFormProps = {
  tenant: Tenant;
  setTenant: Dispatch<SetStateAction<Tenant>>;
  onSubmit: () => Promise<void>;
  templateHelp: string;
  formInputClass: string;
  formLabelClass: string;
};

export function BusinessProfileForm({
  tenant,
  setTenant,
  onSubmit,
  templateHelp,
  formInputClass,
  formLabelClass,
}: BusinessProfileFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="space-y-12"
    >
      {/* Information Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/40">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-indigo-600">
          <Info className="w-6 h-6" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Template Variables
          </p>
          <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all">
            {templateHelp}
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Identity Group */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Building2 className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Business Identity
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label className={formLabelClass} htmlFor="business-name">
                Business Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="business-name"
                  value={tenant.name || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Business Name"
                  className={`${formInputClass} pl-11`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={formLabelClass} htmlFor="business-type">
                Business Type
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="business-type"
                  value={tenant.businessType || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, businessType: e.target.value }))}
                  placeholder="Category"
                  className={`${formInputClass} pl-11`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={formLabelClass} htmlFor="owner-name">
                Owner Name
              </label>
              <input
                id="owner-name"
                value={tenant.ownerName || ""}
                onChange={(e) => setTenant((p) => ({ ...p, ownerName: e.target.value }))}
                placeholder="Owner Name"
                className={formInputClass}
              />
            </div>
            <div className="space-y-1">
              <label className={formLabelClass} htmlFor="gst-number">
                GST Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="gst-number"
                  value={tenant.gstNumber || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, gstNumber: e.target.value }))}
                  placeholder="Tax ID"
                  className={`${formInputClass} pl-11 uppercase`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Connectivity Group */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Phone className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Contact Information
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1">
              <label className={formLabelClass} htmlFor="biz-phone">
                Business Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="biz-phone"
                  value={tenant.businessPhone || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, businessPhone: e.target.value }))}
                  placeholder="Phone Number"
                  className={`${formInputClass} pl-11`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className={formLabelClass} htmlFor="biz-email">
                Business Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="biz-email"
                  value={tenant.businessEmail || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, businessEmail: e.target.value }))}
                  placeholder="Email address"
                  className={`${formInputClass} pl-11`}
                />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={formLabelClass} htmlFor="logo-url">
                Logo URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="logo-url"
                  value={tenant.logoUrl || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className={`${formInputClass} pl-11`}
                />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className={formLabelClass} htmlFor="biz-address">
                Business Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  id="biz-address"
                  value={tenant.businessAddress || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, businessAddress: e.target.value }))}
                  placeholder="Full address"
                  className={`${formInputClass} pl-11`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Automation Group */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Message Templates
            </span>
          </div>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className={formLabelClass} htmlFor="sms-template">
                SMS Template
              </label>
              <div className="relative">
                <Quote className="absolute left-4 top-6 w-4 h-4 text-slate-200" />
                <textarea
                  id="sms-template"
                  value={tenant.smsTemplate || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, smsTemplate: e.target.value }))}
                  placeholder="SMS text format..."
                  className={`${formInputClass} min-h-32 pl-11 py-5 resize-none`}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={formLabelClass} htmlFor="wa-template">
                WhatsApp Template
              </label>
              <div className="relative">
                <Quote className="absolute left-4 top-6 w-4 h-4 text-slate-200" />
                <textarea
                  id="wa-template"
                  value={tenant.whatsappTemplate || ""}
                  onChange={(e) => setTenant((p) => ({ ...p, whatsappTemplate: e.target.value }))}
                  placeholder="WhatsApp text format..."
                  className={`${formInputClass} min-h-32 pl-11 py-5 resize-none`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          className="h-10 px-6 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold w-full md:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Business Profile
        </Button>
      </div>
    </form>
  );
}
