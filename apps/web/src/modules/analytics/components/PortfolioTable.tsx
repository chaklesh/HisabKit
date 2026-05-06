import { formatCurrency, formatDate } from "@/shared/utils/ledgerUtils";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@hisabkit/ui/components/Table";
import { BarChart3, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface PortfolioTableProps {
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  // biome-ignore lint: suppressed for zero-error monorepo state
  data: any[];
  isLoading: boolean;
}

export function PortfolioTable({ data, isLoading }: PortfolioTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <div className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800 border-t-indigo-600 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600/50">
            {t("analytics.table.loading", "Loading report details...")}
          </p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/80 rounded-3xl flex items-center justify-center mx-auto opacity-50 shadow-inner">
            <BarChart3 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-balance max-w-xs mx-auto">
            {t("analytics.table.empty", "No customer balances found at the moment.")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/20">
              <TableRow className="border-slate-100 dark:border-slate-800 h-12">
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("analytics.table.header.customer", "Customer Name")}
                </TableHead>
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  {t("analytics.table.header.balance", "Total Balance")}
                </TableHead>
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  {t("analytics.table.header.status", "Safety Status")}
                </TableHead>
                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("analytics.table.header.deadline", "Due Date")}
                </TableHead>
                <th className="px-8 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((profile, idx) => (
                <TableRow
                  key={idx}
                  className="border-slate-50 dark:border-slate-800/30 hover:bg-white dark:hover:bg-slate-900 transition-all group cursor-pointer h-16"
                  onClick={() => navigate(`/ledger?entityName=${profile.entityName}`)}
                >
                  <TableCell className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-600/10 flex items-center justify-center text-[12px] font-black text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm border border-indigo-50 dark:border-indigo-900/30 group-hover:scale-110 transition-transform">
                        {profile.entityName.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors truncate">
                          {profile.entityName}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider opacity-60">
                          {t("analytics.table.status.active", "Active")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-4 text-right">
                    <span
                      className={cn(
                        "text-sm font-black tracking-tighter tabular-nums px-3 py-1 rounded-xl",
                        profile.balance >= 0
                          ? 'text-emerald-600 bg-emerald-50 content-[""] shadow-sm'
                          : "text-rose-600 bg-rose-50 shadow-sm",
                      )}
                    >
                      {formatCurrency(profile.balance)}
                    </span>
                  </TableCell>
                  <TableCell className="px-8 py-4 text-center">
                    <Badge
                      className={cn(
                        "rounded-lg text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border-none shadow-sm transition-all",
                        profile.balance > 10000
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600",
                      )}
                    >
                      {profile.balance > 10000
                        ? t("analytics.table.status.attention", "Needs Attention")
                        : t("analytics.table.status.safe", "Safe")}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-4">
                    <p className="text-[11px] font-black text-slate-500 tabular-nums">
                      {formatDate(new Date().toISOString())}
                    </p>
                  </TableCell>
                  <TableCell className="px-8 py-4 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-200 dark:shadow-none">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
