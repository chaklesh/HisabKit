import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/shared/utils/ledgerUtils';

interface ReportChartsProps {
  chartData: {
    topReceivables: any[];
    pieData: any[];
  };
  isLoading: boolean;
}

export function ReportCharts({ chartData, isLoading }: ReportChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Distribution Chart */}
      <Card className="glass-card border-none rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="pb-0 px-6 pt-6">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-indigo-500" />
            Asset Allocation
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Receivables vs Payables Ratio</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] p-2">
          {isLoading ? (
             <LoadingSpinner />
          ) : chartData.pieData.length === 0 ? (
             <EmptyState icon={<PieChartIcon className="w-6 h-6" />} text="No Data Available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.pieData.map((d, index) => (
                    <Cell key={`cell-${index}`} fill={d.color} className="outline-none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Receivables Chart */}
      <Card className="glass-card border-none rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="pb-0 px-6 pt-6">
          <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Priority Concentration
          </CardTitle>
          <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Top 8 Outstanding Receivables</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] p-4 pt-6">
          {isLoading ? (
             <LoadingSpinner />
          ) : chartData.topReceivables.length === 0 ? (
             <EmptyState icon={<BarChart3 className="w-6 h-6" />} text="No Data Available" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.topReceivables} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" opacity={0.3} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80} 
                  axisLine={false} 
                  tickLine={false} 
                  style={{ fontWeight: 'bold', fontSize: '9px', fill: '#94a3b8' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Bar 
                  dataKey="balance" 
                  fill="#6366f1" 
                  radius={[0, 6, 6, 0]} 
                  barSize={18}
                >
                  {chartData.topReceivables.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4338ca' : '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-slate-100 dark:border-slate-800 border-t-indigo-500 animate-spin" />
    </div>
  );
}

function EmptyState({ icon, text }: any) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
       {icon}
       <p className="text-[9px] font-black uppercase tracking-widest">{text}</p>
    </div>
  );
}
