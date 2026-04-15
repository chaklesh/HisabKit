/**
 * ReportPanel component
 * Displays due date report with filtering and sorting
 * ~140 lines
 */

import { Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';
import { formatCurrency, formatDate } from '../../../shared/utils/ledgerUtils';
import type { Customer } from '../types/ledgerTypes';

interface ReportPanelProps {
  report: Customer[];
  searchTerm: string;
  dueFilter: 'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE';
  sortField: 'NAME' | 'BALANCE' | 'DUE_DATE';
  isLoading: boolean;
  onSearchChange: (term: string) => void;
  onFilterChange: (filter: 'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE') => void;
  onSortChange: (field: 'NAME' | 'BALANCE' | 'DUE_DATE') => void;
  onExportCsv: () => void;
}

export function ReportPanel({
  report,
  searchTerm,
  dueFilter,
  sortField,
  isLoading,
  onSearchChange,
  onFilterChange,
  onSortChange,
  onExportCsv,
}: ReportPanelProps) {
  const handleDueFilterChange = (value: string) => {
    if (value === 'ALL' || value === 'OVERDUE' || value === 'UPCOMING_7_DAYS' || value === 'NO_DUE_DATE') {
      onFilterChange(value);
    }
  };

  const handleSortFieldChange = (value: string) => {
    if (value === 'NAME' || value === 'BALANCE' || value === 'DUE_DATE') {
      onSortChange(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter section */}
      <Card>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Search</label>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Customer name or phone"
                className="w-full"
              />
            </div>

            {/* Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Filter</label>
              <select
                value={dueFilter}
                onChange={(e) => handleDueFilterChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">All customers</option>
                <option value="OVERDUE">Overdue</option>
                <option value="UPCOMING_7_DAYS">Due in 7 days</option>
                <option value="NO_DUE_DATE">No due date</option>
              </select>
            </div>

            {/* Sort */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Sort by</label>
              <select
                value={sortField}
                onChange={(e) => handleSortFieldChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="BALANCE">Balance</option>
                <option value="DUE_DATE">Due date</option>
                <option value="NAME">Name</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" onClick={onExportCsv}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Export csv
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
          ) : report.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No customers match filters</div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-4 py-3">Customer</TableHead>
                  <TableHead className="px-4 py-3">Balance</TableHead>
                  <TableHead className="px-4 py-3">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="px-4 py-3 text-slate-900">{customer.name}</TableCell>
                    <TableCell
                      className={cn(
                        'px-4 py-3 font-semibold',
                        (customer.totalBalance ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      )}
                    >
                      {formatCurrency(customer.totalBalance ?? 0)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-slate-600">{customer.dueDate ? formatDate(customer.dueDate) : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
