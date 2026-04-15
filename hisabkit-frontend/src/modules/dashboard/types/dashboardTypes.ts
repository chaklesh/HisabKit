import type { CustomerBase } from '../../../shared/types/ledger';

export type DashboardCustomer = Pick<CustomerBase, 'id' | 'totalBalance'>;

export type DashboardSummary = {
  toCollect: number;
  toPay: number;
};
