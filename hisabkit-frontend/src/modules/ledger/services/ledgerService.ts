import api, {
  listTransactionAttachments,
  fetchAttachmentContent,
  getTenantProfile,
  uploadTransactionAttachment as uploadLedgerAttachment,
  deleteAttachment as deleteLedgerAttachment,
} from '@/shared/api/client';
import type { Attachment, LedgerTransaction } from '@/shared/types';

export type { default as Api } from '@/shared/api/client';

async function fetchCustomers() {
  const res = await api.get('/ledger/customers');
  return Array.isArray(res.data) ? res.data : [];
}

async function fetchTransactions(customerId: string) {
  if (!customerId) return { transactions: [], attachmentsByTransaction: {} };
  const res = await api.get(`/ledger/customers/${customerId}/transactions`);
  const list: LedgerTransaction[] = Array.isArray(res.data) ? (res.data as LedgerTransaction[]) : [];

  const attachmentPairs = await Promise.all(
    list.map(async (txn) => {
      try {
        const attachmentRes = await listTransactionAttachments(txn.id);
        const attachments: Attachment[] = Array.isArray(attachmentRes.data) ? attachmentRes.data : [];
        return [txn.id, attachments] as const;
      } catch {
        return [txn.id, []] as const;
      }
    })
  );

  return { transactions: list, attachmentsByTransaction: Object.fromEntries(attachmentPairs) };
}

async function createCustomer(payload: unknown) {
  const res = await api.post('/ledger/customers', payload);
  return res.data;
}

async function updateCustomer(id: string, payload: unknown) {
  const res = await api.put(`/ledger/customers/${id}`, payload);
  return res.data;
}

async function deleteCustomer(id: string) {
  const res = await api.delete(`/ledger/customers/${id}`);
  return res.data;
}

async function createTransaction(payload: unknown) {
  const res = await api.post('/ledger/transactions', payload);
  return res.data;
}

async function updateTransaction(id: string, payload: unknown) {
  const res = await api.put(`/ledger/transactions/${id}`, payload);
  return res.data;
}

async function deleteTransaction(id: string) {
  const res = await api.delete(`/ledger/transactions/${id}`);
  return res.data;
}

async function uploadTransactionAttachment(transactionId: string, file: File) {
  const res = await uploadLedgerAttachment(transactionId, file);
  return res.data;
}

async function deleteAttachment(attachmentId: string) {
  const res = await deleteLedgerAttachment(attachmentId);
  return res.data;
}

export default {
  fetchCustomers,
  fetchTransactions,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactionAttachment,
  deleteAttachment,
  fetchAttachmentContent,
  getTenantProfile,
};
