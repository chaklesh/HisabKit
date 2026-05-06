import { AuthenticatedImage } from "@/shared/components/AuthenticatedImage";
import type { Attachment } from "@/shared/types";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import { Card, CardContent } from "@hisabkit/ui/components/Card";
import { Input } from "@hisabkit/ui/components/Input";
import { Edit2, FileText, Maximize2, Search, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "../../../shared/utils/ledgerUtils";
import type { LedgerTransaction } from "../types/ledgerTypes";

import { DateRangePicker } from "./DateRangePicker";

interface TransactionListViewProps {
  transactions: LedgerTransaction[];
  attachmentsByTransaction: Record<string, Attachment[]>;
  isLoading: boolean;
  searchTerm: string;
  startDate: string;
  endDate: string;
  onSearchChange: (term: string) => void;
  onDateRangeChange: (start: string, end: string) => void;
  onEdit: (transaction: LedgerTransaction) => void;
  onDelete: (id: string) => void;
  onViewAttachment: (attachment: Attachment) => void;
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onClick: (att: Attachment) => void;
}

function AttachmentPreview({ attachment, onClick }: AttachmentPreviewProps) {
  const ext = attachment.fileName?.split(".").pop()?.toLowerCase() || "";
  const isImage =
    attachment.fileType?.startsWith("image/") ||
    ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isPdf = attachment.fileType === "application/pdf" || ext === "pdf";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick(attachment);
      }}
      className={cn(
        "group/att relative h-32 w-32 rounded-2xl border overflow-hidden transition-all duration-300 flex items-center justify-center shrink-0 shadow-sm",
        isPdf
          ? "border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-950/20"
          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950",
        "hover:ring-4 hover:ring-indigo-500/10 hover:shadow-lg",
      )}
    >
      {isImage ? (
        <AuthenticatedImage
          url={`/ledger/attachments/${attachment.id}/content`}
          alt={attachment.fileName}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/att:scale-110"
          fallbackIconClassName="w-10 h-10"
        />
      ) : isPdf ? (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="p-3 rounded-xl bg-rose-500 text-white shadow-rose-200 dark:shadow-none shadow-lg group-hover/att:scale-110 transition-transform">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 tracking-tighter">
              PDF Document
            </span>
            <p className="text-[8px] font-bold text-slate-400 truncate w-24 px-1">
              {attachment.fileName}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
            <FileText className="w-8 h-8" />
          </div>
          <p className="text-[8px] font-bold text-slate-400 truncate w-24 px-1">
            {attachment.fileName || ext.toUpperCase()}
          </p>
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover/att:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover/att:opacity-100">
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 shadow-xl">
          <Maximize2 className="w-5 h-5 text-white" />
        </div>
      </div>
    </button>
  );
}

export function TransactionListView({
  transactions,
  attachmentsByTransaction,
  isLoading,
  searchTerm,
  startDate,
  endDate,
  onSearchChange,
  onDateRangeChange,
  onEdit,
  onDelete,
  onViewAttachment,
}: TransactionListViewProps) {
  const filtered = transactions.filter(
    (t) =>
      !searchTerm ||
      (t.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.totalAmount.toString().includes(searchTerm) ||
      t.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Transaction Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-2 reveal">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search in ledger..."
            className="pl-10 h-10 rounded-xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-widest outline-none focus-visible:ring-indigo-500/10 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <DateRangePicker 
          startDate={startDate} 
          endDate={endDate} 
          onChange={onDateRangeChange} 
        />
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center gap-4 text-slate-400">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">
            Syncing Journals
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center space-y-4 reveal">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No transactions recorded
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Adjust filters or the date range to broaden search
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 reveal">
          {filtered.map((txn) => {
            const attachments = attachmentsByTransaction[txn.id] || [];
            const isPayment = txn.type === "PAYMENT";

            return (
              <Card
                key={txn.id}
                className="group overflow-hidden glass-card border-none rounded-3xl transition-all hover:shadow-md duration-300"
              >
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    {/* Visual indicator bar */}
                    <div
                      className={cn(
                        "w-1 h-12 rounded-full shrink-0",
                        isPayment ? "bg-emerald-500" : "bg-rose-500",
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Badge
                            className={cn(
                              "font-bold uppercase tracking-wider text-[8px] px-1.5 py-0 rounded-md border-none shrink-0",
                              isPayment
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-600 dark:bg-rose-600/20 dark:text-rose-400",
                            )}
                          >
                            {isPayment ? "Payment" : "Sale"}
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

                        <div className="flex items-center gap-2 shrink-0 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => onEdit(txn)}
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-rose-50 text-rose-500"
                            onClick={() => onDelete(txn.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4
                            className={cn(
                              "text-lg font-black tracking-tight tabular-nums",
                              isPayment
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-900 dark:text-white",
                            )}
                          >
                            {isPayment ? "+" : "-"}
                            {formatCurrency(txn.totalAmount)}
                          </h4>
                          {!isPayment && txn.paidAmount > 0 && (
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                              <span className="text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Cash: {formatCurrency(txn.paidAmount)}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-rose-600 dark:text-rose-400 uppercase tracking-wider font-black">
                                Due: {formatCurrency(txn.dueAmount || txn.totalAmount - txn.paidAmount)}
                              </span>
                            </div>
                          )}
                          {!isPayment && txn.paidAmount === 0 && (
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              Full Credit (Udhaar)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Attachment Preview Section */}
                  {attachments.length > 0 && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                        {attachments.map((att) => (
                          <AttachmentPreview
                            key={att.id}
                            attachment={att}
                            onClick={onViewAttachment}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
