import { useState, useRef, useEffect } from 'react';
import { Link, Plus, AlertCircle, Check } from 'lucide-react';
import { Button } from '../ui';
import { extractMetadata, isValidUrl } from '../../services/metadataService';

export default function AddArticleInput({ onArticleAdded, existingUrls = [] }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handle paste event
  const handlePaste = async (e) => {
    const pastedText = e.clipboardData.getData('text').trim();
    
    if (isValidUrl(pastedText)) {
      e.preventDefault();
      setUrl(pastedText);
      // Auto-submit on paste if it's a valid URL
      await handleSubmit(pastedText);
    }
  };

  const handleSubmit = async (urlToSubmit = url) => {
    const trimmedUrl = urlToSubmit.trim();
    
    // Validation
    if (!trimmedUrl) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setError('Please enter a valid URL (starting with http:// or https://)');
      return;
    }

    // Check for duplicates
    if (existingUrls.includes(trimmedUrl)) {
      setError('This article is already in your library');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await extractMetadata(trimmedUrl);

      if (!result.success) {
        setError(result.error || 'Failed to extract article metadata');
        return;
      }

      // Create article object
      const article = {
        url: trimmedUrl,
        title: result.data.title,
        publication: result.data.publication,
        summary: result.data.summary,
        imageUrl: result.data.imageUrl,
        faviconUrl: result.data.faviconUrl,
        readingTime: result.data.readingTime,
        tags: result.data.suggestedTags,
      };

      // Call parent callback
      await onArticleAdded(article);
      
      // Clear input and show success
      setUrl('');
      setSuccess(true);
      inputRef.current?.focus();

    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* URL Input */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            <Link size={18} />
          </div>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="Paste an article URL..."
            disabled={isLoading}
            className={`
              w-full pl-10 pr-4 py-3
              font-sans text-sm text-ink-900
              bg-white border rounded-lg
              transition-all duration-150
              placeholder:text-ink-400
              focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
              disabled:bg-ink-50 disabled:text-ink-400
              ${error 
                ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                : 'border-ink-300 hover:border-ink-400'
              }
            `}
          />
        </div>
        
        {/* Submit Button */}
        <Button
          onClick={() => handleSubmit()}
          disabled={isLoading || !url.trim()}
          loading={isLoading}
          icon={Plus}
          className="shrink-0"
        >
          {isLoading ? 'Adding...' : 'Add'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 font-sans text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 text-green-600 font-sans text-sm">
          <Check size={16} />
          <span>Article added successfully!</span>
        </div>
      )}
    </div>
  );
}