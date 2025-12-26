import Dexie from 'dexie';

export const db = new Dexie('MarginalioDB');

// Version 2: Add cloudId for sync
db.version(2).stores({
  articles: '++id, url, cloudId, createdAt, isRead, isStarred, *tags',
  lists: '++id, name, cloudId, isDefault, isCurrentlyReading, createdAt',
  articleLists: '++id, articleId, listId, [articleId+listId]'
}).upgrade(tx => {
  // Migration: add cloudId to existing records
  return tx.table('articles').toCollection().modify(article => {
    article.cloudId = article.cloudId || null;
  }).then(() => {
    return tx.table('lists').toCollection().modify(list => {
      list.cloudId = list.cloudId || null;
    });
  });
});

// Keep version 1 for backwards compatibility
db.version(1).stores({
  articles: '++id, url, createdAt, isRead, isStarred, *tags',
  lists: '++id, name, isDefault, isCurrentlyReading, createdAt',
  articleLists: '++id, articleId, listId, [articleId+listId]'
});

// Initialize default lists on first load
export async function initializeDefaults() {
  const listCount = await db.lists.count();
  
  if (listCount === 0) {
    await db.lists.bulkAdd([
      {
        name: 'All Articles',
        isDefault: true,
        isCurrentlyReading: false,
        cloudId: null,
        createdAt: new Date()
      },
      {
        name: 'Favorites',
        isDefault: true,
        isCurrentlyReading: false,
        cloudId: null,
        createdAt: new Date()
      }
    ]);
    console.log('Default lists created');
  }
}