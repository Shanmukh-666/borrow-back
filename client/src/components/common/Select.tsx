import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (string | SelectOption)[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, required, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-textPrimary mb-1.5">
            {label}
            {required && <span className="text-appDanger ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          required={required}
          className={`w-full px-3.5 py-2.5 rounded-field border bg-surface text-textPrimary text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer ${
            error ? 'border-appDanger focus:ring-appDanger' : 'border-appBorder hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const labelText = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {labelText}
              </option>
            );
          })}
        </select>
        {error && <p className="mt-1 text-xs text-appDanger">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-textMuted">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
