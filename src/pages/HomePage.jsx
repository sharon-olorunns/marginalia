import { useMemo } from 'react';
import { useArticles } from '../hooks';
import { useAppContext } from '../context/AppContext';
import { AddArticleInput, ArticleGrid, EmptyState } from '../components/articles';
import { FilterBar } from '../components/filters';

export default function HomePage() {
  const { state } = useAppContext();
  const { filters } = state;
  
  // Determine if viewing Favorites
  const isViewingFavorites = filters.activeListId === 'favorites';
  
  // Pass filters to useArticles
  const { 
    articles, 
    isLoading, 
    addArticle,
    toggleRead, 
    toggleStar, 
    deleteArticle 
  } = useArticles({
    searchQuery: filters.searchQuery,
    readStatus: filters.readStatus,
    starredOnly: isViewingFavorites || filters.starredOnly,
    selectedTags: filters.selectedTags,
    listId: typeof filters.activeListId === 'number' ? filters.activeListId : null
  });

  // Get existing URLs for duplicate detection
  const existingUrls = useMemo(() => 
    articles.map(a => a.url), 
    [articles]
  );

  // Handle article added
  const handleArticleAdded = async (articleData) => {
    const result = await addArticle(articleData);
    if (!result.success) {
      throw new Error(result.error === 'duplicate' 
        ? 'This article is already in your library' 
        : 'Failed to save article'
      );
    }
    return result;
  };

  // Determine empty state type
  const getEmptyStateType = () => {
    if (filters.searchQuery || filters.readStatus !== 'all' || filters.selectedTags.length > 0) {
      return 'noResults';
    }
    if (isViewingFavorites) {
      return 'noFavorites';
    }
    if (typeof filters.activeListId === 'number') {
      return 'emptyList';
    }
    return 'noArticles';
  };

  // Check if filters are active (for showing filter bar)
  const showFilterBar = articles.length > 0 || 
    filters.readStatus !== 'all' || 
    filters.selectedTags.length > 0 ||
    filters.searchQuery;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Add Article Input */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-card border border-ink-100">
        <AddArticleInput 
          onArticleAdded={handleArticleAdded}
          existingUrls={existingUrls}
        />
      </div>

      {/* Filter Bar */}
      {showFilterBar && (
        <div className="mb-6">
          <FilterBar />
        </div>
      )}
      
      {/* Articles */}
      {isLoading ? (
        <ArticleGrid 
          articles={[]}
          isLoading={true}
          skeletonCount={6}
        />
      ) : articles.length === 0 ? (
        <EmptyState type={getEmptyStateType()} />
      ) : (
        <>
          {/* Results count */}
          <p className="text-sm text-ink-500 font-sans mb-4">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            {filters.searchQuery && ` matching "${filters.searchQuery}"`}
          </p>
          
          <ArticleGrid 
            articles={articles}
            isLoading={false}
            onToggleRead={toggleRead}
            onToggleStar={toggleStar}
            onDelete={deleteArticle}
          />
        </>
      )}
    </div>
  );
}