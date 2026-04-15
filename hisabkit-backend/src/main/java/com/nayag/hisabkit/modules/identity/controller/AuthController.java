package com.nayag.hisabkit.modules.identity.controller;

import com.nayag.hisabkit.modules.identity.dto.AuthResponse;
import com.nayag.hisabkit.modules.identity.dto.GoogleSocialLoginRequest;
import com.nayag.hisabkit.modules.identity.dto.LoginRequest;
import com.nayag.hisabkit.modules.identity.dto.RegisterRequest;
import com.nayag.hisabkit.modules.identity.service.IdentityService;
import com.nayag.hisabkit.modules.identity.service.GoogleSocialAuthService;
import com.nayag.hisabkit.core.security.Roles;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    private final IdentityService identityService;
    private final GoogleSocialAuthService googleSocialAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (!isSuperAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only super admin can register tenants");
        }
        return ResponseEntity.ok(identityService.registerTenant(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(identityService.login(request));
    }

    @PostMapping("/social/google")
    public ResponseEntity<AuthResponse> googleSocialLogin(@Valid @RequestBody GoogleSocialLoginRequest request) {
        return ResponseEntity.ok(googleSocialAuthService.authenticate(request));
    }

    private boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> Roles.SUPER_ADMIN.equalsIgnoreCase(a.getAuthority()));
    }
}
