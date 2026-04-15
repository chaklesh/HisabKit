import { Calendar, TrendingUp } from 'lucide-react';
import type { AuthUserSummary } from '@/shared/types';
import { Badge } from '@/shared/components/ui/badge';

type DashboardHeaderProps = {
  user: AuthUserSummary | null;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-5">
           <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-xl ring-4 ring-white shadow-indigo-200">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover rounded-3xl" />
                ) : (
                  user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
           </div>
           
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest text-indigo-600 border-indigo-100 bg-indigo-50/50">
                    <TrendingUp className="w-3 h-3 mr-1" /> Enterprise Plan
                 </Badge>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                {greeting}, {user?.fullName?.split(' ')[0] || user?.username}
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Here is what is happening with your business today.
              </p>
           </div>
        </div>

        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border border-slate-200 p-2 rounded-2xl">
           <div className="px-4 py-2 text-right border-r border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Period</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">April 2026</p>
           </div>
           <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Calendar className="w-5 h-5" />
           </div>
        </div>
      </div>
    </div>
  );
}
