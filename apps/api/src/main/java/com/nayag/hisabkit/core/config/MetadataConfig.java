package com.nayag.hisabkit.core.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetadataConfig {

  private static final String SECURITY_SCHEME_NAME = "Bearer_Auth";

  @Value("${spring.application.name:hisabkit}")
  private String appName;

  @Value("${spring.application.version:1.0.0}")
  private String appVersion;

  @Bean
  public OpenAPI hisabkitOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title(appName.replace("-", " ").toUpperCase())
                .description("Enterprise Multi-Tenant Ledger Backend")
                .version(appVersion))
        .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
        .components(
            new Components()
                .addSecuritySchemes(
                    SECURITY_SCHEME_NAME,
                    new SecurityScheme()
                        .name(SECURITY_SCHEME_NAME)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
  }
}
