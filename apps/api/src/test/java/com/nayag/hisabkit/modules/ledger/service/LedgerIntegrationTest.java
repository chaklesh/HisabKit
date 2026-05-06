package com.nayag.hisabkit.modules.ledger.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nayag.hisabkit.modules.ledger.dto.CreateCustomerRequest;
import com.nayag.hisabkit.modules.ledger.dto.CreateTransactionRequest;
import com.nayag.hisabkit.modules.ledger.model.Customer;
import com.nayag.hisabkit.modules.ledger.repository.CustomerRepository;
import com.nayag.hisabkit.modules.ledger.repository.TransactionRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class LedgerIntegrationTest {

  @Autowired private MockMvc mockMvc;

  @Autowired private CustomerRepository customerRepository;

  @Autowired private TransactionRepository transactionRepository;

  @Autowired private TenantRepository tenantRepository;

  @Autowired private ObjectMapper objectMapper;

  private UUID tenantId;

  @BeforeEach
  void setUp() {
    transactionRepository.deleteAll();
    customerRepository.deleteAll();
    tenantRepository.deleteAll();

    Tenant tenant =
        Tenant.builder()
            .name("Test Business")
            .slug("test-business-" + UUID.randomUUID().toString())
            .status("ACTIVE")
            .build();
    tenant = tenantRepository.save(tenant);
    tenantId = tenant.getId();
  }

  @Test
  @WithMockUser(username = "admin")
  void fullCustomerAndTransactionFlow() throws Exception {
    // 1. Create a customer
    CreateCustomerRequest customerRequest = new CreateCustomerRequest();
    customerRequest.setName("Integration Test Customer");
    customerRequest.setPhone("9988776655");

    MvcResult result =
        mockMvc
            .perform(
                post("/api/v1/ledger/customers")
                    .header("X-TenantID", tenantId.toString())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(customerRequest)))
            .andExpect(status().isOk())
            .andReturn();

    Customer customer =
        objectMapper.readValue(result.getResponse().getContentAsString(), Customer.class);
    UUID customerId = customer.getId();
    assertThat(customer.getName()).isEqualTo("Integration Test Customer");

    // 2. Create a SALE transaction
    CreateTransactionRequest saleRequest = new CreateTransactionRequest();
    saleRequest.setCustomerId(customerId);
    saleRequest.setType("SALE");
    saleRequest.setTotalAmount(new BigDecimal("1000.00"));
    saleRequest.setPaidAmount(new BigDecimal("200.00"));
    saleRequest.setTransactionDate(LocalDate.now());

    mockMvc
        .perform(
            post("/api/v1/ledger/transactions")
                .header("X-TenantID", tenantId.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(saleRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.transaction.dueAmount").value(800.00))
        .andExpect(jsonPath("$.customer.totalBalance").value(800.00));

    // 3. Create a PAYMENT transaction
    CreateTransactionRequest paymentRequest = new CreateTransactionRequest();
    paymentRequest.setCustomerId(customerId);
    paymentRequest.setType("PAYMENT");
    paymentRequest.setPaidAmount(new BigDecimal("300.00"));
    paymentRequest.setTransactionDate(LocalDate.now());

    mockMvc
        .perform(
            post("/api/v1/ledger/transactions")
                .header("X-TenantID", tenantId.toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(paymentRequest)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.customer.totalBalance").value(500.00));

    // 4. Verify in DB
    Customer finalCustomer = customerRepository.findById(customerId).orElseThrow();
    assertThat(finalCustomer.getTotalBalance().compareTo(new BigDecimal("500.00"))).isEqualTo(0);
  }
}
