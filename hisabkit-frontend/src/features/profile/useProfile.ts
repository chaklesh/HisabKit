import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tenant, UserProfile } from '../../shared/types/domain';
import type { AxiosResponse } from 'axios';
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  changeMyPassword,
  getTenantProfile,
  updateTenantProfile,
} from '../../api/api';

export const PROFILE_QUERY_KEY = ['profile'] as const;
export const TENANT_PROFILE_QUERY_KEY = ['tenantProfile'] as const;

export function useProfileQuery() {
  return useQuery<UserProfile, Error>({
    queryKey: PROFILE_QUERY_KEY as unknown as readonly unknown[],
    queryFn: async () => {
      const res: AxiosResponse<UserProfile> = await getMyProfile();
      return res.data;
    },
  });
}

export function useTenantProfileQuery() {
  return useQuery<Tenant, Error>({
    queryKey: TENANT_PROFILE_QUERY_KEY as unknown as readonly unknown[],
    queryFn: async () => {
      const res: AxiosResponse<Tenant> = await getTenantProfile();
      return res.data;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<AxiosResponse<UserProfile>, Error, Partial<UserProfile>, unknown>({
    mutationFn: (payload: Partial<UserProfile>) => updateMyProfile(payload as any),
    onSuccess: (res: AxiosResponse<UserProfile>) => {
      qc.setQueryData(PROFILE_QUERY_KEY, res.data as UserProfile);
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation<AxiosResponse<any>, Error, File, unknown>({
    mutationFn: (file: File) => uploadMyAvatar(file),
    onSuccess: (res: AxiosResponse<any>) => {
      const data = (res.data || {}) as Partial<UserProfile>;
      if (data.avatarUrl) {
        qc.setQueryData(PROFILE_QUERY_KEY, (prev: UserProfile | undefined) => ({ ...(prev || ({} as UserProfile)), avatarUrl: data.avatarUrl }));
      }
    },
  });
}

export function useChangePassword() {
  return useMutation<AxiosResponse<any>, Error, { currentPassword: string; newPassword: string }, unknown>({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => changeMyPassword(payload as any),
  });
}

export function useUpdateTenantProfile() {
  const qc = useQueryClient();
  return useMutation<AxiosResponse<Tenant>, Error, Partial<Tenant>, unknown>({
    mutationFn: (payload: Partial<Tenant>) => updateTenantProfile(payload as any),
    onSuccess: (res: AxiosResponse<Tenant>) => {
      qc.setQueryData(TENANT_PROFILE_QUERY_KEY, res.data as Tenant);
    },
  });
}

export default null;
