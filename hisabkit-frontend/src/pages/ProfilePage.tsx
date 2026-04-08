import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Home, KeyRound, Save, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  changeMyPassword,
  getMyProfile,
  getTenantProfile,
  Tenant,
  uploadMyAvatar,
  updateMyProfile,
  updateTenantProfile,
  UserProfile,
} from '../api/api';
import { useAuth } from '../context/AuthContext';

const templateHelp = '{{customerName}}, {{balance}}, {{balanceType}}, {{businessName}}, {{customerPhone}}';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    role: '',
    fullName: '',
    email: '',
    mobile: '',
    avatarUrl: '',
  });
  const [tenant, setTenant] = useState<Tenant>({
    id: '',
    name: '',
    slug: '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      try {
        const profileRes = await getMyProfile();
        setProfile(profileRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Unable to load profile.');
      }

      try {
        const tenantRes = await getTenantProfile();
        setTenant(tenantRes.data);
      } catch (err: any) {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
          setError((prev) => prev || err.response?.data?.message || 'Unable to load business profile.');
        }
      }
    };
    void load();
  }, [user?.role]);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const res = await updateMyProfile({
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
      setNotice('Profile updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save profile.');
    }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setError('');
    setNotice('');
    try {
      const res = await uploadMyAvatar(avatarFile);
      const avatarUrl = res.data?.avatarUrl as string;
      setProfile((p) => ({ ...p, avatarUrl }));
      setUserProfile({
        username: (user?.username || profile.username) as string,
        role: (user?.role || profile.role) as string,
        fullName: user?.fullName || profile.fullName,
        email: user?.email || profile.email,
        mobile: user?.mobile || profile.mobile,
        avatarUrl,
      });
      setAvatarFile(null);
      setNotice('Avatar updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to upload avatar.');
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await changeMyPassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setNotice('Password updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to change password.');
    }
  };

  const saveTenant = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const res = await updateTenantProfile({
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
      setNotice('Business profile and reminder templates updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to update tenant profile.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <Link to="/dashboard" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            <Home className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </nav>

        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <UserRound className="h-5 w-5" />
              My Profile
            </h2>
            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName || profile.username} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <UserRound className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
                <button type="button" onClick={() => void saveAvatar()} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Upload
                </button>
              </div>
              <input value={profile.fullName || ''} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} placeholder="Full name" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={profile.email || ''} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={profile.mobile || ''} onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))} placeholder="Mobile" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
            </div>
            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              Save profile
            </button>
          </form>

          <form onSubmit={savePassword} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <KeyRound className="h-5 w-5" />
              Change Password
            </h2>
            <div className="grid gap-3">
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} placeholder="Current password" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} placeholder="New password" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
            </div>
            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              Update password
            </button>
          </form>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <form onSubmit={saveTenant} className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-xl font-black text-slate-900">Business Profile and Reminder Templates</h2>
            <p className="mb-4 text-xs text-slate-500">Template variables: {templateHelp}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <input value={tenant.name || ''} onChange={(e) => setTenant((p) => ({ ...p, name: e.target.value }))} placeholder="Business name" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={tenant.businessType || ''} onChange={(e) => setTenant((p) => ({ ...p, businessType: e.target.value }))} placeholder="Business type" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={tenant.ownerName || ''} onChange={(e) => setTenant((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner name" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={tenant.businessPhone || ''} onChange={(e) => setTenant((p) => ({ ...p, businessPhone: e.target.value }))} placeholder="Business phone" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={tenant.businessEmail || ''} onChange={(e) => setTenant((p) => ({ ...p, businessEmail: e.target.value }))} placeholder="Business email" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={tenant.gstNumber || ''} onChange={(e) => setTenant((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GST number" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none" />
              <input value={tenant.logoUrl || ''} onChange={(e) => setTenant((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="Logo URL" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none md:col-span-2" />
              <input value={tenant.businessAddress || ''} onChange={(e) => setTenant((p) => ({ ...p, businessAddress: e.target.value }))} placeholder="Business address" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none md:col-span-2" />
              <textarea value={tenant.smsTemplate || ''} onChange={(e) => setTenant((p) => ({ ...p, smsTemplate: e.target.value }))} placeholder="SMS template" className="min-h-24 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none md:col-span-2" />
              <textarea value={tenant.whatsappTemplate || ''} onChange={(e) => setTenant((p) => ({ ...p, whatsappTemplate: e.target.value }))} placeholder="WhatsApp template" className="min-h-24 rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none md:col-span-2" />
            </div>
            <button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              Save tenant settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
