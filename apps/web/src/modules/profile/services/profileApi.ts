import api from "@/shared/api/client";
import type { Tenant, UserProfile } from "@/shared/types";

export const getMyProfile = () => api.get<UserProfile>("/profile");
export const updateMyProfile = (payload: {
  fullName?: string;
  email?: string;
  mobile?: string;
  avatarUrl?: string;
}) => api.put<UserProfile>("/profile", payload);

export const changeMyPassword = (payload: {
  currentPassword: string;
  newPassword: string;
}) => api.put("/profile/password", payload);

export const uploadMyAvatar = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post<UserProfile>("/profile/avatar", form);
};

export const getTenantProfile = () => api.get<Tenant>("/profile/tenant");
export const updateTenantProfile = (payload: Partial<Tenant>) =>
  api.put<Tenant>("/profile/tenant", payload);
