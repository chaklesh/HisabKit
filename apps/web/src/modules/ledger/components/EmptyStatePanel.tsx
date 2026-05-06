import { MousePointer2, Sparkles, Users } from "lucide-react";

export function EmptyStatePanel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] rounded-[2.5rem] glass-card p-12 reveal border-dashed border-2 grow">
      <div className="relative">
        <div className="absolute -top-4 -right-4">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-inner">
          <Users className="h-10 w-10" />
        </div>
      </div>

      <div className="mt-8 text-center space-y-4 max-w-xs">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Select an <span className="text-gradient">Account</span>
        </h3>
        <p className="text-base font-medium text-slate-500 dark:text-slate-400">
          Choose a customer from your index to view their full transaction history and maturity
          schedule.
        </p>
      </div>

      <div className="mt-10 flex items-center gap-3 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <MousePointer2 className="w-4 h-4 text-indigo-500 animate-bounce" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
          Interaction required
        </span>
      </div>
    </div>
  );
}
