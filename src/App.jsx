import { useEffect, useState } from 'react';
import { initializeDefaults } from './db';
import { useArticles, useLists } from './hooks';

function App() {
  const [dbReady, setDbReady] = useState(false);
  
  // Initialize database on first load
  useEffect(() => {
    initializeDefaults().then(() => {
      setDbReady(true);
    });
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="font-sans text-ink-500">Loading...</p>
      </div>
    );
  }

  return <TestDatabase />;
}

// Temporary component to test database operations
function TestDatabase() {
  const { articles, addArticle, toggleRead, toggleStar, deleteArticle } = useArticles();
  const { lists, createList, deleteList } = useLists();

  const handleAddTestArticle = async () => {
    const result = await addArticle({
      url: `https://example.com/article-${Date.now()}`,
      title: 'Test Article ' + new Date().toLocaleTimeString(),
      publication: 'Test Publication',
      summary: 'This is a test article summary.',
      imageUrl: null,
      faviconUrl: null,
      readingTime: 5,
      tags: ['Test', 'Development']
    });
    console.log('Add result:', result);
  };

  const handleAddTestList = async () => {
    const id = await createList('Test List ' + new Date().toLocaleTimeString());
    console.log('Created list with ID:', id);
  };

  return (
    <div className="min-h-screen bg-cream-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-serif text-3xl text-ink-900 mb-6">
          Marginalia — Database Test
        </h1>
        
        {/* Test buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleAddTestArticle}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg font-sans text-sm hover:bg-amber-700 transition-colors"
          >
            Add Test Article
          </button>
          <button
            onClick={handleAddTestList}
            className="px-4 py-2 bg-ink-700 text-white rounded-lg font-sans text-sm hover:bg-ink-900 transition-colors"
          >
            Add Test List
          </button>
        </div>

        {/* Lists */}
        <div className="mb-8">
          <h2 className="font-serif text-xl text-ink-900 mb-3">
            Lists ({lists.length})
          </h2>
          <div className="space-y-2">
            {lists.map(list => (
              <div 
                key={list.id} 
                className="flex items-center justify-between p-3 bg-white rounded-lg shadow-card"
              >
                <span className="font-sans text-ink-900">
                  {list.name}
                  <span className="text-ink-500 ml-2">({list.articleCount})</span>
                  {list.isDefault && (
                    <span className="ml-2 text-xs bg-ink-100 text-ink-500 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </span>
                {!list.isDefault && (
                  <button
                    onClick={() => deleteList(list.id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h2 className="font-serif text-xl text-ink-900 mb-3">
            Articles ({articles.length})
          </h2>
          <div className="space-y-2">
            {articles.length === 0 ? (
              <p className="text-ink-500 font-sans">No articles yet. Add one above!</p>
            ) : (
              articles.map(article => (
                <div 
                  key={article.id} 
                  className="p-4 bg-white rounded-lg shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-sans font-medium text-ink-900">
                        {article.title}
                      </h3>
                      <p className="text-sm text-ink-500">
                        {article.publication} · {article.readingTime} min
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRead(article.id)}
                        className={`text-sm px-2 py-1 rounded ${
                          article.isRead 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {article.isRead ? 'Read' : 'Unread'}
                      </button>
                      <button
                        onClick={() => toggleStar(article.id)}
                        className={`text-sm px-2 py-1 rounded ${
                          article.isStarred 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {article.isStarred ? '★' : '☆'}
                      </button>
                      <button
                        onClick={() => deleteArticle(article.id)}
                        className="text-sm px-2 py-1 rounded bg-red-100 text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {article.tags.map(tag => (
                      <span 
                        key={tag}
                        className="text-xs bg-cream-200 text-ink-700 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;