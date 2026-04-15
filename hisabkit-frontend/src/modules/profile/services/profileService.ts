import {
  getMyProfile as apiGetMyProfile,
  updateMyProfile as apiUpdateMyProfile,
  changeMyPassword as apiChangeMyPassword,
  uploadMyAvatar as apiUploadMyAvatar,
  getTenantProfile as apiGetTenantProfile,
  updateTenantProfile as apiUpdateTenantProfile,
} from '@/shared/api/client';

async function getMyProfile() {
  return apiGetMyProfile();
}

async function updateMyProfile(payload: unknown) {
  return apiUpdateMyProfile(payload as any);
}

async function changeMyPassword(payload: unknown) {
  return apiChangeMyPassword(payload as any);
}

async function uploadMyAvatar(file: File) {
  return apiUploadMyAvatar(file);
}

async function getTenantProfile() {
  return apiGetTenantProfile();
}

async function updateTenantProfile(payload: unknown) {
  return apiUpdateTenantProfile(payload as any);
}

export default {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyAvatar,
  getTenantProfile,
  updateTenantProfile,
};
