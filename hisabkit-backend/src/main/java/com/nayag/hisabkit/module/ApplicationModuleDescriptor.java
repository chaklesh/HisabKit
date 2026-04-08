package com.nayag.hisabkit.module;

public record ApplicationModuleDescriptor(
        ApplicationModuleKey key,
        String label,
        String route,
        ApplicationModuleStatus status,
        boolean enabled,
        String description
) {
}
