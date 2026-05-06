import type { Attachment, Customer, LedgerTransaction } from "@/shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ledgerService from "./ledgerService";

import type * as ledgerApi from "./ledgerApi";

export const LEDGER_CUSTOMERS_KEY = ["ledger", "customers"] as const;
export const LEDGER_TRANSACTIONS_KEY = (
  customerId: string | undefined,
  startDate?: string,
  endDate?: string,
) => ["ledger", "transactions", customerId, startDate, endDate] as const;

export function useCustomersQuery() {
  return useQuery<Customer[], Error>({
    queryKey: LEDGER_CUSTOMERS_KEY as unknown as readonly unknown[],
    queryFn: async () => {
      const res = await ledgerService.fetchCustomers();
      return res as Customer[];
    },
  });
}

export function useTransactionsQuery(customerId?: string, startDate?: string, endDate?: string) {
  return useQuery<
    { transactions: LedgerTransaction[]; attachmentsByTransaction: Record<string, Attachment[]> },
    Error
  >({
    queryKey: LEDGER_TRANSACTIONS_KEY(
      customerId,
      startDate,
      endDate,
    ) as unknown as readonly unknown[],
    queryFn: async () => {
      const res = await ledgerService.fetchTransactions(
        (customerId as string) || "",
        startDate,
        endDate,
      );
      return res as {
        transactions: LedgerTransaction[];
        attachmentsByTransaction: Record<string, Attachment[]>;
      };
    },
    enabled: Boolean(customerId),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation<Customer, Error, ledgerApi.CustomerMutationPayload>({
    mutationFn: (payload) => ledgerService.createCustomer(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: LEDGER_CUSTOMERS_KEY as unknown as readonly unknown[] }),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation<
    { transaction: LedgerTransaction; customer: Customer },
    Error,
    ledgerApi.TransactionMutationPayload
  >({
    mutationFn: (payload) => ledgerService.createTransaction(payload),
    onSuccess: () =>
      qc.invalidateQueries({
        predicate: (q) =>
          String(q.queryKey[0]) === "ledger" && String(q.queryKey[1]) === "transactions",
      }),
  });
}

export default null;
