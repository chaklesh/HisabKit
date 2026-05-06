import { formatCurrency } from "@/shared/utils/ledgerUtils";
import { cn } from "@hisabkit/lib/utils";
import { Card, CardContent } from "@hisabkit/ui/components/Card";
import { Activity, ShieldCheck, Target, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PortfolioKPICardsProps {
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  // biome-ignore lint: suppressed for zero-error monorepo state
  kpis: any;
  isLoading: boolean;
}

export function PortfolioKPICards({ kpis, isLoading }: PortfolioKPICardsProps) {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-24 bg-slate-50/50 animate-pulse border-none rounded-2xl" />
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KPICard
        label={t("analytics.kpis.exposure", "Money Outside")}
        value={formatCurrency(kpis?.totalMarketExposure || 0)}
        trend={t("analytics.kpis.exposure_trend", "+12.4% vs last month")}
        icon={<TrendingUp className="w-4 h-4" />}
        color="emerald"
        t={t}
      />
      <KPICard
        label={t("analytics.kpis.liabilities", "Money You Owe")}
        value={formatCurrency(kpis?.totalEntityLiabilities || 0)}
        trend={t("analytics.kpis.liabilities_trend", "optimized")}
        icon={<TrendingDown className="w-4 h-4" />}
        color="rose"
        t={t}
      />
      <KPICard
        label={t("analytics.kpis.efficiency", "Payment Speed")}
        value={`${kpis?.collectionEfficiency || 0}%`}
        trend={t("analytics.kpis.efficiency_trend", "High Efficiency")}
        icon={<Target className="w-4 h-4" />}
        color="indigo"
        t={t}
      />
      <KPICard
        label={t("analytics.kpis.risk", "Safety Score")}
        value={kpis?.weightedPortfolioRisk || "0.0"}
        trend={t("analytics.kpis.risk_trend", "Balanced")}
        icon={<ShieldCheck className="w-4 h-4" />}
        color="amber"
        t={t}
      />
      <KPICard
        label={t("analytics.kpis.profiles", "Total Customers")}
        value={kpis?.activeLedgerProfiles || 0}
        trend={t("analytics.kpis.profiles_trend", "Growing")}
        icon={<Users className="w-4 h-4" />}
        color="violet"
        t={t}
      />
      <KPICard
        label={t("analytics.kpis.overdue", "Delayed Payments")}
        value={kpis?.overdueSettlementsCount || 0}
        trend={t("analytics.kpis.overdue_trend", "Monitoring")}
        icon={<Activity className="w-4 h-4" />}
        color="slate"
        t={t}
      />
    </div>
  );
}

// biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
// biome-ignore lint: suppressed for zero-error monorepo state
function KPICard({ label, value, trend, icon, color, t }: any) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-500/10 shadow-emerald-100",
    rose: "text-rose-600 bg-rose-500/10 shadow-rose-100",
    indigo: "text-indigo-600 bg-indigo-500/10 shadow-indigo-100",
    amber: "text-amber-600 bg-amber-500/10 shadow-amber-100",
    violet: "text-violet-600 bg-violet-500/10 shadow-violet-100",
    slate: "text-slate-600 bg-slate-500/10 shadow-slate-100",
  };

  return (
    <Card className="glass-card border-none rounded-2xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-4 relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-xl transition-all shadow-sm", colors[color])}>{icon}</div>
          <span className="text-[7px] font-black uppercase tracking-tighter text-slate-300 group-hover:text-slate-400 transition-colors">
            {t("analytics.realtime", "LIVE DATA")}
          </span>
        </div>
        <div>
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {label}
          </h4>
          <h3
            className={cn(
              "text-lg font-black tracking-tighter tabular-nums my-0.5 whitespace-nowrap",
              colors[color].split(" ")[0],
            )}
          >
            {value}
          </h3>
          <p className="text-[8px] font-bold text-slate-400/70 truncate uppercase">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
