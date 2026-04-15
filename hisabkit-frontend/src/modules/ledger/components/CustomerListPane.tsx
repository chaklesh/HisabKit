import { Search, Filter, SortAsc, Phone, CalendarClock, User, ChevronRight } from 'lucide-react';
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

const selectCls = "w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer";

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
  return (
    <section className="flex flex-col gap-6 reveal">
      <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          {/* Header & Stats */}
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Customer Directory</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Quick Search</p>
             </div>
             <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider">
               {customers.length} Customers
             </div>
          </div>

          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-medium outline-none transition-all focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={customerFilter}
                onChange={(e) => onFilterChange(e.target.value as CustomerFilter)}
                className={selectCls}
              >
                <option value="ALL">All Status</option>
                <option value="TO_COLLECT">To Collect</option>
                <option value="TO_PAY">To Pay</option>
                <option value="ZERO_BALANCE">Settled</option>
              </select>
            </div>

            <div className="relative">
              <SortAsc className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={customerSort}
                onChange={(e) => onSortChange(e.target.value as CustomerSort)}
                className={selectCls}
              >
                <option value="MOST_RECENT">Most Recent</option>
                <option value="HIGHEST_AMOUNT">Highest Balance</option>
                <option value="BY_NAME">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* List Area */}
          <div className="space-y-3 overflow-y-auto max-h-[55vh] pr-2 -mr-2">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
                 <div className="w-10 h-10 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em]">Refreshing List</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
                    <User className="w-6 h-6 text-slate-300" />
                 </div>
                 <p className="text-sm font-bold text-slate-400">No matching accounts</p>
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
                      'w-full group rounded-3xl border p-5 text-left transition-all duration-500 relative overflow-hidden',
                      selected 
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-[0_10px_30px_rgba(99,102,241,0.1)]' 
                        : 'border-slate-50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                         <div className={cn(
                           "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-300",
                           selected 
                             ? "bg-indigo-600 text-white scale-105" 
                             : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                         )}>
                            {customer.name?.charAt(0).toUpperCase()}
                         </div>
                         <div className="space-y-1">
                            <p className={cn(
                              "text-base font-black tracking-tight transition-colors",
                              selected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-slate-200"
                            )}>
                              {customer.name}
                            </p>
                            <div className="flex items-center gap-2">
                               <Phone className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                               <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                 {customer.phone || 'Contact Missing'}
                               </span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="text-right flex items-center gap-4">
                        <div className="space-y-1">
                          <p className={cn(
                            "text-sm font-black tracking-tight",
                            isToCollect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          )}>
                            {formatCurrency(Math.abs(balance))}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                            {isToCollect ? 'To Collect' : 'To Pay'}
                          </p>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-all",
                          selected ? "text-indigo-500 translate-x-1" : "text-slate-200 dark:text-slate-700"
                        )} />
                      </div>
                    </div>
                    
                    {customer.dueDate && (
                      <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider w-fit">
                         <CalendarClock className="w-3.5 h-3.5" />
                         Next Due: {formatDate(customer.dueDate)}
                      </div>
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
