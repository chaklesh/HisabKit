import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@hisabkit/ui/components/Dialog";
import { Button } from "@hisabkit/ui/components/Button";
import { Download, FileSpreadsheet, Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@hisabkit/lib/utils";

interface DataManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{ 
    customerCreated: number; 
    customerUpdated: number; 
    transactionCreated: number; 
    transactionUpdated: number; 
  }>;
  onExportAll: () => Promise<void>;
}

export function DataManagementDialog({
  isOpen,
  onClose,
  onImport,
  onExportAll,
}: DataManagementDialogProps) {
  const [isImporting, setIsImporting] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [result, setResult] = React.useState<{ 
    customerCreated: number; 
    customerUpdated: number; 
    transactionCreated: number; 
    transactionUpdated: number; 
  } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setResult(null);

    try {
      const counts = await onImport(file);
      setResult(counts);
    } catch (err: any) {
      setError(err.message || "Failed to import data. Please check your file format.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const headers = "Customer_ID,Reference_No,Name,Phone,Email,Address,Due_Date,Tags,Date,Type,Total_Amount,Paid_Amount,Description\n";
    const example = ",,John Doe,9876543210,john@example.com,Main St,2026-12-31,VIP,2024-05-01,SALE,5000,1500,Invoice #101\n,,Jane Smith,9988776655,,Park Ave,,Regular,2024-05-02,PAYMENT,0,500,Full Payment";
    const blob = new Blob([headers + example], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "hisabkit_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                <FileSpreadsheet className="w-6 h-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white">
                Data Management
              </DialogTitle>
            </div>
            <DialogDescription className="text-indigo-100 text-[11px] font-bold uppercase tracking-widest opacity-80">
              Reliable ledger sync and portability engine
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          {/* Import Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Bulk Import</h3>
              <button 
                onClick={downloadTemplate}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3 h-3" />
                GET TEMPLATE
              </button>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group relative border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer text-center",
                isImporting 
                  ? "border-indigo-300 bg-indigo-50/50 pointer-events-none" 
                  : "border-slate-100 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".csv" 
                onChange={handleFileChange} 
              />
              
              {isImporting ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Processing Data...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Click to Upload CSV</p>
                    <p className="text-[10px] text-slate-400 font-medium">Keep 'Customer_Code' intact to avoid duplicate profiles</p>
                  </div>
                </div>
              )}
            </div>

            {/* Results/Errors */}
            {result && (
              <div className="flex items-start gap-3 p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Sync Complete!</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] font-bold text-emerald-600/80 dark:text-emerald-500/80">
                    <p>New Customers: <span className="text-emerald-700 dark:text-emerald-300">{result.customerCreated}</span></p>
                    <p>Profiles Updated: <span className="text-emerald-700 dark:text-emerald-300">{result.customerUpdated}</span></p>
                    <p>New Transactions: <span className="text-emerald-700 dark:text-emerald-300">{result.transactionCreated}</span></p>
                    <p>Sync Adjustments: <span className="text-emerald-700 dark:text-emerald-300">{result.transactionUpdated}</span></p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-1">Error</p>
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-500">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Migration & Backup</h3>
            <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:border-indigo-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Full Data Export</p>
                  <p className="text-[10px] text-slate-400 font-medium">Download everything as a CSV file</p>
                </div>
              </div>
              <Button 
                onClick={async () => {
                  setIsExporting(true);
                  await onExportAll();
                  setIsExporting(false);
                }}
                disabled={isExporting}
                variant="outline"
                className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all"
              >
                {isExporting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2" />}
                EXPORT ALL
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex justify-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            HisabKit Data Migration Engine v2.0
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
