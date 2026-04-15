import { ArrowRight, Building2, Settings, ShieldCheck, NotebookTabs, Activity, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AuthUserSummary } from '@/shared/types';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

type DashboardActionsPanelProps = {
  user: AuthUserSummary | null;
};

export function DashboardActionsPanel({ user }: DashboardActionsPanelProps) {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      
      {/* Main Ledger Hero Card */}
      <section className="relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem]" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
           <NotebookTabs className="w-64 h-64 text-white -rotate-12 translate-x-32" />
        </div>

        <div className="relative p-10 md:p-14 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                  <NotebookTabs className="w-6 h-6" />
               </div>
               <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 font-bold uppercase tracking-widest text-[9px]">
                  Daily Operations
               </Badge>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-[1.05]">
              Real-time Ledger <br className="hidden md:block" />
              <span className="text-indigo-400">Precision.</span>
            </h2>
            
            <p className="max-w-xl text-lg text-slate-300 font-medium leading-relaxed mb-10 opacity-80">
              Synchronize your business accounts across multiple devices. Manage collections, payments, and digital proof documents in a single unified interface.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/ledger"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/20"
            >
              Access Store Ledger
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-8 py-4 text-sm font-black text-white hover:bg-white/20 transition-all"
            >
              Account Setup
              <Settings className="w-5 h-5 opacity-60" />
            </Link>
          </div>
        </div>
      </section>

      {/* Side Utilities */}
      <aside className="space-y-6 flex flex-col">
        
        {/* User Status Card */}
        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white group">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Profile</p>
               <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Activity className="w-4 h-4" />
               </div>
            </div>
            
            <div className="space-y-1">
               <p className="text-xl font-black text-slate-900 truncate">{user?.fullName || user?.username}</p>
               <p className="text-sm font-medium text-slate-500">{user?.email || 'Authenticated User'}</p>
            </div>

            <div className="mt-8 space-y-3">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:bg-slate-100/50">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-4 h-4 text-indigo-600" />
                     <span className="text-xs font-bold text-slate-700">Access Key</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase">{user?.role}</Badge>
               </div>
               
               <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-colors group-hover:bg-slate-100/50">
                  <div className="flex items-center gap-3">
                     <CreditCard className="w-4 h-4 text-emerald-600" />
                     <span className="text-xs font-bold text-slate-700">Subscription</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase border-emerald-100 bg-emerald-50 text-emerald-700">Active</Badge>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Admin Access */}
        {user?.role === 'SUPER_ADMIN' && (
          <Link
            to="/admin"
            className="flex-1 flex items-center justify-between rounded-[2.5rem] p-8 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500"
          >
            <div>
              <div className="p-3 rounded-2xl bg-indigo-600 text-white w-fit mb-4 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-110">
                 <Building2 className="w-6 h-6" />
              </div>
              <p className="text-lg font-black text-slate-900 mb-1">Tenant Manager</p>
              <p className="text-xs text-slate-500 font-medium tracking-tight">System-wide infrastructure control</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
               <ArrowRight className="w-5 h-5" />
            </div>
          </Link>
        )}
      </aside>
    </div>
  );
}
