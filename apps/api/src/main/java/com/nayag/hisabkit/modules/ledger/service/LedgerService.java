package com.nayag.hisabkit.modules.ledger.service;

import com.nayag.hisabkit.core.exception.BusinessValidationException;
import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.dto.LedgerSummaryResponse;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LedgerService {

  private final CustomerRepository customerRepository;
  private final TransactionRepository transactionRepository;
  private final AttachmentRepository attachmentRepository;
  private final com.nayag.hisabkit.modules.audit.service.AuditService auditService;
  private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

  public List<Customer> getAllCustomers(UUID tenantId) {
    return customerRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
  }

  @Transactional
  public Customer createCustomer(UUID tenantId, CreateCustomerRequest request) {
    Customer customer = new Customer();
    customer.setName(request.getName().trim());
    customer.setPhone(trimToNull(request.getPhone()));
    customer.setEmail(trimToNull(request.getEmail()));
    customer.setAddress(trimToNull(request.getAddress()));
    customer.setGstNumber(trimToNull(request.getGstNumber()));
    customer.setTags(trimToNull(request.getTags()));
    customer.setDueDate(request.getDueDate());
    customer.setTenantId(tenantId);
    customer.setTotalBalance(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));

    customer.setCustomerCode("CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

    Customer saved = customerRepository.save(customer);

    // Detailed Create Log
    auditService.logMutation(
        "CUSTOMER",
        saved.getId(),
        "CREATE",
        tenantId,
        null,
        Map.of(
            "name", saved.getName(), "phone", saved.getPhone() != null ? saved.getPhone() : "N/A"),
        saved.getName());

    return saved;
  }

  @Transactional
  public Customer updateCustomer(UUID tenantId, UUID customerId, CreateCustomerRequest request) {
    Customer customer =
        customerRepository
            .findByIdAndTenantId(customerId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    // Capture Old State for Diff
    Map<String, Object> oldValues =
        Map.of(
            "name", customer.getName(),
            "phone", customer.getPhone() != null ? customer.getPhone() : "",
            "email", customer.getEmail() != null ? customer.getEmail() : "",
            "address", customer.getAddress() != null ? customer.getAddress() : "",
            "gstNumber", customer.getGstNumber() != null ? customer.getGstNumber() : "",
            "dueDate", customer.getDueDate() != null ? customer.getDueDate().toString() : "");

    customer.setName(request.getName().trim());
    customer.setPhone(trimToNull(request.getPhone()));
    customer.setEmail(trimToNull(request.getEmail()));
    customer.setAddress(trimToNull(request.getAddress()));
    customer.setGstNumber(trimToNull(request.getGstNumber()));
    customer.setTags(trimToNull(request.getTags()));
    customer.setDueDate(request.getDueDate());

    if (customer.getCustomerCode() == null) {
      customer.setCustomerCode(
          "CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
    }

    Customer saved = customerRepository.save(customer);

    // Capture New State for Diff
    Map<String, Object> newValues =
        Map.of(
            "name", saved.getName(),
            "phone", saved.getPhone() != null ? saved.getPhone() : "",
            "email", saved.getEmail() != null ? saved.getEmail() : "",
            "address", saved.getAddress() != null ? saved.getAddress() : "",
            "gstNumber", saved.getGstNumber() != null ? saved.getGstNumber() : "",
            "dueDate", saved.getDueDate() != null ? saved.getDueDate().toString() : "");

    auditService.logMutation(
        "CUSTOMER", saved.getId(), "UPDATE", tenantId, oldValues, newValues, saved.getName());

    return saved;
  }

  @Transactional
  public void deleteCustomer(UUID tenantId, UUID customerId) {
    Customer customer =
        customerRepository
            .findByIdAndTenantId(customerId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    List<Transaction> txns =
        transactionRepository.findByTenantIdAndCustomerId(tenantId, customerId);
    for (Transaction txn : txns) {
      attachmentRepository.deleteAll(attachmentRepository.findByTransactionId(txn.getId()));
    }
    transactionRepository.deleteAll(txns);
    customerRepository.delete(customer);

    auditService.logMutation(
        "CUSTOMER",
        customerId,
        "DELETE",
        tenantId,
        Map.of("name", customer.getName(), "finalBalance", customer.getTotalBalance().toString()),
        null,
        customer.getName());
  }

  @Transactional
  public Map<String, Object> createTransaction(
      UUID tenantId, UUID createdByUserId, CreateTransactionRequest request) {
    Customer customer =
        customerRepository
            .findByIdAndTenantId(request.getCustomerId(), tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    Transaction transaction = new Transaction();
    String datePart =
        java.time.format.DateTimeFormatter.ofPattern("yyMMdd").format(java.time.LocalDate.now());
    String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    transaction.setReferenceNo("TXN-" + datePart + "-" + randomPart);

    transaction.setCustomerId(customer.getId());
    transaction.setCreatedByUserId(createdByUserId);
    transaction.setTenantId(tenantId);
    applyTransactionInput(transaction, request);

    Transaction saved = transactionRepository.save(transaction);
    Customer updated = recalculateAndSaveCustomerBalance(tenantId, customer.getId());

    auditService.logMutation(
        "TRANSACTION",
        saved.getId(),
        "CREATE",
        tenantId,
        null,
        Map.of(
            "type",
            saved.getType(),
            "amount",
            saved.getTotalAmount().toString(),
            "date",
            saved.getTimestamp().toString()),
        customer.getName());

    return Map.of("transaction", saved, "customer", updated);
  }

  @Transactional
  public Map<String, Object> updateTransaction(
      UUID tenantId, UUID transactionId, CreateTransactionRequest request) {
    Transaction transaction =
        transactionRepository
            .findByIdAndTenantId(transactionId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

    Customer customer =
        customerRepository
            .findByIdAndTenantId(transaction.getCustomerId(), tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    // Capture Old State
    Map<String, Object> oldValues =
        Map.of(
            "type", transaction.getType(),
            "amount", transaction.getTotalAmount().toString(),
            "paid", transaction.getPaidAmount().toString(),
            "date", transaction.getTimestamp().toString(),
            "description",
                transaction.getDescription() != null ? transaction.getDescription() : "");

    UUID previousCustomerId = transaction.getCustomerId();
    transaction.setCustomerId(request.getCustomerId());
    applyTransactionInput(transaction, request);

    // Explicitly ensure dueAmount is set in case applyTransactionInput logic changes
    transaction.setDueAmount(transaction.getTotalAmount().subtract(transaction.getPaidAmount()));

    Transaction updatedTransaction = transactionRepository.save(transaction);
    recalculateAndSaveCustomerBalance(tenantId, previousCustomerId);
    Customer updatedCustomer = recalculateAndSaveCustomerBalance(tenantId, request.getCustomerId());

    // Capture New State
    Map<String, Object> newValues =
        Map.of(
            "type", updatedTransaction.getType(),
            "amount", updatedTransaction.getTotalAmount().toString(),
            "paid", updatedTransaction.getPaidAmount().toString(),
            "date", updatedTransaction.getTimestamp().toString(),
            "description",
                updatedTransaction.getDescription() != null
                    ? updatedTransaction.getDescription()
                    : "");

    auditService.logMutation(
        "TRANSACTION",
        updatedTransaction.getId(),
        "UPDATE",
        tenantId,
        oldValues,
        newValues,
        updatedCustomer.getName());

    return Map.of("transaction", updatedTransaction, "customer", updatedCustomer);
  }

  @Transactional
  public Map<String, Object> deleteTransaction(UUID tenantId, UUID transactionId) {
    Transaction transaction =
        transactionRepository
            .findByIdAndTenantId(transactionId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

    Customer customer =
        customerRepository
            .findByIdAndTenantId(transaction.getCustomerId(), tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    attachmentRepository.deleteAll(
        attachmentRepository.findByTenantIdAndTransactionIdOrderByUploadedAtDesc(
            tenantId, transactionId));
    transactionRepository.delete(transaction);
    Customer updatedCustomer =
        recalculateAndSaveCustomerBalance(tenantId, transaction.getCustomerId());

    auditService.logMutation(
        "TRANSACTION",
        transactionId,
        "DELETE",
        tenantId,
        Map.of(
            "type",
            transaction.getType(),
            "amount",
            transaction.getTotalAmount().toString(),
            "ref",
            transaction.getReferenceNo()),
        null,
        customer.getName());

    return Map.of("deleted", true, "customer", updatedCustomer);
  }

  public List<Transaction> getCustomerTransactions(UUID tenantId, UUID customerId) {
    return transactionRepository.findByTenantIdAndCustomerIdOrderByTimestampDesc(
        tenantId, customerId);
  }

  public List<Transaction> getCustomerTransactionsBetween(
      UUID tenantId, UUID customerId, LocalDateTime from, LocalDateTime to) {
    return transactionRepository.findByTenantIdAndCustomerIdAndTimestampBetweenOrderByTimestampAsc(
        tenantId, customerId, from, to);
  }

  public LedgerSummaryResponse getLedgerSummary(UUID tenantId) {
    BigDecimal totalSales = amountOrZero(transactionRepository.sumTotalSalesVolume(tenantId));
    BigDecimal totalPayments = amountOrZero(transactionRepository.sumTotalCollections(tenantId));
    long count = transactionRepository.countByTenantId(tenantId);

    return LedgerSummaryResponse.builder()
        .from(LocalDate.now().minusDays(30))
        .to(LocalDate.now())
        .transactionCount(count)
        .totalSales(totalSales)
        .totalPayments(totalPayments)
        .outstandingDue(totalSales.subtract(totalPayments))
        .build();
  }

  public Customer recalculateAndSaveCustomerBalance(UUID tenantId, UUID customerId) {
    Customer customer =
        customerRepository
            .findByIdAndTenantId(customerId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    customer.setTotalBalance(
        amountOrZero(transactionRepository.calculateCustomerBalance(tenantId, customerId)));
    return customerRepository.save(customer);
  }

  private void applyTransactionInput(Transaction transaction, CreateTransactionRequest request) {
    String normalizedType = request.getType().trim().toUpperCase(Locale.ROOT);
    if (!"SALE".equals(normalizedType) && !"PAYMENT".equals(normalizedType)) {
      throw new BusinessValidationException("Type must be SALE or PAYMENT");
    }

    BigDecimal total = amountOrZero(request.getTotalAmount());
    BigDecimal paid = amountOrZero(request.getPaidAmount());

    if ("SALE".equals(normalizedType)) {
      if (total.compareTo(BigDecimal.ZERO) <= 0) {
        throw new BusinessValidationException("Sale total amount must be greater than zero");
      }
      if (paid.compareTo(total) > 0) {
        throw new BusinessValidationException("Paid amount cannot exceed total sale amount");
      }
    } else {
      if (paid.compareTo(BigDecimal.ZERO) <= 0) {
        throw new BusinessValidationException("Payment amount must be greater than zero");
      }
      transaction.setTotalAmount(BigDecimal.ZERO);
    }

    BigDecimal due = total.subtract(paid);
    transaction.setDueAmount(due);

    transaction.setType(normalizedType);
    transaction.setTotalAmount(total);
    transaction.setPaidAmount(paid);
    transaction.setDescription(request.getDescription());
    transaction.setTimestamp(
        request.getTransactionDate() != null
            ? request.getTransactionDate().atStartOfDay()
            : LocalDateTime.now());
  }

  private BigDecimal amountOrZero(BigDecimal amount) {
    return amount == null
        ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
        : amount.setScale(2, RoundingMode.HALF_UP);
  }

  private String trimToNull(String str) {
    if (str == null) return null;
    String trimmed = str.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }
}
