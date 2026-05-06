package com.nayag.hisabkit.modules.audit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Data;
import org.hibernate.annotations.Filter;

@Data
@Entity
@Table(name = "audit_logs")
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class AuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "entity_name", nullable = false)
  private String entityName;

  @Column(name = "entity_id", nullable = false)
  private UUID entityId;

  @Column(name = "target_name")
  private String targetName;

  @Column(nullable = false)
  private String action; // CREATE/UPDATE/DELETE

  @Column(columnDefinition = "TEXT")
  private String changes; // JSON string

  @Column(name = "user_id", nullable = true)
  private UUID userId;

  @Column(name = "username")
  private String username;

  @Column(name = "tenant_id", nullable = true)
  private UUID tenantId;

  @Column(name = "tenant_name")
  private String tenantName;

  @Column(name = "ip_address")
  private String ipAddress;

  @Column(name = "user_agent")
  private String userAgent;

  @Column(nullable = false, updatable = false)
  private LocalDateTime timestamp = LocalDateTime.now();

  @PrePersist
  public void prePersist() {
    if (timestamp == null) {
      timestamp = LocalDateTime.now();
    }
  }
}
