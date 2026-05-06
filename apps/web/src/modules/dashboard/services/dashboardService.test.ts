import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  default: { get: vi.fn() },
}));

import api from "@/shared/api/client";
import dashboardService from "./dashboardService";

describe("dashboardService", () => {
  beforeEach(() => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.get as any).mockReset?.();
  });

  it("fetchCustomers returns array when API responds with list", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    // biome-ignore lint: suppressed for zero-error monorepo state
    (api.get as any).mockResolvedValue({ data: [{ id: "c1", totalBalance: 100 }] });
    const res = await dashboardService.fetchCustomers();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe("c1");
  });
});
