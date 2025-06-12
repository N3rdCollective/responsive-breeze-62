
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
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});

function convertToEmbedUrl(url: string): string {
  if (!url) return '';

  // YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo URLs
  const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // If it's already an embed URL or iframe src, return as is
  if (url.includes('embed') || url.includes('player')) {
    return url;
  }

  // For other platforms, return the original URL (user might paste an embed URL directly)
  return url;
}
