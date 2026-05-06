package com.nayag.hisabkit.modules.identity.service;

import com.nayag.hisabkit.core.exception.BusinessValidationException;
import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.core.security.JwtUtils;
import com.nayag.hisabkit.core.security.Roles;
import com.nayag.hisabkit.modules.identity.dto.AuthResponse;
import com.nayag.hisabkit.modules.identity.dto.LoginRequest;
import com.nayag.hisabkit.modules.identity.dto.RegisterRequest;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IdentityService {

  private final UserRepository userRepository;
  private final TenantRepository tenantRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtUtils jwtUtils;

  @Transactional
  public AuthResponse registerTenant(RegisterRequest request) {
    if (tenantRepository.findBySlug(request.getTenantSlug()).isPresent()) {
      throw new BusinessValidationException("Tenant slug already exists");
    }
    if (userRepository.findByUsername(request.getUsername()).isPresent()) {
      throw new BusinessValidationException("Username already exists");
    }

    Tenant tenant =
        Tenant.builder()
            .name(request.getTenantName())
            .slug(request.getTenantSlug())
            .businessType(request.getBusinessType())
            .status("ACTIVE")
            .build();
    tenant = tenantRepository.save(tenant);

    User user =
        User.builder()
            .username(request.getUsername())
            .email(
                request.getUsername().contains("@")
                    ? request.getUsername().trim().toLowerCase()
                    : null)
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role(Roles.ADMIN)
            .tenant(tenant)
            .isActive(true)
            .build();
    user = userRepository.save(user);

    return buildAuthResponse(user);
  }

  @Transactional
  public AuthResponse login(LoginRequest request) {
    User user =
        userRepository
            .findByUsername(request.getUsername())
            .orElseThrow(() -> new BusinessValidationException("Invalid credentials"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
      throw new BusinessValidationException("Invalid credentials");
    }

    if (!user.isActive()) {
      throw new BusinessValidationException("Account is disabled");
    }

    user.setLastLoginAt(java.time.LocalDateTime.now());
    userRepository.save(user);

    return buildAuthResponse(user);
  }

  public User findByUsername(String username) {
    return userRepository
        .findByUsername(username)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
  }

  public AuthResponse buildAuthResponse(User user) {
    String tenantId = user.getTenant() != null ? user.getTenant().getId().toString() : "GLOBAL";
    String token = jwtUtils.generateToken(user.getUsername(), tenantId, user.getRole());

    return AuthResponse.builder()
        .token(token)
        .tenantId(tenantId)
        .tenantSlug(user.getTenant() != null ? user.getTenant().getSlug() : null)
        .user(
            AuthResponse.UserSummary.builder()
                .username(user.getUsername())
                .role(user.getRole())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .avatarUrl(user.getAvatarUrl())
                .build())
        .build();
  }
}
