import { Badge } from "@hisabkit/ui/components/Badge";
import { Card, CardContent } from "@hisabkit/ui/components/Card";
import { Activity, ArrowUpRight, Users, Wallet } from "lucide-react";
import { formatCurrency } from "../../../shared/utils/ledgerUtils";
import type { DashboardSummary } from "../types/dashboardTypes";

type DashboardSummaryCardsProps = {
  customerCount: number;
  summary: DashboardSummary;
};

export function DashboardSummaryCards({ customerCount, summary }: DashboardSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 reveal">
      {/* Managed Accounts Card */}
      <Card className="glass-card border-none overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total Customers
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
              {customerCount}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Receivables Card */}
      <Card className="glass-card border-none overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <Wallet className="w-5 h-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] font-bold border-emerald-100 bg-emerald-50/50 text-emerald-600"
            >
              Secure
            </Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            You Collect
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
              {formatCurrency(summary.toCollect)}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Payables Card */}
      <Card className="glass-card border-none overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <Badge
              variant="outline"
              className="text-[9px] font-bold border-rose-100 bg-rose-50/50 text-rose-600"
            >
              Pending
            </Badge>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            You Pay
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight tabular-nums">
              {formatCurrency(summary.toPay)}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Card */}
      <Card className="glass-card border-none overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl">
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 text-[9px] font-black uppercase tracking-wider">
              Critical
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Overdue Accounts
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight tabular-nums">
              {summary.overdueCount}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
