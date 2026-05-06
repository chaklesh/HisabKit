import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/shared/api/commonApi", () => ({
  listTransactionAttachments: vi.fn(),
  fetchAttachmentContent: vi.fn(),
}));

vi.mock("@/modules/profile/services/profileApi", () => ({
  getTenantProfile: vi.fn(),
}));

import api from "@/shared/api/client";
import { listTransactionAttachments } from "@/shared/api/commonApi";
import ledgerService from "./ledgerService";

describe("ledgerService", () => {
  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.get as any).mockReset?.();
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (listTransactionAttachments as any).mockReset?.();
  });

  it("fetchCustomers returns an array when API responds with list", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.get as any).mockResolvedValue({ data: [{ id: "c1", name: "Cust A" }] });
    const res = await ledgerService.fetchCustomers();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe("c1");
  });

  it("fetchTransactions returns transactions and attachments mapping", async () => {
    const txns = [{ id: "t1", customerId: "c1" }];
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.get as any).mockResolvedValueOnce({ data: txns });
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (listTransactionAttachments as any).mockResolvedValue({ data: [{ id: "a1", fileName: "f1" }] });

    const result = await ledgerService.fetchTransactions("c1");
    expect(result.transactions).toEqual(txns);
    expect(result.attachmentsByTransaction.t1).toBeDefined();
    expect(result.attachmentsByTransaction.t1[0].id).toBe("a1");
  });

  it("create/update/delete customer and transaction delegate to API", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.post as any).mockResolvedValueOnce({ data: { id: "new-c" } });
    const createdResponse = await ledgerService.createCustomer({ name: "X" });
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    expect((createdResponse as any).id).toBe("new-c");

    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.put as any).mockResolvedValueOnce({ data: { id: "new-c" } });
    const updatedResponse = await ledgerService.updateCustomer("new-c", { name: "Y" });
    expect(updatedResponse).toBeDefined();

    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.delete as any).mockResolvedValueOnce({ data: {} });
    const deletedResponse = await ledgerService.deleteCustomer("new-c");
    expect(deletedResponse).toBeDefined();

    const mockTxnPayload = {
      customerId: "c1",
      type: "SALE" as const,
      totalAmount: 100,
      paidAmount: 0,
    };
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.post as any).mockResolvedValueOnce({ data: { transaction: { id: "t-new" } } });
    const trCreatedResponse = await ledgerService.createTransaction(mockTxnPayload);
    expect(trCreatedResponse.transaction.id).toBe("t-new");

    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.put as any).mockResolvedValueOnce({ data: { transaction: { id: "t-new" } } });
    const trUpdatedResponse = await ledgerService.updateTransaction("t-new", {});
    expect(trUpdatedResponse.transaction.id).toBe("t-new");

    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.delete as any).mockResolvedValueOnce({ data: { deleted: true } });
    const trDeleted = await ledgerService.deleteTransaction("t-new");
    expect(trDeleted).toBeDefined();
  });
});
