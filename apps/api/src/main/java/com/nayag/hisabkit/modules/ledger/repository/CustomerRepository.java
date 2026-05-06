package com.nayag.hisabkit.modules.ledger.repository;

import com.nayag.hisabkit.modules.ledger.model.Customer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
  List<Customer> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  List<Customer> findByTenantId(UUID tenantId);

  Optional<Customer> findByIdAndTenantId(UUID id, UUID tenantId);
}
