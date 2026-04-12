import type { Customer, CustomerFilter, CustomerSort } from './ledgerTypes';

const safeTime = (value?: string): number => {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
};

export const applyDueDateMap = (
  customers: Customer[],
  dueDateByCustomer: Record<string, string>
): Customer[] => customers.map((customer) => ({ ...customer, dueDate: dueDateByCustomer[customer.id] || customer.dueDate }));

export const filterAndSortCustomers = ({
  customers,
  searchTerm,
  customerFilter,
  customerSort,
}: {
  customers: Customer[];
  searchTerm: string;
  customerFilter: CustomerFilter;
  customerSort: CustomerSort;
}): Customer[] => {
  const q = searchTerm.trim().toLowerCase();

  const filtered = customers.filter((customer) => {
    const matchesQuery =
      !q ||
      customer.name.toLowerCase().includes(q) ||
      (customer.phone || '').toLowerCase().includes(q) ||
      (customer.email || '').toLowerCase().includes(q) ||
      (customer.address || '').toLowerCase().includes(q);

    if (!matchesQuery) {
      return false;
    }

    const balance = Number(customer.totalBalance || 0);
    if (customerFilter === 'TO_COLLECT') {
      return balance > 0;
    }
    if (customerFilter === 'TO_PAY') {
      return balance < 0;
    }
    if (customerFilter === 'ZERO_BALANCE') {
      return balance === 0;
    }
    if (customerFilter === 'WITH_CONTACT') {
      return Boolean(customer.phone || customer.email);
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (customerSort === 'HIGHEST_AMOUNT') {
      return Math.abs(Number(b.totalBalance || 0)) - Math.abs(Number(a.totalBalance || 0));
    }
    if (customerSort === 'LEAST_AMOUNT') {
      return Math.abs(Number(a.totalBalance || 0)) - Math.abs(Number(b.totalBalance || 0));
    }
    if (customerSort === 'BY_NAME') {
      return a.name.localeCompare(b.name);
    }

    const aTime = safeTime(a.lastTransactionAt || a.updatedAt || a.createdAt);
    const bTime = safeTime(b.lastTransactionAt || b.updatedAt || b.createdAt);

    if (customerSort === 'MOST_RECENT') {
      return bTime - aTime;
    }

    return aTime - bTime;
  });
};

export const computeTotals = (customers: Customer[]): { toCollect: number; toPay: number } => {
  return customers.reduce(
    (acc, customer) => {
      const balance = Number(customer.totalBalance || 0);
      if (balance >= 0) acc.toCollect += balance;
      else acc.toPay += Math.abs(balance);
      return acc;
    },
    { toCollect: 0, toPay: 0 }
  );
};

export const countOverdueCustomers = (customers: Customer[]): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return customers.filter((customer) => {
    if (!customer.dueDate) return false;
    const due = new Date(`${customer.dueDate}T00:00:00`);
    return due.getTime() < now.getTime();
  }).length;
};

export const buildDueDateReport = ({
  customers,
  reportSearchTerm,
  reportDueFilter,
  reportSortField,
}: {
  customers: Customer[];
  reportSearchTerm: string;
  reportDueFilter: 'ALL' | 'OVERDUE' | 'UPCOMING_7_DAYS' | 'NO_DUE_DATE';
  reportSortField: 'NAME' | 'BALANCE' | 'DUE_DATE';
}): Customer[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const next7 = new Date(now);
  next7.setDate(now.getDate() + 7);

  const query = reportSearchTerm.trim().toLowerCase();

  const filtered = customers.filter((customer) => {
    if (query) {
      const searchable = [
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
        customer.gstNumber,
        customer.dueDate,
        customer.totalBalance == null ? '' : String(customer.totalBalance),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(query)) {
        return false;
      }
    }

    const due = customer.dueDate ? new Date(`${customer.dueDate}T00:00:00`) : null;
    if (reportDueFilter === 'OVERDUE') {
      return Boolean(due && due.getTime() < now.getTime());
    }
    if (reportDueFilter === 'UPCOMING_7_DAYS') {
      return Boolean(due && due.getTime() >= now.getTime() && due.getTime() <= next7.getTime());
    }
    if (reportDueFilter === 'NO_DUE_DATE') {
      return !due;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (reportSortField === 'NAME') {
      return a.name.localeCompare(b.name);
    }

    if (reportSortField === 'DUE_DATE') {
      const aDue = a.dueDate ? new Date(`${a.dueDate}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate ? new Date(`${b.dueDate}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    }

    return Math.abs(Number(b.totalBalance || 0)) - Math.abs(Number(a.totalBalance || 0));
  });
};
