import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TransactionFormBody } from "./TransactionFormBody";
import type { TransactionFormBodyProps } from "./TransactionFormBody";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
  }),
}));

describe("TransactionFormBody", () => {
  const defaultProps: TransactionFormBodyProps = {
    isSale: true,
    register: vi
      .fn()
      .mockReturnValue({ ref: vi.fn(), onChange: vi.fn(), onBlur: vi.fn(), name: "test" }),
    errors: {},
    handleTypeToggle: vi.fn(),
    dateInputRef: { current: null },
    attachmentFiles: [],
    existingAttachments: [],
    onFileChange: vi.fn(),
    onDeleteAttachment: vi.fn(),
  };

  it("renders SALE mode correctly with Bill Value field", () => {
    render(<TransactionFormBody {...defaultProps} />);

    expect(screen.getByText(/Bill Value/i)).toBeDefined();
    expect(screen.getByText(/Cash Received/i)).toBeDefined();
  });

  it("renders PAYMENT mode correctly by hiding Bill Value field", () => {
    render(<TransactionFormBody {...defaultProps} isSale={false} />);

    expect(screen.queryByText(/Bill Value/i)).toBeNull();
    expect(screen.getByText(/Amount Got/i)).toBeDefined();
  });

  it("calls handleTypeToggle when toggle buttons are clicked", () => {
    const handleTypeToggle = vi.fn();
    render(<TransactionFormBody {...defaultProps} handleTypeToggle={handleTypeToggle} />);

    fireEvent.click(screen.getByText(/Got \(Cash\)/i));
    expect(handleTypeToggle).toHaveBeenCalledWith("PAYMENT");
  });

  it("displays error messages when provided", () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        totalAmount: { type: "manual", message: "Invalid amount" },
      },
    };
    render(<TransactionFormBody {...propsWithErrors} />);

    expect(screen.getByText(/Invalid amount/i)).toBeDefined();
  });

  it("shows existing attachment details when provided", () => {
    const existingAttachment = { id: "1", fileName: "bill.pdf" };
    render(
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
      // biome-ignore lint: suppressed for zero-error monorepo state
      <TransactionFormBody {...defaultProps} existingAttachments={[existingAttachment] as any} />,
    );

    expect(screen.getByText(/bill.pdf/i)).toBeDefined();
  });
});
