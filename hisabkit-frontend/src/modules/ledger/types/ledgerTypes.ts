/**
 * modules/ledger/types/ledgerTypes.ts
 * Module-local types for the Ledger feature.
 * Core domain types extended with ledger-specific fields.
 */
import type { Customer as SharedCustomer, LedgerTransaction as SharedLedgerTransaction } from '@/shared/types';

// Full Customer type for ledger module (extends shared with ledger-specific fields)
export type Customer = SharedCustomer;

// Re-export for convenience
export type LedgerTransaction = SharedLedgerTransaction;

// ────── Filter / Sort enums ───────────────────────────────────────────────────
export type CustomerFilter = 'ALL' | 'TO_COLLECT' | 'TO_PAY' | 'ZERO_BALANCE' | 'WITH_CONTACT';
export type CustomerSort = 'MOST_RECENT' | 'HIGHEST_AMOUNT' | 'LEAST_AMOUNT' | 'BY_NAME' | 'OLDEST';
export type DrawerMode = 'CUSTOMER' | 'TRANSACTION' | null;
export type LedgerRightTab = 'LEDGER' | 'REPORTS';

// ────── Form shapes ───────────────────────────────────────────────────────────
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
