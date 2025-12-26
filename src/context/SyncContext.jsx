import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui';
import { 
  isSyncAvailable, 
  performFullSync,
  uploadArticle,
  uploadList,
  uploadArticleList,
  deleteCloudArticle,
  deleteCloudList,
  deleteCloudArticleList,
} from '../services/syncService';
import { subscribeToChanges, isRealtimeAvailable } from '../services/realtimeService';
import { db } from '../db';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncEnabled] = useState(isSyncAvailable());
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'error'
  
  const unsubscribeRef = useRef(null);
  const hasInitialSyncedRef = useRef(false);

  // Full sync function
  const handleFullSync = useCallback(async () => {
    if (!user?.id || isSyncing || !syncEnabled) return;

    setIsSyncing(true);
    
    try {
      const result = await performFullSync(user.id);
      
      if (result.success) {
        setLastSynced(new Date());
        toast.success('Synced with cloud');
      } else {
        toast.error('Sync failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, isSyncing, syncEnabled, toast]);

// Set up real-time subscription and initial sync when user signs in
useEffect(() => {
    console.log('SyncContext useEffect running:', {
      isAuthenticated,
      userId: user?.id,
      syncEnabled,
      realtimeAvailable: isRealtimeAvailable()
    });
  
    if (isAuthenticated && user?.id && syncEnabled) {
      // Perform initial sync only once
      if (!hasInitialSyncedRef.current) {
        hasInitialSyncedRef.current = true;
        handleFullSync();
      }
  
      // Set up real-time subscription
      if (isRealtimeAvailable()) {
        console.log('Setting up real-time subscriptions...');
        unsubscribeRef.current = subscribeToChanges(user.id, (status) => {
          console.log('Real-time status changed:', status);
          setRealtimeStatus(status);
        });
      } else {
        console.log('Real-time NOT available - check supabase config');
      }
    } else {
      console.log('Skipping real-time setup - conditions not met');
      // Clean up on sign out
      hasInitialSyncedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setRealtimeStatus('disconnected');
    }
  
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isAuthenticated, user?.id, syncEnabled]);

  // Sync a single article (for real-time updates)
  const syncArticle = useCallback(async (article) => {
    if (!user?.id || !syncEnabled) return;
    
    try {
      await uploadArticle(article, user.id);
    } catch (error) {
      console.error('Error syncing article:', error);
    }
  }, [user?.id, syncEnabled]);

    // Sync article deletion
    const syncArticleDeletion = useCallback(async (cloudId) => {
        if (!cloudId || !syncEnabled) {
            return false;
        }

        try {
            const result = await deleteCloudArticle(cloudId);
            return result;
        } catch (error) {
            console.error('Error syncing article deletion:', error);
            return false;
        }
    }, [syncEnabled]);

  
    // Sync a single list
  const syncList = useCallback(async (list) => {
    if (!user?.id || !syncEnabled || list.isDefault) return;
    
    try {
      await uploadList(list, user.id);
    } catch (error) {
      console.error('Error syncing list:', error);
    }
  }, [user?.id, syncEnabled]);

  // Sync list deletion
  const syncListDeletion = useCallback(async (cloudId) => {
    if (!cloudId || !syncEnabled) return;
    
    try {
      await deleteCloudList(cloudId);
    } catch (error) {
      console.error('Error syncing list deletion:', error);
    }
  }, [syncEnabled]);

  // Sync article-list relationship
  const syncArticleListAdd = useCallback(async (articleId, listId) => {
    if (!syncEnabled) return;
    
    try {
      const article = await db.articles.get(articleId);
      const list = await db.lists.get(listId);
      
      if (article?.cloudId && list?.cloudId) {
        await uploadArticleList(article.cloudId, list.cloudId);
      }
    } catch (error) {
      console.error('Error syncing article-list:', error);
    }
  }, [syncEnabled]);

  // Sync article-list removal
  const syncArticleListRemove = useCallback(async (articleId, listId) => {
    if (!syncEnabled) return;
    
    try {
      const article = await db.articles.get(articleId);
      const list = await db.lists.get(listId);
      
      if (article?.cloudId && list?.cloudId) {
        await deleteCloudArticleList(article.cloudId, list.cloudId);
      }
    } catch (error) {
      console.error('Error syncing article-list removal:', error);
    }
  }, [syncEnabled]);

  const value = {
    isSyncing,
    lastSynced,
    syncEnabled,
    realtimeStatus,
    handleFullSync,
    syncArticle,
    syncArticleDeletion,
    syncList,
    syncListDeletion,
    syncArticleListAdd,
    syncArticleListRemove,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}