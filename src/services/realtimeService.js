import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../db';

let articlesSubscription = null;
let listsSubscription = null;
let articleListsSubscription = null;

// Check if realtime is available
export const isRealtimeAvailable = () => {
  return isSupabaseConfigured() && !!supabase;
};

// Handle incoming article changes
async function handleArticleChange(payload, userId) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  console.log('Article change:', eventType, newRecord || oldRecord);

  // Only process changes for current user
  if (newRecord?.user_id !== userId && oldRecord?.user_id !== userId) {
    return;
  }

  switch (eventType) {
    case 'INSERT': {
      // Check if we already have this article locally
      const existing = await db.articles.where('cloudId').equals(newRecord.id).first();
      if (!existing) {
        // Also check by URL to avoid duplicates
        const byUrl = await db.articles.where('url').equals(newRecord.url).first();
        if (byUrl) {
          // Update existing with cloud ID
          await db.articles.update(byUrl.id, { cloudId: newRecord.id });
        } else {
          // Add new article
          await db.articles.add({
            cloudId: newRecord.id,
            url: newRecord.url,
            title: newRecord.title,
            publication: newRecord.publication || '',
            summary: newRecord.summary || '',
            imageUrl: newRecord.image_url,
            faviconUrl: newRecord.favicon_url,
            readingTime: newRecord.reading_time || 5,
            tags: newRecord.tags || [],
            isRead: newRecord.is_read || false,
            isStarred: newRecord.is_starred || false,
            createdAt: new Date(newRecord.created_at),
            updatedAt: new Date(newRecord.updated_at),
          });
        }
      }
      break;
    }
    
    case 'UPDATE': {
      const existing = await db.articles.where('cloudId').equals(newRecord.id).first();
      if (existing) {
        await db.articles.update(existing.id, {
          title: newRecord.title,
          publication: newRecord.publication || '',
          summary: newRecord.summary || '',
          imageUrl: newRecord.image_url,
          faviconUrl: newRecord.favicon_url,
          readingTime: newRecord.reading_time || 5,
          tags: newRecord.tags || [],
          isRead: newRecord.is_read || false,
          isStarred: newRecord.is_starred || false,
          updatedAt: new Date(newRecord.updated_at),
        });
      }
      break;
    }
    
    case 'DELETE': {
      const existing = await db.articles.where('cloudId').equals(oldRecord.id).first();
      if (existing) {
        // Remove from all lists first
        await db.articleLists.where('articleId').equals(existing.id).delete();
        // Delete the article
        await db.articles.delete(existing.id);
      }
      break;
    }
  }
}

// Handle incoming list changes
async function handleListChange(payload, userId) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  console.log('List change:', eventType, newRecord || oldRecord);

  // Only process changes for current user
  if (newRecord?.user_id !== userId && oldRecord?.user_id !== userId) {
    return;
  }

  switch (eventType) {
    case 'INSERT': {
      // Check if we already have this list locally
      const existing = await db.lists.where('cloudId').equals(newRecord.id).first();
      if (!existing) {
        // Also check by name to avoid duplicates
        const byName = await db.lists.where('name').equals(newRecord.name).first();
        if (byName) {
          // Update existing with cloud ID
          await db.lists.update(byName.id, { cloudId: newRecord.id });
        } else {
          // Add new list
          await db.lists.add({
            cloudId: newRecord.id,
            name: newRecord.name,
            isDefault: false,
            isCurrentlyReading: newRecord.is_currently_reading || false,
            createdAt: new Date(newRecord.created_at),
          });
        }
      }
      break;
    }
    
    case 'UPDATE': {
      const existing = await db.lists.where('cloudId').equals(newRecord.id).first();
      if (existing) {
        await db.lists.update(existing.id, {
          name: newRecord.name,
          isCurrentlyReading: newRecord.is_currently_reading || false,
        });
      }
      break;
    }
    
    case 'DELETE': {
      const existing = await db.lists.where('cloudId').equals(oldRecord.id).first();
      if (existing && !existing.isDefault) {
        // Remove all article associations
        await db.articleLists.where('listId').equals(existing.id).delete();
        // Delete the list
        await db.lists.delete(existing.id);
      }
      break;
    }
  }
}

// Handle incoming article-list changes
async function handleArticleListChange(payload) {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  console.log('Article-list change:', eventType, newRecord || oldRecord);

  switch (eventType) {
    case 'INSERT': {
      // Find local article and list by cloud IDs
      const article = await db.articles.where('cloudId').equals(newRecord.article_id).first();
      const list = await db.lists.where('cloudId').equals(newRecord.list_id).first();
      
      if (article && list) {
        // Check if relationship exists locally
        const existing = await db.articleLists
          .where('[articleId+listId]')
          .equals([article.id, list.id])
          .first();
        
        if (!existing) {
          await db.articleLists.add({
            articleId: article.id,
            listId: list.id,
          });
        }
      }
      break;
    }
    
    case 'DELETE': {
      // Find local article and list by cloud IDs
      const article = await db.articles.where('cloudId').equals(oldRecord.article_id).first();
      const list = await db.lists.where('cloudId').equals(oldRecord.list_id).first();
      
      if (article && list) {
        await db.articleLists
          .where('[articleId+listId]')
          .equals([article.id, list.id])
          .delete();
      }
      break;
    }
  }
}

// Subscribe to real-time changes
export function subscribeToChanges(userId, onStatusChange) {
    console.log('subscribeToChanges called with userId:', userId);
    console.log('isRealtimeAvailable:', isRealtimeAvailable());
    console.log('supabase object:', supabase);

    if (!isRealtimeAvailable() || !userId) {
        console.log('Aborting subscribeToChanges - not available or no userId');
        return () => { };
    }

    console.log('Setting up real-time subscriptions for user:', userId);
    onStatusChange?.('connecting');
  

  // Subscribe to articles changes
  articlesSubscription = supabase
    .channel('articles-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'articles',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => handleArticleChange(payload, userId)
    )
    .subscribe((status) => {
      console.log('Articles subscription status:', status);
      if (status === 'SUBSCRIBED') {
        onStatusChange?.('connected');
      } else if (status === 'CHANNEL_ERROR') {
        onStatusChange?.('error');
      }
    });

  // Subscribe to lists changes
  listsSubscription = supabase
    .channel('lists-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lists',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => handleListChange(payload, userId)
    )
    .subscribe();

  // Subscribe to article_lists changes
  // Note: We can't filter by user_id here, so we filter in the handler
  articleListsSubscription = supabase
    .channel('article-lists-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'article_lists',
      },
      (payload) => handleArticleListChange(payload)
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    console.log('Unsubscribing from real-time changes');
    if (articlesSubscription) {
      supabase.removeChannel(articlesSubscription);
      articlesSubscription = null;
    }
    if (listsSubscription) {
      supabase.removeChannel(listsSubscription);
      listsSubscription = null;
    }
    if (articleListsSubscription) {
      supabase.removeChannel(articleListsSubscription);
      articleListsSubscription = null;
    }
    onStatusChange?.('disconnected');
  };
}