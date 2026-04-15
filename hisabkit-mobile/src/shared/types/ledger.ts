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

export type TransactionAttachment = {
  id: string;
  fileName: string;
  fileType?: string;
  fileUrl?: string;
  fileSizeBytes?: number;
  uploadedAt?: string;
  transactionId: string;
};

export type LedgerSummary = {
  from: string;
  to: string;
  transactionCount: number;
  totalSales: number;
  totalPayments: number;
  outstandingDue: number;
};

export type SummaryCard = {
  label: string;
  value: string;
  tone: 'brand' | 'success' | 'danger' | 'neutral';
};
