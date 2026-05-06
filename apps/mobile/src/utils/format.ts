const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return `₹${currencyFormatter.format(Number.isFinite(amount) ? amount : 0)}`;
}

export function formatCompactNumber(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}
export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (_e) {
    return "";
  }
}
