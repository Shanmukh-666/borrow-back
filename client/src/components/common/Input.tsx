import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, isPassword = false, type = 'text', required, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-textPrimary mb-1.5">
            {label}
            {required && <span className="text-appDanger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={actualType}
            required={required}
            className={`w-full px-3.5 py-2.5 rounded-field border bg-surface text-textPrimary placeholder:text-textMuted text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand ${
              error ? 'border-appDanger focus:ring-appDanger' : 'border-appBorder hover:border-slate-300'
            } ${isPassword ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary focus:outline-none p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-appDanger">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-textMuted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
