import { useArticles } from '../hooks';
import { useAppContext } from '../context/AppContext';
import { useState } from 'react';


function ApiTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to test..."
          className="flex-1 px-3 py-2 border border-ink-300 rounded-lg font-sans text-sm"
        />
        <button
          onClick={handleTest}
          disabled={loading || !url}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg font-sans text-sm hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Extracting...' : 'Test API'}
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-sans text-sm">
          {error}
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-ink-50 rounded-lg space-y-2 font-sans text-sm">
          <p><strong>Title:</strong> {result.title}</p>
          <p><strong>Publication:</strong> {result.publication}</p>
          <p><strong>Summary:</strong> {result.summary || '(none)'}</p>
          <p><strong>Reading Time:</strong> {result.readingTime} min</p>
          <p><strong>Tags:</strong> {result.suggestedTags.join(', ')}</p>
          {result.imageUrl && (
            <div>
              <strong>Image:</strong>
              <img 
                src={result.imageUrl} 
                alt="Preview" 
                className="mt-2 max-w-xs rounded border"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const { state } = useAppContext();
  const { filters } = state;
  
  // Pass filters to useArticles
  const { articles, isLoading, toggleRead, toggleStar, deleteArticle } = useArticles({
    searchQuery: filters.searchQuery,
    readStatus: filters.readStatus,
    starredOnly: filters.activeListId === 2 ? true : filters.starredOnly, // Favorites list
    selectedTags: filters.selectedTags,
    listId: filters.activeListId !== 2 ? filters.activeListId : null
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-ink-500 font-sans">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* API Test Component */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-card border border-ink-100">
        <p className="text-ink-500 font-sans text-sm">
          Article input coming in Phase 6
        </p>
      </div>
      
      {/* Articles list */}
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-serif text-xl text-ink-400 mb-2">
            No articles yet
          </p>
          <p className="font-sans text-sm text-ink-400">
            Paste a URL above to save your first article
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <article 
              key={article.id}
              className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow overflow-hidden border border-ink-100"
            >
              {/* Image placeholder */}
              <div className="aspect-video bg-gradient-to-br from-cream-200 to-cream-100" />
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-serif text-base text-ink-900 leading-tight line-clamp-2">
                    {article.title}
                  </h3>
                  <button
                    onClick={() => toggleStar(article.id)}
                    className={`flex-shrink-0 text-lg ${
                      article.isStarred ? 'text-amber-500' : 'text-ink-300 hover:text-amber-500'
                    }`}
                  >
                    {article.isStarred ? '★' : '☆'}
                  </button>
                </div>
                
                <p className="font-sans text-xs text-ink-500 mb-2">
                  {article.publication} · {article.readingTime} min read
                </p>
                
                <p className="font-sans text-sm text-ink-600 line-clamp-2 mb-3">
                  {article.summary}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.map(tag => (
                    <span 
                      key={tag}
                      className="text-xs bg-cream-100 text-ink-600 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-ink-100">
                  <button
                    onClick={() => toggleRead(article.id)}
                    className={`text-xs px-2 py-1 rounded font-sans transition-colors ${
                      article.isRead 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                    }`}
                  >
                    {article.isRead ? 'Read' : 'Mark read'}
                  </button>
                  
                  <button
                    onClick={() => window.open(article.url, '_blank')}
                    className="text-xs px-2 py-1 rounded font-sans bg-ink-100 text-ink-500 hover:bg-ink-200 transition-colors"
                  >
                    Open
                  </button>
                  
                  <div className="flex-1" />
                  
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-xs px-2 py-1 rounded font-sans text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}