import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Settings, ShieldCheck, Users, WalletCards } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

type Customer = {
  id: string;
  totalBalance?: number;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

export const DashboardHomePage = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/ledger/customers');
        setCustomers(Array.isArray(res.data) ? (res.data as Customer[]) : []);
      } catch {
        setCustomers([]);
      }
    };
    void load();
  }, []);

  const summary = useMemo(() => {
    return customers.reduce(
      (acc, customer) => {
        const balance = Number(customer.totalBalance || 0);
        if (balance >= 0) {
          acc.toCollect += balance;
        } else {
          acc.toPay += Math.abs(balance);
        }
        return acc;
      },
      { toCollect: 0, toPay: 0 }
    );
  }, [customers]);

  return (
    <div className="rounded-2xl bg-[linear-gradient(180deg,#f5f7fb_0%,#edf2ff_100%)] p-3 sm:p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName || user.username} className="h-14 w-14 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e293b] text-white">
                  <WalletCards className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">HisabKit</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">Business dashboard</h1>
                <p className="text-xs text-slate-500">Welcome, {user?.fullName || user?.username}</p>
              </div>
            </div>

            <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
              Overview
            </span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Customers</p>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{customers.length}</p>
            <p className="mt-1 text-sm text-slate-500">Active ledger accounts</p>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-lg shadow-emerald-100/60">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">You collect</p>
            <p className="mt-2 text-2xl font-extrabold text-emerald-800">{formatCurrency(summary.toCollect)}</p>
            <p className="mt-1 text-sm text-emerald-700">Total receivable balance</p>
          </div>

          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 shadow-lg shadow-rose-100/60">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">You pay</p>
            <p className="mt-2 text-2xl font-extrabold text-rose-800">{formatCurrency(summary.toPay)}</p>
            <p className="mt-1 text-sm text-rose-700">Total payable balance</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <Users className="h-4 w-4" />
              Daily operations
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              Keep customer accounts clear and up to date.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Open the customer-wise ledger to add entries, record backdated transactions, and keep balances accurate.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/ledger"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1e293b] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f172a]"
              >
                Open customer ledger
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Manage profile & templates
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{user?.username}</p>
              {user?.email ? <p className="text-sm text-slate-500">{user.email}</p> : null}
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
                <ShieldCheck className="h-4 w-4" />
                Role: {user?.role}
              </p>
            </div>

            {user?.role === 'SUPER_ADMIN' && (
              <Link
                to="/admin"
                className="flex items-center justify-between rounded-3xl border border-blue-200 bg-blue-50 p-5 text-blue-900 shadow-lg shadow-blue-100/60"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Admin</p>
                  <p className="mt-2 text-lg font-bold">Manage tenants</p>
                </div>
                <Building2 className="h-5 w-5" />
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
