import api from "@/shared/api/client";
import type { Customer, LedgerTransaction } from "@/shared/types";

export type CustomerMutationPayload = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  tags?: string;
  dueDate?: string;
};

export type TransactionMutationPayload = {
  customerId: string;
  type: "SALE" | "PAYMENT";
  totalAmount: number;
  paidAmount: number;
  description?: string;
  transactionDate?: string;
  referenceNo?: string;
};

// ────── Customers ─────────────────────────────────────────────────────────────
export const listCustomers = () => api.get<Customer[]>("/ledger/customers");
export const createCustomer = (payload: CustomerMutationPayload) =>
  api.post<Customer>("/ledger/customers", payload);
export const updateCustomer = (id: string, payload: CustomerMutationPayload) =>
  api.put<Customer>(`/ledger/customers/${id}`, payload);
export const deleteCustomer = (id: string) => api.delete(`/ledger/customers/${id}`);

// ────── Transactions ──────────────────────────────────────────────────────────
export const listTransactions = (customerId: string, from?: string, to?: string) =>
  api.get<LedgerTransaction[]>(`/ledger/customers/${customerId}/transactions`, {
    params: { from, to },
  });
export const createTransaction = (payload: TransactionMutationPayload) =>
  api.post<{ transaction: LedgerTransaction; customer: Customer }>("/ledger/transactions", payload);
export const updateTransaction = (id: string, payload: Partial<TransactionMutationPayload>) =>
  api.put<{ transaction: LedgerTransaction; customer: Customer }>(
    `/ledger/transactions/${id}`,
    payload,
  );
export const deleteTransaction = (id: string) =>
  api.delete<{ deleted: boolean; customer: Customer }>(`/ledger/transactions/${id}`);
