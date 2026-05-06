package com.nayag.hisabkit.modules.tenant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateTenantRequest {
  @NotBlank private String name;
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
}
