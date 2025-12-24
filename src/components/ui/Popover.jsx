import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Popover({ 
  trigger, 
  children, 
  align = 'center',
  side = 'bottom',
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  // Calculate position when opening
  useLayoutEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top, left;

      // Calculate vertical position
      if (side === 'bottom') {
        top = triggerRect.bottom + 8;
        // If popover would go below viewport, flip to top
        if (top + popoverRect.height > viewportHeight - 16) {
          top = triggerRect.top - popoverRect.height - 8;
        }
      } else {
        top = triggerRect.top - popoverRect.height - 8;
        // If popover would go above viewport, flip to bottom
        if (top < 16) {
          top = triggerRect.bottom + 8;
        }
      }

      // Calculate horizontal position
      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'end') {
        left = triggerRect.right - popoverRect.width;
      } else {
        left = triggerRect.left + (triggerRect.width / 2) - (popoverRect.width / 2);
      }

      // Keep within horizontal viewport bounds
      if (left + popoverRect.width > viewportWidth - 16) {
        left = viewportWidth - popoverRect.width - 16;
      }
      if (left < 16) {
        left = 16;
      }

      setPosition({ top, left });
    }
  }, [isOpen, align, side]);

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
      // Delay to prevent immediate close from the same click
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 10);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
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

  // Close on scroll
  useEffect(() => {
    if (isOpen) {
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen]);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger */}
      <div 
        ref={triggerRef}
        onClick={handleTriggerClick}
        className="inline-block cursor-pointer"
      >
        {trigger}
      </div>
      
      {/* Popover content - rendered via Portal */}
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 99999,
          }}
          className={`
            min-w-[200px]
            bg-white rounded-lg shadow-xl border border-ink-200
            ${className}
          `}
        >
          {typeof children === 'function' 
            ? children({ close: () => setIsOpen(false) }) 
            : children
          }
        </div>,
        document.body
      )}
    </>
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