package com.nayag.hisabkit.controller;

import com.nayag.hisabkit.model.Tenant;
import com.nayag.hisabkit.model.User;
import com.nayag.hisabkit.repository.TenantRepository;
import com.nayag.hisabkit.repository.UserRepository;
import com.nayag.hisabkit.security.SecurityUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getMyProfile() {
        User user = currentUserOrThrow();
        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = currentUserOrThrow();
        final var userId = user.getId();

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                    .filter(existing -> !existing.getId().equals(userId))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
                    });
        }
        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            userRepository.findByMobile(request.getMobile().trim())
                    .filter(existing -> !existing.getId().equals(userId))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile is already in use");
                    });
        }

        user.setFullName(trimToNull(request.getFullName()));
        user.setEmail(trimToNull(request.getEmail()));
        user.setMobile(trimToNull(request.getMobile()));
        user.setAvatarUrl(trimToNull(request.getAvatarUrl()));
        user = userRepository.save(user);

        return ResponseEntity.ok(toProfileResponse(user));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUserOrThrow();
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("updated", true));
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        User user = currentUserOrThrow();
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Avatar image is required");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        if (!contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }
        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            user.setAvatarUrl("data:" + contentType + ";base64," + base64);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("avatarUrl", user.getAvatarUrl()));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to upload avatar", ex);
        }
    }

    @GetMapping("/tenant")
    public ResponseEntity<Map<String, Object>> getTenantProfile() {
        User user = currentUserOrThrow();
        Tenant tenant = tenantRepository.findById(user.getTenant().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));
        return ResponseEntity.ok(toTenantResponse(tenant));
    }

    @PutMapping("/tenant")
    public ResponseEntity<Map<String, Object>> updateTenantProfile(@Valid @RequestBody UpdateTenantProfileRequest request) {
        if (!SecurityUtils.hasRole("ADMIN") && !SecurityUtils.hasRole("SUPER_ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only tenant admin can update tenant profile");
        }

        User user = currentUserOrThrow();
        Tenant tenant = tenantRepository.findById(user.getTenant().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tenant not found"));

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
        tenant.setAttachmentQuotaMb(defaultIntValue(request.getAttachmentQuotaMb(), tenant.getAttachmentQuotaMb()));
        tenant.setMaxAttachmentFileSizeMb(defaultIntValue(request.getMaxAttachmentFileSizeMb(), tenant.getMaxAttachmentFileSizeMb()));
        tenant.setAttachmentRetentionDays(defaultIntValue(request.getAttachmentRetentionDays(), tenant.getAttachmentRetentionDays()));

        Tenant saved = tenantRepository.save(tenant);
        return ResponseEntity.ok(toTenantResponse(saved));
    }

    private User currentUserOrThrow() {
        String username = SecurityUtils.currentUsername();
        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context missing");
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Map<String, Object> toProfileResponse(User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("fullName", user.getFullName());
        response.put("email", user.getEmail());
        response.put("mobile", user.getMobile());
        response.put("avatarUrl", normalizeAvatarUrl(user.getAvatarUrl()));
        return response;
    }

    private Map<String, Object> toTenantResponse(Tenant tenant) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", tenant.getId());
        response.put("slug", tenant.getSlug());
        response.put("name", tenant.getName());
        response.put("businessType", tenant.getBusinessType());
        response.put("ownerName", tenant.getOwnerName());
        response.put("businessPhone", tenant.getBusinessPhone());
        response.put("businessEmail", tenant.getBusinessEmail());
        response.put("businessAddress", tenant.getBusinessAddress());
        response.put("gstNumber", tenant.getGstNumber());
        response.put("logoUrl", tenant.getLogoUrl());
        response.put("smsTemplate", tenant.getSmsTemplate());
        response.put("whatsappTemplate", tenant.getWhatsappTemplate());
        response.put("status", tenant.getStatus());
        response.put("attachmentQuotaMb", tenant.getAttachmentQuotaMb());
        response.put("maxAttachmentFileSizeMb", tenant.getMaxAttachmentFileSizeMb());
        response.put("attachmentRetentionDays", tenant.getAttachmentRetentionDays());
        return response;
    }

    private String normalizeAvatarUrl(String value) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            return null;
        }
        if (normalized.startsWith("//")) {
            return "https:" + normalized;
        }
        if (normalized.startsWith("http://")) {
            return "https://" + normalized.substring("http://".length());
        }
        if ("null".equalsIgnoreCase(normalized) || "undefined".equalsIgnoreCase(normalized)) {
            return null;
        }
        return normalized;
    }

    private Integer defaultIntValue(Integer value, Integer fallback) {
        if (value == null || value <= 0) {
            return fallback;
        }
        return value;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String email;
        private String mobile;
        private String avatarUrl;
    }

    @Data
    public static class ChangePasswordRequest {
        @NotBlank
        private String currentPassword;
        @NotBlank
        private String newPassword;
    }

    @Data
    public static class UpdateTenantProfileRequest {
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
        private Integer attachmentQuotaMb;
        private Integer maxAttachmentFileSizeMb;
        private Integer attachmentRetentionDays;
    }
}
