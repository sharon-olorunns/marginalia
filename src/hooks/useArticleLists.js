import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useArticleLists(articleId = null) {
  // Get list memberships for a specific article
  const articleListIds = useLiveQuery(async () => {
    if (articleId === null) return [];
    
    const memberships = await db.articleLists
      .where('articleId')
      .equals(articleId)
      .toArray();
    
    return memberships.map(m => m.listId);
  }, [articleId]);

  // Add article to a list
  const addToList = async (articleId, listId) => {
    // Check if already in list
    const existing = await db.articleLists
      .where('[articleId+listId]')
      .equals([articleId, listId])
      .first();
    
    if (!existing) {
      await db.articleLists.add({ articleId, listId });
    }
  };

  // Remove article from a list
  const removeFromList = async (articleId, listId) => {
    await db.articleLists
      .where('[articleId+listId]')
      .equals([articleId, listId])
      .delete();
  };

  // Toggle article membership in a list
  const toggleListMembership = async (articleId, listId) => {
    const existing = await db.articleLists
      .where('[articleId+listId]')
      .equals([articleId, listId])
      .first();
    
    if (existing) {
      await removeFromList(articleId, listId);
    } else {
      await addToList(articleId, listId);
    }
  };

  // Get all lists an article belongs to
  const getArticleLists = async (articleId) => {
    const memberships = await db.articleLists
      .where('articleId')
      .equals(articleId)
      .toArray();
    
    const listIds = memberships.map(m => m.listId);
    const lists = await db.lists.where('id').anyOf(listIds).toArray();
    
    return lists;
  };

  return {
    articleListIds: articleListIds ?? [],
    addToList,
    removeFromList,
    toggleListMembership,
    getArticleLists
  };
}