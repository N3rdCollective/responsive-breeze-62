
import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',
  
  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {},
    };
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    };
  },

  parseHTML() {
    return [{
      tag: 'div[data-video] iframe',
    }];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = convertToEmbedUrl(HTMLAttributes.src);
    
    return [
      'div',
      { 
        class: 'video-embed',
        'data-video': ''
      },
      [
        'div',
        { class: 'video-container' },
        [
          'iframe',
          mergeAttributes(
            {
              src: embedUrl,
              frameborder: '0',
              allowfullscreen: 'true',
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            },
            this.options.HTMLAttributes,
            HTMLAttributes
          ),
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setVideo: (options: { src: string }) => ({ commands }) => {
        const embedUrl = convertToEmbedUrl(options.src);
        return commands.insertContent({
          type: this.name,
          attrs: { src: embedUrl },
        });
      },
    };
  },
});

function convertToEmbedUrl(url: string): string {
  if (!url) return '';

  console.log('Converting URL:', url);

  // YouTube URLs - more comprehensive regex
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    const embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    console.log('YouTube embed URL:', embedUrl);
    return embedUrl;
  }

  // Vimeo URLs
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    console.log('Vimeo embed URL:', embedUrl);
    return embedUrl;
  }

  // If it's already an embed URL, return as is
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
    console.log('Already embed URL:', url);
    return url;
  }

  // For other platforms, return the original URL (user might paste an embed URL directly)
  console.log('Using original URL:', url);
  return url;
}
