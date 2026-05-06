import ledgerService from "@/modules/ledger/services/ledgerService";
import type { Tenant } from "@/shared/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import adminService from "../services/adminService";
import type {
  Customer,
  CustomerCreateState,
  CustomerFormState,
  LedgerTransaction,
  TabKey,
  TenantFormState,
  TransactionCreateState,
  TransactionFormState,
} from "../types/adminTypes";
import {
  createEmptyCustomerCreate,
  createEmptyCustomerEdit,
  createEmptyTenantForm,
  createEmptyTransactionCreate,
  createEmptyTransactionEdit,
  mapTenantToForm,
} from "../types/adminTypes";

export function useAdminDashboardState(userRole?: string) {
  const [activeTab, setActiveTab] = useState<TabKey>("tenants");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showTenantEditor, setShowTenantEditor] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");

  const [tenantForm, setTenantForm] = useState<TenantFormState>(createEmptyTenantForm);
  const [customerEdit, setCustomerEdit] = useState<CustomerFormState>(createEmptyCustomerEdit);
  const [customerCreate, setCustomerCreate] =
    useState<CustomerCreateState>(createEmptyCustomerCreate);
  const [transactionEdit, setTransactionEdit] = useState<TransactionFormState>(
    createEmptyTransactionEdit,
  );
  const [transactionCreate, setTransactionCreate] = useState<TransactionCreateState>(
    createEmptyTransactionCreate,
  );
  const [transactionAttachments, setTransactionAttachments] = useState<File[]>([]);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) || null,
    [tenants, selectedTenantId],
  );

  const isTenantFormValid = Boolean(
    tenantForm.name.trim() &&
      tenantForm.status.trim() &&
      (tenantForm.id ||
        (tenantForm.slug.trim() &&
          tenantForm.adminUsername.trim() &&
          tenantForm.adminPassword.trim())),
  );

  const customerNameById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      [customer.name, customer.phone, customer.email, customer.address, customer.gstNumber]
        .filter(Boolean)
        .some((value) => (value || "").toLowerCase().includes(q)),
    );
  }, [customers, customerSearch]);

  const filteredTransactions = useMemo(() => {
    const q = transactionSearch.trim().toLowerCase();
    const list = q
      ? transactions.filter((txn) => {
          const dateText = new Date(txn.timestamp).toLocaleDateString("en-IN").toLowerCase();
          const amountText = `${txn.totalAmount} ${txn.paidAmount} ${txn.dueAmount}`.toLowerCase();
          const customerName = (customerNameById[txn.customerId] || "").toLowerCase();
          return [
            txn.referenceNo,
            txn.type,
            txn.description || "",
            dateText,
            amountText,
            customerName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(q);
        })
      : [...transactions];

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, transactionSearch, customerNameById]);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const resetTenantForm = () => {
    setTenantForm(createEmptyTenantForm());
  };

  const resetTenantScopedForms = useCallback(() => {
    setCustomerSearch("");
    setTransactionSearch("");
    setCustomerEdit(createEmptyCustomerEdit());
    setCustomerCreate(createEmptyCustomerCreate());
    setTransactionEdit(createEmptyTransactionEdit());
    setTransactionCreate(createEmptyTransactionCreate());
    setTransactionAttachments([]);
  }, []);

  const loadTenants = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await adminService.listTenants();
      const list = Array.isArray(res.data) ? (res.data as Tenant[]) : [];
      setTenants(list);
      const next = list.some((t) => t.id === selectedTenantId)
        ? selectedTenantId
        : list[0]?.id || "";
      setSelectedTenantId(next);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to load tenants.";
      console.error("Failed to load tenants:", err);
      setError(errorMsg);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTenantId]);

  const loadCustomers = useCallback(async (tenantId: string) => {
    if (!tenantId) {
      setCustomers([]);
      return;
    }
    try {
      const res = await adminService.listTenantCustomers(tenantId);
      setCustomers(Array.isArray(res.data) ? (res.data as Customer[]) : []);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to load tenant customers.";
      console.error("Failed to load customers for tenant:", tenantId, err);
      setError(errorMsg);
      setCustomers([]);
    }
  }, []);

  const loadTransactions = useCallback(async (tenantId: string) => {
    if (!tenantId) {
      setTransactions([]);
      return;
    }
    try {
      const res = await adminService.listTenantTransactions(tenantId);
      setTransactions(Array.isArray(res.data) ? (res.data as LedgerTransaction[]) : []);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to load tenant transactions.";
      console.error("Failed to load transactions for tenant:", tenantId, err);
      setError(errorMsg);
      setTransactions([]);
    }
  }, []);

  useEffect(() => {
    if (userRole === "SUPER_ADMIN" || userRole === "ROLE_SUPER_ADMIN") {
      void loadTenants();
    }
  }, [userRole, loadTenants]);

  useEffect(() => {
    if (!selectedTenantId) return;
    resetTenantScopedForms();
    void loadCustomers(selectedTenantId);
    void loadTransactions(selectedTenantId);
  }, [selectedTenantId, resetTenantScopedForms, loadCustomers, loadTransactions]);

  const saveTenant = async () => {
    if (!isTenantFormValid) {
      setError("Please complete all required tenant fields.");
      return;
    }
    clearMessages();
    try {
      if (tenantForm.id) {
        await updateTenantAction();
      } else {
        await createTenantAction();
      }
      resetTenantForm();
      await loadTenants();
      setNotice(tenantForm.id ? "Tenant updated successfully." : "Tenant created successfully.");
      setShowTenantEditor(false);
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to save tenant.";
      setError(errorMsg);
      return false;
    }
  };

  const updateTenantAction = async () => {
    if (!tenantForm.id) return;
    return adminService.updateTenant(tenantForm.id, {
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
  };

  const createTenantAction = async () => {
    return adminService.createTenant({
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
  };

  const removeTenant = async (tenantId: string): Promise<boolean> => {
    if (
      !window.confirm("Delete this tenant and all associated data? This action cannot be undone.")
    )
      return false;
    clearMessages();
    try {
      await adminService.deleteTenant(tenantId);
      await loadTenants();
      setNotice("Tenant deleted successfully.");
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to delete tenant.";
      setError(errorMsg);
      return false;
    }
  };

  const saveCustomerEdit = async (id?: string, data?: CustomerFormState): Promise<boolean> => {
    const customerId = id || customerEdit.id;
    const payload = data || customerEdit;
    if (!selectedTenantId || !customerId) return false;
    clearMessages();
    try {
      await adminService.updateTenantCustomer(selectedTenantId, customerId, {
        name: payload.name,
        phone: payload.phone || undefined,
        email: payload.email || undefined,
        address: payload.address || undefined,
        gstNumber: payload.gstNumber || undefined,
        dueDate: payload.dueDate || undefined,
      });
      setCustomerEdit(createEmptyCustomerEdit());
      await loadCustomers(selectedTenantId);
      setNotice("Customer updated.");
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Failed to update customer.";
      setError(message);
      return false;
    }
  };

  const createCustomer = async (data?: CustomerCreateState): Promise<boolean> => {
    const payload = data || customerCreate;
    if (!selectedTenantId || !payload.name?.trim()) return false;
    clearMessages();
    try {
      await adminService.createTenantCustomer(selectedTenantId, {
        name: payload.name.trim(),
        phone: payload.phone || undefined,
        email: payload.email || undefined,
        address: payload.address || undefined,
        gstNumber: payload.gstNumber || undefined,
        dueDate: payload.dueDate || undefined,
      });
      setCustomerCreate(createEmptyCustomerCreate());
      await loadCustomers(selectedTenantId);
      setNotice("Customer created.");
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to create customer.";
      setError(errorMsg);
      return false;
    }
  };

  const removeCustomer = async (customerId: string): Promise<boolean> => {
    if (!selectedTenantId || !window.confirm("Delete this customer and all their transactions?"))
      return false;
    clearMessages();
    try {
      await adminService.deleteTenantCustomer(selectedTenantId, customerId);
      await loadCustomers(selectedTenantId);
      await loadTransactions(selectedTenantId);
      setNotice("Customer deleted.");
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to delete customer.";
      setError(errorMsg);
      return false;
    }
  };

  const saveTransactionEdit = async (
    id?: string,
    data?: TransactionFormState | TransactionCreateState,
    files?: File[],
  ): Promise<boolean> => {
    const transactionId = id || (data as TransactionFormState).id || transactionEdit.id;
    const payload = data || transactionEdit;
    if (!selectedTenantId || !transactionId) return false;
    clearMessages();
    try {
      // 1. Update basic record
      await adminService.updateTenantTransaction(selectedTenantId, transactionId, {
        customerId: payload.customerId,
        type: payload.type,
        totalAmount: Number(payload.totalAmount || 0),
        paidAmount: Number(payload.paidAmount || 0),
        description: payload.description || undefined,
        transactionDate: payload.transactionDate || undefined,
        referenceNo: payload.referenceNo || undefined,
      });

      // 2. Upload any new attachments
      const targetFiles = files || transactionAttachments;
      if (targetFiles.length > 0) {
        for (const file of targetFiles) {
          try {
            await ledgerService.uploadTransactionAttachment(transactionId, file);
          } catch (uploadErr) {
            console.error("Failed to upload attachment from Admin:", file.name, uploadErr);
          }
        }
      }

      setTransactionAttachments([]);
      setTransactionEdit(createEmptyTransactionEdit());
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice("Transaction updated.");
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Failed to update transaction.";
      setError(message);
      return false;
    }
  };

  const createTransaction = async (
    data: TransactionCreateState,
    files?: File[],
  ): Promise<boolean> => {
    const payload = data || transactionCreate;
    if (!selectedTenantId || !payload.customerId) return false;
    clearMessages();
    try {
      // 1. Create basic record
      const res = await adminService.createTenantTransaction(selectedTenantId, {
        customerId: payload.customerId,
        type: payload.type,
        totalAmount: Number(payload.totalAmount || 0),
        paidAmount: Number(payload.paidAmount || 0),
        description: payload.description || undefined,
        transactionDate: payload.transactionDate || undefined,
        referenceNo: payload.referenceNo || undefined,
      });

      const transactionId = (res.data as { id: string })?.id;

      // 2. Upload attachments sequentially
      const targetFiles = files || transactionAttachments;
      if (transactionId && targetFiles.length > 0) {
        for (const file of targetFiles) {
          try {
            await ledgerService.uploadTransactionAttachment(transactionId, file);
          } catch (uploadErr) {
            console.error("Failed to upload attachment from Admin:", file.name, uploadErr);
          }
        }
      }

      setTransactionAttachments([]);
      setTransactionCreate(createEmptyTransactionCreate());
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice("Transaction created.");
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to create transaction.";
      setError(errorMsg);
      return false;
    }
  };

  const removeTransaction = async (transactionId: string): Promise<boolean> => {
    if (!selectedTenantId || !window.confirm("Delete this transaction?")) return false;
    clearMessages();
    try {
      await adminService.deleteTenantTransaction(selectedTenantId, transactionId);
      await loadTransactions(selectedTenantId);
      await loadCustomers(selectedTenantId);
      setNotice("Transaction deleted.");
      return true;
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
            err.message
          : "Unable to delete transaction.";
      setError(errorMsg);
      return false;
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
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      gstNumber: customer.gstNumber || "",
      dueDate: customer.dueDate || "",
    });
  };

  const openTransactionEdit = (txn: LedgerTransaction) => {
    setTransactionEdit({
      id: txn.id,
      customerId: txn.customerId,
      type: txn.type,
      totalAmount: String(txn.totalAmount || ""),
      paidAmount: String(txn.paidAmount || ""),
      description: txn.description || "",
      transactionDate: txn.timestamp?.slice(0, 10) || new Date().toISOString().split("T")[0],
      referenceNo: txn.referenceNo || "",
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
    transactionAttachments,
    setTransactionAttachments,
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
