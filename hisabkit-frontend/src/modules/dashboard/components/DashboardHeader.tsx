import { Calendar, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import type { AuthUserSummary } from '@/shared/types';
import { Badge } from '@/shared/components/ui/badge';

type DashboardHeaderProps = {
  user: AuthUserSummary | null;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-10 lg:mb-14 reveal">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="flex items-start gap-6 lg:gap-8">
           <div className="relative group">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[2rem] bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl ring-4 ring-white dark:ring-slate-900 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
                 <Sparkles className="w-4 h-4 text-white animate-pulse" />
              </div>
           </div>
           
           <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                 <Badge className="text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1 text-white bg-gradient-to-r from-indigo-600 to-violet-600 border-none shadow-lg shadow-indigo-200 dark:shadow-none">
                    <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Growth Path
                 </Badge>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <MapPin className="w-3 h-3" /> HQ Workspace
                 </div>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {greeting}, <span className="text-gradient">{user?.fullName?.split(' ')[0] || user?.username}</span>
              </h1>
              <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                Ready to optimize your financial throughput? Here is your real-time performance matrix.
              </p>
           </div>
        </div>

        <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-3 pr-6 rounded-[2rem] shadow-sm premium-shadow self-start lg:self-center">
           <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-6 h-6" />
           </div>
           <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Fiscal</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">Quarter 02, 2026</p>
           </div>
        </div>
      </div>
    </div>
  );
}
