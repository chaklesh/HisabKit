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
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalBalance?: number;
  tenantId?: string;
}

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
  tenantId: string;
}

export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileType?: string;
  fileUrl: string;
  uploadedAt: string;
  tenantId: string;
}

export interface ModuleCatalogItem {
  key: 'DASHBOARD' | 'LEDGER' | 'INVENTORY' | 'SUPPLIERS' | 'LENDING';
  label: string;
  route: string;
  status: 'LIVE' | 'PLANNED';
  enabled: boolean;
  description?: string;
}

export type UserProfile = {
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
};
