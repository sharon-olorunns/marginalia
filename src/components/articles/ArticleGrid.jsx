import ArticleCard from './ArticleCard';
import ArticleCardSkeleton from './ArticleCardSkeleton';

export default function ArticleGrid({ 
  articles, 
  isLoading,
  skeletonCount = 6,
  onToggleRead, 
  onToggleStar, 
  onDelete,
  onAddToList 
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map(article => (
        <ArticleCard
          key={article.id}
          article={article}
          onToggleRead={onToggleRead}
          onToggleStar={onToggleStar}
          onDelete={onDelete}
          onAddToList={onAddToList}
        />
      ))}
    </div>
  );
}