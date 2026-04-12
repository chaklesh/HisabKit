import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import adminService from './adminService';
import api from '../../api/api';

describe('adminService', () => {
  beforeEach(() => {
    (api.get as any).mockReset?.();
    (api.post as any).mockReset?.();
    (api.put as any).mockReset?.();
    (api.delete as any).mockReset?.();
  });

  it('listTenants returns tenants response', async () => {
    (api.get as any).mockResolvedValue({ data: [{ id: 't1', name: 'T1' }] });
    const res = await adminService.listTenants();
    expect((api.get as any).mock.calls.length).toBeGreaterThan(0);
    expect(res.data[0].id).toBe('t1');
  });

  it('create/update/delete tenant and related resources delegate to api', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { id: 't-new' } });
    const created = await adminService.createTenant({ name: 'X' });
    expect(created.data.id).toBe('t-new');

    (api.put as any).mockResolvedValueOnce({ data: {} });
    const updated = await adminService.updateTenant('t-new', {});
    expect(updated).toBeDefined();

    (api.delete as any).mockResolvedValueOnce({ data: {} });
    const deleted = await adminService.deleteTenant('t-new');
    expect(deleted).toBeDefined();
  });
});
