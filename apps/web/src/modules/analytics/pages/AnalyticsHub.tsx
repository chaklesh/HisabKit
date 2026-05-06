import { Button } from "@hisabkit/ui/components/Button";
import { Input } from "@hisabkit/ui/components/Input";
import { ArrowUpDown, Download, FileText, PieChart as PieChartIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnalyticsVisualizer } from "../components/AnalyticsVisualizer";
import { PortfolioKPICards } from "../components/PortfolioKPICards";
import { useAnalytics } from "../hooks/useAnalytics";

import { PortfolioTable } from "../components/PortfolioTable";

export default function AnalyticsHub() {
  const { t } = useTranslation();
  const { kpis, distribution, isLoading, handleExport, handleExportAudit } = useAnalytics();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfiles = useMemo(() => {
    if (!distribution?.topExposureProfiles) return [];
    if (!searchTerm) return distribution.topExposureProfiles;
    const lower = searchTerm.toLowerCase();
    return distribution.topExposureProfiles.filter((p) =>
      p.entityName.toLowerCase().includes(lower),
    );
  }, [distribution, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      {/* Header - Premium Dense */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none text-white">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              {t("analytics.suite", "Shop Insights")}
            </p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t("analytics.title", "Shop Reports")}
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
            {t("analytics.subtitle", "Simple overview of your shop's money and business health")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all px-4 shadow-sm"
          >
            <Download className="mr-2 h-4 w-4 text-indigo-500" />
            {t("analytics.table.extract_data", "SAVE TO CSV")}
          </Button>
          <Button
            onClick={handleExportAudit}
            className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="mr-2 h-4 w-4 text-indigo-300" />
            {t("analytics.table.audit_report", "FULL SUMMARY REPORT")}
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <PortfolioKPICards kpis={kpis} isLoading={isLoading} />

      {/* Visual Analytics */}
      <AnalyticsVisualizer distribution={distribution} isLoading={isLoading} />

      {/* Entity Portfolio List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              {t("analytics.table.title", "Customer Balances")}
            </h2>
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {t("analytics.table.subtitle", "Detailed list of who owes how much")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder={t("analytics.table.search_placeholder", "FIND A CUSTOMER...")}
                className="h-9 pl-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] font-black uppercase tracking-widest focus-visible:ring-indigo-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            </Button>
          </div>
        </div>

        <PortfolioTable data={filteredProfiles} isLoading={isLoading} />
      </div>
    </div>
  );
}
