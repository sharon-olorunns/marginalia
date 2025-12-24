export default function Skeleton({ className = '' }) {
    return (
      <div 
        className={`animate-pulse bg-ink-200 rounded ${className}`}
      />
    );
  }
  
  // Pre-built skeleton for article cards
  Skeleton.Card = function SkeletonCard() {
    return (
      <div className="bg-white rounded-lg shadow-card overflow-hidden border border-ink-100">
        {/* Image placeholder */}
        <div className="aspect-video bg-ink-200 animate-pulse" />
        
        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-4 bg-ink-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-ink-200 rounded animate-pulse w-1/2" />
          </div>
          
          {/* Meta */}
          <div className="h-3 bg-ink-200 rounded animate-pulse w-1/3" />
          
          {/* Summary */}
          <div className="space-y-2">
            <div className="h-3 bg-ink-200 rounded animate-pulse" />
            <div className="h-3 bg-ink-200 rounded animate-pulse w-5/6" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-1">
            <div className="h-5 w-12 bg-ink-200 rounded-full animate-pulse" />
            <div className="h-5 w-16 bg-ink-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  };
  
  // Skeleton for sidebar list items
  Skeleton.ListItem = function SkeletonListItem() {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="w-4 h-4 bg-ink-200 rounded animate-pulse" />
        <div className="flex-1 h-4 bg-ink-200 rounded animate-pulse" />
        <div className="w-6 h-4 bg-ink-200 rounded animate-pulse" />
      </div>
    );
  };