import { useCallback } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Mention from '@tiptap/extension-mention';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance, type Props as TippyProps } from 'tippy.js'; // Ensure tippy types are imported
import MentionList, { type MentionListItem } from './MentionList'; // Import the MentionList component

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
    Mention.configure({
      HTMLAttributes: {
        class: 'bg-primary/10 text-primary font-semibold rounded px-1 py-0.5',
      },
      suggestion: {
        char: '@',
        items: async ({ query }: { query: string }): Promise<MentionListItem[]> => {
          if (query.length < 1) { // Fetch only if query is at least 1 char, adjust as needed
            return [];
          }
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, display_name, profile_picture')
            .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
            .limit(5);

          if (error) {
            console.error('Error fetching users for mention:', error);
            return [];
          }
          return data.map(user => ({
            id: user.id,
            label: user.username || user.display_name || 'Unknown',
            username: user.username,
            displayName: user.display_name,
            avatar: user.profile_picture,
          }));
        },
        render: () => {
          let component: ReactRenderer<MentionList, MentionListProps>;
          let popup: TippyInstance<TippyProps>[] | undefined; // Tippy can return an array

          return {
            onStart: props => {
              component = new ReactRenderer(MentionList, {
                props: props.items.length > 0 ? { items: props.items, command: props.command } : { items: [], command: props.command },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }
              
              popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect as () => DOMRect, // Cast clientRect
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(props) {
              component.updateProps(props.items.length > 0 ? { items: props.items, command: props.command } : { items: [], command: props.command });

              if (!props.clientRect) {
                return;
              }
              
              if (popup) {
                 popup[0].setProps({ // Access the first instance if it's an array
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                 });
              }
            },
            onKeyDown(props) {
              if (props.event.key === 'Escape' && popup) {
                popup[0].hide(); // Access the first instance
                return true;
              }
              // Let MentionList handle navigation keys
              return (component.ref as any)?.onKeyDown?.(props) ?? false;
            },
            onExit() {
              if (popup) popup[0].destroy(); // Access the first instance
              component.destroy();
            },
          };
        },
        // command: ({ editor, range, props }) => {
        //   // This is where you define what happens when a suggestion is selected
        //   editor
        //     .chain()
        //     .focus()
        //     .insertContentAt(range, [
        //       {
        //         type: 'mention',
        //         attrs: { id: props.id, label: props.label },
        //       },
        //       {
        //         type: 'text',
        //         text: ' ', // Add a space after the mention
        //       },
        //     ])
        //     .run();
        // },
      },
    }),
  ], [placeholderText]);
};
