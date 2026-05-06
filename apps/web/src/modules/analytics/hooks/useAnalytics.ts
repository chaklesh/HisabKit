import { useQuery } from "@tanstack/react-query";
import analyticsService from "../services/analyticsService";

export function useAnalytics() {
  const {
    data: kpis,
    isLoading: isLoadingKPIs,
    error: kpiError,
  } = useQuery({
    queryKey: ["analytics", "kpis"],
    queryFn: analyticsService.fetchKPIs,
    refetchInterval: 30000, // Refresh every 30s for a "live" feel
  });

  const {
    data: distribution,
    isLoading: isLoadingDist,
    error: distError,
  } = useQuery({
    queryKey: ["analytics", "distribution"],
    queryFn: analyticsService.fetchDistribution,
  });

  const handleExport = async () => {
    try {
      await analyticsService.exportPortfolio();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleExportAudit = async () => {
    try {
      await analyticsService.exportAudit();
    } catch (err) {
      console.error("Audit export failed", err);
    }
  };

  return {
    kpis,
    distribution,
    isLoading: isLoadingKPIs || isLoadingDist,
    error: kpiError || distError,
    handleExport,
    handleExportAudit,
  };
}
