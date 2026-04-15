import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { Tenant } from '@/shared/types';
import type { TenantFormState } from '../types/adminTypes';

type TenantsTabProps = {
  tenants: Tenant[];
  showTenantEditor: boolean;
  setShowTenantEditor: Dispatch<SetStateAction<boolean>>;
  tenantForm: TenantFormState;
  setTenantForm: Dispatch<SetStateAction<TenantFormState>>;
  isTenantFormValid: boolean;
  openCreateTenantEditor: () => void;
  openEditTenantEditor: (tenant: Tenant) => void;
  removeTenant: (tenantId: string) => void;
  saveTenant: () => void;
  resetTenantForm: () => void;
};

export function TenantsTab({
  tenants,
  showTenantEditor,
  setShowTenantEditor,
  tenantForm,
  setTenantForm,
  isTenantFormValid,
  openCreateTenantEditor,
  openEditTenantEditor,
  removeTenant,
  saveTenant,
  resetTenantForm,
}: TenantsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black text-slate-900">Tenant management</h2>
        <button
          onClick={openCreateTenantEditor}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add tenant
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
          {tenants.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
              No tenants yet. Create your first tenant to start onboarding users.
            </p>
          ) : (
            tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{tenant.name}</p>
                  <p className="text-xs text-slate-500">
                    {tenant.slug} · {tenant.businessType || 'N/A'} · {tenant.status || 'ACTIVE'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditTenantEditor(tenant)}
                    className="rounded-lg border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeTenant(tenant.id)}
                    className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {showTenantEditor ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">{tenantForm.id ? 'Edit tenant' : 'Create tenant'}</p>
                <button
                  onClick={() => setShowTenantEditor(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  Collapse
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input value={tenantForm.name} onChange={(e) => setTenantForm((p) => ({ ...p, name: e.target.value }))} placeholder="Tenant name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                <input value={tenantForm.slug} onChange={(e) => setTenantForm((p) => ({ ...p, slug: e.target.value }))} placeholder="Tenant slug" disabled={Boolean(tenantForm.id)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100" />
                <input value={tenantForm.businessType} onChange={(e) => setTenantForm((p) => ({ ...p, businessType: e.target.value }))} placeholder="Business type" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                <input value={tenantForm.ownerName} onChange={(e) => setTenantForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                <input value={tenantForm.businessPhone} onChange={(e) => setTenantForm((p) => ({ ...p, businessPhone: e.target.value }))} placeholder="Business phone" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                <input value={tenantForm.businessEmail} onChange={(e) => setTenantForm((p) => ({ ...p, businessEmail: e.target.value }))} placeholder="Business email" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                <input value={tenantForm.gstNumber} onChange={(e) => setTenantForm((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                <select value={tenantForm.status} onChange={(e) => setTenantForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
                <input value={tenantForm.logoUrl} onChange={(e) => setTenantForm((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="Logo URL" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                <input value={tenantForm.businessAddress} onChange={(e) => setTenantForm((p) => ({ ...p, businessAddress: e.target.value }))} placeholder="Business address" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                {!tenantForm.id && (
                  <>
                    <input value={tenantForm.adminUsername} onChange={(e) => setTenantForm((p) => ({ ...p, adminUsername: e.target.value }))} placeholder="Admin username" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                    <input type="password" value={tenantForm.adminPassword} onChange={(e) => setTenantForm((p) => ({ ...p, adminPassword: e.target.value }))} placeholder="Admin password" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                    <input value={tenantForm.adminEmail} onChange={(e) => setTenantForm((p) => ({ ...p, adminEmail: e.target.value }))} placeholder="Admin email (optional)" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                    <input value={tenantForm.adminMobile} onChange={(e) => setTenantForm((p) => ({ ...p, adminMobile: e.target.value }))} placeholder="Admin mobile (optional)" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                  </>
                )}
                <textarea value={tenantForm.smsTemplate} onChange={(e) => setTenantForm((p) => ({ ...p, smsTemplate: e.target.value }))} placeholder="SMS template (variables: {{customerName}}, {{balance}}, {{balanceType}}, {{businessName}}, {{customerPhone}})" className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                <textarea value={tenantForm.whatsappTemplate} onChange={(e) => setTenantForm((p) => ({ ...p, whatsappTemplate: e.target.value }))} placeholder="WhatsApp template (same variables as SMS)" className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveTenant} disabled={!isTenantFormValid} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  <Plus className="h-4 w-4" />
                  {tenantForm.id ? 'Update tenant' : 'Create tenant'}
                </button>
                <button
                  onClick={() => {
                    resetTenantForm();
                    setShowTenantEditor(false);
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600">Select a tenant to edit, or click "Add tenant" to open the editor.</p>
          )}
        </div>
      </div>
    </div>
  );
}
