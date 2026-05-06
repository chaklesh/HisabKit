package com.nayag.hisabkit.modules.storage.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;

@Data
@Entity
@Table(name = "attachments")
public class Attachment {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "transaction_id", nullable = false)
  private UUID transactionId;

  @Column(name = "file_name", nullable = false)
  private String fileName;

  @Column(name = "file_type")
  private String fileType;

  @Column(name = "file_url", nullable = false, length = 1000)
  private String fileUrl;

  @Column(name = "file_size_bytes", nullable = false)
  private Long fileSizeBytes;

  @Column(name = "expires_at")
  private LocalDateTime expiresAt;

  @Column(name = "uploaded_at", nullable = false, updatable = false)
  private LocalDateTime uploadedAt = LocalDateTime.now();

  @Column(name = "tenant_id", nullable = false)
  private UUID tenantId;

  @PrePersist
  public void prePersist() {
    if (uploadedAt == null) {
      uploadedAt = LocalDateTime.now();
    }
  }
}
