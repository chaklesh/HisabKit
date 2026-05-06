import { getTenantProfile } from "@/modules/profile/services/profileApi";
import {
  deleteAttachment as deleteLedgerAttachment,
  fetchAttachmentContent,
  listTransactionAttachments,
  uploadTransactionAttachment as uploadLedgerAttachment,
} from "@/shared/api/commonApi";
import type { Attachment, LedgerTransaction } from "@/shared/types";
import * as ledgerApi from "./ledgerApi";

async function fetchCustomers() {
  const res = await ledgerApi.listCustomers();
  return Array.isArray(res.data) ? res.data : [];
}

async function fetchTransactions(customerId: string, startDate?: string, endDate?: string) {
  if (!customerId) return { transactions: [], attachmentsByTransaction: {} };
  const res = await ledgerApi.listTransactions(customerId, startDate, endDate);
  const list: LedgerTransaction[] = Array.isArray(res.data)
    ? (res.data as LedgerTransaction[])
    : [];

  const attachmentPairs = await Promise.all(
    list.map(async (txn) => {
      try {
        const attachmentRes = await listTransactionAttachments(txn.id);
        const attachments: Attachment[] = Array.isArray(attachmentRes.data)
          ? attachmentRes.data
          : [];
        return [txn.id, attachments] as const;
      } catch {
        return [txn.id, []] as const;
      }
    }),
  );

  return { transactions: list, attachmentsByTransaction: Object.fromEntries(attachmentPairs) };
}

async function createCustomer(payload: ledgerApi.CustomerMutationPayload) {
  const res = await ledgerApi.createCustomer(payload);
  return res.data;
}

async function updateCustomer(id: string, payload: ledgerApi.CustomerMutationPayload) {
  const res = await ledgerApi.updateCustomer(id, payload);
  return res.data;
}

async function deleteCustomer(id: string) {
  const res = await ledgerApi.deleteCustomer(id);
  return res.data;
}

async function createTransaction(payload: ledgerApi.TransactionMutationPayload) {
  const res = await ledgerApi.createTransaction(payload);
  return res.data;
}

async function updateTransaction(
  id: string,
  payload: Partial<ledgerApi.TransactionMutationPayload>,
) {
  const res = await ledgerApi.updateTransaction(id, payload);
  return res.data;
}

async function deleteTransaction(id: string) {
  const res = await ledgerApi.deleteTransaction(id);
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
