export default function Toggle({ 
    checked, 
    onChange, 
    label,
    disabled = false,
    size = 'md' 
  }) {
    const sizes = {
      sm: {
        track: 'w-8 h-5',
        thumb: 'w-4 h-4',
        translate: 'translate-x-3',
      },
      md: {
        track: 'w-10 h-6',
        thumb: 'w-5 h-5',
        translate: 'translate-x-4',
      },
    };
  
    const s = sizes[size];
  
    return (
      <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={`
            relative inline-flex items-center rounded-full
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
            ${s.track}
            ${checked ? 'bg-amber-600' : 'bg-ink-300'}
          `}
        >
          <span
            className={`
              inline-block rounded-full bg-white shadow-sm
              transform transition-transform duration-200
              ${s.thumb}
              ${checked ? s.translate : 'translate-x-0.5'}
            `}
          />
        </button>
        {label && (
          <span className="font-sans text-sm text-ink-700">{label}</span>
        )}
      </label>
    );
  }