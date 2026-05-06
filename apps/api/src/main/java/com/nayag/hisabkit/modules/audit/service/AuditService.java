package com.nayag.hisabkit.modules.audit.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nayag.hisabkit.core.security.SecurityUtils;
import com.nayag.hisabkit.modules.audit.model.AuditLog;
import com.nayag.hisabkit.modules.audit.repository.AuditLogRepository;
import com.nayag.hisabkit.modules.identity.model.User;
import com.nayag.hisabkit.modules.identity.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditService {

  private final AuditLogRepository auditLogRepository;
  private final UserRepository userRepository;
  private final com.nayag.hisabkit.modules.tenant.repository.TenantRepository tenantRepository;
  private final ObjectMapper objectMapper;

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void logMutation(
      String entityName, UUID entityId, String action, UUID tenantId, Map<String, Object> changes) {
    logMutation(entityName, entityId, action, tenantId, changes, null);
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void logMutation(
      String entityName,
      UUID entityId,
      String action,
      UUID tenantId,
      Map<String, Object> changes,
      String targetName) {
    logMutation(entityName, entityId, action, tenantId, null, changes, targetName);
  }

  /**
   * Comprehensive Audit Logger with Diff Support
   *
   * @param oldValues Previous state of the entity (null for CREATE)
   * @param newValues New state of the entity (null for DELETE)
   */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void logMutation(
      String entityName,
      UUID entityId,
      String action,
      UUID tenantId,
      Map<String, Object> oldValues,
      Map<String, Object> newValues,
      String targetName) {
    try {
      String username = SecurityUtils.currentUsername();
      if (username == null || username.equals("anonymousUser")) return;

      User user = userRepository.findByUsername(username).orElse(null);
      if (user == null) return;

      AuditLog log = new AuditLog();
      log.setEntityName(entityName);
      log.setEntityId(entityId);
      log.setAction(action);
      log.setTargetName(targetName);
      log.setUserId(user.getId());
      log.setUsername(user.getUsername());
      log.setTenantId(tenantId);

      // Resolve Tenant Name if missing
      if (tenantId != null) {
        tenantRepository.findById(tenantId).ifPresent(t -> log.setTenantName(t.getName()));
      }

      // Robust IP & User Agent Capture
      ServletRequestAttributes attrs =
          (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      if (attrs != null) {
        HttpServletRequest request = attrs.getRequest();
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
          ip = request.getRemoteAddr();
        }
        log.setIpAddress(ip);
        log.setUserAgent(request.getHeader("User-Agent"));
      }

      // Compute Delta (Differences)
      Map<String, Object> delta = new HashMap<>();
      if ("UPDATE".equals(action) && oldValues != null && newValues != null) {
        for (String key : newValues.keySet()) {
          Object oldVal = oldValues.get(key);
          Object newVal = newValues.get(key);
          if (!Objects.equals(oldVal, newVal)) {
            delta.put(
                key,
                Map.of("old", oldVal != null ? oldVal : "", "new", newVal != null ? newVal : ""));
          }
        }
      } else {
        delta = newValues != null ? newValues : oldValues;
      }

      if (delta != null && !delta.isEmpty()) {
        try {
          log.setChanges(objectMapper.writeValueAsString(delta));
        } catch (Exception e) {
          log.setChanges(delta.toString());
        }
      }

      auditLogRepository.save(log);
    } catch (Exception e) {
      // In production, we might want to log this to a file or external monitoring
      // but we NEVER want to break the main transaction because of an audit failure.
      System.err.println("Audit Logging Failed: " + e.getMessage());
    }
  }

  public org.springframework.data.domain.Page<AuditLog> getGlobalLogs(
      String search, org.springframework.data.domain.Pageable pageable) {
    if (search != null && !search.isBlank()) {
      return auditLogRepository.searchLogs(search.toLowerCase(), pageable);
    }
    return auditLogRepository.findAll(pageable);
  }

  public java.util.List<AuditLog> getTenantLogs(UUID tenantId) {
    return auditLogRepository.findByTenantIdOrderByTimestampDesc(tenantId);
  }
}
