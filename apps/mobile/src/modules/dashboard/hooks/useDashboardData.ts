import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchCustomers, fetchSummary } from "../../ledger/services/ledgerService"; // Need to migrate ledger service too

export function useDashboardData() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const customersQuery = useQuery({
    queryKey: ["dashboard", "customers"],
    queryFn: fetchCustomers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const businessStats = useMemo(() => {
    const customers = customersQuery.data ?? [];
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (balance > 0) {
          acc.toCollect += balance;
          acc.collectCount += 1;
        } else if (balance < 0) {
          acc.toPay += Math.abs(balance);
          acc.payCount += 1;
        }
        return acc;
      },
      { toCollect: 0, toPay: 0, collectCount: 0, payCount: 0 },
    );
  }, [customersQuery.data]);

  const isLoading = summaryQuery.isLoading || customersQuery.isLoading;
  const isError = summaryQuery.isError || customersQuery.isError;

  return {
    user,
    summary: summaryQuery.data,
    customers: customersQuery.data ?? [],
    businessStats,
    isLoading,
    isError,
    refetch: () => {
      summaryQuery.refetch();
      customersQuery.refetch();
    },
    isRefreshing: summaryQuery.isRefetching || customersQuery.isRefetching,
  };
}
