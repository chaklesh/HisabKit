package com.nayag.hisabkit.modules.catalog.controller;

import com.nayag.hisabkit.modules.catalog.service.ApplicationModuleCatalogService;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleDescriptor;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleKey;
import com.nayag.hisabkit.modules.catalog.model.ApplicationModuleStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class ModuleCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ApplicationModuleCatalogService moduleCatalogService;

    @Test
    @WithMockUser
    void testListModules_Success() throws Exception {
        when(moduleCatalogService.listModules()).thenReturn(List.of(
                new ApplicationModuleDescriptor(ApplicationModuleKey.DASHBOARD, "Dashboard", "/db", ApplicationModuleStatus.LIVE, true, "Desc")
        ));

        mockMvc.perform(get("/api/modules")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].label").value("Dashboard"));
    }
}
