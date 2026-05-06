package com.nayag.hisabkit.modules.ledger.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;
import org.hibernate.annotations.Filter;

@Data
@Entity
@Table(name = "transactions")
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Transaction {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "reference_no", nullable = false)
  private String referenceNo;

  @Column(name = "customer_id", nullable = false)
  private UUID customerId;

  @Column(nullable = false)
  private String type; // SALE, PAYMENT

  @Column(name = "total_amount", precision = 15, scale = 2)
  private BigDecimal totalAmount = BigDecimal.ZERO;

  @Column(name = "paid_amount", precision = 15, scale = 2)
  private BigDecimal paidAmount = BigDecimal.ZERO;

  @Column(name = "due_amount", precision = 15, scale = 2)
  private BigDecimal dueAmount = BigDecimal.ZERO;

  private String description;

  @Column(nullable = false)
  private LocalDateTime timestamp = LocalDateTime.now();

  @Column(name = "created_by_user_id", nullable = false)
  private UUID createdByUserId;

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @PrePersist
  public void prePersist() {
    if (timestamp == null) timestamp = LocalDateTime.now();
  }
}
