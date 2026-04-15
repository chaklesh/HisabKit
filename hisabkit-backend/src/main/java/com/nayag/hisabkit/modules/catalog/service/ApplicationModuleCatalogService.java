package com.nayag.hisabkit.modules.catalog.service;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleDescriptor;

import java.util.List;

public interface ApplicationModuleCatalogService {
    List<ApplicationModuleDescriptor> listModules();
}

