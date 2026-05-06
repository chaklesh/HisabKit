package com.nayag.hisabkit.modules.ledger.repository;

import com.nayag.hisabkit.modules.ledger.model.Transaction;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
  List<Transaction> findByTenantIdAndCustomerIdOrderByTimestampDesc(UUID tenantId, UUID customerId);

  List<Transaction> findByTenantIdOrderByTimestampDesc(UUID tenantId);

  Optional<Transaction> findByIdAndTenantId(UUID id, UUID tenantId);

  List<Transaction> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);

  List<Transaction> findByCustomerId(UUID customerId);

  List<Transaction> findByTenantIdAndCustomerIdAndTimestampBetweenOrderByTimestampAsc(
      UUID tenantId, UUID customerId, java.time.LocalDateTime from, java.time.LocalDateTime to);

  @Query(
      """
            select coalesce(sum(case when t.type = 'SALE' then t.dueAmount else -t.paidAmount end), 0)
            from Transaction t
            where t.tenantId = :tenantId and t.customerId = :customerId
            """)
  BigDecimal calculateCustomerBalance(UUID tenantId, UUID customerId);

  @Query(
      """
            select coalesce(sum(case when t.type = 'SALE' then t.dueAmount else -t.paidAmount end), 0)
            from Transaction t
            where t.tenantId = :tenantId and t.customerId = :customerId and t.timestamp < :from
            """)
  BigDecimal calculateCustomerBalanceBefore(
      UUID tenantId, UUID customerId, java.time.LocalDateTime from);

  @Query(
      "select coalesce(sum(t.totalAmount), 0) from Transaction t where t.tenantId = :tenantId and t.type = 'SALE'")
  BigDecimal sumTotalSalesVolume(UUID tenantId);

  @Query("select coalesce(sum(t.paidAmount), 0) from Transaction t where t.tenantId = :tenantId")
  BigDecimal sumTotalCollections(UUID tenantId);

  long countByTenantId(UUID tenantId);
}
