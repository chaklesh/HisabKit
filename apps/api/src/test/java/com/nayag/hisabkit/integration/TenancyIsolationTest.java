package com.nayag.hisabkit.integration;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.nayag.hisabkit.core.security.JwtUtils;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@Transactional
class TenancyIsolationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private TenantRepository tenantRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private CustomerRepository customerRepository;

  @Autowired private JwtUtils jwtUtils;

  private String tokenA;
  private String tokenB;
  private Tenant tenantA;
  private Tenant tenantB;

  @BeforeEach
  void setUp() {
    // Create Tenant A
    tenantA = tenantRepository.save(Tenant.builder().name("Tenant A").slug("tenant-a").build());
    User userA =
        userRepository.save(
            User.builder()
                .username("userA")
                .passwordHash("hash")
                .role("USER")
                .tenant(tenantA)
                .isActive(true)
                .build());
    tokenA =
        "Bearer "
            + jwtUtils.generateToken(
                userA.getUsername(), tenantA.getId().toString(), userA.getRole());

    // Create Tenant B
    tenantB = tenantRepository.save(Tenant.builder().name("Tenant B").slug("tenant-b").build());
    User userB =
        userRepository.save(
            User.builder()
                .username("userB")
                .passwordHash("hash")
                .role("USER")
                .tenant(tenantB)
                .isActive(true)
                .build());
    tokenB =
        "Bearer "
            + jwtUtils.generateToken(
                userB.getUsername(), tenantB.getId().toString(), userB.getRole());

    // Add Customers to A
    Customer cA = new Customer();
    cA.setName("Customer A");
    cA.setTenantId(tenantA.getId());
    customerRepository.save(cA);

    // Add Customers to B
    Customer cB = new Customer();
    cB.setName("Customer B");
    cB.setTenantId(tenantB.getId());
    customerRepository.save(cB);
  }

  @Test
  void testTenantACannotSeeTenantBData() throws Exception {
    mockMvc
        .perform(get("/api/ledger/customers").header("Authorization", tokenA))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].name").value("Customer A"));
  }

  @Test
  void testTenantBCannotSeeTenantAData() throws Exception {
    mockMvc
        .perform(get("/api/ledger/customers").header("Authorization", tokenB))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(1)))
        .andExpect(jsonPath("$[0].name").value("Customer B"));
  }
}
