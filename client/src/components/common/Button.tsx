import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'white' | 'outline-white';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-btn focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-brand text-white hover:bg-brand-hover focus:ring-brand shadow-sm active:translate-y-px',
    secondary:
      'bg-brand-tint text-brand hover:bg-teal-200 focus:ring-brand active:translate-y-px',
    outline:
      'border border-appBorder bg-surface text-textPrimary hover:bg-slate-50 focus:ring-brand active:translate-y-px',
    white:
      'bg-white text-emerald-950 font-bold hover:bg-emerald-50 focus:ring-white shadow-md active:translate-y-px',
    'outline-white':
      'border-2 border-white/80 bg-transparent text-white font-bold hover:bg-white/15 focus:ring-white active:translate-y-px',
    danger:
      'bg-appDanger text-white hover:bg-red-800 focus:ring-appDanger active:translate-y-px',
    ghost:
      'text-textBody hover:bg-slate-100 hover:text-textPrimary focus:ring-slate-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
