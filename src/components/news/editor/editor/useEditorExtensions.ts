
import { useCallback } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';

interface EditorExtensionsProps {
  placeholder?: string;
}

export const useEditorExtensions = (props?: EditorExtensionsProps) => {
  const placeholderText = props?.placeholder || 'Start writing...';

  return useCallback(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4],
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Placeholder.configure({
      placeholder: placeholderText,
      emptyEditorClass: 'is-editor-empty',
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: {
        class: 'text-primary underline decoration-primary decoration-1 underline-offset-2 hover:text-primary/80',
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    }),
    Image.configure({
      allowBase64: true,
      HTMLAttributes: {
        class: 'rounded-md max-w-full h-auto',
      },
    }),
    TextStyle,
    Color,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ], [placeholderText]);
};
