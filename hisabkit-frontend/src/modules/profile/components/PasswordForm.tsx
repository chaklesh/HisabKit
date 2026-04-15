import { KeyRound, Save } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { PasswordFormState } from '../types/profileTypes';

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
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
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
  );
}

