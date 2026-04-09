import { api } from './api';
import type { Customer, LedgerTransaction } from '../types/ledger';

export async function fetchCustomers() {
  const response = await api.get('/ledger/customers');
  return Array.isArray(response.data) ? (response.data as Customer[]) : [];
}

export async function fetchCustomerTransactions(customerId: string) {
  const response = await api.get(`/ledger/customers/${customerId}/transactions`);
  return Array.isArray(response.data) ? (response.data as LedgerTransaction[]) : [];
}
