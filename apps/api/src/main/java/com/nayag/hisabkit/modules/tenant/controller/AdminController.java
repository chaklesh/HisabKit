package com.nayag.hisabkit.modules.tenant.controller;

import com.nayag.hisabkit.core.security.Roles;
import com.nayag.hisabkit.core.security.SecurityUtils;
import com.nayag.hisabkit.modules.audit.service.AuditService;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.service.IdentityService;
import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.service.LedgerService;
import com.nayag.hisabkit.modules.tenant.dto.CreateTenantRequest;
import com.nayag.hisabkit.modules.tenant.dto.UpdateTenantRequest;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.service.TenantService;
import jakarta.validation.Valid;
import java.util.*;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for platform administration, restricted to Super Admins. Delegating business
 * orchestration to module services and auditing to AuditService.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

  private final TenantService tenantService;
  private final LedgerService ledgerService;
  private final IdentityService identityService;
  private final AuditService auditService;

  @GetMapping("/tenants")
  public ResponseEntity<List<Tenant>> getAllTenants() {
    assertSuperAdmin();
    return ResponseEntity.ok(tenantService.getAllTenants());
  }

  @PostMapping("/tenants")
  public ResponseEntity<Map<String, Object>> createTenant(
      @Valid @RequestBody CreateTenantRequest request) {
    assertSuperAdmin();
    Tenant tenant = tenantService.createTenant(request);
    return ResponseEntity.ok(Map.of("tenant", tenant));
  }

  @PutMapping("/tenants/{tenantId}")
  public ResponseEntity<Tenant> updateTenant(
      @PathVariable UUID tenantId, @Valid @RequestBody UpdateTenantRequest request) {
    assertSuperAdmin();
    Tenant tenant = tenantService.updateTenant(tenantId, request);
    return ResponseEntity.ok(tenant);
  }

  @DeleteMapping("/tenants/{tenantId}")
  public ResponseEntity<Map<String, Object>> deleteTenant(@PathVariable UUID tenantId) {
    assertSuperAdmin();
    tenantService.deleteTenant(tenantId);
    return ResponseEntity.ok(Map.of("deleted", true));
  }

  @GetMapping("/customers")
  public ResponseEntity<List<Customer>> getCustomers(@RequestParam UUID tenantId) {
    assertSuperAdmin();
    return ResponseEntity.ok(ledgerService.getAllCustomers(tenantId));
  }

  @PostMapping("/customers")
  public ResponseEntity<Customer> createCustomer(
      @RequestParam UUID tenantId, @Valid @RequestBody CreateCustomerRequest request) {
    assertSuperAdmin();
    Customer customer = ledgerService.createCustomer(tenantId, request);
    return ResponseEntity.ok(customer);
  }

  @PutMapping("/customers/{customerId}")
  public ResponseEntity<Customer> updateCustomer(
      @PathVariable UUID customerId,
      @RequestParam UUID tenantId,
      @Valid @RequestBody CreateCustomerRequest request) {
    assertSuperAdmin();
    return ResponseEntity.ok(ledgerService.updateCustomer(tenantId, customerId, request));
  }

  @DeleteMapping("/customers/{customerId}")
  public ResponseEntity<Map<String, Object>> deleteCustomer(
      @PathVariable UUID customerId, @RequestParam UUID tenantId) {
    assertSuperAdmin();
    ledgerService.deleteCustomer(tenantId, customerId);
    return ResponseEntity.ok(Map.of("deleted", true));
  }

  @GetMapping("/transactions")
  public ResponseEntity<List<Transaction>> getTransactions(
      @RequestParam UUID tenantId, @RequestParam(required = false) UUID customerId) {
    assertSuperAdmin();
    if (customerId != null) {
      return ResponseEntity.ok(ledgerService.getCustomerTransactions(tenantId, customerId));
    }
    return ResponseEntity.ok(
        ledgerService.getAllCustomers(tenantId).stream()
            .flatMap(c -> ledgerService.getCustomerTransactions(tenantId, c.getId()).stream())
            .toList());
  }

  @PostMapping("/transactions")
  public ResponseEntity<Map<String, Object>> createTransaction(
      @RequestParam UUID tenantId, @Valid @RequestBody CreateTransactionRequest request) {
    assertSuperAdmin();
    User user = currentUserOrThrow();
    return ResponseEntity.ok(ledgerService.createTransaction(tenantId, user.getId(), request));
  }

  @PutMapping("/transactions/{transactionId}")
  public ResponseEntity<Map<String, Object>> updateTransaction(
      @PathVariable UUID transactionId,
      @RequestParam UUID tenantId,
      @Valid @RequestBody CreateTransactionRequest request) {
    assertSuperAdmin();
    return ResponseEntity.ok(ledgerService.updateTransaction(tenantId, transactionId, request));
  }

  @DeleteMapping("/transactions/{transactionId}")
  public ResponseEntity<Map<String, Object>> deleteTransaction(
      @PathVariable UUID transactionId, @RequestParam UUID tenantId) {
    assertSuperAdmin();
    return ResponseEntity.ok(ledgerService.deleteTransaction(tenantId, transactionId));
  }

  @GetMapping("/audit")
  public ResponseEntity<
          org.springframework.data.domain.Page<com.nayag.hisabkit.modules.audit.model.AuditLog>>
      getAuditLogs(
          @RequestParam(required = false) String search,
          @RequestParam(defaultValue = "0") int page,
          @RequestParam(defaultValue = "20") int size) {
    assertSuperAdmin();
    return ResponseEntity.ok(
        auditService.getGlobalLogs(
            search,
            org.springframework.data.domain.PageRequest.of(
                page, size, org.springframework.data.domain.Sort.by("timestamp").descending())));
  }

  @GetMapping("/audit/tenant/{tenantId}")
  public ResponseEntity<List<com.nayag.hisabkit.modules.audit.model.AuditLog>> getTenantAuditLogs(
      @PathVariable UUID tenantId) {
    assertSuperAdmin();
    return ResponseEntity.ok(auditService.getTenantLogs(tenantId));
  }

  private User currentUserOrThrow() {
    String username = SecurityUtils.currentUsername();
    if (username == null || username.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context missing");
    }
    return identityService.findByUsername(username);
  }

  private void assertSuperAdmin() {
    if (!SecurityUtils.hasRole(Roles.SUPER_ADMIN)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
    }
  }
}
