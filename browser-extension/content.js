// Listen for session updates from the main app
window.addEventListener('message', async (event) => {
    // Only accept messages from the same origin
    if (event.source !== window) return;
    
    if (event.data.type === 'MARGINALIA_SESSION_UPDATE') {
      const session = event.data.session;
      
      if (session) {
        // Send to background script
        await chrome.runtime.sendMessage({
          type: 'SET_SESSION',
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
            user: session.user,
          },
        });
        console.log('Marginalia: Session synced to extension');
      } else {
        await chrome.runtime.sendMessage({ type: 'CLEAR_SESSION' });
        console.log('Marginalia: Session cleared from extension');
      }
    }
  });
  
  // On page load, check for stored session in localStorage
  (async function checkStoredSession() {
    try {
      const stored = localStorage.getItem('marginalia_extension_session');
      if (stored) {
        const session = JSON.parse(stored);
        await chrome.runtime.sendMessage({
          type: 'SET_SESSION',
          session: session,
        });
        console.log('Marginalia: Found and synced stored session');
      }
    } catch (err) {
      console.error('Marginalia: Error checking stored session', err);
    }
  })();