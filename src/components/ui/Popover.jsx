import { useState, useRef, useEffect } from 'react';

export default function Popover({ 
  trigger, 
  children, 
  align = 'center',
  side = 'bottom',
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Alignment classes
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  const sideClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  };

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <div 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>
      
      {/* Popover content */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`
            absolute z-50
            ${alignmentClasses[align]}
            ${sideClasses[side]}
            min-w-[200px]
            bg-white rounded-lg shadow-lg border border-ink-200
            animate-in fade-in zoom-in-95 duration-150
            ${className}
          `}
        >
          {typeof children === 'function' 
            ? children({ close: () => setIsOpen(false) }) 
            : children
          }
        </div>
      )}
    </div>
  );
}

// Menu item component for popover menus
Popover.Item = function PopoverItem({ 
  children, 
  onClick, 
  icon: Icon,
  danger = false,
  disabled = false 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full flex items-center gap-2 px-3 py-2
        font-sans text-sm text-left
        transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${danger 
          ? 'text-red-600 hover:bg-red-50' 
          : 'text-ink-700 hover:bg-ink-50'
        }
      `}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// Divider for popover menus
Popover.Divider = function PopoverDivider() {
  return <div className="my-1 border-t border-ink-100" />;
};