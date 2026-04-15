/**
 * TransactionListView component
 * Displays transactions for selected customer in a table/list
 * ~150 lines
 */

import { Edit2, Trash2, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { formatCurrency, formatDate } from '../../../shared/utils/ledgerUtils';
import type { LedgerTransaction } from '../types/ledgerTypes';
import type { Attachment } from '@/shared/types';

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
          <Card key={txn.id} className="group overflow-hidden transition-all duration-300 hover:shadow-md border-slate-200/60">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-stretch">
                {/* Visual indicator bar */}
                <div className={cn(
                  "w-1 sm:w-1.5 shrink-0",
                  isPayment ? "bg-emerald-500" : "bg-indigo-500"
                )} />
                
                <div className="flex-1 p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "font-bold uppercase tracking-wider text-[10px]",
                          isPayment ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-indigo-200 bg-indigo-50 text-indigo-700"
                        )}>
                          {isPayment ? 'Payment Received' : 'Sale / Credit'}
                        </Badge>
                        <span className="text-[10px] font-medium text-slate-400">
                          {formatDate(txn.timestamp)}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-800 tracking-tight">
                        {isPayment ? 'Received: ' : 'Total: '}
                        {formatCurrency(txn.totalAmount)}
                      </h4>
                      {txn.description && (
                         <p className="text-sm text-slate-500 line-clamp-1">{txn.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => onEdit(txn)}>
                        <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-600" onClick={() => onDelete(txn.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {attachments.map((att) => {
                        const isImage = att.fileType?.startsWith('image/');
                        return (
                          <button
                            key={att.id}
                            onClick={() => onViewAttachment(att)}
                            className="relative group/thumb h-12 w-12 rounded-lg border border-slate-200 overflow-hidden transition-all hover:border-primary hover:ring-2 hover:ring-primary/20 shadow-sm shrink-0"
                          >
                            {isImage ? (
                              <img 
                                src={att.fileUrl} 
                                alt={att.fileName} 
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <FileText className="w-6 h-6" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/10 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
