export default function ArticleCardSkeleton() {
    return (
      <div className="bg-white rounded-lg shadow-card overflow-hidden border border-ink-100">
        {/* Image skeleton */}
        <div className="aspect-video bg-ink-100 animate-pulse" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Publication & time */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-ink-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-ink-200 rounded animate-pulse" />
            <div className="h-3 w-12 bg-ink-200 rounded animate-pulse" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <div className="h-5 bg-ink-200 rounded animate-pulse w-full" />
            <div className="h-5 bg-ink-200 rounded animate-pulse w-3/4" />
          </div>
          
          {/* Summary */}
          <div className="space-y-1.5">
            <div className="h-3 bg-ink-100 rounded animate-pulse w-full" />
            <div className="h-3 bg-ink-100 rounded animate-pulse w-5/6" />
          </div>
          
          {/* Tags */}
          <div className="flex gap-1">
            <div className="h-5 w-14 bg-ink-100 rounded-full animate-pulse" />
            <div className="h-5 w-16 bg-ink-100 rounded-full animate-pulse" />
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-ink-100">
            <div className="w-8 h-8 bg-ink-100 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-ink-100 rounded-lg animate-pulse" />
            <div className="flex-1" />
            <div className="w-8 h-8 bg-ink-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }