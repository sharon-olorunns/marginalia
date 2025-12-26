import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';

export function useLists() {
  const { isAuthenticated } = useAuth();
  const { syncList, syncListDeletion } = useSync();

  // Fetch all lists with article counts
  const lists = useLiveQuery(async () => {
    const allLists = await db.lists.orderBy('createdAt').toArray();
    
    // Get all articles once for counting
    const allArticles = await db.articles.toArray();
    const starredCount = allArticles.filter(a => a.isStarred).length;
    
    // Get article counts for each list
    const listsWithCounts = await Promise.all(
      allLists.map(async (list) => {
        let count;
        
        if (list.name === 'All Articles') {
          count = allArticles.length;
        } else if (list.name === 'Favorites') {
          count = starredCount;
        } else {
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
      cloudId: null,
      createdAt: new Date()
    });
    
    // Sync to cloud if authenticated
    if (isAuthenticated) {
      const savedList = await db.lists.get(id);
      syncList(savedList);
    }
    
    return id;
  };

  // Rename a list
  const renameList = async (id, newName) => {
    await db.lists.update(id, { name: newName });
    
    // Sync to cloud if authenticated
    if (isAuthenticated) {
      const updatedList = await db.lists.get(id);
      syncList(updatedList);
    }
  };

  // Delete a list (and its article associations)
  const deleteList = async (id) => {
    const list = await db.lists.get(id);
    if (list?.isDefault) {
      throw new Error('Cannot delete default lists');
    }
    
    const cloudId = list?.cloudId;
    
    // Remove all article associations
    await db.articleLists.where('listId').equals(id).delete();
    // Delete the list
    await db.lists.delete(id);
    
    // Sync deletion to cloud
    if (isAuthenticated && cloudId) {
      syncListDeletion(cloudId);
    }
  };

  // Set a list as "Currently Reading"
  const setCurrentlyReading = async (id) => {
    // Clear any existing "currently reading" flag
    const currentlyReadingLists = await db.lists
      .filter(list => list.isCurrentlyReading)
      .toArray();
    
    for (const list of currentlyReadingLists) {
      await db.lists.update(list.id, { isCurrentlyReading: false });
      if (isAuthenticated) {
        const updated = await db.lists.get(list.id);
        syncList(updated);
      }
    }
    
    // Set the new one (if id provided)
    if (id !== null) {
      await db.lists.update(id, { isCurrentlyReading: true });
      if (isAuthenticated) {
        const updated = await db.lists.get(id);
        syncList(updated);
      }
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