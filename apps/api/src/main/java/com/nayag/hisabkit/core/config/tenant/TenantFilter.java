package com.nayag.hisabkit.core.config.tenant;

import com.nayag.hisabkit.core.security.CustomUserDetails;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/** Filter to capture the Tenant ID from the request headers or authenticated user. */
@Component
public class TenantFilter implements Filter {

  private static final String TENANT_HEADER = "X-TenantID";

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest httpRequest = (HttpServletRequest) request;
    String tenantId = null;

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
      tenantId = ((CustomUserDetails) authentication.getPrincipal()).getTenantId();
    }

    // If tenantId is not in token OR it is "GLOBAL" (Super Admin), check headers
    if (tenantId == null || "GLOBAL".equalsIgnoreCase(tenantId)) {
      String headerTenantId = httpRequest.getHeader("X-TenantID");
      if (headerTenantId == null) {
        headerTenantId = httpRequest.getHeader("X-Tenant-ID");
      }
      if (headerTenantId != null) {
        tenantId = headerTenantId;
      }
    }

    if (tenantId != null) {
      TenantContext.setCurrentTenant(tenantId);
    }

    try {
      chain.doFilter(request, response);
    } finally {
      TenantContext.clear();
    }
  }
}
