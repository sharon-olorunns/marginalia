import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../db';

// Check if sync is available
export const isSyncAvailable = () => {
  return isSupabaseConfigured() && !!supabase;
};

// Generate a UUID for new cloud records
const generateUUID = () => {
  return crypto.randomUUID();
};

// ----- ARTICLES -----

// Upload a single article to cloud
export async function uploadArticle(article, userId) {
    console.log('uploadArticle called:', { articleId: article.id, cloudId: article.cloudId, isStarred: article.isStarred });

    if (!isSyncAvailable() || !userId) {
        console.log('uploadArticle aborted - sync not available');
        return null;
    }

    const cloudArticle = {
        id: article.cloudId || generateUUID(),
        user_id: userId,
        url: article.url,
        title: article.title,
        publication: article.publication || '',
        summary: article.summary || '',
        image_url: article.imageUrl,
        favicon_url: article.faviconUrl,
        reading_time: article.readingTime || 5,
        tags: article.tags || [],
        is_read: article.isRead || false,
        is_starred: article.isStarred || false,
        created_at: article.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    console.log('Upserting to cloud:', { id: cloudArticle.id, is_starred: cloudArticle.is_starred });

    const { data, error } = await supabase
        .from('articles')
        .upsert(cloudArticle, { onConflict: 'id' })
        .select()
        .single();

    if (error) {
        console.error('Error uploading article:', error);
        return null;
    }

    console.log('Successfully uploaded article:', data.id);

    // Update local article with cloud ID
    if (data && article.id) {
        await db.articles.update(article.id, { cloudId: data.id });
    }

    return data;
}


// Download all articles from cloud
export async function downloadArticles(userId) {
  if (!isSyncAvailable() || !userId) return [];

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error downloading articles:', error);
    return [];
  }

  return data || [];
}

// Delete article from cloud
export async function deleteCloudArticle(cloudId) {
    console.log('deleteCloudArticle called with cloudId:', cloudId);
    console.log('isSyncAvailable:', isSyncAvailable());

    if (!isSyncAvailable() || !cloudId) {
        console.log('deleteCloudArticle aborted');
        return false;
    }

    const { data, error } = await supabase
        .from('articles')
        .delete()
        .eq('id', cloudId)
        .select();

    console.log('Delete response - data:', data, 'error:', error);

    if (error) {
        console.error('Error deleting cloud article:', error);
        return false;
    }

    console.log('Successfully deleted cloud article:', cloudId);
    return true;
}

// ----- LISTS -----

// Upload a single list to cloud
export async function uploadList(list, userId) {
  if (!isSyncAvailable() || !userId) return null;

  // Don't sync default lists (All Articles, Favorites)
  if (list.isDefault) return null;

  const cloudList = {
    id: list.cloudId || generateUUID(),
    user_id: userId,
    name: list.name,
    is_default: false,
    is_currently_reading: list.isCurrentlyReading || false,
    created_at: list.createdAt?.toISOString() || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('lists')
    .upsert(cloudList, { onConflict: 'user_id,name' })
    .select()
    .single();

  if (error) {
    console.error('Error uploading list:', error);
    return null;
  }

  // Update local list with cloud ID
  if (data && list.id) {
    await db.lists.update(list.id, { cloudId: data.id });
  }

  return data;
}

// Download all lists from cloud
export async function downloadLists(userId) {
  if (!isSyncAvailable() || !userId) return [];

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error downloading lists:', error);
    return [];
  }

  return data || [];
}

// Delete list from cloud
export async function deleteCloudList(cloudId) {
  if (!isSyncAvailable() || !cloudId) return false;

  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', cloudId);

  if (error) {
    console.error('Error deleting cloud list:', error);
    return false;
  }

  return true;
}

// ----- ARTICLE-LIST RELATIONSHIPS -----

// Upload article-list relationship
export async function uploadArticleList(articleCloudId, listCloudId) {
  if (!isSyncAvailable() || !articleCloudId || !listCloudId) return null;

  const { data, error } = await supabase
    .from('article_lists')
    .upsert(
      { article_id: articleCloudId, list_id: listCloudId },
      { onConflict: 'article_id,list_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error uploading article-list:', error);
    return null;
  }

  return data;
}

// Download article-list relationships
export async function downloadArticleLists(userId) {
  if (!isSyncAvailable() || !userId) return [];

  // Get all article IDs for this user first
  const { data: articles } = await supabase
    .from('articles')
    .select('id')
    .eq('user_id', userId);

  if (!articles || articles.length === 0) return [];

  const articleIds = articles.map(a => a.id);

  const { data, error } = await supabase
    .from('article_lists')
    .select('*')
    .in('article_id', articleIds);

  if (error) {
    console.error('Error downloading article-lists:', error);
    return [];
  }

  return data || [];
}

