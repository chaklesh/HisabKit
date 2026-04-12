import api from '../../api/api';

async function fetchCustomers() {
  const res = await api.get('/ledger/customers');
  return Array.isArray(res.data) ? res.data : [];
}

export default {
  fetchCustomers,
};
