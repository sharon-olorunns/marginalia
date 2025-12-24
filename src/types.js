/**
 * @typedef {Object} Article
 * @property {number} [id] - Auto-generated ID
 * @property {string} url - Article URL (unique)
 * @property {string} title - Article title
 * @property {string} publication - Source name (e.g., "Lenny's Newsletter")
 * @property {string} summary - Short description
 * @property {string|null} imageUrl - Preview image URL
 * @property {string|null} faviconUrl - Publication favicon
 * @property {number} readingTime - Estimated minutes to read
 * @property {string[]} tags - Category tags
 * @property {boolean} isRead - Read status
 * @property {boolean} isStarred - Favorited status
 * @property {Date} createdAt - When saved
 * @property {Date} updatedAt - Last modified
 */

/**
 * @typedef {Object} List
 * @property {number} [id] - Auto-generated ID
 * @property {string} name - List name
 * @property {boolean} isDefault - True for "All Articles" & "Favorites"
 * @property {boolean} isCurrentlyReading - Pinned as active list
 * @property {Date} createdAt - When created
 */

/**
 * @typedef {Object} ArticleList
 * @property {number} [id] - Auto-generated ID
 * @property {number} articleId - Reference to article
 * @property {number} listId - Reference to list
 */

export {}