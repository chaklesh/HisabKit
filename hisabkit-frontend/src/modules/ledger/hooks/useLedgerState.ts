/**
 * useLedgerState.ts
 * Centralizes all UI state for the Ledger module.
 * Pure state – no side effects, no API calls.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import type { Attachment } from '@/shared/types';
import { today } from '@/shared/utils/ledgerUtils';
import type {
  Customer,
  CustomerFilter,
  CustomerForm,
  CustomerSort,
  DrawerMode,
  LedgerRightTab,
  LedgerTransaction,
  TransactionForm,
} from '../types/ledgerTypes';

// ── Initial form values ───────────────────────────────────────────────────────
export const INITIAL_CUSTOMER_FORM: CustomerForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
  dueDate: '',
};

export const makeInitialTransactionForm = (customerId = '', date = today()): TransactionForm => ({
  customerId,
  type: 'SALE',
  totalAmount: '',
  paidAmount: '',
  description: '',
  transactionDate: date,
});

export function useLedgerState() {
  // ── Customer list ──────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('ALL');
  const [customerSort, setCustomerSort] = useState<CustomerSort>('HIGHEST_AMOUNT');
  const [showTotals, setShowTotals] = useState(false);
  const [dueDateByCustomer, setDueDateByCustomer] = useState<Record<string, string>>({});

  // ── Transactions ───────────────────────────────────────────────────────────
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [attachmentsByTransaction, setAttachmentsByTransaction] = useState<Record<string, Attachment[]>>({});
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [lightbox, setLightbox] = useState<{ name: string; type: 'image' | 'pdf'; url: string } | null>(null);

  // ── Report / filter ────────────────────────────────────────────────────────
  const [rightTab, setRightTab] = useState<LedgerRightTab>('LEDGER');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportDueFilter, setReportDueFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE'>('ALL');
  const [reportSortField, setReportSortField] = useState<'NAME' | 'BALANCE' | 'DUE_DATE'>('BALANCE');

  // ── Forms ──────────────────────────────────────────────────────────────────
  const [customerForm, setCustomerForm] = useState<CustomerForm>(INITIAL_CUSTOMER_FORM);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>(makeInitialTransactionForm());
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // ── Drawer / Confirm state ─────────────────────────────────────────────────
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState(false);
  const [confirmDeleteTransactionId, setConfirmDeleteTransactionId] = useState<string | null>(null);

  // ── Loading & messages ─────────────────────────────────────────────────────
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // ── Refs (for focus management) ────────────────────────────────────────────
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId]
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerMode(null);
  }, []);

  const resetTransactionForm = useCallback(
    (customerId = selectedCustomerId) => {
      setEditingTransactionId(null);
      setAttachmentFile(null);
      setTransactionForm(makeInitialTransactionForm(customerId));
    },
    [selectedCustomerId]
  );

  return {
    // Customer list
    customers, setCustomers,
    selectedCustomerId, setSelectedCustomerId,
    selectedCustomer,
    searchTerm, setSearchTerm,
    customerFilter, setCustomerFilter,
    customerSort, setCustomerSort,
    showTotals, setShowTotals,
    dueDateByCustomer, setDueDateByCustomer,

    // Transactions
    transactions, setTransactions,
    editingTransactionId, setEditingTransactionId,
    attachmentsByTransaction, setAttachmentsByTransaction,
    attachmentFile, setAttachmentFile,
    lightbox, setLightbox,

    // Reports
    rightTab, setRightTab,
    reportSearchTerm, setReportSearchTerm,
    reportDueFilter, setReportDueFilter,
    reportSortField, setReportSortField,

    // Forms
    customerForm, setCustomerForm,
    transactionForm, setTransactionForm,
    isEditingCustomer, setIsEditingCustomer,

    // Drawer / confirm
    drawerMode, setDrawerMode,
    isDrawerOpen, setIsDrawerOpen,
    closeDrawer,
    confirmDeleteCustomer, setConfirmDeleteCustomer,
    confirmDeleteTransactionId, setConfirmDeleteTransactionId,

    // Loading
    isSubmittingCustomer, setIsSubmittingCustomer,
    isSubmittingTransaction, setIsSubmittingTransaction,

    // Messages
    error, setError,
    notice, setNotice,

    // Refs
    importFileInputRef,

    // Helpers
    resetTransactionForm,
    INITIAL_CUSTOMER_FORM,
  };
}
