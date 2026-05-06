package com.nayag.hisabkit.modules.analytics.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PortfolioDistributionDTO {
  private List<ExposureMetric> topExposureProfiles;
  private Map<String, BigDecimal> agingBuckets; // 0-30, 31-60, 61-90, 90+
  private Map<String, BigDecimal> portfolioConcentration; // Credit vs Debit

  @Data
  @Builder
  public static class ExposureMetric {
    private String entityName;
    private BigDecimal balance;
  }
}
