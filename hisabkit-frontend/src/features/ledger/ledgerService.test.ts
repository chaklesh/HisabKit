import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/api', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
    listTransactionAttachments: vi.fn(),
    fetchAttachmentContent: vi.fn(),
    getTenantProfile: vi.fn(),
  };
});

import ledgerService from './ledgerService';
import api, { listTransactionAttachments } from '../../api/api';

describe('ledgerService', () => {
  beforeEach(() => {
    (api.get as any).mockReset?.();
    (listTransactionAttachments as any).mockReset?.();
  });

  it('fetchCustomers returns an array when API responds with list', async () => {
    (api.get as any).mockResolvedValue({ data: [{ id: 'c1', name: 'Cust A' }] });
    const res = await ledgerService.fetchCustomers();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe('c1');
  });

  it('fetchTransactions returns transactions and attachments mapping', async () => {
    const txns = [{ id: 't1', customerId: 'c1' }];
    (api.get as any).mockResolvedValueOnce({ data: txns });
    (listTransactionAttachments as any).mockResolvedValue({ data: [{ id: 'a1', fileName: 'f1' }] });

    const result = await ledgerService.fetchTransactions('c1');
    expect(result.transactions).toEqual(txns);
    expect(result.attachmentsByTransaction['t1']).toBeDefined();
    expect(result.attachmentsByTransaction['t1'][0].id).toBe('a1');
  });
  
  it('create/update/delete customer and transaction delegate to API', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: 'new-c' } });
    const created = await ledgerService.createCustomer({ name: 'X' });
    expect(created.id).toBe('new-c');

    (api.put as any).mockResolvedValueOnce({ data: { id: 'new-c' } });
    const updated = await ledgerService.updateCustomer('new-c', { name: 'Y' });
    expect(updated).toBeDefined();

    (api.delete as any).mockResolvedValueOnce({ data: {} });
    const deleted = await ledgerService.deleteCustomer('new-c');
    expect(deleted).toBeDefined();

    (api.post as any).mockResolvedValueOnce({ data: { transaction: { id: 't-new' } } });
    const trCreated = await ledgerService.createTransaction({});
    expect(trCreated.transaction.id).toBe('t-new');

    (api.put as any).mockResolvedValueOnce({ data: { transaction: { id: 't-new' } } });
    const trUpdated = await ledgerService.updateTransaction('t-new', {});
    expect(trUpdated.transaction.id).toBe('t-new');

    (api.delete as any).mockResolvedValueOnce({ data: {} });
    const trDeleted = await ledgerService.deleteTransaction('t-new');
    expect(trDeleted).toBeDefined();
  });
});
