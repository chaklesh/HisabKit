import { api } from './api';
import { STORAGE_KEYS, cacheSet, cacheGet, enqueue, getPendingQueue, setPendingQueue, setLastSync } from './offline';
import type { Customer, LedgerTransaction } from '../types/ledger';

/* ------------------------------------------------------------------ */
/*  Customers                                                         */
/* ------------------------------------------------------------------ */

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await api.get('/ledger/customers');
    const customers = Array.isArray(res.data) ? (res.data as Customer[]) : [];
    await cacheSet(STORAGE_KEYS.CUSTOMERS, customers);
    return customers;
  } catch {
    const cached = await cacheGet<Customer[]>(STORAGE_KEYS.CUSTOMERS);
    return cached ?? [];
  }
}

export async function createCustomer(data: { name: string; phone?: string; email?: string; address?: string; gstNumber?: string }) {
  try {
    const res = await api.post('/ledger/customers', data);
    return res.data;
  } catch {
    await enqueue({ type: 'CREATE_CUSTOMER', payload: data as Record<string, unknown> });
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
  } catch {
    const cached = await cacheGet<LedgerTransaction[]>(cacheKey);
    return cached ?? [];
  }
}

export async function createTransaction(data: {
  customerId: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: number;
  paidAmount: number;
  description?: string;
  transactionDate?: string;
}) {
  try {
    const res = await api.post('/ledger/transactions', data);
    return res.data;
  } catch {
    await enqueue({ type: 'CREATE_TRANSACTION', payload: data as Record<string, unknown> });
    throw new Error('OFFLINE_QUEUED');
  }
}

/* ------------------------------------------------------------------ */
/*  Summary                                                           */
/* ------------------------------------------------------------------ */

export async function fetchSummary() {
  try {
    const res = await api.get('/ledger/summary');
    await cacheSet(STORAGE_KEYS.SUMMARY, res.data);
    return res.data;
  } catch {
    return await cacheGet(STORAGE_KEYS.SUMMARY);
  }
}

/* ------------------------------------------------------------------ */
/*  Sync – flush pending offline mutations to the backend             */
/* ------------------------------------------------------------------ */

export async function syncPendingOperations(): Promise<number> {
  const queue = await getPendingQueue();
  if (queue.length === 0) return 0;

  const remaining = [];
  for (const op of queue) {
    try {
      if (op.type === 'CREATE_TRANSACTION') {
        await api.post('/ledger/transactions', op.payload);
      } else if (op.type === 'CREATE_CUSTOMER') {
        await api.post('/ledger/customers', op.payload);
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
