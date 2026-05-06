/**
 * useLedgerHandlers hook
 * Encapsulates all async handlers for customer and transaction operations
 * Keeps business logic separate from UI state
 */

import type { Attachment } from "@/shared/types";
import { useCallback } from "react";
import ledgerService from "../services/ledgerService";
import type { Customer, CustomerForm, TransactionForm, LedgerTransaction } from "../types/ledgerTypes";

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
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        gstNumber: form.gstNumber || undefined,
        tags: form.tags || undefined,
        dueDate: form.dueDate || undefined,
      });
      const created = response as Customer;
      await onSuccess(created);
      return created;
    },
    [],
  );

  const handleUpdateCustomer = useCallback(
    async (customerId: string, form: CustomerForm, onSuccess: () => Promise<void>) => {
      await ledgerService.updateCustomer(customerId, {
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        gstNumber: form.gstNumber || undefined,
        tags: form.tags || undefined,
        dueDate: form.dueDate || undefined,
      });
      await onSuccess();
    },
    [],
  );

  const handleDeleteCustomer = useCallback(
    async (customerId: string, onSuccess: () => Promise<void>) => {
      await ledgerService.deleteCustomer(customerId);
      await onSuccess();
    },
    [],
  );

  // ===== Transaction operations =====

  const handleSaveTransaction = useCallback(
    async (
      form: TransactionForm,
      editingId: string | null,
      attachmentFiles: File[],
      onSuccess: (txnId: string) => Promise<void>,
    ) => {
      const payload = {
        customerId: form.customerId,
        type: form.type,
        totalAmount:
          form.type === "PAYMENT" ? Number(form.paidAmount || 0) : Number(form.totalAmount || 0),
        paidAmount: Number(form.paidAmount || 0),
        description: form.description || undefined,
        transactionDate: form.transactionDate || undefined,
      };

      let transactionId: string;
      if (editingId) {
        const res = await ledgerService.updateTransaction(editingId, payload);
        transactionId = res.transaction.id;
      } else {
        const res = await ledgerService.createTransaction(payload);
        transactionId = res.transaction.id;
      }

      if (attachmentFiles && attachmentFiles.length > 0 && transactionId) {
        for (const file of attachmentFiles) {
          await ledgerService.uploadTransactionAttachment(transactionId, file);
        }
      }

      await onSuccess(transactionId);
      return transactionId;
    },
    [],
  );

  const handleDeleteTransaction = useCallback(
    async (transactionId: string, onSuccess: () => Promise<void>) => {
      await ledgerService.deleteTransaction(transactionId);
      await onSuccess();
    },
    [],
  );

  // ===== Attachment operations =====

  const handleDownloadAttachment = useCallback(async (attachment: Attachment) => {
    const blob = await ledgerService.fetchAttachmentContent(attachment.id);
    const url = URL.createObjectURL(blob.data as Blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = attachment.fileName || "attachment";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, []);

  const handleDeleteAttachment = useCallback(
    async (attachmentId: string, onSuccess: () => Promise<void>) => {
      await ledgerService.deleteAttachment(attachmentId);
      await onSuccess();
    },
    [],
  );

  // ===== Export operations =====

  const downloadCsv = useCallback(
    (fileName: string, headers: string[], rows: Array<Array<string | number>>) => {
      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [],
  );

  // ===== Helper for Robust Matching =====

  const normalizeKey = useCallback((str: string) => {
    return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  }, []);

  // ===== Import operations =====

  const handleImportBulkData = useCallback(async (file: File, onSuccess: () => Promise<void>) => {
    const text = await file.text();
    
    const parseCsvLine = (line: string) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === "," && !inQuotes) { result.push(current); current = ""; }
        else current += char;
      }
      result.push(current);
      return result.map(c => c.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
    };

    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    const rows = lines.map(line => parseCsvLine(line));
    if (rows.length < 2) throw new Error("File is empty or missing headers");

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, "_").trim());
    const dataRows = rows.slice(1);

    let globalDateFormat: "DMY" | "MDY" = "DMY";
    const dateIdx = headers.indexOf("date");
    if (dateIdx !== -1) {
      for (const row of dataRows) {
        const val = row[dateIdx];
        if (!val) continue;
        const parts = val.split(/[/-]/).map(p => parseInt(p.trim(), 10));
        if (parts.length === 3 && parts[0].toString().length <= 2) {
          if (parts[0] > 12) { globalDateFormat = "DMY"; break; }
          if (parts[1] > 12) { globalDateFormat = "MDY"; break; }
        }
      }
    }

    const normalizeDate = (val: string) => {
      if (!val) return null;
      const parts = val.split(/[/-]/).map(p => p.trim());
      if (parts.length !== 3) return null;
      let day, month, year;
      if (parts[0].length === 4) [year, month, day] = parts;
      else if (globalDateFormat === "MDY") [month, day, year] = parts;
      else [day, month, year] = parts;
      const y = year.length === 2 ? `20${year}` : year;
      return `${y}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const validationErrors: string[] = [];
    const validatedData: any[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; 
      const rawName = row[headers.indexOf("name")] || row[headers.indexOf("customer")] || row[0];
      const name = (rawName || "").trim();
      const typeStr = (row[headers.indexOf("type")] || "SALE").trim().toUpperCase();
      const isCustomerOnly = typeStr === "CUSTOMER_ONLY" || typeStr === "NONE" || typeStr === "";
      let totalVal = Number(row[headers.indexOf("total_amount")] || row[headers.indexOf("sale_amount")] || row[headers.indexOf("amount")] || 0);
      let paidVal = Number(row[headers.indexOf("paid_amount")] || row[headers.indexOf("payment_amount")] || 0);
      const dateStr = normalizeDate(row[headers.indexOf("date")]);

      if (!name) validationErrors.push(`Row ${rowNum}: Name is missing.`);
      if (!isCustomerOnly) {
        if (typeStr === "PAYMENT") {
          if (paidVal === 0 && totalVal > 0) paidVal = totalVal;
          totalVal = paidVal;
        } else if (typeStr === "SALE" && totalVal === 0 && paidVal > 0) totalVal = paidVal;
        if (typeStr === "SALE" && totalVal <= 0) validationErrors.push(`Row ${rowNum}: Sale total must be > 0.`);
        else if (typeStr === "PAYMENT" && paidVal <= 0) validationErrors.push(`Row ${rowNum}: Payment amount must be > 0.`);
        if (!dateStr) validationErrors.push(`Row ${rowNum}: Invalid date format.`);
      }

      if (validationErrors.length === 0) {
        const rawCustId = row[headers.indexOf("customer_id")] || row[headers.indexOf("customer_code")] || "";
        validatedData.push({
          customerId: (rawCustId || "").trim(),
          name,
          phone: (row[headers.indexOf("phone")] || row[headers.indexOf("mobile")] || "").replace(/\D/g, ""),
          email: row[headers.indexOf("email")] || "",
          address: row[headers.indexOf("address")] || "",
          dueDate: normalizeDate(row[headers.indexOf("due_date")] || row[headers.indexOf("due")]),
          tags: row[headers.indexOf("tags")] || row[headers.indexOf("categories")] || "",
          referenceNo: row[headers.indexOf("reference_no")] || row[headers.indexOf("ref_no")] || "",
          type: (isCustomerOnly ? "CUSTOMER_ONLY" : typeStr) as "SALE" | "PAYMENT" | "CUSTOMER_ONLY",
          total: totalVal,
          paid: paidVal,
          description: (row[headers.indexOf("description")] || row[headers.indexOf("note")] || row[headers.indexOf("desc")] || "").trim(),
          date: dateStr
        });
      }
    }

    if (validationErrors.length > 0) {
      const summary = `Import Failed! ${validationErrors.length} errors found:\n` + validationErrors.slice(0, 5).join("\n") + (validationErrors.length > 5 ? "\n..." : "");
      throw new Error(summary);
    }

    const existingCustomers = await ledgerService.fetchCustomers();
    const idMap = new Map<string, any>();
    const keyMap = new Map<string, any>();
    for (const c of existingCustomers) {
      idMap.set(c.id, c);
      if (c.customerCode) idMap.set(c.customerCode, c);
      const nameKey = normalizeKey(c.name);
      const phoneKey = (c.phone || "").replace(/\D/g, "");
      keyMap.set(`${nameKey}|${phoneKey}`, c);
    }

    const transactionCache = new Map<string, LedgerTransaction[]>();
    let customerCreated = 0, customerUpdated = 0, transactionCreated = 0, transactionUpdated = 0;

    for (const data of validatedData) {
      let customer = data.customerId ? idMap.get(data.customerId) : null;
      if (!customer) {
        const nameKey = normalizeKey(data.name);
        customer = keyMap.get(`${nameKey}|${data.phone}`);
      }

      let customerId: string;
      if (!customer) {
        customer = await ledgerService.createCustomer({
          name: data.name, phone: data.phone || undefined, email: data.email || undefined,
          address: data.address || undefined, dueDate: data.dueDate || undefined, tags: data.tags || undefined,
        });
        customerId = customer!.id;
        idMap.set(customerId, customer);
        if (customer.customerCode) idMap.set(customer.customerCode, customer);
        keyMap.set(`${data.name.toLowerCase()}|${data.phone}`, customer);
        customerCreated++;
      } else {
        customerId = customer.id;
        const hasChanges = data.name !== customer.name || data.phone !== (customer.phone || "") ||
          (data.email && data.email !== customer.email) || (data.address && data.address !== customer.address) ||
          (data.tags && data.tags !== (customer.tags || "")) || (data.dueDate && data.dueDate !== customer.dueDate);
        if (hasChanges) {
          await ledgerService.updateCustomer(customerId, {
            ...customer, name: data.name, phone: data.phone, email: data.email || customer.email,
            address: data.address || customer.address, tags: data.tags || customer.tags, dueDate: data.dueDate || customer.dueDate,
          });
          customerUpdated++;
        }
      }

      if (customerId && data.type !== "CUSTOMER_ONLY" && (data.total > 0 || data.paid > 0)) {
        let txns = transactionCache.get(customerId);
        if (!txns) {
          const res = await ledgerService.fetchTransactions(customerId);
          txns = res.transactions;
          transactionCache.set(customerId, txns);
        }

        const existingTxn = data.referenceNo ? txns.find(t => t.referenceNo === data.referenceNo) : null;
        if (existingTxn) {
          const hasChanges = Math.abs(existingTxn.totalAmount - data.total) > 0.01 || Math.abs(existingTxn.paidAmount - data.paid) > 0.01 ||
            existingTxn.description !== data.description || existingTxn.timestamp?.slice(0, 10) !== data.date;
          if (hasChanges) {
            await ledgerService.updateTransaction(existingTxn.id, {
              customerId, type: data.type as any, totalAmount: data.total, paidAmount: data.paid,
              description: data.description, transactionDate: data.date,
            });
            transactionUpdated++;
          }
        } else {
          const isDuplicate = txns.some(t => {
            const tDate = t.timestamp?.slice(0, 10);
            const amtMatch = Math.abs(t.totalAmount - data.total) < 0.01 && Math.abs(t.paidAmount - data.paid) < 0.01;
            const tDesc = (t.description || "").trim().toLowerCase();
            const rowDesc = data.description.toLowerCase();
            return tDate === data.date && amtMatch && (tDesc === rowDesc || tDesc === "" || tDesc === "imported" || rowDesc === "imported" || rowDesc === "");
          });
          if (!isDuplicate) {
            const res = await ledgerService.createTransaction({
              customerId, type: data.type as any, totalAmount: data.total, paidAmount: data.paid,
              description: data.description, transactionDate: data.date,
            });
            txns.push(res.transaction);
            transactionCreated++;
          }
        }
      }
    }

    if (customerCreated > 0 || customerUpdated > 0 || transactionCreated > 0 || transactionUpdated > 0) await onSuccess();
    return { customerCreated, customerUpdated, transactionCreated, transactionUpdated };
  }, []);

  const handleExportAllData = useCallback(async (customers: any[], fetchTransactions: (id: string) => Promise<any>) => {
    // Standardizing export headers with professional IDs for bulk updates
    const headers = ["Customer_Code", "Reference_No", "Name", "Phone", "Email", "Address", "Due_Date", "Tags", "Date", "Type", "Total_Amount", "Paid_Amount", "Description"];
    const rows = [headers];
    for (const c of customers) {
      const { transactions } = await fetchTransactions(c.id);
      const common = [c.customerCode || c.id, "", c.name, c.phone || "", c.email || "", c.address || "", c.dueDate || "", c.tags || ""];
      if (transactions.length === 0) rows.push([...common, "", "CUSTOMER_ONLY", "0", "0", "No Transactions"]);
      else {
        for (const t of transactions) {
          rows.push([c.customerCode || c.id, t.referenceNo || "", c.name, c.phone || "", c.email || "", c.address || "", c.dueDate || "", c.tags || "", t.timestamp?.slice(0, 10) || "", t.type, String(t.totalAmount || 0), String(t.paidAmount || 0), t.description || ""]);
        }
      }
    }
    const csvContent = rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `hisabkit-full-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      allData: handleExportAllData,
    },
    import: {
      bulkData: handleImportBulkData,
    },
  };
}
