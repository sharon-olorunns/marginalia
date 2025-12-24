import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useLists, useArticleLists } from '../../hooks';

export default function ListSelector({ articleId, onClose }) {
  const { customLists, createList } = useLists();
  const { articleListIds, toggleListMembership } = useArticleLists(articleId);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleToggle = async (listId) => {
    await toggleListMembership(articleId, listId);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    try {
      const newListId = await createList(newListName.trim());
      await toggleListMembership(articleId, newListId);
      setNewListName('');
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreateList();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewListName('');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewListName('');
  };

  return (
    <div className="w-56">
      <div className="px-3 py-2 border-b border-ink-100">
        <p className="font-sans text-xs font-medium text-ink-500 uppercase tracking-wide">
          Add to List
        </p>
      </div>
      
      <div className="max-h-48 overflow-y-auto py-1">
        {customLists.length === 0 && !isCreating ? (
          <p className="px-3 py-2 text-sm text-ink-400 font-sans">
            No lists yet
          </p>
        ) : (
          customLists.map(list => {
            const isInList = articleListIds.includes(list.id);
            
            return (
              <button
                key={list.id}
                onClick={() => handleToggle(list.id)}
                className="w-full flex items-center gap-2 px-3 py-2 font-sans text-sm text-ink-700 hover:bg-ink-50 transition-colors"
              >
                <span className={`
                  w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center
                  ${isInList 
                    ? 'bg-amber-600 border-amber-600 text-white' 
                    : 'border-ink-300'
                  }
                `}>
                  {isInList && <Check size={12} />}
                </span>
                <span className="flex-1 text-left truncate">{list.name}</span>
                <span className="text-ink-400 text-xs flex-shrink-0">{list.articleCount}</span>
              </button>
            );
          })
        )}
      </div>
      
      {/* Create new list */}
      <div className="border-t border-ink-100 p-2">
        {isCreating ? (
          <div className="space-y-2">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="List name..."
              autoFocus
              className="w-full px-2 py-1.5 text-sm font-sans border border-ink-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
              maxLength={50}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-2 py-1.5 border border-ink-300 text-ink-600 rounded text-sm hover:bg-ink-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="flex-1 px-2 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 font-sans text-sm text-amber-600 hover:bg-amber-50 rounded transition-colors"
          >
            <Plus size={16} />
            Create new list
          </button>
        )}
      </div>
    </div>
  );
}