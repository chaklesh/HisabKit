import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import profileService from './profileService';
import api from '../../api/api';

describe('profileService', () => {
  beforeEach(() => {
    (api.get as any).mockReset?.();
    (api.put as any).mockReset?.();
    (api.post as any).mockReset?.();
  });

  it('getMyProfile and getTenantProfile delegate to api.get', async () => {
    (api.get as any).mockResolvedValueOnce({ data: { username: 'u1' } });
    const res = await profileService.getMyProfile();
    expect(res.data.username).toBe('u1');

    (api.get as any).mockResolvedValueOnce({ data: { id: 't1', name: 'T1' } });
    const tres = await profileService.getTenantProfile();
    expect(tres.data.id).toBe('t1');
  });

  it('updateMyProfile, changeMyPassword, updateTenantProfile delegate', async () => {
    (api.put as any).mockResolvedValueOnce({ data: { username: 'u1' } });
    const ures = await profileService.updateMyProfile({});
    expect(ures.data.username).toBe('u1');

    (api.post as any).mockResolvedValueOnce({ data: {} });
    const pres = await profileService.changeMyPassword({});
    expect(pres).toBeDefined();

    (api.put as any).mockResolvedValueOnce({ data: { id: 't1' } });
    const tures = await profileService.updateTenantProfile({});
    expect(tures.data.id).toBe('t1');
  });
});
