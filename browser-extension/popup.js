// Supabase configuration - you'll need to update these
const SUPABASE_URL = 'https://qaumpwsztgdoabshlphf.supabase.co'; // e.g., https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdW1wd3N6dGdkb2Fic2hscGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTIzNTIsImV4cCI6MjA4MjI2ODM1Mn0.Kff9GrL2Yn6oqZwcK1-3CTF4VirtHg8ei2MhQUNI25o';
const APP_URL = 'https://marginalia-reads.vercel.app'; // Changed from localhost

// State
let currentUser = null;
let currentTab = null;
let currentSession = null;

// DOM elements
const states = {
  loading: document.getElementById('loading'),
  notSignedIn: document.getElementById('not-signed-in'),
  ready: document.getElementById('ready'),
  saving: document.getElementById('saving'),
  success: document.getElementById('success'),
  error: document.getElementById('error'),
  alreadySaved: document.getElementById('already-saved'),
};

// Show a specific state
function showState(stateName) {
  Object.entries(states).forEach(([name, element]) => {
    if (name === stateName) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  });
}

// Initialize popup
async function init() {
  showState('loading');

  try {
    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // Check for valid URL
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      showError('Cannot save this page');
      return;
    }

    // Get session from background
    const response = await chrome.runtime.sendMessage({ type: 'GET_SESSION' });
    currentSession = response;

    if (currentSession?.user) {
      // Check if session is expired
      if (currentSession.expires_at && Date.now() > currentSession.expires_at - 60000) {
        // Try to refresh
        const refreshResponse = await chrome.runtime.sendMessage({ type: 'REFRESH_SESSION' });
        if (refreshResponse.session) {
          currentSession = refreshResponse.session;
        } else {
          showState('notSignedIn');
          return;
        }
      }
      
      currentUser = currentSession.user;
      await showReadyState();
    } else {
      showState('notSignedIn');
    }
  } catch (err) {
    console.error('Init error:', err);
    showError('Failed to initialize');
  }
}

// Show ready state with page info
async function showReadyState() {
  if (!currentTab) return;

  // Update UI with page info
  const pageTitle = document.getElementById('page-title');
  const pageUrl = document.getElementById('page-url');
  const userEmail = document.getElementById('user-email');
  const favicon = document.getElementById('favicon');

  pageTitle.textContent = currentTab.title || 'Untitled';
  pageUrl.textContent = new URL(currentTab.url).hostname;
  userEmail.textContent = currentUser.email;

  if (currentTab.favIconUrl) {
    favicon.src = currentTab.favIconUrl;
    favicon.onerror = () => {
      favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(currentTab.url).hostname}&sz=64`;
    };
  } else {
    favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(currentTab.url).hostname}&sz=64`;
  }

  // Check if already saved
  const alreadySaved = await checkIfAlreadySaved(currentTab.url);
  
  if (alreadySaved) {
    showState('alreadySaved');
  } else {
    showState('ready');
  }
}

// Check if URL is already saved
async function checkIfAlreadySaved(url) {
  try {
    if (!currentSession?.access_token || !currentUser?.id) return false;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/articles?url=eq.${encodeURIComponent(url)}&user_id=eq.${currentUser.id}&select=id`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${currentSession.access_token}`,
        },
      }
    );

    if (!response.ok) return false;
    
    const data = await response.json();
    return data.length > 0;
  } catch (err) {
    console.error('Check saved error:', err);
    return false;
  }
}

// Extract metadata from page
async function extractMetadata(tab) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const getMetaContent = (selectors) => {
          for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el?.content) return el.content;
          }
          return null;
        };

        return {
          title: getMetaContent(['meta[property="og:title"]', 'meta[name="twitter:title"]']) 
                 || document.title || 'Untitled',
          description: getMetaContent(['meta[property="og:description"]', 'meta[name="twitter:description"]', 'meta[name="description"]']) || '',
          image: getMetaContent(['meta[property="og:image"]', 'meta[name="twitter:image"]']) || '',
          siteName: getMetaContent(['meta[property="og:site_name"]', 'meta[name="application-name"]']) 
                    || new URL(window.location.href).hostname,
        };
      },
    });

    return result.result;
  } catch (err) {
    console.error('Extract metadata error:', err);
    return {
      title: tab.title || 'Untitled',
      description: '',
      image: '',
      siteName: new URL(tab.url).hostname,
    };
  }
}

