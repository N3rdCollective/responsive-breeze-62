import { Node } from '@tiptap/core';

export interface AudioOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (options: { url: string; platform?: 'spotify' | 'soundcloud' | 'apple' | 'direct' }) => ReturnType;
    };
  }
}

export const Audio = Node.create<AudioOptions>({
  name: 'audio',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      platform: {
        default: 'direct',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-audio-embed]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, platform } = node.attrs;
    
    if (platform === 'direct') {
      // Direct audio file
      return [
        'div',
        {
          'data-audio-embed': '',
          class: 'audio-embed',
          style: 'max-width: 100%; margin: 1rem 0;',
        },
        [
          'audio',
          {
            src,
            controls: '',
            class: 'w-full rounded-lg',
            ...this.options.HTMLAttributes,
            ...HTMLAttributes,
          },
        ],
      ];
    }
    
    // Embedded audio players (Spotify, SoundCloud, Apple Music)
    const height = platform === 'spotify' ? '152' : platform === 'soundcloud' ? '166' : '150';
    
    return [
      'div',
      {
        'data-audio-embed': '',
        'data-platform': platform,
        class: 'audio-embed',
        style: 'max-width: 100%; margin: 1rem 0;',
      },
      [
        'iframe',
        {
          src,
          height,
          class: 'w-full border-0 rounded-lg',
          loading: 'lazy',
          allow: 'encrypted-media',
          ...this.options.HTMLAttributes,
          ...HTMLAttributes,
        },
      ],
    ];
  },

  addCommands() {
    return {
      setAudio:
        (options) =>
        ({ commands }) => {
          const { embedUrl, platform } = convertAudioUrl(options.url, options.platform);
          
          if (!embedUrl) {
            return false;
          }

          return commands.insertContent({
            type: this.name,
            attrs: {
              src: embedUrl,
              platform: platform || 'direct',
            },
          });
        },
    };
  },
});

function convertAudioUrl(
  url: string, 
  platform?: 'spotify' | 'soundcloud' | 'apple' | 'direct'
): { embedUrl: string | null; platform: string } {
  try {
    const urlObj = new URL(url);
    
    // Auto-detect platform if not specified
    if (!platform) {
      if (urlObj.hostname.includes('spotify.com')) {
        platform = 'spotify';
      } else if (urlObj.hostname.includes('soundcloud.com')) {
        platform = 'soundcloud';
      } else if (urlObj.hostname.includes('apple.com') || urlObj.hostname.includes('music.apple.com')) {
        platform = 'apple';
      } else {
        platform = 'direct';
      }
    }
    
    switch (platform) {
      case 'spotify': {
        // Convert Spotify URLs to embed format
        // https://open.spotify.com/track/ID -> https://open.spotify.com/embed/track/ID
        if (urlObj.hostname.includes('spotify.com')) {
          const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
          return { embedUrl, platform: 'spotify' };
        }
        break;
      }
      
      case 'soundcloud': {
        // SoundCloud uses oEmbed, simplified embed format
        if (urlObj.hostname.includes('soundcloud.com')) {
          return { 
            embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`,
            platform: 'soundcloud'
          };
        }
        break;
      }
      
      case 'apple': {
        // Apple Music embed format
        if (urlObj.hostname.includes('music.apple.com')) {
          const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');
          return { embedUrl, platform: 'apple' };
        }
        break;
      }
      
      case 'direct': {
        // Direct audio file URL
        return { embedUrl: url, platform: 'direct' };
      }
    }
    
    return { embedUrl: null, platform: platform || 'direct' };
  } catch (error) {
    console.error('Invalid audio URL:', error);
    return { embedUrl: null, platform: platform || 'direct' };
  }
}
