/**
 * useLedgerState hook
 * Centralizes all UI state management for the ledger module
 * Keeps state organized by concern: customers, transactions, UI, forms
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import type { Attachment } from '../../../shared/types/domain';
import type {
  Customer,
  CustomerFilter,
  CustomerSort,
  CustomerForm,
  TransactionForm,
  LedgerTransaction,
  DrawerMode,
  LedgerRightTab,
} from '../types/ledgerTypes';
import { today } from '../../../shared/utils/ledgerUtils';

const initialCustomerForm: CustomerForm = { name: '', phone: '', email: '', address: '', gstNumber: '', dueDate: '' };
const initialTransactionForm: TransactionForm = { customerId: '', type: 'SALE', totalAmount: '', paidAmount: '', description: '', transactionDate: today() };

/**
 * All ledger UI state in one place for easier management
 */
export function useLedgerState() {
  // Customer list state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('ALL');
  const [customerSort, setCustomerSort] = useState<CustomerSort>('HIGHEST_AMOUNT');
  const [showTotals, setShowTotals] = useState(false);
  const [dueDateByCustomer, setDueDateByCustomer] = useState<Record<string, string>>({});

  // Transaction/ledger state
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [attachmentsByTransaction, setAttachmentsByTransaction] = useState<Record<string, Attachment[]>>({});
  const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<Record<string, string>>({});
  const [lightbox, setLightbox] = useState<{ name: string; type: 'image' | 'pdf'; url: string } | null>(null);

  // Report/filter state
  const [rightTab, setRightTab] = useState<LedgerRightTab>('LEDGER');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportDueFilter, setReportDueFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE'>('ALL');
  const [reportSortField, setReportSortField] = useState<'NAME' | 'BALANCE' | 'DUE_DATE'>('BALANCE');

  // Form state
  const [customerForm, setCustomerForm] = useState<CustomerForm>(initialCustomerForm);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>(initialTransactionForm);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  // Drawer/modal state
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Loading/submission state
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Messages
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Refs
  const totalAmountInputRef = useRef<HTMLInputElement | null>(null);
  const paidAmountInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Computed values
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  // Drawer helpers
  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setDrawerMode(null);
  }, []);

  const resetTransactionForm = useCallback((customerId = selectedCustomerId) => {
    setEditingTransactionId(null);
    setAttachmentFile(null);
    setTransactionForm({ ...initialTransactionForm, customerId, transactionDate: today() });
  }, [selectedCustomerId]);

  // Return all state and helpers in organized groups
  return {
    // Customer list
    customers,
    setCustomers,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedCustomer,
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

    // Transactions
    transactions,
    setTransactions,
    editingTransactionId,
    setEditingTransactionId,
    attachmentsByTransaction,
    setAttachmentsByTransaction,
    attachmentPreviewUrls,
    setAttachmentPreviewUrls,
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
    attachmentFile,
    setAttachmentFile,

    // Drawer/modal
    drawerMode,
    setDrawerMode,
    isDrawerOpen,
    setIsDrawerOpen,
    closeDrawer,

    // Loading
    isSubmittingCustomer,
    setIsSubmittingCustomer,
    isSubmittingTransaction,
    setIsSubmittingTransaction,
    isImporting,
    setIsImporting,

    // Messages
    error,
    setError,
    notice,
    setNotice,

    // Refs
    totalAmountInputRef,
    paidAmountInputRef,
    importFileInputRef,

    // Helpers
    resetTransactionForm,
    initialCustomerForm,
    initialTransactionForm,
  };
}
