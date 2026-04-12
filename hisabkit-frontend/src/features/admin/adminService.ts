import api from '../../api/api';

async function listTenants() {
  return api.get('/tenants');
}

async function listTenantCustomers(tenantId: string) {
  return api.get(`/tenants/${tenantId}/customers`);
}

async function listTenantTransactions(tenantId: string) {
  return api.get(`/tenants/${tenantId}/transactions`);
}

async function createTenant(payload: unknown) {
  return api.post('/tenants', payload);
}

async function updateTenant(id: string, payload: unknown) {
  return api.put(`/tenants/${id}`, payload);
}

async function deleteTenant(id: string) {
  return api.delete(`/tenants/${id}`);
}

async function createTenantCustomer(tenantId: string, payload: unknown) {
  return api.post(`/tenants/${tenantId}/customers`, payload);
}

async function updateTenantCustomer(tenantId: string, customerId: string, payload: unknown) {
  return api.put(`/tenants/${tenantId}/customers/${customerId}`, payload);
}

async function deleteTenantCustomer(tenantId: string, customerId: string) {
  return api.delete(`/tenants/${tenantId}/customers/${customerId}`);
}

async function createTenantTransaction(tenantId: string, payload: unknown) {
  return api.post(`/tenants/${tenantId}/transactions`, payload);
}

async function updateTenantTransaction(tenantId: string, transactionId: string, payload: unknown) {
  return api.put(`/tenants/${tenantId}/transactions/${transactionId}`, payload);
}

async function deleteTenantTransaction(tenantId: string, transactionId: string) {
  return api.delete(`/tenants/${tenantId}/transactions/${transactionId}`);
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
};
