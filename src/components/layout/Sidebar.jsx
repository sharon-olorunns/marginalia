import { BookOpen, Star, Plus, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useLists } from '../../hooks';
import { useAppContext } from '../../context/AppContext';

export default function Sidebar() {
  const { lists, customLists } = useLists();
  const { 
    state, 
    setActiveList, 
    openCreateListModal,
    setEditingList,
    toggleSidebar 
  } = useAppContext();
  
  const { activeListId } = state.filters;
  const { sidebarOpen } = state.ui;

  // Calculate counts
  const allArticlesCount = lists.find(l => l.name === 'All Articles')?.articleCount ?? 0;
  const favoritesCount = lists.find(l => l.name === 'Favorites')?.articleCount ?? 0;

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
              ${activeListId === null 
                ? 'bg-cream-100 text-ink-900' 
                : 'text-ink-700 hover:bg-ink-50'
              }
            `}
          >
            <BookOpen size={18} className="text-ink-500" />
            <span className="flex-1 text-left">All Articles</span>
            <span className="text-ink-400 text-xs">
              {allArticlesCount}
            </span>
          </button>
          
          {/* Favorites */}
          <button
            onClick={() => setActiveList('favorites')}
            className={`
              w-full flex items-center gap-3 px-3 py-2 rounded-lg
              font-sans text-sm transition-colors
              ${activeListId === 'favorites'
                ? 'bg-cream-100 text-ink-900' 
                : 'text-ink-700 hover:bg-ink-50'
              }
            `}
          >
            <Star size={18} className="text-amber-600" />
            <span className="flex-1 text-left">Favorites</span>
            <span className="text-ink-400 text-xs">
              {favoritesCount}
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
              <div 
                key={list.id}
                className="group relative"
              >
                <button
                  onClick={() => setActiveList(list.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    font-sans text-sm transition-colors
                    ${activeListId === list.id 
                      ? 'bg-cream-100 text-ink-900' 
                      : 'text-ink-700 hover:bg-ink-50'
                    }
                  `}
                >
                  <ChevronRight 
                    size={16} 
                    className={`text-ink-400 ${
                      list.isCurrentlyReading ? 'text-amber-600' : ''
                    }`} 
                  />
                  <span className="flex-1 text-left truncate">
                    {list.name}
                  </span>
                  <span className="text-ink-400 text-xs group-hover:opacity-0 transition-opacity">
                    {list.articleCount}
                  </span>
                </button>
                
                {/* Edit button - shows on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingList(list.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-ink-200 text-ink-400 hover:text-ink-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}