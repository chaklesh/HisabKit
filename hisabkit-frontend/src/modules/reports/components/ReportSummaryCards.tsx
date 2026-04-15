import { TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { formatCurrency } from '@/shared/utils/ledgerUtils';

interface ReportSummaryCardsProps {
  summary: { receivables: number; payables: number; overdueCount: number };
  customerCount: number;
}

export function ReportSummaryCards({ summary, customerCount }: ReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard 
        title="Receivables" 
        value={formatCurrency(summary.receivables)} 
        subValue="Asset Pool"
        icon={<TrendingUp className="w-4 h-4" />}
        color="emerald"
        badge="Inbound"
      />
      <MetricCard 
        title="Payables" 
        value={formatCurrency(summary.payables)} 
        subValue="Debt Profile"
        icon={<TrendingDown className="w-4 h-4" />}
        color="rose"
        badge="Outbound"
      />
      <MetricCard 
        title="Net Position" 
        value={formatCurrency(summary.receivables - summary.payables)} 
        subValue="Liquidity"
        icon={<BarChart3 className="w-4 h-4" />}
        color="indigo"
        badge="Balance"
      />
      <MetricCard 
        title="High Risk" 
        value={summary.overdueCount.toString()} 
        subValue="Overdue"
        icon={<AlertCircle className="w-4 h-4" />}
        color="amber"
        badge="Overdue"
      />
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, color, badge }: any) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-500/10 border-emerald-100',
    rose: 'text-rose-600 bg-rose-500/10 border-rose-100',
    indigo: 'text-indigo-600 bg-indigo-500/10 border-indigo-100',
    amber: 'text-amber-600 bg-amber-500/10 border-amber-100',
  };

  return (
    <Card className="glass-card border-none rounded-2xl overflow-hidden group shadow-sm transition-all duration-300">
      <CardContent className="p-4 relative flex items-center gap-4">
        <div className={cn("p-2.5 rounded-xl transition-all group-hover:scale-110", colors[color as keyof typeof colors])}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</p>
            <Badge variant="outline" className={cn("text-[8px] font-black uppercase px-1.5 py-0 rounded-md border-none h-4", colors[color as keyof typeof colors])}>
              {badge}
            </Badge>
          </div>
          <h3 className={cn("text-lg font-black tracking-tight tabular-nums truncate", colors[color as keyof typeof colors])}>
            {value}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 opacity-60 uppercase">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  );
}
