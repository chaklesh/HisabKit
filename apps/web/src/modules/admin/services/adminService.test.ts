import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "@/shared/api/client";
import adminService from "./adminService";

describe("adminService", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
    vi.mocked(api.put).mockReset();
    vi.mocked(api.delete).mockReset();
  });

  it("listTenants returns tenants response", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [{ id: "t1", name: "T1" }] });
    const res = await adminService.listTenants();
    expect(vi.mocked(api.get).mock.calls.length).toBeGreaterThan(0);
    expect(res.data[0].id).toBe("t1");
  });

  it("create/update/delete tenant and related resources delegate to api", async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: "t-new" } });
    const created = await adminService.createTenant({
      name: "X",
      slug: "x",
      adminUsername: "admin",
      adminPassword: "pwd",
    });
    expect(created.data.id).toBe("t-new");

    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });
    const updated = await adminService.updateTenant("t-new", { name: "Y" });
    expect(updated).toBeDefined();

    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });
    const deleted = await adminService.deleteTenant("t-new");
    expect(deleted).toBeDefined();
  });
});
