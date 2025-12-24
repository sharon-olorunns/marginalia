import { BookOpen, Star, Plus, ChevronRight, Menu } from 'lucide-react';
import { useLists } from '../../hooks';
import { useAppContext } from '../../context/AppContext';

export default function Sidebar() {
  const { lists, defaultLists, customLists } = useLists();
  const { 
    state, 
    setActiveList, 
    openCreateListModal,
    toggleSidebar 
  } = useAppContext();
  
  const { activeListId } = state.filters;
  const { sidebarOpen } = state.ui;

  // Find the "All Articles" list for the null case
  const allArticlesList = defaultLists.find(l => l.name === 'All Articles');
  const favoritesList = defaultLists.find(l => l.name === 'Favorites');

  // Helper to check if a list is active
  const isActive = (listId) => {
    if (listId === null && activeListId === null) return true;
    return listId === activeListId;
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white border-r border-ink-200
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${!sidebarOpen && 'lg:w-0 lg:overflow-hidden lg:border-0'}
          flex flex-col
        `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-ink-100">
          <h1 className="font-serif text-xl text-ink-900">Marginalia</h1>
        </div>
        
        {/* Default lists */}
        <nav className="p-2">
          {/* All Articles */}
          <button
            onClick={() => setActiveList(null)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              font-sans text-sm transition-colors
              ${isActive(null) 
                ? 'bg-cream-100 text-ink-900' 
                : 'text-ink-700 hover:bg-ink-50'
              }
            `}
          >
            <BookOpen size={18} className="text-ink-500" />
            <span className="flex-1 text-left">All Articles</span>
            <span className="text-ink-400 text-xs">
              {allArticlesList?.articleCount ?? 0}
            </span>
          </button>
          
          {/* Favorites */}
          <button
            onClick={() => setActiveList(favoritesList?.id ?? null)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              font-sans text-sm transition-colors
              ${isActive(favoritesList?.id) 
                ? 'bg-cream-100 text-ink-900' 
                : 'text-ink-700 hover:bg-ink-50'
              }
            `}
          >
            <Star size={18} className="text-amber-600" />
            <span className="flex-1 text-left">Favorites</span>
            <span className="text-ink-400 text-xs">
              {favoritesList?.articleCount ?? 0}
            </span>
          </button>
        </nav>
        
        {/* Divider */}
        <div className="mx-4 my-2 border-t border-ink-100" />
        
        {/* Custom lists header */}
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="font-sans text-xs font-medium text-ink-400 uppercase tracking-wide">
            My Lists
          </span>
          <button
            onClick={openCreateListModal}
            className="p-1 rounded hover:bg-ink-100 text-ink-400 hover:text-ink-600 transition-colors"
            title="Create new list"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {/* Custom lists */}
        <nav className="flex-1 px-2 pb-4 overflow-y-auto">
          {customLists.length === 0 ? (
            <p className="px-3 py-2 text-sm text-ink-400 font-sans">
              No lists yet
            </p>
          ) : (
            customLists.map(list => (
              <button
                key={list.id}
                onClick={() => setActiveList(list.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg
                  font-sans text-sm transition-colors group
                  ${isActive(list.id) 
                    ? 'bg-cream-100 text-ink-900' 
                    : 'text-ink-700 hover:bg-ink-50'
                  }
                `}
              >
                <ChevronRight 
                  size={16} 
                  className={`text-ink-400 transition-transform ${
                    list.isCurrentlyReading ? 'text-amber-600' : ''
                  }`} 
                />
                <span className="flex-1 text-left truncate">
                  {list.name}
                </span>
                <span className="text-ink-400 text-xs">
                  {list.articleCount}
                </span>
              </button>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}