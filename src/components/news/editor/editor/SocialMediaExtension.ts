import { Node } from '@tiptap/core';

export interface SocialMediaOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    socialMedia: {
      setSocialMedia: (options: { url: string; platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' }) => ReturnType;
    };
  }
}

export const SocialMedia = Node.create<SocialMediaOptions>({
  name: 'socialMedia',

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
      platform: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-social-media]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, platform } = node.attrs;
    
    return [
      'div',
      {
        'data-social-media': '',
        'data-platform': platform,
        class: 'social-media-embed',
        style: 'max-width: 550px; margin: 1rem auto;',
      },
      [
        'iframe',
        {
          src,
          class: 'w-full border-0 rounded-lg',
          style: 'min-height: 400px;',
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
      setSocialMedia:
        (options) =>
        ({ commands }) => {
          const embedUrl = convertSocialMediaUrl(options.url, options.platform);
          
          if (!embedUrl) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: embedUrl,
              platform: options.platform,
            },
          });
        },
    };
  },
});

function convertSocialMediaUrl(url: string, platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok'): string | null {
  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'twitter': {
        // Extract tweet ID from various Twitter URL formats
        const tweetMatch = url.match(/status\/(\d+)/);
        if (tweetMatch) {
          return `https://platform.twitter.com/embed/Tweet.html?id=${tweetMatch[1]}`;
        }
        break;
      }
      
      case 'instagram': {
        // Instagram embed URL format
        if (urlObj.hostname.includes('instagram.com')) {
          const cleanUrl = url.split('?')[0];
          return `${cleanUrl}embed/`;
        }
        break;
      }
      
      case 'facebook': {
        // Facebook embed URL format
        if (urlObj.hostname.includes('facebook.com')) {
          return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}`;
        }
        break;
      }
      
      case 'tiktok': {
        // TikTok embed URL format
        const videoMatch = url.match(/video\/(\d+)/);
        if (videoMatch) {
          return `https://www.tiktok.com/embed/v2/${videoMatch[1]}`;
        }
        break;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Invalid social media URL:', error);
    return null;
  }
}
