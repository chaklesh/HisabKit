import api from '@/shared/api/client';

async function fetchCustomers() {
  const res = await api.get('/ledger/customers');
  return Array.isArray(res.data) ? res.data : [];
}

export default {
  fetchCustomers,
};
