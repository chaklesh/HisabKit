package com.nayag.hisabkit.modules.analytics.service;

import com.nayag.hisabkit.modules.analytics.dto.PortfolioDistributionDTO;
import com.nayag.hisabkit.modules.analytics.dto.PortfolioKPIDTO;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
  private final CustomerRepository customerRepository;
  private final com.nayag.hisabkit.modules.ledger.repository.TransactionRepository
      transactionRepository;
  private final com.nayag.hisabkit.modules.audit.repository.AuditLogRepository auditLogRepository;

  public PortfolioKPIDTO getPortfolioKPIs(UUID tenantId) {
    List<Customer> customers = customerRepository.findByTenantId(tenantId);

    BigDecimal exposure =
        customers.stream()
            .map(c -> c.getTotalBalance() != null ? c.getTotalBalance() : BigDecimal.ZERO)
            .filter(b -> b.compareTo(BigDecimal.ZERO) > 0)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal liabilities =
        customers.stream()
            .map(c -> c.getTotalBalance() != null ? c.getTotalBalance() : BigDecimal.ZERO)
            .filter(b -> b.compareTo(BigDecimal.ZERO) < 0)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .abs();

    long overdueCount =
        customers.stream()
            .filter(
                c ->
                    c.getDueDate() != null
                        && c.getDueDate().isBefore(java.time.LocalDate.now())
                        && c.getTotalBalance().compareTo(BigDecimal.ZERO) > 0)
            .count();

    BigDecimal sales = transactionRepository.sumTotalSalesVolume(tenantId);
    BigDecimal collections = transactionRepository.sumTotalCollections(tenantId);

    BigDecimal efficiency =
        sales.compareTo(BigDecimal.ZERO) > 0
            ? collections
                .multiply(new BigDecimal("100"))
                .divide(sales, 2, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

    BigDecimal risk =
        exposure.compareTo(BigDecimal.ZERO) > 0
            ? new BigDecimal(overdueCount)
                .multiply(new BigDecimal("10"))
                .divide(new BigDecimal(customers.size() + 1), 1, java.math.RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

    return PortfolioKPIDTO.builder()
        .totalMarketExposure(exposure)
        .totalEntityLiabilities(liabilities)
        .overdueSettlementsCount(overdueCount)
        .activeLedgerProfiles(customers.size())
        .collectionEfficiency(efficiency)
        .weightedPortfolioRisk(risk)
        .build();
  }

  public PortfolioDistributionDTO getPortfolioDistribution(UUID tenantId) {
    List<Customer> customers = customerRepository.findByTenantId(tenantId);
    LocalDateTime now = LocalDateTime.now();

    // Top 8 Exposure Profiles
    List<PortfolioDistributionDTO.ExposureMetric> topExposure =
        customers.stream()
            .filter(
                c ->
                    c.getTotalBalance() != null
                        && c.getTotalBalance().compareTo(BigDecimal.ZERO) > 0)
            .sorted((a, b) -> b.getTotalBalance().compareTo(a.getTotalBalance()))
            .limit(8)
            .map(
                c ->
                    PortfolioDistributionDTO.ExposureMetric.builder()
                        .entityName(c.getName())
                        .balance(c.getTotalBalance())
                        .build())
            .collect(Collectors.toList());

    // Aging Analysis
    Map<String, BigDecimal> aging = new HashMap<>();
    aging.put("Current", BigDecimal.ZERO);
    aging.put("1-30 Days", BigDecimal.ZERO);
    aging.put("31-60 Days", BigDecimal.ZERO);
    aging.put("61-90 Days", BigDecimal.ZERO);
    aging.put("90+ Days", BigDecimal.ZERO);

    java.time.LocalDate today = java.time.LocalDate.now();
    for (Customer c : customers) {
      if (c.getTotalBalance() != null && c.getTotalBalance().compareTo(BigDecimal.ZERO) > 0) {
        if (c.getDueDate() == null || c.getDueDate().isAfter(today)) {
          aging.put("Current", aging.get("Current").add(c.getTotalBalance()));
        } else {
          long days = ChronoUnit.DAYS.between(c.getDueDate(), today);
          if (days <= 30) aging.put("1-30 Days", aging.get("1-30 Days").add(c.getTotalBalance()));
          else if (days <= 60)
            aging.put("31-60 Days", aging.get("31-60 Days").add(c.getTotalBalance()));
          else if (days <= 90)
            aging.put("61-90 Days", aging.get("61-90 Days").add(c.getTotalBalance()));
          else aging.put("90+ Days", aging.get("90+ Days").add(c.getTotalBalance()));
        }
      }
    }

    // Concentration
    Map<String, BigDecimal> concentration = new HashMap<>();
    concentration.put(
        "Receivables",
        topExposure.stream()
            .map(PortfolioDistributionDTO.ExposureMetric::getBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
    // Simple mock for concentration map
    concentration.put(
        "Credit",
        customers.stream()
            .filter(c -> c.getTotalBalance().compareTo(BigDecimal.ZERO) > 0)
            .map(Customer::getTotalBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
    concentration.put(
        "Debit",
        customers.stream()
            .filter(c -> c.getTotalBalance().compareTo(BigDecimal.ZERO) < 0)
            .map(Customer::getTotalBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .abs());

    return PortfolioDistributionDTO.builder()
        .topExposureProfiles(topExposure)
        .agingBuckets(aging)
        .portfolioConcentration(concentration)
        .build();
  }

  public String exportDetailedPortfolioCsv(UUID tenantId) {
    List<Customer> customers = customerRepository.findByTenantId(tenantId);
    StringBuilder csv = new StringBuilder("Entity Name,Phone,Email,Balance,Due Date,Status\n");
    for (Customer c : customers) {
      csv.append(
          String.format(
              "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
              c.getName(),
              c.getPhone() != null ? c.getPhone() : "",
              c.getEmail() != null ? c.getEmail() : "",
              c.getTotalBalance() != null ? c.getTotalBalance().toString() : "0.00",
              c.getDueDate() != null ? c.getDueDate().toString() : "OPEN",
              calculateStatus(c)));
    }
    return csv.toString();
  }

  public String exportAuditReportCsv(UUID tenantId) {
    List<com.nayag.hisabkit.modules.audit.model.AuditLog> logs =
        auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId);
    StringBuilder csv = new StringBuilder("Timestamp,Entity Type,Entity ID,Action,Details\n");
    for (com.nayag.hisabkit.modules.audit.model.AuditLog log : logs) {
      csv.append(
          String.format(
              "\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
              log.getTimestamp().toString(),
              log.getEntityName(),
              log.getEntityId().toString(),
              log.getAction(),
              log.getChanges() != null ? log.getChanges().replace("\"", "'") : ""));
    }
    return csv.toString();
  }

  private String calculateStatus(Customer c) {
    if (c.getTotalBalance() == null || c.getTotalBalance().compareTo(BigDecimal.ZERO) == 0)
      return "SETTLED";
    if (c.getDueDate() != null && c.getDueDate().isBefore(java.time.LocalDate.now()))
      return "OVERDUE";
    return "ACTIVE";
  }
}
