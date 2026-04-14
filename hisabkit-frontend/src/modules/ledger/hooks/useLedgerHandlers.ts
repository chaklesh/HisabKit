/**
 * useLedgerHandlers hook
 * Encapsulates all async handlers for customer and transaction operations
 * Keeps business logic separate from UI state
 */

import { useCallback } from 'react';
import ledgerService from '../../../features/ledger/ledgerService';
import type { Attachment } from '../../../shared/types/domain';
import type { Customer, CustomerForm, TransactionForm } from '../types/ledgerTypes';

/**
 * Handles for API calls and data mutations
 * Returns organized handler object
 */
export function useLedgerHandlers() {
  // ===== Customer operations =====

  const handleCreateCustomer = useCallback(
    async (form: CustomerForm, onSuccess: (customer: Customer) => Promise<void>) => {
      const response = await ledgerService.createCustomer({
        name: form.name,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        gstNumber: form.gstNumber || null,
      });
      const created = response as Customer;
      await onSuccess(created);
      return created;
    },
    []
  );

  const handleUpdateCustomer = useCallback(async (customerId: string, form: CustomerForm, onSuccess: () => Promise<void>) => {
    await ledgerService.updateCustomer(customerId, {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      gstNumber: form.gstNumber || null,
    });
    await onSuccess();
  }, []);

  const handleDeleteCustomer = useCallback(async (customerId: string, onSuccess: () => Promise<void>) => {
    await ledgerService.deleteCustomer(customerId);
    await onSuccess();
  }, []);

  // ===== Transaction operations =====

  const handleSaveTransaction = useCallback(
    async (
      form: TransactionForm,
      editingId: string | null,
      attachmentFile: File | null,
      onSuccess: (txnId: string) => Promise<void>
    ) => {
      const payload = {
        customerId: form.customerId,
        type: form.type,
        totalAmount: form.type === 'PAYMENT' ? Number(form.paidAmount || 0) : Number(form.totalAmount || 0),
        paidAmount: Number(form.paidAmount || 0),
        description: form.description || null,
        transactionDate: form.transactionDate || null,
      };

      let transactionId: string;
      if (editingId) {
        const res = await ledgerService.updateTransaction(editingId, payload);
        transactionId = res?.transaction?.id || editingId;
      } else {
        const res = await ledgerService.createTransaction(payload);
        transactionId = res?.transaction?.id || '';
      }

      if (attachmentFile && transactionId) {
        await ledgerService.uploadTransactionAttachment(transactionId, attachmentFile);
      }

      await onSuccess(transactionId);
      return transactionId;
    },
    []
  );

  const handleDeleteTransaction = useCallback(async (transactionId: string, onSuccess: () => Promise<void>) => {
    await ledgerService.deleteTransaction(transactionId);
    await onSuccess();
  }, []);

  // ===== Attachment operations =====

  const handleDownloadAttachment = useCallback(async (attachment: Attachment) => {
    const blob = await ledgerService.fetchAttachmentContent(attachment.id);
    const url = URL.createObjectURL(blob.data as Blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = attachment.fileName || 'attachment';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleDeleteAttachment = useCallback(async (attachmentId: string, onSuccess: () => Promise<void>) => {
    await ledgerService.deleteAttachment(attachmentId);
    await onSuccess();
  }, []);

  // ===== Export operations =====

  const downloadCsv = useCallback((fileName: string, headers: string[], rows: Array<Array<string | number>>) => {
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // ===== Import operations =====

  const handleImportBulkData = useCallback(async (file: File, onSuccess: () => Promise<void>) => {
    const text = await file.text();
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least header + 1 row');

    // Add your CSV processing logic here
    await onSuccess();
  }, []);

  return {
    customer: {
      create: handleCreateCustomer,
      update: handleUpdateCustomer,
      delete: handleDeleteCustomer,
    },
    transaction: {
      save: handleSaveTransaction,
      delete: handleDeleteTransaction,
    },
    attachment: {
      download: handleDownloadAttachment,
      delete: handleDeleteAttachment,
    },
    export: {
      downloadCsv,
    },
    import: {
      bulkData: handleImportBulkData,
    },
  };
}
