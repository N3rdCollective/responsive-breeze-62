import { useCallback } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Mention from '@tiptap/extension-mention';
import { supabase } from '@/integrations/supabase/client';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance, type Props as TippyProps } from 'tippy.js';
import MentionList, { type MentionListItem, type MentionListProps, type MentionListRef } from './MentionList';

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
          if (query.length < 1) {
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
          let component: ReactRenderer<typeof MentionList, MentionListProps & { ref: React.Ref<MentionListRef> }>;
          let popup: TippyInstance<TippyProps>[] | undefined;

          return {
            onStart: options => {
              component = new ReactRenderer(MentionList, {
                props: { items: options.items, command: options.command },
                editor: options.editor,
                // The 'ref' for useImperativeHandle is handled by ReactRenderer itself
                // when it instantiates MentionList as a forwardRef component.
                // The instance with the imperative handle will be available on component.ref.
              });

              if (!options.clientRect) {
                return;
              }
              
              popup = tippy(document.body, {
                getReferenceClientRect: options.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate(options) {
              component.updateProps({ items: options.items, command: options.command });

              if (!options.clientRect) {
                return;
              }
              
              if (popup && popup[0]) {
                 popup[0].setProps({ 
                    getReferenceClientRect: options.clientRect as () => DOMRect,
                 });
              }
            },
            onKeyDown(options) {
              if (options.event.key === 'Escape' && popup && popup[0]) {
                popup[0].hide();
                return true;
              }
              if (component && component.ref) {
                return (component.ref as MentionListRef).onKeyDown(options);
              }
              return false;
            },
            onExit() {
              if (popup && popup[0]) popup[0].destroy();
              if (popup && popup.length > 1) { // Safety for multiple tippy instances
                popup.forEach(p => p.destroy());
              }
              component.destroy();
            },
          };
        },
      },
    }),
  ], [placeholderText]);
};
