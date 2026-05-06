package com.nayag.hisabkit.modules.analytics.dto;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PortfolioKPIDTO {
  private BigDecimal totalMarketExposure; // Sum of all positive balances
  private BigDecimal totalEntityLiabilities; // Sum of all negative balances
  private long overdueSettlementsCount;
  private long activeLedgerProfiles;
  private BigDecimal collectionEfficiency; // Percentage (mock for now)
  private BigDecimal weightedPortfolioRisk; // Risk score (mock)
}
