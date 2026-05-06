package com.nayag.hisabkit.modules.ledger.controller;

import com.nayag.hisabkit.core.config.tenant.TenantContext;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.dto.LedgerSummaryResponse;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.model.Transaction;
import com.nayag.hisabkit.modules.ledger.service.LedgerService;
import com.nayag.hisabkit.modules.storage.model.Attachment;
import com.nayag.hisabkit.modules.storage.service.AttachmentStorageService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

  private final LedgerService ledgerService;
  private final AttachmentStorageService storageService;
  private final com.nayag.hisabkit.modules.identity.service.IdentityService identityService;

  @GetMapping("/customers")
  public ResponseEntity<List<Customer>> getAllCustomers() {
    return ResponseEntity.ok(ledgerService.getAllCustomers(getTenantIdOrThrow()));
  }

  @PostMapping("/customers")
  public ResponseEntity<Customer> createCustomer(
      @Valid @RequestBody CreateCustomerRequest request) {
    return ResponseEntity.ok(ledgerService.createCustomer(getTenantIdOrThrow(), request));
  }

  @PutMapping("/customers/{customerId}")
  public ResponseEntity<Customer> updateCustomer(
      @PathVariable UUID customerId, @Valid @RequestBody CreateCustomerRequest request) {
    return ResponseEntity.ok(
        ledgerService.updateCustomer(getTenantIdOrThrow(), customerId, request));
  }

  @DeleteMapping("/customers/{customerId}")
  public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable UUID customerId) {
    ledgerService.deleteCustomer(getTenantIdOrThrow(), customerId);
    return ResponseEntity.ok(Map.of("deleted", true, "customerId", customerId));
  }

  @GetMapping("/customers/{customerId}/transactions")
  public ResponseEntity<List<Transaction>> getCustomerTransactions(
      @PathVariable UUID customerId,
      @RequestParam(required = false)
          @org.springframework.format.annotation.DateTimeFormat(
              iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
          java.time.LocalDate from,
      @RequestParam(required = false)
          @org.springframework.format.annotation.DateTimeFormat(
              iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
          java.time.LocalDate to) {
    UUID tenantId = getTenantIdOrThrow();
    if (from != null && to != null) {
      return ResponseEntity.ok(
          ledgerService.getCustomerTransactionsBetween(
              tenantId, customerId, from.atStartOfDay(), to.atTime(23, 59, 59)));
    }
    return ResponseEntity.ok(ledgerService.getCustomerTransactions(tenantId, customerId));
  }

  @PostMapping("/transactions")
  public ResponseEntity<Map<String, Object>> createTransaction(
      @Valid @RequestBody CreateTransactionRequest request) {
    User user = currentUserOrThrow();
    return ResponseEntity.ok(
        ledgerService.createTransaction(getTenantIdOrThrow(), user.getId(), request));
  }

  @PutMapping("/transactions/{transactionId}")
  public ResponseEntity<Map<String, Object>> updateTransaction(
      @PathVariable UUID transactionId, @Valid @RequestBody CreateTransactionRequest request) {
    return ResponseEntity.ok(
        ledgerService.updateTransaction(getTenantIdOrThrow(), transactionId, request));
  }

  @DeleteMapping("/transactions/{transactionId}")
  public ResponseEntity<Map<String, Object>> deleteTransaction(@PathVariable UUID transactionId) {
    return ResponseEntity.ok(ledgerService.deleteTransaction(getTenantIdOrThrow(), transactionId));
  }

  @PostMapping(
      value = "/transactions/{transactionId}/attachments",
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Attachment> uploadAttachment(
      @PathVariable UUID transactionId, @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(
        storageService.uploadAttachment(getTenantIdOrThrow(), transactionId, file));
  }

  @GetMapping("/transactions/{transactionId}/attachments")
  public ResponseEntity<List<Attachment>> listAttachments(@PathVariable UUID transactionId) {
    return ResponseEntity.ok(storageService.listAttachments(getTenantIdOrThrow(), transactionId));
  }

  @DeleteMapping("/attachments/{attachmentId}")
  public ResponseEntity<Map<String, Object>> deleteAttachment(@PathVariable UUID attachmentId) {
    storageService.deleteAttachment(getTenantIdOrThrow(), attachmentId);
    return ResponseEntity.ok(Map.of("deleted", true, "attachmentId", attachmentId));
  }

  @GetMapping("/attachments/{attachmentId}/content")
  public ResponseEntity<Resource> getAttachmentContent(@PathVariable UUID attachmentId) {
    UUID tenantId = getTenantIdOrThrow();
    Attachment attachment = storageService.getAttachmentDetails(tenantId, attachmentId);
    Resource resource = storageService.loadAsResource(attachment);

    return ResponseEntity.ok()
        .header(
            HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.inline().filename(attachment.getFileName()).build().toString())
        .body(resource);
  }

  @GetMapping("/summary")
  public ResponseEntity<LedgerSummaryResponse> getSummary() {
    try {
      return ResponseEntity.ok(ledgerService.getLedgerSummary(getTenantIdOrThrow()));
    } catch (Exception e) {
      System.err.println("Error in getSummary: " + e.getMessage());
      e.printStackTrace();
      throw e;
    }
  }

  private UUID getTenantIdOrThrow() {
    String tenantId = TenantContext.getCurrentTenant();
    if (tenantId == null || tenantId.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Tenant context missing (X-TenantID header required)");
    }
    if ("GLOBAL".equalsIgnoreCase(tenantId)) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "A specific Tenant ID is required for this operation, but 'GLOBAL' was provided.");
    }
    try {
      return UUID.fromString(tenantId);
    } catch (IllegalArgumentException ex) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Invalid tenant context format (must be a valid UUID): " + tenantId);
    }
  }

  private User currentUserOrThrow() {
    String username =
        org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication()
                != null
            ? org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication()
                .getName()
            : null;

    if (username == null || username.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context missing");
    }

    return identityService.findByUsername(username);
  }
}
