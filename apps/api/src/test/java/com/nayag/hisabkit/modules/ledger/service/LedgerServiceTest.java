package com.nayag.hisabkit.modules.ledger.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.nayag.hisabkit.core.exception.BusinessValidationException;
import com.nayag.hisabkit.modules.audit.service.AuditService;
import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {

  @Mock private CustomerRepository customerRepository;
  @Mock private TransactionRepository transactionRepository;
  @Mock private AttachmentRepository attachmentRepository;
  @Mock private AuditService auditService;

  @InjectMocks private LedgerService ledgerService;

  private UUID tenantId;
  private UUID customerId;
  private UUID userId;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID();
    customerId = UUID.randomUUID();
    userId = UUID.randomUUID();
  }

  @Test
  void createCustomer_ShouldSaveCorrectly() {
    CreateCustomerRequest request = new CreateCustomerRequest();
    request.setName("John Doe");
    request.setPhone("1234567890");

    when(customerRepository.save(any(Customer.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Customer result = ledgerService.createCustomer(tenantId, request);

    assertNotNull(result);
    assertEquals("John Doe", result.getName());
    assertEquals(tenantId, result.getTenantId());
    assertEquals(BigDecimal.ZERO.setScale(2), result.getTotalBalance());
    verify(customerRepository).save(any(Customer.class));
  }

  @Test
  void createTransaction_Sale_ShouldCalculateCorrectly() {
    Customer customer = new Customer();
    customer.setId(customerId);
    customer.setName("Test Customer");

    CreateTransactionRequest request = new CreateTransactionRequest();
    request.setCustomerId(customerId);
    request.setType("SALE");
    request.setTotalAmount(new BigDecimal("1000.00"));
    request.setPaidAmount(new BigDecimal("200.00"));
    request.setTransactionDate(LocalDate.now());

    when(customerRepository.findByIdAndTenantId(customerId, tenantId))
        .thenReturn(Optional.of(customer));
    when(transactionRepository.save(any(Transaction.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(transactionRepository.calculateCustomerBalance(tenantId, customerId))
        .thenReturn(new BigDecimal("800.00"));
    when(customerRepository.save(any(Customer.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Map<String, Object> result = ledgerService.createTransaction(tenantId, userId, request);

    Transaction savedTxn = (Transaction) result.get("transaction");
    assertEquals("SALE", savedTxn.getType());
    assertEquals(new BigDecimal("1000.00"), savedTxn.getTotalAmount());
    assertEquals(new BigDecimal("200.00"), savedTxn.getPaidAmount());
    assertEquals(new BigDecimal("800.00"), savedTxn.getDueAmount());

    Customer updatedCustomer = (Customer) result.get("customer");
    assertEquals(new BigDecimal("800.00"), updatedCustomer.getTotalBalance());

    verify(auditService)
        .logMutation(eq("TRANSACTION"), any(), eq("CREATE"), eq(tenantId), anyMap());
  }

  @Test
  void createTransaction_Payment_ShouldOnlyUsePaidAmount() {
    Customer customer = new Customer();
    customer.setId(customerId);

    CreateTransactionRequest request = new CreateTransactionRequest();
    request.setCustomerId(customerId);
    request.setType("PAYMENT");
    request.setPaidAmount(new BigDecimal("500.00"));

    when(customerRepository.findByIdAndTenantId(customerId, tenantId))
        .thenReturn(Optional.of(customer));
    when(transactionRepository.save(any(Transaction.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(transactionRepository.calculateCustomerBalance(tenantId, customerId))
        .thenReturn(new BigDecimal("-500.00"));
    when(customerRepository.save(any(Customer.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    Map<String, Object> result = ledgerService.createTransaction(tenantId, userId, request);

    Transaction savedTxn = (Transaction) result.get("transaction");
    assertEquals("PAYMENT", savedTxn.getType());
    assertEquals(new BigDecimal("500.00"), savedTxn.getTotalAmount());
    assertTrue(BigDecimal.ZERO.compareTo(savedTxn.getDueAmount()) == 0);
  }

  @Test
  void createTransaction_InvalidAmount_ShouldThrowException() {
    CreateTransactionRequest request = new CreateTransactionRequest();
    request.setCustomerId(customerId);
    request.setType("SALE");
    request.setTotalAmount(new BigDecimal("100.00"));
    request.setPaidAmount(new BigDecimal("150.00")); // Paid > Total

    when(customerRepository.findByIdAndTenantId(customerId, tenantId))
        .thenReturn(Optional.of(new Customer()));

    assertThrows(
        BusinessValidationException.class,
        () -> ledgerService.createTransaction(tenantId, userId, request));
  }

  @Test
  void deleteCustomer_ShouldCleanupTransactionsAndAttachments() {
    Customer customer = new Customer();
    customer.setId(customerId);
    customer.setName("Delete Me");

    when(customerRepository.findByIdAndTenantId(customerId, tenantId))
        .thenReturn(Optional.of(customer));

    ledgerService.deleteCustomer(tenantId, customerId);

    verify(transactionRepository).deleteAll(any());
    verify(customerRepository).delete(customer);
    verify(auditService)
        .logMutation(eq("CUSTOMER"), eq(customerId), eq("DELETE"), eq(tenantId), anyMap());
  }
}
