import { Download, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useReportsState } from '../hooks/useReportsState';
import { ReportSummaryCards } from '../components/ReportSummaryCards';
import { ReportCharts } from '../components/ReportCharts';
import { ReportFilters } from '../components/ReportFilters';
import { ReportTable } from '../components/ReportTable';
import { formatDate } from '@/shared/utils/ledgerUtils';

export default function ReportsPage() {
  const { state, data } = useReportsState();

  const handleExportCsv = () => {
    const headers = ['Name', 'Phone', 'Balance', 'Due Date'];
    const rows = data.processedData.map(c => [
      c.name,
      c.phone || '',
      c.totalBalance || 0,
      c.dueDate ? formatDate(c.dueDate) : 'OPEN'
    ]);
    
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Analytical_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      {/* Header - Dense */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
               <PieChartIcon className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600/70 dark:text-indigo-400/70">
              Intelligence Engine
            </p>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Workspace <span className="text-indigo-600 dark:text-indigo-400">Analytics</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleExportCsv}
            className="h-9 rounded-lg border-slate-200 dark:border-slate-800 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all px-3"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button 
            className="h-9 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-4 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 dark:shadow-none"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Metrics Row - Dense */}
      <ReportSummaryCards 
        summary={data.summary} 
        customerCount={data.customers.length} 
      />

      {/* Analytics Visualization - High Density */}
      <ReportCharts 
        chartData={data.chartData} 
        isLoading={data.isLoading} 
      />

      {/* Control & Data Surface */}
      <div className="space-y-4">
        <ReportFilters 
          searchTerm={state.searchTerm}
          onSearchChange={state.setSearchTerm}
          dueFilter={state.dueFilter}
          onDueFilterChange={state.setDueFilter}
          sortField={state.sortField}
          onSortFieldChange={state.setSortField}
        />

        <ReportTable 
          data={data.processedData} 
          isLoading={data.isLoading} 
        />
      </div>
    </div>
  );
}
