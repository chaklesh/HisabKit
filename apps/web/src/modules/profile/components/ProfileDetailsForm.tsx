import type { UserProfile } from "@/shared/types";
import { cn } from "@hisabkit/lib/utils";
import { Button } from "@hisabkit/ui/components/Button";
import { Camera, Save, UploadCloud, UserCircle2 } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

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
      className="space-y-8"
    >
      {/* Avatar Section */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName || profile.username}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
              />
            ) : (
              <UserCircle2 className="w-12 h-12 text-slate-400" />
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] cursor-pointer">
            <Camera className="w-6 h-6 text-white" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="sr-only"
            />
          </label>
        </div>

        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile Image</p>
            <p className="text-xs text-slate-500 font-medium">JPG, PNG. Max 2MB.</p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2">
            <Button
              type="button"
              onClick={() => void saveAvatar()}
              disabled={!avatarFile}
              size="sm"
              className={cn(
                "rounded-xl h-9 px-4 font-black uppercase tracking-widest text-[10px]",
                avatarFile
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400",
              )}
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload
            </Button>
            {avatarFile && (
              <span className="text-[10px] font-bold text-indigo-500 animate-pulse uppercase tracking-wider">
                File Selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid gap-6">
        <div className="space-y-1">
          <label className={formLabelClass} htmlFor="profile-fullname">
            Full Name
          </label>
          <input
            id="profile-fullname"
            value={profile.fullName || ""}
            onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
            placeholder="Your name"
            className={formInputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={formLabelClass} htmlFor="profile-email">
              Email Address
            </label>
            <input
              id="profile-email"
              value={profile.email || ""}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="name@company.com"
              className={formInputClass}
            />
          </div>

          <div className="space-y-1">
            <label className={formLabelClass} htmlFor="profile-mobile">
              Mobile Number
            </label>
            <input
              id="profile-mobile"
              value={profile.mobile || ""}
              onChange={(e) => setProfile((p) => ({ ...p, mobile: e.target.value }))}
              placeholder="+91..."
              className={formInputClass}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="h-10 px-6 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold w-full md:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Profile
        </Button>
      </div>
    </form>
  );
}
