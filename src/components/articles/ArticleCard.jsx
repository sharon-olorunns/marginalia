import { useState } from 'react';
import { Star, Clock, ExternalLink, Trash2, MoreVertical, CheckCircle, Circle, FolderPlus } from 'lucide-react';
import { Popover, Tooltip } from '../ui';
import { ListSelector } from '../lists';

export default function ArticleCard({ 
  article, 
  onToggleRead, 
  onToggleStar, 
  onDelete,
  onAddToList 
}) {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = (e) => {
    // Don't open if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('[data-popover]')) return;
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article 
      onClick={handleCardClick}
      className="group bg-white rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden border border-ink-100 cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-video bg-gradient-to-br from-cream-200 to-cream-100 relative overflow-hidden">
        {article.imageUrl && !imageError ? (
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-4xl text-cream-400 opacity-50">M</span>
          </div>
        )}
        
        {/* Star button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(article.id);
          }}
          className={`
            absolute top-2 right-2 p-1.5 rounded-full
            transition-all duration-200
            ${article.isStarred 
              ? 'bg-amber-500 text-white' 
              : 'bg-white/80 text-ink-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-amber-500'
            }
          `}
          aria-label={article.isStarred ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={16} fill={article.isStarred ? 'currentColor' : 'none'} />
        </button>

        {/* Read status badge */}
        {article.isRead && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-sans font-medium rounded-full flex items-center gap-1">
            <CheckCircle size={12} />
            Read
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Publication & Reading Time */}
        <div className="flex items-center gap-2 mb-2">
          {article.faviconUrl && (
            <img 
              src={article.faviconUrl} 
              alt="" 
              className="w-4 h-4 rounded"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <span className="font-sans text-xs text-ink-500 truncate">
            {article.publication}
          </span>
          <span className="text-ink-300">·</span>
          <span className="font-sans text-xs text-ink-400 flex items-center gap-1">
            <Clock size={12} />
            {article.readingTime} min
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-base text-ink-900 leading-snug line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
          {article.title}
        </h3>
        
        {/* Summary */}
        {article.summary && (
          <p className="font-sans text-sm text-ink-500 line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {article.tags.map(tag => (
            <span 
              key={tag}
              className="text-xs bg-cream-100 text-ink-600 px-2 py-0.5 rounded-full font-sans"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 pt-3 border-t border-ink-100">
          {/* Read toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleRead(article.id);
            }}
            title={article.isRead ? 'Mark as unread' : 'Mark as read'}
            className={`
              p-2 rounded-lg transition-colors
              ${article.isRead 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-ink-400 hover:bg-ink-50 hover:text-ink-600'
              }
            `}
          >
            {article.isRead ? <CheckCircle size={18} /> : <Circle size={18} />}
          </button>

          {/* Open link */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(article.url, '_blank', 'noopener,noreferrer');
            }}
            title="Open article"
            className="p-2 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-600 transition-colors"
          >
            <ExternalLink size={18} />
          </button>

          {/* Add to list */}
          <div data-popover>
            <Popover
              trigger={
                <button
                  className="p-2 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-600 transition-colors"
                  title="Add to list"
                >
                  <FolderPlus size={18} />
                </button>
              }
              align="start"
            >
              {({ close }) => (
                <ListSelector articleId={article.id} onClose={close} />
              )}
            </Popover>
          </div>
          
          <div className="flex-1" />
          
          {/* More options */}
          <div data-popover>
            <Popover
              trigger={
                <button
                  className="p-2 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-600 transition-colors"
                >
                  <MoreVertical size={18} />
                </button>
              }
              align="end"
            >
              {({ close }) => (
                <div className="py-1">
                  <Popover.Item 
                    icon={article.isRead ? Circle : CheckCircle}
                    onClick={() => {
                      onToggleRead(article.id);
                      close();
                    }}
                  >
                    {article.isRead ? 'Mark as unread' : 'Mark as read'}
                  </Popover.Item>
                  <Popover.Item 
                    icon={Star}
                    onClick={() => {
                      onToggleStar(article.id);
                      close();
                    }}
                  >
                    {article.isStarred ? 'Remove from favorites' : 'Add to favorites'}
                  </Popover.Item>
                  <Popover.Divider />
                  <Popover.Item 
                    icon={Trash2}
                    danger
                    onClick={() => {
                      onDelete(article.id);
                      close();
                    }}
                  >
                    Delete article
                  </Popover.Item>
                </div>
              )}
            </Popover>
          </div>
        </div>
      </div>
    </article>
  );
}