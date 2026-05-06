import type { Attachment, ModuleCatalogItem } from "@/shared/types";
import api from "./client";

export const uploadTransactionAttachment = (transactionId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post(`/ledger/transactions/${transactionId}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const listTransactionAttachments = (transactionId: string) =>
  api.get<Attachment[]>(`/ledger/transactions/${transactionId}/attachments`);

export const fetchAttachmentContent = (attachmentId: string) =>
  api.get(`/ledger/attachments/${attachmentId}/content`, { responseType: "blob" });

export const deleteAttachment = (id: string) => api.delete(`/ledger/attachments/${id}`);

export const listModuleCatalog = () => api.get<ModuleCatalogItem[]>("/modules");