// Delete article-list relationship from cloud
export async function deleteCloudArticleList(articleCloudId, listCloudId) {
  if (!isSyncAvailable() || !articleCloudId || !listCloudId) return false;

  const { error } = await supabase
    .from('article_lists')
    .delete()
    .eq('article_id', articleCloudId)
    .eq('list_id', listCloudId);

  if (error) {
    console.error('Error deleting cloud article-list:', error);
    return false;
  }

  return true;
}

// ----- FULL SYNC -----

// Perform a full sync (upload local -> cloud, download cloud -> local)
export async function performFullSync(userId) {
  if (!isSyncAvailable() || !userId) {
    return { success: false, error: 'Sync not available' };
  }

  try {
    console.log('Starting full sync...');

    // Step 1: Upload all local articles to cloud
    const localArticles = await db.articles.toArray();
    console.log(`Uploading ${localArticles.length} local articles...`);
    
    for (const article of localArticles) {
      await uploadArticle(article, userId);
    }

    // Step 2: Upload all local lists to cloud
    const localLists = await db.lists.filter(l => !l.isDefault).toArray();
    console.log(`Uploading ${localLists.length} local lists...`);
    
    for (const list of localLists) {
      await uploadList(list, userId);
    }

    // Step 3: Upload article-list relationships
    const localArticleLists = await db.articleLists.toArray();
    console.log(`Uploading ${localArticleLists.length} article-list relationships...`);
    
    for (const al of localArticleLists) {
      const article = await db.articles.get(al.articleId);
      const list = await db.lists.get(al.listId);
      
      if (article?.cloudId && list?.cloudId) {
        await uploadArticleList(article.cloudId, list.cloudId);
      }
    }

    // Step 4: Download all cloud articles
    const cloudArticles = await downloadArticles(userId);
    console.log(`Downloaded ${cloudArticles.length} cloud articles`);

    for (const cloudArticle of cloudArticles) {
      // Check if we already have this article locally (by URL)
      const existing = await db.articles.where('url').equals(cloudArticle.url).first();
      
      if (existing) {
        // Update local article with cloud data if cloud is newer
        const cloudUpdated = new Date(cloudArticle.updated_at);
        const localUpdated = existing.updatedAt || existing.createdAt;
        
        if (cloudUpdated > localUpdated) {
          await db.articles.update(existing.id, {
            cloudId: cloudArticle.id,
            title: cloudArticle.title,
            publication: cloudArticle.publication,
            summary: cloudArticle.summary,
            imageUrl: cloudArticle.image_url,
            faviconUrl: cloudArticle.favicon_url,
            readingTime: cloudArticle.reading_time,
            tags: cloudArticle.tags,
            isRead: cloudArticle.is_read,
            isStarred: cloudArticle.is_starred,
            updatedAt: cloudUpdated,
          });
        } else if (!existing.cloudId) {
          // Just add the cloud ID if missing
          await db.articles.update(existing.id, { cloudId: cloudArticle.id });
        }
      } else {
        // Add new article from cloud
        await db.articles.add({
          cloudId: cloudArticle.id,
          url: cloudArticle.url,
          title: cloudArticle.title,
          publication: cloudArticle.publication || '',
          summary: cloudArticle.summary || '',
          imageUrl: cloudArticle.image_url,
          faviconUrl: cloudArticle.favicon_url,
          readingTime: cloudArticle.reading_time || 5,
          tags: cloudArticle.tags || [],
          isRead: cloudArticle.is_read || false,
          isStarred: cloudArticle.is_starred || false,
          createdAt: new Date(cloudArticle.created_at),
          updatedAt: new Date(cloudArticle.updated_at),
        });
      }
    }

    // Step 5: Download all cloud lists
    const cloudLists = await downloadLists(userId);
    console.log(`Downloaded ${cloudLists.length} cloud lists`);

    for (const cloudList of cloudLists) {
      // Check if we already have this list locally (by name)
      const existing = await db.lists.where('name').equals(cloudList.name).first();
      
      if (existing) {
        // Update with cloud ID
        await db.lists.update(existing.id, { 
          cloudId: cloudList.id,
          isCurrentlyReading: cloudList.is_currently_reading,
        });
      } else {
        // Add new list from cloud
        await db.lists.add({
          cloudId: cloudList.id,
          name: cloudList.name,
          isDefault: false,
          isCurrentlyReading: cloudList.is_currently_reading || false,
          createdAt: new Date(cloudList.created_at),
        });
      }
    }

    // Step 6: Download and sync article-list relationships
    const cloudArticleLists = await downloadArticleLists(userId);
    console.log(`Downloaded ${cloudArticleLists.length} article-list relationships`);

    for (const cal of cloudArticleLists) {
      // Find local article and list by cloud IDs
      const article = await db.articles.where('cloudId').equals(cal.article_id).first();
      const list = await db.lists.where('cloudId').equals(cal.list_id).first();
      
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
    }

    console.log('Full sync completed!');
    return { success: true };

  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
}