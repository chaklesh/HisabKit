import { FormEvent, useEffect, useState } from 'react';
import { Building2, KeyRound, Save, UserRound } from 'lucide-react';
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
const formInputClass =
  'w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
const formLabelClass = 'text-xs font-semibold uppercase tracking-[0.16em] text-slate-500';

export const ProfilePage = () => {
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
    <div className="rounded-2xl bg-[linear-gradient(180deg,#f5f7fb_0%,#eef2ff_100%)] p-3 sm:p-4">
      <div className="mx-auto max-w-6xl">
        {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {notice && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Account Settings</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Profile, security and business templates</h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep personal details updated, secure your account, and standardize reminder templates used in ledger follow-ups.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <UserRound className="h-5 w-5" />
              My Profile
            </h2>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.fullName || profile.username} className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <UserRound className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <p className={formLabelClass}>Profile photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className={formInputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void saveAvatar()}
                  disabled={!avatarFile}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60"
                >
                  Upload
                </button>
              </div>

              <div className="space-y-1">
                <p className={formLabelClass}>Full name</p>
                <input
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                  placeholder="Owner or operator name"
                  className={formInputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={formLabelClass}>Email</p>
                <input
                  value={profile.email || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                  placeholder="name@business.com"
                  className={formInputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={formLabelClass}>Mobile</p>
                <input
                  value={profile.mobile || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
                  placeholder="+91xxxxxxxxxx"
                  className={formInputClass}
                />
              </div>
            </div>
            <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              Save profile
            </button>
          </form>

          <form onSubmit={savePassword} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-900">
              <KeyRound className="h-5 w-5" />
              Change Password
            </h2>
            <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Use a strong password with at least 8 characters and a mix of letters, numbers, and symbols.
            </p>
            <div className="grid gap-4">
              <div className="space-y-1">
                <p className={formLabelClass}>Current password</p>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                  className={formInputClass}
                />
              </div>
              <div className="space-y-1">
                <p className={formLabelClass}>New password</p>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                  className={formInputClass}
                />
              </div>
            </div>
            <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              Update password
            </button>
          </form>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <form onSubmit={saveTenant} className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-xl font-black text-slate-900">
              <Building2 className="h-5 w-5" />
              Business Profile and Reminder Templates
            </h2>
            <p className="mb-4 text-xs text-slate-500">Template variables: {templateHelp}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className={formLabelClass}>Business name</p>
                <input value={tenant.name || ''} onChange={(e) => setTenant((p) => ({ ...p, name: e.target.value }))} placeholder="Business name" className={formInputClass} />
              </div>
              <div className="space-y-1">
                <p className={formLabelClass}>Business type</p>
                <input value={tenant.businessType || ''} onChange={(e) => setTenant((p) => ({ ...p, businessType: e.target.value }))} placeholder="Retail, Wholesale, Services..." className={formInputClass} />
              </div>
              <div className="space-y-1">
                <p className={formLabelClass}>Owner name</p>
                <input value={tenant.ownerName || ''} onChange={(e) => setTenant((p) => ({ ...p, ownerName: e.target.value }))} placeholder="Owner name" className={formInputClass} />
              </div>
              <div className="space-y-1">
                <p className={formLabelClass}>Business phone</p>
                <input value={tenant.businessPhone || ''} onChange={(e) => setTenant((p) => ({ ...p, businessPhone: e.target.value }))} placeholder="+91xxxxxxxxxx" className={formInputClass} />
              </div>
              <div className="space-y-1">
                <p className={formLabelClass}>Business email</p>
                <input value={tenant.businessEmail || ''} onChange={(e) => setTenant((p) => ({ ...p, businessEmail: e.target.value }))} placeholder="accounts@business.com" className={formInputClass} />
              </div>
              <div className="space-y-1">
                <p className={formLabelClass}>GST number</p>
                <input value={tenant.gstNumber || ''} onChange={(e) => setTenant((p) => ({ ...p, gstNumber: e.target.value }))} placeholder="GSTIN" className={formInputClass} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className={formLabelClass}>Logo URL</p>
                <input value={tenant.logoUrl || ''} onChange={(e) => setTenant((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="https://..." className={formInputClass} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className={formLabelClass}>Business address</p>
                <input value={tenant.businessAddress || ''} onChange={(e) => setTenant((p) => ({ ...p, businessAddress: e.target.value }))} placeholder="Business address" className={formInputClass} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className={formLabelClass}>SMS template</p>
                <textarea value={tenant.smsTemplate || ''} onChange={(e) => setTenant((p) => ({ ...p, smsTemplate: e.target.value }))} placeholder="SMS reminder template" className={`min-h-24 ${formInputClass}`} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className={formLabelClass}>WhatsApp template</p>
                <textarea value={tenant.whatsappTemplate || ''} onChange={(e) => setTenant((p) => ({ ...p, whatsappTemplate: e.target.value }))} placeholder="WhatsApp reminder template" className={`min-h-24 ${formInputClass}`} />
              </div>
            </div>
            <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">
              <Save className="h-4 w-4" />
              Save tenant settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
