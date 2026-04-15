package com.nayag.hisabkit.modules.ledger.service;

import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.audit.repository.AuditLogRepository;
import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.core.exception.BusinessValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @InjectMocks
    private LedgerService ledgerService;

    private UUID tenantId;
    private UUID customerId;
    private Customer customer;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        customerId = UUID.randomUUID();
        customer = new Customer();
        customer.setId(customerId);
        customer.setTenantId(tenantId);
        customer.setName("Test Customer");
        customer.setTotalBalance(BigDecimal.ZERO);
    }

    @Test
    void testCreateCustomer_Success() {
        CreateCustomerRequest request = new CreateCustomerRequest();
        request.setName("John Doe");
        request.setPhone("1234567890");

        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        Customer created = ledgerService.createCustomer(tenantId, request);

        assertNotNull(created);
        assertEquals("John Doe", created.getName());
        assertEquals(tenantId, created.getTenantId());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void testCreateTransaction_Sale_UpdatesBalance() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setCustomerId(customerId);
        request.setType("SALE");
        request.setTotalAmount(new BigDecimal("1000.00"));
        request.setPaidAmount(new BigDecimal("400.00"));

        when(customerRepository.findByIdAndTenantId(customerId, tenantId)).thenReturn(Optional.of(customer));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.calculateCustomerBalance(tenantId, customerId)).thenReturn(new BigDecimal("600.00"));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        var result = ledgerService.createTransaction(tenantId, UUID.randomUUID(), request);

        Transaction txn = (Transaction) result.get("transaction");
        Customer updatedCustomer = (Customer) result.get("customer");

        assertEquals(new BigDecimal("600.00"), txn.getDueAmount());
        assertEquals(new BigDecimal("600.00"), updatedCustomer.getTotalBalance());
        verify(transactionRepository).save(any(Transaction.class));
        verify(customerRepository).save(customer);
    }

    @Test
    void testCreateTransaction_Payment_Success() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setCustomerId(customerId);
        request.setType("PAYMENT");
        request.setPaidAmount(new BigDecimal("200.00"));

        when(customerRepository.findByIdAndTenantId(customerId, tenantId)).thenReturn(Optional.of(customer));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(i -> i.getArgument(0));
        when(transactionRepository.calculateCustomerBalance(tenantId, customerId)).thenReturn(new BigDecimal("-200.00"));
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> i.getArgument(0));

        var result = ledgerService.createTransaction(tenantId, UUID.randomUUID(), request);

        Transaction txn = (Transaction) result.get("transaction");
        assertEquals("PAYMENT", txn.getType());
        assertEquals(new BigDecimal("200.00"), txn.getTotalAmount());
        assertEquals(BigDecimal.ZERO, txn.getDueAmount());
    }

    @Test
    void testCreateTransaction_InvalidType_ThrowsException() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setCustomerId(customerId);
        request.setType("INVALID");

        when(customerRepository.findByIdAndTenantId(customerId, tenantId)).thenReturn(Optional.of(customer));

        assertThrows(BusinessValidationException.class, () -> 
            ledgerService.createTransaction(tenantId, UUID.randomUUID(), request)
        );
    }

    @Test
    void testCreateTransaction_NegativeAmount_ThrowsException() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setCustomerId(customerId);
        request.setType("SALE");
        request.setTotalAmount(new BigDecimal("-100.00"));

        when(customerRepository.findByIdAndTenantId(customerId, tenantId)).thenReturn(Optional.of(customer));

        assertThrows(BusinessValidationException.class, () -> 
            ledgerService.createTransaction(tenantId, UUID.randomUUID(), request)
        );
    }
}
