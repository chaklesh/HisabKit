import { useEffect, useMemo, useState } from 'react';
import * as dashboardService from '@/shared/api/client';
import type { DashboardCustomer, DashboardSummary } from '../types/dashboardTypes';

export function useDashboardHomeState() {
  const [customers, setCustomers] = useState<DashboardCustomer[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.listCustomers();
        setCustomers(res.data as unknown as DashboardCustomer[]);
      } catch {
        setCustomers([]);
      }
    };
    void load();
  }, []);

  const summary = useMemo<DashboardSummary>(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance || 0);
        if (balance >= 0) {
          acc.toCollect += balance;
        } else {
          acc.toPay += Math.abs(balance);
        }
        return acc;
      },
      { toCollect: 0, toPay: 0 }
    );
  }, [customers]);

  return {
    customers,
    summary,
  };
}
