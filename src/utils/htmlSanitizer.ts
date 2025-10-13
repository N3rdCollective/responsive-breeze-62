import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML elements while removing dangerous scripts and attributes
 */
export const sanitizeHtml = (htmlString: string): string => {
  if (!htmlString) return '';
  
  // Configure DOMPurify with safe defaults for rich text content
  const config = {
    ALLOWED_TAGS: [
      // Text formatting
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
      // Headings
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li',
      // Links and media
      'a', 'img', 'video', 'audio', 'source', 'iframe',


      // Tables
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      // Quotes and code
      'blockquote', 'code', 'pre',
      // Divs and spans for formatting
      'div', 'span',
      // Other safe elements
      'hr', 'mark', 'small'
    ],
    ALLOWED_ATTR: [
      // Safe attributes for links
      'href', 'title', 'target', 'rel',
      // Safe attributes for media and iframes
      'src', 'alt', 'width', 'height', 'controls', 'autoplay', 'muted',
      'frameborder', 'allowfullscreen', 'allow', 'loading', 'sandbox',
      // Safe formatting attributes
      'class', 'style',
      // Embed data attributes
      'data-video', 'data-social-media', 'data-platform', 'data-audio-embed',
      'data-interactive-embed', 'data-document-embed', 'data-type',
      'data-code-block', 'data-language', 'data-code', 'onclick', 'innerHTML',
      // Table attributes
      'colspan', 'rowspan',
      // Other safe attributes
      'id', 'name'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Remove any scripts, event handlers, or dangerous content
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  };

  // Add custom hook to validate iframe sources
  DOMPurify.addHook('beforeSanitizeElements', function (node) {
    if (node.nodeName === 'IFRAME') {
      const element = node as Element;
      const src = element.getAttribute('src');
      if (src) {
        // Allow iframes from trusted platforms
        const trustedDomains = [
          // Video platforms
          'https://www.youtube.com/embed/',
          'https://player.vimeo.com/video/',
          'https://youtube.com/embed/',
          'https://vimeo.com/embed/',
          // Social media platforms
          'https://platform.twitter.com/embed/',
          'https://www.instagram.com/p/',
          'https://www.facebook.com/plugins/',
          'https://www.tiktok.com/embed/',
          // Audio platforms
          'https://open.spotify.com/embed/',
          'https://w.soundcloud.com/player/',
          'https://embed.music.apple.com/',
          // Interactive platforms
          'https://www.google.com/maps/embed/',
          'https://codepen.io/embed/',
          'https://jsfiddle.net/',
          'https://codesandbox.io/embed/',
          // Document platforms
          'https://docs.google.com/viewer',
          'https://docs.google.com/document/',
          'https://docs.google.com/spreadsheets/',
          'https://docs.google.com/presentation/',
          'https://www.slideshare.net/'
        ];
        
        const isTrusted = trustedDomains.some(domain => src.startsWith(domain));
        
        if (!isTrusted) {
          console.warn('Blocked iframe from untrusted source:', src);
          element.remove();
          return;
        }
      } else {
        // Remove iframes without src attribute
        element.remove();
        return;
      }
    }
  });
  
  const sanitized = DOMPurify.sanitize(htmlString, config);
  
  // Log if content was modified during sanitization
  if (sanitized !== htmlString && typeof window !== 'undefined') {
    // Content was sanitized - could indicate XSS attempt
    console.warn('Content was sanitized during HTML cleaning, possible XSS attempt detected');
  }
  
  return sanitized;
};

/**
 * Create sanitized props for dangerouslySetInnerHTML
 * Use this instead of directly using dangerouslySetInnerHTML
 */
export const createSafeHtml = (htmlString: string) => ({
  __html: sanitizeHtml(htmlString)
});
