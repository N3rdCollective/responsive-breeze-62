import { Node } from '@tiptap/core';

export interface InteractiveOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    interactive: {
      setInteractive: (options: { url: string; type: 'maps' | 'codepen' | 'jsfiddle' | 'codesandbox' }) => ReturnType;
    };
  }
}

export const Interactive = Node.create<InteractiveOptions>({
  name: 'interactive',

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
        tag: 'div[data-interactive-embed]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, type } = node.attrs;
    
    const height = type === 'maps' ? '450' : '500';
    
    return [
      'div',
      {
        'data-interactive-embed': '',
        'data-type': type,
        class: 'interactive-embed',
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
          sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation',
          ...this.options.HTMLAttributes,
          ...HTMLAttributes,
        },
      ],
    ];
  },

  addCommands() {
    return {
      setInteractive:
        (options) =>
        ({ commands }) => {
          const embedUrl = convertInteractiveUrl(options.url, options.type);
          
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

function convertInteractiveUrl(
  url: string,
  type: 'maps' | 'codepen' | 'jsfiddle' | 'codesandbox'
): string | null {
  try {
    const urlObj = new URL(url);
    
    switch (type) {
      case 'maps': {
        // Google Maps embed URL
        if (urlObj.hostname.includes('google.com')) {
          // If it's already an embed URL, return it
          if (url.includes('/embed')) {
            return url;
          }
          
          // Convert regular Google Maps URL to embed
          const placeMatch = url.match(/place\/([^/]+)/);
          if (placeMatch) {
            return `https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(placeMatch[1])}`;
          }
        }
        break;
      }
      
      case 'codepen': {
        // CodePen embed format
        if (urlObj.hostname.includes('codepen.io')) {
          // Convert /pen/ID to /embed/ID
          return url.replace('/pen/', '/embed/');
        }
        break;
      }
      
      case 'jsfiddle': {
        // JSFiddle embed format
        if (urlObj.hostname.includes('jsfiddle.net')) {
          // Add /embedded/ if not present
          if (!url.includes('/embedded/')) {
            return url.endsWith('/') ? `${url}embedded/` : `${url}/embedded/`;
          }
          return url;
        }
        break;
      }
      
      case 'codesandbox': {
        // CodeSandbox embed format
        if (urlObj.hostname.includes('codesandbox.io')) {
          // Convert /s/ID to /embed/ID
          return url.replace('/s/', '/embed/');
        }
        break;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Invalid interactive URL:', error);
    return null;
  }
}
