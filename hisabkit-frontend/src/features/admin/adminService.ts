import api from '@/shared/api/client';

async function listTenants() {
  return api.get('/admin/tenants');
}

async function listTenantCustomers(tenantId: string) {
  return api.get('/admin/customers', { params: { tenantId } });
}

async function listTenantTransactions(tenantId: string, customerId?: string) {
  return api.get('/admin/transactions', { params: { tenantId, customerId } });
}

async function createTenant(payload: unknown) {
  return api.post('/admin/tenants', payload);
}

async function updateTenant(id: string, payload: unknown) {
  return api.put(`/admin/tenants/${id}`, payload);
}

async function deleteTenant(id: string) {
  return api.delete(`/admin/tenants/${id}`);
}

async function createTenantCustomer(tenantId: string, payload: unknown) {
  return api.post('/admin/customers', payload, { params: { tenantId } });
}

async function updateTenantCustomer(tenantId: string, customerId: string, payload: unknown) {
  return api.put(`/admin/customers/${customerId}`, payload, { params: { tenantId } });
}

async function deleteTenantCustomer(tenantId: string, customerId: string) {
  return api.delete(`/admin/customers/${customerId}`, { params: { tenantId } });
}

async function createTenantTransaction(tenantId: string, payload: unknown) {
  return api.post('/admin/transactions', payload, { params: { tenantId } });
}

async function updateTenantTransaction(tenantId: string, transactionId: string, payload: unknown) {
  return api.put(`/admin/transactions/${transactionId}`, payload, { params: { tenantId } });
}

async function deleteTenantTransaction(tenantId: string, transactionId: string) {
  return api.delete(`/admin/transactions/${transactionId}`, { params: { tenantId } });
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
