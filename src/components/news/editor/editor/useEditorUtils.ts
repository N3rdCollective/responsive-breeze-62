import { Editor } from '@tiptap/react';

export const useEditorUtils = (editor: Editor) => {
  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
    
    // cancelled
    if (url === null) return;
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setColor = () => {
    if (!editor) return;
    const color = window.prompt('Enter color (hex, rgb, or name)', '#000000');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setTextAlign = (alignment: 'left' | 'center' | 'right') => {
    if (!editor) return;
    editor.chain().focus().setTextAlign(alignment).run();
  };

  return {
    addImage,
    addLink,
    setColor,
    setTextAlign
  };
};
