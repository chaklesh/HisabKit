import { today } from "@/shared/utils/ledgerUtils";
/**
 * useLedgerState.ts
 * Centralizes all UI state for the Ledger module.
 * Pure state – no side effects, no API calls.
 */
import { useCallback, useRef, useState } from "react";
import type {
  CustomerFilter,
  CustomerForm,
  CustomerSort,
  DrawerMode,
  LedgerRightTab,
  TransactionForm,
} from "../types/ledgerTypes";

// ── Initial form values ───────────────────────────────────────────────────────
export const INITIAL_CUSTOMER_FORM: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  gstNumber: "",
  tags: "",
  dueDate: "",
};

export const makeInitialTransactionForm = (customerId = "", date = today()): TransactionForm => ({
  customerId,
  type: "SALE",
  totalAmount: "",
  paidAmount: "",
  description: "",
  transactionDate: date,
});

export function useLedgerState() {
  // ── Selections & Search ───────────────────────────────────────────────────
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>("ALL");
  const [customerSort, setCustomerSort] = useState<CustomerSort>("HIGHEST_AMOUNT");
  const [showTotals, setShowTotals] = useState(false);
  const [dueDateByCustomer, setDueDateByCustomer] = useState<Record<string, string>>({});

  // ── Transaction Specific Filters ──────────────────────────────────────────
  const [txnSearchTerm, setTxnSearchTerm] = useState("");
  const [txnStartDate, setTxnStartDate] = useState("");
  const [txnEndDate, setTxnEndDate] = useState("");

  // ── Transient UI State ────────────────────────────────────────────────────
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const [lightbox, setLightbox] = useState<{
    name: string;
    type: "image" | "pdf";
    url: string;
  } | null>(null);

  // ── Report / filter ────────────────────────────────────────────────────────
  const [rightTab, setRightTab] = useState<LedgerRightTab>("LEDGER");
  const [reportSearchTerm, setReportSearchTerm] = useState("");
  const [reportDueFilter, setReportDueFilter] = useState<
    "ALL" | "OVERDUE" | "UPCOMING_7_DAYS" | "NO_DUE_DATE"
  >("ALL");
  const [reportSortField, setReportSortField] = useState<"NAME" | "BALANCE" | "DUE_DATE">(
    "BALANCE",
  );

  // ── Forms ──────────────────────────────────────────────────────────────────
  const [customerForm, setCustomerForm] = useState<CustomerForm>(INITIAL_CUSTOMER_FORM);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>(
    makeInitialTransactionForm(),
  );
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // ── Drawer / Confirm state ─────────────────────────────────────────────────
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState(false);
  const [confirmDeleteTransactionId, setConfirmDeleteTransactionId] = useState<string | null>(null);

  // ── Loading & messages ─────────────────────────────────────────────────────
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerMode(null);
  }, []);

  const resetTransactionForm = useCallback(
    (customerId = selectedCustomerId) => {
      setEditingTransactionId(null);
      setAttachmentFiles([]);
      setTransactionForm(makeInitialTransactionForm(customerId));
    },
    [selectedCustomerId],
  );

  return {
    // Selections
    selectedCustomerId,
    setSelectedCustomerId,
    searchTerm,
    setSearchTerm,
    customerFilter,
    setCustomerFilter,
    customerSort,
    setCustomerSort,
    showTotals,
    setShowTotals,
    dueDateByCustomer,
    setDueDateByCustomer,
    txnSearchTerm,
    setTxnSearchTerm,
    txnStartDate,
    setTxnStartDate,
    txnEndDate,
    setTxnEndDate,

    // UI State
    editingTransactionId,
    setEditingTransactionId,
    attachmentFiles,
    setAttachmentFiles,
    lightbox,
    setLightbox,

    // Reports
    rightTab,
    setRightTab,
    reportSearchTerm,
    setReportSearchTerm,
    reportDueFilter,
    setReportDueFilter,
    reportSortField,
    setReportSortField,

    // Forms
    customerForm,
    setCustomerForm,
    transactionForm,
    setTransactionForm,
    isEditingCustomer,
    setIsEditingCustomer,

    // Drawer / confirm
    drawerMode,
    setDrawerMode,
    isDrawerOpen,
    setIsDrawerOpen,
    isDataManagementOpen,
    setIsDataManagementOpen,
    closeDrawer,
    confirmDeleteCustomer,
    setConfirmDeleteCustomer,
    confirmDeleteTransactionId,
    setConfirmDeleteTransactionId,

    // Loading
    isSubmittingCustomer,
    setIsSubmittingCustomer,
    isSubmittingTransaction,
    setIsSubmittingTransaction,

    // Messages
    error,
    setError,
    notice,
    setNotice,

    // Refs
    importFileInputRef,

    // Helpers
    resetTransactionForm,
    INITIAL_CUSTOMER_FORM,
  };
}
