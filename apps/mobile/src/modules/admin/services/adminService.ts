import type { LedgerTransaction, Tenant } from "@hisabkit/types";
import { api } from "../../../shared/api/apiClient";

export const adminService = {
  /**
   * List all registered shops (tenants)
   */
  listTenants: async (): Promise<Tenant[]> => {
    const res = await api.get("/admin/tenants");
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Get system-wide transaction history (last N records)
   */
  listGlobalHistory: async (): Promise<LedgerTransaction[]> => {
    const res = await api.get("/admin/transactions");
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * Get tenant-specific customers (for auditing)
   */
  listTenantCustomers: async (tenantId: string): Promise<any[]> => {
    const res = await api.get(`/admin/tenants/${tenantId}/customers`);
    return Array.isArray(res.data) ? res.data : [];
  },
};

export default adminService;