// Estimate reading time
async function estimateReadingTime(tab) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const article = document.querySelector('article') || document.body;
        const text = article.innerText || '';
        const words = text.split(/\s+/).length;
        return Math.max(1, Math.min(60, Math.round(words / 220)));
      },
    });
    return result.result;
  } catch {
    return 5;
  }
}

// Guess tags from URL
function guessTagsFromUrl(url) {
  const domain = new URL(url).hostname.toLowerCase();
  
  const domainTags = {
    'substack.com': 'Substack',
    'medium.com': 'Medium',
    'github.com': 'Tech',
    'dev.to': 'Tech',
    'nytimes.com': 'News',
    'theguardian.com': 'News',
    'bbc.com': 'News',
    'bbc.co.uk': 'News',
    'techcrunch.com': 'Tech',
    'theverge.com': 'Tech',
    'wired.com': 'Tech',
    'arstechnica.com': 'Tech',
    'hbr.org': 'Business',
    'forbes.com': 'Business',
    'bloomberg.com': 'Business',
    'reuters.com': 'News',
    'wsj.com': 'Business',
  };

  const tags = [];
  
  for (const [key, tag] of Object.entries(domainTags)) {
    if (domain.includes(key)) {
      tags.push(tag);
      break;
    }
  }

  // Check for substack subdomain
  if (domain.endsWith('.substack.com') || domain.includes('substack')) {
    if (!tags.includes('Substack')) tags.push('Substack');
  }

  return tags.length > 0 ? tags : ['Article'];
}

// Save article
async function saveArticle() {
    if (!currentTab || !currentUser || !currentSession) return;

    showState('saving');

    try {
        // First, check if article already exists
        const existsResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/articles?url=eq.${encodeURIComponent(currentTab.url)}&user_id=eq.${currentUser.id}&select=id`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${currentSession.access_token}`,
                },
            }
        );

        if (existsResponse.ok) {
            const existingArticles = await existsResponse.json();
            if (existingArticles.length > 0) {
                showState('alreadySaved');
                return;
            }
        }

        // Extract metadata
        const metadata = await extractMetadata(currentTab);
        const readingTime = await estimateReadingTime(currentTab);

        // Prepare article data
        const article = {
            user_id: currentUser.id,
            url: currentTab.url,
            title: metadata.title,
            publication: metadata.siteName,
            summary: metadata.description.substring(0, 500),
            image_url: metadata.image || null,
            favicon_url: currentTab.favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(currentTab.url).hostname}&sz=64`,
            reading_time: readingTime,
            tags: guessTagsFromUrl(currentTab.url),
            is_read: false,
            is_starred: false,
        };

        // Save to Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${currentSession.access_token}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify(article),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Check for duplicate constraint violation
            if (response.status === 409 || errorData.code === '23505') {
                showState('alreadySaved');
                return;
            }

            throw new Error(errorData.message || `Failed to save (${response.status})`);
        }

        showState('success');

    } catch (err) {
        console.error('Save error:', err);
        showError(err.message || 'Failed to save article');
    }
}

// Show error
function showError(message) {
  document.getElementById('error-message').textContent = message;
  showState('error');
}

// Sign in - open auth page
function openSignIn() {
  chrome.tabs.create({ url: `${APP_URL}?extension=true` });
  window.close();
}

// Sign out
async function signOut() {
  await chrome.runtime.sendMessage({ type: 'CLEAR_SESSION' });
  currentUser = null;
  currentSession = null;
  showState('notSignedIn');
}

// Open app
function openApp() {
  chrome.tabs.create({ url: APP_URL });
  window.close();
}

// Event listeners
document.getElementById('sign-in-btn').addEventListener('click', openSignIn);
document.getElementById('open-app-link').addEventListener('click', (e) => {
  e.preventDefault();
  openApp();
});
document.getElementById('save-btn').addEventListener('click', saveArticle);
document.getElementById('sign-out-btn').addEventListener('click', signOut);
document.getElementById('retry-btn').addEventListener('click', saveArticle);
document.getElementById('view-article-link').addEventListener('click', (e) => {
  e.preventDefault();
  openApp();
});
document.getElementById('view-existing-link').addEventListener('click', (e) => {
  e.preventDefault();
  openApp();
});

// Initialize
init();