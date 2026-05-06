import * as ledgerApi from "@/modules/ledger/services/ledgerApi";

async function fetchCustomers() {
  const res = await ledgerApi.listCustomers();
  return Array.isArray(res.data) ? res.data : [];
}

export default {
  fetchCustomers,
};
