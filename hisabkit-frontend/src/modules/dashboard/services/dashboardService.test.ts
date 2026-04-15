import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/api/client', () => ({
  default: { get: vi.fn() },
}));

import dashboardService from './dashboardService';
import api from '@/shared/api/client';

describe('dashboardService', () => {
  beforeEach(() => {
    (api.get as any).mockReset?.();
  });

  it('fetchCustomers returns array when API responds with list', async () => {
    (api.get as any).mockResolvedValue({ data: [{ id: 'c1', totalBalance: 100 }] });
    const res = await dashboardService.fetchCustomers();
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].id).toBe('c1');
  });
});
