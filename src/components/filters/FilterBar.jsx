import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useArticles } from '../../hooks';

export default function FilterBar() {
  const { 
    state, 
    setReadStatus, 
    setStarredOnly,
    setSelectedTags,
    clearFilters 
  } = useAppContext();
  
  const { filters } = state;
  const { allTags } = useArticles();

  // Check if any filters are active
  const hasActiveFilters = 
    filters.readStatus !== 'all' || 
    filters.starredOnly || 
    filters.selectedTags.length > 0 ||
    filters.searchQuery;

  const handleTagToggle = (tag) => {
    if (filters.selectedTags.includes(tag)) {
      setSelectedTags(filters.selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...filters.selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Read Status Filter */}
      <div className="flex rounded-lg border border-ink-200 overflow-hidden">
        <button
          onClick={() => setReadStatus('all')}
          className={`px-3 py-1.5 text-xs font-sans font-medium transition-colors ${
            filters.readStatus === 'all'
              ? 'bg-ink-900 text-white'
              : 'bg-white text-ink-600 hover:bg-ink-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setReadStatus('unread')}
          className={`px-3 py-1.5 text-xs font-sans font-medium transition-colors border-l border-ink-200 ${
            filters.readStatus === 'unread'
              ? 'bg-ink-900 text-white'
              : 'bg-white text-ink-600 hover:bg-ink-50'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setReadStatus('read')}
          className={`px-3 py-1.5 text-xs font-sans font-medium transition-colors border-l border-ink-200 ${
            filters.readStatus === 'read'
              ? 'bg-ink-900 text-white'
              : 'bg-white text-ink-600 hover:bg-ink-50'
          }`}
        >
          Read
        </button>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`px-2.5 py-1 text-xs font-sans rounded-full transition-colors ${
                filters.selectedTags.includes(tag)
                  ? 'bg-amber-600 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1 text-xs font-sans text-ink-500 hover:text-ink-700 transition-colors"
        >
          <X size={14} />
          Clear filters
        </button>
      )}
    </div>
  );
}