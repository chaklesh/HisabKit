import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';

interface MessageAlertProps {
  message: string;
  type: 'error' | 'success';
}

export function MessageAlert({ message, type }: MessageAlertProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [message]);

  if (!message || !visible) return null;

  const isError = type === 'error';

  return (
    <div className={cn(
      "fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4",
      isError 
        ? "bg-rose-600 text-white" 
        : "bg-indigo-600 text-white"
    )}>
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="flex-shrink-0">
          {isError ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div className="flex-grow">
          <p className="text-xs font-black uppercase tracking-wider opacity-60 mb-0.5">
            {isError ? 'System Alert' : 'Success Action'}
          </p>
          <p className="text-sm font-bold truncate">{message}</p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="h-1 bg-white/20">
         <div className="h-full bg-white/40 animate-progress origin-left" />
      </div>

      <style>{`
        @keyframes progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        .animate-progress {
          animation: progress 3500ms linear forwards;
        }
      `}</style>
    </div>
  );
}
