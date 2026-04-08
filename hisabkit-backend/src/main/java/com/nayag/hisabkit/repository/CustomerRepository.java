package com.nayag.hisabkit.repository;

import com.nayag.hisabkit.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<Customer> findByTenantId(UUID tenantId);

    Optional<Customer> findByIdAndTenantId(UUID id, UUID tenantId);
}
