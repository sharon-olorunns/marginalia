// Check if we're in a browser that supports extensions
export const isExtensionEnvironment = () => {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  };
  
  // Send session to extension
  export const sendSessionToExtension = async (session) => {
    // Method 1: Use localStorage that the extension can read
    if (session) {
      const extensionSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at || (Date.now() + 3600000),
        user: session.user,
      };
      localStorage.setItem('marginalia_extension_session', JSON.stringify(extensionSession));
    } else {
      localStorage.removeItem('marginalia_extension_session');
    }
    
    // Method 2: Post message that extension content script can listen to
    window.postMessage({
      type: 'MARGINALIA_SESSION_UPDATE',
      session: session,
    }, '*');
  };
  
  // Clear extension session
  export const clearExtensionSession = () => {
    localStorage.removeItem('marginalia_extension_session');
    window.postMessage({
      type: 'MARGINALIA_SESSION_UPDATE',
      session: null,
    }, '*');
  };