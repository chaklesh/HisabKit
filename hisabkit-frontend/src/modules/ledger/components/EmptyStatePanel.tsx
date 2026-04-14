/**
 * EmptyStatePanel component
 * Shows when no customer is selected
 * ~50 lines
 */

import { Users } from 'lucide-react';

export function EmptyStatePanel() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 shadow-lg shadow-slate-200/60">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Users className="h-8 w-8" />
        </div>
        <p className="mt-4 text-2xl font-black text-slate-800">No customer selected</p>
        <p className="mt-2 text-sm text-slate-500">Select a customer from the left.</p>
      </div>
    </div>
  );
}
