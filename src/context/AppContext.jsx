import { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  // Filter state
  filters: {
    searchQuery: '',
    readStatus: 'all',      // 'all' | 'read' | 'unread'
    starredOnly: false,
    selectedTags: [],
    activeListId: null      // null = "All Articles"
  },
  
  // UI state
  ui: {
    sidebarOpen: true,
    createListModalOpen: false,
    editingListId: null
  }
};

// Action types
const actions = {
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_READ_STATUS: 'SET_READ_STATUS',
  SET_STARRED_ONLY: 'SET_STARRED_ONLY',
  SET_SELECTED_TAGS: 'SET_SELECTED_TAGS',
  SET_ACTIVE_LIST: 'SET_ACTIVE_LIST',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  OPEN_CREATE_LIST_MODAL: 'OPEN_CREATE_LIST_MODAL',
  CLOSE_CREATE_LIST_MODAL: 'CLOSE_CREATE_LIST_MODAL',
  SET_EDITING_LIST: 'SET_EDITING_LIST',
  CLEAR_FILTERS: 'CLEAR_FILTERS'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case actions.SET_SEARCH_QUERY:
      return {
        ...state,
        filters: { ...state.filters, searchQuery: action.payload }
      };
    
    case actions.SET_READ_STATUS:
      return {
        ...state,
        filters: { ...state.filters, readStatus: action.payload }
      };
    
    case actions.SET_STARRED_ONLY:
      return {
        ...state,
        filters: { ...state.filters, starredOnly: action.payload }
      };
    
    case actions.SET_SELECTED_TAGS:
      return {
        ...state,
        filters: { ...state.filters, selectedTags: action.payload }
      };
    
    case actions.SET_ACTIVE_LIST:
      return {
        ...state,
        filters: { 
          ...state.filters, 
          activeListId: action.payload,
          // Clear other filters when switching lists
          searchQuery: '',
          readStatus: 'all',
          starredOnly: false,
          selectedTags: []
        }
      };
    
    case actions.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
      };
    
    case actions.SET_SIDEBAR_OPEN:
      return {
        ...state,
        ui: { ...state.ui, sidebarOpen: action.payload }
      };
    
    case actions.OPEN_CREATE_LIST_MODAL:
      return {
        ...state,
        ui: { ...state.ui, createListModalOpen: true }
      };
    
    case actions.CLOSE_CREATE_LIST_MODAL:
      return {
        ...state,
        ui: { ...state.ui, createListModalOpen: false }
      };
    
    case actions.SET_EDITING_LIST:
      return {
        ...state,
        ui: { ...state.ui, editingListId: action.payload }
      };
    
    case actions.CLEAR_FILTERS:
      return {
        ...state,
        filters: { ...initialState.filters, activeListId: state.filters.activeListId }
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const value = {
    state,
    
    // Filter actions
    setSearchQuery: (query) => 
      dispatch({ type: actions.SET_SEARCH_QUERY, payload: query }),
    
    setReadStatus: (status) => 
      dispatch({ type: actions.SET_READ_STATUS, payload: status }),
    
    setStarredOnly: (starred) => 
      dispatch({ type: actions.SET_STARRED_ONLY, payload: starred }),
    
    setSelectedTags: (tags) => 
      dispatch({ type: actions.SET_SELECTED_TAGS, payload: tags }),
    
    setActiveList: (listId) => 
      dispatch({ type: actions.SET_ACTIVE_LIST, payload: listId }),
    
    clearFilters: () => 
      dispatch({ type: actions.CLEAR_FILTERS }),
    
    // UI actions
    toggleSidebar: () => 
      dispatch({ type: actions.TOGGLE_SIDEBAR }),
    
    setSidebarOpen: (open) => 
      dispatch({ type: actions.SET_SIDEBAR_OPEN, payload: open }),
    
    openCreateListModal: () => 
      dispatch({ type: actions.OPEN_CREATE_LIST_MODAL }),
    
    closeCreateListModal: () => 
      dispatch({ type: actions.CLOSE_CREATE_LIST_MODAL }),
    
    setEditingList: (listId) => 
      dispatch({ type: actions.SET_EDITING_LIST, payload: listId })
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}