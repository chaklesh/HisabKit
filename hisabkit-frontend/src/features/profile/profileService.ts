import api from '../../api/api';

async function getMyProfile() {
  return api.get('/me/profile');
}

async function updateMyProfile(payload: unknown) {
  return api.put('/me/profile', payload);
}

async function changeMyPassword(payload: unknown) {
  return api.post('/me/change-password', payload);
}

async function uploadMyAvatar(file: File) {
  return (api as any).uploadMyAvatar(file);
}

async function getTenantProfile() {
  return api.get('/tenant/profile');
}

async function updateTenantProfile(payload: unknown) {
  return api.put('/tenant/profile', payload);
}

export default {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyAvatar,
  getTenantProfile,
  updateTenantProfile,
};
