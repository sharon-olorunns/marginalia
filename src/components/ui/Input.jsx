import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { 
    label,
    error,
    icon: Icon,
    className = '',
    ...props 
  }, 
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-sans text-sm font-medium text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 
            ${Icon ? 'pl-10' : ''}
            font-sans text-sm text-ink-900
            bg-white border rounded-lg
            transition-colors duration-150
            placeholder:text-ink-400
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
            disabled:bg-ink-50 disabled:text-ink-400 disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-ink-300 hover:border-ink-400'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 font-sans text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

export default Input;