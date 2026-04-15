import { useEffect, useMemo, useState } from 'react';
import type { Tenant } from '@/shared/types';
import * as adminService from '@/shared/api/client';
import type {
  Customer,
  CustomerCreateState,
  CustomerFormState,
  LedgerTransaction,
  TabKey,
  TenantFormState,
  TransactionCreateState,
  TransactionFormState,
} from '../types/adminTypes';
import {
  createEmptyCustomerCreate,
  createEmptyCustomerEdit,
  createEmptyTenantForm,
  createEmptyTransactionCreate,
  createEmptyTransactionEdit,
  mapTenantToForm,
} from '../types/adminTypes';

export function useAdminDashboardState(userRole?: string) {
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

  const [tenantForm, setTenantForm] = useState<TenantFormState>(createEmptyTenantForm);
  const [customerEdit, setCustomerEdit] = useState<CustomerFormState>(createEmptyCustomerEdit);
  const [customerCreate, setCustomerCreate] = useState<CustomerCreateState>(createEmptyCustomerCreate);
  const [transactionEdit, setTransactionEdit] = useState<TransactionFormState>(createEmptyTransactionEdit);
  const [transactionCreate, setTransactionCreate] = useState<TransactionCreateState>(createEmptyTransactionCreate);

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

  const clearMessages = () => {
    setError('');
    setNotice('');
  };

  const resetTenantForm = () => {
    setTenantForm(createEmptyTenantForm());
  };

  const resetTenantScopedForms = () => {
    setCustomerSearch('');
    setTransactionSearch('');
    setCustomerEdit(createEmptyCustomerEdit());
    setCustomerCreate(createEmptyCustomerCreate());
    setTransactionEdit(createEmptyTransactionEdit());
    setTransactionCreate(createEmptyTransactionCreate());
  };

  const loadTenants = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminService.listTenants();
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
      const res = await adminService.listTenantCustomers(tenantId);
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
      const res = await adminService.listTenantTransactions(tenantId);
      setTransactions(Array.isArray(res.data) ? (res.data as LedgerTransaction[]) : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load tenant transactions.');
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (userRole === 'SUPER_ADMIN') {
      void loadTenants();
    }
  }, [userRole]);

  useEffect(() => {
    if (!selectedTenantId) return;
    resetTenantScopedForms();
    void loadCustomers(selectedTenantId);
    void loadTransactions(selectedTenantId);
  }, [selectedTenantId]);

  const saveTenant = async () => {
    if (!isTenantFormValid) {
      setError('Please complete all required tenant fields.');
      return;
    }
    clearMessages();
    try {
      if (tenantForm.id) {
        await adminService.updateTenant(tenantForm.id, {
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
        await adminService.createTenant({
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
    if (!window.confirm('Delete this tenant and all associated data? This action cannot be undone.')) return;
    clearMessages();
    try {
      await adminService.deleteTenant(tenantId);
      await loadTenants();
      setNotice('Tenant deleted successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete tenant.');
    }
  };

  const saveCustomerEdit = async () => {
    if (!selectedTenantId || !customerEdit.id) return;
    clearMessages();
    try {
      await adminService.updateTenantCustomer(selectedTenantId, customerEdit.id, {
        name: customerEdit.name,
        phone: customerEdit.phone || undefined,
        email: customerEdit.email || undefined,
        address: customerEdit.address || undefined,
        gstNumber: customerEdit.gstNumber || undefined,
        dueDate: customerEdit.dueDate || undefined,
      });
      setCustomerEdit(createEmptyCustomerEdit());
      await loadCustomers(selectedTenantId);
      setNotice('Customer updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update customer.');
    }
  };

  const createCustomer = async () => {
    if (!selectedTenantId || !customerCreate.name.trim()) return;
    clearMessages();
    try {
      await adminService.createTenantCustomer(selectedTenantId, {
        name: customerCreate.name.trim(),
        phone: customerCreate.phone || undefined,
        email: customerCreate.email || undefined,
        address: customerCreate.address || undefined,
        gstNumber: customerCreate.gstNumber || undefined,
        dueDate: customerCreate.dueDate || undefined,
      });
      setCustomerCreate(createEmptyCustomerCreate());
      await loadCustomers(selectedTenantId);
      setNotice('Customer created.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to create customer.');
    }
  };

  const removeCustomer = async (customerId: string) => {
    if (!selectedTenantId || !window.confirm('Delete this customer and all their transactions?')) return;
    clearMessages();
    try {
      await adminService.deleteTenantCustomer(selectedTenantId, customerId);
      await loadCustomers(selectedTenantId);
      await loadTransactions(selectedTenantId);
      setNotice('Customer deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete customer.');
    }
  };

  const saveTransactionEdit = async () => {
    if (!selectedTenantId || !transactionEdit.id) return;
    clearMessages();
    try {
      await adminService.updateTenantTransaction(selectedTenantId, transactionEdit.id, {
        customerId: transactionEdit.customerId,
        type: transactionEdit.type,
        totalAmount: Number(transactionEdit.totalAmount || 0),
        paidAmount: Number(transactionEdit.paidAmount || 0),
        description: transactionEdit.description || undefined,
        transactionDate: transactionEdit.transactionDate || undefined,
        referenceNo: transactionEdit.referenceNo || undefined,
      });
      setTransactionEdit(createEmptyTransactionEdit());
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice('Transaction updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update transaction.');
    }
  };

  const createTransaction = async () => {
    if (!selectedTenantId || !transactionCreate.customerId) return;
    clearMessages();
    try {
      await adminService.createTenantTransaction(selectedTenantId, {
        customerId: transactionCreate.customerId,
        type: transactionCreate.type,
        totalAmount: Number(transactionCreate.totalAmount || 0),
        paidAmount: Number(transactionCreate.paidAmount || 0),
        description: transactionCreate.description || undefined,
        transactionDate: transactionCreate.transactionDate || undefined,
        referenceNo: transactionCreate.referenceNo || undefined,
      });
      setTransactionCreate(createEmptyTransactionCreate());
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice('Transaction created.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to create transaction.');
    }
  };

  const removeTransaction = async (transactionId: string) => {
    if (!selectedTenantId || !window.confirm('Delete this transaction?')) return;
    clearMessages();
    try {
      await adminService.deleteTenantTransaction(selectedTenantId, transactionId);
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice('Transaction deleted.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to delete transaction.');
    }
  };

  const openCreateTenantEditor = () => {
    resetTenantForm();
    setShowTenantEditor(true);
  };

  const openEditTenantEditor = (tenant: Tenant) => {
    setTenantForm(mapTenantToForm(tenant));
    setShowTenantEditor(true);
  };

  const resetCustomerEdit = () => setCustomerEdit(createEmptyCustomerEdit());
  const resetCustomerCreate = () => setCustomerCreate(createEmptyCustomerCreate());
  const resetTransactionEdit = () => setTransactionEdit(createEmptyTransactionEdit());
  const resetTransactionCreate = () => setTransactionCreate(createEmptyTransactionCreate());

  const openCustomerEdit = (customer: Customer) => {
    setCustomerEdit({
      id: customer.id,
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      gstNumber: customer.gstNumber || '',
      dueDate: customer.dueDate || '',
    });
  };

  const openTransactionEdit = (txn: LedgerTransaction) => {
    setTransactionEdit({
      id: txn.id,
      customerId: txn.customerId,
      type: txn.type,
      totalAmount: String(txn.totalAmount || ''),
      paidAmount: String(txn.paidAmount || ''),
      description: txn.description || '',
      transactionDate: txn.timestamp?.slice(0, 10) || '',
      referenceNo: txn.referenceNo || '',
    });
  };

  return {
    activeTab,
    setActiveTab,
    tenants,
    selectedTenantId,
    setSelectedTenantId,
    selectedTenant,
    customers,
    transactions,
    isLoading,
    error,
    notice,
    showTenantEditor,
    setShowTenantEditor,
    customerSearch,
    setCustomerSearch,
    transactionSearch,
    setTransactionSearch,
    tenantForm,
    setTenantForm,
    customerEdit,
    setCustomerEdit,
    customerCreate,
    setCustomerCreate,
    transactionEdit,
    setTransactionEdit,
    transactionCreate,
    setTransactionCreate,
    isTenantFormValid,
    customerNameById,
    filteredCustomers,
    filteredTransactions,
    saveTenant,
    removeTenant,
    saveCustomerEdit,
    createCustomer,
    removeCustomer,
    saveTransactionEdit,
    createTransaction,
    removeTransaction,
    openCreateTenantEditor,
    openEditTenantEditor,
    resetTenantForm,
    resetCustomerEdit,
    resetCustomerCreate,
    resetTransactionEdit,
    resetTransactionCreate,
    openCustomerEdit,
    openTransactionEdit,
    loadTenants,
  };
}
