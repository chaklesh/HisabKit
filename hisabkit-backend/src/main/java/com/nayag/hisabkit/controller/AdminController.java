package com.nayag.hisabkit.controller;

import com.nayag.hisabkit.dto.CreateCustomerRequest;
import com.nayag.hisabkit.dto.CreateTransactionRequest;
import com.nayag.hisabkit.model.Customer;
import com.nayag.hisabkit.model.Tenant;
import com.nayag.hisabkit.model.Transaction;
import com.nayag.hisabkit.model.User;
import com.nayag.hisabkit.repository.AttachmentRepository;
import com.nayag.hisabkit.repository.CustomerRepository;
import com.nayag.hisabkit.repository.TenantRepository;
import com.nayag.hisabkit.repository.TransactionRepository;
import com.nayag.hisabkit.repository.UserRepository;
import com.nayag.hisabkit.security.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final AttachmentRepository attachmentRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/tenants")
    public ResponseEntity<List<Tenant>> getAllTenants() {
        assertSuperAdmin();
        return ResponseEntity.ok(tenantRepository.findAll());
    }

    @PostMapping("/tenants")
    @Transactional
    public ResponseEntity<Map<String, Object>> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        assertSuperAdmin();
        if (tenantRepository.findBySlug(request.getSlug().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant slug already exists");
        }
        if (userRepository.findByUsername(request.getAdminUsername().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin username already exists");
        }

        Tenant tenant = Tenant.builder()
                .name(request.getName().trim())
                .slug(request.getSlug().trim())
                .businessType(trimToNull(request.getBusinessType()))
                .ownerName(trimToNull(request.getOwnerName()))
                .businessPhone(trimToNull(request.getBusinessPhone()))
                .businessEmail(trimToNull(request.getBusinessEmail()))
                .businessAddress(trimToNull(request.getBusinessAddress()))
                .gstNumber(trimToNull(request.getGstNumber()))
                .logoUrl(trimToNull(request.getLogoUrl()))
                .smsTemplate(defaultValue(request.getSmsTemplate(), "Hi {{customerName}}, your balance is {{balance}} ({{balanceType}}) with {{businessName}}."))
                .whatsappTemplate(defaultValue(request.getWhatsappTemplate(), "Hi {{customerName}}, this is a reminder from {{businessName}}. Your balance is {{balance}} ({{balanceType}})."))
                .status(defaultValue(request.getStatus(), "ACTIVE"))
                .build();
        tenant = tenantRepository.save(tenant);

        User adminUser = User.builder()
                .username(request.getAdminUsername().trim())
                .email(trimToNull(request.getAdminEmail()))
                .mobile(trimToNull(request.getAdminMobile()))
                .passwordHash(passwordEncoder.encode(request.getAdminPassword()))
                .role("ADMIN")
                .tenant(tenant)
                .isActive(true)
                .build();
        adminUser = userRepository.save(adminUser);

        return ResponseEntity.ok(Map.of("tenant", tenant, "adminUser", adminUser));
    }

    @PutMapping("/tenants/{tenantId}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable UUID tenantId, @Valid @RequestBody UpdateTenantRequest request) {
        assertSuperAdmin();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));
        applyTenantUpdate(tenant, request);
        return ResponseEntity.ok(tenantRepository.save(tenant));
    }

    @DeleteMapping("/tenants/{tenantId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteTenant(@PathVariable UUID tenantId) {
        assertSuperAdmin();
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        List<Customer> customers = customerRepository.findByTenantId(tenantId);
        for (Customer customer : customers) {
            List<Transaction> txns = transactionRepository.findByTenantIdAndCustomerId(tenantId, customer.getId());
            for (Transaction txn : txns) {
                attachmentRepository.deleteAll(attachmentRepository.findByTransactionId(txn.getId()));
            }
            transactionRepository.deleteAll(txns);
        }
        customerRepository.deleteAll(customers);

        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getTenant() != null && tenantId.equals(user.getTenant().getId()))
                .toList();
        userRepository.deleteAll(users);
        tenantRepository.delete(tenant);

        return ResponseEntity.ok(Map.of("deleted", true, "tenantId", tenantId));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getCustomers(@RequestParam UUID tenantId) {
        assertSuperAdmin();
        return ResponseEntity.ok(customerRepository.findByTenantIdOrderByCreatedAtDesc(tenantId));
    }

    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(
            @RequestParam UUID tenantId,
            @Valid @RequestBody CreateCustomerRequest request
    ) {
        assertSuperAdmin();
        tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        Customer customer = new Customer();
        customer.setTenantId(tenantId);
        customer.setName(request.getName().trim());
        customer.setPhone(trimToNull(request.getPhone()));
        customer.setEmail(trimToNull(request.getEmail()));
        customer.setAddress(trimToNull(request.getAddress()));
        customer.setGstNumber(trimToNull(request.getGstNumber()));
        customer.setTotalBalance(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/customers/{customerId}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable UUID customerId,
            @RequestParam UUID tenantId,
            @Valid @RequestBody CreateCustomerRequest request
    ) {
        assertSuperAdmin();
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setName(request.getName().trim());
        customer.setPhone(trimToNull(request.getPhone()));
        customer.setEmail(trimToNull(request.getEmail()));
        customer.setAddress(trimToNull(request.getAddress()));
        customer.setGstNumber(trimToNull(request.getGstNumber()));
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @DeleteMapping("/customers/{customerId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteCustomer(
            @PathVariable UUID customerId,
            @RequestParam UUID tenantId
    ) {
        assertSuperAdmin();
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        List<Transaction> txns = transactionRepository.findByTenantIdAndCustomerId(tenantId, customerId);
        for (Transaction txn : txns) {
            attachmentRepository.deleteAll(attachmentRepository.findByTransactionId(txn.getId()));
        }
        transactionRepository.deleteAll(txns);
        customerRepository.delete(customer);

        return ResponseEntity.ok(Map.of("deleted", true, "customerId", customerId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam UUID tenantId,
            @RequestParam(required = false) UUID customerId
    ) {
        assertSuperAdmin();
        if (customerId != null) {
            return ResponseEntity.ok(transactionRepository.findByTenantIdAndCustomerIdOrderByTimestampDesc(tenantId, customerId));
        }
        return ResponseEntity.ok(transactionRepository.findByTenantIdOrderByTimestampDesc(tenantId));
    }

    @PostMapping("/transactions")
    @Transactional
    public ResponseEntity<Map<String, Object>> createTransaction(
            @RequestParam UUID tenantId,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        assertSuperAdmin();
        tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));
        customerRepository.findByIdAndTenantId(request.getCustomerId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        Transaction transaction = new Transaction();
        transaction.setReferenceNo("TXN-" + System.currentTimeMillis());
        transaction.setCustomerId(request.getCustomerId());
        transaction.setTenantId(tenantId);
        applyTransactionInput(transaction, request);
        Transaction saved = transactionRepository.save(transaction);

        Customer customer = recalculateAndSaveCustomerBalance(tenantId, request.getCustomerId());
        return ResponseEntity.ok(Map.of("transaction", saved, "customer", customer));
    }

    @PutMapping("/transactions/{transactionId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateTransaction(
            @PathVariable UUID transactionId,
            @RequestParam UUID tenantId,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        assertSuperAdmin();
        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        customerRepository.findByIdAndTenantId(request.getCustomerId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        UUID previousCustomer = transaction.getCustomerId();
        transaction.setCustomerId(request.getCustomerId());
        applyTransactionInput(transaction, request);
        Transaction updatedTransaction = transactionRepository.save(transaction);

        Customer previous = recalculateAndSaveCustomerBalance(tenantId, previousCustomer);
        Customer current = recalculateAndSaveCustomerBalance(tenantId, request.getCustomerId());

        return ResponseEntity.ok(Map.of("transaction", updatedTransaction, "previousCustomer", previous, "customer", current));
    }

    @DeleteMapping("/transactions/{transactionId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteTransaction(
            @PathVariable UUID transactionId,
            @RequestParam UUID tenantId
    ) {
        assertSuperAdmin();
        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        attachmentRepository.deleteAll(attachmentRepository.findByTransactionId(transactionId));
        transactionRepository.delete(transaction);
        Customer customer = recalculateAndSaveCustomerBalance(tenantId, transaction.getCustomerId());
        return ResponseEntity.ok(Map.of("deleted", true, "customer", customer));
    }

    private void assertSuperAdmin() {
        if (!SecurityUtils.hasRole("SUPER_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
        }
    }

    private Customer recalculateAndSaveCustomerBalance(UUID tenantId, UUID customerId) {
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        BigDecimal calculated = transactionRepository.calculateCustomerBalance(tenantId, customerId);
        customer.setTotalBalance(amountOrZero(calculated));
        return customerRepository.save(customer);
    }

    private void applyTransactionInput(Transaction transaction, CreateTransactionRequest request) {
        String normalizedType = request.getType().trim().toUpperCase(Locale.ROOT);
        if (!"SALE".equals(normalizedType) && !"PAYMENT".equals(normalizedType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be SALE or PAYMENT");
        }

        BigDecimal total = amountOrZero(request.getTotalAmount());
        BigDecimal paid = amountOrZero(request.getPaidAmount());
        if ("SALE".equals(normalizedType)) {
            if (total.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sale total amount must be greater than zero");
            }
            if (paid.compareTo(total) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid amount cannot be greater than total amount");
            }
        } else {
            if (paid.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount must be greater than zero");
            }
            total = paid;
        }

        BigDecimal due = "SALE".equals(normalizedType) ? total.subtract(paid) : BigDecimal.ZERO;
        LocalDateTime ts = request.getTransactionDate() != null ? request.getTransactionDate().atTime(12, 0) : LocalDateTime.now();

        transaction.setType(normalizedType);
        transaction.setTotalAmount(total);
        transaction.setPaidAmount(paid);
        transaction.setDueAmount(due);
        transaction.setDescription(trimToNull(request.getDescription()));
        transaction.setTimestamp(ts);
    }

    private BigDecimal amountOrZero(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String defaultValue(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private void applyTenantUpdate(Tenant tenant, UpdateTenantRequest request) {
        tenant.setName(request.getName().trim());
        tenant.setBusinessType(trimToNull(request.getBusinessType()));
        tenant.setOwnerName(trimToNull(request.getOwnerName()));
        tenant.setBusinessPhone(trimToNull(request.getBusinessPhone()));
        tenant.setBusinessEmail(trimToNull(request.getBusinessEmail()));
        tenant.setBusinessAddress(trimToNull(request.getBusinessAddress()));
        tenant.setGstNumber(trimToNull(request.getGstNumber()));
        tenant.setLogoUrl(trimToNull(request.getLogoUrl()));
        tenant.setSmsTemplate(trimToNull(request.getSmsTemplate()));
        tenant.setWhatsappTemplate(trimToNull(request.getWhatsappTemplate()));
        tenant.setStatus(defaultValue(request.getStatus(), "ACTIVE"));
    }

    @Data
    public static class CreateTenantRequest {
        @NotBlank
        private String name;
        @NotBlank
        private String slug;
        private String businessType;
        private String ownerName;
        private String businessPhone;
        private String businessEmail;
        private String businessAddress;
        private String gstNumber;
        private String logoUrl;
        private String smsTemplate;
        private String whatsappTemplate;
        private String status;
        @NotBlank
        private String adminUsername;
        @NotBlank
        private String adminPassword;
        private String adminEmail;
        private String adminMobile;
    }

    @Data
    public static class UpdateTenantRequest {
        @NotBlank
        private String name;
        private String businessType;
        private String ownerName;
        private String businessPhone;
        private String businessEmail;
        private String businessAddress;
        private String gstNumber;
        private String logoUrl;
        private String smsTemplate;
        private String whatsappTemplate;
        private String status;
    }
}
