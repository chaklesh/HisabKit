/**
 * LedgerPage - REFACTORED
 * Main orchestrator component that composes all ledger module components
 * Keeps business logic in hooks, rendering in components
 * ~190 lines total
 */

import { useEffect } from 'react';
import { useCustomersQuery, useTransactionsQuery } from '../../../features/ledger/useLedger';
import { useLedgerState } from '../hooks/useLedgerState';
import {
  applyDueDateMap,
  filterAndSortCustomers,
  computeTotals,
  countOverdueCustomers,
  buildDueDateReport,
} from '../selectors/ledgerDashboardSelectors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LedgerHeader } from '../components/LedgerHeader';
import { CustomerListPane } from '../components/CustomerListPane';
import { CustomerDetailsHeader } from '../components/CustomerDetailsHeader';
import { EmptyStatePanel } from '../components/EmptyStatePanel';
import { TransactionListView } from '../components/TransactionListView';
import { ReportPanel } from '../components/ReportPanel';
import { CustomerFormDrawer } from '../components/CustomerFormDrawer';
import { TransactionFormDrawer } from '../components/TransactionFormDrawer';
import { MessageAlert } from '../components/MessageAlert';

export function LedgerPage() {
  const state = useLedgerState();
  const customersQuery = useCustomersQuery();
  const transactionsQuery = useTransactionsQuery(state.selectedCustomerId);

  // Sync queries with state
  useEffect(() => {
    if (customersQuery.data) {
      state.setCustomers(customersQuery.data as any);
    }
  }, [customersQuery.data]);

  useEffect(() => {
    if (transactionsQuery.data) {
      const { transactions, attachmentsByTransaction } = transactionsQuery.data as any;
      state.setTransactions(transactions);
      state.setAttachmentsByTransaction(attachmentsByTransaction);
    }
  }, [transactionsQuery.data]);

  // Derive state once
  const customersWithDueDate = applyDueDateMap(state.customers, state.dueDateByCustomer);
  const filteredCustomers = filterAndSortCustomers({
    customers: customersWithDueDate,
    searchTerm: state.searchTerm,
    customerFilter: state.customerFilter,
    customerSort: state.customerSort,
  });
  const totals = computeTotals(customersWithDueDate);
  const overdueCount = countOverdueCustomers(customersWithDueDate);
  const reportData = buildDueDateReport({
    customers: customersWithDueDate,
    reportSearchTerm: state.reportSearchTerm,
    reportDueFilter: state.reportDueFilter,
    reportSortField: state.reportSortField,
  });

  return (
    <div className="rounded-2xl bg-[linear-gradient(180deg,#f5f7fb_0%,#edf2ff_100%)] p-3 sm:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <LedgerHeader
          selectedCustomer={state.selectedCustomer}
          showTotals={state.showTotals}
          totals={totals}
          overdueCount={overdueCount}
          customerCount={filteredCustomers.length}
          onToggleTotals={() => state.setShowTotals(!state.showTotals)}
          onAddCustomer={() => { state.setDrawerMode('CUSTOMER'); state.setIsDrawerOpen(true); }}
          onEditCustomer={() => { state.setDrawerMode('CUSTOMER'); state.setIsDrawerOpen(true); }}
          onAddSale={() => { state.setDrawerMode('TRANSACTION'); state.setIsDrawerOpen(true); }}
          onAddPayment={() => { state.setDrawerMode('TRANSACTION'); state.setIsDrawerOpen(true); }}
        />

        {/* Messages */}
        <MessageAlert message={state.error} type="error" />
        <MessageAlert message={state.notice} type="success" />

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          {/* Left: Customer list */}
          <CustomerListPane
            customers={filteredCustomers}
            selectedCustomerId={state.selectedCustomerId}
            searchTerm={state.searchTerm}
            customerFilter={state.customerFilter}
            customerSort={state.customerSort}
            isLoading={customersQuery.isLoading}
            onSearchChange={state.setSearchTerm}
            onFilterChange={state.setCustomerFilter}
            onSortChange={state.setCustomerSort}
            onSelectCustomer={(customer) => state.setSelectedCustomerId(customer.id)}
            onAddCustomer={() => { state.setDrawerMode('CUSTOMER'); state.setIsDrawerOpen(true); }}
          />

          {/* Right: Transactions/Reports */}
          <section className="flex flex-col gap-4">
            {!state.selectedCustomer ? (
              <EmptyStatePanel />
            ) : (
              <>
                <CustomerDetailsHeader
                  customer={state.selectedCustomer}
                  onEdit={() => { state.setDrawerMode('CUSTOMER'); state.setIsDrawerOpen(true); }}
                  onAddSale={() => { state.setDrawerMode('TRANSACTION'); state.setIsDrawerOpen(true); }}
                  onAddPayment={() => { state.setDrawerMode('TRANSACTION'); state.setIsDrawerOpen(true); }}
                  onSendSMS={() => {}}
                  onSendWhatsApp={() => {}}
                  smsLink={state.selectedCustomer?.phone ? `sms:${state.selectedCustomer.phone}` : ''}
                  whatsappLink={state.selectedCustomer?.phone ? `https://wa.me/${state.selectedCustomer.phone}` : ''}
                />

                <Tabs value={state.rightTab} onValueChange={(tab) => state.setRightTab(tab as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="LEDGER">Ledger</TabsTrigger>
                    <TabsTrigger value="REPORTS">Reports</TabsTrigger>
                  </TabsList>

                  <TabsContent value="LEDGER">
                    <TransactionListView
                      transactions={state.transactions}
                      attachmentsByTransaction={state.attachmentsByTransaction}
                      isLoading={transactionsQuery.isLoading}
                      onEdit={(txn) => {
                        state.setEditingTransactionId(txn.id);
                        state.setDrawerMode('TRANSACTION');
                        state.setIsDrawerOpen(true);
                      }}
                      onDelete={() => {}}
                      onViewAttachment={() => {}}
                    />
                  </TabsContent>

                  <TabsContent value="REPORTS">
                    <ReportPanel
                      report={reportData}
                      searchTerm={state.reportSearchTerm}
                      dueFilter={state.reportDueFilter}
                      sortField={state.reportSortField}
                      isLoading={false}
                      onSearchChange={state.setReportSearchTerm}
                      onFilterChange={state.setReportDueFilter}
                      onSortChange={state.setReportSortField}
                      onExportCsv={() => {}}
                    />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </section>
        </div>

        {/* Drawers */}
        {state.drawerMode === 'CUSTOMER' && (
          <CustomerFormDrawer
            isOpen={state.isDrawerOpen}
            isEditing={state.isEditingCustomer}
            isSubmitting={state.isSubmittingCustomer}
            form={state.customerForm}
            onClose={state.closeDrawer}
            onFormChange={(field, value) => state.setCustomerForm({ ...state.customerForm, [field]: value })}
            onSubmit={(e) => e.preventDefault()}
            onDelete={() => {}}
          />
        )}

        {state.drawerMode === 'TRANSACTION' && (
          <TransactionFormDrawer
            isOpen={state.isDrawerOpen}
            isSubmitting={state.isSubmittingTransaction}
            form={state.transactionForm}
            isEditing={!!state.editingTransactionId}
            onClose={state.closeDrawer}
            onFormChange={(field, value) => state.setTransactionForm({ ...state.transactionForm, [field]: value })}
            onFileChange={state.setAttachmentFile}
            onSubmit={(e) => e.preventDefault()}
            attachmentFile={state.attachmentFile}
          />
        )}
      </div>
    </div>
  );
}
