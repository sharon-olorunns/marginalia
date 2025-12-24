import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export function useArticles(filters = {}) {
  const {
    searchQuery = '',
    readStatus = 'all',      // 'all' | 'read' | 'unread'
    starredOnly = false,
    selectedTags = [],
    listId = null            // null = all articles
  } = filters;

  // Fetch articles with live updates
  const articles = useLiveQuery(async () => {
    let query = db.articles.orderBy('createdAt').reverse();
    
    let results = await query.toArray();
    
    // Filter by starred (for Favorites view)
    if (starredOnly) {
      results = results.filter(article => article.isStarred);
    }
    
    // Filter by list membership (for custom lists)
    if (listId !== null) {
      const articleIds = await db.articleLists
        .where('listId')
        .equals(listId)
        .toArray()
        .then(al => al.map(item => item.articleId));
      
      results = results.filter(article => articleIds.includes(article.id));
    }
    
    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.publication.toLowerCase().includes(query)
      );
    }
    
    // Filter by read status
    if (readStatus === 'read') {
      results = results.filter(article => article.isRead);
    } else if (readStatus === 'unread') {
      results = results.filter(article => !article.isRead);
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      results = results.filter(article =>
        selectedTags.some(tag => article.tags.includes(tag))
      );
    }
    
    return results;
  }, [searchQuery, readStatus, starredOnly, selectedTags, listId]);

  // Add a new article
  const addArticle = async (articleData) => {
    // Check for duplicate URL
    const existing = await db.articles.where('url').equals(articleData.url).first();
    if (existing) {
      return { success: false, error: 'duplicate', existing };
    }
    
    const article = {
      ...articleData,
      isRead: false,
      isStarred: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const id = await db.articles.add(article);
    return { success: true, id };
  };

  // Update an article
  const updateArticle = async (id, changes) => {
    await db.articles.update(id, {
      ...changes,
      updatedAt: new Date()
    });
  };

  // Toggle read status
  const toggleRead = async (id) => {
    const article = await db.articles.get(id);
    if (article) {
      await updateArticle(id, { isRead: !article.isRead });
    }
  };

  // Toggle starred status
  const toggleStar = async (id) => {
    const article = await db.articles.get(id);
    if (article) {
      await updateArticle(id, { isStarred: !article.isStarred });
    }
  };

  // Delete an article
  const deleteArticle = async (id) => {
    // Remove from all lists first
    await db.articleLists.where('articleId').equals(id).delete();
    // Then delete the article
    await db.articles.delete(id);
  };

  // Get all unique tags
  const allTags = useLiveQuery(async () => {
    const articles = await db.articles.toArray();
    const tagSet = new Set();
    articles.forEach(article => {
      article.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  return {
    articles: articles ?? [],
    allTags: allTags ?? [],
    isLoading: articles === undefined,
    addArticle,
    updateArticle,
    toggleRead,
    toggleStar,
    deleteArticle
  };
}