import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-300"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-xl border bg-gray-900/50 px-4 py-3 text-white
            placeholder-gray-500 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : 'border-gray-700 hover:border-gray-600'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}