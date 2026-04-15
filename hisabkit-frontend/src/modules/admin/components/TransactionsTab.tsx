import { Layers, Trash2, Search, ArrowUpRight, ArrowDownLeft, Calendar, User, FileText, Plus } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';
import type { Customer, LedgerTransaction, TransactionCreateState, TransactionFormState } from '../types/adminTypes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

type TransactionsTabProps = {
  selectedTenantName?: string;
  customers: Customer[];
  transactions: LedgerTransaction[];
  filteredTransactions: LedgerTransaction[];
  customerNameById: Record<string, string>;
  transactionSearch: string;
  setTransactionSearch: Dispatch<SetStateAction<string>>;
  transactionCreate: TransactionCreateState;
  setTransactionCreate: Dispatch<SetStateAction<TransactionCreateState>>;
  transactionEdit: TransactionFormState;
  setTransactionEdit: Dispatch<SetStateAction<TransactionFormState>>;
  createTransaction: () => void;
  removeTransaction: (transactionId: string) => void;
  saveTransactionEdit: () => void;
  resetTransactionCreate: () => void;
  resetTransactionEdit: () => void;
  openTransactionEdit: (txn: LedgerTransaction) => void;
};

const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900 dark:border-slate-800';

const isSaleValid = (t: TransactionCreateState | TransactionFormState) =>
  t.type === 'SALE' ? Boolean(t.totalAmount) : Boolean(t.paidAmount);

export function TransactionsTab({
  selectedTenantName,
  customers,
  filteredTransactions,
  customerNameById,
  transactionSearch,
  setTransactionSearch,
  transactionCreate,
  setTransactionCreate,
  transactionEdit,
  setTransactionEdit,
  createTransaction,
  removeTransaction,
  saveTransactionEdit,
  resetTransactionEdit,
  openTransactionEdit,
}: TransactionsTabProps) {
  const isEditing = Boolean(transactionEdit.id);
  const form = isEditing ? transactionEdit : transactionCreate;
  const setForm = isEditing
    ? (updater: (p: TransactionFormState) => TransactionFormState) => setTransactionEdit(updater as any)
    : (updater: (p: TransactionCreateState) => TransactionCreateState) => setTransactionCreate(updater as any);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Transaction history</h2>
          <p className="text-sm text-slate-500">
            {selectedTenantName ? `Real-time ledger entries for ${selectedTenantName}` : 'Select a tenant to view history.'}
          </p>
        </div>
        <Button 
          onClick={resetTransactionEdit}
          className="rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create transaction
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={transactionSearch}
          onChange={(e) => setTransactionSearch(e.target.value)}
          placeholder="Search by ref, customer name, date, or amount..."
          className={cn(inputCls, "pl-10")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Scrollable List */}
        <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto pr-2 custom-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-slate-400 transition-all hover:bg-slate-50">
              <div className="p-4 rounded-full bg-white shadow-sm">
                <Layers className="h-10 w-10 opacity-40 text-indigo-500" />
              </div>
              <p className="font-bold text-slate-600 text-center">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const isSale = txn.type === 'SALE';
              return (
                <div
                  key={txn.id}
                  onClick={() => openTransactionEdit(txn)}
                  className={cn(
                    "group flex items-center justify-between rounded-2xl border p-4 transition-all cursor-pointer",
                    transactionEdit.id === txn.id
                      ? "border-indigo-500 bg-indigo-50/30 shadow-md ring-4 ring-indigo-50"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isSale ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {isSale ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                           {customerNameById[txn.customerId] || 'Unknown Customer'}
                        </h4>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black tracking-widest px-1.5 py-0 uppercase",
                          isSale ? "border-rose-100 bg-rose-50 text-rose-600" : "border-emerald-100 bg-emerald-50 text-emerald-600"
                        )}>
                          {txn.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center text-[11px] text-slate-400">
                           <Calendar className="w-3 h-3 mr-1" />
                           {new Date(txn.timestamp).toLocaleDateString('en-IN')}
                        </span>
                        <span className="flex items-center text-[11px] font-black text-slate-900">
                           {formatCurrency(Number(txn.totalAmount || 0))}
                        </span>
                        {txn.referenceNo && (
                           <span className="text-[11px] text-slate-400 font-mono">#{txn.referenceNo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl hover:bg-rose-50 hover:text-rose-600"
                      onClick={(e) => { e.stopPropagation(); removeTransaction(txn.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Form Panel */}
        <div className="sticky top-0 h-fit space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Badge variant="outline" className="mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-600 border-indigo-100 bg-indigo-50">
                  {isEditing ? 'Editing Order' : 'Capture Transaction'}
                </Badge>
                <h3 className="text-lg font-black text-slate-900">
                  {isEditing ? 'Update transaction' : 'Create new entry'}
                </h3>
              </div>
              {isEditing && (
                <Button variant="ghost" size="sm" onClick={resetTransactionEdit} className="text-xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                  Cancel
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Customer *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={form.customerId}
                    onChange={(e) => setForm((p: any) => ({ ...p, customerId: e.target.value }))}
                    className={cn(inputCls, "pl-10 appearance-none")}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value as 'SALE' | 'PAYMENT' }))}
                    className={inputCls}
                  >
                    <option value="SALE">SALE (Debit)</option>
                    <option value="PAYMENT">PAYMENT (Credit)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Date</label>
                  <input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) => setForm((p: any) => ({ ...p, transactionDate: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    {form.type === 'SALE' ? 'Total Amount' : 'Amount Paid'} *
                  </label>
                  <input
                    value={form.type === 'SALE' ? form.totalAmount : form.paidAmount}
                    onChange={(e) => setForm((p: any) => ({ ...p, [form.type === 'SALE' ? 'totalAmount' : 'paidAmount']: e.target.value }))}
                    placeholder="0.00"
                    className={inputCls}
                  />
                </div>
                {form.type === 'SALE' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Partial Payment</label>
                    <input
                      value={form.paidAmount}
                      onChange={(e) => setForm((p: any) => ({ ...p, paidAmount: e.target.value }))}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Reference / Bill #</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    value={form.referenceNo}
                    onChange={(e) => setForm((p: any) => ({ ...p, referenceNo: e.target.value }))}
                    placeholder="Ref ID or Invoice No."
                    className={cn(inputCls, "pl-10")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Notes</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  placeholder="Additional context or item breakdown..."
                  rows={2}
                  className={cn(inputCls, "resize-none py-2")}
                />
              </div>

              <Button 
                onClick={isEditing ? saveTransactionEdit : createTransaction}
                disabled={!form.customerId || !isSaleValid(form)}
                className="w-full h-12 rounded-xl mt-4 bg-slate-900 hover:bg-slate-800 transition-all font-bold"
              >
                {isEditing ? 'Update Entry' : 'Post Transaction'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
