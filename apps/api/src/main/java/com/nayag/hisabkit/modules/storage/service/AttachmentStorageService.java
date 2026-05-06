package com.nayag.hisabkit.modules.storage.service;

import com.nayag.hisabkit.core.exception.ResourceNotFoundException;
import com.nayag.hisabkit.core.exception.StorageException;
import com.nayag.hisabkit.modules.storage.model.Attachment;
import com.nayag.hisabkit.modules.storage.repository.AttachmentRepository;
import com.nayag.hisabkit.modules.tenant.model.Tenant;
import com.nayag.hisabkit.modules.tenant.repository.TenantRepository;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AttachmentStorageService {

  private final AttachmentRepository attachmentRepository;
  private final TenantRepository tenantRepository;

  @Value("${hisabkit.upload.dir:./uploads}")
  private String uploadDir;

  @Transactional
  public Attachment uploadAttachment(UUID tenantId, UUID transactionId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new StorageException("Attachment file is required");
    }

    Tenant tenant =
        tenantRepository
            .findById(tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));

    purgeExpiredAttachments(tenantId);

    long fileSize = file.getSize();
    long maxFileSize = defaultInt(tenant.getMaxAttachmentFileSizeMb(), 10) * 1024L * 1024L;
    if (fileSize > maxFileSize) {
      throw new StorageException("Attachment file exceeds configured max size");
    }

    long usedStorage = attachmentRepository.totalStorageUsedByTenant(tenantId);
    long quotaLimit = defaultInt(tenant.getAttachmentQuotaMb(), 100) * 1024L * 1024L;
    if (usedStorage + fileSize > quotaLimit) {
      throw new StorageException("Attachment quota exceeded for tenant");
    }

    try {
      Path baseDir =
          Path.of(uploadDir, tenantId.toString(), "transactions", transactionId.toString());
      Files.createDirectories(baseDir);

      String originalName =
          StringUtils.hasText(file.getOriginalFilename())
              ? file.getOriginalFilename()
              : "attachment";
      String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
      String fileName = System.currentTimeMillis() + "-" + safeName;
      Path target = baseDir.resolve(fileName);
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

      Attachment attachment = new Attachment();
      attachment.setTransactionId(transactionId);
      attachment.setTenantId(tenantId);
      attachment.setFileName(originalName);
      attachment.setFileType(file.getContentType());
      attachment.setFileUrl(target.toString().replace("\\", "/"));
      attachment.setFileSizeBytes(fileSize);
      attachment.setExpiresAt(
          LocalDateTime.now().plusDays(defaultInt(tenant.getAttachmentRetentionDays(), 365)));

      return attachmentRepository.save(attachment);
    } catch (IOException ex) {
      throw new StorageException("Unable to save attachment", ex);
    }
  }

  public List<Attachment> listAttachments(UUID tenantId, UUID transactionId) {
    return attachmentRepository.findByTenantIdAndTransactionIdOrderByUploadedAtDesc(
        tenantId, transactionId);
  }

  @Transactional
  public void deleteAttachment(UUID tenantId, UUID attachmentId) {
    Attachment attachment =
        attachmentRepository
            .findByIdAndTenantId(attachmentId, tenantId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
    deleteAttachmentFileIfPresent(attachment);
    attachmentRepository.delete(attachment);
  }

  public Attachment getAttachmentDetails(UUID tenantId, UUID attachmentId) {
    return attachmentRepository
        .findByIdAndTenantId(attachmentId, tenantId)
        .orElseThrow(() -> new ResourceNotFoundException("Attachment not found"));
  }

  public Resource loadAsResource(Attachment attachment) {
    Path filePath = Path.of(attachment.getFileUrl()).normalize().toAbsolutePath();
    if (!Files.exists(filePath)) {
      throw new ResourceNotFoundException("Attachment file not found");
    }

    try {
      return new UrlResource(filePath.toUri());
    } catch (MalformedURLException ex) {
      throw new StorageException("Unable to load attachment", ex);
    }
  }

  private void purgeExpiredAttachments(UUID tenantId) {
    List<Attachment> expired =
        attachmentRepository.findByTenantIdAndExpiresAtBefore(tenantId, LocalDateTime.now());
    for (Attachment attachment : expired) {
      deleteAttachmentFileIfPresent(attachment);
    }
    attachmentRepository.deleteAll(expired);
  }

  private void deleteAttachmentFileIfPresent(Attachment attachment) {
    try {
      if (attachment.getFileUrl() == null || attachment.getFileUrl().isBlank()) return;
      Path path = Path.of(attachment.getFileUrl()).normalize().toAbsolutePath();
      if (Files.exists(path)) {
        Files.delete(path);
      }
    } catch (Exception ignored) {
    }
  }

  private int defaultInt(Integer value, int fallback) {
    return (value == null || value <= 0) ? fallback : value;
  }
}
