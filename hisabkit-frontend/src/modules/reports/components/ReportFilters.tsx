import { Search, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import type { DueFilter, SortField } from '../hooks/useReportsState';

const selectStyle = "w-full h-10 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 appearance-none cursor-pointer";

interface ReportFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  dueFilter: DueFilter;
  onDueFilterChange: (val: DueFilter) => void;
  sortField: SortField;
  onSortFieldChange: (val: SortField) => void;
}

export function ReportFilters({ 
  searchTerm, 
  onSearchChange, 
  dueFilter, 
  onDueFilterChange, 
  sortField, 
  onSortFieldChange 
}: ReportFiltersProps) {
  return (
    <Card className="glass-card border-none rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Deep Search Database</label>
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search name, phone, email..."
                className="h-10 pl-10 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-950 transition-all text-xs font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Lifecycle Status</label>
            <div className="relative">
              <select
                value={dueFilter}
                onChange={(e) => onDueFilterChange(e.target.value as DueFilter)}
                className={selectStyle}
              >
                <option value="ALL">Full Directory</option>
                <option value="OVERDUE">At Risk / Overdue</option>
                <option value="UPCOMING_7_DAYS">Expected (7 Days)</option>
                <option value="NO_DUE_DATE">Indefinite Terms</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-300 pointer-events-none rotate-90" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Analytics Priority</label>
            <div className="relative">
              <select
                value={sortField}
                onChange={(e) => onSortFieldChange(e.target.value as SortField)}
                className={selectStyle}
              >
                <option value="BALANCE">Value Exposure</option>
                <option value="DUE_DATE">Time Sensitivity</option>
                <option value="NAME">Identifier (A-Z)</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-300 pointer-events-none rotate-90" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
