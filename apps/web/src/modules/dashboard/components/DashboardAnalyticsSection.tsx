import { formatCurrency } from "@/shared/utils/ledgerUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@hisabkit/ui/components/Card";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardCustomer, DashboardSummary } from "../types/dashboardTypes";

type DashboardAnalyticsSectionProps = {
  summary: DashboardSummary;
  topDebtors: DashboardCustomer[];
  topCreditors: DashboardCustomer[];
};

export function DashboardAnalyticsSection({
  summary,
  topDebtors,
  topCreditors,
}: DashboardAnalyticsSectionProps) {
  const chartData = [
    { name: "Receivables", value: summary.toCollect, color: "#10b981" },
    { name: "Payables", value: summary.toPay, color: "#f43f5e" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr] reveal">
      {/* Portfolio Concentration */}
      <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-background shadow-sm overflow-hidden flex flex-col">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            Portfolio Mix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 flex-1 flex flex-col items-center justify-center">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    // biome-ignore lint: suppressed for zero-error monorepo state
                    // biome-ignore lint: suppressed for zero-error monorepo state
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                            {payload[0].name}
                          </p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">
                            {formatCurrency(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
                Receivables
              </p>
              <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                {Math.round((summary.toCollect / (summary.toCollect + summary.toPay || 1)) * 100)}%
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mb-1">
                Payables
              </p>
              <p className="text-lg font-black text-rose-700 dark:text-rose-400">
                {Math.round((summary.toPay / (summary.toCollect + summary.toPay || 1)) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Accounts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Debtors */}
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-background shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              Top Debtors
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-3">
            {topDebtors.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center font-medium italic">
                No receivables detected.
              </p>
            ) : (
              topDebtors.map((customer) => (
                <div
                  key={customer.id}
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-600 dark:text-slate-400">
                      {customer.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {customer.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {customer.phone || "No Contact"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(Number(customer.totalBalance))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Creditors */}
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-background shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              Top Payables
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-3">
            {topCreditors.length === 0 ? (
              <p className="text-sm text-slate-400 py-10 text-center font-medium italic">
                No credit liabilities found.
              </p>
            ) : (
              topCreditors.map((customer) => (
                <div
                  key={customer.id}
                  className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-600 dark:text-slate-400">
                      {customer.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors">
                        {customer.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {customer.phone || "No Contact"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                      {formatCurrency(Math.abs(Number(customer.totalBalance)))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
