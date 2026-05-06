package com.nayag.hisabkit.modules.tenant.repository;

import com.nayag.hisabkit.modules.tenant.model.Tenant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
  Optional<Tenant> findBySlug(String slug);
}
