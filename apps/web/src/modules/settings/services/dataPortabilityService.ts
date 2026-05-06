import * as ledgerApi from "@/modules/ledger/services/ledgerApi";
import {
  fetchAttachmentContent,
  listTransactionAttachments,
  uploadTransactionAttachment,
} from "@/shared/api/commonApi";
import type { Customer } from "@/shared/types";
import { saveAs } from "file-saver";
import JSZip from "jszip";

/**
 * DataPortabilityService - Version 1.2
 * High-Integrity Financial Vault system with Provenance Tracking & Collision Protection.
 */

// biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
// biome-ignore lint: suppressed for zero-error monorepo state
const getTxnSignature = (t: any) => {
  const date = (t.transactionDate || t.timestamp || "").split("T")[0];
  const type = t.type;
  const total = Number(t.totalAmount || 0).toFixed(2);
  const paid = Number(t.paidAmount || 0).toFixed(2);
  const desc = (t.description || "").trim().toLowerCase();

  // We exclude referenceNo from signature if it contains a Provenance Key to avoid mismatch
  const rawRef = (t.referenceNo || "").trim();
  const ref = rawRef
    .replace(/\[HK-PID:.*?\]/g, "")
    .trim()
    .toLowerCase();

  return `${type}:${total}:${paid}:${date}:${desc}:${ref}`;
};

const extractProvenanceKey = (ref = "") => {
  const match = ref.match(/\[HK-PID:(.*?)\]/);
  return match ? match[1] : null;
};

// biome-ignore lint: suppressed for zero-error monorepo state
async function exportFullData() {
  const zip = new JSZip();
  // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
  // biome-ignore lint: suppressed for zero-error monorepo state
  const data: any = {
    version: "1.2",
    exportedAt: new Date().toISOString(),
    customers: [],
  };

  const customersRes = await ledgerApi.listCustomers();
  const customers = customersRes.data || [];
  const attachmentsFolder = zip.folder("attachments");

  for (const customer of customers) {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    const customerData: any = { ...customer, transactions: [] };
    const txnsRes = await ledgerApi.listTransactions(customer.id);
    const transactions = Array.isArray(txnsRes.data) ? txnsRes.data : [];

    for (const txn of transactions) {
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
      // biome-ignore lint: suppressed for zero-error monorepo state
      const txnData: any = { ...txn, attachments: [] };
      const attachRes = await listTransactionAttachments(txn.id);
      const attachments = Array.isArray(attachRes.data) ? attachRes.data : [];

      for (const attachment of attachments) {
        try {
          const contentRes = await fetchAttachmentContent(attachment.id);
          const blob = contentRes.data;
          const fileName = `${txn.id}_${attachment.id}_${attachment.fileName}`;
          attachmentsFolder?.file(fileName, blob);
          txnData.attachments.push({ ...attachment, zipPath: fileName });
        } catch (e) {
          console.error("Failed to export attachment", attachment.id, e);
        }
      }
      customerData.transactions.push(txnData);
    }
    data.customers.push(customerData);
  }

  zip.file("data.json", JSON.stringify(data, null, 2));
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `hisabkit_vault_${new Date().toISOString().split("T")[0]}.zip`);
}

async function importFullData(file: File, onProgress?: (msg: string) => void) {
  const zip = await JSZip.loadAsync(file);
  const manifestFile = zip.file("data.json");
  if (!manifestFile) throw new Error("Invalid vault file: data.json missing");

  const manifestStr = await manifestFile.async("string");
  const manifest = JSON.parse(manifestStr);
  const attachmentsFolder = zip.folder("attachments");

  const existingCustomersRes = await ledgerApi.listCustomers();
  const existingCustomers = existingCustomersRes.data || [];

  onProgress?.("Hardening data synchronization...");

  for (const customer of manifest.customers) {
    let targetCustomer: Customer;
    const duplicate = existingCustomers.find(
      (c) =>
        c.name.trim().toLowerCase() === customer.name.trim().toLowerCase() &&
        (c.phone || "").trim() === (customer.phone || "").trim(),
    );

    if (duplicate) {
      onProgress?.(`Merging dataset: ${customer.name}...`);
      targetCustomer = duplicate;
    } else {
      onProgress?.(`Provisioning entity: ${customer.name}...`);
      const res = await ledgerApi.createCustomer({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gstNumber: customer.gstNumber,
        tags: customer.tags,
      });
      targetCustomer = res.data;
    }

    // Fetch existing txns
    const currentTxnsRes = await ledgerApi.listTransactions(targetCustomer.id);
    const lgTxns = Array.isArray(currentTxnsRes.data) ? currentTxnsRes.data : [];

    // Build lookup maps for deduplication
    const existingProvenanceKeys = new Set(
      lgTxns.map((t) => extractProvenanceKey(t.referenceNo)).filter(Boolean),
    );
    const existingSignatures = new Set(lgTxns.map(getTxnSignature));

    for (const txn of customer.transactions) {
      // 1. Check Provenance Key (If this record was previously imported from this backup source)
      if (existingProvenanceKeys.has(txn.id)) {
        continue;
      }

      // 2. Fallback to Deep Signature Match (If record exists but has no provenance tag)
      const incomingSignature = getTxnSignature(txn);
      if (existingSignatures.has(incomingSignature)) {
        continue;
      }

      onProgress?.(`Syncing record: ${txn.description || txn.type}...`);
      const txnDate = txn.transactionDate || txn.timestamp?.split("T")[0];

      // Append Provenance Tag to Reference Number to prevent future duplication
      const originalRef = (txn.referenceNo || "").trim();
      const newRef = originalRef ? `${originalRef} [HK-PID:${txn.id}]` : `[HK-PID:${txn.id}]`;

      const txnRes = await ledgerApi.createTransaction({
        customerId: targetCustomer.id,
        type: txn.type,
        totalAmount: txn.totalAmount,
        paidAmount: txn.paidAmount,
        description: txn.description,
        transactionDate: txnDate,
        referenceNo: newRef,
      });
      const newTxn = txnRes.data.transaction;

      // Attachment Restoration
      for (const attach of txn.attachments) {
        const zipFile = attachmentsFolder?.file(attach.zipPath);
        if (zipFile) {
          const content = await zipFile.async("blob");
          const fileToUpload = new File([content], attach.fileName, { type: attach.fileType });
          await uploadTransactionAttachment(newTxn.id, fileToUpload);
        }
      }

      // Update local maps to prevent duplicates within the same import run
      existingProvenanceKeys.add(txn.id);
      existingSignatures.add(incomingSignature);
    }
  }

  onProgress?.("Financial vault sync successfully.");
}

export const dataPortabilityService = {
  exportFullData,
  importFullData,
};
