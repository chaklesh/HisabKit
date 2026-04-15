import { ArrowRight, Building2, Settings, ShieldCheck, NotebookTabs, Activity, CreditCard, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AuthUserSummary } from '@/shared/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

type DashboardActionsPanelProps = {
  user: AuthUserSummary | null;
};

export function DashboardActionsPanel({ user }: DashboardActionsPanelProps) {
  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_400px] reveal">
      
      {/* Main Ledger Hero Card */}
      <Card className="relative overflow-hidden group border-none rounded-[3rem] shadow-2xl flex flex-col justify-end min-h-[500px]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-black dark:from-slate-950 dark:via-indigo-950 dark:to-black" />
        
        {/* Animated Background Element */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
           <NotebookTabs className="w-[600px] h-[600px] text-white rotate-12" />
        </div>

        <CardContent className="relative p-12 lg:p-16 space-y-10 z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 text-white shadow-inner">
                  <NotebookTabs className="w-7 h-7" />
               </div>
               <div className="flex flex-col">
                  <Badge className="w-fit bg-indigo-500/20 text-indigo-300 border-indigo-400/30 font-black uppercase tracking-[0.25em] text-[10px] py-1 px-3">
                     Store Intelligence
                  </Badge>
               </div>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95]">
              Voucher <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Governance.</span>
            </h2>
            
            <p className="max-w-2xl text-lg lg:text-xl text-slate-300 font-medium leading-relaxed opacity-70">
              Your business, decentralized and precise. Manage receivables, vendor payouts, and digital documentation with enterprise-grade synchronization.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link
              to="/ledger"
              className={cn(
                buttonVariants({ size: 'lg' }),
                "rounded-[1.5rem] bg-white px-10 py-8 text-base font-black text-slate-900 hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              )}
            >
              Open Ledger Console
              <Zap className="w-5 h-5 ml-2.5 text-indigo-600" />
            </Link>
            <Link
              to="/profile"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                "rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/10 px-10 py-8 text-base font-black text-white hover:bg-white/10 hover:text-white transition-all"
              )}
            >
              Enterprise Config
              <Settings className="w-5 h-5 ml-2.5 opacity-40" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Side Utilities */}
      <aside className="space-y-8 flex flex-col">
        
        {/* User Status Card */}
        <Card className="rounded-[3rem] glass-card border-none shadow-2xl overflow-hidden group">
          <CardContent className="p-10">
            <div className="flex items-center justify-between mb-8">
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Security Identification</span>
               <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-5 h-5" />
               </div>
            </div>
            
            <div className="space-y-2 mb-10">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                 {user?.fullName || user?.username}
               </h3>
               <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-emerald-500" />
                 Secure Session Protocol Activated
               </p>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all group-hover:bg-white dark:group-hover:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-indigo-500 text-white rounded-xl">
                        <ShieldCheck className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Access Tier</span>
                  </div>
                  <Badge className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-black px-3 py-1 uppercase">{user?.role}</Badge>
               </div>
               
               <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all group-hover:bg-white dark:group-hover:bg-slate-900 shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="p-2 bg-emerald-500 text-white rounded-xl">
                        <CreditCard className="w-4 h-4" />
                     </div>
                     <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Subscription</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-black uppercase border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1">Enterprise</Badge>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Admin Access */}
        {user?.role === 'SUPER_ADMIN' && (
          <Link
            to="/admin"
            className="group relative flex-1 flex items-center justify-between rounded-[3rem] p-10 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/30 transition-all duration-500 overflow-hidden shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="relative z-10">
              <div className="p-4 rounded-[1.5rem] bg-indigo-600 text-white w-fit mb-6 shadow-xl shadow-indigo-200 dark:shadow-none transition-transform group-hover:scale-110 group-hover:rotate-3">
                 <Building2 className="w-8 h-8" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Admin Console</p>
              <p className="text-sm text-slate-500 font-semibold tracking-tight">Control infrastructure & tenants</p>
            </div>
            <div className="relative z-10 w-14 h-14 rounded-full border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:translate-x-2">
               <ArrowRight className="w-6 h-6" />
            </div>
          </Link>
        )}
      </aside>
    </div>
  );
}
