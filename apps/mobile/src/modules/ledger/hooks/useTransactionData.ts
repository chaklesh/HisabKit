import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { LedgerTransaction } from "../../../shared/types/ledger";
import { fetchTransactionAttachments, fetchTransactions } from "../services/ledgerService";

export function useTransactionData(customerId: string) {
  const {
    data: transactions = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["ledger", "transactions", customerId],
    queryFn: () => fetchTransactions(customerId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch attachments for all transactions in this view
  const { data: attachments = {} } = useQuery({
    queryKey: ["ledger", "attachments", customerId],
    queryFn: async () => {
      const results = await Promise.all(
        transactions.map(async (txn) => {
          const files = await fetchTransactionAttachments(txn.id);
          return [txn.id, files] as const;
        }),
      );
      return Object.fromEntries(results);
    },
    enabled: transactions.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const stats = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.type === "SALE") {
          acc.sales += Number(item.totalAmount ?? 0);
          acc.received += Number(item.paidAmount ?? 0);
          acc.pending += Number(item.dueAmount ?? 0);
        } else {
          acc.payments += Number(item.paidAmount ?? 0);
          acc.received += Number(item.paidAmount ?? 0);
        }
        return acc;
      },
      { sales: 0, payments: 0, received: 0, pending: 0 },
    );
  }, [transactions]);

  const currentBalance = useMemo(() => {
    return transactions.reduce((balance, txn) => {
      if (txn.type === "SALE") {
        return balance + Number(txn.dueAmount ?? 0);
      }
      return balance - Number(txn.paidAmount ?? 0);
    }, 0);
  }, [transactions]);

  return {
    transactions,
    attachments,
    stats,
    currentBalance,
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
}
