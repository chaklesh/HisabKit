package com.nayag.hisabkit.config.tenant;

/**
 * Enterprise-grade Tenant Context using ThreadLocal.
 * Ensures the tenant ID is carried throughout the lifecycle of a single request.
 */
public class TenantContext {
    private static final ThreadLocal<String> currentTenant = new ThreadLocal<>();

    public static void setCurrentTenant(String tenantId) {
        currentTenant.set(tenantId);
    }

    public static String getCurrentTenant() {
        return currentTenant.get();
    }

    public static void clear() {
        currentTenant.remove();
    }
}
