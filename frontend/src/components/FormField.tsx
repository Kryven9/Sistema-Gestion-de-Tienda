import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  icon,
  className = '',
  id,
  ...props
}: FormFieldProps) {
  const inputId = id || props.name;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 ${icon ? 'pl-10' : ''} ${error ? 'border-red-300' : 'border-slate-200'} ${className}`}
          {...props}
        />
      </div>
      {(error || hint) && (
        <p className={`mt-1.5 text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
