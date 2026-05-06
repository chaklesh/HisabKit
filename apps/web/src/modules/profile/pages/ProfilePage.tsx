import { MessageAlert } from "@/modules/ledger/components/MessageAlert";
import { Building, Lock, UserCircle2 } from "lucide-react";
import { BusinessProfileForm } from "../components/BusinessProfileForm";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileDetailsForm } from "../components/ProfileDetailsForm";
import { useProfilePageState } from "../hooks/useProfilePageState";

const templateHelp =
  "{{customerName}}, {{balance}}, {{balanceType}}, {{businessName}}, {{customerPhone}}";
const formInputClass =
  "w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
const formLabelClass = "text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block px-1";

export const ProfilePage = () => {
  const {
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
  } = useProfilePageState();

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 pb-24 reveal">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl">
            Manage your profile, password, and business information.
          </p>
        </div>
      </div>

      <MessageAlert message={error} type="error" />
      <MessageAlert message={notice} type="success" />

      {/* Profile & Security Grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UserCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h3>
            </div>
          </div>
          <ProfileDetailsForm
            profile={profile}
            setProfile={setProfile}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            saveAvatar={saveAvatar}
            onSubmit={saveProfile}
            formInputClass={formInputClass}
            formLabelClass={formLabelClass}
          />
        </div>

        <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Password Settings
              </h3>
            </div>
          </div>
          <PasswordForm
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            onSubmit={savePassword}
            formInputClass={formInputClass}
            formLabelClass={formLabelClass}
          />
        </div>
      </div>

      {/* Business Preferences (Templates etc) */}
      {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
        <div className="glass-card rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
              <Building className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Business Profile</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update your company details and message templates.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <BusinessProfileForm
              tenant={tenant}
              setTenant={setTenant}
              onSubmit={saveTenant}
              templateHelp={templateHelp}
              formInputClass={formInputClass}
              formLabelClass={formLabelClass}
            />
          </div>
        </div>
      )}
    </div>
  );
};
