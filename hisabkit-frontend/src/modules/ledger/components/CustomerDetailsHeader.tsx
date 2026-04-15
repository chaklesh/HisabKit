import { Edit, Plus, MessageCircleMore, MessageSquareText, MapPin, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { Customer } from '../types/ledgerTypes';

interface CustomerDetailsHeaderProps {
  customer: Customer | null;
  onEdit: () => void;
  onAddSale: () => void;
  onAddPayment: () => void;
  onSendSMS: () => void;
  onSendWhatsApp: () => void;
  onExportLedger: () => void;
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
  onExportLedger,
  smsLink,
  whatsappLink,
}: CustomerDetailsHeaderProps) {
  if (!customer) return null;

  return (
    <div className="rounded-2xl glass-card p-4 reveal slide-in-right">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg font-bold text-white shadow-sm">
            {customer.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{customer.name}</h2>
            <div className="flex items-center gap-4 mt-0.5 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 opacity-80">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{customer.address || 'No address'}</span>
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
              onClick={onExportLedger}
              className="rounded-lg w-8 h-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              title="Export Ledger (CSV)"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
