package com.nayag.hisabkit.core.config;

import com.nayag.hisabkit.core.security.Roles;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Configuration
public class DataLoader {

  private final HisabkitProperties properties;

  public DataLoader(HisabkitProperties properties) {
    this.properties = properties;
  }

  @Bean
  public CommandLineRunner initData(
      TenantRepository tenantRepository,
      UserRepository userRepository,
      PasswordEncoder passwordEncoder) {
    return args -> {
      HisabkitProperties.Bootstrap bootstrap = properties.getBootstrap();
      if (!bootstrap.isEnabled()) {
        return;
      }

      if (!StringUtils.hasText(bootstrap.getTenantName())
          || !StringUtils.hasText(bootstrap.getTenantSlug())
          || !StringUtils.hasText(bootstrap.getUsername())
          || !StringUtils.hasText(bootstrap.getPassword())) {
        throw new IllegalStateException(
            "Bootstrap admin is enabled but required fields are missing");
      }

      if (userRepository.findByUsername(bootstrap.getUsername().trim()).isEmpty()) {
        Tenant tenant =
            Tenant.builder()
                .name(bootstrap.getTenantName().trim())
                .slug(bootstrap.getTenantSlug().trim())
                .businessType(bootstrap.getBusinessType())
                .status("ACTIVE")
                .build();
        tenant = tenantRepository.save(tenant);

        User admin =
            User.builder()
                .username(bootstrap.getUsername().trim())
                .email(bootstrap.getUsername().trim())
                .passwordHash(passwordEncoder.encode(bootstrap.getPassword()))
                .role(Roles.SUPER_ADMIN)
                .tenant(tenant)
                .isActive(true)
                .build();
        userRepository.save(admin);
      }
    };
  }
}
