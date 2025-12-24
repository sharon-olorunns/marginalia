const API_URL = import.meta.env.DEV 
  ? '/api/extract-metadata'  // Vite proxy in development
  : '/api/extract-metadata'; // Same path in production

export async function extractMetadata(url) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to extract metadata');
    }

    return data;
  } catch (error) {
    console.error('Metadata service error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to metadata service',
    };
  }
}

// Validate URL format on the client side
export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Extract domain from URL for display
export function getDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}