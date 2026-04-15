/**
 * LedgerHeader component
 * Displays title, action buttons, and optional totals summary.
 * Intentionally minimal: Sale/Payment/Edit are in CustomerDetailsHeader.
 */

import { useTranslation } from 'react-i18next';
import { UserPlus, Download, Upload, PieChart, Wallet } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';

interface LedgerHeaderProps {
  showTotals: boolean;
  totals: { toCollect: number; toPay: number };
  overdueCount: number;
  customerCount: number;
  onToggleTotals: () => void;
  onAddCustomer: () => void;
}

export function LedgerHeader({
  showTotals,
  totals,
  overdueCount,
  customerCount,
  onToggleTotals,
  onAddCustomer,
}: LedgerHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-30 mb-6 glass-card rounded-2xl p-6 transition-all duration-300">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
               <Wallet className="w-4 h-4" />
             </div>
             <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500/80">
               {t('ledger.header.title', 'Workspace Account Book')}
             </p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard overview
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-slate-200 hover:bg-slate-50 transition-all"
            onClick={onToggleTotals}
          >
            <PieChart className="w-4 h-4 mr-2 text-indigo-500" />
            {showTotals ? t('ledger.header.hide_totals') : t('ledger.header.show_totals')}
          </Button>
          
          <div className="flex h-9 items-center rounded-xl border border-slate-200 bg-white/50 px-1 overflow-hidden transition-all hover:bg-white">
             <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-slate-600 hover:text-indigo-600" onClick={() => alert('Import features coming soon!')}>
               <Upload className="w-3.5 h-3.5 mr-1.5" />
               {t('ledger.header.import', 'Import')}
             </Button>
             <div className="w-px h-4 bg-slate-200 mx-1" />
             <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-slate-600 hover:text-indigo-600" onClick={() => alert('Export features coming soon!')}>
               <Download className="w-3.5 h-3.5 mr-1.5" />
               {t('ledger.header.export', 'Export')}
             </Button>
          </div>

          <Button 
            variant="default" 
            className="rounded-xl px-5 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={onAddCustomer}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t('ledger.header.add_customer', 'Add Customer')}
          </Button>
        </div>
      </div>

      {/* Totals section (conditional) */}
      {showTotals && (
        <div className="mt-2 grid gap-1.5 sm:grid-cols-4">
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {t('ledger.totals.you_collect')}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-emerald-800">{formatCurrency(totals.toCollect)}</p>
          </div>
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-700">
              {t('ledger.totals.you_pay')}
            </p>
            <p className="mt-0.5 text-sm font-extrabold text-rose-800">{formatCurrency(totals.toPay)}</p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('ledger.totals.visible_customers')}
            </p>
            <p className="mt-1 text-lg font-black text-foreground">{customerCount}</p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              {t('ledger.totals.overdue')}
            </p>
            <p className="mt-1 text-lg font-black text-amber-900">{overdueCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}
