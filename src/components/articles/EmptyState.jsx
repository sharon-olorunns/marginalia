import { BookOpen, Link, Star, Search } from 'lucide-react';

const illustrations = {
  noArticles: {
    icon: BookOpen,
    title: 'No articles yet',
    description: 'Paste a URL above to save your first article',
  },
  noResults: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters',
  },
  noFavorites: {
    icon: Star,
    title: 'No favorites yet',
    description: 'Star articles to add them to your favorites',
  },
  emptyList: {
    icon: Link,
    title: 'This list is empty',
    description: 'Add articles to this list from the card menu',
  },
};

export default function EmptyState({ type = 'noArticles', className = '' }) {
  const { icon: Icon, title, description } = illustrations[type] || illustrations.noArticles;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4">
        <Icon size={32} className="text-ink-400" />
      </div>
      <h3 className="font-serif text-xl text-ink-700 mb-2 text-center">
        {title}
      </h3>
      <p className="font-sans text-sm text-ink-500 text-center max-w-xs">
        {description}
      </p>
    </div>
  );
}