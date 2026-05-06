import type { Tenant, UserProfile } from "@/shared/types";
import {
  changeMyPassword as apiChangeMyPassword,
  getMyProfile as apiGetMyProfile,
  getTenantProfile as apiGetTenantProfile,
  updateMyProfile as apiUpdateMyProfile,
  updateTenantProfile as apiUpdateTenantProfile,
  uploadMyAvatar as apiUploadMyAvatar,
} from "./profileApi";

async function getMyProfile() {
  return apiGetMyProfile();
}

async function updateMyProfile(payload: Partial<UserProfile>) {
  return apiUpdateMyProfile(payload);
}

async function changeMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiChangeMyPassword(payload);
}

async function uploadMyAvatar(file: File) {
  return apiUploadMyAvatar(file);
}

async function getTenantProfile() {
  return apiGetTenantProfile();
}

async function updateTenantProfile(payload: Partial<Tenant>) {
  return apiUpdateTenantProfile(payload);
}

export default {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyAvatar,
  getTenantProfile,
  updateTenantProfile,
};
