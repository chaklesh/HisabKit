import type { Tenant, UserProfile } from '@/shared/types';

export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
};

export const createEmptyProfile = (): UserProfile => ({
  username: '',
  role: '',
  fullName: '',
  email: '',
  mobile: '',
  avatarUrl: '',
});

export const createEmptyTenant = (): Tenant => ({
  id: '',
  name: '',
  slug: '',
});

export const createEmptyPasswordForm = (): PasswordFormState => ({
  currentPassword: '',
  newPassword: '',
});

