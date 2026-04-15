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
    return (
      <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
         <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
         <p className="text-xs font-black uppercase tracking-[0.3em] font-sans">Syncing Journals</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 reveal">
         <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-slate-300" />
         </div>
         <p className="text-sm font-bold text-slate-400">No transactions recorded for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 reveal">
      {transactions.map((txn) => {
        const attachments = attachmentsByTransaction[txn.id] || [];
        const isPayment = txn.type === 'PAYMENT';

        return (
          <Card key={txn.id} className="group overflow-hidden glass-card border-none rounded-3xl transition-all hover:shadow-md duration-300">
            <CardContent className="p-0">
              <div className="flex items-center gap-4 p-4">
                {/* Visual indicator bar */}
                <div className={cn(
                  "w-1 h-12 rounded-full shrink-0",
                  isPayment ? "bg-emerald-500" : "bg-rose-500"
                )} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Badge className={cn(
                        "font-bold uppercase tracking-wider text-[8px] px-1.5 py-0 rounded-md border-none shrink-0",
                        isPayment 
                          ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-400" 
                          : "bg-rose-500/10 text-rose-600 dark:bg-rose-600/20 dark:text-rose-400"
                      )}>
                        {isPayment ? 'Payment' : 'Sale'}
                      </Badge>
                      <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                        {formatDate(txn.timestamp)}
                      </span>
                      {txn.description && (
                         <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate opacity-60">
                           • {txn.description}
                         </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onEdit(txn)}>
                        <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500" onClick={() => onDelete(txn.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "text-lg font-black tracking-tight tabular-nums",
                      isPayment ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                    )}>
                      {isPayment ? '+' : '-'}{formatCurrency(txn.totalAmount)}
                    </h4>

                    {attachments.length > 0 && (
                      <div className="flex items-center gap-2">
                        {attachments.map((att) => {
                          const ext = att.fileName?.split('.').pop()?.toLowerCase() || '';
                          const isImage = att.fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
                          return (
                            <button
                              key={att.id}
                              onClick={() => onViewAttachment(att)}
                              className="relative h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden hover:ring-2 hover:ring-indigo-500/20 transition-all"
                            >
                              {isImage ? (
                                <img src={att.fileUrl} alt={att.fileName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-slate-400" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
