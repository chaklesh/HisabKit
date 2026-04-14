/**
 * Security settings component
 * Manages password and session controls
 */

import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useChangePassword } from '../../../features/profile/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function SecuritySection() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = (): boolean => {
    if (!passwordForm.currentPassword) {
      setError(t('settings.security.current_password_required', 'Current password is required'));
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      setError(t('settings.security.password_min_length', 'New password must be at least 8 characters'));
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError(t('settings.security.passwords_mismatch', 'Passwords do not match'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setError('');
    setIsLoading(true);

    try {
      await changePassword.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('settings.security.password_changed', 'Password changed successfully'));
    } catch (err: any) {
      const message = err.response?.data?.message || t('settings.security.error', 'Unable to change password');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  const labelClasses = 'text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground';

  const PasswordInput = ({ label, field, show }: { label: string; field: 'current' | 'new' | 'confirm'; show: boolean }) => (
    <div className="space-y-2">
      <label className={labelClasses}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={passwordForm[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={(e) => setPasswordForm((p) => ({ ...p, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value }))}
          className={inputClasses}
          placeholder={field === 'current' ? 'Current password' : field === 'new' ? 'New password' : 'Confirm new password'}
        />
        <button
          type="button"
          onClick={() => setShowPasswords((p) => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Lock className="size-5 text-primary" />
          </div>
          <div>
            <CardTitle>{t('settings.security.title', 'Security')}</CardTitle>
            <CardDescription>{t('settings.security.description', 'Manage your password and session security')}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

          <div className="space-y-4">
            <PasswordInput label={t('settings.security.current_password', 'Current password')} field="current" show={showPasswords.current} />
            <PasswordInput label={t('settings.security.new_password', 'New password')} field="new" show={showPasswords.new} />
            <PasswordInput label={t('settings.security.confirm_password', 'Confirm new password')} field="confirm" show={showPasswords.confirm} />

            <p className="text-xs text-muted-foreground">{t('settings.security.password_requirements', 'Password must be at least 8 characters')}</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">{t('settings.security.session_note', 'Session management')}</p>
              <p className="mt-1 text-xs text-amber-800">
                {t('settings.security.session_note_details', 'Changing your password will end all active sessions for security.')}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('common.saving', 'Updating...') : t('settings.security.change_password', 'Change Password')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
