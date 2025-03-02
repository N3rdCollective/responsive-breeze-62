
import React from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Code,
  Quote,
  Undo,
  Redo,
  Palette
} from 'lucide-react';
import { useEditorUtils } from './useEditorUtils';

interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const { addImage, addLink, setColor, setTextAlign } = useEditorUtils(editor);
  
  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'bg-muted' : ''}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>
      
      {/* Text Alignment Buttons */}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setTextAlign('left')}
        className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setTextAlign('center')}
        className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setTextAlign('right')}
        className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={addImage}
        title="Add Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={addLink}
        className={editor.isActive('link') ? 'bg-muted' : ''}
        title="Add Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={setColor}
        title="Text Color"
      >
        <Palette className="h-4 w-4" />
      </Button>
      
      <div className="grow"></div>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EditorToolbar;
