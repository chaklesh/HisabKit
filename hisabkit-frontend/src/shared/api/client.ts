/**
 * shared/api/client.ts
 * Single Axios instance used across the entire app.
 * - Attaches JWT + X-TenantID on every request.
 * - Handles 401 by clearing auth and redirecting to login.
 * - All types come from the canonical shared/types barrel.
 */
import axios from 'axios';
import { env } from '@/shared/config/env';
import type {
  AuthSession,
  Tenant,
  Customer,
  LedgerTransaction,
  Attachment,
  ModuleCatalogItem,
  UserProfile,
} from '@/shared/types';

// ────── Axios instance ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
});

// ────── Request interceptor ──────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hisabkit_token');
  const tenantId = localStorage.getItem('hisabkit_tenant_id');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) config.headers['X-TenantID'] = tenantId;
  return config;
});

// ────── Response interceptor ─────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – wipe session and hard-redirect
      localStorage.removeItem('hisabkit_token');
      localStorage.removeItem('hisabkit_tenant_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ────── Auth normalization helpers ───────────────────────────────────────────
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const normalizeAvatarUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const s = value.trim();
  if (!s || s.toLowerCase() === 'null' || s.toLowerCase() === 'undefined') return undefined;
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('http://')) return `https://${s.slice(7)}`;
  return s;
};

export const normalizeAuthSession = (value: unknown): AuthSession => {
  if (!isRecord(value)) throw new Error('Invalid auth response');

  const token = typeof value.token === 'string' ? value.token : '';
  const tenantId = typeof value.tenantId === 'string' ? value.tenantId : '';
  const tenantSlug = typeof value.tenantSlug === 'string' ? value.tenantSlug : undefined;
  const user = isRecord(value.user)
    ? {
        username: typeof value.user.username === 'string' ? value.user.username : '',
        role: typeof value.user.role === 'string' ? value.user.role : '',
        fullName: typeof value.user.fullName === 'string' ? value.user.fullName : undefined,
        email: typeof value.user.email === 'string' ? value.user.email : undefined,
        mobile: typeof value.user.mobile === 'string' ? value.user.mobile : undefined,
        avatarUrl: normalizeAvatarUrl(value.user.avatarUrl),
      }
    : { username: '', role: '' };

  if (!token || !tenantId || !user.username || !user.role) {
    throw new Error('Invalid auth response');
  }
  return { token, tenantId, tenantSlug, user };
};

// ────── Auth ─────────────────────────────────────────────────────────────────
export const loginWithUsernamePassword = (payload: { username: string; password: string }) =>
  api.post<AuthSession>('/auth/login', payload);

export const loginWithGoogleCredential = (credential: string) =>
  api.post<AuthSession>('/auth/social/google', { idToken: credential, credential });

// ────── Admin – Tenant CRUD ──────────────────────────────────────────────────
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
  'slug' | 'adminUsername' | 'adminPassword' | 'adminEmail' | 'adminMobile'
>;

export const listTenants = () => api.get<Tenant[]>('/admin/tenants');
export const createTenant = (payload: CreateTenantPayload) => api.post<Tenant>('/admin/tenants', payload);
export const updateTenant = (id: string, payload: UpdateTenantPayload) =>
  api.put<Tenant>(`/admin/tenants/${id}`, payload);
export const deleteTenant = (id: string) => api.delete(`/admin/tenants/${id}`);

// ────── Admin – Customer CRUD ─────────────────────────────────────────────────
type CustomerMutationPayload = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  dueDate?: string;
};
const tenantQuery = (tenantId: string) => `?tenantId=${encodeURIComponent(tenantId)}`;
export const listTenantCustomers = (tenantId: string) =>
  api.get<Customer[]>(`/admin/customers${tenantQuery(tenantId)}`);
export const createTenantCustomer = (tenantId: string, payload: CustomerMutationPayload) =>
  api.post<Customer>(`/admin/customers${tenantQuery(tenantId)}`, payload);
export const updateTenantCustomer = (tenantId: string, customerId: string, payload: CustomerMutationPayload) =>
  api.put<Customer>(`/admin/customers/${customerId}${tenantQuery(tenantId)}`, payload);
export const deleteTenantCustomer = (tenantId: string, customerId: string) =>
  api.delete(`/admin/customers/${customerId}${tenantQuery(tenantId)}`);

// ────── Admin – Transaction CRUD ──────────────────────────────────────────────
type TransactionMutationPayload = {
  customerId: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: number;
  paidAmount: number;
  description?: string;
  transactionDate?: string;
  referenceNo?: string;
};
export const listTenantTransactions = (tenantId: string, customerId?: string) =>
  api.get<LedgerTransaction[]>(
    `/admin/transactions${tenantQuery(tenantId)}${customerId ? `&customerId=${encodeURIComponent(customerId)}` : ''}`
  );
export const createTenantTransaction = (tenantId: string, payload: TransactionMutationPayload) =>
  api.post(`/admin/transactions${tenantQuery(tenantId)}`, payload);
export const updateTenantTransaction = (tenantId: string, txnId: string, payload: TransactionMutationPayload) =>
  api.put(`/admin/transactions/${txnId}${tenantQuery(tenantId)}`, payload);
export const deleteTenantTransaction = (tenantId: string, txnId: string) =>
  api.delete(`/admin/transactions/${txnId}${tenantQuery(tenantId)}`);

// ────── Storage / Attachments ─────────────────────────────────────────────────
export const uploadTransactionAttachment = (transactionId: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(`/ledger/transactions/${transactionId}/attachments`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const listTransactionAttachments = (transactionId: string) =>
  api.get<Attachment[]>(`/ledger/transactions/${transactionId}/attachments`);
export const fetchAttachmentContent = (attachmentId: string) =>
  api.get(`/ledger/attachments/${attachmentId}/content`, { responseType: 'blob' });
export const deleteAttachment = (id: string) =>
  api.delete(`/ledger/attachments/${id}`);

// ────── Ledger (tenant-scoped, uses X-TenantID header) ───────────────────────
export const listCustomers = () => api.get<Customer[]>('/ledger/customers');
export const createCustomer = (payload: CustomerMutationPayload) =>
  api.post<Customer>('/ledger/customers', payload);
export const updateCustomer = (id: string, payload: CustomerMutationPayload) =>
  api.put<Customer>(`/ledger/customers/${id}`, payload);
export const deleteCustomer = (id: string) => api.delete(`/ledger/customers/${id}`);

export const listTransactions = (customerId: string) =>
  api.get<LedgerTransaction[]>(`/ledger/customers/${customerId}/transactions`);
export const createTransaction = (payload: TransactionMutationPayload) =>
  api.post<LedgerTransaction>('/ledger/transactions', payload);

// ────── Profile ───────────────────────────────────────────────────────────────
export const getMyProfile = () => api.get<UserProfile>('/profile');
export const updateMyProfile = (payload: {
  fullName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}) => api.put<UserProfile>('/profile', payload);

export const changeMyPassword = (payload: {
  currentPassword: string;
  newPassword: string;
}) => api.put('/profile/password', payload);
export const uploadMyAvatar = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<UserProfile>('/profile/avatar', form);
};
export const getTenantProfile = () => api.get<Tenant>('/profile/tenant');
export const updateTenantProfile = (payload: Partial<Tenant>) =>
  api.put<Tenant>('/profile/tenant', payload);

// ────── Module catalog ────────────────────────────────────────────────────────
export const listModuleCatalog = () => api.get<ModuleCatalogItem[]>('/modules');

export default api;
