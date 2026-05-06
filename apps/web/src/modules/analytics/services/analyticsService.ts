import api from "@/shared/api/client";

export interface PortfolioKPIs {
  totalMarketExposure: number;
  totalEntityLiabilities: number;
  overdueSettlementsCount: number;
  activeLedgerProfiles: number;
  collectionEfficiency: number;
  weightedPortfolioRisk: number;
}

export interface ExposureMetric {
  entityName: string;
  balance: number;
}

export interface PortfolioDistribution {
  topExposureProfiles: ExposureMetric[];
  agingBuckets: Record<string, number>;
  portfolioConcentration: Record<string, number>;
}

const analyticsService = {
  fetchKPIs: async (): Promise<PortfolioKPIs> => {
    const response = await api.get("/analytics/portfolio-kpis");
    return response.data;
  },

  fetchDistribution: async (): Promise<PortfolioDistribution> => {
    const response = await api.get("/analytics/portfolio-distribution");
    return response.data;
  },

  exportPortfolio: async () => {
    const response = await api.get("/analytics/export-portfolio", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Portfolio_Extract_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportAudit: async () => {
    const response = await api.get("/analytics/export-audit", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Audit_Trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

export default analyticsService;
