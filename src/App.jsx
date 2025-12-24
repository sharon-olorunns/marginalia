import { useEffect, useState } from 'react';
import { initializeDefaults } from './db';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout';
import HomePage from './pages/HomePage';
import ComponentsPage from './pages/ComponentsPage';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  
  useEffect(() => {
    initializeDefaults().then(() => {
      setDbReady(true);
    });
  }, []);

  // Check URL for ?components flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowComponents(params.has('components'));
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-ink-900 mb-2">Marginalia</h1>
          <p className="font-sans text-ink-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show components page if ?components is in URL
  if (showComponents) {
    return <ComponentsPage />;
  }

  return (
    <AppProvider>
      <Layout>
        <HomePage />
      </Layout>
    </AppProvider>
  );
}

export default App;