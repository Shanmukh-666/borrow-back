import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle2 className="w-5 h-5 text-appSuccess shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-appDanger shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-appWarning shrink-0" />,
    },
    info: {
      bg: 'bg-teal-50 border-teal-200 text-teal-900',
      icon: <Info className="w-5 h-5 text-brand shrink-0" />,
    },
  };

  const current = typeConfig[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-field border shadow-sm ${current.bg} ${className}`}
    >
      {current.icon}
      <div className="flex-1 text-sm leading-relaxed">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
