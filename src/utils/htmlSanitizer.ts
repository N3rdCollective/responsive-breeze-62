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
      'a', 'img', 'video', 'audio', 'source',
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
      // Safe attributes for media
      'src', 'alt', 'width', 'height', 'controls', 'autoplay', 'muted',
      // Safe formatting attributes
      'class', 'style',
      // Table attributes
      'colspan', 'rowspan',
      // Other safe attributes
      'id', 'name'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // Remove any scripts, event handlers, or dangerous content
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit']
  };
  
  return DOMPurify.sanitize(htmlString, config);
};

/**
 * Create sanitized props for dangerouslySetInnerHTML
 * Use this instead of directly using dangerouslySetInnerHTML
 */
export const createSafeHtml = (htmlString: string) => ({
  __html: sanitizeHtml(htmlString)
});
