package com.nayag.hisabkit.modules.storage.service;

import com.nayag.hisabkit.modules.storage.model.Attachment;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.core.exception.StorageException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentStorageServiceTest {

    @Mock private AttachmentRepository attachmentRepository;
    @Mock private TenantRepository tenantRepository;

    @InjectMocks private AttachmentStorageService storageService;

    private UUID tenantId;
    private UUID txnId;
    private Tenant tenant;

    @BeforeEach
    void setUp() {
        tenantId = UUID.randomUUID();
        txnId = UUID.randomUUID();
        tenant = Tenant.builder()
                .id(tenantId)
                .attachmentQuotaMb(10)
                .maxAttachmentFileSizeMb(5)
                .build();
    }

    @Test
    void testUploadAttachment_QuotaExceeded_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[1024]);
        
        when(tenantRepository.findById(tenantId)).thenReturn(Optional.of(tenant));
        when(attachmentRepository.totalStorageUsedByTenant(tenantId)).thenReturn(11L * 1024 * 1024); // 11MB used, cap 10MB

        assertThrows(StorageException.class, () -> 
            storageService.uploadAttachment(tenantId, txnId, file)
        );
    }

    @Test
    void testDeleteAttachment_Success() {
        UUID attachmentId = UUID.randomUUID();
        Attachment attachment = new Attachment();
        attachment.setId(attachmentId);
        attachment.setTenantId(tenantId);
        attachment.setFileUrl("fake/path/file.jpg");

        when(attachmentRepository.findByIdAndTenantId(attachmentId, tenantId)).thenReturn(Optional.of(attachment));

        storageService.deleteAttachment(tenantId, attachmentId);

        verify(attachmentRepository).delete(attachment);
    }

    @Test
    void testGetAttachmentDetails_NotFound_ThrowsException() {
        UUID attachmentId = UUID.randomUUID();
        when(attachmentRepository.findByIdAndTenantId(attachmentId, tenantId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> 
            storageService.getAttachmentDetails(tenantId, attachmentId)
        );
    }
}
