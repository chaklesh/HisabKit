package com.nayag.hisabkit.modules.identity.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;
import org.springframework.util.StringUtils;

@Data
public class GoogleSocialLoginRequest {
    @JsonAlias("credential")
    private String idToken;

    private String credential;

    private String tenantName;

    private String tenantSlug;

    private String businessType;

    public String resolveIdToken() {
        if (StringUtils.hasText(idToken)) {
            return idToken.trim();
        }
        if (StringUtils.hasText(credential)) {
            return credential.trim();
        }
        return null;
    }
}

