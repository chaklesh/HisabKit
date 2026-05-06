import { cn } from "@hisabkit/lib/utils";
import { Button } from "@hisabkit/ui/components/Button";
import { ArrowLeft, Download, Edit, FileText, MapPin, MessageCircleMore, MessageSquareText, Plus } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/ledgerUtils";
import type { Customer } from "../types/ledgerTypes";

interface CustomerDetailsHeaderProps {
  customer: Customer | null;
  onEdit: () => void;
  onAddSale: () => void;
  onAddPayment: () => void;
  onSendSMS: () => void;
  onSendWhatsApp: () => void;
  onExportLedger: () => void;
  onExportLedgerPdf: () => void;
  onBack: () => void;
  smsLink: string;
  whatsappLink: string;
}

export function CustomerDetailsHeader({
  customer,
  onEdit,
  onAddSale,
  onAddPayment,
  onSendSMS,
  onSendWhatsApp,
  onExportLedgerPdf,
  onBack,
  smsLink,
  whatsappLink,
}: CustomerDetailsHeaderProps) {
  if (!customer) return null;

  return (
    <div className="rounded-2xl glass-card p-4 reveal slide-in-right">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="xl:hidden h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shadow-sm">
            {customer.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {customer.name}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 opacity-80">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {customer.address || "No address"}
                </span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance:</span>
                <span className={cn(
                  "text-xs font-black tracking-tight",
                  (customer.totalBalance || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {formatCurrency(Math.abs(customer.totalBalance || 0))}
                  {(customer.totalBalance || 0) >= 0 ? " (To Collect)" : " (To Pay)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="h-8 rounded-lg border-slate-200 dark:border-slate-800 font-bold px-3 text-[11px] uppercase tracking-wider"
          >
            <Edit className="mr-1 h-3 w-3" />
            Profile
          </Button>

          <Button
            size="sm"
            onClick={onAddSale}
            className="h-8 rounded-lg bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-bold px-4 text-[11px] uppercase tracking-wider shadow-none"
          >
            <Plus className="mr-1 h-3 w-3" />
            Sale
          </Button>

          <Button
            size="sm"
            onClick={onAddPayment}
            className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold px-4 text-[11px] uppercase tracking-wider shadow-none"
          >
            <Plus className="mr-1 h-3 w-3" />
            Payment
          </Button>

          <div className="flex items-center gap-1.5 ml-1 pl-3 border-l border-slate-200 dark:border-slate-800">
            {smsLink && (
              <Button
                variant="outline"
                size="icon"
                onClick={onSendSMS}
                asChild
                className="rounded-lg w-8 h-8 border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100 sm:flex hidden"
              >
                <a href={smsLink} target="_blank" rel="noopener noreferrer">
                  <MessageSquareText className="h-4 w-4" />
                </a>
              </Button>
            )}

            {whatsappLink && (
              <Button
                variant="outline"
                size="icon"
                onClick={onSendWhatsApp}
                asChild
                className="rounded-lg w-8 h-8 border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircleMore className="h-4 w-4" />
                </a>
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              title="Export Ledger (CSV)"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={onExportLedgerPdf}
              className="rounded-lg w-8 h-8 border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
              title="Download PDF Report"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
