package com.nayag.hisabkit.modules.catalog.model;

public record ApplicationModuleDescriptor(
        ApplicationModuleKey key,
        String label,
        String route,
        ApplicationModuleStatus status,
        boolean enabled,
        String description
) {
}

