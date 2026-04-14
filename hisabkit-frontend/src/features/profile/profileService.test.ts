import { describe, it, expect, vi, beforeEach } from 'vitest';

const apiMocks = vi.hoisted(() => ({
  getMyProfile: vi.fn(),
  updateMyProfile: vi.fn(),
  changeMyPassword: vi.fn(),
  uploadMyAvatar: vi.fn(),
  getTenantProfile: vi.fn(),
  updateTenantProfile: vi.fn(),
}));

vi.mock('../../api/api', () => ({
  getMyProfile: apiMocks.getMyProfile,
  updateMyProfile: apiMocks.updateMyProfile,
  changeMyPassword: apiMocks.changeMyPassword,
  uploadMyAvatar: apiMocks.uploadMyAvatar,
  getTenantProfile: apiMocks.getTenantProfile,
  updateTenantProfile: apiMocks.updateTenantProfile,
}));

import profileService from './profileService';

describe('profileService', () => {
  beforeEach(() => {
    apiMocks.getMyProfile.mockReset();
    apiMocks.updateMyProfile.mockReset();
    apiMocks.changeMyPassword.mockReset();
    apiMocks.uploadMyAvatar.mockReset();
    apiMocks.getTenantProfile.mockReset();
    apiMocks.updateTenantProfile.mockReset();
  });

  it('getMyProfile and getTenantProfile delegate to named api helpers', async () => {
    apiMocks.getMyProfile.mockResolvedValueOnce({ data: { username: 'u1' } });
    const res = await profileService.getMyProfile();
    expect(res.data.username).toBe('u1');
    expect(apiMocks.getMyProfile).toHaveBeenCalledTimes(1);

    apiMocks.getTenantProfile.mockResolvedValueOnce({ data: { id: 't1', name: 'T1' } });
    const tres = await profileService.getTenantProfile();
    expect(tres.data.id).toBe('t1');
    expect(apiMocks.getTenantProfile).toHaveBeenCalledTimes(1);
  });

  it('updateMyProfile, changeMyPassword, updateTenantProfile delegate', async () => {
    apiMocks.updateMyProfile.mockResolvedValueOnce({ data: { username: 'u1' } });
    const ures = await profileService.updateMyProfile({});
    expect(ures.data.username).toBe('u1');
    expect(apiMocks.updateMyProfile).toHaveBeenCalledTimes(1);

    apiMocks.changeMyPassword.mockResolvedValueOnce({ data: {} });
    const pres = await profileService.changeMyPassword({});
    expect(pres).toBeDefined();
    expect(apiMocks.changeMyPassword).toHaveBeenCalledTimes(1);

    apiMocks.updateTenantProfile.mockResolvedValueOnce({ data: { id: 't1' } });
    const tures = await profileService.updateTenantProfile({});
    expect(tures.data.id).toBe('t1');
    expect(apiMocks.updateTenantProfile).toHaveBeenCalledTimes(1);
  });
});
