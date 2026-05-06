/**
 * LedgerPage - module orchestrator
 * Composes ledger surfaces and delegates state/actions to useLedgerPageState.
 */

import { AttachmentLightbox } from "@/shared/components/AttachmentLightbox";
import { ConfirmDialog } from "@hisabkit/ui/components/ConfirmDialog";
import { useTranslation } from "react-i18next";
import { CustomerDetailsHeader } from "../components/CustomerDetailsHeader";
import { CustomerFormDrawer } from "../components/CustomerFormDrawer";
import { CustomerListPane } from "../components/CustomerListPane";
import { EmptyStatePanel } from "../components/EmptyStatePanel";
import { LedgerHeader } from "../components/LedgerHeader";
import { DataManagementDialog } from "../components/DataManagementDialog";
import { MessageAlert } from "../components/MessageAlert";
import { TransactionFormDrawer } from "../components/TransactionFormDrawer";
import { TransactionListView } from "../components/TransactionListView";
import { useLedgerPageState } from "../hooks/useLedgerPageState";
import { cn } from "@hisabkit/lib/utils";
import { Button } from "@hisabkit/ui/components/Button";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";

export function LedgerPage() {
  const { t } = useTranslation();
  const { state, queries, derived, actions } = useLedgerPageState();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <LedgerHeader
          showTotals={state.showTotals}
          totals={derived.totals}
          overdueCount={derived.overdueCount}
          customerCount={derived.filteredCustomers.length}
          onToggleTotals={() => state.setShowTotals(!state.showTotals)}
          onAddCustomer={() => actions.openCustomerDrawer(true)}
          onExport={() => state.setIsDataManagementOpen(true)}
          onImport={() => state.setIsDataManagementOpen(true)}
        />

        <DataManagementDialog
          isOpen={state.isDataManagementOpen}
          onClose={() => state.setIsDataManagementOpen(false)}
          onImport={actions.handleDataImport}
          onExportAll={actions.handleExportAllData}
        />

        {/* Messages */}
        <MessageAlert message={state.error} type="error" />
        <MessageAlert message={state.notice} type="success" />

        {/* Main layout */}
        <div className="grid gap-4 xl:grid-cols-[360px_1fr] items-start">
          {/* Left: Customer list */}
          <div className={cn("xl:sticky xl:top-[80px]", state.selectedCustomerId ? "hidden xl:block" : "block")}>
            <CustomerListPane
              customers={derived.filteredCustomers}
              selectedCustomerId={state.selectedCustomerId}
              searchTerm={state.searchTerm}
              customerFilter={state.customerFilter}
              customerSort={state.customerSort}
              isLoading={queries.customersQuery.isLoading}
              onSearchChange={state.setSearchTerm}
              onFilterChange={state.setCustomerFilter}
              onSortChange={state.setCustomerSort}
              onSelectCustomer={actions.selectCustomer}
            />
          </div>

          {/* Right: Transactions/Reports */}
          <section className={cn("flex flex-col gap-4", state.selectedCustomerId ? "block" : "hidden xl:block")}>
            {!derived.selectedCustomer ? (
              <EmptyStatePanel />
            ) : (
              <>
                <CustomerDetailsHeader
                  customer={derived.selectedCustomer}
                  onEdit={() => actions.openCustomerDrawer(false)}
                  onAddSale={() => actions.openTransactionDrawer("SALE")}
                  onAddPayment={() => actions.openTransactionDrawer("PAYMENT")}
                  onSendSMS={() => {}}
                  onSendWhatsApp={() => {}}
                  onExportLedger={actions.handleExportLedger}
                  onExportLedgerPdf={actions.handleExportLedgerPdf}
                  onBack={actions.handleBackToList}
                  smsLink={derived.smsLink}
                  whatsappLink={derived.whatsappLink}
                />

                <TransactionListView
                  transactions={derived.transactions}
                  attachmentsByTransaction={derived.attachmentsByTransaction}
                  isLoading={queries.transactionsQuery.isLoading}
                  searchTerm={state.txnSearchTerm}
                  startDate={state.txnStartDate}
                  endDate={state.txnEndDate}
                  onSearchChange={state.setTxnSearchTerm}
                  onDateRangeChange={(start, end) => {
                    state.setTxnStartDate(start);
                    state.setTxnEndDate(end);
                  }}
                  onEdit={actions.handleOpenTransactionEdit}
                  onDelete={(id) => state.setConfirmDeleteTransactionId(id)}
                  onViewAttachment={actions.handleViewAttachment}
                />
              </>
            )}
          </section>
        </div>

        {/* Drawers */}
        {state.drawerMode === "CUSTOMER" && (
          <CustomerFormDrawer
            isOpen={state.isDrawerOpen}
            isEditing={state.isEditingCustomer}
            isSubmitting={state.isSubmittingCustomer}
            initialValues={state.customerForm}
            onClose={state.closeDrawer}
            onSubmit={actions.handleCustomerSubmit}
            onDelete={() => state.setConfirmDeleteCustomer(true)}
          />
        )}

        {state.drawerMode === "TRANSACTION" && (
          <TransactionFormDrawer
            isOpen={state.isDrawerOpen}
            isSubmitting={state.isSubmittingTransaction}
            isEditing={!!state.editingTransactionId}
            initialValues={state.transactionForm}
            attachmentFiles={state.attachmentFiles}
            existingAttachments={
              state.editingTransactionId
                ? derived.attachmentsByTransaction[state.editingTransactionId] || []
                : []
            }
            onClose={state.closeDrawer}
            onFileChange={(file) => {
              if (file) {
                state.setAttachmentFiles((prev) => [...prev, file]);
              }
            }}
            onRemoveNewFile={(index) => {
              state.setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
            }}
            onSubmit={actions.handleTransactionSubmit}
            onDelete={() => state.setConfirmDeleteTransactionId(state.editingTransactionId)}
            onDeleteAttachment={async (id) => {
              if (
                confirm(t("ledger.messages.confirm_delete_attachment", "Delete this attachment?"))
              ) {
                await actions.handleDeleteAttachment(id);
              }
            }}
          />
        )}

        {/* Confirm Dialogs */}
        <ConfirmDialog
          open={state.confirmDeleteCustomer}
          onCancel={() => state.setConfirmDeleteCustomer(false)}
          onConfirm={actions.handleDeleteCustomer}
          title={t("ledger.dialog.delete_customer_title", "Delete Customer")}
          description={t(
            "ledger.dialog.delete_customer_desc",
            "Are you sure you want to delete this customer? This action will also delete all associated transactions.",
          )}
          isLoading={state.isSubmittingCustomer}
        />

        <ConfirmDialog
          open={!!state.confirmDeleteTransactionId}
          onCancel={() => state.setConfirmDeleteTransactionId(null)}
          onConfirm={actions.handleDeleteTransaction}
          title={t("ledger.dialog.delete_transaction_title", "Delete Transaction")}
          description={t(
            "ledger.dialog.delete_transaction_desc",
            "Are you sure you want to delete this transaction?",
          )}
          isLoading={false}
        />

        <AttachmentLightbox
          isOpen={!!state.lightbox}
          onClose={() => state.setLightbox(null)}
          attachment={state.lightbox}
        />

        {/* Floating Action Buttons - Compact & Properly Aligned */}
        {derived.selectedCustomer && (
          <div className="fixed bottom-6 z-40 flex items-center gap-2.5 reveal
            right-6 left-6 max-w-[calc(100%-3rem)]
            xl:left-auto xl:right-[calc(max(1.5rem,50%-800px+1.5rem))] xl:max-w-sm">
            <Button
              onClick={() => actions.openTransactionDrawer("SALE")}
              className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-rose-500/20 border-none transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                <span>You Gave</span>
              </div>
            </Button>
            
            <Button
              onClick={() => actions.openTransactionDrawer("PAYMENT")}
              className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/20 border-none transition-all active:scale-95"
            >
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                <span>You Got</span>
              </div>
            </Button>

            <Button
              size="icon"
              onClick={() => actions.openCustomerDrawer(true)}
              className="h-12 w-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl border-none shrink-0 xl:hidden"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
