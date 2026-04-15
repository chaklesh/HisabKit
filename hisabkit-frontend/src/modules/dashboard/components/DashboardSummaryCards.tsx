import { Users, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/ledgerUtils';
import type { DashboardSummary } from '../types/dashboardTypes';
import { Card, CardContent } from '@/shared/components/ui/card';

type DashboardSummaryCardsProps = {
  customerCount: number;
  summary: DashboardSummary;
};

export function DashboardSummaryCards({ customerCount, summary }: DashboardSummaryCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
      <Card className="glass-card border-none overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 transition-transform group-hover:scale-110">
                <Users className="w-6 h-6" />
             </div>
             <div className="p-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2">
                +12% this month
             </div>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Customers</p>
          <div className="flex items-end gap-2 mt-1">
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{customerCount}</h3>
             <p className="text-xs text-slate-400 mb-1.5 font-medium">accounts managed</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110">
                <ArrowDownLeft className="w-6 h-6" />
             </div>
             <div className="p-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2">
                Receivable
             </div>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total to collect</p>
          <div className="flex items-end gap-2 mt-1">
             <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(summary.toCollect)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 transition-transform group-hover:scale-110">
                <ArrowUpRight className="w-6 h-6" />
             </div>
             <div className="p-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold px-2">
                Payable
             </div>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total to pay</p>
          <div className="flex items-end gap-2 mt-1">
             <h3 className="text-3xl font-black text-rose-600 tracking-tighter">{formatCurrency(summary.toPay)}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
