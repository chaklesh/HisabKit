package com.nayag.hisabkit.modules.tenant.service;

import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.core.exception.BusinessValidationException;
import com.nayag.hisabkit.modules.tenant.controller.AdminController.CreateTenantRequest;
import com.nayag.hisabkit.modules.tenant.controller.AdminController.UpdateTenantRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final AttachmentRepository attachmentRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
    }

    @Transactional
    public Tenant createTenant(CreateTenantRequest request) {
        if (tenantRepository.findBySlug(request.getSlug().trim()).isPresent()) {
            throw new BusinessValidationException("Tenant slug already exists");
        }
        if (userRepository.findByUsername(request.getAdminUsername().trim()).isPresent()) {
            throw new BusinessValidationException("Admin username already exists");
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
                .attachmentQuotaMb(defaultIntValue(request.getAttachmentQuotaMb(), 100))
                .maxAttachmentFileSizeMb(defaultIntValue(request.getMaxAttachmentFileSizeMb(), 10))
                .attachmentRetentionDays(defaultIntValue(request.getAttachmentRetentionDays(), 365))
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
        userRepository.save(adminUser);

        return tenant;
    }

    @Transactional
    public Tenant updateTenant(UUID tenantId, UpdateTenantRequest request) {
        Tenant tenant = getTenantById(tenantId);
        applyTenantUpdate(tenant, request);
        return tenantRepository.save(tenant);
    }

    @Transactional
    public void deleteTenant(UUID tenantId) {
        Tenant tenant = getTenantById(tenantId);

        // Cascade delete (Manual for now to ensure control)
        customerRepository.findByTenantId(tenantId).forEach(customer -> {
            transactionRepository.findByTenantIdAndCustomerId(tenantId, customer.getId()).forEach(txn -> {
                attachmentRepository.deleteAll(attachmentRepository.findByTransactionId(txn.getId()));
            });
            transactionRepository.deleteAll(transactionRepository.findByTenantIdAndCustomerId(tenantId, customer.getId()));
        });
        customerRepository.deleteAll(customerRepository.findByTenantId(tenantId));

        userRepository.findAll().stream()
                .filter(u -> u.getTenant() != null && tenantId.equals(u.getTenant().getId()))
                .forEach(userRepository::delete);

        tenantRepository.delete(tenant);
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
        tenant.setAttachmentQuotaMb(defaultIntValue(request.getAttachmentQuotaMb(), tenant.getAttachmentQuotaMb()));
        tenant.setMaxAttachmentFileSizeMb(defaultIntValue(request.getMaxAttachmentFileSizeMb(), tenant.getMaxAttachmentFileSizeMb()));
        tenant.setAttachmentRetentionDays(defaultIntValue(request.getAttachmentRetentionDays(), tenant.getAttachmentRetentionDays()));
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private String defaultValue(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value.trim();
    }

    private Integer defaultIntValue(Integer value, Integer fallback) {
        return (value == null || value <= 0) ? fallback : value;
    }
}
