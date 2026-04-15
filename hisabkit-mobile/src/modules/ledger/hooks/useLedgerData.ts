import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCustomers } from '../services/ledgerService';
import { useMemo, useState } from 'react';
import type { Customer } from '../../../shared/types/ledger';

export type FilterMode = 'ALL' | 'COLLECT' | 'PAY' | 'SETTLED';

export function useLedgerData() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');

  const { data: customers = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['ledger', 'customers'],
    queryFn: fetchCustomers,
    staleTime: 1000 * 60 * 5,
  });

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return customers
      .filter((customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (filterMode === 'COLLECT') return balance > 0;
        if (filterMode === 'PAY') return balance < 0;
        if (filterMode === 'SETTLED') return balance === 0;
        return true;
      })
      .filter((customer) => {
        if (!term) return true;
        return [customer.name, customer.phone, customer.email, customer.address]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(term));
      })
      .sort((left, right) => Math.abs(Number(right.totalBalance ?? 0)) - Math.abs(Number(left.totalBalance ?? 0)));
  }, [customers, filterMode, search]);

  const totals = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance ?? 0);
        if (balance > 0) acc.collect += balance;
        if (balance < 0) acc.pay += Math.abs(balance);
        return acc;
      },
      { collect: 0, pay: 0 }
    );
  }, [customers]);

  return {
    customers,
    filteredCustomers,
    totals,
    search,
    setSearch,
    filterMode,
    setFilterMode,
    isLoading,
    isError,
    refetch,
    isRefreshing: isRefetching,
  };
}
