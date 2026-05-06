import { useAuth } from "@/shared/context/AuthContext";
import { TFunction } from "i18next";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Card, CardContent } from "@hisabkit/ui/components/Card";
import { ArrowUpDown, Building2, Database, History, LayoutGrid, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CustomersTab } from "../components/CustomersTab";
import { TenantsTab } from "../components/TenantsTab";
import { TransactionsTab } from "../components/TransactionsTab";
import { AuditLogsTab } from "../components/AuditLogsTab";
import { useAdminDashboardState } from "../hooks/useAdminDashboardState";

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    activeTab,
    setActiveTab,
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    selectedTenant,
    customers,
    transactions,
    isLoading,
    error,
    notice,
    showTenantEditor,
    setShowTenantEditor,
    tenantForm,
    setTenantForm,
    isTenantFormValid,
    customerSearch,
    setCustomerSearch,
    transactionSearch,
    setTransactionSearch,
    customerEdit,
    setCustomerEdit,
    customerCreate,
    setCustomerCreate,
    transactionEdit,
    setTransactionEdit,
    transactionCreate,
    setTransactionCreate,
    customerNameById,
    filteredCustomers,
    filteredTransactions,
    saveTenant,
    removeTenant,
    saveCustomerEdit,
    createCustomer,
    removeCustomer,
    saveTransactionEdit,
    createTransaction,
    removeTransaction,
    openCreateTenantEditor,
    openEditTenantEditor,
    resetTenantForm,
    resetCustomerEdit,
    resetCustomerCreate,
    resetTransactionEdit,
    resetTransactionCreate,
    openCustomerEdit,
    openTransactionEdit,
    transactionAttachments,
    setTransactionAttachments,
  } = useAdminDashboardState(user?.role);

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "ROLE_SUPER_ADMIN") {
    return <RestrictedAccess t={t} />;
  }

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Navigation Sidebar */}
        <aside className="space-y-6">
          <div className="glass-card rounded-[2rem] p-6 border-none">
            <div className="flex items-center gap-2 mb-1 px-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                {t("admin.title", "Admin Console")}
              </p>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter px-2 mb-6">
              {t("admin.title", "Admin Console")}
            </h1>

            <div className="space-y-1.5 font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("tenants")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                  activeTab === "tenants"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    activeTab === "tenants" ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800",
                  )}
                >
                  <Building2 className="h-4 w-4" />
                </div>
                {t("admin.tabs.tenants", "Registered Shops")}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("customers")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                  activeTab === "customers"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    activeTab === "customers" ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800",
                  )}
                >
                  <Users className="h-4 w-4" />
                </div>
                {t("admin.tabs.customers", "Customer List")}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                  activeTab === "transactions"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    activeTab === "transactions" ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800",
                  )}
                >
                  <Database className="h-4 w-4" />
                </div>
                {t("admin.tabs.transactions", "All History")}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                  activeTab === "audit"
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-xl shadow-slate-200 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400",
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg",
                    activeTab === "audit" ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800",
                  )}
                >
                  <History className="h-4 w-4" />
                </div>
                {t("admin.tabs.audit", "Forensic Audit")}
              </button>
            </div>
          </div>

          {/* Context Card */}
          <div className="glass-card rounded-[2rem] p-6 border-none bg-indigo-600 text-white overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                {t("admin.active_context", "Active Shop")}
              </p>
              <h3 className="text-lg font-black leading-tight mb-3">
                {selectedTenant
                  ? selectedTenant.name
                  : t("admin.no_shop_selected", "No Shop Selected")}
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {t("admin.access_level", "Main Shop Owner")}
                </span>
              </div>
            </div>
            <LayoutGrid className="absolute -bottom-2 -right-2 w-20 h-20 opacity-10 rotate-12" />
          </div>
        </aside>

        {/* Content Area */}
        <main className="space-y-6">
          <header className="glass-card rounded-[2rem] p-6 border-none flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 w-full lg:w-auto overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                  {t("admin.filter_label", "Filter")}
                </p>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />
                <div className="relative flex-1 lg:min-w-[180px]">
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full text-xs font-black uppercase tracking-widest bg-transparent border-none outline-none focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-200 appearance-none pr-8"
                  >
                    <option value="" className="bg-white dark:bg-slate-950 font-bold">
                      {t("admin.switch_shop", "Switch Shop")}
                    </option>
                    {tenants.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        className="bg-white dark:bg-slate-950 font-bold"
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800">
                {isLoading
                  ? t("common.loading", "Loading...")
                  : t("admin.system_status", "Everything works")}
              </Badge>
            </div>
          </header>

          <Card className="rounded-[2.5rem] bg-white dark:bg-slate-950 border-none shadow-xl shadow-slate-200/50 dark:shadow-none p-2 overflow-hidden">
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 animate-in shake duration-300">
                  {error}
                </div>
              )}
              {notice && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700 animate-in slide-in-from-top-2 duration-300">
                  {notice}
                </div>
              )}

              {isLoading ? (
                <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                  <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                  <p className="text-sm font-bold">
                    {t("admin.loading_shops", "Loading shop details...")}
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {activeTab === "tenants" && (
                    <TenantsTab
                      tenants={tenants}
                      showTenantEditor={showTenantEditor}
                      setShowTenantEditor={setShowTenantEditor}
                      tenantForm={tenantForm}
                      setTenantForm={setTenantForm}
                      isTenantFormValid={isTenantFormValid}
                      openCreateTenantEditor={openCreateTenantEditor}
                      openEditTenantEditor={openEditTenantEditor}
                      removeTenant={removeTenant}
                      saveTenant={saveTenant}
                      resetTenantForm={resetTenantForm}
                    />
                  )}

                  {activeTab === "customers" && (
                    <CustomersTab
                      selectedTenantName={selectedTenant?.name}
                      customers={customers}
                      filteredCustomers={filteredCustomers}
                      customerSearch={customerSearch}
                      setCustomerSearch={setCustomerSearch}
                      customerCreate={customerCreate}
                      setCustomerCreate={setCustomerCreate}
                      customerEdit={customerEdit}
                      setCustomerEdit={setCustomerEdit}
                      createCustomer={createCustomer}
                      removeCustomer={removeCustomer}
                      saveCustomerEdit={saveCustomerEdit}
                      resetCustomerCreate={resetCustomerCreate}
                      resetCustomerEdit={resetCustomerEdit}
                      openCustomerEdit={openCustomerEdit}
                    />
                  )}

                  {activeTab === "transactions" && (
                    <TransactionsTab
                      selectedTenantName={selectedTenant?.name}
                      customers={customers}
                      transactions={transactions}
                      filteredTransactions={filteredTransactions}
                      customerNameById={customerNameById}
                      transactionSearch={transactionSearch}
                      setTransactionSearch={setTransactionSearch}
                      transactionCreate={transactionCreate}
                      setTransactionCreate={setTransactionCreate}
                      transactionEdit={transactionEdit}
                      setTransactionEdit={setTransactionEdit}
                      createTransaction={createTransaction}
                      removeTransaction={removeTransaction}
                      saveTransactionEdit={saveTransactionEdit}
                      resetTransactionCreate={resetTransactionCreate}
                      resetTransactionEdit={resetTransactionEdit}
                      openTransactionEdit={openTransactionEdit}
                      transactionAttachments={transactionAttachments}
                      setTransactionAttachments={setTransactionAttachments}
                    />
                  )}

                  {activeTab === "audit" && (
                    <AuditLogsTab />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};


const RestrictedAccess = ({ t }: { t: TFunction }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
    <div className="p-4 rounded-full bg-rose-50 text-rose-600">
      <ShieldCheck className="w-12 h-12" />
    </div>
    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
      {t("admin.restricted.title", "Access Denied")}
    </h2>
    <p className="text-slate-500 max-w-sm">
      {t(
        "admin.restricted.description",
        "Only the main shop owner can see this page. Speak to them if you need access.",
      )}
    </p>
  </div>
);
