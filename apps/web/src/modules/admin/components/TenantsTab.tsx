import type { Tenant } from "@/shared/types";
import { cn } from "@hisabkit/lib/utils";
import { Button } from "@hisabkit/ui/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@hisabkit/ui/components/Card";
import { Input } from "@hisabkit/ui/components/Input";
import { Plus, Trash2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { TenantFormState } from "../types/adminTypes";

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
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black text-foreground">{t("admin.tenants.title")}</h2>
        <Button onClick={openCreateTenantEditor} className="rounded-xl font-bold">
          <Plus className="h-4 w-4 mr-2" />
          {t("admin.tenants.add_tenant")}
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
          {tenants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-12 text-center text-sm text-slate-400">
              <Plus className="w-8 h-8 mx-auto mb-2 opacity-20" />
              {t("admin.tenants.no_tenants")}
            </div>
          ) : (
            tenants.map((tenant: Tenant) => {
              const isSelected = tenantForm.id === tenant.id;
              const initials = tenant.name.substring(0, 2).toUpperCase();

              return (
                <Card
                  key={tenant.id}
                  className={cn(
                    "rounded-2xl border-none transition-all duration-300 cursor-pointer overflow-hidden group",
                    isSelected
                      ? "ring-2 ring-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-100 dark:shadow-none"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/50 bg-white dark:bg-slate-950 shadow-sm",
                  )}
                  onClick={() => openEditTenantEditor(tenant)}
                >
                  <CardContent className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black transition-colors shrink-0",
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600",
                        )}
                      >
                        {tenant.logoUrl ? (
                          <img
                            src={tenant.logoUrl}
                            alt=""
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p
                            className={cn(
                              "text-sm font-black truncate",
                              isSelected
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            {tenant.name}
                          </p>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {tenant.slug} • {tenant.businessType || "General"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTenant(tenant.id);
                        }}
                        className="h-9 w-9 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        <Card className="rounded-[2rem] border-none bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-inner-sm overflow-hidden">
          <CardHeader className="p-6 pb-2">
            {showTenantEditor ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                    {tenantForm.id
                      ? t("admin.tenants.edit_tenant", "Edit Tenant")
                      : t("admin.tenants.add_tenant", "Create Tenant")}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTenantEditor(false)}
                  className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600"
                >
                  Collapse
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {showTenantEditor ? (
              <>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="shop-name"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Shop Name
                    </label>
                    <Input
                      id="shop-name"
                      value={tenantForm.name}
                      onChange={(e) => setTenantForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Acme Enterprise"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="shop-id"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Shop ID / URL
                    </label>
                    <Input
                      id="shop-id"
                      value={tenantForm.slug}
                      onChange={(e) => setTenantForm((p) => ({ ...p, slug: e.target.value }))}
                      placeholder="acme-corp"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="business-type"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Business Type
                    </label>
                    <Input
                      id="business-type"
                      value={tenantForm.businessType}
                      onChange={(e) =>
                        setTenantForm((p) => ({ ...p, businessType: e.target.value }))
                      }
                      placeholder="Retail, Tech, etc."
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="tenant-status"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Current Status
                    </label>
                    <select
                      id="tenant-status"
                      value={tenantForm.status}
                      onChange={(e) => setTenantForm((p) => ({ ...p, status: e.target.value }))}
                      className="flex h-11 w-full rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer"
                    >
                      <option value="ACTIVE" className="bg-white dark:bg-slate-950 font-bold">
                        ACTIVE
                      </option>
                      <option value="INACTIVE" className="bg-white dark:bg-slate-950 font-bold">
                        INACTIVE
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="owner-name"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Owner Name
                    </label>
                    <Input
                      id="owner-name"
                      value={tenantForm.ownerName}
                      onChange={(e) => setTenantForm((p) => ({ ...p, ownerName: e.target.value }))}
                      placeholder="John Doe"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="tax-id"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Tax ID / GST
                    </label>
                    <Input
                      id="tax-id"
                      value={tenantForm.gstNumber}
                      onChange={(e) => setTenantForm((p) => ({ ...p, gstNumber: e.target.value }))}
                      placeholder="TAX-ID-123"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 uppercase"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label
                      htmlFor="office-address"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Office Address
                    </label>
                    <textarea
                      id="office-address"
                      value={tenantForm.businessAddress}
                      onChange={(e) =>
                        setTenantForm((p) => ({ ...p, businessAddress: e.target.value }))
                      }
                      placeholder="Location details..."
                      className="min-h-20 flex w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="quota-mb"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Max Storage (MB)
                    </label>
                    <Input
                      id="quota-mb"
                      type="number"
                      value={tenantForm.attachmentQuotaMb}
                      onChange={(e) =>
                        setTenantForm((p) => ({ ...p, attachmentQuotaMb: Number(e.target.value) }))
                      }
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="max-file-mb"
                      className="text-[10px] font-bold uppercase text-slate-400 ml-1"
                    >
                      Max File Size (MB)
                    </label>
                    <Input
                      id="max-file-mb"
                      type="number"
                      value={tenantForm.maxAttachmentFileSizeMb}
                      onChange={(e) =>
                        setTenantForm((p) => ({
                          ...p,
                          maxAttachmentFileSizeMb: Number(e.target.value),
                        }))
                      }
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Admin Username
                    </label>
                    <Input
                      value={tenantForm.adminUsername}
                      onChange={(e) =>
                        setTenantForm((p) => ({ ...p, adminUsername: e.target.value }))
                      }
                      placeholder="admin"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Admin Password
                    </label>
                    <Input
                      type="password"
                      value={tenantForm.adminPassword}
                      onChange={(e) =>
                        setTenantForm((p) => ({ ...p, adminPassword: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                      Logo URL
                    </label>
                    <Input
                      value={tenantForm.logoUrl}
                      onChange={(e) => setTenantForm((p) => ({ ...p, logoUrl: e.target.value }))}
                      placeholder="https://..."
                      className="h-11 rounded-xl bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                  <Button
                    onClick={saveTenant}
                    disabled={!isTenantFormValid}
                    className="rounded-xl font-black uppercase tracking-widest text-[11px] bg-indigo-600 hover:bg-indigo-700 h-12 px-8 shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]"
                  >
                    {tenantForm.id ? "Update" : "Create"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetTenantForm();
                      setShowTenantEditor(false);
                    }}
                    className="rounded-xl font-bold text-xs h-12 px-6 border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                  <Plus className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-sm font-bold text-slate-400 max-w-[200px]">
                  Select a shop to edit or add a new one.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
