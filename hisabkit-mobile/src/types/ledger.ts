export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  dueDate?: string;
  totalBalance?: number;
  lastTransactionAt?: string;
};

export type LedgerTransaction = {
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

export type SummaryCard = {
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'danger' | 'neutral';
};
