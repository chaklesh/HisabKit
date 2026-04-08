export type Customer = {
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
};

export type CustomerFilter = 'ALL' | 'TO_COLLECT' | 'TO_PAY' | 'ZERO_BALANCE' | 'WITH_CONTACT';
export type CustomerSort = 'MOST_RECENT' | 'HIGHEST_AMOUNT' | 'LEAST_AMOUNT' | 'BY_NAME' | 'OLDEST';

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

export type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  dueDate: string;
};

export type TransactionForm = {
  customerId: string;
  type: 'SALE' | 'PAYMENT';
  totalAmount: string;
  paidAmount: string;
  description: string;
  transactionDate: string;
};

export type DrawerMode = 'CUSTOMER' | 'TRANSACTION' | null;

export type LedgerRightTab = 'LEDGER' | 'REPORTS';
