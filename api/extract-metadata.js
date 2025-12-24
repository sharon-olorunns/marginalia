import * as cheerio from 'cheerio';

// Domain to tag mapping
const DOMAIN_TAGS = {
  'substack.com': 'Substack',
  'medium.com': 'Medium',
  'github.com': 'Tech',
  'nytimes.com': 'News',
  'theguardian.com': 'News',
  'bbc.com': 'News',
  'bbc.co.uk': 'News',
  'hbr.org': 'Business',
  'forbes.com': 'Business',
  'techcrunch.com': 'Tech',
  'wired.com': 'Tech',
  'theverge.com': 'Tech',
  'arstechnica.com': 'Tech',
  'reuters.com': 'News',
  'economist.com': 'Business',
  'nature.com': 'Science',
  'sciencedirect.com': 'Science',
  'arxiv.org': 'Science',
  'dev.to': 'Tech',
  'hackernoon.com': 'Tech',
  'producthunt.com': 'Tech',
  'linkedin.com': 'Business',
  'twitter.com': 'Social',
  'x.com': 'Social',
};

// Validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Extract domain from URL
function getDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// Generate tags based on domain
function generateTags(domain) {
  const tags = [];
  
  for (const [domainPattern, tag] of Object.entries(DOMAIN_TAGS)) {
    if (domain.includes(domainPattern)) {
      tags.push(tag);
      break;
    }
  }
  
  return tags.length > 0 ? tags : ['Article'];
}

// Estimate reading time from content
function estimateReadingTime($) {
  // Try to find article content
  const selectors = [
    'article',
    '[class*="post-content"]',
    '[class*="article-body"]',
    '[class*="entry-content"]',
    '[class*="post-body"]',
    '[class*="story-body"]',
    'main',
    '.content',
  ];
  
  let text = '';
  
  for (const selector of selectors) {
    const content = $(selector).text();
    if (content && content.length > text.length) {
      text = content;
    }
  }
  
  // Fallback to body if nothing found
  if (!text || text.length < 100) {
    text = $('body').text();
  }
  
  // Count words
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  
  // Average reading speed: 200-250 words per minute
  const readingTime = Math.ceil(wordCount / 220);
  
  // Sanity check: between 1 and 60 minutes
  return Math.max(1, Math.min(60, readingTime || 5));
}

// Clean and truncate text
function cleanText(text, maxLength = 500) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const { url } = req.body;

  // Validate URL
  if (!url) {
    return res.status(400).json({ 
      success: false, 
      error: 'URL is required' 
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid URL format' 
    });
  }

  try {
    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Marginalia/1.0; +https://marginalia.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const domain = getDomain(url);

    // Extract metadata with fallbacks
    const title = cleanText(
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text()
    ) || 'Untitled';

    const publication = cleanText(
      $('meta[property="og:site_name"]').attr('content') ||
      $('meta[name="application-name"]').attr('content') ||
      $('meta[name="publisher"]').attr('content')
    ) || domain;

    const summary = cleanText(
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('p').first().text(),
      300
    ) || '';

    // Get image URL and make it absolute
    let imageUrl = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content') ||
      null;

    // Convert relative URLs to absolute
    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        imageUrl = new URL(imageUrl, url).href;
      } catch {
        imageUrl = null;
      }
    }

    // Get favicon
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    // Estimate reading time
    const readingTime = estimateReadingTime($);

    // Generate tags
    const suggestedTags = generateTags(domain);

    // Return metadata
    return res.status(200).json({
      success: true,
      data: {
        title,
        publication,
        summary,
        imageUrl,
        faviconUrl,
        readingTime,
        suggestedTags,
      },
    });

  } catch (error) {
    console.error('Metadata extraction failed:', error);

    // Handle specific errors
    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: 'Request timed out. The website took too long to respond.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to extract metadata. The website may be blocking requests.',
    });
  }
}