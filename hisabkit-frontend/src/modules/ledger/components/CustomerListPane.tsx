/**
 * CustomerListPane component
 * Left sidebar with search, filter, sort, and customer list
 * ~220 lines
 */

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '../../../shared/utils/ledgerUtils';
import type { Customer, CustomerFilter, CustomerSort } from '../types/ledgerTypes';

interface CustomerListPaneProps {
  customers: Customer[];
  selectedCustomerId: string;
  searchTerm: string;
  customerFilter: CustomerFilter;
  customerSort: CustomerSort;
  isLoading: boolean;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: CustomerFilter) => void;
  onSortChange: (sort: CustomerSort) => void;
  onSelectCustomer: (customer: Customer) => void;
  onAddCustomer: () => void;
}

export function CustomerListPane({
  customers,
  selectedCustomerId,
  searchTerm,
  customerFilter,
  customerSort,
  isLoading,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onSelectCustomer,
  onAddCustomer,
}: CustomerListPaneProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-200/60">
        {/* Search and Filters */}
        <div className="grid gap-3 md:grid-cols-3">
          {/* Search */}
          <div className="space-y-1 md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Search for customers</p>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Name, phone or address"
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>
          </div>

          {/* Filter dropdown */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Filter by</p>
            <select
              value={customerFilter}
              onChange={(e) => onFilterChange(e.target.value as CustomerFilter)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All customers</option>
              <option value="TO_COLLECT">To collect</option>
              <option value="TO_PAY">To pay</option>
              <option value="ZERO_BALANCE">Zero balance</option>
              <option value="WITH_CONTACT">With contact</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Sort by</p>
            <select
              value={customerSort}
              onChange={(e) => onSortChange(e.target.value as CustomerSort)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="MOST_RECENT">Most Recent</option>
              <option value="HIGHEST_AMOUNT">Highest Amount</option>
              <option value="LEAST_AMOUNT">Least Amount</option>
              <option value="BY_NAME">By Name</option>
              <option value="OLDEST">Oldest</option>
            </select>
          </div>

          {/* Add button */}
          <div className="flex items-end">
            <Button type="button" variant="outline" className="w-full" onClick={onAddCustomer}>
              + Add Customer
            </Button>
          </div>
        </div>

        {/* Customer list */}
        <div className="mt-2 max-h-[62vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[68vh]">
          {isLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading customers...</p>
          ) : customers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No customers found.</p>
          ) : (
            customers.map((customer) => {
              const balance = Number(customer.totalBalance || 0);
              const selected = customer.id === selectedCustomerId;
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelectCustomer(customer)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selected ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-900">{customer.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{customer.phone || customer.email || 'No contact added'}</p>
                      <p className="mt-1 text-xs text-slate-500">{customer.address || 'No address added'}</p>
                      {customer.dueDate && <p className="mt-1 text-[11px] font-semibold text-amber-700">Due: {formatDate(customer.dueDate)}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-extrabold ${balance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(Math.abs(balance))}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                        {balance >= 0 ? 'To collect' : 'To pay'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
