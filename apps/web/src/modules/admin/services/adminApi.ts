import api from "@/shared/api/client";
import type { Customer, LedgerTransaction, Tenant } from "@/shared/types";

const tenantQuery = (tenantId: string) => `?tenantId=${encodeURIComponent(tenantId)}`;

// ────── Tenants ──────────────────────────────────────────────────────────────
export type CreateTenantPayload = {
  name: string;
  slug: string;
  businessType?: string;
  ownerName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  gstNumber?: string;
  logoUrl?: string;
  smsTemplate?: string;
  whatsappTemplate?: string;
  status?: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail?: string;
  adminMobile?: string;
};

export type UpdateTenantPayload = Omit<
  CreateTenantPayload,
  "slug" | "adminUsername" | "adminPassword" | "adminEmail" | "adminMobile"
>;

export const listTenants = () => api.get<Tenant[]>("/admin/tenants");
export const createTenant = (payload: CreateTenantPayload) =>
  api.post<Tenant>("/admin/tenants", payload);
export const updateTenant = (id: string, payload: UpdateTenantPayload) =>
  api.put<Tenant>(`/admin/tenants/${id}`, payload);
export const deleteTenant = (id: string) => api.delete(`/admin/tenants/${id}`);

// ────── Customers ─────────────────────────────────────────────────────────────
export type CustomerMutationPayload = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  dueDate?: string;
};

export const listTenantCustomers = (tenantId: string) =>
  api.get<Customer[]>(`/admin/customers${tenantQuery(tenantId)}`);
export const createTenantCustomer = (tenantId: string, payload: CustomerMutationPayload) =>
  api.post<Customer>(`/admin/customers${tenantQuery(tenantId)}`, payload);
export const updateTenantCustomer = (
  tenantId: string,
  customerId: string,
  payload: CustomerMutationPayload,
) => api.put<Customer>(`/admin/customers/${customerId}${tenantQuery(tenantId)}`, payload);
export const deleteTenantCustomer = (tenantId: string, customerId: string) =>
  api.delete(`/admin/customers/${customerId}${tenantQuery(tenantId)}`);

// ────── Transactions ──────────────────────────────────────────────────────────
export type TransactionMutationPayload = {
  customerId: string;
  type: "SALE" | "PAYMENT";
  totalAmount: number;
  paidAmount: number;
  description?: string;
  transactionDate?: string;
  referenceNo?: string;
};

export const listTenantTransactions = (tenantId: string, customerId?: string) =>
  api.get<LedgerTransaction[]>(
    `/admin/transactions${tenantQuery(tenantId)}${customerId ? `&customerId=${encodeURIComponent(customerId)}` : ""}`,
  );
export const createTenantTransaction = (tenantId: string, payload: TransactionMutationPayload) =>
  api.post(`/admin/transactions${tenantQuery(tenantId)}`, payload);
export const updateTenantTransaction = (
  tenantId: string,
  txnId: string,
  payload: TransactionMutationPayload,
) => api.put(`/admin/transactions/${txnId}${tenantQuery(tenantId)}`, payload);
export const deleteTenantTransaction = (tenantId: string, txnId: string) =>
  api.delete(`/admin/transactions/${txnId}${tenantQuery(tenantId)}`);

// ────── Audit Logs ───────────────────────────────────────────────────────────
export type AuditLog = {
  id: string;
  entityName: string;
  entityId: string;
  targetName?: string;
  action: string;
  changes: string;
  userId?: string;
  username?: string;
  tenantId?: string;
  tenantName?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
};

export type PaginatedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export const listAuditLogs = (page = 0, size = 20, search?: string) =>
  api.get<PaginatedResponse<AuditLog>>(`/admin/audit?page=${page}&size=${size}${search ? `&search=${encodeURIComponent(search)}` : ""}`);

export const listTenantAuditLogs = (tenantId: string) =>
  api.get<AuditLog[]>(`/admin/audit/tenant/${tenantId}`);
