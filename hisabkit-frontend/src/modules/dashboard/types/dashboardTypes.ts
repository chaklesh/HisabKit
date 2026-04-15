import type { CustomerBase } from '../../../shared/types/ledger';

export type DashboardCustomer = Pick<CustomerBase, 'id' | 'totalBalance' | 'dueDate'>;

export type DashboardSummary = {
  toCollect: number;
  toPay: number;
  overdueCount: number;
};
