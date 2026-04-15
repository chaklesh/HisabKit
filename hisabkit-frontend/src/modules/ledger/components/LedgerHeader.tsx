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
  onExport: () => void;
  onImport: () => void;
}

export function LedgerHeader({
  showTotals,
  totals,
  overdueCount,
  customerCount,
  onToggleTotals,
  onAddCustomer,
  onExport,
  onImport,
}: LedgerHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-0 z-30 mb-4 glass-card rounded-2xl p-3 px-5 reveal">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
              Ledger <span className="text-indigo-600 dark:text-indigo-400">Directory</span>
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              {customerCount} Accounts • {overdueCount} Overdue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 rounded-xl border-none hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-[11px] uppercase tracking-wider text-slate-500"
            onClick={onToggleTotals}
          >
            <PieChart className="w-4 h-4 mr-1.5 text-indigo-500" />
            {showTotals ? 'Hide Stats' : 'Stats'}
          </Button>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          <div className="hidden sm:flex items-center gap-1">
             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:text-indigo-600" onClick={onImport} title="Import CSV">
               <Upload className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-500 hover:text-indigo-600" onClick={onExport} title="Export CSV">
               <Download className="w-4 h-4" />
             </Button>
          </div>

          <Button 
            size="sm"
            className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-[11px] uppercase tracking-wider shadow-md shadow-indigo-200 dark:shadow-none"
            onClick={onAddCustomer}
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>

      {showTotals && (
        <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-2">
              {t('ledger.totals.you_collect')}
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totals.toCollect)}
            </p>
          </div>
          <div className="rounded-2xl bg-rose-500/5 border border-rose-500/10 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400 mb-2">
              {t('ledger.totals.you_pay')}
            </p>
            <p className="text-2xl font-black text-rose-700 dark:text-rose-300">
              {formatCurrency(totals.toPay)}
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-500/5 border border-indigo-500/10 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">
              {t('ledger.totals.visible_customers')}
            </p>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
              {customerCount}
            </p>
          </div>
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 mb-2">
              {t('ledger.totals.overdue')}
            </p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {overdueCount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

