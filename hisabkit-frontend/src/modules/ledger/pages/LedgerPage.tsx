/**
 * LedgerPage - module orchestrator
 * Composes ledger surfaces and delegates state/actions to useLedgerPageState.
 */

import { X } from 'lucide-react';
import { ConfirmDialog } from '@/shared/components/ui/confirm-dialog';
import { Lightbox } from '@/shared/components/ui/lightbox';
import { LedgerHeader } from '../components/LedgerHeader';
import { CustomerListPane } from '../components/CustomerListPane';
import { CustomerDetailsHeader } from '../components/CustomerDetailsHeader';
import { EmptyStatePanel } from '../components/EmptyStatePanel';
import { TransactionListView } from '../components/TransactionListView';
import { CustomerFormDrawer } from '../components/CustomerFormDrawer';
import { TransactionFormDrawer } from '../components/TransactionFormDrawer';
import { MessageAlert } from '../components/MessageAlert';
import { useLedgerPageState } from '../hooks/useLedgerPageState';

export function LedgerPage() {
  const { state, queries, derived, actions } = useLedgerPageState();

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <div className="space-y-6">
        {/* Header */}
        <LedgerHeader
          showTotals={state.showTotals}
          totals={derived.totals}
          overdueCount={derived.overdueCount}
          customerCount={derived.filteredCustomers.length}
          onToggleTotals={() => state.setShowTotals(!state.showTotals)}
          onAddCustomer={() => actions.openCustomerDrawer(true)}
          onExport={actions.handleExport}
          onImport={actions.handleImport}
        />

        {/* Messages */}
        <MessageAlert message={state.error} type="error" />
        <MessageAlert message={state.notice} type="success" />

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
          {/* Left: Customer list */}
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

          {/* Right: Transactions/Reports */}
          <section className="flex flex-col gap-4">
            {!derived.selectedCustomer ? (
              <EmptyStatePanel />
            ) : (
              <>
                <CustomerDetailsHeader
                  customer={derived.selectedCustomer}
                  onEdit={() => actions.openCustomerDrawer(false)}
                  onAddSale={() => actions.openTransactionDrawer('SALE')}
                  onAddPayment={() => actions.openTransactionDrawer('PAYMENT')}
                  onSendSMS={() => {}}
                  onSendWhatsApp={() => {}}
                  onExportLedger={actions.handleExportLedger}
                  smsLink={derived.smsLink}
                  whatsappLink={derived.whatsappLink}
                />

                <TransactionListView
                  transactions={derived.transactions}
                  attachmentsByTransaction={derived.attachmentsByTransaction}
                  isLoading={queries.transactionsQuery.isLoading}
                  onEdit={actions.handleOpenTransactionEdit}
                  onDelete={(id) => state.setConfirmDeleteTransactionId(id)}
                  onViewAttachment={actions.handleViewAttachment}
                />
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
            initialValues={state.customerForm}
            onClose={state.closeDrawer}
            onSubmit={actions.handleCustomerSubmit}
            onDelete={() => state.setConfirmDeleteCustomer(true)}
          />
        )}

        {state.drawerMode === 'TRANSACTION' && (
          <TransactionFormDrawer
            isOpen={state.isDrawerOpen}
            isSubmitting={state.isSubmittingTransaction}
            isEditing={!!state.editingTransactionId}
            initialValues={state.transactionForm}
            attachmentFile={state.attachmentFile}
            existingAttachment={state.editingTransactionId ? (derived.attachmentsByTransaction[state.editingTransactionId]?.[0] || null) : null}
            onClose={state.closeDrawer}
            onFileChange={state.setAttachmentFile}
            onSubmit={actions.handleTransactionSubmit}
            onDeleteAttachment={async (id) => {
               if (confirm('Delete this attachment?')) {
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
          title="Delete Customer"
          description="Are you sure you want to delete this customer? This action will also delete all associated transactions."
          isLoading={state.isSubmittingCustomer}
        />

        <ConfirmDialog
          open={!!state.confirmDeleteTransactionId}
          onCancel={() => state.setConfirmDeleteTransactionId(null)}
          onConfirm={actions.handleDeleteTransaction}
          title="Delete Transaction"
          description="Are you sure you want to delete this transaction?"
          isLoading={false}
        />

        <Lightbox 
          isOpen={!!state.lightbox && state.lightbox.type === 'image'} 
          onClose={() => state.setLightbox(null)}
          images={state.lightbox ? [{ url: state.lightbox.url, title: state.lightbox.name }] : []}
          currentIndex={0}
          onNavigate={() => {}} 
        />
        
        {/* PDF Fallback remains Dialog for now or simple iframe */}
        {state.lightbox && state.lightbox.type === 'pdf' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => state.setLightbox(null)}>
            <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
               <iframe src={state.lightbox.url} title={state.lightbox.name} className="w-full h-full" />
               <button 
                 onClick={() => state.setLightbox(null)}
                 className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
