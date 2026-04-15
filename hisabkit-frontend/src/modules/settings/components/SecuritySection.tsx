import { FormEvent, useState } from 'react';
import { Eye, EyeOff, ShieldAlert, KeyRound, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useChangePassword } from '@/modules/profile/services/useProfile';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export function SecuritySection() {
  const { } = useTranslation();
  const changePassword = useChangePassword();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswords = (): boolean => {
    if (!passwordForm.currentPassword) {
      setError('Authorization required: Current password is missing.');
      return false;
    }
    if (passwordForm.newPassword.length < 8) {
      setError('Constraint violation: Minimum 8 characters required.');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Confirmation mismatch: Passwords do not correlate.');
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
      toast.success('Security credential updated', {
        description: 'Your authentication token has been refreshed.'
      });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message
        || 'Network layer error: Request rejected by server.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:bg-slate-900 dark:border-slate-800 outline-none pr-11';
  const labelClasses = 'text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 mb-1.5 block';

  const PasswordInput = ({ label, field, show, placeholder }: { label: string; field: 'current' | 'new' | 'confirm'; show: boolean; placeholder: string }) => (
    <div className="space-y-1">
      <label className={labelClasses}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={passwordForm[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
          onChange={(e) => setPasswordForm((p) => ({ ...p, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value }))}
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
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8">
           <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] font-bold border-rose-100 bg-rose-50 text-rose-700 uppercase tracking-widest px-2">
                <ShieldAlert className="w-3 h-3 mr-1" /> Critical security
              </Badge>
           </div>
           <CardTitle className="text-xl font-black tracking-tight">Access Credentials</CardTitle>
           <CardDescription>
              Maintain the integrity of your account by regularly cycling your secret key.
           </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                 {error}
              </div>
            )}

            <div className="max-w-md space-y-5">
              <PasswordInput label="Verify Identity (Current Password)" field="current" show={showPasswords.current} placeholder="Enter your existing pasword" />
              
              <div className="pt-4 border-t border-slate-100 space-y-5">
                 <PasswordInput label="Propose New Key" field="new" show={showPasswords.new} placeholder="Min. 8 complex characters" />
                 <PasswordInput label="Authorize New Key" field="confirm" show={showPasswords.confirm} placeholder="Repeat new key exactly" />
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5 flex items-start gap-4">
               <div className="p-2 bg-white rounded-lg border border-amber-200 shadow-sm shrink-0">
                  <Fingerprint className="w-5 h-5 text-amber-600" />
               </div>
               <div>
                  <p className="text-sm font-bold text-amber-900">Protocol notice</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Executing a key rotation will terminate all active session tokens across your devices. 
                    You will be required to re-authenticate immediately.
                  </p>
               </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
               <Button 
                 type="submit" 
                 disabled={isLoading}
                 className="rounded-xl h-11 px-8 bg-slate-900 hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-200"
               >
                 <KeyRound className="w-4 h-4 mr-2" />
                 {isLoading ? 'Rotating Key...' : 'Update Credentials'}
               </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
