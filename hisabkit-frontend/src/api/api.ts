import axios from 'axios';
import { env } from '../config/env';
import {
  AuthSession,
  Tenant,
  Customer,
  LedgerTransaction,
  Attachment,
  ModuleCatalogItem,
  UserProfile,
} from '../shared/types/domain';

const api = axios.create({
  baseURL: env.apiUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hisabkit_token');
    const tenantId = localStorage.getItem('hisabkit_tenant_id');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers['X-TenantID'] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeAvatarUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return undefined;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice('http://'.length)}`;
  return trimmed;
};

export const normalizeAuthSession = (value: unknown): AuthSession => {
  if (!isRecord(value)) {
    throw new Error('Invalid auth response');
  }

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

  return {
    token,
    tenantId,
    tenantSlug,
    user,
  };
};

export const loginWithUsernamePassword = (payload: { username: string; password: string }) =>
  api.post<AuthSession>('/auth/login', payload);

export const loginWithGoogleCredential = (credential: string) =>
  api.post<AuthSession>('/auth/social/google', {
    idToken: credential,
    credential,
  });

export const listTenants = () => api.get<Tenant[]>('/admin/tenants');

export const createTenant = (payload: {
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
}) => api.post('/admin/tenants', payload);

export const updateTenant = (
  tenantId: string,
  payload: {
    name: string;
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
  }
) => api.put<Tenant>(`/admin/tenants/${tenantId}`, payload);

export const deleteTenant = (tenantId: string) => api.delete(`/admin/tenants/${tenantId}`);

export const listTenantCustomers = (tenantId: string) =>
  api.get<Customer[]>(`/admin/customers?tenantId=${encodeURIComponent(tenantId)}`);

export const createTenantCustomer = (
  tenantId: string,
  payload: { name: string; phone?: string; email?: string; address?: string; gstNumber?: string }
) => api.post<Customer>(`/admin/customers?tenantId=${encodeURIComponent(tenantId)}`, payload);

export const updateTenantCustomer = (
  tenantId: string,
  customerId: string,
  payload: { name: string; phone?: string; email?: string; address?: string; gstNumber?: string }
) => api.put<Customer>(`/admin/customers/${customerId}?tenantId=${encodeURIComponent(tenantId)}`, payload);

export const deleteTenantCustomer = (tenantId: string, customerId: string) =>
  api.delete(`/admin/customers/${customerId}?tenantId=${encodeURIComponent(tenantId)}`);

export const listTenantTransactions = (tenantId: string, customerId?: string) =>
  api.get<LedgerTransaction[]>(
    `/admin/transactions?tenantId=${encodeURIComponent(tenantId)}${
      customerId ? `&customerId=${encodeURIComponent(customerId)}` : ''
    }`
  );

export const createTenantTransaction = (
  tenantId: string,
  payload: {
    customerId: string;
    type: 'SALE' | 'PAYMENT';
    totalAmount: number;
    paidAmount: number;
    description?: string;
    transactionDate?: string;
  }
) => api.post(`/admin/transactions?tenantId=${encodeURIComponent(tenantId)}`, payload);

export const updateTenantTransaction = (
  tenantId: string,
  transactionId: string,
  payload: {
    customerId: string;
    type: 'SALE' | 'PAYMENT';
    totalAmount: number;
    paidAmount: number;
    description?: string;
    transactionDate?: string;
  }
) => api.put(`/admin/transactions/${transactionId}?tenantId=${encodeURIComponent(tenantId)}`, payload);

export const deleteTenantTransaction = (tenantId: string, transactionId: string) =>
  api.delete(`/admin/transactions/${transactionId}?tenantId=${encodeURIComponent(tenantId)}`);

export const uploadTransactionAttachment = (transactionId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/ledger/transactions/${transactionId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const listTransactionAttachments = (transactionId: string) =>
  api.get<Attachment[]>(`/ledger/transactions/${transactionId}/attachments`);

export const fetchAttachmentContent = (attachmentId: string) =>
  api.get(`/ledger/attachments/${attachmentId}/content`, { responseType: 'blob' });

export const deleteAttachment = (attachmentId: string) => api.delete(`/ledger/attachments/${attachmentId}`);

export const getMyProfile = () => api.get<UserProfile>('/profile');

export const updateMyProfile = (payload: { fullName?: string; email?: string; mobile?: string; avatarUrl?: string }) =>
  api.put<UserProfile>('/profile', payload);

export const changeMyPassword = (payload: { currentPassword: string; newPassword: string }) =>
  api.put('/profile/password', payload);

export const uploadMyAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getTenantProfile = () => api.get<Tenant>('/profile/tenant');

export const updateTenantProfile = (payload: {
  name: string;
  businessType?: string;
  ownerName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  gstNumber?: string;
  logoUrl?: string;
  smsTemplate?: string;
  whatsappTemplate?: string;
}) => api.put<Tenant>('/profile/tenant', payload);

export const listModuleCatalog = () => api.get<ModuleCatalogItem[]>('/modules');

export default api;
