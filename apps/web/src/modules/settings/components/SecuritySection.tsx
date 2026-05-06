import { useChangePassword } from "@/modules/profile/services/useProfile";
import { Badge } from "@hisabkit/ui/components/Badge";
import { Button } from "@hisabkit/ui/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@hisabkit/ui/components/Card";
import { Eye, EyeOff, Fingerprint, KeyRound, ShieldAlert } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export function SecuritySection() {
  const changePassword = useChangePassword();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = (): boolean => {
    if (!passwordForm.currentPassword) {
      setError("Authorization required: Current password is missing.");
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setError("");
    setIsLoading(true);

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Password updated successfully");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        "Network layer error: Request rejected by server.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900 dark:border-slate-800 outline-none pr-11";
  const labelClasses =
    "text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1.5 block";

  const PasswordInput = ({
    label,
    field,
    show,
    placeholder,
    id,
  }: {
    label: string;
    field: "current" | "new";
    show: boolean;
    placeholder: string;
    id: string;
  }) => (
    <div className="space-y-1">
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={field === "current" ? passwordForm.currentPassword : passwordForm.newPassword}
          onChange={(e) =>
            setPasswordForm((p) => ({
              ...p,
              [field === "current" ? "currentPassword" : "newPassword"]: e.target.value,
            }))
          }
          className={inputClasses}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPasswords((p) => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 uppercase tracking-widest px-2"
            >
              <ShieldAlert className="w-3 h-3 mr-1" /> Critical security
            </Badge>
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Account Security
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Update your password frequently to keep your business data safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-4 text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                {error}
              </div>
            )}

            <div className="max-w-md space-y-5">
              <PasswordInput
                label="Verify Current Password"
                field="current"
                show={showPasswords.current}
                placeholder="Enter your current password"
                id="current-password"
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-5">
                <PasswordInput
                  label="Create New Password"
                  field="new"
                  show={showPasswords.new}
                  placeholder="Minimum 8 characters"
                  id="new-password"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 p-5 flex items-start gap-4">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm shrink-0">
                <Fingerprint className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 dark:text-amber-400">
                  Security Note
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-0.5 leading-relaxed">
                  Changing your password will sign you out of all other devices currently logged
                  into your account.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-bold shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
