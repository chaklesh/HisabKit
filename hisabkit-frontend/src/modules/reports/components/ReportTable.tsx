import { ArrowRight, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { formatCurrency, formatDate } from '@/shared/utils/ledgerUtils';
import type { Customer } from '@/modules/ledger/types/ledgerTypes';

interface ReportTableProps {
  data: Customer[];
  isLoading: boolean;
}

export function ReportTable({ data, isLoading }: ReportTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
           <div className="w-8 h-8 rounded-full border-2 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aggregating Analytical Data</p>
        </div>
      ) : data.length === 0 ? (
        <div className="py-24 text-center space-y-4">
           <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/80 rounded-2xl flex items-center justify-center mx-auto opacity-50 shadow-inner">
              <BarChart3 className="w-6 h-6 text-slate-300" />
           </div>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No matching datasets identified.</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <Table>
            <TableHeader className="bg-slate-100/30 dark:bg-slate-800/30">
              <TableRow className="border-slate-100 dark:border-slate-800 h-9">
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Business Identity</TableHead>
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Telemetry / Contact</TableHead>
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Exposure (Net)</TableHead>
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Lifecycle Status</TableHead>
                <TableHead className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Insight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((customer) => {
                const balance = customer.totalBalance ?? 0;
                const isOverdue = customer.dueDate && new Date(customer.dueDate) < new Date();
                
                return (
                  <TableRow 
                     key={customer.id} 
                     className="border-slate-50 dark:border-slate-800/30 hover:bg-white dark:hover:bg-slate-900 transition-colors group cursor-pointer h-12"
                     onClick={() => navigate(`/ledger?customerId=${customer.id}`)}
                  >
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                           {customer.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 group-hover:text-indigo-600 transition-colors truncate">
                            {customer.name}
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter opacity-70">UID: {customer.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                        {customer.phone || 'DEFERRED'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <span className={cn(
                        'text-[11px] font-black tracking-tight tabular-nums px-2 py-0.5 rounded-md',
                        balance >= 0 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : 'text-rose-600 dark:text-rose-400 bg-rose-500/5'
                      )}>
                        {formatCurrency(balance)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      {customer.dueDate ? (
                         <Badge className={cn(
                           "rounded-md text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
                           isOverdue ? "bg-rose-500 text-white border-none" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-none"
                         )}>
                           {formatDate(customer.dueDate)}
                         </Badge>
                      ) : (
                        <span className="text-[8px] font-black text-slate-300 uppercase italic">Rolling Session</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                       <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                       </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
