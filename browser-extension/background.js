// Supabase configuration
const SUPABASE_URL = 'https://qaumpwsztgdoabshlphf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW1wd3N6dGdkb2Fic2hscGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTIzNTIsImV4cCI6MjA4MjI2ODM1Mn0.Kff9GrL2Yn6oqZwcK1-3CTF4VirtHg8ei2MhQUNI25o';
const APP_URL = 'https://marginalia-reads.vercel.app'; // Updated for production


// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SESSION') {
    getSession().then(sendResponse);
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'SET_SESSION') {
    setSession(message.session).then(sendResponse);
    return true;
  }
  
  if (message.type === 'CLEAR_SESSION') {
    clearSession().then(sendResponse);
    return true;
  }
  
  if (message.type === 'REFRESH_SESSION') {
    refreshSession().then(sendResponse);
    return true;
  }
});

// Get session from storage
async function getSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['marginalia_session'], (result) => {
      resolve(result.marginalia_session || null);
    });
  });
}

// Set session in storage
async function setSession(session) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ marginalia_session: session }, () => {
      resolve({ success: true });
    });
  });
}

// Clear session from storage
async function clearSession() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['marginalia_session'], () => {
      resolve({ success: true });
    });
  });
}

// Refresh the session using refresh token
async function refreshSession() {
  try {
    const session = await getSession();
    
    if (!session?.refresh_token) {
      return { error: 'No refresh token' };
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        refresh_token: session.refresh_token,
      }),
    });

    if (!response.ok) {
      await clearSession();
      return { error: 'Failed to refresh session' };
    }

    const data = await response.json();
    
    const newSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000),
      user: data.user,
    };

    await setSession(newSession);
    return { session: newSession };

  } catch (error) {
    console.error('Refresh error:', error);
    return { error: error.message };
  }
}

// Check and refresh session on startup
chrome.runtime.onStartup.addListener(async () => {
  const session = await getSession();
  if (session?.expires_at && Date.now() > session.expires_at - 60000) {
    await refreshSession();
  }
});