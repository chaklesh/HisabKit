package com.nayag.hisabkit.modules.tenant.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class TenantServiceTest {

  @Mock private TenantRepository tenantRepository;
  @Mock private UserRepository userRepository;
  @Mock private CustomerRepository customerRepository;
  @Mock private TransactionRepository transactionRepository;
  @Mock private AttachmentRepository attachmentRepository;
  @Mock private PasswordEncoder passwordEncoder;

  @InjectMocks private TenantService tenantService;

  private UUID tenantId;
  private Tenant tenant;

  @BeforeEach
  void setUp() {
    tenantId = UUID.randomUUID();
    tenant = Tenant.builder().id(tenantId).name("Test Corp").slug("test-corp").build();
  }

  @Test
  void testGetTenantById_Success() {
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
    Tenant found = tenantService.getTenantById(tenantId);
    assertEquals("Test Corp", found.getName());
  }

  @Test
  void testGetTenantById_NotFound_ThrowsException() {
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.empty());
    assertThrows(ResourceNotFoundException.class, () -> tenantService.getTenantById(tenantId));
  }

  @Test
  void testDeleteTenant_CascadeCheck() {
    when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
    tenantService.deleteTenant(tenantId);
    verify(tenantRepository).delete(tenant);
    verify(customerRepository, atLeastOnce()).findByTenantId(tenantId);
  }
}
