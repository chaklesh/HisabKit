package com.nayag.hisabkit.core.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "hisabkit")
public class HisabkitProperties {

  @Valid private Jwt jwt = new Jwt();

  @Valid private Google google = new Google();

  @Valid private Security security = new Security();

  @Valid private Bootstrap bootstrap = new Bootstrap();

  @Getter
  @Setter
  public static class Jwt {
    @NotBlank private String secret;

    @Min(60000)
    private long expiration = 86400000;
  }

  @Getter
  @Setter
  public static class Google {
    @NotBlank private String clientId;
  }

  @Getter
  @Setter
  public static class Security {
    private List<String> corsAllowedOrigins = new ArrayList<>();
  }

  @Getter
  @Setter
  public static class Bootstrap {
    private boolean enabled = false;
    private String tenantName;
    private String tenantSlug;
    private String businessType = "System";
    private String username;
    private String password;
  }
}
