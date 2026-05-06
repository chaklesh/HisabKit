import * as ledgerApi from "@/modules/ledger/services/ledgerApi";
import { useEffect, useMemo, useState } from "react";
import type { DashboardCustomer, DashboardSummary } from "../types/dashboardTypes";

export function useDashboardHomeState() {
  const [customers, setCustomers] = useState<DashboardCustomer[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ledgerApi.listCustomers();
        setCustomers(res.data as unknown as DashboardCustomer[]);
      } catch {
        setCustomers([]);
      }
    };
    void load();
  }, []);

  const summary = useMemo<DashboardSummary>(() => {
    const now = new Date();
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance || 0);
        if (balance >= 0) {
          acc.toCollect += balance;
        } else {
          acc.toPay += Math.abs(balance);
        }

        if (customer.dueDate && new Date(customer.dueDate) < now) {
          acc.overdueCount++;
        }
        return acc;
      },
      { toCollect: 0, toPay: 0, overdueCount: 0 },
    );
  }, [customers]);

  const topDebtors = useMemo(() => {
    return [...customers]
      .filter((c) => Number(c.totalBalance || 0) > 0)
      .sort((a, b) => Number(b.totalBalance || 0) - Number(a.totalBalance || 0))
      .slice(0, 5);
  }, [customers]);

  const topCreditors = useMemo(() => {
    return [...customers]
      .filter((c) => Number(c.totalBalance || 0) < 0)
      .sort((a, b) => Number(a.totalBalance || 0) - Number(b.totalBalance || 0))
      .slice(0, 5);
  }, [customers]);

  return {
    customers,
    summary,
    topDebtors,
    topCreditors,
  };
}
