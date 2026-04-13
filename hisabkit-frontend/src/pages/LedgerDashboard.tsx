import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Download,
  CalendarDays,
  FileUp,
  MessageCircleMore,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { Attachment, Tenant } from '../api/api';
import ledgerService from '../features/ledger/ledgerService';
import type {
  Customer,
  CustomerFilter,
  CustomerForm,
  CustomerSort,
  DrawerMode,
  LedgerRightTab,
  LedgerTransaction,
  TransactionForm,
} from './ledgerTypes';
import { csvCell, formatCurrency, formatDate, today } from '../shared/utils/ledgerUtils';
import { buildReminderMessage, detectAttachmentType, parseCsvLine } from './ledgerDashboardHelpers';
import {
  applyDueDateMap,
  buildDueDateReport,
  computeTotals,
  countOverdueCustomers,
  filterAndSortCustomers,
} from './ledgerDashboardSelectors';

const initialCustomerForm: CustomerForm = { name: '', phone: '', email: '', address: '', gstNumber: '', dueDate: '' };
const initialTransactionForm: TransactionForm = {
  customerId: '',
  type: 'SALE',
  totalAmount: '',
  paidAmount: '',
  description: '',
  transactionDate: today(),
};

export const LedgerDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('ALL');
  const [customerSort, setCustomerSort] = useState<CustomerSort>('HIGHEST_AMOUNT');
  const [showTotals, setShowTotals] = useState(false);
  const [rightTab, setRightTab] = useState<LedgerRightTab>('LEDGER');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [customerForm, setCustomerForm] = useState<CustomerForm>(initialCustomerForm);
  const [transactionForm, setTransactionForm] = useState<TransactionForm>(initialTransactionForm);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentsByTransaction, setAttachmentsByTransaction] = useState<Record<string, Attachment[]>>({});
  const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<Record<string, string>>({});
  const [tenantProfile, setTenantProfile] = useState<Tenant | null>(null);
  const [lightbox, setLightbox] = useState<{ name: string; type: 'image' | 'pdf'; url: string } | null>(null);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dueDateByCustomer, setDueDateByCustomer] = useState<Record<string, string>>({});
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportDueFilter, setReportDueFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE'>('ALL');
  const [reportSortField, setReportSortField] = useState<'NAME' | 'BALANCE' | 'DUE_DATE'>('BALANCE');
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const totalAmountInputRef = useRef<HTMLInputElement | null>(null);
  const paidAmountInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const dueStorageKey = useMemo(() => `hisabkit_due_dates_${tenantProfile?.id || 'default'}`, [tenantProfile?.id]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  const customersWithDueDate = useMemo(
    () => applyDueDateMap(customers, dueDateByCustomer),
    [customers, dueDateByCustomer]
  );


  const filteredCustomers = useMemo(
    () =>
      filterAndSortCustomers({
        customers: customersWithDueDate,
        searchTerm,
        customerFilter,
        customerSort,
      }),
    [customersWithDueDate, searchTerm, customerFilter, customerSort]
  );

  const totals = useMemo(() => computeTotals(customersWithDueDate), [customersWithDueDate]);

  const overdueCustomerCount = useMemo(() => countOverdueCustomers(customersWithDueDate), [customersWithDueDate]);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions]
  );

  const reportTransactions = useMemo(() => {
    return sortedTransactions;
  }, [sortedTransactions]);

  const smsMessage = useMemo(
    () =>
      buildReminderMessage({
        template: tenantProfile?.smsTemplate,
        selectedCustomer,
        businessName: tenantProfile?.name,
      }),
    [selectedCustomer, tenantProfile]
  );
  const whatsappMessage = useMemo(
    () =>
      buildReminderMessage({
        template: tenantProfile?.whatsappTemplate || tenantProfile?.smsTemplate,
        selectedCustomer,
        businessName: tenantProfile?.name,
      }),
    [selectedCustomer, tenantProfile]
  );

  const customerPhoneDigits = (selectedCustomer?.phone || '').replace(/\D/g, '');
  const whatsappLink = customerPhoneDigits ? `https://wa.me/${customerPhoneDigits}?text=${encodeURIComponent(whatsappMessage)}` : '';
  const smsLink = customerPhoneDigits ? `sms:${customerPhoneDigits}?body=${encodeURIComponent(smsMessage)}` : '';

  const resetTransactionForm = (customerId = selectedCustomerId) => {
    setEditingTransactionId(null);
    setAttachmentFile(null);
    setTransactionForm({ ...initialTransactionForm, customerId, transactionDate: today() });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerMode(null);
  };

  const dueDateByCustomerReport = useMemo(
    () =>
      buildDueDateReport({
        customers: customersWithDueDate,
        reportSearchTerm,
        reportDueFilter,
        reportSortField,
      }),
    [customersWithDueDate, reportSearchTerm, reportDueFilter, reportSortField]
  );

  const openCustomerDrawer = (forceNew = false) => {
    if (selectedCustomer && !forceNew) {
      setIsEditingCustomer(true);
      setCustomerForm({
        name: selectedCustomer.name || '',
        phone: selectedCustomer.phone || '',
        email: selectedCustomer.email || '',
        address: selectedCustomer.address || '',
        gstNumber: selectedCustomer.gstNumber || '',
        dueDate: selectedCustomer.dueDate || '',
      });
    } else {
      setIsEditingCustomer(false);
      setCustomerForm(initialCustomerForm);
    }
    setDrawerMode('CUSTOMER');
    setIsDrawerOpen(true);
  };

  const openTransactionDrawer = (type: 'SALE' | 'PAYMENT') => {
    if (!selectedCustomerId) {
      setError('Please select a customer first.');
      return;
    }
    resetTransactionForm(selectedCustomerId);
    setTransactionForm((prev) => ({
      ...prev,
      customerId: selectedCustomerId,
      type,
      paidAmount: type === 'PAYMENT' ? prev.paidAmount : '',
      totalAmount: type === 'SALE' ? prev.totalAmount : '',
    }));
    setDrawerMode('TRANSACTION');
    setIsDrawerOpen(true);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setTransactionForm((prev) => ({ ...prev, customerId: customer.id }));
    setCustomerForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      dueDate: customer.dueDate || '',
    });
    setIsEditingCustomer(true);
  };

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    setError('');
    try {
      const list = await ledgerService.fetchCustomers();
      setCustomers(list as Customer[]);

      const keepSelection = list.some((c: Customer) => c.id === selectedCustomerId) ? selectedCustomerId : list[0]?.id || '';
      setSelectedCustomerId(keepSelection);
      setTransactionForm((prev) => ({ ...prev, customerId: keepSelection || prev.customerId }));
      const selected = list.find((c: Customer) => c.id === keepSelection);
      if (selected) {
        selectCustomer(selected);
      } else {
        setIsEditingCustomer(false);
      }
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to load customers right now.');
      setCustomers([]);
    } finally {
      setIsLoadingCustomers(false);
    }
  };

  const fetchTransactions = async (customerId: string) => {
    if (!customerId) {
      setTransactions([]);
      setAttachmentsByTransaction({});
      setAttachmentPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return {};
      });
      return;
    }
    setIsLoadingTransactions(true);
    setError('');
    try {
      const { transactions: list, attachmentsByTransaction: fetchedAttachments } = await ledgerService.fetchTransactions(customerId as string);
      setTransactions(list as LedgerTransaction[]);
      setAttachmentsByTransaction(fetchedAttachments as Record<string, Attachment[]>);

      const previewEntries = await Promise.all(
        (Object.values(fetchedAttachments) as Attachment[][]).flatMap((attachments) =>
          attachments.map(async (attachment: Attachment) => {
            const attachmentType = detectAttachmentType(attachment);
            if (attachmentType === 'other') {
              return [attachment.id, ''] as const;
            }
            try {
              const blob = await ledgerService.fetchAttachmentContent(attachment.id);
              return [attachment.id, URL.createObjectURL(blob.data as Blob)] as const;
            } catch {
              return [attachment.id, ''] as const;
            }
          })
        )
      );

      setAttachmentPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return Object.fromEntries(previewEntries.filter(([, url]) => Boolean(url)) as Array<[string, string]>);
      });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to load transactions right now.');
      setTransactions([]);
      setAttachmentsByTransaction({});
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    void fetchCustomers();
    void ledgerService.getTenantProfile().then((res: any) => setTenantProfile(res.data)).catch(() => null);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(dueStorageKey);
    if (!raw) {
      setDueDateByCustomer({});
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      setDueDateByCustomer(parsed || {});
    } catch {
      setDueDateByCustomer({});
    }
  }, [dueStorageKey]);

  useEffect(() => {
    localStorage.setItem(dueStorageKey, JSON.stringify(dueDateByCustomer));
  }, [dueDateByCustomer, dueStorageKey]);

  useEffect(() => {
    void fetchTransactions(selectedCustomerId);
  }, [selectedCustomerId]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(''), 5000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    return () => {
      Object.values(attachmentPreviewUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachmentPreviewUrls]);

  const downloadAttachment = async (attachment: Attachment) => {
    try {
      const blob = await ledgerService.fetchAttachmentContent(attachment.id);
      const url = URL.createObjectURL(blob.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = attachment.fileName || 'attachment';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Unable to download attachment.');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!window.confirm('Delete this attachment?')) return;
    setError('');
    setNotice('');
    try {
      await ledgerService.deleteAttachment(attachmentId);
      await fetchTransactions(selectedCustomerId);
      setNotice('Attachment deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete attachment.');
    }
  };

  const handleCreateCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingCustomer(true);
    setError('');
    setNotice('');
    try {
      const response = await ledgerService.createCustomer({
        name: customerForm.name,
        phone: customerForm.phone || null,
        email: customerForm.email || null,
        address: customerForm.address || null,
        gstNumber: customerForm.gstNumber || null,
      });
      const created = response as Customer;
      if (customerForm.dueDate && created.id) {
        setDueDateByCustomer((prev) => ({ ...prev, [created.id]: customerForm.dueDate }));
      }
      setCustomerForm(initialCustomerForm);
      await fetchCustomers();
      setSelectedCustomerId(created.id);
      setTransactionForm((prev) => ({ ...prev, customerId: created.id }));
      setIsEditingCustomer(true);
      setNotice('Customer added successfully.');
      closeDrawer();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to create customer right now.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomerId) return;
    setIsSubmittingCustomer(true);
    setError('');
    setNotice('');
    try {
      await ledgerService.updateCustomer(selectedCustomerId, {
        name: customerForm.name,
        phone: customerForm.phone || null,
        email: customerForm.email || null,
        address: customerForm.address || null,
        gstNumber: customerForm.gstNumber || null,
      });
      setDueDateByCustomer((prev) => ({ ...prev, [selectedCustomerId]: customerForm.dueDate || '' }));
      await fetchCustomers();
      setIsEditingCustomer(true);
      setNotice('Customer updated successfully.');
      closeDrawer();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to update customer right now.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (customerId = selectedCustomerId) => {
    if (!customerId) return;
    if (!window.confirm('Delete this customer and all related transactions?')) return;
    setError('');
    setNotice('');
    try {
      await ledgerService.deleteCustomer(customerId);
      setSelectedCustomerId('');
      setTransactions([]);
      setCustomerForm(initialCustomerForm);
      setIsEditingCustomer(false);
      await fetchCustomers();
      setNotice('Customer deleted.');
      closeDrawer();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to delete customer right now.');
    }
  };

  const handleSaveTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const totalAmount = Number(transactionForm.totalAmount || 0);
    const paidAmount = Number(transactionForm.paidAmount || 0);

    if (!transactionForm.customerId) {
      setError('Please select a customer for this transaction.');
      return;
    }

    if (transactionForm.type === 'SALE' && totalAmount <= 0) {
      setError('Sale amount must be greater than zero.');
      return;
    }

    if (transactionForm.type === 'PAYMENT' && paidAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }

    if (transactionForm.type === 'SALE' && paidAmount > totalAmount) {
      setError('Paid amount cannot be greater than total sale amount.');
      return;
    }

    setIsSubmittingTransaction(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        customerId: transactionForm.customerId,
        type: transactionForm.type,
        totalAmount: transactionForm.type === 'PAYMENT' ? paidAmount : totalAmount,
        paidAmount,
        description: transactionForm.description || null,
        transactionDate: transactionForm.transactionDate || null,
      };

      let transactionId = editingTransactionId;
      if (editingTransactionId) {
        const updateRes = await ledgerService.updateTransaction(editingTransactionId, payload);
        transactionId = updateRes?.transaction?.id || editingTransactionId;
      } else {
        const createRes = await ledgerService.createTransaction(payload);
        transactionId = createRes?.transaction?.id;
      }

      if (attachmentFile && transactionId) {
        await ledgerService.uploadTransactionAttachment(transactionId, attachmentFile);
      }

      resetTransactionForm(transactionForm.customerId);
      await fetchCustomers();
      await fetchTransactions(transactionForm.customerId);
      setNotice(editingTransactionId ? 'Transaction updated successfully.' : 'Transaction added successfully.');
      closeDrawer();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to save transaction right now.');
    } finally {
      setIsSubmittingTransaction(false);
    }
  };

  const startEditTransaction = (txn: LedgerTransaction) => {
    setEditingTransactionId(txn.id);
    setAttachmentFile(null);
    setTransactionForm({
      customerId: txn.customerId,
      type: txn.type,
      totalAmount: String(txn.totalAmount || ''),
      paidAmount: String(txn.paidAmount || ''),
      description: txn.description || '',
      transactionDate: txn.timestamp?.slice(0, 10) || today(),
    });
    setDrawerMode('TRANSACTION');
    setIsDrawerOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    setError('');
    setNotice('');
    try {
      await ledgerService.deleteTransaction(transactionId);
      if (editingTransactionId === transactionId) {
        resetTransactionForm();
      }
      await fetchCustomers();
      await fetchTransactions(selectedCustomerId);
      setNotice('Transaction deleted.');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to delete transaction right now.');
    }
  };

  const downloadCsv = (fileName: string, headers: string[], rows: Array<Array<string | number>>) => {
    const csv = [headers.map((header) => csvCell(header)).join(','), ...rows.map((row) => row.map((value) => csvCell(value)).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const exportCustomersCsv = () => {
    downloadCsv(
      `customers-${today()}.csv`,
      ['Name', 'Phone', 'Email', 'Address', 'GST', 'Balance', 'Balance Type'],
      filteredCustomers.map((customer) => {
        const balance = Number(customer.totalBalance || 0);
        return [
          customer.name,
          customer.phone || '',
          customer.email || '',
          customer.address || '',
          customer.gstNumber || '',
          Math.abs(balance).toFixed(2),
          balance >= 0 ? 'TO_COLLECT' : 'TO_PAY',
        ];
      })
    );
    setNotice('Customer report exported.');
  };

  const exportStatementCsv = () => {
    if (!selectedCustomer) {
      setError('Select a customer before exporting statement.');
      return;
    }

    let runningBalance = 0;
    const statementRows = [...reportTransactions]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((transaction) => {
        const youGave = transaction.type === 'SALE' ? Number(transaction.totalAmount || 0) : 0;
        const youGot = transaction.type === 'PAYMENT' ? Number(transaction.paidAmount || 0) : 0;
        runningBalance += youGave - youGot;

        return [
          formatDate(transaction.timestamp),
          transaction.referenceNo,
          transaction.type,
          youGave.toFixed(2),
          youGot.toFixed(2),
          runningBalance.toFixed(2),
          transaction.description || '',
        ];
      });

    downloadCsv(
      `${selectedCustomer.name.replace(/\s+/g, '_').toLowerCase()}-statement-${today()}.csv`,
      ['Date', 'Reference', 'Type', 'You Gave', 'You Got', 'Running Balance', 'Description'],
      statementRows
    );
    setNotice('Statement exported.');
  };

  const exportReportCsv = () => {
    downloadCsv(
      `customer-report-${today()}.csv`,
      ['Name', 'Phone', 'Address', 'Due Date', 'Balance', 'Balance Type'],
      dueDateByCustomerReport.map((customer) => {
        const balance = Number(customer.totalBalance || 0);
        return [
          customer.name,
          customer.phone || '',
          customer.address || '',
          customer.dueDate || '',
          Math.abs(balance).toFixed(2),
          balance >= 0 ? 'TO_COLLECT' : 'TO_PAY',
        ];
      })
    );
    setNotice('Report exported.');
  };

  const downloadImportTemplate = () => {
    downloadCsv(
      `hisabkit-import-template-${today()}.csv`,
      [
        'recordType',
        'name',
        'phone',
        'email',
        'address',
        'gstNumber',
        'dueDate',
        'transactionType',
        'totalAmount',
        'paidAmount',
        'description',
        'transactionDate',
      ],
      [
        ['CUSTOMER', 'Sample Customer', '9876543210', 'sample@example.com', 'Indore', '', '2026-04-20', '', '', '', '', ''],
        ['TRANSACTION', 'Sample Customer', '', '', '', '', '', 'SALE', '1000', '0', 'Sample invoice', '2026-04-08'],
      ]
    );
    setNotice('Import template downloaded.');
  };

  const importBulkData = async (file: File) => {
    setIsImporting(true);
    setError('');
    setNotice('');
    try {
      const content = await file.text();
      const lines = content.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) {
        setError('Import file is empty.');
        return;
      }

      const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
      const records = lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      const customerMap = new Map<string, string>();
      customers.forEach((customer) => customerMap.set(customer.name.trim().toLowerCase(), customer.id));

      for (const row of records) {
        const type = (row.recordtype || '').toUpperCase();
        if (type === 'CUSTOMER') {
          if (!row.name?.trim()) continue;

              const createRes = await ledgerService.createCustomer({
                name: row.name.trim(),
                phone: row.phone?.trim() || null,
                email: row.email?.trim() || null,
                address: row.address?.trim() || null,
                gstNumber: row.gstnumber?.trim() || null,
              });
              const createdId = createRes?.id as string;
          if (createdId) {
            customerMap.set(row.name.trim().toLowerCase(), createdId);
            if (row.duedate?.trim()) {
              setDueDateByCustomer((prev) => ({ ...prev, [createdId]: row.duedate.trim() }));
            }
          }
        }
      }

      for (const row of records) {
        const type = (row.recordtype || '').toUpperCase();
        if (type !== 'TRANSACTION') continue;

        const customerName = row.name?.trim().toLowerCase();
        const customerId = customerMap.get(customerName);
        if (!customerId) continue;

        const trxnType = (row.transactiontype || 'SALE').toUpperCase() === 'PAYMENT' ? 'PAYMENT' : 'SALE';
        const paidAmount = Number(row.paidamount || 0);
        const totalAmount = Number(row.totalamount || 0);

        await ledgerService.createTransaction({
          customerId,
          type: trxnType,
          totalAmount: trxnType === 'PAYMENT' ? paidAmount : totalAmount,
          paidAmount,
          description: row.description || null,
          transactionDate: row.transactiondate || null,
        });
      }

      await fetchCustomers();
      if (selectedCustomerId) {
        await fetchTransactions(selectedCustomerId);
      }
      setNotice('Bulk import completed.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bulk import failed. Check file format.');
    } finally {
      setIsImporting(false);
    }
  };

  useEffect(() => {
    if (!isDrawerOpen || drawerMode !== 'TRANSACTION') {
      return;
    }
    const timer = window.setTimeout(() => {
      if (transactionForm.type === 'SALE') {
        totalAmountInputRef.current?.focus();
      } else {
        paidAmountInputRef.current?.focus();
      }
    }, 120);

    return () => window.clearTimeout(timer);
  }, [isDrawerOpen, drawerMode, transactionForm.type]);

  return (
    <div className="rounded-2xl bg-[linear-gradient(180deg,#f5f7fb_0%,#edf2ff_100%)] p-3 sm:p-4">
      <div className="mx-auto max-w-7xl">
        <div className="sticky top-2 z-20 mb-4 rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-lg shadow-slate-200/60 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">HisabKit Ledger</p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900">Customer-wise account book</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTotals((prev) => !prev)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {showTotals ? 'Hide totals' : 'Show totals'}
              </button>
              <button
                type="button"
                onClick={() => openCustomerDrawer(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add customer
              </button>
              <button
                type="button"
                disabled={!selectedCustomer}
                onClick={() => openCustomerDrawer(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit customer
              </button>
              <button
                type="button"
                disabled={!selectedCustomer}
                onClick={() => openTransactionDrawer('SALE')}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                Sale
              </button>
              <button
                type="button"
                disabled={!selectedCustomer}
                onClick={() => openTransactionDrawer('PAYMENT')}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                Payment
              </button>
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRightTab('LEDGER')}
                className={`rounded-xl px-3 py-2 text-xs font-bold ${rightTab === 'LEDGER' ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                Ledger
              </button>
              <button
                type="button"
                onClick={() => setRightTab('REPORTS')}
                className={`rounded-xl px-3 py-2 text-xs font-bold ${rightTab === 'REPORTS' ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                Report
              </button>
              <button
                type="button"
                onClick={downloadImportTemplate}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Import template
              </button>
              <button
                type="button"
                onClick={exportCustomersCsv}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export customers
              </button>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <FileUp className="h-3.5 w-3.5" />
                {isImporting ? 'Importing...' : 'Import CSV'}
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  disabled={isImporting}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void importBulkData(file).finally(() => {
                      if (importFileInputRef.current) {
                        importFileInputRef.current.value = '';
                      }
                    });
                  }}
                />
              </label>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800">
              Customers {customers.length}
            </div>
          </div>

          {showTotals && (
            <div className="mt-2 grid gap-1.5 sm:grid-cols-4">
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">You collect</p>
                <p className="mt-0.5 text-sm font-extrabold text-emerald-800">{formatCurrency(totals.toCollect)}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-700">You pay</p>
                <p className="mt-0.5 text-sm font-extrabold text-rose-800">{formatCurrency(totals.toPay)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Visible customers</p>
                <p className="mt-1 text-lg font-black text-slate-900">{filteredCustomers.length}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">Overdue</p>
                <p className="mt-1 text-lg font-black text-amber-900">{overdueCustomerCount}</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="flex flex-col gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1 md:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Search for customers</p>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Name, phone or address"
                      className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Filter by</p>
                  <select
                    value={customerFilter}
                    onChange={(event) => setCustomerFilter(event.target.value as CustomerFilter)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="ALL">All customers</option>
                    <option value="TO_COLLECT">To collect</option>
                    <option value="TO_PAY">To pay</option>
                    <option value="ZERO_BALANCE">Zero balance</option>
                    <option value="WITH_CONTACT">With contact</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Sort by</p>
                  <select
                    value={customerSort}
                    onChange={(event) => setCustomerSort(event.target.value as CustomerSort)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="MOST_RECENT">Most Recent</option>
                    <option value="HIGHEST_AMOUNT">Highest Amount</option>
                    <option value="LEAST_AMOUNT">Least Amount</option>
                    <option value="BY_NAME">By Name</option>
                    <option value="OLDEST">Oldest</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => openCustomerDrawer(true)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    + Add Customer
                  </button>
                </div>
              </div>

              <div className="mt-2 max-h-[62vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[68vh]">
                {isLoadingCustomers ? (
                  <p className="py-6 text-center text-sm text-slate-500">Loading customers...</p>
                ) : filteredCustomers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No customers found.</p>
                ) : (
                  filteredCustomers.map((customer) => {
                    const balance = Number(customer.totalBalance || 0);
                    const selected = customer.id === selectedCustomerId;
                    return (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          selected ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-bold text-slate-900">{customer.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{customer.phone || customer.email || 'No contact added'}</p>
                            <p className="mt-1 text-xs text-slate-500">{customer.address || 'No address added'}</p>
                            {customer.dueDate && (
                              <p className="mt-1 text-[11px] font-semibold text-amber-700">Due: {formatDate(customer.dueDate)}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-extrabold ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {formatCurrency(Math.abs(balance))}
                            </p>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                              {balance >= 0 ? 'To collect' : 'To pay'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

          </section>

          <section className="flex flex-col gap-4">
            {!selectedCustomer ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 shadow-lg shadow-slate-200/60">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Users className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-2xl font-black text-slate-800">No customer selected</p>
                  <p className="mt-2 text-sm text-slate-500">Select a customer from the left.</p>
                </div>
              </div>
            ) : (
              <>
                {rightTab === 'LEDGER' && (
                  <>
                    <div className="order-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-black text-slate-900">{selectedCustomer.name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{selectedCustomer.phone || selectedCustomer.email || 'No contact available'}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openCustomerDrawer(false)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openTransactionDrawer('SALE')}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Sale
                          </button>
                          <button
                            type="button"
                            onClick={() => openTransactionDrawer('PAYMENT')}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Payment
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href={smsLink || undefined}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold ${
                            smsLink ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50' : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          }`}
                          onClick={(e) => {
                            if (!smsLink) e.preventDefault();
                          }}
                        >
                          <MessageSquareText className="h-3.5 w-3.5" />
                          SMS reminder
                        </a>
                        <a
                          href={whatsappLink || undefined}
                          target="_blank"
                          rel="noreferrer"
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold ${
                            whatsappLink ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          }`}
                          onClick={(e) => {
                            if (!whatsappLink) e.preventDefault();
                          }}
                        >
                          <MessageCircleMore className="h-3.5 w-3.5" />
                          WhatsApp reminder
                        </a>
                        <button
                          type="button"
                          onClick={() => setDueDateByCustomer((prev) => ({ ...prev, [selectedCustomer.id]: '' }))}
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Clear due date
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Due date:</p>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 7);
                            setDueDateByCustomer((prev) => ({ ...prev, [selectedCustomer.id]: date.toISOString().slice(0, 10) }));
                          }}
                          className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          +7d
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 15);
                            setDueDateByCustomer((prev) => ({ ...prev, [selectedCustomer.id]: date.toISOString().slice(0, 10) }));
                          }}
                          className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          +15d
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + 30);
                            setDueDateByCustomer((prev) => ({ ...prev, [selectedCustomer.id]: date.toISOString().slice(0, 10) }));
                          }}
                          className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          +30d
                        </button>
                        <input
                          type="date"
                          value={selectedCustomer.dueDate || ''}
                          onChange={(event) => setDueDateByCustomer((prev) => ({ ...prev, [selectedCustomer.id]: event.target.value }))}
                          className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current balance</p>
                          <p className="mt-2 text-xl font-extrabold text-slate-900">
                            {formatCurrency(Math.abs(Number(selectedCustomer.totalBalance || 0)))}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {Number(selectedCustomer.totalBalance || 0) >= 0 ? 'Amount to collect' : 'Amount to pay'}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Entries</p>
                          <p className="mt-2 text-xl font-extrabold text-slate-900">{transactions.length}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">Chronological ledger history</p>
                        </div>
                      </div>
                    </div>

                    <div className="order-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                      <h2 className="mb-4 text-base font-bold text-slate-900">Customer ledger</h2>
                      <div className="mb-3 hidden grid-cols-[1.2fr_0.9fr_0.9fr_120px] rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 md:grid">
                        <p>Entry</p>
                        <p className="text-right">You Gave</p>
                        <p className="text-right">You Got</p>
                        <p className="text-right">Actions</p>
                      </div>
                      <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1 lg:max-h-[62vh]">
                        {isLoadingTransactions ? (
                          <p className="py-6 text-center text-sm text-slate-500">Loading transactions...</p>
                        ) : reportTransactions.length === 0 ? (
                          <p className="py-6 text-center text-sm text-slate-500">No transactions for this customer yet.</p>
                        ) : (
                          reportTransactions.map((transaction) => {
                            const sale = transaction.type === 'SALE';
                            const amount = sale ? Number(transaction.dueAmount || 0) : Number(transaction.paidAmount || 0);
                            const attachments = attachmentsByTransaction[transaction.id] || [];
                            return (
                              <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="grid gap-2 md:grid-cols-[1.2fr_0.9fr_0.9fr_120px] md:items-center">
                                  <div>
                                    <p className="text-sm font-bold text-slate-900">
                                      {sale ? 'Sale added' : 'Payment received'} · {formatDate(transaction.timestamp)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Ref: {transaction.referenceNo} {transaction.description ? `· ${transaction.description}` : ''}
                                    </p>
                                  </div>

                                  <p className="text-sm font-extrabold text-right text-rose-700">
                                    {sale ? formatCurrency(amount) : '-'}
                                  </p>

                                  <p className="text-sm font-extrabold text-right text-emerald-700">
                                    {!sale ? formatCurrency(amount) : '-'}
                                  </p>

                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => startEditTransaction(transaction)}
                                      className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTransaction(transaction.id)}
                                      className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                {attachments.length > 0 && (
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {attachments.map((attachment) => {
                                      const fileType = detectAttachmentType(attachment);
                                      const previewUrl = attachmentPreviewUrls[attachment.id];
                                      const isImage = fileType === 'image';
                                      const isPdf = fileType === 'pdf';
                                      return (
                                        <div key={attachment.id} className="rounded-xl border border-slate-200 bg-white p-2">
                                          <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="truncate text-[11px] font-semibold text-slate-600">{attachment.fileName}</p>
                                            <button
                                              type="button"
                                              onClick={() => void downloadAttachment(attachment)}
                                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                                            >
                                              <Download className="h-3 w-3" />
                                              Download
                                            </button>
                                          </div>
                                          {isImage && previewUrl ? (
                                            <button type="button" onClick={() => setLightbox({ name: attachment.fileName, type: 'image', url: previewUrl })} className="w-full">
                                              <img src={previewUrl} alt={attachment.fileName} className="h-32 w-full rounded-lg object-cover" />
                                            </button>
                                          ) : isPdf && previewUrl ? (
                                            <button type="button" onClick={() => setLightbox({ name: attachment.fileName, type: 'pdf', url: previewUrl })} className="w-full">
                                              <iframe src={previewUrl} title={attachment.fileName} className="h-32 w-full rounded-lg border border-slate-200" />
                                            </button>
                                          ) : (
                                            <p className="text-xs text-slate-500">Preview unavailable. Use download.</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}

                {rightTab === 'REPORTS' && (
                  <div className="order-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-base font-bold text-slate-900">Ledger report</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={exportReportCsv}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export customer report
                        </button>
                        <button
                          type="button"
                          onClick={exportStatementCsv}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export statement
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <label className="space-y-1 md:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Search customers</p>
                        <input
                          type="text"
                          value={reportSearchTerm}
                          onChange={(event) => setReportSearchTerm(event.target.value)}
                          placeholder="Search by name, phone, email, address, GST or due date"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                      <label className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Due filter</p>
                        <select
                          value={reportDueFilter}
                          onChange={(event) => setReportDueFilter(event.target.value as 'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE')}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="ALL">All customers</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="UPCOMING_7_DAYS">Upcoming 7 days</option>
                          <option value="NO_DUE_DATE">No due date</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Sort</p>
                        <select
                          value={reportSortField}
                          onChange={(event) => setReportSortField(event.target.value as 'NAME' | 'BALANCE' | 'DUE_DATE')}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="BALANCE">By balance</option>
                          <option value="DUE_DATE">By due date</option>
                          <option value="NAME">By name</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 max-h-[62vh] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
                      {dueDateByCustomerReport.length === 0 ? (
                        <p className="py-6 text-center text-sm text-slate-500">No report data for selected filters.</p>
                      ) : (
                        dueDateByCustomerReport.map((customer) => {
                          const balance = Number(customer.totalBalance || 0);
                          return (
                            <div key={customer.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-bold text-slate-900">{customer.name}</p>
                                <button type="button" className={`text-xs font-extrabold whitespace-nowrap ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {formatCurrency(Math.abs(balance))}
                                </button>
                              </div>
                              <p className="truncate text-xs text-slate-500">{customer.address || '—'}</p>
                              <p className="text-[10px] font-semibold text-amber-700">{customer.dueDate ? `Due ${formatDate(customer.dueDate)}` : ''}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/30" onClick={closeDrawer}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl shadow-slate-900/30"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h2 className="text-lg font-black text-slate-900">
                {drawerMode === 'CUSTOMER' ? 'Customer settings' : editingTransactionId ? 'Edit transaction' : 'Add transaction'}
              </h2>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {drawerMode === 'CUSTOMER' ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  if (isEditingCustomer && selectedCustomerId) {
                    event.preventDefault();
                    void handleUpdateCustomer();
                    return;
                  }
                  void handleCreateCustomer(event);
                }}
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Customer name</p>
                  <input
                    type="text"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter customer name"
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Phone number</p>
                    <input
                      type="text"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+91xxxxxxxxxx"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Email</p>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Address</p>
                  <input
                    type="text"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="Area, city, state"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">GST number</p>
                    <input
                      type="text"
                      value={customerForm.gstNumber}
                      onChange={(e) => setCustomerForm((prev) => ({ ...prev, gstNumber: e.target.value }))}
                      placeholder="Optional GSTIN"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Due date</p>
                    <input
                      type="date"
                      value={customerForm.dueDate}
                      onChange={(e) => setCustomerForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                  <button
                    type="submit"
                    disabled={isSubmittingCustomer || !customerForm.name.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e293b] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0f172a] disabled:opacity-70"
                  >
                    <Plus className="h-4 w-4" />
                    {isEditingCustomer ? 'Update customer' : 'Add customer'}
                  </button>
                  {isEditingCustomer ? (
                    <button
                      type="button"
                      disabled={isSubmittingCustomer || !selectedCustomerId}
                      onClick={() => void handleDeleteCustomer()}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCustomerForm(initialCustomerForm)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form className="space-y-3" onSubmit={handleSaveTransaction}>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Customer</p>
                  <select
                    value={transactionForm.customerId}
                    onChange={(e) => {
                      const customerId = e.target.value;
                      setTransactionForm((prev) => ({ ...prev, customerId }));
                      setSelectedCustomerId(customerId);
                    }}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Entry type</p>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, type: e.target.value as 'SALE' | 'PAYMENT' }))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="SALE">Sale (Udhar)</option>
                    <option value="PAYMENT">Payment (Jama)</option>
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Total amount</p>
                    <input
                      ref={totalAmountInputRef}
                      type="number"
                      step="0.01"
                      min="0"
                      value={transactionForm.totalAmount}
                      onChange={(e) => setTransactionForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
                      placeholder="Enter amount"
                      required={transactionForm.type === 'SALE'}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                      {transactionForm.type === 'SALE' ? 'Paid now (optional)' : 'Payment amount'}
                    </p>
                    <input
                      ref={paidAmountInputRef}
                      type="number"
                      step="0.01"
                      min="0"
                      value={transactionForm.paidAmount}
                      onChange={(e) => setTransactionForm((prev) => ({ ...prev, paidAmount: e.target.value }))}
                      placeholder={transactionForm.type === 'SALE' ? 'Amount received at sale time' : 'Enter payment amount'}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Transaction date</p>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={transactionForm.transactionDate}
                      onChange={(e) => setTransactionForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Description</p>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Invoice note, item details, etc."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                  <FileUp className="h-4 w-4" />
                  <span>{attachmentFile ? attachmentFile.name : 'Attach proof (PDF/Image) - optional'}</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                  />
                </label>

                {editingTransactionId && (attachmentsByTransaction[editingTransactionId] || []).length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Existing attachments</p>
                    <div className="space-y-2">
                      {(attachmentsByTransaction[editingTransactionId] || []).map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                          <button
                            type="button"
                            onClick={() => void downloadAttachment(attachment)}
                            className="truncate text-left text-xs font-semibold text-slate-700 hover:underline"
                          >
                            {attachment.fileName}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteAttachment(attachment.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 border-t border-slate-200 pt-2">
                  <button
                    type="submit"
                    disabled={
                      isSubmittingTransaction ||
                      !transactionForm.customerId ||
                      (transactionForm.type === 'SALE' && !transactionForm.totalAmount) ||
                      (transactionForm.type === 'PAYMENT' && !transactionForm.paidAmount)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-70"
                  >
                    <Wallet className="h-4 w-4" />
                    {isSubmittingTransaction ? 'Saving...' : editingTransactionId ? 'Update transaction' : 'Save transaction'}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetTransactionForm(transactionForm.customerId)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4" onClick={() => setLightbox(null)}>
          <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-3" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-slate-700">{lightbox.name}</p>
              <button onClick={() => setLightbox(null)} className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                Close
              </button>
            </div>
            {lightbox.type === 'image' ? (
              <img src={lightbox.url} alt={lightbox.name} className="max-h-[78vh] w-full rounded-lg object-contain" />
            ) : (
              <iframe src={lightbox.url} title={lightbox.name} className="h-[78vh] w-full rounded-lg border border-slate-200" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

