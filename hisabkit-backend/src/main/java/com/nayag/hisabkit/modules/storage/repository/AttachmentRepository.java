package com.nayag.hisabkit.modules.storage.repository;

import com.nayag.hisabkit.modules.storage.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByTenantIdAndTransactionIdOrderByUploadedAtDesc(UUID tenantId, UUID transactionId);

    List<Attachment> findByTransactionId(UUID transactionId);

    Optional<Attachment> findByIdAndTenantId(UUID id, UUID tenantId);

    List<Attachment> findByTenantIdAndExpiresAtBefore(UUID tenantId, LocalDateTime expiresAt);

    @Query("select coalesce(sum(a.fileSizeBytes), 0) from Attachment a where a.tenantId = :tenantId")
    long totalStorageUsedByTenant(UUID tenantId);
}

