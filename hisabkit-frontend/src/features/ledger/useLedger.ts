import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer, LedgerTransaction, Attachment } from '../../shared/types/domain';
import ledgerService from './ledgerService';
import type { AxiosResponse } from 'axios';

export const LEDGER_CUSTOMERS_KEY = ['ledger', 'customers'] as const;
export const LEDGER_TRANSACTIONS_KEY = (customerId: string | undefined) => ['ledger', 'transactions', customerId] as const;

export function useCustomersQuery() {
  return useQuery<Customer[], Error>({
    queryKey: LEDGER_CUSTOMERS_KEY as unknown as readonly unknown[],
    queryFn: async () => {
      const res = await ledgerService.fetchCustomers();
      return res as Customer[];
    },
  });
}

export function useTransactionsQuery(customerId?: string) {
  return useQuery<
    { transactions: LedgerTransaction[]; attachmentsByTransaction: Record<string, Attachment[]> },
    Error
  >({
    queryKey: LEDGER_TRANSACTIONS_KEY(customerId) as unknown as readonly unknown[],
    queryFn: async () => {
      const res = await ledgerService.fetchTransactions((customerId as string) || '');
      return res as { transactions: LedgerTransaction[]; attachmentsByTransaction: Record<string, Attachment[]> };
    },
    enabled: Boolean(customerId),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation<AxiosResponse, Error, unknown>({
    mutationFn: (payload) => ledgerService.createCustomer(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: LEDGER_CUSTOMERS_KEY as unknown as readonly unknown[] }),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation<AxiosResponse, Error, unknown>({
    mutationFn: (payload) => ledgerService.createTransaction(payload),
    onSuccess: () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]) === 'ledger' && String(q.queryKey[1]) === 'transactions' }),
  });
}

export default null;
