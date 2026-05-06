package com.nayag.hisabkit.modules.audit.repository;

import com.nayag.hisabkit.modules.audit.model.AuditLog;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
  java.util.List<com.nayag.hisabkit.modules.audit.model.AuditLog>
      findByTenantIdOrderByTimestampDesc(UUID tenantId);

  @org.springframework.data.jpa.repository.Query(
      "SELECT l FROM AuditLog l WHERE "
          + "(:query IS NULL OR "
          + "LOWER(l.entityName) LIKE %:query% OR "
          + "LOWER(l.action) LIKE %:query% OR "
          + "LOWER(l.username) LIKE %:query% OR "
          + "LOWER(l.tenantName) LIKE %:query% OR "
          + "LOWER(l.targetName) LIKE %:query% OR "
          + "LOWER(l.changes) LIKE %:query%)")
  org.springframework.data.domain.Page<AuditLog> searchLogs(
      String query, org.springframework.data.domain.Pageable pageable);
}
