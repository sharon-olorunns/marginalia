import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../db';

// Debounce map to prevent duplicate processing
const processedEvents = new Map();
const DEBOUNCE_MS = 500;

function shouldProcessEvent(eventType, recordId) {
    const key = `${eventType}-${recordId}`;
    const now = Date.now();

    if (processedEvents.has(key)) {
        const lastProcessed = processedEvents.get(key);
        if (now - lastProcessed < DEBOUNCE_MS) {
            return false;
        }
    }

    processedEvents.set(key, now);

    // Clean up old entries
    if (processedEvents.size > 100) {
        const cutoff = now - DEBOUNCE_MS * 2;
        for (const [k, v] of processedEvents) {
            if (v < cutoff) processedEvents.delete(k);
        }
    }

    return true;
}

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
    const recordId = newRecord?.id || oldRecord?.id;

    // Debounce to prevent duplicate processing
    if (!shouldProcessEvent(`article-${eventType}`, recordId)) {
        console.log('Skipping duplicate event:', eventType, recordId);
        return;
    }

    console.log('Processing article change:', eventType, recordId);

    // Only process changes for current user
    if (newRecord?.user_id !== userId && oldRecord?.user_id !== userId) {
        return;
    }

    switch (eventType) {
        case 'INSERT': {
            // Check if we already have this article locally
            const existingByCloudId = await db.articles.where('cloudId').equals(newRecord.id).first();
            if (existingByCloudId) {
                console.log('Article already exists by cloudId, skipping insert');
                return;
            }

            // Also check by URL to avoid duplicates
            const existingByUrl = await db.articles.where('url').equals(newRecord.url).first();
            if (existingByUrl) {
                // Update existing with cloud ID
                console.log('Article exists by URL, updating cloudId');
                await db.articles.update(existingByUrl.id, { cloudId: newRecord.id });
            } else {
                // Add new article
                console.log('Adding new article from cloud');
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
            break;
        }

        case 'UPDATE': {
            const existing = await db.articles.where('cloudId').equals(newRecord.id).first();
            if (existing) {
                console.log('Updating local article from cloud:', existing.id);
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
            } else {
                console.log('Article not found locally for update, cloudId:', newRecord.id);
            }
            break;
        }

        case 'DELETE': {
            const existing = await db.articles.where('cloudId').equals(oldRecord.id).first();
            if (existing) {
                console.log('Deleting local article:', existing.id);
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
    const recordId = newRecord?.id || oldRecord?.id;

    // Debounce
    if (!shouldProcessEvent(`list-${eventType}`, recordId)) {
        console.log('Skipping duplicate list event:', eventType, recordId);
        return;
    }

    console.log('Processing list change:', eventType, recordId);

    // Only process changes for current user
    if (newRecord?.user_id !== userId && oldRecord?.user_id !== userId) {
        return;
    }

    switch (eventType) {
        case 'INSERT': {
            const existingByCloudId = await db.lists.where('cloudId').equals(newRecord.id).first();
            if (existingByCloudId) {
                console.log('List already exists by cloudId, skipping');
                return;
            }

            const existingByName = await db.lists.where('name').equals(newRecord.name).first();
            if (existingByName) {
                console.log('List exists by name, updating cloudId');
                await db.lists.update(existingByName.id, { cloudId: newRecord.id });
            } else {
                console.log('Adding new list from cloud');
                await db.lists.add({
                    cloudId: newRecord.id,
                    name: newRecord.name,
                    isDefault: false,
                    isCurrentlyReading: newRecord.is_currently_reading || false,
                    createdAt: new Date(newRecord.created_at),
                });
            }
            break;
        }

        case 'UPDATE': {
            const existing = await db.lists.where('cloudId').equals(newRecord.id).first();
            if (existing) {
                console.log('Updating local list from cloud:', existing.id);
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
                console.log('Deleting local list:', existing.id);
                await db.articleLists.where('listId').equals(existing.id).delete();
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