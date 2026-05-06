import { Button } from "@hisabkit/ui/components/Button";
import { KeyRound, Lock, ShieldCheck, Unlock } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { PasswordFormState } from "../types/profileTypes";

type PasswordFormProps = {
  passwordForm: PasswordFormState;
  setPasswordForm: Dispatch<SetStateAction<PasswordFormState>>;
  onSubmit: () => Promise<void>;
  formInputClass: string;
  formLabelClass: string;
};

export function PasswordForm({
  passwordForm,
  setPasswordForm,
  onSubmit,
  formInputClass,
  formLabelClass,
}: PasswordFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="space-y-8"
    >
      <div className="p-6 bg-slate-100 dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-3 text-slate-900 dark:text-white">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h4 className="text-sm font-bold uppercase tracking-widest">Password Requirements</h4>
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Changing your password will sign you out of all other active sessions across your devices.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <label className={formLabelClass} htmlFor="current-pwd">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              id="current-pwd"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              placeholder="Current password"
              className={`${formInputClass} pl-11`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={formLabelClass} htmlFor="new-pwd">New Password</label>
          <div className="relative">
            <Unlock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              id="new-pwd"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="At least 8 characters"
              className={`${formInputClass} pl-11`}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="h-10 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold w-full md:w-auto"
        >
          <KeyRound className="h-4 w-4 mr-2" />
          Update Password
        </Button>
      </div>
    </form>
  );
}
