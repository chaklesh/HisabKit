package com.nayag.hisabkit.modules.identity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
  private String token;
  private String tenantId;
  private String tenantSlug;
  private UserSummary user;

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class UserSummary {
    private String username;
    private String role;
    private String fullName;
    private String email;
    private String mobile;
    private String avatarUrl;
  }
}
