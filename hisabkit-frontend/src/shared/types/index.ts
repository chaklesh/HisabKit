/**
 * shared/types/index.ts  –  Canonical domain types barrel
 * All types are pure data contracts matching the API spec v1.2.0.
 * No business logic, no component concerns.
 */

// ────── Identity ──────────────────────────────────────────────────────────────
export interface AuthUserSummary {
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}

export interface AuthSession {
  token: string;
  tenantId: string;
  tenantSlug?: string;
  user: AuthUserSummary;
}

// ────── Tenant ────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string;
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
  // Storage settings
  attachmentQuotaMb?: number;
  maxAttachmentFileSizeMb?: number;
  attachmentRetentionDays?: number;
}

// ────── Customer ──────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  dueDate?: string;
  totalBalance?: number;
  createdAt?: string;
  updatedAt?: string;
  lastTransactionAt?: string;
  tenantId?: string;
}

// ────── Ledger Transaction ────────────────────────────────────────────────────
export interface LedgerTransaction {
  id: string;
  referenceNo: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  description?: string;
  timestamp: string;
  customerId: string;
  tenantId?: string;
}

// ────── Attachment (Storage) ──────────────────────────────────────────────────
export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileType?: string;
  fileUrl: string;
  uploadedAt: string;
  tenantId?: string;
}

// ────── Module catalog ────────────────────────────────────────────────────────
export type ModuleKey = 'DASHBOARD' | 'LEDGER' | 'INVENTORY' | 'SUPPLIERS' | 'LENDING';
export type ModuleStatus = 'LIVE' | 'PLANNED';

export interface ModuleCatalogItem {
  key: ModuleKey;
  label: string;
  route: string;
  status: ModuleStatus;
  enabled: boolean;
  description?: string;
}

// ────── User profile ──────────────────────────────────────────────────────────
export interface UserProfile {
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}
