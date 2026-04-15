package com.nayag.hisabkit.modules.identity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String tenantName;
    @NotBlank
    private String tenantSlug;
    private String businessType;
    @NotBlank
    private String username;
    @NotBlank
    private String password;
}

