package com.nayag.hisabkit.modules.analytics.controller;

import com.nayag.hisabkit.modules.analytics.dto.PortfolioDistributionDTO;
import com.nayag.hisabkit.modules.analytics.dto.PortfolioKPIDTO;
import com.nayag.hisabkit.modules.analytics.service.AnalyticsService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
  private final AnalyticsService analyticsService;

  @GetMapping("/portfolio-kpis")
  public ResponseEntity<PortfolioKPIDTO> getKPIs(@RequestHeader("X-Tenant-Id") UUID tenantId) {
    return ResponseEntity.ok(analyticsService.getPortfolioKPIs(tenantId));
  }

  @GetMapping("/portfolio-distribution")
  public ResponseEntity<PortfolioDistributionDTO> getDistribution(
      @RequestHeader("X-Tenant-Id") UUID tenantId) {
    return ResponseEntity.ok(analyticsService.getPortfolioDistribution(tenantId));
  }

  @GetMapping("/export-portfolio")
  public ResponseEntity<String> exportPortfolio(@RequestHeader("X-Tenant-Id") UUID tenantId) {
    return ResponseEntity.ok()
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", "attachment; filename=portfolio_extract.csv")
        .body(analyticsService.exportDetailedPortfolioCsv(tenantId));
  }

  @GetMapping("/export-audit")
  public ResponseEntity<String> exportAudit(@RequestHeader("X-Tenant-Id") UUID tenantId) {
    return ResponseEntity.ok()
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", "attachment; filename=audit_trail.csv")
        .body(analyticsService.exportAuditReportCsv(tenantId));
  }
}
