/**
 * LedgerHeader component
 * Displays title, action buttons, and optional totals summary
 */

import { useTranslation } from 'react-i18next';
import { Plus, UserPlus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';
import type { Customer } from '../types/ledgerTypes';

interface LedgerHeaderProps {
  selectedCustomer: Customer | null;
  showTotals: boolean;
  totals: { toCollect: number; toPay: number };
  overdueCount: number;
  customerCount: number;
  onToggleTotals: () => void;
  onAddCustomer: () => void;
  onEditCustomer: () => void;
  onAddSale: () => void;
  onAddPayment: () => void;
}

export function LedgerHeader({
  selectedCustomer,
  showTotals,
  totals,
  overdueCount,
  customerCount,
  onToggleTotals,
  onAddCustomer,
  onEditCustomer,
  onAddSale,
  onAddPayment,
}: LedgerHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="sticky top-2 z-20 mb-4 rounded-lg border border-border bg-background/95 p-4 shadow-sm backdrop-blur">
      {/* Title section */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t('ledger.header.title', 'HisabKit Ledger')}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-foreground">
            {t('ledger.title', 'Customer-wise account book')}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToggleTotals}>
            {showTotals ? t('ledger.header.hide_totals') : t('ledger.header.show_totals')}
          </Button>
          <Button variant="outline" size="sm" onClick={onAddCustomer}>
            <UserPlus className="mr-1 h-3.5 w-3.5" />
            {t('ledger.header.add_customer')}
          </Button>
          <Button variant="outline" size="sm" disabled={!selectedCustomer} onClick={onEditCustomer}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            {t('ledger.header.edit_customer')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedCustomer}
            onClick={onAddSale}
            className="border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t('ledger.header.sale')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedCustomer}
            onClick={onAddPayment}
            className="border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t('ledger.header.payment')}
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
