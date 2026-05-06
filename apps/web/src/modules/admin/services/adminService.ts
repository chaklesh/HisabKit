import api from "@/shared/api/client";
import * as adminApi from "./adminApi";
import type {
  CreateTenantPayload,
  CustomerMutationPayload,
  TransactionMutationPayload,
  UpdateTenantPayload,
} from "./adminApi";

async function listTenants() {
  return adminApi.listTenants();
}

async function listTenantCustomers(tenantId: string) {
  return adminApi.listTenantCustomers(tenantId);
}

async function listTenantTransactions(tenantId: string, customerId?: string) {
  return adminApi.listTenantTransactions(tenantId, customerId);
}

async function createTenant(payload: CreateTenantPayload) {
  return adminApi.createTenant(payload);
}

async function updateTenant(id: string, payload: UpdateTenantPayload) {
  return adminApi.updateTenant(id, payload);
}

async function deleteTenant(id: string) {
  return adminApi.deleteTenant(id);
}

async function createTenantCustomer(tenantId: string, payload: CustomerMutationPayload) {
  return adminApi.createTenantCustomer(tenantId, payload);
}

async function updateTenantCustomer(
  tenantId: string,
  customerId: string,
  payload: CustomerMutationPayload,
) {
  return adminApi.updateTenantCustomer(tenantId, customerId, payload);
}

async function deleteTenantCustomer(tenantId: string, customerId: string) {
  return adminApi.deleteTenantCustomer(tenantId, customerId);
}

async function createTenantTransaction(
  tenantId: string,
  payload: TransactionMutationPayload,
  attachment?: File | null,
) {
  if (attachment) {
    const url = `/admin/transactions?tenantId=${encodeURIComponent(tenantId)}`;
    const formData = new FormData();
    formData.append(
      "transaction",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    formData.append("attachment", attachment);
    return api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return adminApi.createTenantTransaction(tenantId, payload);
}

async function updateTenantTransaction(
  tenantId: string,
  transactionId: string,
  payload: TransactionMutationPayload,
  attachment?: File | null,
) {
  if (attachment) {
    const url = `/admin/transactions/${transactionId}?tenantId=${encodeURIComponent(tenantId)}`;
    const formData = new FormData();
    formData.append(
      "transaction",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );
    formData.append("attachment", attachment);
    return api.put(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return adminApi.updateTenantTransaction(tenantId, transactionId, payload);
}

async function deleteTenantTransaction(tenantId: string, transactionId: string) {
  return adminApi.deleteTenantTransaction(tenantId, transactionId);
}

export default {
  listTenants,
  listTenantCustomers,
  listTenantTransactions,
  createTenant,
  updateTenant,
  deleteTenant,
  createTenantCustomer,
  updateTenantCustomer,
  deleteTenantCustomer,
  createTenantTransaction,
  updateTenantTransaction,
  deleteTenantTransaction,
  listAuditLogs: adminApi.listAuditLogs,
  listTenantAuditLogs: adminApi.listTenantAuditLogs,
};
