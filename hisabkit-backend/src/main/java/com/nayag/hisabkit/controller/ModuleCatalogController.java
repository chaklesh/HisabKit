package com.nayag.hisabkit.controller;

import com.nayag.hisabkit.module.ApplicationModuleCatalogService;
import com.nayag.hisabkit.module.ApplicationModuleDescriptor;
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
