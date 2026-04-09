package com.nayag.hisabkit.controller;

import com.nayag.hisabkit.config.tenant.TenantContext;
import com.nayag.hisabkit.dto.CreateCustomerRequest;
import com.nayag.hisabkit.dto.CreateTransactionRequest;
import com.nayag.hisabkit.model.Attachment;
import com.nayag.hisabkit.model.Customer;
import com.nayag.hisabkit.model.Tenant;
import com.nayag.hisabkit.model.Transaction;
import com.nayag.hisabkit.model.User;
import com.nayag.hisabkit.repository.AttachmentRepository;
import com.nayag.hisabkit.repository.CustomerRepository;
import com.nayag.hisabkit.repository.TenantRepository;
import com.nayag.hisabkit.repository.TransactionRepository;
import com.nayag.hisabkit.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AttachmentRepository attachmentRepository;
    private final TenantRepository tenantRepository;

    @Value("${hisabkit.upload.dir:./uploads}")
    private String uploadDir;

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getAllCustomers() {
        UUID tenantId = currentTenantId();
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context missing");
        }
        return ResponseEntity.ok(customerRepository.findByTenantIdOrderByCreatedAtDesc(tenantId));
    }

    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        UUID tenantId = currentTenantId();
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context missing");
        }

        Customer customer = new Customer();
        customer.setName(request.getName().trim());
        customer.setPhone(trimToNull(request.getPhone()));
        customer.setEmail(trimToNull(request.getEmail()));
        customer.setAddress(trimToNull(request.getAddress()));
        customer.setGstNumber(trimToNull(request.getGstNumber()));
        customer.setTenantId(tenantId);
        customer.setTotalBalance(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/customers/{customerId}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable UUID customerId, @Valid @RequestBody CreateCustomerRequest request) {
        UUID tenantId = currentTenantId();
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantIdOrThrow(tenantId))
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
    public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable UUID customerId) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        List<Transaction> txns = transactionRepository.findByTenantIdAndCustomerId(tenantId, customerId);
        for (Transaction txn : txns) {
            attachmentRepository.deleteAll(attachmentRepository.findByTenantIdAndTransactionIdOrderByUploadedAtDesc(tenantId, txn.getId()));
        }
        transactionRepository.deleteAll(txns);
        customerRepository.delete(customer);

        return ResponseEntity.ok(Map.of("deleted", true, "customerId", customerId));
    }

    @GetMapping("/customers/{customerId}/transactions")
    public ResponseEntity<List<Transaction>> getCustomerTransactions(@PathVariable UUID customerId) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return ResponseEntity.ok(transactionRepository.findByTenantIdAndCustomerIdOrderByTimestampDesc(tenantId, customerId));
    }

    @PostMapping("/transactions")
    @Transactional
    public ResponseEntity<Map<String, Object>> createTransaction(@Valid @RequestBody CreateTransactionRequest request) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Customer customer = customerRepository.findByIdAndTenantId(request.getCustomerId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        User user = currentUserOrThrow();

        Transaction transaction = new Transaction();
        transaction.setReferenceNo("TXN-" + System.currentTimeMillis());
        transaction.setCustomerId(customer.getId());
        transaction.setCreatedByUserId(user.getId());
        transaction.setTenantId(tenantId);
        applyTransactionInput(transaction, request);

        Transaction saved = transactionRepository.save(transaction);
        Customer updated = recalculateAndSaveCustomerBalance(tenantId, customer.getId());

        return ResponseEntity.ok(Map.of("transaction", saved, "customer", updated));
    }

    @PutMapping("/transactions/{transactionId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateTransaction(
            @PathVariable UUID transactionId,
            @Valid @RequestBody CreateTransactionRequest request
    ) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        customerRepository.findByIdAndTenantId(request.getCustomerId(), tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        UUID previousCustomerId = transaction.getCustomerId();
        transaction.setCustomerId(request.getCustomerId());
        applyTransactionInput(transaction, request);
        Transaction updatedTransaction = transactionRepository.save(transaction);

        recalculateAndSaveCustomerBalance(tenantId, previousCustomerId);
        Customer updatedCustomer = recalculateAndSaveCustomerBalance(tenantId, request.getCustomerId());

        return ResponseEntity.ok(Map.of("transaction", updatedTransaction, "customer", updatedCustomer));
    }

    @DeleteMapping("/transactions/{transactionId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> deleteTransaction(@PathVariable UUID transactionId) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        attachmentRepository.deleteAll(attachmentRepository.findByTenantIdAndTransactionIdOrderByUploadedAtDesc(tenantId, transactionId));
        transactionRepository.delete(transaction);
        Customer updatedCustomer = recalculateAndSaveCustomerBalance(tenantId, transaction.getCustomerId());

        return ResponseEntity.ok(Map.of("deleted", true, "customer", updatedCustomer));
    }

    @PostMapping(value = "/transactions/{transactionId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<Attachment> uploadAttachment(
            @PathVariable UUID transactionId,
            @RequestParam("file") MultipartFile file
    ) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment file is required");
        }

        Transaction transaction = transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

        purgeExpiredAttachments(tenantId);
        long fileSize = file.getSize();
        long maxFileSize = mbToBytes(defaultInt(tenant.getMaxAttachmentFileSizeMb(), 10));
        if (fileSize > maxFileSize) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment file exceeds configured max size");
        }

        long usedStorage = attachmentRepository.totalStorageUsedByTenant(tenantId);
        long quotaLimit = mbToBytes(defaultInt(tenant.getAttachmentQuotaMb(), 100));
        if (usedStorage + fileSize > quotaLimit) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachment quota exceeded for tenant");
        }

        try {
            Path baseDir = Path.of(uploadDir, tenantId.toString(), "transactions", transaction.getId().toString());
            Files.createDirectories(baseDir);

            String originalName = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "attachment";
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = System.currentTimeMillis() + "-" + safeName;
            Path target = baseDir.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            Attachment attachment = new Attachment();
            attachment.setTransactionId(transactionId);
            attachment.setTenantId(tenantId);
            attachment.setFileName(originalName);
            attachment.setFileType(trimToNull(file.getContentType()));
            attachment.setFileUrl(target.toString().replace("\\", "/"));
            attachment.setFileSizeBytes(fileSize);
            attachment.setExpiresAt(LocalDateTime.now().plusDays(defaultInt(tenant.getAttachmentRetentionDays(), 365)));

            return ResponseEntity.ok(attachmentRepository.save(attachment));
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save attachment", ex);
        }
    }

    @GetMapping("/transactions/{transactionId}/attachments")
    public ResponseEntity<List<Attachment>> listAttachments(@PathVariable UUID transactionId) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        transactionRepository.findByIdAndTenantId(transactionId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        return ResponseEntity.ok(attachmentRepository.findByTenantIdAndTransactionIdOrderByUploadedAtDesc(tenantId, transactionId));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Map<String, Object>> deleteAttachment(@PathVariable UUID attachmentId) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Attachment attachment = attachmentRepository.findByIdAndTenantId(attachmentId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));
        deleteAttachmentFileIfPresent(attachment);
        attachmentRepository.delete(attachment);
        return ResponseEntity.ok(Map.of("deleted", true, "attachmentId", attachmentId));
    }

    @GetMapping("/customers/{customerId}/statement")
    public ResponseEntity<Map<String, Object>> getCustomerStatement(
            @PathVariable UUID customerId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        LocalDateTime fromTs = from != null ? from.atStartOfDay() : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime toTs = to != null ? to.atTime(23, 59, 59) : LocalDateTime.now();

        List<Transaction> transactions = transactionRepository.findByTenantIdAndCustomerIdAndTimestampBetweenOrderByTimestampAsc(
                tenantId,
                customerId,
                fromTs,
                toTs
        );

        BigDecimal opening = amountOrZero(transactionRepository.calculateCustomerBalanceBefore(tenantId, customerId, fromTs));
        BigDecimal netChange = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalSales = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPayments = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (Transaction txn : transactions) {
            if ("SALE".equalsIgnoreCase(txn.getType())) {
                netChange = netChange.add(amountOrZero(txn.getDueAmount()));
                totalSales = totalSales.add(amountOrZero(txn.getTotalAmount()));
            } else {
                netChange = netChange.subtract(amountOrZero(txn.getPaidAmount()));
                totalPayments = totalPayments.add(amountOrZero(txn.getPaidAmount()));
            }
        }

        BigDecimal closing = opening.add(netChange).setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("customer", customer);
        response.put("from", fromTs.toLocalDate().toString());
        response.put("to", toTs.toLocalDate().toString());
        response.put("openingBalance", opening);
        response.put("closingBalance", closing);
        response.put("totalSales", totalSales);
        response.put("totalPayments", totalPayments);
        response.put("transactions", transactions);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customers/{customerId}/statement/export")
    public ResponseEntity<byte[]> exportCustomerStatementCsv(
            @PathVariable UUID customerId,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        LocalDateTime fromTs = from != null ? from.atStartOfDay() : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime toTs = to != null ? to.atTime(23, 59, 59) : LocalDateTime.now();

        List<Transaction> transactions = transactionRepository.findByTenantIdAndCustomerIdAndTimestampBetweenOrderByTimestampAsc(
                tenantId,
                customerId,
                fromTs,
                toTs
        );

        StringBuilder csv = new StringBuilder();
        csv.append("Date,Reference,Type,TotalAmount,PaidAmount,DueAmount,Description\n");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Transaction txn : transactions) {
            csv.append(txn.getTimestamp().format(formatter)).append(",")
                    .append(csvValue(txn.getReferenceNo())).append(",")
                    .append(csvValue(txn.getType())).append(",")
                    .append(amountOrZero(txn.getTotalAmount())).append(",")
                    .append(amountOrZero(txn.getPaidAmount())).append(",")
                    .append(amountOrZero(txn.getDueAmount())).append(",")
                    .append(csvValue(txn.getDescription()))
                    .append("\n");
        }

        String filename = "statement-" + customerId + "-" + LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                .body(csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getLedgerSummary(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to
    ) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        LocalDateTime fromTs = from != null ? from.atStartOfDay() : LocalDateTime.of(1970, 1, 1, 0, 0);
        LocalDateTime toTs = to != null ? to.atTime(23, 59, 59) : LocalDateTime.now();

        List<Transaction> transactions = transactionRepository.findByTenantIdOrderByTimestampDesc(tenantId)
                .stream()
                .filter(txn -> !txn.getTimestamp().isBefore(fromTs) && !txn.getTimestamp().isAfter(toTs))
                .toList();

        BigDecimal totalSales = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPayments = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal outstanding = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (Transaction txn : transactions) {
            if ("SALE".equalsIgnoreCase(txn.getType())) {
                totalSales = totalSales.add(amountOrZero(txn.getTotalAmount()));
                outstanding = outstanding.add(amountOrZero(txn.getDueAmount()));
            } else {
                totalPayments = totalPayments.add(amountOrZero(txn.getPaidAmount()));
            }
        }

        return ResponseEntity.ok(Map.of(
                "from", fromTs.toLocalDate().toString(),
                "to", toTs.toLocalDate().toString(),
                "transactionCount", transactions.size(),
                "totalSales", totalSales,
                "totalPayments", totalPayments,
                "outstandingDue", outstanding
        ));
    }

    @GetMapping("/attachments/{attachmentId}/content")
    public ResponseEntity<Resource> getAttachmentContent(@PathVariable UUID attachmentId) {
        UUID tenantId = tenantIdOrThrow(currentTenantId());
        Attachment attachment = attachmentRepository.findByIdAndTenantId(attachmentId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        Path filePath = Path.of(attachment.getFileUrl()).normalize().toAbsolutePath();
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment file not found");
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            String mimeType = StringUtils.hasText(attachment.getFileType())
                    ? attachment.getFileType()
                    : Files.probeContentType(filePath);
            MediaType mediaType;
            try {
                mediaType = StringUtils.hasText(mimeType)
                        ? MediaType.parseMediaType(mimeType)
                        : MediaType.APPLICATION_OCTET_STREAM;
            } catch (Exception ignored) {
                mediaType = guessMediaTypeFromName(attachment.getFileName());
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(attachment.getFileName()).build().toString())
                    .body(resource);
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to load attachment", ex);
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to detect attachment type", ex);
        }
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
        LocalDateTime transactionTimestamp = request.getTransactionDate() != null
                ? request.getTransactionDate().atTime(12, 0)
                : LocalDateTime.now();

        transaction.setType(normalizedType);
        transaction.setTotalAmount(total);
        transaction.setPaidAmount(paid);
        transaction.setDueAmount(due);
        transaction.setDescription(trimToNull(request.getDescription()));
        transaction.setTimestamp(transactionTimestamp);
    }

    private Customer recalculateAndSaveCustomerBalance(UUID tenantId, UUID customerId) {
        Customer customer = customerRepository.findByIdAndTenantId(customerId, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setTotalBalance(amountOrZero(transactionRepository.calculateCustomerBalance(tenantId, customerId)));
        return customerRepository.save(customer);
    }

    private UUID currentTenantId() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null || tenantId.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(tenantId);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private UUID tenantIdOrThrow(UUID tenantId) {
        if (tenantId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context missing");
        }
        return tenantId;
    }

    private User currentUserOrThrow() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication() != null
                ? org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName()
                : null;

        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context missing");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private BigDecimal amountOrZero(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private MediaType guessMediaTypeFromName(String fileName) {
        if (!StringUtils.hasText(fileName)) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (lower.endsWith(".webp")) return MediaType.valueOf("image/webp");
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private int defaultInt(Integer value, int fallback) {
        if (value == null || value <= 0) {
            return fallback;
        }
        return value;
    }

    private long mbToBytes(int valueMb) {
        return valueMb * 1024L * 1024L;
    }

    private void purgeExpiredAttachments(UUID tenantId) {
        List<Attachment> expired = attachmentRepository.findByTenantIdAndExpiresAtBefore(tenantId, LocalDateTime.now());
        for (Attachment attachment : expired) {
            deleteAttachmentFileIfPresent(attachment);
        }
        attachmentRepository.deleteAll(expired);
    }

    private void deleteAttachmentFileIfPresent(Attachment attachment) {
        try {
            if (attachment.getFileUrl() == null || attachment.getFileUrl().isBlank()) {
                return;
            }
            Path path = Path.of(attachment.getFileUrl()).normalize().toAbsolutePath();
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (Exception ignored) {
            // The database record is the source of truth even if filesystem cleanup fails.
        }
    }

    private String csvValue(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
