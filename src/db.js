import Dexie from 'dexie';

export const db = new Dexie('MarginalioDB');

// Define database schema
db.version(1).stores({
  // Articles table
  // ++id = auto-increment primary key
  // url is indexed for duplicate checking
  // *tags = multi-entry index (array of tags)
  articles: '++id, url, createdAt, isRead, isStarred, *tags',
  
  // Lists table
  lists: '++id, name, isDefault, isCurrentlyReading, createdAt',
  
  // Junction table for many-to-many relationship
  // [articleId+listId] = compound index for quick lookups
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
        createdAt: new Date()
      },
      {
        name: 'Favorites',
        isDefault: true,
        isCurrentlyReading: false,
        createdAt: new Date()
      }
    ]);
    console.log('Default lists created');
  }
}