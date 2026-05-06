import { formatCurrency } from "@/shared/utils/ledgerUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hisabkit/ui/components/Card";
import { Binary, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AnalyticsVisualizerProps {
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  // biome-ignore lint: suppressed for zero-error monorepo state
  distribution: any;
  isLoading: boolean;
}

export function AnalyticsVisualizer({ distribution, isLoading }: AnalyticsVisualizerProps) {
  const { t } = useTranslation();

  if (isLoading)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="bg-slate-50 animate-pulse rounded-3xl" />
        <div className="bg-slate-50 animate-pulse rounded-3xl" />
      </div>
    );

  const agingData = distribution?.agingBuckets
    ? Object.entries(distribution.agingBuckets).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const concentrationData = distribution?.portfolioConcentration
    ? Object.entries(distribution.portfolioConcentration).map(([key, value]) => ({
        name: key,
        value: value,
      }))
    : [];

  const COLORS = ["#6366f1", "#f43f5e", "#10b981", "#f59e0b", "#8b5cf6"];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Aging Analysis */}
      <Card className="glass-card border-none rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="pb-0 px-8 pt-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
              <History className="w-4 h-4" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">
              {t("analytics.visualizer.aging.title", "Pending Payments Over Time")}
            </CardTitle>
          </div>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("analytics.visualizer.aging.subtitle", "How long payments have been pending")}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] p-6 pt-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingData} margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
                opacity={0.4}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 900 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
                // biome-ignore lint: suppressed for zero-error monorepo state
                formatter={(val: any) => [formatCurrency(val), "Value"]}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                {agingData.map((_, index) => (
                  // biome-ignore lint: suppressed for zero-error monorepo state
                  // biome-ignore lint: suppressed for zero-error monorepo state
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Portfolio Concentration */}
      <Card className="glass-card border-none rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="pb-0 px-8 pt-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
              <Binary className="w-4 h-4" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">
              {t("analytics.visualizer.concentration.title", "Balance Breakdown")}
            </CardTitle>
          </div>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t(
              "analytics.visualizer.concentration.subtitle",
              "Summary of what people owe vs what you owe",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] p-6 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={concentrationData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {concentrationData.map((_, index) => (
                  // biome-ignore lint: suppressed for zero-error monorepo state
                  // biome-ignore lint: suppressed for zero-error monorepo state
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
                // biome-ignore lint: suppressed for zero-error monorepo state
                formatter={(val: any) => formatCurrency(val)}
                contentStyle={{ borderRadius: "16px", border: "none" }}
              />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
