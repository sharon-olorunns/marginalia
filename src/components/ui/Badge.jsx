const variants = {
    default: 'bg-ink-100 text-ink-600',
    primary: 'bg-amber-100 text-amber-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
  };
  
  const sizes = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };
  
  export default function Badge({ 
    children, 
    variant = 'default', 
    size = 'md',
    removable = false,
    onRemove,
    className = '' 
  }) {
    return (
      <span 
        className={`
          inline-flex items-center gap-1 rounded-full font-sans font-medium
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
      >
        {children}
        {removable && (
          <button
            onClick={onRemove}
            className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
            aria-label="Remove"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path 
                d="M9 3L3 9M3 3L9 9" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }