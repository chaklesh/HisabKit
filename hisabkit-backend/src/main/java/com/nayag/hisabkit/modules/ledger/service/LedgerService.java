package com.nayag.hisabkit.modules.ledger.service;

import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import com.nayag.hisabkit.modules.audit.model.AuditLog;
import com.nayag.hisabkit.modules.audit.repository.AuditLogRepository;
import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.core.exception.BusinessValidationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final AttachmentRepository attachmentRepository;
    private final AuditLogRepository auditLogRepository;
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
        customer.setTenantId(tenantId);
        customer.setTotalBalance(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(UUID tenantId, UUID customerId, CreateCustomerRequest request) {
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        customer.setName(request.getName().trim());
        customer.setPhone(trimToNull(request.getPhone()));
        customer.setEmail(trimToNull(request.getEmail()));
        customer.setAddress(trimToNull(request.getAddress()));
        customer.setGstNumber(trimToNull(request.getGstNumber()));
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(UUID tenantId, UUID customerId) {
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<Transaction> txns = transactionRepository.findByTenantIdAndCustomerId(tenantId, customerId);
        for (Transaction txn : txns) {
            attachmentRepository.deleteAll(attachmentRepository.findByTransactionId(txn.getId()));
        }
        transactionRepository.deleteAll(txns);
        customerRepository.delete(customer);
        
        logAudit(tenantId, null, "CUSTOMER", customerId, "DELETE", Map.of("name", customer.getName()));
    }

    @Transactional
    public Map<String, Object> createTransaction(UUID tenantId, UUID createdByUserId, CreateTransactionRequest request) {
        Customer customer = customerRepository.findByIdAndTenantId(request.getCustomerId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        Transaction transaction = new Transaction();
        transaction.setReferenceNo("TXN-" + System.currentTimeMillis());
        transaction.setCustomerId(customer.getId());
        transaction.setCreatedByUserId(createdByUserId);
        transaction.setTenantId(tenantId);
        applyTransactionInput(transaction, request);

        Transaction saved = transactionRepository.save(transaction);
        Customer updated = recalculateAndSaveCustomerBalance(tenantId, customer.getId());

        logAudit(tenantId, createdByUserId, "TRANSACTION", saved.getId(), "CREATE", 
            Map.of("type", saved.getType(), "amount", saved.getTotalAmount().toString()));

        return Map.of("transaction", saved, "customer", updated);
    }

    @Transactional
    public Map<String, Object> updateTransaction(UUID tenantId, UUID transactionId, CreateTransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        
        customerRepository.findByIdAndTenantId(request.getCustomerId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        UUID previousCustomerId = transaction.getCustomerId();
        transaction.setCustomerId(request.getCustomerId());
        applyTransactionInput(transaction, request);
        
        Transaction updatedTransaction = transactionRepository.save(transaction);
        recalculateAndSaveCustomerBalance(tenantId, previousCustomerId);
        Customer updatedCustomer = recalculateAndSaveCustomerBalance(tenantId, request.getCustomerId());

        return Map.of("transaction", updatedTransaction, "customer", updatedCustomer);
    }

    @Transactional
    public Map<String, Object> deleteTransaction(UUID tenantId, UUID transactionId) {
        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        attachmentRepository.deleteAll(attachmentRepository.findByTenantIdAndTransactionIdOrderByUploadedAtDesc(tenantId, transactionId));
        transactionRepository.delete(transaction);
        Customer updatedCustomer = recalculateAndSaveCustomerBalance(tenantId, transaction.getCustomerId());

        logAudit(tenantId, null, "TRANSACTION", transactionId, "DELETE", 
            Map.of("customerId", transaction.getCustomerId().toString(), "amount", transaction.getTotalAmount().toString()));

        return Map.of("deleted", true, "customer", updatedCustomer);
    }

    public List<Transaction> getCustomerTransactions(UUID tenantId, UUID customerId) {
        return transactionRepository.findByTenantIdAndCustomerIdOrderByTimestampDesc(tenantId, customerId);
    }

    public Customer recalculateAndSaveCustomerBalance(UUID tenantId, UUID customerId) {
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        customer.setTotalBalance(amountOrZero(transactionRepository.calculateCustomerBalance(tenantId, customerId)));
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
                throw new BusinessValidationException("Paid amount cannot be greater than total amount");
            }
        } else {
            if (paid.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessValidationException("Payment amount must be greater than zero");
            }
            total = paid;
        }

        transaction.setType(normalizedType);
        transaction.setTotalAmount(total);
        transaction.setPaidAmount(paid);
        transaction.setDueAmount("SALE".equals(normalizedType) ? total.subtract(paid) : BigDecimal.ZERO);
        transaction.setDescription(trimToNull(request.getDescription()));
        transaction.setTimestamp(request.getTransactionDate() != null ? request.getTransactionDate().atTime(12, 0) : LocalDateTime.now());
    }

    private void logAudit(UUID tenantId, UUID userId, String entity, UUID entityId, String action, Map<String, String> details) {
        try {
            AuditLog log = new AuditLog();
            log.setTenantId(tenantId);
            log.setUserId(userId != null ? userId : UUID.fromString("00000000-0000-0000-0000-000000000000"));
            log.setEntityName(entity);
            log.setEntityId(entityId);
            log.setAction(action);
            try {
                log.setChanges(objectMapper.writeValueAsString(details));
            } catch (Exception e) {
                log.setChanges(details.toString());
            }
            auditLogRepository.save(log);
        } catch (Exception ignored) {}
    }

    private BigDecimal amountOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : value.setScale(2, RoundingMode.HALF_UP);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
