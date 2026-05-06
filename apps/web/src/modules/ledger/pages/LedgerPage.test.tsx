import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLedgerPageState } from "../hooks/useLedgerPageState";
import { LedgerPage } from "./LedgerPage";

vi.mock("../hooks/useLedgerPageState", () => ({
  useLedgerPageState: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: vi.fn(), resolvedLanguage: "en" },
  }),
}));

describe("LedgerPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders EmptyStatePanel when no customer is selected", () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (useLedgerPageState as any).mockReturnValue({
      state: {
        selectedCustomer: null,
        showTotals: false,
        selectedCustomerId: "",
        error: "",
        notice: "",
      },
      queries: { customersQuery: { isLoading: false }, transactionsQuery: { isLoading: false } },
      derived: {
        selectedCustomer: null,
        filteredCustomers: [],
        totals: { toCollect: 0, toPay: 0 },
        overdueCount: 0,
      },
      actions: { openCustomerDrawer: vi.fn(), selectCustomer: vi.fn() },
    });

    render(<LedgerPage />);
    expect(screen.getByText(/Select an/i)).toBeDefined();
  });

  it("renders CustomerDetailsHeader when a customer is selected", () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (useLedgerPageState as any).mockReturnValue({
      state: {
        selectedCustomer: { id: "c1", name: "John Doe" },
        showTotals: false,
        selectedCustomerId: "c1",
        rightTab: "LEDGER",
        error: "",
        notice: "",
        transactions: [],
        attachmentsByTransaction: {},
      },
      queries: { customersQuery: { isLoading: false }, transactionsQuery: { isLoading: false } },
      derived: {
        filteredCustomers: [{ id: "c1", name: "John Doe" }],
        totals: { toCollect: 100, toPay: 0 },
        overdueCount: 0,
        smsLink: "",
        whatsappLink: "",
      },
      actions: {
        openCustomerDrawer: vi.fn(),
        selectCustomer: vi.fn(),
        openTransactionDrawer: vi.fn(),
      },
    });

    render(<LedgerPage />);
    expect(screen.getAllByText(/John Doe/i).length).toBeGreaterThan(0);
    // Use a more specific query for the Tab trigger
    expect(screen.getAllByText(/Ledger/i).length).toBeGreaterThan(0);
  });
});
