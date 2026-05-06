import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../../shared/api/apiClient";
import { STORAGE_KEYS, cacheGet, cacheSet, enqueue } from "../../../shared/services/offlineService";
import { createCustomer, fetchCustomers, fetchSummary, fetchTransactions } from "./ledgerService";

// Mock the dependencies
vi.mock("../../../shared/api/apiClient", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../shared/services/offlineService", () => ({
  STORAGE_KEYS: {
    CUSTOMERS: "customers",
    TRANSACTIONS_PREFIX: "txns_",
    SUMMARY: "summary",
  },
  cacheGet: vi.fn(),
  cacheSet: vi.fn(),
  enqueue: vi.fn(),
}));

describe("ledgerService (Mobile)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchCustomers", () => {
    it("should fetch customers from api and cache them", async () => {
      const mockCustomers = [{ id: "1", name: "John Doe" }];
      vi.mocked(api.get).mockResolvedValue({ data: mockCustomers });

      const result = await fetchCustomers();

      expect(api.get).toHaveBeenCalledWith("/ledger/customers");
      expect(cacheSet).toHaveBeenCalledWith(STORAGE_KEYS.CUSTOMERS, mockCustomers);
      expect(result).toEqual(mockCustomers);
    });

    it("should return cached customers if api fails", async () => {
      const mockCached = [{ id: "2", name: "Cached User" }];
      vi.mocked(api.get).mockRejectedValue(new Error("Network Error"));
      vi.mocked(cacheGet).mockResolvedValue(mockCached);

      const result = await fetchCustomers();

      expect(result).toEqual(mockCached);
      expect(cacheGet).toHaveBeenCalledWith(STORAGE_KEYS.CUSTOMERS);
    });
  });

  describe("createCustomer", () => {
    it("should post new customer to api", async () => {
      const newCustomer = { name: "New Cust" };
      const savedCustomer = { id: "3", ...newCustomer };
      vi.mocked(api.post).mockResolvedValue({ data: savedCustomer });

      const result = await createCustomer(newCustomer);

      expect(api.post).toHaveBeenCalledWith("/ledger/customers", newCustomer);
      expect(result).toEqual(savedCustomer);
    });

    it("should queue operation if offline", async () => {
      const newCustomer = { name: "Offline Cust" };
      const offlineError = { code: "ECONNABORTED", isAxiosError: true };
      vi.mocked(api.post).mockRejectedValue(offlineError);

      await expect(createCustomer(newCustomer)).rejects.toThrow("OFFLINE_QUEUED");
      expect(enqueue).toHaveBeenCalledWith({
        type: "CREATE_CUSTOMER",
        payload: newCustomer,
      });
    });
  });

  describe("fetchTransactions", () => {
    it("should fetch transactions for a specific customer", async () => {
      const customerId = "cust_123";
      const mockTxns = [{ id: "t1", totalAmount: 100 }];
      vi.mocked(api.get).mockResolvedValue({ data: mockTxns });

      const result = await fetchTransactions(customerId);

      expect(api.get).toHaveBeenCalledWith(`/ledger/customers/${customerId}/transactions`);
      expect(result).toEqual(mockTxns);
    });
  });

  describe("fetchSummary", () => {
    it("should fetch overall ledger summary", async () => {
      const mockSummary = { toCollect: 5000, toPay: 1000 };
      vi.mocked(api.get).mockResolvedValue({ data: mockSummary });

      const result = await fetchSummary();

      expect(api.get).toHaveBeenCalledWith("/ledger/summary");
      expect(result).toEqual(mockSummary);
    });
  });
});
