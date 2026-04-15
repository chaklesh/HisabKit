import { Layers, Trash2, Search, ArrowUpRight, ArrowDownLeft, Calendar, User, FileText, Plus } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';
import type { Customer, LedgerTransaction, TransactionCreateState, TransactionFormState } from '../types/adminTypes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
  transactionAttachment: File | null;
  setTransactionAttachment: Dispatch<SetStateAction<File | null>>;
};

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
  transactionAttachment,
  setTransactionAttachment,
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
          <h2 className="text-2xl font-black text-foreground">Transaction history</h2>
          <p className="text-sm text-muted-foreground">
            {selectedTenantName ? `Real-time ledger entries for ${selectedTenantName}` : 'Select a tenant to view history.'}
          </p>
        </div>
        <Button 
          onClick={resetTransactionEdit}
          className="rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none bg-gradient-to-r from-indigo-600 to-violet-600 font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create transaction
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={transactionSearch}
          onChange={(e) => setTransactionSearch(e.target.value)}
          placeholder="Search by ref, customer name, date, or amount..."
          className="pl-10 rounded-xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left: Scrollable List */}
        <div className="space-y-3 lg:max-h-[70vh] lg:overflow-y-auto pr-2 custom-scrollbar">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-muted-foreground transition-all hover:bg-muted/50">
              <div className="p-4 rounded-full bg-background shadow-sm border border-border">
                <Layers className="h-10 w-10 opacity-40 text-indigo-500" />
              </div>
              <p className="font-bold text-foreground text-center">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((txn) => {
              const isSale = txn.type === 'SALE';
              return (
                <Card
                  key={txn.id}
                  onClick={() => openTransactionEdit(txn)}
                  className={cn(
                    "group transition-all cursor-pointer rounded-2xl border-border overflow-hidden",
                    transactionEdit.id === txn.id
                      ? "border-primary bg-primary/5 shadow-md ring-4 ring-primary/5"
                      : "bg-background hover:border-primary/50 hover:shadow-sm"
                  )}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                        isSale ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      )}>
                        {isSale ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">
                             {customerNameById[txn.customerId] || 'Unknown Customer'}
                          </h4>
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-black tracking-widest px-1.5 py-0 uppercase",
                            isSale ? "border-rose-100 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400" : "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400"
                          )}>
                            {txn.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center text-[11px] text-muted-foreground">
                             <Calendar className="w-3 h-3 mr-1" />
                             {new Date(txn.timestamp).toLocaleDateString('en-IN')}
                          </span>
                          <span className="flex items-center text-[11px] font-black text-foreground">
                             {formatCurrency(Number(txn.totalAmount || 0))}
                          </span>
                          {txn.referenceNo && (
                             <span className="text-[11px] text-muted-foreground font-mono">#{txn.referenceNo}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); removeTransaction(txn.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right: Form Panel */}
        <div className="sticky top-0 h-fit space-y-4">
          <Card className="rounded-3xl border-border bg-background shadow-sm overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="outline" className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5">
                    {isEditing ? 'Editing Order' : 'Capture Transaction'}
                  </Badge>
                  <CardTitle className="text-lg font-black text-foreground">
                    {isEditing ? 'Update transaction' : 'Create new entry'}
                  </CardTitle>
                </div>
                {isEditing && (
                  <Button variant="ghost" size="sm" onClick={resetTransactionEdit} className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg">
                    Cancel
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-0 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Customer *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <select
                    value={form.customerId}
                    onChange={(e) => setForm((p: any) => ({ ...p, customerId: e.target.value }))}
                    className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="">Select a customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value as 'SALE' | 'PAYMENT' }))}
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="SALE">SALE (Debit)</option>
                    <option value="PAYMENT">PAYMENT (Credit)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Date</label>
                  <Input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) => setForm((p: any) => ({ ...p, transactionDate: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                    {form.type === 'SALE' ? 'Total Amount' : 'Amount Paid'} *
                  </label>
                  <Input
                    value={form.type === 'SALE' ? form.totalAmount : form.paidAmount}
                    onChange={(e) => setForm((p: any) => ({ ...p, [form.type === 'SALE' ? 'totalAmount' : 'paidAmount']: e.target.value }))}
                    placeholder="0.00"
                    className="rounded-xl"
                  />
                </div>
                {form.type === 'SALE' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Partial Payment</label>
                    <Input
                      value={form.paidAmount}
                      onChange={(e) => setForm((p: any) => ({ ...p, paidAmount: e.target.value }))}
                      placeholder="0.00"
                      className="rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Reference / Bill #</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    value={form.referenceNo}
                    onChange={(e) => setForm((p: any) => ({ ...p, referenceNo: e.target.value }))}
                    placeholder="Ref ID or Invoice No."
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Proof / Attachment</label>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer relative group">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                     <Plus className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                      {transactionAttachment ? transactionAttachment.name : 'Upload receipt...'}
                    </p>
                    <p className="text-[10px] text-slate-500">JPG, PNG or PDF (Max 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setTransactionAttachment(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Internal Notes</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  placeholder="Context for this entry..."
                  rows={2}
                  className="flex min-h-[60px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-sm focus:ring-primary focus:border-primary resize-none"
                />
              </div>

              <Button 
                onClick={isEditing ? saveTransactionEdit : createTransaction}
                disabled={!form.customerId || !isSaleValid(form)}
                className="w-full h-12 rounded-xl mt-4 bg-primary hover:bg-primary/90 transition-all font-bold"
              >
                {isEditing ? 'Update Entry' : 'Post Transaction'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
