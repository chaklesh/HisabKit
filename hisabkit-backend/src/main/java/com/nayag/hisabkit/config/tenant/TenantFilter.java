package com.nayag.hisabkit.config.tenant;

import com.nayag.hisabkit.security.CustomUserDetails;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Filter to capture the Tenant ID from the request headers or authenticated user.
 */
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
        } else {
            tenantId = httpRequest.getHeader(TENANT_HEADER);
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
