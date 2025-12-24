import { useState, useEffect, useRef } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useLists } from '../../hooks';

export default function Header() {
  const { state, toggleSidebar, setSearchQuery } = useAppContext();
  const { lists } = useLists();
  const { sidebarOpen } = state.ui;
  const { activeListId, searchQuery } = state.filters;
  
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync local search with global state
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localSearch, setSearchQuery]);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !isSearchFocused && 
          !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  // Get current list name for header
  const getCurrentListName = () => {
    if (activeListId === null) return 'All Articles';
    if (activeListId === 'favorites') return 'Favorites';
    const list = lists.find(l => l.id === activeListId);
    return list?.name ?? 'Articles';
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  return (
    <header className="h-14 bg-white border-b border-ink-200 flex items-center px-4 gap-4">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 -ml-2 rounded-lg hover:bg-ink-50 text-ink-600 transition-colors"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      {/* Current view title */}
      <h2 className="font-serif text-lg text-ink-900 hidden sm:block">
        {getCurrentListName()}
      </h2>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Search */}
      <div className={`
        relative flex items-center
        ${isSearchFocused ? 'w-64' : 'w-48'}
        transition-all duration-200
      `}>
        <Search 
          size={18} 
          className="absolute left-3 text-ink-400 pointer-events-none" 
        />
        <input
          ref={searchInputRef}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search... (press /)"
          className="
            w-full pl-10 pr-8 py-2
            font-sans text-sm text-ink-900
            bg-ink-50 border border-transparent rounded-lg
            transition-all duration-200
            placeholder:text-ink-400
            hover:bg-ink-100
            focus:bg-white focus:border-ink-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20
          "
        />
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-2 p-1 text-ink-400 hover:text-ink-600 rounded transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Keyboard shortcut hint - shows on larger screens */}
      <div className="hidden lg:flex items-center text-xs text-ink-400 font-sans">
        <kbd className="px-1.5 py-0.5 bg-ink-100 rounded text-ink-500 font-mono">/</kbd>
        <span className="ml-1">to search</span>
      </div>

    </header>
  );
}