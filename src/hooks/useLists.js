import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useLists() {
  // Fetch all lists with article counts
  const lists = useLiveQuery(async () => {
    const allLists = await db.lists.orderBy('createdAt').toArray();
    
    // Get article counts for each list
    const listsWithCounts = await Promise.all(
      allLists.map(async (list) => {
        let count;
        
        if (list.name === 'All Articles') {
          // Count all articles
          count = await db.articles.count();
        } else if (list.name === 'Favorites') {
          // Count starred articles
          count = await db.articles.where('isStarred').equals(1).count();
        } else {
          // Count articles in this specific list
          count = await db.articleLists
            .where('listId')
            .equals(list.id)
            .count();
        }
        
        return { ...list, articleCount: count };
      })
    );
    
    return listsWithCounts;
  }, []);

  // Create a new list
  const createList = async (name) => {
    const id = await db.lists.add({
      name,
      isDefault: false,
      isCurrentlyReading: false,
      createdAt: new Date()
    });
    return id;
  };

  // Rename a list
  const renameList = async (id, newName) => {
    await db.lists.update(id, { name: newName });
  };

  // Delete a list (and its article associations)
  const deleteList = async (id) => {
    const list = await db.lists.get(id);
    if (list?.isDefault) {
      throw new Error('Cannot delete default lists');
    }
    
    // Remove all article associations
    await db.articleLists.where('listId').equals(id).delete();
    // Delete the list
    await db.lists.delete(id);
  };

  // Set a list as "Currently Reading"
  const setCurrentlyReading = async (id) => {
    // Clear any existing "currently reading" flag
    await db.lists
      .where('isCurrentlyReading')
      .equals(1)
      .modify({ isCurrentlyReading: false });
    
    // Set the new one (if id provided)
    if (id !== null) {
      await db.lists.update(id, { isCurrentlyReading: true });
    }
  };

  // Get default and custom lists separately
  const defaultLists = lists?.filter(l => l.isDefault) ?? [];
  const customLists = lists?.filter(l => !l.isDefault) ?? [];
  const currentlyReadingList = lists?.find(l => l.isCurrentlyReading) ?? null;

  return {
    lists: lists ?? [],
    defaultLists,
    customLists,
    currentlyReadingList,
    isLoading: lists === undefined,
    createList,
    renameList,
    deleteList,
    setCurrentlyReading
  };
}