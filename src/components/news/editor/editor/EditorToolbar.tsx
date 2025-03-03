
import React from 'react';
import { Editor } from '@tiptap/react';
import { useEditorUtils } from './useEditorUtils';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Undo,
  Redo,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';

const EditorToolbar = ({ editor }: { editor: Editor }) => {
  const { addImage, addLink, setColor, setTextAlign } = useEditorUtils(editor);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-b p-1 flex flex-wrap gap-1 bg-muted/40">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-8" />
      
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-label="Heading 1"
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Heading 2"
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        aria-label="Heading 3"
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-8" />
      
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet List"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered List"
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-8" />
      
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => setTextAlign('left')}
        aria-label="Align Left"
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => setTextAlign('center')}
        aria-label="Align Center"
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => setTextAlign('right')}
        aria-label="Align Right"
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-8" />
      
      <Toggle
        size="sm"
        pressed={editor.isActive('link')}
        onPressedChange={addLink}
        aria-label="Link"
        title="Link"
      >
        <Link className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        onPressedChange={addImage}
        aria-label="Image"
        title="Image"
      >
        <Image className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        onPressedChange={setColor}
        aria-label="Text Color"
        title="Text Color"
      >
        <Palette className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="h-8" />
      
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export default EditorToolbar;
