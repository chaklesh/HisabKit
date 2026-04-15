package com.nayag.hisabkit.modules.tenant.controller;

import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.service.TenantService;
import com.nayag.hisabkit.modules.ledger.service.LedgerService;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.audit.model.AuditLog;
import com.nayag.hisabkit.modules.audit.repository.AuditLogRepository;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.core.security.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.nayag.hisabkit.core.security.Roles;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TenantService tenantService;
    private final LedgerService ledgerService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @GetMapping("/tenants")
    public ResponseEntity<List<Tenant>> getAllTenants() {
        assertSuperAdmin();
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @PostMapping("/tenants")
    public ResponseEntity<Map<String, Object>> createTenant(@Valid @RequestBody CreateTenantRequest request) {
        assertSuperAdmin();
        Tenant tenant = tenantService.createTenant(request);
        logAdminMutation("TENANT", tenant.getId(), "CREATE", tenant.getId(), Map.of("slug", tenant.getSlug()));
        return ResponseEntity.ok(Map.of("tenant", tenant));
    }

    @PutMapping("/tenants/{tenantId}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable UUID tenantId, @Valid @RequestBody UpdateTenantRequest request) {
        assertSuperAdmin();
        Tenant tenant = tenantService.updateTenant(tenantId, request);
        logAdminMutation("TENANT", tenant.getId(), "UPDATE", tenant.getId(), Map.of("name", tenant.getName()));
        return ResponseEntity.ok(tenant);
    }

    @DeleteMapping("/tenants/{tenantId}")
    public ResponseEntity<Map<String, Object>> deleteTenant(@PathVariable UUID tenantId) {
        assertSuperAdmin();
        tenantService.deleteTenant(tenantId);
        logAdminMutation("TENANT", tenantId, "DELETE", tenantId, Map.of("id", tenantId));
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getCustomers(@RequestParam UUID tenantId) {
        assertSuperAdmin();
        return ResponseEntity.ok(ledgerService.getAllCustomers(tenantId));
    }

    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(@RequestParam UUID tenantId, @Valid @RequestBody CreateCustomerRequest request) {
        assertSuperAdmin();
        Customer customer = ledgerService.createCustomer(tenantId, request);
        logAdminMutation("CUSTOMER", customer.getId(), "CREATE", tenantId, Map.of("name", customer.getName()));
        return ResponseEntity.ok(customer);
    }

    @DeleteMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable UUID customerId, @RequestParam UUID tenantId) {
        assertSuperAdmin();
        ledgerService.deleteCustomer(tenantId, customerId);
        logAdminMutation("CUSTOMER", customerId, "DELETE", tenantId, Map.of("id", customerId));
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestParam UUID tenantId, @RequestParam(required = false) UUID customerId) {
        assertSuperAdmin();
        if (customerId != null) {
            return ResponseEntity.ok(ledgerService.getCustomerTransactions(tenantId, customerId));
        }
        return ResponseEntity.ok(new ArrayList<>()); // Support generic list if needed
    }

    private void assertSuperAdmin() {
        if (!SecurityUtils.hasRole(Roles.SUPER_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
        }
    }

    private void logAdminMutation(String entityName, UUID entityId, String action, UUID tenantId, Map<String, Object> changes) {
        try {
            String username = SecurityUtils.currentUsername();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) return;

            AuditLog log = new AuditLog();
            log.setEntityName(entityName);
            log.setEntityId(entityId);
            log.setAction(action);
            log.setTenantId(tenantId);
            log.setUserId(user.getId());
            try {
                log.setChanges(objectMapper.writeValueAsString(changes));
            } catch (Exception e) {
                log.setChanges(changes.toString());
            }
            auditLogRepository.save(log);
        } catch (Exception ignored) {}
    }

    @Data
    public static class CreateTenantRequest {
        @NotBlank private String name;
        @NotBlank private String slug;
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
        private Integer attachmentQuotaMb;
        private Integer maxAttachmentFileSizeMb;
        private Integer attachmentRetentionDays;
        @NotBlank private String adminUsername;
        @NotBlank private String adminPassword;
        private String adminEmail;
        private String adminMobile;
    }

    @Data
    public static class UpdateTenantRequest {
        @NotBlank private String name;
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
        private Integer attachmentQuotaMb;
        private Integer maxAttachmentFileSizeMb;
        private Integer attachmentRetentionDays;
    }
}
