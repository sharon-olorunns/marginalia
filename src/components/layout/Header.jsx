import { Menu, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useLists } from '../../hooks';

export default function Header() {
  const { state, toggleSidebar } = useAppContext();
  const { lists } = useLists();
  const { sidebarOpen } = state.ui;
  const { activeListId } = state.filters;

  // Get current list name for header
  const getCurrentListName = () => {
    if (activeListId === null) return 'All Articles';
    const list = lists.find(l => l.id === activeListId);
    return list?.name ?? 'Articles';
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
      <h2 className="font-serif text-lg text-ink-900">
        {getCurrentListName()}
      </h2>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Search will go here in Phase 8 */}
    </header>
  );
}