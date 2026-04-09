package com.nayag.hisabkit.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@Getter
@Setter
@ToString
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(name = "business_type")
    private String businessType;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "business_phone")
    private String businessPhone;

    @Column(name = "business_email")
    private String businessEmail;

    @Column(name = "business_address", length = 1000)
    private String businessAddress;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    @Column(name = "sms_template", length = 2000)
    private String smsTemplate;

    @Column(name = "whatsapp_template", length = 2000)
    private String whatsappTemplate;

    private String status;

    @Column(name = "attachment_quota_mb", nullable = false)
    @Builder.Default
    private Integer attachmentQuotaMb = 100;

    @Column(name = "max_attachment_file_size_mb", nullable = false)
    @Builder.Default
    private Integer maxAttachmentFileSizeMb = 10;

    @Column(name = "attachment_retention_days", nullable = false)
    @Builder.Default
    private Integer attachmentRetentionDays = 365;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
