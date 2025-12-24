import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = forwardRef(function SearchInput(
  { 
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    className = '',
    ...props 
  }, 
  ref
) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
        <Search size={18} />
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-9 py-2
          font-sans text-sm text-ink-900
          bg-white border border-ink-300 rounded-lg
          transition-colors duration-150
          placeholder:text-ink-400
          hover:border-ink-400
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
        "
        {...props}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-600 rounded transition-colors"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
});

export default SearchInput;