import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ledgerService from '@/modules/ledger/services/ledgerService';
import type { Customer } from '@/modules/ledger/types/ledgerTypes';

export type DueFilter = 'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE';
export type SortField = 'NAME' | 'BALANCE' | 'DUE_DATE';

export function useReportsState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFilter, setDueFilter] = useState<DueFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('BALANCE');

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ['reports', 'customers'],
    queryFn: ledgerService.fetchCustomers,
  });

  const processedData = useMemo(() => {
    let filtered = [...customers];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((c: Customer) => 
        c.name.toLowerCase().includes(lower) || 
        c.phone?.includes(lower)
      );
    }

    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(now.getDate() + 7);

    if (dueFilter === 'OVERDUE') {
      filtered = filtered.filter(c => c.dueDate && new Date(c.dueDate) < now);
    } else if (dueFilter === 'UPCOMING_7_DAYS') {
      filtered = filtered.filter(c => {
        if (!c.dueDate) return false;
        const d = new Date(c.dueDate);
        return d >= now && d <= weekLater;
      });
    } else if (dueFilter === 'NO_DUE_DATE') {
      filtered = filtered.filter(c => !c.dueDate);
    }

    filtered.sort((a, b) => {
      if (sortField === 'NAME') return a.name.localeCompare(b.name);
      if (sortField === 'BALANCE') return (b.totalBalance || 0) - (a.totalBalance || 0);
      if (sortField === 'DUE_DATE') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return filtered;
  }, [customers, searchTerm, dueFilter, sortField]);

  const summary = useMemo(() => {
    return customers.reduce((acc, c: Customer) => {
      const bal = c.totalBalance || 0;
      if (bal > 0) acc.receivables += bal;
      else if (bal < 0) acc.payables += Math.abs(bal);
      
      if (c.dueDate && new Date(c.dueDate) < new Date()) {
        acc.overdueCount++;
      }
      return acc;
    }, { receivables: 0, payables: 0, overdueCount: 0 });
  }, [customers]);

  const chartData = useMemo(() => {
    const topReceivables = [...customers]
      .filter(c => (c.totalBalance || 0) > 0)
      .sort((a, b) => (b.totalBalance || 0) - (a.totalBalance || 0))
      .slice(0, 8) // Show more for "data heavy"
      .map(c => ({
        name: c.name.length > 10 ? c.name.slice(0, 10) + '...' : c.name,
        balance: c.totalBalance,
        fullName: c.name
      }));

    const pieData = [
      { name: 'Receivables', value: summary.receivables, color: '#10b981' },
      { name: 'Payables', value: summary.payables, color: '#f43f5e' },
    ].filter(d => d.value > 0);

    return { topReceivables, pieData };
  }, [customers, summary]);

  return {
    state: {
      searchTerm,
      setSearchTerm,
      dueFilter,
      setDueFilter,
      sortField,
      setSortField,
    },
    data: {
      customers,
      processedData,
      summary,
      chartData,
      isLoading,
    }
  };
}
