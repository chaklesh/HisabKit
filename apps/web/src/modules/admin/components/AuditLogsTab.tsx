import * as React from "react";
import { 
  Search, 
  User as UserIcon, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Building2,
  Info,
  Target,
  X,
  Shield,
  Monitor,
  Globe,
  ArrowRightLeft,
  Fingerprint,
  Activity,
  Cpu,
  Clock,
  ExternalLink,
  ChevronDown,
  Hash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@hisabkit/lib/utils";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import adminService from "../services/adminService";
import type { AuditLog } from "../services/adminApi";
import { format, formatDistanceToNow } from "date-fns";

export function AuditLogsTab() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalElements, setTotalElements] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listAuditLogs(page, 15, debouncedSearch);
      setLogs(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionStyles = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE": return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800";
      case "UPDATE": return "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-800";
      case "DELETE": return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800";
      default: return "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800";
    }
  };

  const parseChanges = (changes: string) => {
    if (!changes) return {};
    try {
      return JSON.parse(changes);
    } catch {
      return {};
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-160px)] overflow-hidden bg-slate-50/30 dark:bg-slate-950 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
      {/* Premium Glass Header */}
      <div className="flex-none p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="p-3 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20"
              >
                <Fingerprint className="w-6 h-6" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Forensic Audit Hub</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity className="w-3 h-3 text-emerald-500" />
                  Live Platform Integrity Monitoring
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative group w-full sm:w-[450px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search by initiator, shop, or object name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-12 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-950 focus:border-indigo-500 dark:focus:border-indigo-500 text-sm font-bold outline-none transition-all shadow-inner"
              />
              {loading && searchTerm !== debouncedSearch && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 px-6 py-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {format(new Date(), "HH:mm:ss")} UTC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Ledger Table */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white/50 dark:bg-slate-950/50">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="sticky top-0 z-20 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Timestamp</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[180px]">Subject</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[120px]">Event</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Activity Summary</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 w-[260px]">Initiator Context</th>
                <th className="px-10 py-6 text-right pr-14 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-900/50">
              {loading && logs.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-10 py-10"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-40 text-center">
                    <div className="flex flex-col items-center gap-6 text-slate-300">
                      <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800">
                        <Database className="w-8 h-8 opacity-40" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-[0.4em] opacity-60">No forensic records detected</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <motion.tr 
                    key={log.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/80 dark:hover:bg-indigo-950/10 transition-all group cursor-default"
                  >
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white leading-none tracking-tight">
                          {format(new Date(log.timestamp), "MMM dd, yyyy")}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <Badge className="bg-transparent text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                          {log.entityName}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={cn("px-4 py-1.5 rounded-[0.75rem] border-2 text-[9px] font-black uppercase tracking-[0.2em] text-center shadow-sm", getActionStyles(log.action))}>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="max-w-[400px]">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                          <span className="text-slate-900 dark:text-white font-black decoration-indigo-500/30 underline underline-offset-8 decoration-2">{log.targetName || "System Object"}</span>
                          <span className="mx-2 opacity-40">—</span>
                          {log.action.toLowerCase()}d by <span className="text-indigo-600 dark:text-indigo-400">{log.username || "System Engine"}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-black text-slate-900 dark:text-white leading-none">{log.username || "Root Engine"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-400 truncate w-[200px] uppercase tracking-widest">{log.tenantName || "Platform Global"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right pr-14">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="group/btn relative p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
                      >
                        <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Forensic Navigation */}
        <div className="flex-none p-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Integrity Depth</span>
              <div className="h-1 w-12 bg-indigo-500 rounded-full mt-1.5" />
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">
              {totalElements.toLocaleString()} Forensic Entries
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 0 || loading} 
              onClick={() => setPage(p => p - 1)}
              className="rounded-2xl h-12 w-12 p-0 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = page < 2 ? i : (page > totalPages - 3 ? totalPages - 5 + i : page - 2 + i);
                if (pNum < 0 || pNum >= totalPages) return null;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={cn(
                      "w-12 h-12 rounded-2xl text-xs font-black transition-all border",
                      page === pNum 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-2xl scale-110 z-10" 
                        : "bg-white dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-500"
                    )}
                  >
                    {pNum + 1}
                  </button>
                );
              })}
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              disabled={page >= totalPages - 1 || loading} 
              onClick={() => setPage(p => p + 1)}
              className="rounded-2xl h-12 w-12 p-0 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Forensic Investigation Side-Panel */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
              onClick={() => setSelectedLog(null)} 
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-l border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="p-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg">
                        <Shield className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Investigation</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Hash className="w-2.5 h-2.5" />
                        ID: {selectedLog.id.slice(0, 16)}...
                      </div>
                      <Badge className={cn("px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest", getActionStyles(selectedLog.action))}>
                        {selectedLog.action}
                      </Badge>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedLog(null)} 
                    className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-all hover:rotate-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                  {/* Forensic Context Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner group">
                      <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-4 h-4 text-indigo-500 group-hover:animate-pulse" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Network Origin</p>
                      </div>
                      <p className="text-sm font-mono font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm truncate">
                        {selectedLog.ipAddress || "INTERNAL_LOOPBACK"}
                      </p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner group">
                      <div className="flex items-center gap-3 mb-4">
                        <Monitor className="w-4 h-4 text-indigo-500 group-hover:animate-pulse" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Client Signature</p>
                      </div>
                      <div className="relative group/tooltip">
                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed truncate bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          {selectedLog.userAgent || "TRUSTED_ENGINE"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Diff Engine */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white italic">Mutation Delta</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrity Verified</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {(() => {
                        const delta = parseChanges(selectedLog.changes);
                        const entries = Object.entries(delta);
                        
                        if (entries.length === 0) {
                          return (
                            <div className="py-12 px-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                              <Info className="w-8 h-8 mx-auto text-slate-300" />
                              <p className="text-xs font-bold text-slate-400 italic leading-relaxed">
                                No granular field mutations recorded.<br/>This operation might have been a bulk synchronization.
                              </p>
                            </div>
                          );
                        }

                        return entries.map(([field, values]: [string, any], entryIdx) => {
                          const isDiff = values && typeof values === 'object' && 'old' in values && 'new' in values;
                          
                          return (
                            <motion.div 
                              key={field} 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: entryIdx * 0.1 }}
                              className="group/diff p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all space-y-6"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
                                    {field}
                                  </span>
                                </div>
                                <div className="opacity-0 group-hover/diff:opacity-100 transition-opacity">
                                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200">Field Revision</Badge>
                                </div>
                              </div>
                              
                              {isDiff ? (
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_40px_1fr] items-center gap-4">
                                  <div className="p-5 rounded-3xl bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/20 group/prev">
                                    <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                      <X className="w-2.5 h-2.5" /> Previous
                                    </p>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded-xl border border-rose-100/30 shadow-sm min-h-[44px] break-words">
                                      {values.old?.toString() || <span className="opacity-40 italic">Empty</span>}
                                    </p>
                                  </div>
                                  <div className="flex justify-center">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-2xl rotate-90 sm:rotate-0">
                                      <ChevronDown className="w-5 h-5 sm:-rotate-90" />
                                    </div>
                                  </div>
                                  <div className="p-5 rounded-3xl bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20">
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                      <Target className="w-2.5 h-2.5" /> Updated
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-100/30 shadow-sm min-h-[44px] break-words">
                                      {values.new?.toString() || <span className="opacity-40 italic">Empty</span>}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-inner">
                                  <p className="text-sm font-black text-slate-900 dark:text-white break-words">
                                    {values?.toString() || <span className="opacity-40 italic">No Content</span>}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Professional Sign-off */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative p-10 rounded-[3rem] bg-slate-900 dark:bg-slate-900 text-white shadow-2xl space-y-8 overflow-hidden border border-white/10">
                      <div className="flex items-center gap-6">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/20 shadow-2xl"
                        >
                          {selectedLog.username?.charAt(0).toUpperCase() || "S"}
                        </motion.div>
                        <div>
                          <p className="text-2xl font-black leading-none tracking-tight">{selectedLog.username || "System Agent"}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black px-2 py-0.5 rounded-full">AUTHORIZED</Badge>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Verified Signature</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          <span className="text-[11px] font-black uppercase tracking-widest">{selectedLog.tenantName || "Platform"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-2xl">
                          <Shield className="w-4 h-4" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Audit Immutable</span>
                        </div>
                      </div>
                      <motion.div 
                        animate={{ opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute top-0 right-0 p-8"
                      >
                        <Fingerprint className="w-24 h-24 opacity-10 rotate-12" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-3 opacity-40 group hover:opacity-100 transition-opacity">
                    <Shield className="w-3 h-3" />
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.5em]">HisabKit Sovereign Forensic Engine v5.0</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
