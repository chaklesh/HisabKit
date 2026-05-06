package com.nayag.hisabkit.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTenantRequest {
  @NotBlank private String name;
  @NotBlank private String slug;
  private String businessType;
  private String ownerName;
  private String businessPhone;
  private String businessEmail;
  private String businessAddress;
  private String gstNumber;
  private String logoUrl;
  private String smsTemplate;
  private String whatsappTemplate;
  private String status;
  private Integer attachmentQuotaMb;
  private Integer maxAttachmentFileSizeMb;
  private Integer attachmentRetentionDays;
  @NotBlank private String adminUsername;
  @NotBlank private String adminPassword;
  private String adminEmail;
  private String adminMobile;
}
