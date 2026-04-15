import type { Tenant } from '@/shared/types';
import type { CustomerBase, LedgerTransactionBase } from '../../../shared/types/ledger';

export type TabKey = 'tenants' | 'customers' | 'transactions';

export type Customer = CustomerBase;
export type LedgerTransaction = LedgerTransactionBase;

export type TenantFormState = {
  id: string;
  name: string;
  slug: string;
  businessType: string;
  ownerName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  gstNumber: string;
  logoUrl: string;
  smsTemplate: string;
  whatsappTemplate: string;
  status: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  adminMobile: string;
  attachmentQuotaMb: number;
  maxAttachmentFileSizeMb: number;
  attachmentRetentionDays: number;
};

export type CustomerFormState = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  dueDate?: string;
};

export type CustomerCreateState = Omit<CustomerFormState, 'id'>;

export type TransactionFormState = {
  id: string;
  customerId: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: string;
  paidAmount: string;
  description: string;
  transactionDate: string;
  referenceNo: string;
};

export type TransactionCreateState = Omit<TransactionFormState, 'id'>;

export const createEmptyTenantForm = (): TenantFormState => ({
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
  attachmentQuotaMb: 100,
  maxAttachmentFileSizeMb: 10,
  attachmentRetentionDays: 365,
});

export const mapTenantToForm = (tenant: Tenant): TenantFormState => ({
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
  attachmentQuotaMb: (tenant as any).attachmentQuotaMb || 100,
  maxAttachmentFileSizeMb: (tenant as any).maxAttachmentFileSizeMb || 10,
  attachmentRetentionDays: (tenant as any).attachmentRetentionDays || 365,
});

export const createEmptyCustomerEdit = (): CustomerFormState => ({
  id: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
});

export const createEmptyCustomerCreate = (): CustomerCreateState => ({
  name: '',
  phone: '',
  email: '',
  address: '',
  gstNumber: '',
});

export const createEmptyTransactionEdit = (): TransactionFormState => ({
  id: '',
  customerId: '',
  type: 'SALE',
  totalAmount: '',
  paidAmount: '',
  description: '',
  transactionDate: '',
  referenceNo: '',
});

export const createEmptyTransactionCreate = (): TransactionCreateState => ({
  customerId: '',
  type: 'SALE',
  totalAmount: '',
  paidAmount: '',
  description: '',
  transactionDate: '',
  referenceNo: '',
});
