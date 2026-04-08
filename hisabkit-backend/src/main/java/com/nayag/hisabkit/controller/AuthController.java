package com.nayag.hisabkit.controller;

import com.nayag.hisabkit.dto.AuthResponse;
import com.nayag.hisabkit.dto.GoogleSocialLoginRequest;
import com.nayag.hisabkit.dto.LoginRequest;
import com.nayag.hisabkit.dto.RegisterRequest;
import com.nayag.hisabkit.model.Tenant;
import com.nayag.hisabkit.model.User;
import com.nayag.hisabkit.repository.TenantRepository;
import com.nayag.hisabkit.repository.UserRepository;
import com.nayag.hisabkit.service.GoogleSocialAuthService;
import com.nayag.hisabkit.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final GoogleSocialAuthService googleSocialAuthService;

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (!isSuperAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only super admin can register tenants");
        }

        if (tenantRepository.findBySlug(request.getTenantSlug()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tenant slug already exists");
        }
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
        }

        Tenant tenant = Tenant.builder()
                .name(request.getTenantName())
                .slug(request.getTenantSlug())
                .businessType(request.getBusinessType())
                .status("ACTIVE")
                .build();
        tenant = tenantRepository.save(tenant);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getUsername().contains("@") ? request.getUsername().trim().toLowerCase() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("ADMIN")
                .tenant(tenant)
                .isActive(true)
                .build();
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername(), tenant.getId().toString(), user.getRole());

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .tenantId(tenant.getId().toString())
                .tenantSlug(tenant.getSlug())
                .user(AuthResponse.UserSummary.builder()
                        .username(user.getUsername())
                        .role(user.getRole())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .avatarUrl(normalizeAvatarUrl(user.getAvatarUrl()))
                        .build())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        var userOptional = userRepository.findByUsername(request.getUsername());
        
        if (userOptional.isPresent() && passwordEncoder.matches(request.getPassword(), userOptional.get().getPasswordHash())) {
            User user = userOptional.get();
            user.setLastLoginAt(java.time.LocalDateTime.now());
            userRepository.save(user);
            String token = jwtUtils.generateToken(user.getUsername(), user.getTenant().getId().toString(), user.getRole());
            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .tenantId(user.getTenant().getId().toString())
                    .tenantSlug(user.getTenant().getSlug())
                    .user(AuthResponse.UserSummary.builder()
                            .username(user.getUsername())
                            .role(user.getRole())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .mobile(user.getMobile())
                            .avatarUrl(normalizeAvatarUrl(user.getAvatarUrl()))
                            .build())
                    .build());
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    @PostMapping("/social/google")
    public ResponseEntity<AuthResponse> googleSocialLogin(@Valid @RequestBody GoogleSocialLoginRequest request) {
        return ResponseEntity.ok(googleSocialAuthService.authenticate(request));
    }

    private boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUPER_ADMIN".equalsIgnoreCase(a.getAuthority()));
    }

    private String normalizeAvatarUrl(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String normalized = value.trim();
        if ("null".equalsIgnoreCase(normalized) || "undefined".equalsIgnoreCase(normalized)) {
            return null;
        }
        if (normalized.startsWith("//")) {
            return "https:" + normalized;
        }
        if (normalized.startsWith("http://")) {
            return "https://" + normalized.substring("http://".length());
        }
        return normalized;
    }
}
