import type { AuthUserSummary } from "@/shared/types";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Card, CardContent } from "@hisabkit/ui/components/Card";
import {
  ArrowRight,
  Building2,
  CreditCard,
  LayoutGrid,
  NotebookTabs,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

type DashboardActionsPanelProps = {
  user: AuthUserSummary | null;
};

export function DashboardActionsPanel({ user }: DashboardActionsPanelProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 reveal">
      {/* Quick Launch Card */}
      <Card className="rounded-[3rem] border-slate-200 dark:border-slate-800 bg-background shadow-lg overflow-hidden group">
        <CardContent className="p-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Quick Launch
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Navigation Center
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link
              to="/ledger"
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group/btn shadow-sm"
            >
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm transition-transform group-hover/btn:scale-110 group-hover/btn:-rotate-6">
                <NotebookTabs className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                Full Ledger
              </span>
            </Link>

            <Link
              to="/settings"
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all group/btn shadow-sm"
            >
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 shadow-sm transition-transform group-hover/btn:scale-110 group-hover/btn:rotate-6">
                <Settings className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                Preferences
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Identity & Admin Card */}
      <div className="flex flex-col gap-6">
        <Card className="rounded-[2.5rem] bg-slate-900 dark:bg-slate-950 border-none shadow-2xl overflow-hidden group flex-1">
          <CardContent className="p-8 pb-10 flex flex-col justify-between h-full relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <ShieldCheck className="w-40 h-40 text-white -rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/20 font-black uppercase tracking-widest text-[9px] px-3">
                  Session Identity
                </Badge>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>

              <div className="space-y-1">
                <h4 className="text-3xl font-black text-white tracking-tight">
                  {user?.fullName || user?.username}
                </h4>
                <p className="text-sm font-bold text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                  Authorized {user?.role} Access
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Subscription
                  </p>
                  <p className="text-xs font-black text-white">Enterprise Tier</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-emerald-400 border-emerald-500/30 font-black uppercase tracking-widest text-[8px]"
              >
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {user?.role === "SUPER_ADMIN" && (
          <Link
            to="/admin"
            className="group flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black tracking-tight">Admin Console</p>
                <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest leading-none">
                  Global Management
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
