import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  CalendarDays,
  CreditCard,
  FileUp,
  MessageCircleMore,
  MessageSquareText,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Wallet,
} from 'lucide-react';
import api, {
  Attachment,
  deleteAttachment,
  fetchAttachmentContent,
  getTenantProfile,
  listTransactionAttachments,
  Tenant,
  uploadTransactionAttachment,
} from '../api/api';

type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  totalBalance?: number;
};

type LedgerTransaction = {
  id: string;
  referenceNo: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  description?: string;
  timestamp: string;
  customerId: string;
};

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
};

type TransactionForm = {
  customerId: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: string;
  paidAmount: string;
  description: string;
  transactionDate: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const initialCustomerForm: CustomerForm = { name: '', phone: '', email: '', address: '', gstNumber: '' };
const initialTransactionForm: TransactionForm = {
  customerId: '',
  type: 'SALE',
  totalAmount: '',
  paidAmount: '',
  description: '',
  transactionDate: today(),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const LedgerDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  );

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return customers
      .filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q)
      )
      .sort((a, b) => Math.abs(Number(b.totalBalance || 0)) - Math.abs(Number(a.totalBalance || 0)));
  }, [customers, searchTerm]);

  const totals = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance || 0);
        if (balance >= 0) acc.toCollect += balance;
        else acc.toPay += Math.abs(balance);
        return acc;
      },
      { toCollect: 0, toPay: 0 }
    );
  }, [customers]);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [transactions]
  );

  const detectAttachmentType = (attachment: Attachment): 'image' | 'pdf' | 'other' => {
    const fileType = (attachment.fileType || '').toLowerCase();
    const name = (attachment.fileName || '').toLowerCase();
    if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(name)) return 'image';
    if (fileType.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
    return 'other';
  };

  const buildReminderFromTemplate = (template?: string) => {
    if (!selectedCustomer) {
      return 'Please review your ledger balance in HisabKit.';
    }
    const balance = Number(selectedCustomer.totalBalance || 0);
    const vars = {
      customerName: selectedCustomer.name,
      balance: formatCurrency(Math.abs(balance)),
      balanceType: balance >= 0 ? 'to pay' : 'to receive',
      businessName: tenantProfile?.name || 'our business',
      customerPhone: selectedCustomer.phone || '',
    };
    if (!template) {
      return `Hi ${vars.customerName}, this is a reminder from ${vars.businessName}. Your current balance is ${vars.balance} (${vars.balanceType}). Please settle when possible.`;
    }
    return template
      .split('{{customerName}}').join(vars.customerName)
      .split('{{balance}}').join(vars.balance)
      .split('{{balanceType}}').join(vars.balanceType)
      .split('{{businessName}}').join(vars.businessName)
      .split('{{customerPhone}}').join(vars.customerPhone);
  };

  const smsMessage = useMemo(() => buildReminderFromTemplate(tenantProfile?.smsTemplate), [selectedCustomer, tenantProfile]);
  const whatsappMessage = useMemo(
    () => buildReminderFromTemplate(tenantProfile?.whatsappTemplate || tenantProfile?.smsTemplate),
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

  const fetchCustomers = async () => {
    setIsLoadingCustomers(true);
    setError('');
    try {
      const res = await api.get('/ledger/customers');
      const list = Array.isArray(res.data) ? (res.data as Customer[]) : [];
      setCustomers(list);

      const keepSelection = list.some((c) => c.id === selectedCustomerId) ? selectedCustomerId : list[0]?.id || '';
      setSelectedCustomerId(keepSelection);
      setTransactionForm((prev) => ({ ...prev, customerId: keepSelection || prev.customerId }));
      const selected = list.find((c) => c.id === keepSelection);
      if (selected) {
        setCustomerForm({
          name: selected.name || '',
          phone: selected.phone || '',
          email: selected.email || '',
          address: selected.address || '',
          gstNumber: selected.gstNumber || '',
        });
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
      const res = await api.get(`/ledger/customers/${customerId}/transactions`);
      const list = Array.isArray(res.data) ? (res.data as LedgerTransaction[]) : [];
      setTransactions(list);

      const attachmentPairs = await Promise.all(
        list.map(async (txn) => {
          try {
            const attachmentRes = await listTransactionAttachments(txn.id);
            const attachments = Array.isArray(attachmentRes.data) ? attachmentRes.data : [];
            return [txn.id, attachments] as const;
          } catch {
            return [txn.id, []] as const;
          }
        })
      );
      setAttachmentsByTransaction(Object.fromEntries(attachmentPairs));

      const previewEntries = await Promise.all(
        attachmentPairs.flatMap(([, attachments]) =>
          attachments.map(async (attachment) => {
            const attachmentType = detectAttachmentType(attachment);
            if (attachmentType === 'other') {
              return [attachment.id, ''] as const;
            }
            try {
              const blob = await fetchAttachmentContent(attachment.id);
              return [attachment.id, URL.createObjectURL(blob.data as Blob)] as const;
            } catch {
              return [attachment.id, ''] as const;
            }
          })
        )
      );

      setAttachmentPreviewUrls((prev) => {
        Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
        return Object.fromEntries(previewEntries.filter(([, url]) => Boolean(url)));
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
    void getTenantProfile().then((res) => setTenantProfile(res.data)).catch(() => null);
  }, []);

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
      const blob = await fetchAttachmentContent(attachment.id);
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
      await deleteAttachment(attachmentId);
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
      const response = await api.post('/ledger/customers', {
        name: customerForm.name,
        phone: customerForm.phone || null,
        email: customerForm.email || null,
        address: customerForm.address || null,
        gstNumber: customerForm.gstNumber || null,
      });
      const created = response.data as Customer;
      setCustomerForm(initialCustomerForm);
      await fetchCustomers();
      setSelectedCustomerId(created.id);
      setTransactionForm((prev) => ({ ...prev, customerId: created.id }));
      setNotice('Customer added successfully.');
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
      await api.put(`/ledger/customers/${selectedCustomerId}`, {
        name: customerForm.name,
        phone: customerForm.phone || null,
        email: customerForm.email || null,
        address: customerForm.address || null,
        gstNumber: customerForm.gstNumber || null,
      });
      await fetchCustomers();
      setNotice('Customer updated successfully.');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Unable to update customer right now.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;
    if (!window.confirm('Delete this customer and all related transactions?')) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/ledger/customers/${selectedCustomerId}`);
      setSelectedCustomerId('');
      setTransactions([]);
      setCustomerForm(initialCustomerForm);
      await fetchCustomers();
      setNotice('Customer deleted.');
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
        const updateRes = await api.put(`/ledger/transactions/${editingTransactionId}`, payload);
        transactionId = updateRes.data?.transaction?.id || editingTransactionId;
      } else {
        const createRes = await api.post('/ledger/transactions', payload);
        transactionId = createRes.data?.transaction?.id;
      }

      if (attachmentFile && transactionId) {
        await uploadTransactionAttachment(transactionId, attachmentFile);
      }

      resetTransactionForm(transactionForm.customerId);
      await fetchCustomers();
      await fetchTransactions(transactionForm.customerId);
      setNotice(editingTransactionId ? 'Transaction updated successfully.' : 'Transaction added successfully.');
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
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    setError('');
    setNotice('');
    try {
      await api.delete(`/ledger/transactions/${transactionId}`);
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

  return (
    <div className="rounded-2xl bg-[linear-gradient(180deg,#f5f7fb_0%,#edf2ff_100%)] p-3 sm:p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">HisabKit Ledger</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Customer-wise account book</h1>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">You collect</p>
                <p className="mt-1 text-lg font-extrabold text-emerald-800">{formatCurrency(totals.toCollect)}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">You pay</p>
                <p className="mt-1 text-lg font-extrabold text-rose-800">{formatCurrency(totals.toPay)}</p>
              </div>
            </div>
          </div>
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

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="space-y-6 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search customer, phone or email"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
              </div>

              <div className="mt-4 max-h-[42vh] space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-19rem)]">
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
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setTransactionForm((prev) => ({ ...prev, customerId: customer.id }));
                          setCustomerForm({
                            name: customer.name || '',
                            phone: customer.phone || '',
                            email: customer.email || '',
                            address: customer.address || '',
                            gstNumber: customer.gstNumber || '',
                          });
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                          selected ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-bold text-slate-900">{customer.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{customer.phone || customer.email || 'No contact added'}</p>
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

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <UserPlus className="h-4 w-4" />
                Customer profile
              </h2>
              <form className="mt-4 space-y-3" onSubmit={handleCreateCustomer}>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  type="text"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Email (optional)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Address (optional)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <input
                  type="text"
                  value={customerForm.gstNumber}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, gstNumber: e.target.value }))}
                  placeholder="GST number (optional)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <button
                    type="submit"
                    disabled={isSubmittingCustomer || !customerForm.name.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e293b] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#0f172a] disabled:opacity-70"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingCustomer || !selectedCustomerId}
                    onClick={handleUpdateCustomer}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-70"
                  >
                    <Pencil className="h-4 w-4" />
                    Update
                  </button>
                  <button
                    type="button"
                    disabled={!selectedCustomerId}
                    onClick={handleDeleteCustomer}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-rose-800 disabled:opacity-70"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerForm(initialCustomerForm)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
              <h2 className="text-lg font-black text-slate-900">{selectedCustomer ? selectedCustomer.name : 'Select a customer'}</h2>
              <p className="mt-1 text-sm text-slate-500">{selectedCustomer?.phone || selectedCustomer?.email || 'No contact available'}</p>
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
                  Send SMS Reminder
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
                  Send WhatsApp Reminder
                </a>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current balance</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {formatCurrency(Math.abs(Number(selectedCustomer?.totalBalance || 0)))}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {Number(selectedCustomer?.totalBalance || 0) >= 0 ? 'Amount to collect' : 'Amount to pay'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Entries</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">{transactions.length}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Chronological ledger history</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <CreditCard className="h-4 w-4" />
                {editingTransactionId ? 'Edit transaction' : 'Add transaction'}
              </h2>
              <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSaveTransaction}>
                <select
                  value={transactionForm.customerId}
                  onChange={(e) => {
                    const customerId = e.target.value;
                    setTransactionForm((prev) => ({ ...prev, customerId }));
                    setSelectedCustomerId(customerId);
                  }}
                  required
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>

                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, type: e.target.value as 'SALE' | 'PAYMENT' }))}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="SALE">Sale (Udhar)</option>
                  <option value="PAYMENT">Payment (Jama)</option>
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.totalAmount}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, totalAmount: e.target.value }))}
                  placeholder="Total amount"
                  required={transactionForm.type === 'SALE'}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transactionForm.paidAmount}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, paidAmount: e.target.value }))}
                  placeholder={transactionForm.type === 'SALE' ? 'Paid amount (optional)' : 'Payment amount'}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="date"
                    value={transactionForm.transactionDate}
                    onChange={(e) => setTransactionForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <label className="md:col-span-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
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
                  <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
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

                <div className="md:col-span-2 grid grid-cols-2 gap-2">
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
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
              <h2 className="text-base font-bold text-slate-900">Customer ledger</h2>
              <div className="mt-4 space-y-3 lg:max-h-[50vh] lg:overflow-y-auto lg:pr-1">
                {isLoadingTransactions ? (
                  <p className="py-6 text-center text-sm text-slate-500">Loading transactions...</p>
                ) : sortedTransactions.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No transactions for this customer yet.</p>
                ) : (
                  sortedTransactions.map((transaction) => {
                    const sale = transaction.type === 'SALE';
                    const amount = sale ? Number(transaction.dueAmount || 0) : Number(transaction.paidAmount || 0);
                    const attachments = attachmentsByTransaction[transaction.id] || [];
                    return (
                      <div key={transaction.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {sale ? 'Sale added' : 'Payment received'} · {formatDate(transaction.timestamp)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Ref: {transaction.referenceNo} {transaction.description ? `· ${transaction.description}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-extrabold ${sale ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {sale ? '+' : '-'} {formatCurrency(amount)}
                            </p>
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
          </section>
        </div>
      </div>
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

