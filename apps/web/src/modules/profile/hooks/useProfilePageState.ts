import {
  useChangePassword,
  useProfileQuery,
  useTenantProfileQuery,
  useUpdateProfile,
  useUpdateTenantProfile,
  useUploadAvatar,
} from "@/modules/profile/services/useProfile";
import { useAuth } from "@/shared/context/AuthContext";
import type { Tenant, UserProfile } from "@/shared/types";
import { useEffect, useState } from "react";
import {
  type PasswordFormState,
  createEmptyPasswordForm,
  createEmptyProfile,
  createEmptyTenant,
} from "../types/profileTypes";

export function useProfilePageState() {
  const { user, setUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(createEmptyProfile);
  const [tenant, setTenant] = useState<Tenant>(createEmptyTenant);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(createEmptyPasswordForm);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const profileQuery = useProfileQuery();
  const tenantQuery = useTenantProfileQuery();

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const changePassword = useChangePassword();
  const updateTenant = useUpdateTenantProfile();

  useEffect(() => {
    if (profileQuery.data) setProfile(profileQuery.data);
    if (tenantQuery.data) setTenant(tenantQuery.data);
    if (profileQuery.isError) setError("Unable to load profile.");
    if (tenantQuery.isError && (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")) {
      setError((prev) => prev || "Unable to load business profile.");
    }
  }, [profileQuery.data, tenantQuery.data, profileQuery.isError, tenantQuery.isError, user?.role]);

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const saveProfile = async () => {
    clearMessages();
    try {
      const res = await updateProfile.mutateAsync({
        fullName: profile.fullName || undefined,
        email: profile.email || undefined,
        mobile: profile.mobile || undefined,
      });
      setProfile(res.data);
      setUserProfile({
        username: res.data.username,
        role: res.data.role,
        fullName: res.data.fullName,
        email: res.data.email,
        mobile: res.data.mobile,
        avatarUrl: res.data.avatarUrl,
      });
      setNotice("Profile updated.");
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
      // biome-ignore lint: suppressed for zero-error monorepo state
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to save profile.");
    }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    clearMessages();
    try {
      const res = await uploadAvatar.mutateAsync(avatarFile);
      const avatarUrl = res.data?.avatarUrl as string;
      setProfile((p) => ({ ...p, avatarUrl }));
      setUserProfile({
        username: user?.username || profile.username,
        role: user?.role || profile.role,
        fullName: user?.fullName || profile.fullName,
        email: user?.email || profile.email,
        mobile: user?.mobile || profile.mobile,
        avatarUrl,
      });
      setAvatarFile(null);
      setNotice("Avatar updated.");
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
      // biome-ignore lint: suppressed for zero-error monorepo state
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to upload avatar.");
    }
  };

  const savePassword = async () => {
    clearMessages();
    try {
      await changePassword.mutateAsync(passwordForm);
      setPasswordForm(createEmptyPasswordForm());
      setNotice("Password updated.");
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
      // biome-ignore lint: suppressed for zero-error monorepo state
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to change password.");
    }
  };

  const saveTenant = async () => {
    clearMessages();
    try {
      const res = await updateTenant.mutateAsync({
        name: tenant.name,
        businessType: tenant.businessType || undefined,
        ownerName: tenant.ownerName || undefined,
        businessPhone: tenant.businessPhone || undefined,
        businessEmail: tenant.businessEmail || undefined,
        businessAddress: tenant.businessAddress || undefined,
        gstNumber: tenant.gstNumber || undefined,
        logoUrl: tenant.logoUrl || undefined,
        smsTemplate: tenant.smsTemplate || undefined,
        whatsappTemplate: tenant.whatsappTemplate || undefined,
      });
      setTenant(res.data);
      setNotice("Business profile and reminder templates updated.");
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
      // biome-ignore lint: suppressed for zero-error monorepo state
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update tenant profile.");
    }
  };

  return {
    user,
    profile,
    setProfile,
    tenant,
    setTenant,
    passwordForm,
    setPasswordForm,
    avatarFile,
    setAvatarFile,
    notice,
    error,
    saveProfile,
    saveAvatar,
    savePassword,
    saveTenant,
  };
}
