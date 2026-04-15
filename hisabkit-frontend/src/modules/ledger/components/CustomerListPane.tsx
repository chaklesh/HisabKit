import { useTranslation } from 'react-i18next';
import { Search, Filter, SortAsc, Phone, CalendarClock } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
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
}

const selectCls = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 appearance-none cursor-pointer";

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
}: CustomerListPaneProps) {
  const { } = useTranslation();

  return (
    <section className="flex flex-col gap-5 animate-in fade-in slide-in-from-left-4 duration-500">
      <Card className="glass-card border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
        <CardContent className="p-6 space-y-5">
          {/* Search Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Customer Index</label>
               <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{customers.length} Accounts</span>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search name, phone..."
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Controls Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <select
                value={customerFilter}
                onChange={(e) => onFilterChange(e.target.value as CustomerFilter)}
                className={selectCls}
              >
                <option value="ALL">All Accounts</option>
                <option value="TO_COLLECT">Receivables</option>
                <option value="TO_PAY">Payables</option>
                <option value="ZERO_BALANCE">Settled</option>
              </select>
            </div>

            <div className="relative">
              <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <select
                value={customerSort}
                onChange={(e) => onSortChange(e.target.value as CustomerSort)}
                className={selectCls}
              >
                <option value="MOST_RECENT">Recent</option>
                <option value="HIGHEST_AMOUNT">Highest</option>
                <option value="BY_NAME">A-Z Name</option>
              </select>
            </div>
          </div>

          {/* Customer list scroll area */}
          <div className="space-y-2.5 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar -mr-2">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                 <div className="w-8 h-8 rounded-full border-2 border-slate-100 border-t-indigo-500 animate-spin" />
                 <p className="text-xs font-bold uppercase tracking-widest">Syncing...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center">
                 <p className="text-sm font-bold text-slate-400">No results found</p>
              </div>
            ) : (
              customers.map((customer) => {
                const balance = Number(customer.totalBalance || 0);
                const selected = customer.id === selectedCustomerId;
                const isToCollect = balance >= 0;
                
                return (
                  <button
                    key={customer.id}
                    onClick={() => onSelectCustomer(customer)}
                    className={cn(
                      'w-full group rounded-2xl border p-4 text-left transition-all duration-300 relative overflow-hidden',
                      selected 
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-50' 
                        : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                           "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors",
                           selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                         )}>
                            {customer.name?.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[120px]">
                              {customer.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <Phone className="w-3 h-3 text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-500">{customer.phone || 'No Contact'}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-xs font-black",
                          isToCollect ? 'text-emerald-600' : 'text-rose-600'
                        )}>
                          {formatCurrency(Math.abs(balance))}
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-0.5">
                          {isToCollect ? 'To collect' : 'To pay'}
                        </p>
                      </div>
                    </div>
                    
                    {customer.dueDate && (
                      <div className="mt-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-wider w-fit">
                         <CalendarClock className="w-3 h-3" />
                         Due {formatDate(customer.dueDate)}
                      </div>
                    )}

                    {selected && (
                       <div className="absolute right-0 top-0 h-full w-1 bg-indigo-600" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
