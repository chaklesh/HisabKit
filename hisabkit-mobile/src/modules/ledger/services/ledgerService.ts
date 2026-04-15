import { api } from '../../../shared/api/apiClient';
import { STORAGE_KEYS, cacheSet, cacheGet, enqueue } from '../../../shared/services/offlineService';
import type { AxiosError } from 'axios';
import type { Customer, LedgerSummary, LedgerTransaction } from '../../../shared/types/ledger';

/* ------------------------------------------------------------------ */
/*  Customers                                                         */
/* ------------------------------------------------------------------ */

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await api.get('/ledger/customers');
    const customers = Array.isArray(res.data) ? (res.data as Customer[]) : [];
    await cacheSet(STORAGE_KEYS.CUSTOMERS, customers);
    return customers;
  } catch (error) {
    const cached = await cacheGet<Customer[]>(STORAGE_KEYS.CUSTOMERS);
    if (cached) return cached;
    throw error;
  }
}

export async function createCustomer(data: Partial<Customer>) {
  try {
    const res = await api.post('/ledger/customers', data);
    return res.data as Customer;
  } catch (error) {
    if (!shouldQueueOffline(error)) throw error;
    await enqueue({ type: 'CREATE_CUSTOMER', payload: data as Record<string, any> });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function updateCustomer(customerId: string, data: Partial<Customer>) {
  try {
    const res = await api.put(`/ledger/customers/${customerId}`, data);
    return res.data as Customer;
  } catch (error) {
    if (!shouldQueueOffline(error)) throw error;
    await enqueue({ 
      type: 'UPDATE_CUSTOMER', 
      payload: data as Record<string, any>,
      metadata: { customerId }
    });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const res = await api.delete(`/ledger/customers/${customerId}`);
    return res.data as { deleted: boolean; customerId: string };
  } catch (error) {
    if (!shouldQueueOffline(error)) throw error;
    await enqueue({ 
      type: 'DELETE_CUSTOMER', 
      payload: {},
      metadata: { customerId }
    });
    throw new Error('OFFLINE_QUEUED');
  }
}

/* ------------------------------------------------------------------ */
/*  Transactions                                                      */
/* ------------------------------------------------------------------ */

export async function fetchTransactions(customerId: string): Promise<LedgerTransaction[]> {
  const cacheKey = `${STORAGE_KEYS.TRANSACTIONS_PREFIX}${customerId}`;
  try {
    const res = await api.get(`/ledger/customers/${customerId}/transactions`);
    const txns = Array.isArray(res.data) ? (res.data as LedgerTransaction[]) : [];
    await cacheSet(cacheKey, txns);
    return txns;
  } catch (error) {
    const cached = await cacheGet<LedgerTransaction[]>(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

export async function createTransaction(data: any) {
  try {
    const res = await api.post('/ledger/transactions', data);
    return res.data;
  } catch (error) {
    if (!shouldQueueOffline(error)) throw error;
    await enqueue({ type: 'CREATE_TRANSACTION', payload: data });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function updateTransaction(transactionId: string, data: any) {
  try {
    const res = await api.put(`/ledger/transactions/${transactionId}`, data);
    return res.data;
  } catch (error) {
    if (!shouldQueueOffline(error)) throw error;
    await enqueue({ 
      type: 'UPDATE_TRANSACTION', 
      payload: data,
      metadata: { transactionId }
    });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const res = await api.delete(`/ledger/transactions/${transactionId}`);
    return res.data;
  } catch (error) {
    if (!shouldQueueOffline(error)) throw error;
    await enqueue({ 
      type: 'DELETE_TRANSACTION', 
      payload: {},
      metadata: { transactionId }
    });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function fetchTransactionAttachments(transactionId: string): Promise<any[]> {
  try {
    const res = await api.get(`/ledger/transactions/${transactionId}/attachments`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error('Failed to fetch attachments:', error);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*  Summary                                                           */
/* ------------------------------------------------------------------ */

export async function fetchSummary(): Promise<LedgerSummary | null> {
  try {
    const res = await api.get('/ledger/summary');
    await cacheSet(STORAGE_KEYS.SUMMARY, res.data);
    return res.data as LedgerSummary;
  } catch (error) {
    const cached = await cacheGet<LedgerSummary>(STORAGE_KEYS.SUMMARY);
    if (cached) return cached;
    throw error;
  }
}

/* ------------------------------------------------------------------ */
/*  Sync                                                              */
/* ------------------------------------------------------------------ */

export async function syncPendingOperations(): Promise<number> {
  const { getPendingQueue, setPendingQueue, setLastSync } = await import('../../../shared/services/offlineService');
  const queue = await getPendingQueue();
  if (queue.length === 0) return 0;

  const remaining = [];
  for (const op of queue) {
    try {
      switch (op.type) {
        case 'CREATE_TRANSACTION':
          await api.post('/ledger/transactions', op.payload);
          break;
        case 'UPDATE_TRANSACTION':
          await api.put(`/ledger/transactions/${op.metadata?.transactionId}`, op.payload);
          break;
        case 'DELETE_TRANSACTION':
          await api.delete(`/ledger/transactions/${op.metadata?.transactionId}`);
          break;
        case 'CREATE_CUSTOMER':
          await api.post('/ledger/customers', op.payload);
          break;
        case 'UPDATE_CUSTOMER':
          await api.put(`/ledger/customers/${op.metadata?.customerId}`, op.payload);
          break;
        case 'DELETE_CUSTOMER':
          await api.delete(`/ledger/customers/${op.metadata?.customerId}`);
          break;
      }
    } catch {
      remaining.push(op);
    }
  }

  await setPendingQueue(remaining);
  const synced = queue.length - remaining.length;
  if (synced > 0) {
    await setLastSync(new Date().toISOString());
  }
  return synced;
}

function shouldQueueOffline(error: unknown) {
  const axiosError = error as AxiosError | undefined;
  if (!axiosError) return false;
  return !axiosError.response || axiosError.code === 'ECONNABORTED';
}

