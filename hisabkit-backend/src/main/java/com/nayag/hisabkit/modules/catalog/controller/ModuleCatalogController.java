package com.nayag.hisabkit.modules.catalog.controller;

import com.nayag.hisabkit.modules.catalog.service.ApplicationModuleCatalogService;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleDescriptor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@RequiredArgsConstructor
public class ModuleCatalogController {

    private final ApplicationModuleCatalogService moduleCatalogService;

    @GetMapping
    public ResponseEntity<List<ApplicationModuleDescriptor>> listModules() {
        return ResponseEntity.ok(moduleCatalogService.listModules());
    }
}

