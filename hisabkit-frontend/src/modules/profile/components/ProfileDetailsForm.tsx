import { Save, UserRound } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { UserProfile } from '@/shared/types';

type ProfileDetailsFormProps = {
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  avatarFile: File | null;
  setAvatarFile: Dispatch<SetStateAction<File | null>>;
  saveAvatar: () => Promise<void>;
  onSubmit: () => Promise<void>;
  formInputClass: string;
  formLabelClass: string;
};

export function ProfileDetailsForm({
  profile,
  setProfile,
  avatarFile,
  setAvatarFile,
  saveAvatar,
  onSubmit,
  formInputClass,
  formLabelClass,
}: ProfileDetailsFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
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
  );
}

