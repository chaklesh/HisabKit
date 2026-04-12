import { api } from './api';
import { STORAGE_KEYS, cacheSet, cacheGet, enqueue, getPendingQueue, setPendingQueue, setLastSync } from './offline';
import type { AxiosError } from 'axios';
import type { Customer, LedgerSummary, LedgerTransaction, TransactionAttachment } from '../types/ledger';

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
  } catch (error) {
    if (!shouldQueueOffline(error)) {
      throw error;
    }
    await enqueue({ type: 'CREATE_CUSTOMER', payload: data as Record<string, unknown> });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function updateCustomer(customerId: string, data: { name: string; phone?: string; email?: string; address?: string; gstNumber?: string }) {
  const res = await api.put(`/ledger/customers/${customerId}`, data);
  return res.data as Customer;
}

export async function deleteCustomer(customerId: string) {
  const res = await api.delete(`/ledger/customers/${customerId}`);
  return res.data as { deleted: boolean; customerId: string };
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
  attachment?: { uri: string; name: string; type: string };
}) {
  const { attachment, ...txnData } = data;

  try {
    const res = await api.post('/ledger/transactions', txnData);
    const createdTxn = res.data.transaction as LedgerTransaction | undefined;
    let attachmentUploadFailed = false;

    if (attachment && createdTxn?.id) {
      try {
        await uploadTransactionAttachment(createdTxn.id, attachment);
      } catch (attachmentError) {
        console.error('Transaction created but attachment upload failed:', attachmentError);
        attachmentUploadFailed = true;
      }
    }
    return { ...res.data, attachmentUploadFailed };
  } catch (error) {
    if (!shouldQueueOffline(error)) {
      throw error;
    }

    console.error('Create transaction failed, queueing for offline sync:', error);
    await enqueue({ type: 'CREATE_TRANSACTION', payload: data as Record<string, unknown> });
    throw new Error('OFFLINE_QUEUED');
  }
}

export async function updateTransaction(
  transactionId: string,
  data: {
    customerId: string;
    type: 'SALE' | 'PAYMENT';
    totalAmount: number;
    paidAmount: number;
    description?: string;
    transactionDate?: string;
    attachment?: { uri: string; name: string; type: string };
  }
) {
  const { attachment, ...txnData } = data;
  const res = await api.put(`/ledger/transactions/${transactionId}`, txnData);
  let attachmentUploadFailed = false;

  if (attachment) {
    try {
      await uploadTransactionAttachment(transactionId, attachment);
    } catch (attachmentError) {
      console.error('Transaction updated but attachment upload failed:', attachmentError);
      attachmentUploadFailed = true;
    }
  }

  return { ...res.data, attachmentUploadFailed };
}

export async function deleteTransaction(transactionId: string) {
  const res = await api.delete(`/ledger/transactions/${transactionId}`);
  return res.data as { deleted: boolean; customer?: Customer };
}

export async function fetchTransactionAttachments(transactionId: string): Promise<TransactionAttachment[]> {
  const res = await api.get(`/ledger/transactions/${transactionId}/attachments`);
  return Array.isArray(res.data) ? (res.data as TransactionAttachment[]) : [];
}

export async function deleteAttachment(attachmentId: string) {
  const res = await api.delete(`/ledger/attachments/${attachmentId}`);
  return res.data as { deleted: boolean; attachmentId: string };
}

async function uploadTransactionAttachment(transactionId: string, attachment: { uri: string; name: string; type: string }) {
  const formData = new FormData();
  // @ts-ignore
  formData.append('file', {
    uri: attachment.uri,
    name: attachment.name,
    type: attachment.type,
  });

  return await api.post(`/ledger/transactions/${transactionId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Summary                                                           */
/* ------------------------------------------------------------------ */

export async function fetchSummary(): Promise<LedgerSummary | null> {
  try {
    const res = await api.get('/ledger/summary');
    await cacheSet(STORAGE_KEYS.SUMMARY, res.data);
    return res.data as LedgerSummary;
  } catch {
    return await cacheGet<LedgerSummary>(STORAGE_KEYS.SUMMARY);
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
        const payloadWithAttachment = op.payload as {
          customerId: string;
          type: 'SALE' | 'PAYMENT';
          totalAmount: number;
          paidAmount: number;
          description?: string;
          transactionDate?: string;
          attachment?: { uri: string; name: string; type: string };
        };
        const { attachment, ...payload } = payloadWithAttachment;
        const res = await api.post('/ledger/transactions', payload);
        const createdTxn = res.data.transaction;

        if (attachment && createdTxn?.id) {
          try {
            await uploadTransactionAttachment(createdTxn.id, attachment);
          } catch (attachErr) {
            console.error('Queued attachment upload failed for txn:', createdTxn.id, attachErr);
            // We might want to keep the attachment in a separate queue if it fails, 
            // but for now, we'll log it.
          }
        }
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

function shouldQueueOffline(error: unknown) {
  const axiosError = error as AxiosError | undefined;

  if (!axiosError) {
    return false;
  }

  if (axiosError.code === 'ECONNABORTED') {
    return true;
  }

  return !axiosError.response;
}
