import api from '@/shared/api/client';

async function listTenants() {
  return api.get('/admin/tenants');
}

async function listTenantCustomers(tenantId: string) {
  return api.get(`/admin/customers?tenantId=${tenantId}`);
}

async function listTenantTransactions(tenantId: string) {
  return api.get(`/admin/transactions?tenantId=${tenantId}`);
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
  return api.post(`/admin/customers?tenantId=${tenantId}`, payload);
}

async function updateTenantCustomer(tenantId: string, customerId: string, payload: unknown) {
  return api.put(`/admin/customers/${customerId}?tenantId=${tenantId}`, payload);
}

async function deleteTenantCustomer(tenantId: string, customerId: string) {
  return api.delete(`/admin/customers/${customerId}?tenantId=${tenantId}`);
}

async function createTenantTransaction(tenantId: string, payload: any, attachment?: File | null) {
  const url = `/admin/transactions?tenantId=${tenantId}`;
  if (attachment) {
    const formData = new FormData();
    formData.append('transaction', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    formData.append('attachment', attachment);
    return api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post(url, payload);
}

async function updateTenantTransaction(tenantId: string, transactionId: string, payload: any, attachment?: File | null) {
  const url = `/admin/transactions/${transactionId}?tenantId=${tenantId}`;
  if (attachment) {
    const formData = new FormData();
    formData.append('transaction', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    formData.append('attachment', attachment);
    return api.put(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(url, payload);
}

async function deleteTenantTransaction(tenantId: string, transactionId: string) {
  return api.delete(`/admin/transactions/${transactionId}?tenantId=${tenantId}`);
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
