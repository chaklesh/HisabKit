package com.nayag.hisabkit.repository;

import com.nayag.hisabkit.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, UUID> {
    List<Attachment> findByTenantIdAndTransactionIdOrderByUploadedAtDesc(UUID tenantId, UUID transactionId);

    List<Attachment> findByTransactionId(UUID transactionId);

    Optional<Attachment> findByIdAndTenantId(UUID id, UUID tenantId);
}
