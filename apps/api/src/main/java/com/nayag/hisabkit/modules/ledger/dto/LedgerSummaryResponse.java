package com.nayag.hisabkit.modules.ledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerSummaryResponse {
  private LocalDate from;
  private LocalDate to;
  private long transactionCount;
  private BigDecimal totalSales;
  private BigDecimal totalPayments;
  private BigDecimal outstandingDue;
}
