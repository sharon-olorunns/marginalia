import { useEffect, useState } from 'react';
import { initializeDefaults } from './db';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/layout';
import { ToastProvider } from './components/ui';
import { useLists } from './hooks';
import { CreateListModal, EditListModal } from './components/lists';
import HomePage from './pages/HomePage';

function App() {
  const [dbReady, setDbReady] = useState(false);
  
  useEffect(() => {
    initializeDefaults().then(() => {
      setDbReady(true);
    });
  }, []);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="font-serif text-2xl text-amber-700">M</span>
          </div>
          <h1 className="font-serif text-2xl text-ink-900 mb-2">Marginalia</h1>
          <p className="font-sans text-sm text-ink-500">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}

// Separate component to use context hooks
function AppContent() {
  const { 
    state, 
    closeCreateListModal, 
    setEditingList 
  } = useAppContext();
  
  const { 
    lists,
    createList, 
    renameList, 
    deleteList 
  } = useLists();

  // Find the list being edited
  const editingList = state.ui.editingListId 
    ? lists.find(l => l.id === state.ui.editingListId) 
    : null;

  return (
    <>
      <Layout>
        <HomePage />
      </Layout>
      
      {/* Create List Modal */}
      <CreateListModal
        isOpen={state.ui.createListModalOpen}
        onClose={closeCreateListModal}
        onCreateList={createList}
      />
      
      {/* Edit List Modal */}
      <EditListModal
        isOpen={!!state.ui.editingListId}
        onClose={() => setEditingList(null)}
        list={editingList}
        onRenameList={renameList}
        onDeleteList={deleteList}
      />
    </>
  );
}

export default App;