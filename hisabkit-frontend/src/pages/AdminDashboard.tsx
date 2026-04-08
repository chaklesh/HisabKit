import { useEffect, useMemo, useState } from 'react';
import { Building2, Database, Layers, Pencil, Plus, Trash2, Users } from 'lucide-react';
import {
  createTenantCustomer,
  createTenantTransaction,
  createTenant,
  deleteTenant,
  deleteTenantCustomer,
  deleteTenantTransaction,
  listTenantCustomers,
  listTenantTransactions,
  listTenants,
  Tenant,
  updateTenant,
  updateTenantCustomer,
  updateTenantTransaction,
} from '../api/api';
import { useAuth } from '../context/AuthContext';

type TabKey = 'tenants' | 'customers' | 'transactions';

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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('tenants');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showTenantEditor, setShowTenantEditor] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');

  const [tenantForm, setTenantForm] = useState({
    id: '',
    name: '',
    slug: '',
    businessType: '',
    ownerName: '',
    businessPhone: '',
    businessEmail: '',
    businessAddress: '',
    gstNumber: '',
    logoUrl: '',
    smsTemplate: '',
    whatsappTemplate: '',
    status: 'ACTIVE',
    adminUsername: '',
    adminPassword: '',
    adminEmail: '',
    adminMobile: '',
  });

  const [customerEdit, setCustomerEdit] = useState<{ id: string; name: string; phone: string; email: string; address: string; gstNumber: string }>({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });
  const [customerCreate, setCustomerCreate] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });

  const [transactionEdit, setTransactionEdit] = useState<{
    id: string;
    customerId: string;
    type: 'SALE' | 'PAYMENT';
    totalAmount: string;
    paidAmount: string;
    description: string;
    transactionDate: string;
  }>({
    id: '',
    customerId: '',
    type: 'SALE',
    totalAmount: '',
    paidAmount: '',
    description: '',
    transactionDate: '',
  });
  const [transactionCreate, setTransactionCreate] = useState({
    customerId: '',
    type: 'SALE' as 'SALE' | 'PAYMENT',
    totalAmount: '',
    paidAmount: '',
    description: '',
    transactionDate: '',
  });

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) || null,
    [tenants, selectedTenantId]
  );
  const isTenantFormValid = Boolean(
    tenantForm.name.trim() &&
      tenantForm.status.trim() &&
      (tenantForm.id ||
        (tenantForm.slug.trim() && tenantForm.adminUsername.trim() && tenantForm.adminPassword.trim()))
  );
  const customerNameById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer.name])),
    [customers]
  );
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.email, customer.address, customer.gstNumber]
        .filter(Boolean)
        .some((value) => (value || '').toLowerCase().includes(q))
    );
  }, [customers, customerSearch]);
  const filteredTransactions = useMemo(() => {
    const q = transactionSearch.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((txn) => {
      const dateText = new Date(txn.timestamp).toLocaleDateString('en-IN').toLowerCase();
      const amountText = `${txn.totalAmount} ${txn.paidAmount} ${txn.dueAmount}`.toLowerCase();
      const customerName = (customerNameById[txn.customerId] || '').toLowerCase();
      return [txn.referenceNo, txn.type, txn.description || '', dateText, amountText, customerName]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [transactions, transactionSearch, customerNameById]);

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await listTenants();
      const list = Array.isArray(res.data) ? (res.data as Tenant[]) : [];
      setTenants(list);
      const next = list.some((t) => t.id === selectedTenantId) ? selectedTenantId : list[0]?.id || '';
      setSelectedTenantId(next);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load tenants.');
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomers = async (tenantId: string) => {
    if (!tenantId) {
      setCustomers([]);
      return;
    }
    try {
      const res = await listTenantCustomers(tenantId);
      setCustomers(Array.isArray(res.data) ? (res.data as Customer[]) : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load tenant customers.');
      setCustomers([]);
    }
  };

  const loadTransactions = async (tenantId: string) => {
    if (!tenantId) {
      setTransactions([]);
      return;
    }
    try {
      const res = await listTenantTransactions(tenantId);
      setTransactions(Array.isArray(res.data) ? (res.data as LedgerTransaction[]) : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load tenant transactions.');
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      void loadTenants();
    }
  }, [user?.role]);

  useEffect(() => {
    if (!selectedTenantId) return;
    setCustomerSearch('');
    setTransactionSearch('');
    setCustomerEdit({ id: '', name: '', phone: '', email: '', address: '', gstNumber: '' });
    setCustomerCreate({ name: '', phone: '', email: '', address: '', gstNumber: '' });
    setTransactionEdit({
      id: '',
      customerId: '',
      type: 'SALE',
      totalAmount: '',
      paidAmount: '',
      description: '',
      transactionDate: '',
    });
    setTransactionCreate({
      customerId: '',
      type: 'SALE',
      totalAmount: '',
      paidAmount: '',
      description: '',
      transactionDate: '',
    });
    void loadCustomers(selectedTenantId);
    void loadTransactions(selectedTenantId);
  }, [selectedTenantId]);

  if (user?.role !== 'SUPER_ADMIN') {
    return <div className="p-8 text-center text-red-500">Access denied</div>;
  }

  const resetTenantForm = () =>
    setTenantForm({
      id: '',
      name: '',
      slug: '',
      businessType: '',
      ownerName: '',
      businessPhone: '',
      businessEmail: '',
      businessAddress: '',
      gstNumber: '',
      logoUrl: '',
      smsTemplate: '',
      whatsappTemplate: '',
      status: 'ACTIVE',
      adminUsername: '',
      adminPassword: '',
      adminEmail: '',
      adminMobile: '',
    });

  const saveTenant = async () => {
    if (!isTenantFormValid) {
      setError('Please complete all required tenant fields.');
      return;
    }
    setError('');
    setNotice('');
    try {
      if (tenantForm.id) {
        await updateTenant(tenantForm.id, {
          name: tenantForm.name,
          businessType: tenantForm.businessType || undefined,
          ownerName: tenantForm.ownerName || undefined,
          businessPhone: tenantForm.businessPhone || undefined,
          businessEmail: tenantForm.businessEmail || undefined,
          businessAddress: tenantForm.businessAddress || undefined,
          gstNumber: tenantForm.gstNumber || undefined,
          logoUrl: tenantForm.logoUrl || undefined,
          smsTemplate: tenantForm.smsTemplate || undefined,
          whatsappTemplate: tenantForm.whatsappTemplate || undefined,
          status: tenantForm.status || undefined,
        });
      } else {
        await createTenant({
          name: tenantForm.name,
          slug: tenantForm.slug,
          businessType: tenantForm.businessType || undefined,
          ownerName: tenantForm.ownerName || undefined,
          businessPhone: tenantForm.businessPhone || undefined,
          businessEmail: tenantForm.businessEmail || undefined,
          businessAddress: tenantForm.businessAddress || undefined,
          gstNumber: tenantForm.gstNumber || undefined,
          logoUrl: tenantForm.logoUrl || undefined,
          smsTemplate: tenantForm.smsTemplate || undefined,
          whatsappTemplate: tenantForm.whatsappTemplate || undefined,
          status: tenantForm.status || undefined,
          adminUsername: tenantForm.adminUsername,
          adminPassword: tenantForm.adminPassword,
          adminEmail: tenantForm.adminEmail || undefined,
          adminMobile: tenantForm.adminMobile || undefined,
        });
      }
      resetTenantForm();
      await loadTenants();
      setNotice(tenantForm.id ? 'Tenant updated successfully.' : 'Tenant created successfully.');
      setShowTenantEditor(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save tenant.');
    }
  };

  const removeTenant = async (tenantId: string) => {
    if (!window.confirm('Delete this tenant and all associated data?')) return;
    setError('');
    setNotice('');
    try {
      await deleteTenant(tenantId);
      await loadTenants();
      setNotice('Tenant deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete tenant.');
    }
  };

  const saveCustomerEdit = async () => {
    if (!selectedTenantId || !customerEdit.id) return;
    setError('');
    setNotice('');
    try {
      await updateTenantCustomer(selectedTenantId, customerEdit.id, {
        name: customerEdit.name,
        phone: customerEdit.phone || undefined,
        email: customerEdit.email || undefined,
        address: customerEdit.address || undefined,
        gstNumber: customerEdit.gstNumber || undefined,
      });
      setCustomerEdit({ id: '', name: '', phone: '', email: '', address: '', gstNumber: '' });
      await loadCustomers(selectedTenantId);
      setNotice('Customer updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update customer.');
    }
  };

  const createCustomer = async () => {
    if (!selectedTenantId || !customerCreate.name.trim()) return;
    setError('');
    setNotice('');
    try {
      await createTenantCustomer(selectedTenantId, {
        name: customerCreate.name.trim(),
        phone: customerCreate.phone || undefined,
        email: customerCreate.email || undefined,
        address: customerCreate.address || undefined,
        gstNumber: customerCreate.gstNumber || undefined,
      });
      setCustomerCreate({ name: '', phone: '', email: '', address: '', gstNumber: '' });
      await loadCustomers(selectedTenantId);
      setNotice('Customer created.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to create customer.');
    }
  };

  const removeCustomer = async (customerId: string) => {
    if (!selectedTenantId || !window.confirm('Delete this customer and all their transactions?')) return;
    setError('');
    setNotice('');
    try {
      await deleteTenantCustomer(selectedTenantId, customerId);
      await loadCustomers(selectedTenantId);
      await loadTransactions(selectedTenantId);
      setNotice('Customer deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete customer.');
    }
  };

  const saveTransactionEdit = async () => {
    if (!selectedTenantId || !transactionEdit.id) return;
    setError('');
    setNotice('');
    try {
      await updateTenantTransaction(selectedTenantId, transactionEdit.id, {
        customerId: transactionEdit.customerId,
        type: transactionEdit.type,
        totalAmount: Number(transactionEdit.totalAmount || 0),
        paidAmount: Number(transactionEdit.paidAmount || 0),
        description: transactionEdit.description || undefined,
        transactionDate: transactionEdit.transactionDate || undefined,
      });
      setTransactionEdit({
        id: '',
        customerId: '',
        type: 'SALE',
        totalAmount: '',
        paidAmount: '',
        description: '',
        transactionDate: '',
      });
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice('Transaction updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update transaction.');
    }
  };

  const createTransaction = async () => {
    if (!selectedTenantId || !transactionCreate.customerId) return;
    setError('');
    setNotice('');
    try {
      await createTenantTransaction(selectedTenantId, {
        customerId: transactionCreate.customerId,
        type: transactionCreate.type,
        totalAmount: Number(transactionCreate.totalAmount || 0),
        paidAmount: Number(transactionCreate.paidAmount || 0),
        description: transactionCreate.description || undefined,
        transactionDate: transactionCreate.transactionDate || undefined,
      });
      setTransactionCreate({
        customerId: '',
        type: 'SALE',
        totalAmount: '',
        paidAmount: '',
        description: '',
        transactionDate: '',
      });
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice('Transaction created.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to create transaction.');
    }
  };

  const removeTransaction = async (transactionId: string) => {
    if (!selectedTenantId || !window.confirm('Delete this transaction?')) return;
    setError('');
    setNotice('');
    try {
      await deleteTenantTransaction(selectedTenantId, transactionId);
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice('Transaction deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete transaction.');
    }
  };

  return (
    <div className="rounded-2xl bg-slate-100 p-3 sm:p-4">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Super Admin</p>
          <h1 className="px-2 pt-2 text-xl font-black text-slate-900">Control center</h1>
          <div className="mt-6 space-y-2">
            <button
              onClick={() => setActiveTab('tenants')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                activeTab === 'tenants' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Tenants
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                activeTab === 'customers' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4" />
              Customers
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                activeTab === 'transactions' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Database className="h-4 w-4" />
              Transactions
            </button>
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {notice}
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-semibold text-slate-700">Active tenant</label>
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} ({tenant.slug})
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading admin data...</p>
          ) : null}

          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-2xl font-black text-slate-900">Tenant management</h2>
                <button
                  onClick={() => {
                    resetTenantForm();
                    setShowTenantEditor(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add tenant
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <div className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
                {tenants.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    No tenants yet. Create your first tenant to start onboarding users.
                  </p>
                ) : (
                  tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tenant.name}</p>
                        <p className="text-xs text-slate-500">
                          {tenant.slug} · {tenant.businessType || 'N/A'} · {tenant.status || 'ACTIVE'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setTenantForm({
                              id: tenant.id,
                              name: tenant.name,
                              slug: tenant.slug,
                              businessType: tenant.businessType || '',
                              ownerName: tenant.ownerName || '',
                              businessPhone: tenant.businessPhone || '',
                              businessEmail: tenant.businessEmail || '',
                              businessAddress: tenant.businessAddress || '',
                              gstNumber: tenant.gstNumber || '',
                              logoUrl: tenant.logoUrl || '',
                              smsTemplate: tenant.smsTemplate || '',
                              whatsappTemplate: tenant.whatsappTemplate || '',
                              status: tenant.status || 'ACTIVE',
                              adminUsername: '',
                              adminPassword: '',
                              adminEmail: '',
                              adminMobile: '',
                            });
                            setShowTenantEditor(true);
                          }}
                          className="rounded-lg border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeTenant(tenant.id)}
                          className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {showTenantEditor ? (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900">{tenantForm.id ? 'Edit tenant' : 'Create tenant'}</p>
                        <button
                          onClick={() => setShowTenantEditor(false)}
                          className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                        >
                          Collapse
                        </button>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <input value={tenantForm.name} onChange={(e) => setTenantForm((p) => ({ ...p, name: e.target.value }))} placeholder="Tenant name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                        <input value={tenantForm.slug} onChange={(e) => setTenantForm((p) => ({ ...p, slug: e.target.value }))} placeholder="Tenant slug" disabled={Boolean(tenantForm.id)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none disabled:bg-slate-100" />
                        <input value={tenantForm.businessType} onChange={(e) => setTenantForm((p) => ({ ...p, businessType: e.target.value }))} placeholder="Business type" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                        <input value={tenantForm.ownerName} onChange={(e) => setTenantForm((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                        <input value={tenantForm.businessPhone} onChange={(e) => setTenantForm((p) => ({ ...p, businessPhone: e.target.value }))} placeholder="Business phone" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                        <input value={tenantForm.businessEmail} onChange={(e) => setTenantForm((p) => ({ ...p, businessEmail: e.target.value }))} placeholder="Business email" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                        <input value={tenantForm.gstNumber} onChange={(e) => setTenantForm((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                        <select value={tenantForm.status} onChange={(e) => setTenantForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none">
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                        <input value={tenantForm.logoUrl} onChange={(e) => setTenantForm((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="Logo URL" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                        <input value={tenantForm.businessAddress} onChange={(e) => setTenantForm((p) => ({ ...p, businessAddress: e.target.value }))} placeholder="Business address" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                        {!tenantForm.id && (
                          <>
                            <input value={tenantForm.adminUsername} onChange={(e) => setTenantForm((p) => ({ ...p, adminUsername: e.target.value }))} placeholder="Admin username" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                            <input type="password" value={tenantForm.adminPassword} onChange={(e) => setTenantForm((p) => ({ ...p, adminPassword: e.target.value }))} placeholder="Admin password" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                            <input value={tenantForm.adminEmail} onChange={(e) => setTenantForm((p) => ({ ...p, adminEmail: e.target.value }))} placeholder="Admin email (optional)" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                            <input value={tenantForm.adminMobile} onChange={(e) => setTenantForm((p) => ({ ...p, adminMobile: e.target.value }))} placeholder="Admin mobile (optional)" className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" />
                          </>
                        )}
                        <textarea value={tenantForm.smsTemplate} onChange={(e) => setTenantForm((p) => ({ ...p, smsTemplate: e.target.value }))} placeholder="SMS template (variables: {{customerName}}, {{balance}}, {{balanceType}}, {{businessName}}, {{customerPhone}})" className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                        <textarea value={tenantForm.whatsappTemplate} onChange={(e) => setTenantForm((p) => ({ ...p, whatsappTemplate: e.target.value }))} placeholder="WhatsApp template (same variables as SMS)" className="min-h-20 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none md:col-span-2" />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={saveTenant} disabled={!isTenantFormValid} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                          <Plus className="h-4 w-4" />
                          {tenantForm.id ? 'Update tenant' : 'Create tenant'}
                        </button>
                        <button
                          onClick={() => {
                            resetTenantForm();
                            setShowTenantEditor(false);
                          }}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Select a tenant to edit, or click "Add tenant" to open the editor.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900">Tenant customers</h2>
              <p className="text-sm text-slate-600">
                {selectedTenant ? `Managing customers for ${selectedTenant.name}` : 'Select a tenant first.'}
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-900">Create customer</p>
                <div className="grid gap-2 md:grid-cols-3">
                  <input
                    value={customerCreate.name}
                    onChange={(e) => setCustomerCreate((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Name"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={customerCreate.phone}
                    onChange={(e) => setCustomerCreate((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Phone"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={customerCreate.email}
                    onChange={(e) => setCustomerCreate((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={customerCreate.address}
                    onChange={(e) => setCustomerCreate((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Address"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={customerCreate.gstNumber}
                    onChange={(e) => setCustomerCreate((p) => ({ ...p, gstNumber: e.target.value }))}
                    placeholder="GST Number"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={createCustomer}
                    disabled={!customerCreate.name.trim()}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setCustomerCreate({ name: '', phone: '', email: '', address: '', gstNumber: '' })}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers by name, phone, email, address, GST"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                {filteredCustomers.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    {customers.length === 0 ? 'No customers in this tenant yet.' : 'No matching customers found.'}
                  </p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div key={customer.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-500">
                            {customer.phone || customer.email || 'No contact'} · {formatCurrency(Number(customer.totalBalance || 0))}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setCustomerEdit({
                              id: customer.id,
                              name: customer.name || '',
                              phone: customer.phone || '',
                              email: customer.email || '',
                              address: customer.address || '',
                              gstNumber: customer.gstNumber || '',
                            })
                          }
                            className="rounded-lg border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeCustomer(customer.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {customerEdit.id === customer.id && (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-3 text-sm font-bold text-slate-900">Edit customer</p>
                          <div className="grid gap-2 md:grid-cols-3">
                            <input
                              value={customerEdit.name}
                              onChange={(e) => setCustomerEdit((p) => ({ ...p, name: e.target.value }))}
                              placeholder="Name"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={customerEdit.phone}
                              onChange={(e) => setCustomerEdit((p) => ({ ...p, phone: e.target.value }))}
                              placeholder="Phone"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={customerEdit.email}
                              onChange={(e) => setCustomerEdit((p) => ({ ...p, email: e.target.value }))}
                              placeholder="Email"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={customerEdit.address}
                              onChange={(e) => setCustomerEdit((p) => ({ ...p, address: e.target.value }))}
                              placeholder="Address"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={customerEdit.gstNumber}
                              onChange={(e) => setCustomerEdit((p) => ({ ...p, gstNumber: e.target.value }))}
                              placeholder="GST Number"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={saveCustomerEdit}
                              disabled={!customerEdit.name.trim()}
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                setCustomerEdit({ id: '', name: '', phone: '', email: '', address: '', gstNumber: '' })
                              }
                              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900">Tenant transactions</h2>
              <p className="text-sm text-slate-600">
                {selectedTenant ? `Managing transactions for ${selectedTenant.name}` : 'Select a tenant first.'}
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Layers className="h-4 w-4" />
                  Create transaction
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  <select
                    value={transactionCreate.customerId}
                    onChange={(e) => setTransactionCreate((p) => ({ ...p, customerId: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={transactionCreate.type}
                    onChange={(e) => setTransactionCreate((p) => ({ ...p, type: e.target.value as 'SALE' | 'PAYMENT' }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  >
                    <option value="SALE">SALE</option>
                    <option value="PAYMENT">PAYMENT</option>
                  </select>
                  <input
                    type="date"
                    value={transactionCreate.transactionDate}
                    onChange={(e) => setTransactionCreate((p) => ({ ...p, transactionDate: e.target.value }))}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={transactionCreate.totalAmount}
                    onChange={(e) => setTransactionCreate((p) => ({ ...p, totalAmount: e.target.value }))}
                    placeholder="Total amount"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={transactionCreate.paidAmount}
                    onChange={(e) => setTransactionCreate((p) => ({ ...p, paidAmount: e.target.value }))}
                    placeholder="Paid amount"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={transactionCreate.description}
                    onChange={(e) => setTransactionCreate((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Description"
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                  />
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={createTransaction}
                    disabled={
                      !transactionCreate.customerId ||
                      (transactionCreate.type === 'SALE' && !transactionCreate.totalAmount) ||
                      (transactionCreate.type === 'PAYMENT' && !transactionCreate.paidAmount)
                    }
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Create
                  </button>
                  <button
                    onClick={() =>
                      setTransactionCreate({
                        customerId: '',
                        type: 'SALE',
                        totalAmount: '',
                        paidAmount: '',
                        description: '',
                        transactionDate: '',
                      })
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <input
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  placeholder="Search transactions by ref, type, customer, description, date, amount"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                    {transactions.length === 0 ? 'No transactions in this tenant yet.' : 'No matching transactions found.'}
                  </p>
                ) : (
                  filteredTransactions.map((txn) => (
                    <div key={txn.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {txn.type} · {new Date(txn.timestamp).toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-xs text-slate-500">
                            Ref {txn.referenceNo} · Total {formatCurrency(Number(txn.totalAmount || 0))} · Paid{' '}
                            {formatCurrency(Number(txn.paidAmount || 0))}
                          </p>
                          <p className="text-xs text-slate-500">{customerNameById[txn.customerId] || 'Unknown customer'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setTransactionEdit({
                                id: txn.id,
                                customerId: txn.customerId,
                                type: txn.type,
                                totalAmount: String(txn.totalAmount || ''),
                                paidAmount: String(txn.paidAmount || ''),
                                description: txn.description || '',
                                transactionDate: txn.timestamp?.slice(0, 10) || '',
                              })
                            }
                            className="rounded-lg border border-slate-300 p-1.5 text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeTransaction(txn.id)}
                            className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {transactionEdit.id === txn.id && (
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
                            <Layers className="h-4 w-4" />
                            Edit transaction
                          </p>
                          <div className="grid gap-2 md:grid-cols-3">
                            <select
                              value={transactionEdit.customerId}
                              onChange={(e) => setTransactionEdit((p) => ({ ...p, customerId: e.target.value }))}
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            >
                              <option value="">Select customer</option>
                              {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                  {customer.name}
                                </option>
                              ))}
                            </select>
                            <select
                              value={transactionEdit.type}
                              onChange={(e) => setTransactionEdit((p) => ({ ...p, type: e.target.value as 'SALE' | 'PAYMENT' }))}
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            >
                              <option value="SALE">SALE</option>
                              <option value="PAYMENT">PAYMENT</option>
                            </select>
                            <input
                              type="date"
                              value={transactionEdit.transactionDate}
                              onChange={(e) => setTransactionEdit((p) => ({ ...p, transactionDate: e.target.value }))}
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={transactionEdit.totalAmount}
                              onChange={(e) => setTransactionEdit((p) => ({ ...p, totalAmount: e.target.value }))}
                              placeholder="Total amount"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={transactionEdit.paidAmount}
                              onChange={(e) => setTransactionEdit((p) => ({ ...p, paidAmount: e.target.value }))}
                              placeholder="Paid amount"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={transactionEdit.description}
                              onChange={(e) => setTransactionEdit((p) => ({ ...p, description: e.target.value }))}
                              placeholder="Description"
                              className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                            />
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={saveTransactionEdit}
                              disabled={
                                !transactionEdit.customerId ||
                                (transactionEdit.type === 'SALE' && !transactionEdit.totalAmount) ||
                                (transactionEdit.type === 'PAYMENT' && !transactionEdit.paidAmount)
                              }
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Save
                            </button>
                            <button
                              onClick={() =>
                                setTransactionEdit({
                                  id: '',
                                  customerId: '',
                                  type: 'SALE',
                                  totalAmount: '',
                                  paidAmount: '',
                                  description: '',
                                  transactionDate: '',
                                })
                              }
                              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

