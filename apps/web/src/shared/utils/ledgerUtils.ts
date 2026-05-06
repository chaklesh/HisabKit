export const today = () => new Date().toISOString().slice(0, 10);

export const monthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export const lastMonthStart = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export const lastMonthEnd = () => {
  const d = new Date();
  d.setDate(0);
  return d.toISOString().slice(0, 10);
};

export const quarterStart = () => {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3);
  d.setMonth(q * 3);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export const csvCell = (value: string | number) => `"${String(value ?? "").replace(/"/g, '""')}"`;
