import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tenant, UserProfile } from '../../shared/types/domain';
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  changeMyPassword,
  getTenantProfile,
  updateTenantProfile,
} from '../../api/api';

export const PROFILE_QUERY_KEY = ['profile'];
export const TENANT_PROFILE_QUERY_KEY = ['tenantProfile'];

export function useProfileQuery() {
  return useQuery(PROFILE_QUERY_KEY, async () => {
    const res = await getMyProfile();
    return res.data as UserProfile;
  });
}

export function useTenantProfileQuery() {
  return useQuery(TENANT_PROFILE_QUERY_KEY, async () => {
    const res = await getTenantProfile();
    return res.data as Tenant;
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation((payload: Partial<UserProfile>) => updateMyProfile(payload), {
    onSuccess: (res) => {
      qc.setQueryData(PROFILE_QUERY_KEY, res.data as UserProfile);
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation((file: File) => uploadMyAvatar(file), {
    onSuccess: (res) => {
      // update cached profile with returned avatarUrl when available
      const data = (res.data || {}) as Partial<UserProfile>;
      if (data.avatarUrl) {
        qc.setQueryData(PROFILE_QUERY_KEY, (prev: any) => ({ ...(prev || {}), avatarUrl: data.avatarUrl }));
      }
    },
  });
}

export function useChangePassword() {
  return useMutation((payload: { currentPassword: string; newPassword: string }) => changeMyPassword(payload));
}

export function useUpdateTenantProfile() {
  const qc = useQueryClient();
  return useMutation((payload: Partial<Tenant>) => updateTenantProfile(payload as any), {
    onSuccess: (res) => {
      qc.setQueryData(TENANT_PROFILE_QUERY_KEY, res.data as Tenant);
    },
  });
}

export default null;
