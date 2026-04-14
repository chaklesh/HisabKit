/**
 * MessageAlert component
 * Displays error/success messages using shadcn Alert
 */

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface MessageAlertProps {
  message: string;
  type: 'error' | 'success';
}

export function MessageAlert({ message, type }: MessageAlertProps) {
  if (!message) return null;

  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <Alert variant={isError ? 'destructive' : 'default'} className="mb-4">
      <Icon className="h-4 w-4" />
      <AlertTitle>{isError ? 'Error' : 'Success'}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
