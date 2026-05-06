package com.nayag.hisabkit.modules.ledger.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;

@Data
public class CreateTransactionRequest {
  @NotNull(message = "Customer id is required")
  private UUID customerId;

  @NotBlank(message = "Type is required")
  private String type;

  @DecimalMin(value = "0.00", inclusive = true, message = "Total amount cannot be negative")
  private BigDecimal totalAmount;

  @DecimalMin(value = "0.00", inclusive = true, message = "Paid amount cannot be negative")
  private BigDecimal paidAmount;

  private LocalDate transactionDate;

  private String description;
}
