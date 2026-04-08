import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  LockKeyhole,
  Network,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from 'lucide-react';

const highlights = [
  {
    icon: ShieldCheck,
    title: 'Role-safe access',
    description: 'Super admins and tenant users land in the right workspace with the right permissions.',
  },
  {
    icon: Network,
    title: 'Tenant isolation',
    description: 'Every request stays scoped to the active tenant so ledgers remain clean and separated.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-friendly flow',
    description: 'The auth and dashboard experience stays usable on small screens without feeling cramped.',
  },
];

const workflowSteps = [
  'Sign in with username/password or Google',
  'Land in a protected dashboard route',
  'Jump into admin or ledger tools as needed',
];

export const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,58,89,0.95),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(15,118,110,0.24),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(90deg,rgba(59,130,246,0.12),rgba(16,185,129,0.08),rgba(251,191,36,0.08))] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#2E3A59] shadow-lg shadow-black/20">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-slate-300">HISABKIT</p>
              <p className="text-xs text-slate-400">Multi-tenant ledger control</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
              <Sparkles className="h-4 w-4" />
              A cleaner entry point for your ledger workspace
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Manage your books without losing the thread between teams, tenants, and devices.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                HisabKit keeps the public landing page lightweight, then drops authenticated users into a protected
                dashboard with tenant-aware ledger tools, admin controls, and Google sign-in support.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-[#111827] transition hover:bg-slate-100"
              >
                Start sign-in
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200">
                <LockKeyhole className="h-4 w-4" />
                Password and Google login
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/10 backdrop-blur">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-bold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 via-transparent to-emerald-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Protected workspace</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Built for quick handoff into auth</h2>
                </div>
                <div className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                  Landing
                </div>
              </div>

              <div className="grid gap-4 py-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <Building2 className="h-4 w-4 text-sky-300" />
                    Tenant-aware routing
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Public users see the marketing page, while signed-in users move straight to `/dashboard`.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <WalletCards className="h-4 w-4 text-amber-300" />
                    Ledger entry flow
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Role checks continue to protect `/admin` and `/ledger` so the data surface stays guarded.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm font-semibold text-white">Sign-in path</p>
                <div className="mt-4 space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#111827]">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-6 text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
};
