import { useState } from 'react';

export default function Tooltip({ 
  children, 
  content,
  side = 'top',
  delay = 300 
}) {
  const [isVisible, setIsVisible] = useState(false);
  let timeout;

  const handleMouseEnter = () => {
    timeout = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`
            absolute z-50 ${sideClasses[side]}
            px-2 py-1 rounded
            bg-ink-900 text-white
            font-sans text-xs
            whitespace-nowrap
            pointer-events-none
          `}
        >
          {content}
        </div>
      )}
    </div>
  );
}