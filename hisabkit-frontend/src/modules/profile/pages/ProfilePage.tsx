import { BusinessProfileForm } from '../components/BusinessProfileForm';
import { PasswordForm } from '../components/PasswordForm';
import { ProfileDetailsForm } from '../components/ProfileDetailsForm';
import { useProfilePageState } from '../hooks/useProfilePageState';
import { Badge } from '@/shared/components/ui/badge';
import { UserCircle2 } from 'lucide-react';

const templateHelp = '{{customerName}}, {{balance}}, {{balanceType}}, {{businessName}}, {{customerPhone}}';
const formInputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900';
const formLabelClass = 'text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block px-1';

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
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 font-black uppercase tracking-widest text-[9px] px-2 h-5">
                 <UserCircle2 className="w-3 h-3 mr-1" /> Authorized session
              </Badge>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Account Center</h1>
           <p className="text-slate-500 font-medium max-w-xl">
             Manage your public enterprise identity, security protocols, and operational ledger templates from a single control point.
           </p>
        </div>
      </div>

      {(error || notice) && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700 animate-in shake duration-300 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
               {error}
            </div>
          )}
          {notice && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700 animate-in slide-in-from-top-2 duration-300 flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
               {notice}
            </div>
          )}
        </div>
      )}

      {/* Profile & Security Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass-card rounded-[2.5rem] border-none p-2 shadow-xl shadow-slate-200/50">
          <div className="p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
               Personal Identity
               <div className="h-0.5 flex-1 bg-slate-100" />
            </h3>
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
        </div>

        <div className="glass-card rounded-[2.5rem] border-none p-2 shadow-xl shadow-slate-200/50">
          <div className="p-8">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
               Access Control
               <div className="h-0.5 flex-1 bg-slate-100" />
            </h3>
            <PasswordForm
              passwordForm={passwordForm}
              setPasswordForm={setPasswordForm}
              onSubmit={savePassword}
              formInputClass={formInputClass}
              formLabelClass={formLabelClass}
            />
          </div>
        </div>
      </div>

      {/* Business Preferences (Templates etc) */}
      {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
        <div className="glass-card rounded-[2.5rem] border-none p-2 shadow-xl shadow-slate-200/50">
          <div className="p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
               Enterprise Ledger Configuration
               <div className="h-0.5 flex-1 bg-slate-100" />
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8">Set defaults for communication templates and shop branding.</p>
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
