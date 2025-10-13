import { Node } from '@tiptap/core';

export interface DocumentOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    document: {
      setDocument: (options: { url: string; type: 'pdf' | 'gdocs' | 'slideshare' }) => ReturnType;
    };
  }
}

export const Document = Node.create<DocumentOptions>({
  name: 'document',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      type: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-document-embed]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, type } = node.attrs;
    
    const height = type === 'pdf' ? '600' : '500';
    
    return [
      'div',
      {
        'data-document-embed': '',
        'data-type': type,
        class: 'document-embed',
        style: 'max-width: 100%; margin: 1rem 0;',
      },
      [
        'iframe',
        {
          src,
          height,
          class: 'w-full border-0 rounded-lg',
          style: 'border: 1px solid hsl(var(--border));',
          allowfullscreen: this.options.allowFullscreen ? '' : undefined,
          loading: 'lazy',
          ...this.options.HTMLAttributes,
          ...HTMLAttributes,
        },
      ],
    ];
  },

  addCommands() {
    return {
      setDocument:
        (options) =>
        ({ commands }) => {
          const embedUrl = convertDocumentUrl(options.url, options.type);
          
          if (!embedUrl) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: embedUrl,
              type: options.type,
            },
          });
        },
    };
  },
});

function convertDocumentUrl(
  url: string,
  type: 'pdf' | 'gdocs' | 'slideshare'
): string | null {
  try {
    const urlObj = new URL(url);
    
    switch (type) {
      case 'pdf': {
        // Use Google Docs PDF viewer
        if (url.endsWith('.pdf')) {
          return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        }
        break;
      }
      
      case 'gdocs': {
        // Google Docs embed format
        if (urlObj.hostname.includes('docs.google.com')) {
          // Convert /edit to /preview for embedding
          if (url.includes('/edit')) {
            return url.replace('/edit', '/preview');
          }
          // If it's a view URL, convert to preview
          if (url.includes('/view')) {
            return url.replace('/view', '/preview');
          }
          // Already a preview URL
          if (url.includes('/preview')) {
            return url;
          }
        }
        break;
      }
      
      case 'slideshare': {
        // SlideShare embed format
        if (urlObj.hostname.includes('slideshare.net')) {
          // SlideShare doesn't have a simple URL conversion
          // Users should use the embed code from SlideShare
          // For now, return the URL as-is
          return url;
        }
        break;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Invalid document URL:', error);
    return null;
  }
}
