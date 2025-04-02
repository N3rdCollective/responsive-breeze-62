
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { Node, mergeAttributes } from '@tiptap/core';
import { Editor, Command } from '@tiptap/core';

// Helper function to convert various YouTube URL formats to embed URLs
const getYoutubeEmbedUrl = (url: string) => {
  if (!url) return '';
  
  // Convert various YouTube URL formats to the standard embed format
  // Example: https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
  const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(youtubeRegex);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  
  // Handle Vimeo or other video URLs
  if (url.includes('vimeo.com')) {
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }
  
  // If it's already an embed URL or other video URL, return as is
  return url;
};

// Create a custom Video extension for TipTap
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-video': '', class: 'video-embed' },
      [
        'iframe',
        mergeAttributes(
          this.options.HTMLAttributes,
          {
            src: getYoutubeEmbedUrl(HTMLAttributes.src),
            title: HTMLAttributes.title,
            frameborder: '0',
            allowfullscreen: 'true',
            allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            width: HTMLAttributes.width,
            height: HTMLAttributes.height,
            class: 'w-full aspect-video rounded-md',
          }
        ),
      ],
    ];
  },
  
  addCommands() {
    return {
      setVideo: (attributes) => {
        // Return a function that accepts the editor's command API
        return ({ commands }) => {
          // Use the insertContent command from the commands API
          return commands.insertContent({
            type: this.name,
            attrs: attributes
          });
        };
      }
    };
  },
});

export const useEditorExtensions = () => {
  return [
    StarterKit,
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-500 underline',
      },
    }),
    Placeholder.configure({
      placeholder: 'Write something...',
    }),
    TextStyle,
    Color,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      defaultAlignment: 'left',
    }),
    Video,
  ];
};
