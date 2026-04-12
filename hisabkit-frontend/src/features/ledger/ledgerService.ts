import api, { listTransactionAttachments } from '../../api/api';

export type { default as Api } from '../../api/api';

async function fetchCustomers() {
  const res = await api.get('/ledger/customers');
  return Array.isArray(res.data) ? res.data : [];
}

async function fetchTransactions(customerId: string) {
  if (!customerId) return { transactions: [], attachmentsByTransaction: {} };
  const res = await api.get(`/ledger/customers/${customerId}/transactions`);
  const list = Array.isArray(res.data) ? res.data : [];

  const attachmentPairs = await Promise.all(
    list.map(async (txn: any) => {
      try {
        const attachmentRes = await listTransactionAttachments(txn.id);
        const attachments = Array.isArray(attachmentRes.data) ? attachmentRes.data : [];
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
  // delegate to api module which implements multipart upload
  // keep signature consistent with existing usage
  const res = await (api as any).uploadTransactionAttachment(transactionId, file);
  return res.data;
}

async function deleteAttachment(attachmentId: string) {
  const res = await (api as any).deleteAttachment(attachmentId);
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
};
