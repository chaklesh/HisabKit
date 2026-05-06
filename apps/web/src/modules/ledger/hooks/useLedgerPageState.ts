import { useTenantProfileQuery } from "@/modules/profile/services/useProfile";
import type { Attachment } from "@/shared/types";
import { formatDate, today } from "@/shared/utils/ledgerUtils";
import { useEffect, useMemo } from "react";
import {
  applyDueDateMap,
  buildDueDateReport,
  computeTotals,
  countOverdueCustomers,
  filterAndSortCustomers,
} from "../selectors/ledgerDashboardSelectors";
import ledgerService from "../services/ledgerService";
import { useCustomersQuery, useTransactionsQuery } from "../services/useLedger";
import type {
  Customer,
  CustomerForm,
  LedgerTransaction,
  TransactionForm,
} from "../types/ledgerTypes";
import { buildReminderMessage } from "../utils/ledgerDashboardHelpers";
import { generateLedgerPdf } from "../utils/ledgerPdfGenerator";
import { useLedgerHandlers } from "./useLedgerHandlers";
import { useLedgerState } from "./useLedgerState";

type ApiError = { response?: { data?: { message?: string } } };

const getErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || fallback;
};

export function useLedgerPageState() {
  const state = useLedgerState();
  const handlers = useLedgerHandlers();

  const customersQuery = useCustomersQuery();
  const transactionsQuery = useTransactionsQuery(
    state.selectedCustomerId || undefined,
    state.txnStartDate || undefined,
    state.txnEndDate || undefined,
  );
  const tenantQuery = useTenantProfileQuery();

  // Read customerId from URL for deep-linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("customerId");
    if (cid && cid !== state.selectedCustomerId) {
      state.setSelectedCustomerId(cid);
    }
  }, [state.selectedCustomerId, state.setSelectedCustomerId]);

  const customers = customersQuery.data || [];
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === state.selectedCustomerId) ?? null,
    [customers, state.selectedCustomerId],
  );

  const transactions = useMemo(
    () =>
      [...(transactionsQuery.data?.transactions || [])].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [transactionsQuery.data],
  );
  const attachmentsByTransaction = useMemo(
    () => transactionsQuery.data?.attachmentsByTransaction || {},
    [transactionsQuery.data],
  );

  const dueStorageKey = useMemo(
    () => `hisabkit_due_dates_${tenantQuery.data?.id || "default"}`,
    [tenantQuery.data?.id],
  );

  const customersWithDueDate = useMemo(
    () => applyDueDateMap(customers as Customer[], state.dueDateByCustomer),
    [customers, state.dueDateByCustomer],
  );

  const filteredCustomers = useMemo(
    () =>
      filterAndSortCustomers({
        customers: customersWithDueDate,
        searchTerm: state.searchTerm,
        customerFilter: state.customerFilter,
        customerSort: state.customerSort,
      }),
    [customersWithDueDate, state.searchTerm, state.customerFilter, state.customerSort],
  );

  const totals = useMemo(() => computeTotals(customersWithDueDate), [customersWithDueDate]);
  const overdueCount = useMemo(
    () => countOverdueCustomers(customersWithDueDate),
    [customersWithDueDate],
  );

  const reportData = useMemo(
    () =>
      buildDueDateReport({
        customers: customersWithDueDate,
        reportSearchTerm: state.reportSearchTerm,
        reportDueFilter: state.reportDueFilter,
        reportSortField: state.reportSortField,
      }),
    [customersWithDueDate, state.reportSearchTerm, state.reportDueFilter, state.reportSortField],
  );

  const smsMessage = useMemo(
    () =>
      buildReminderMessage({
        template: tenantQuery.data?.smsTemplate,
        selectedCustomer: selectedCustomer as Customer,
        businessName: tenantQuery.data?.name,
      }),
    [selectedCustomer, tenantQuery.data],
  );

  const whatsappMessage = useMemo(
    () =>
      buildReminderMessage({
        template: tenantQuery.data?.whatsappTemplate || tenantQuery.data?.smsTemplate,
        selectedCustomer: selectedCustomer as Customer,
        businessName: tenantQuery.data?.name,
      }),
    [selectedCustomer, tenantQuery.data],
  );

  const customerPhoneDigits = (selectedCustomer?.phone || "").replace(/\D/g, "");
  const whatsappLink = customerPhoneDigits
    ? `https://wa.me/${customerPhoneDigits}?text=${encodeURIComponent(whatsappMessage)}`
    : "";
  const smsLink = customerPhoneDigits
    ? `sms:${customerPhoneDigits}?body=${encodeURIComponent(smsMessage)}`
    : "";

  const clearMessages = () => {
    state.setError("");
    state.setNotice("");
  };

  const selectCustomer = (customer: Customer) => {
    state.setSelectedCustomerId(customer.id);
    state.setTransactionForm((prev) => ({ ...prev, customerId: customer.id }));
    state.setCustomerForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      gstNumber: customer.gstNumber || "",
      tags: customer.tags || "",
      dueDate: state.dueDateByCustomer[customer.id] || "",
    });
    state.setIsEditingCustomer(true);
  };

  const openCustomerDrawer = (forceNew = false) => {
    if (selectedCustomer && !forceNew) {
      state.setIsEditingCustomer(true);
      state.setCustomerForm({
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
        gstNumber: selectedCustomer.gstNumber || "",
        tags: selectedCustomer.tags || "",
        dueDate: state.dueDateByCustomer[selectedCustomer.id] || "",
      });
    } else {
      state.setIsEditingCustomer(false);
      state.setCustomerForm(state.INITIAL_CUSTOMER_FORM);
    }
    state.setDrawerMode("CUSTOMER");
    state.setIsDrawerOpen(true);
  };

  const openTransactionDrawer = (type: "SALE" | "PAYMENT") => {
    if (!state.selectedCustomerId) {
      state.setError("Please select a customer first.");
      return;
    }

    state.resetTransactionForm(state.selectedCustomerId);
    state.setTransactionForm((prev) => ({
      ...prev,
      customerId: state.selectedCustomerId,
      type,
      paidAmount: type === "PAYMENT" ? prev.paidAmount : "",
      totalAmount: type === "SALE" ? prev.totalAmount : "",
    }));
    state.setDrawerMode("TRANSACTION");
    state.setIsDrawerOpen(true);
  };

  const handleCustomerSubmit = async (formValues: CustomerForm) => {
    state.setIsSubmittingCustomer(true);
    clearMessages();
    try {
      if (state.isEditingCustomer && state.selectedCustomerId) {
        await handlers.customer.update(state.selectedCustomerId, formValues, async () => {
          state.setDueDateByCustomer((prev) => ({
            ...prev,
            [state.selectedCustomerId]: formValues.dueDate || "",
          }));
          await customersQuery.refetch();
        });
        state.setNotice("Customer updated successfully.");
      } else {
        const created = await handlers.customer.create(formValues, async () => {
          await customersQuery.refetch();
        });
        if (formValues.dueDate && created.id) {
          state.setDueDateByCustomer((prev) => ({ ...prev, [created.id]: formValues.dueDate }));
        }
        state.setSelectedCustomerId(created.id);
        state.setTransactionForm((prev) => ({ ...prev, customerId: created.id }));
        state.setIsEditingCustomer(true);
        state.setNotice("Customer added successfully.");
      }
      state.setCustomerForm(state.INITIAL_CUSTOMER_FORM);
      state.closeDrawer();
    } catch (error: unknown) {
      state.setError(getErrorMessage(error, "Unable to save customer right now."));
    } finally {
      state.setIsSubmittingCustomer(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!state.selectedCustomerId) return;

    clearMessages();
    state.setIsSubmittingCustomer(true);
    try {
      const deletedCustomerId = state.selectedCustomerId;
      await handlers.customer.delete(deletedCustomerId, async () => {
        await customersQuery.refetch();
      });
      state.setDueDateByCustomer((prev) => {
        const next = { ...prev };
        delete next[deletedCustomerId];
        return next;
      });
      state.setSelectedCustomerId("");
      state.setCustomerForm(state.INITIAL_CUSTOMER_FORM);
      state.setIsEditingCustomer(false);
      state.setNotice("Customer deleted.");
      state.closeDrawer();
    } catch (error: unknown) {
      state.setError(getErrorMessage(error, "Unable to delete customer right now."));
    } finally {
      state.setIsSubmittingCustomer(false);
      state.setConfirmDeleteCustomer(false);
    }
  };

  const handleOpenTransactionEdit = (transaction: LedgerTransaction) => {
    state.setEditingTransactionId(transaction.id);
    state.setAttachmentFiles([]);
    state.setTransactionForm({
      customerId: transaction.customerId,
      type: transaction.type,
      totalAmount: String(transaction.totalAmount || ""),
      paidAmount: String(transaction.paidAmount || ""),
      description: transaction.description || "",
      transactionDate: transaction.timestamp?.slice(0, 10) || today(),
    });
    state.setDrawerMode("TRANSACTION");
    state.setIsDrawerOpen(true);
  };

  const handleTransactionSubmit = async (formValues: TransactionForm) => {
    state.setIsSubmittingTransaction(true);
    clearMessages();
    try {
      await handlers.transaction.save(
        formValues,
        state.editingTransactionId,
        state.attachmentFiles,
        async () => {
          await customersQuery.refetch();
          if (state.selectedCustomerId) {
            await transactionsQuery.refetch();
          }
        },
      );
      state.setNotice(
        state.editingTransactionId
          ? "Transaction updated successfully."
          : "Transaction added successfully.",
      );
      state.resetTransactionForm(formValues.customerId);
      state.closeDrawer();
    } catch (error: unknown) {
      state.setError(getErrorMessage(error, "Unable to save transaction right now."));
    } finally {
      state.setIsSubmittingTransaction(false);
    }
  };

  const handleDeleteTransaction = async () => {
    const transactionId = state.confirmDeleteTransactionId;
    if (!transactionId) return;

    clearMessages();
    try {
      await handlers.transaction.delete(transactionId, async () => {
        await customersQuery.refetch();
        if (state.selectedCustomerId) {
          await transactionsQuery.refetch();
        }
      });
      if (state.editingTransactionId === transactionId) {
        state.resetTransactionForm(state.selectedCustomerId);
      }
      state.setNotice("Transaction deleted.");
    } catch (error: unknown) {
      state.setError(getErrorMessage(error, "Unable to delete transaction right now."));
    } finally {
      state.setConfirmDeleteTransactionId(null);
    }
  };

  const handleViewAttachment = async (attachment: Attachment) => {
    clearMessages();
    const ext = attachment.fileName?.split(".").pop()?.toLowerCase() || "";
    const isImage =
      attachment.fileType?.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
    const isPdf = attachment.fileType === "application/pdf" || ext === "pdf";

    if (isImage || isPdf) {
      try {
        const res = await ledgerService.fetchAttachmentContent(attachment.id);
        // Explicitly set the MIME type from the attachment metadata or fallback
        const mimeType = attachment.fileType || (isPdf ? "application/pdf" : "image/jpeg");
        const blob = new Blob([res.data], { type: mimeType });
        const url = URL.createObjectURL(blob);

        state.setLightbox({
          name: attachment.fileName,
          type: isImage ? "image" : "pdf",
          url,
        });
      } catch {
        state.setError("Unable to load attachment preview.");
      }
    } else {
      try {
        await handlers.attachment.download(attachment);
      } catch {
        state.setError("Unable to download attachment.");
      }
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      state.setIsSubmittingCustomer(true);
      try {
        const res = await handlers.import.bulkData(file, async () => {
          await customersQuery.refetch();
        });
        
        const total = res.customerCreated + res.customerUpdated + res.transactionCreated + res.transactionUpdated;
        if (total === 0) {
          state.setNotice("No new data found in file.");
        } else {
          state.setNotice(`Sync Complete: ${res.customerCreated} new, ${res.customerUpdated} updated.`);
        }
      } catch (err: any) {
        state.setError(err.message || "Import failed.");
      } finally {
        state.setIsSubmittingCustomer(false);
      }
    };
    input.click();
  };

  const handleExport = () => {
    handlers.export.downloadCsv(
      `customers-${today()}.csv`,
      ["Name", "Phone", "Email", "Address", "GST", "Tags"],
      customers.map((c) => [
        c.name,
        c.phone || "",
        c.email || "",
        c.address || "",
        c.gstNumber || "",
        c.tags || "",
      ]),
    );
    state.setNotice("Customer list exported.");
  };

  const handleExportReportCsv = () => {
    handlers.export.downloadCsv(
      `customer-report-${today()}.csv`,
      ["Name", "Phone", "Address", "Due Date", "Balance", "Balance Type"],
      reportData.map((customer) => {
        const balance = Number(customer.totalBalance || 0);
        return [
          customer.name,
          customer.phone || "",
          customer.address || "",
          customer.dueDate || "",
          Math.abs(balance).toFixed(2),
          balance >= 0 ? "TO_COLLECT" : "TO_PAY",
        ];
      }),
    );
    state.setNotice("Report exported.");
  };

  useEffect(() => {
    // Only auto-select first customer on desktop (width >= 1280px for 'xl')
    if (window.innerWidth >= 1280 && customers.length > 0 && !state.selectedCustomerId) {
      state.setSelectedCustomerId(customers[0].id);
    }
  }, [customers, state.selectedCustomerId]);

  useEffect(() => {
    const raw = localStorage.getItem(dueStorageKey);
    if (!raw) {
      state.setDueDateByCustomer({});
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      state.setDueDateByCustomer(parsed || {});
    } catch {
      state.setDueDateByCustomer({});
    }
  }, [dueStorageKey]);

  useEffect(() => {
    localStorage.setItem(dueStorageKey, JSON.stringify(state.dueDateByCustomer));
  }, [state.dueDateByCustomer, dueStorageKey]);

  useEffect(() => {
    if (!state.error) return;
    const timer = window.setTimeout(() => state.setError(""), 5000);
    return () => window.clearTimeout(timer);
  }, [state.error]);

  useEffect(() => {
    if (!state.notice) return;
    const timer = window.setTimeout(() => state.setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [state.notice]);

  return {
    state,
    queries: {
      customersQuery,
      transactionsQuery,
    },
    derived: {
      customers,
      selectedCustomer: selectedCustomer as Customer,
      transactions,
      attachmentsByTransaction,
      filteredCustomers,
      totals,
      overdueCount,
      reportData,
      smsLink,
      whatsappLink,
    },
    actions: {
      selectCustomer,
      openCustomerDrawer,
      openTransactionDrawer,
      handleCustomerSubmit,
      handleDeleteCustomer,
      handleOpenTransactionEdit,
      handleTransactionSubmit,
      handleDeleteTransaction,
      handleViewAttachment,
      handleImport,
      handleExport,
      handleExportReportCsv,
      handleBackToList: () => {
        state.setSelectedCustomerId("");
      },
      handleDeleteAttachment: async (attachmentId: string) => {
        clearMessages();
        try {
          await handlers.attachment.delete(attachmentId, async () => {
            if (state.selectedCustomerId) {
              await transactionsQuery.refetch();
            }
          });
          state.setNotice("Attachment removed.");
        } catch (error: unknown) {
          state.setError(getErrorMessage(error, "Unable to delete attachment."));
        }
      },
      handleExportLedger: () => {
        if (!selectedCustomer) return;
        handlers.export.downloadCsv(
          `ledger-${selectedCustomer.name}-${today()}.csv`,
          ["Date", "Type", "Description", "Amount"],
          transactions.map((t) => [
            formatDate(t.timestamp),
            t.type,
            t.description || "",
            t.totalAmount.toString(),
          ]),
        );
        state.setNotice("Ledger exported.");
      },
      handleExportLedgerPdf: () => {
        if (!selectedCustomer) return;
        generateLedgerPdf(selectedCustomer as Customer, transactions, {
          businessName: tenantQuery.data?.name,
          businessAddress: tenantQuery.data?.businessAddress,
          businessPhone: tenantQuery.data?.businessPhone,
          businessEmail: tenantQuery.data?.businessEmail,
          startDate: state.txnStartDate,
          endDate: state.txnEndDate,
        });
        state.setNotice("PDF report generated.");
      },
      handleDataImport: async (file: File) => {
        return await handlers.import.bulkData(file, async () => {
          await customersQuery.refetch();
          if (state.selectedCustomerId) {
            await transactionsQuery.refetch();
          }
        });
      },
      handleExportAllData: async () => {
        await handlers.export.allData(customers, async (id: string) => {
          return await ledgerService.fetchTransactions(id);
        });
        state.setNotice("All data exported successfully.");
      },
    },
  };
}
