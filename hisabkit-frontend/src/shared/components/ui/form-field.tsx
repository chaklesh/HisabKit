/**
 * shared/components/ui/form-field.tsx
 * Accessible label + field wrapper used by all forms.
 * Replaces ad-hoc <div className="space-y-2"> scattered everywhere.
 */
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, required, error, hint, htmlFor, children, className }: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
