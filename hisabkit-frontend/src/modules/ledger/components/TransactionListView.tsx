/**
 * TransactionListView component
 * Displays transactions for selected customer in a table/list
 * ~150 lines
 */

import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '../../../shared/utils/ledgerUtils';
import type { LedgerTransaction } from '../types/ledgerTypes';
import type { Attachment } from '../../../shared/types/domain';

interface TransactionListViewProps {
  transactions: LedgerTransaction[];
  attachmentsByTransaction: Record<string, Attachment[]>;
  isLoading: boolean;
  onEdit: (transaction: LedgerTransaction) => void;
  onDelete: (id: string) => void;
  onViewAttachment: (attachment: Attachment) => void;
}

export function TransactionListView({
  transactions,
  attachmentsByTransaction,
  isLoading,
  onEdit,
  onDelete,
  onViewAttachment,
}: TransactionListViewProps) {
  if (isLoading) {
    return <div className="text-center text-sm text-slate-500">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-center text-sm text-slate-500">No transactions yet.</div>;
  }

  return (
    <div className="space-y-2 overflow-x-auto">
      {transactions.map((txn) => {
        const attachments = attachmentsByTransaction[txn.id] || [];
        const isPayment = txn.type === 'PAYMENT';

        return (
          <div key={txn.id} className="rounded-xl border border-slate-200 bg-white p-3 text-sm hover:bg-slate-50">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${isPayment ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {isPayment ? 'Payment' : 'Sale'}
                  </span>
                  <span className="font-medium text-slate-900">{formatCurrency(txn.totalAmount)}</span>
                  {txn.paidAmount !== txn.totalAmount && (
                    <span className="text-xs text-slate-500">
                      Paid: {formatCurrency(txn.paidAmount)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(txn.timestamp)} — {txn.description || 'No description'}
                </p>
                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {attachments.map((att) => (
                      <button
                        key={att.id}
                        onClick={() => onViewAttachment(att)}
                        className="text-xs underline text-blue-600 hover:text-blue-800"
                      >
                        📎 {att.fileName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(txn)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(txn.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
