import { Building2, Save } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { Tenant } from '@/shared/types';

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
      className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-slate-900">
        <Building2 className="h-5 w-5" />
        Business Profile and Reminder Templates
      </h2>
      <p className="mb-4 text-xs text-slate-500">Template variables: {templateHelp}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <p className={formLabelClass}>Business name</p>
          <input value={tenant.name || ''} onChange={(e) => setTenant((p) => ({ ...p, name: e.target.value }))} placeholder="Business name" className={formInputClass} />
        </div>
        <div className="space-y-1">
          <p className={formLabelClass}>Business type</p>
          <input value={tenant.businessType || ''} onChange={(e) => setTenant((p) => ({ ...p, businessType: e.target.value }))} placeholder="Retail, Wholesale, Services..." className={formInputClass} />
        </div>
        <div className="space-y-1">
          <p className={formLabelClass}>Owner name</p>
          <input value={tenant.ownerName || ''} onChange={(e) => setTenant((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner name" className={formInputClass} />
        </div>
        <div className="space-y-1">
          <p className={formLabelClass}>Business phone</p>
          <input value={tenant.businessPhone || ''} onChange={(e) => setTenant((p) => ({ ...p, businessPhone: e.target.value }))} placeholder="+91xxxxxxxxxx" className={formInputClass} />
        </div>
        <div className="space-y-1">
          <p className={formLabelClass}>Business email</p>
          <input value={tenant.businessEmail || ''} onChange={(e) => setTenant((p) => ({ ...p, businessEmail: e.target.value }))} placeholder="accounts@business.com" className={formInputClass} />
        </div>
        <div className="space-y-1">
          <p className={formLabelClass}>GST number</p>
          <input value={tenant.gstNumber || ''} onChange={(e) => setTenant((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GSTIN" className={formInputClass} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className={formLabelClass}>Logo URL</p>
          <input value={tenant.logoUrl || ''} onChange={(e) => setTenant((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="https://..." className={formInputClass} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className={formLabelClass}>Business address</p>
          <input value={tenant.businessAddress || ''} onChange={(e) => setTenant((p) => ({ ...p, businessAddress: e.target.value }))} placeholder="Business address" className={formInputClass} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className={formLabelClass}>SMS template</p>
          <textarea value={tenant.smsTemplate || ''} onChange={(e) => setTenant((p) => ({ ...p, smsTemplate: e.target.value }))} placeholder="SMS reminder template" className={`min-h-24 ${formInputClass}`} />
        </div>
        <div className="space-y-1 md:col-span-2">
          <p className={formLabelClass}>WhatsApp template</p>
          <textarea value={tenant.whatsappTemplate || ''} onChange={(e) => setTenant((p) => ({ ...p, whatsappTemplate: e.target.value }))} placeholder="WhatsApp reminder template" className={`min-h-24 ${formInputClass}`} />
        </div>
      </div>
      <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">
        <Save className="h-4 w-4" />
        Save tenant settings
      </button>
    </form>
  );
}

