export type CustomerBase = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  totalBalance?: number;
};

export type LedgerTransactionBase = {
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
