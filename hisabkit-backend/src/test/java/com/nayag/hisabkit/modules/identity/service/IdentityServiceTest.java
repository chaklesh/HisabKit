package com.nayag.hisabkit.modules.identity.service;

import com.nayag.hisabkit.modules.identity.dto.AuthResponse;
import com.nayag.hisabkit.modules.identity.dto.LoginRequest;
import com.nayag.hisabkit.modules.identity.dto.RegisterRequest;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import com.nayag.hisabkit.core.security.JwtUtils;
import com.nayag.hisabkit.core.exception.BusinessValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdentityServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TenantRepository tenantRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtils jwtUtils;

    @InjectMocks private IdentityService identityService;

    private User user;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(UUID.randomUUID()).slug("test-tenant").build();
        user = User.builder().username("testuser").passwordHash("hashed").role("ADMIN").tenant(tenant).isActive(true).build();
    }

    @Test
    void testRegisterTenant_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setTenantName("New Tenant");
        request.setTenantSlug("new-tenant");
        request.setUsername("admin");
        request.setPassword("pass");

        when(tenantRepository.findBySlug(anyString())).thenReturn(Optional.empty());
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(tenantRepository.save(any(Tenant.class))).thenReturn(tenant);
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");

        AuthResponse response = identityService.registerTenant(request);

        assertNotNull(response);
        assertEquals("token", response.getToken());
        verify(tenantRepository).save(any(Tenant.class));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed")).thenReturn(true);
        when(jwtUtils.generateToken(anyString(), anyString(), anyString())).thenReturn("token");

        AuthResponse response = identityService.login(request);

        assertNotNull(response);
        assertEquals("token", response.getToken());
        verify(userRepository).save(user); // last login update
    }

    @Test
    void testLogin_InvalidCredentials_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setUsername("wrong");
        request.setPassword("pass");

        when(userRepository.findByUsername("wrong")).thenReturn(Optional.empty());

        assertThrows(BusinessValidationException.class, () -> identityService.login(request));
    }

    @Test
    void testLogin_DisabledUser_ThrowsException() {
        user.setActive(false);
        LoginRequest request = new LoginRequest();
        request.setUsername("testuser");
        request.setPassword("password");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "hashed")).thenReturn(true);

        assertThrows(BusinessValidationException.class, () -> identityService.login(request));
    }
}
