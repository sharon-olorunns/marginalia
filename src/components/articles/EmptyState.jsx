import { BookOpen, Link, Star, Search, Plus } from 'lucide-react';
import { Button } from '../ui';

const illustrations = {
  noArticles: {
    icon: BookOpen,
    title: 'Your reading list is empty',
    description: 'Start building your library by saving articles you want to read.',
    hint: 'Paste a URL in the input above to save your first article.',
  },
  noResults: {
    icon: Search,
    title: 'No matching articles',
    description: 'Try adjusting your search terms or clearing some filters.',
    hint: null,
  },
  noFavorites: {
    icon: Star,
    title: 'No favorites yet',
    description: 'Star articles to add them here for quick access.',
    hint: 'Click the star icon on any article card to favorite it.',
  },
  emptyList: {
    icon: Link,
    title: 'This list is empty',
    description: 'Add articles to this list to organize your reading.',
    hint: 'Click the folder icon on any article card to add it to a list.',
  },
};

export default function EmptyState({ type = 'noArticles', onAction, className = '' }) {
  const { icon: Icon, title, description, hint } = illustrations[type] || illustrations.noArticles;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center mb-6">
        <Icon size={40} className="text-ink-300" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-xl text-ink-700 mb-2 text-center">
        {title}
      </h3>
      <p className="font-sans text-sm text-ink-500 text-center max-w-sm mb-4">
        {description}
      </p>
      {hint && (
        <p className="font-sans text-xs text-ink-400 text-center max-w-xs">
          {hint}
        </p>
      )}
    </div>
  );
}