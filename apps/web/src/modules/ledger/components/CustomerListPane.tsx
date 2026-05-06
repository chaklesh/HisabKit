import { cn } from "@hisabkit/lib/utils";
import { Card, CardContent } from "@hisabkit/ui/components/Card";
import { CalendarClock, ChevronRight, Filter, Search, SortAsc, User } from "lucide-react";
import { formatCurrency, formatDate } from "../../../shared/utils/ledgerUtils";
import type { Customer, CustomerFilter, CustomerSort } from "../types/ledgerTypes";

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
    <section className="flex flex-col gap-4 reveal h-full">
      <Card className="glass-card border-none rounded-[1.5rem] overflow-hidden flex flex-col h-full">
        <CardContent className="p-4 sm:p-5 flex flex-col gap-4 h-full">
          {/* Compact Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Customers
              <span className="ml-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {customers.length}
              </span>
            </h3>
          </div>

          {/* Search bar - More Compact */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[12px] font-medium outline-none transition-all focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {/* Filters - Tighter */}
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <select
                value={customerFilter}
                onChange={(e) => onFilterChange(e.target.value as CustomerFilter)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none transition-all focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="TO_COLLECT">To Collect</option>
                <option value="TO_PAY">To Pay</option>
                <option value="OVERDUE">Overdue</option>
                <option value="ZERO_BALANCE">Settled</option>
              </select>
            </div>

            <div className="relative">
              <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <select
                value={customerSort}
                onChange={(e) => onSortChange(e.target.value as CustomerSort)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none transition-all focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="MOST_RECENT">Recent</option>
                <option value="HIGHEST_AMOUNT">Highest Balance</option>
                <option value="BY_DUE_DATE">Due Date</option>
                <option value="BY_NAME">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* List Area - Maximized Height */}
          <div className="space-y-1.5 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 -mr-1 custom-scrollbar">
            {isLoading ? (
              <div className="py-10 flex flex-col items-center gap-3 text-slate-400">
                <div className="w-8 h-8 rounded-full border-3 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
                <p className="text-[9px] font-black uppercase tracking-widest">Loading</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">No results</p>
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
                      "w-full group rounded-2xl border p-2.5 text-left transition-all duration-300 relative overflow-hidden",
                      selected
                        ? "border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-sm"
                        : "border-transparent bg-slate-50/50 dark:bg-slate-900/30 hover:border-slate-200 dark:hover:border-slate-700",
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                            selected
                              ? "bg-indigo-600 text-white"
                              : "bg-white dark:bg-slate-800 text-slate-500 group-hover:text-indigo-600",
                          )}
                        >
                          {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "text-sm font-bold tracking-tight truncate w-32",
                              selected
                                ? "text-indigo-700 dark:text-indigo-300"
                                : "text-slate-900 dark:text-slate-200",
                            )}
                          >
                            {customer.name}
                          </p>
                          <p className="text-[10px] font-medium text-slate-400 truncate w-32">
                            {customer.phone || "No contact"}
                          </p>
                          {customer.address && (
                            <p className="text-[9px] text-slate-400 truncate w-32 opacity-80">
                              {customer.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p
                            className={cn(
                              "text-xs font-black tracking-tight",
                              isToCollect
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {formatCurrency(Math.abs(balance))}
                          </p>
                          <p className="text-[8px] font-bold uppercase tracking-tighter opacity-40">
                            {isToCollect ? "Collect" : "Pay"}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 transition-all",
                            selected
                              ? "text-indigo-500 translate-x-0.5"
                              : "text-slate-300 dark:text-slate-700",
                          )}
                        />
                      </div>
                    </div>

                    {customer.dueDate && (
                      <div className="mt-2 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500/80">
                        <CalendarClock className="w-3 h-3" />
                        Due: {formatDate(customer.dueDate)}
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
