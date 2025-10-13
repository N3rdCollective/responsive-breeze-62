import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Link as LinkIcon, 
  Image as ImageIcon, 
  Youtube,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Code,
  Quote,
  Undo,
  Redo,
  Music,
  FileText,
  Share2,
  Map
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { EmbedDialog } from '../components/EmbedDialog';

interface EditorToolbarProps {
  editor: Editor;
  disabled?: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, disabled = false }) => {
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [embedType, setEmbedType] = useState<'social' | 'audio' | 'code' | 'interactive' | 'document'>('social');

  if (!editor) {
    return null;
  }

  const insertImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertVideo = () => {
    const url = window.prompt('Enter video URL (YouTube, Vimeo, or embed URL)');
    if (url) {
      editor.chain().focus().setVideo({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
    
    // cancelled
    if (url === null) {
      return;
    }
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const openEmbedDialog = (type: 'social' | 'audio' | 'code' | 'interactive' | 'document') => {
    setEmbedType(type);
    setEmbedDialogOpen(true);
  };

  const handleEmbedInsert = (data: any) => {
    switch (embedType) {
      case 'social':
        if (data.url && data.platform) {
          editor.chain().focus().setSocialMedia({ url: data.url, platform: data.platform }).run();
        }
        break;
      case 'audio':
        if (data.url) {
          editor.chain().focus().setAudio({ url: data.url, platform: data.platform }).run();
        }
        break;
      case 'code':
        if (data.code && data.language) {
          editor.chain().focus().setSyntaxCode({ code: data.code, language: data.language }).run();
        }
        break;
      case 'interactive':
        if (data.url && data.platform) {
          editor.chain().focus().setInteractive({ url: data.url, type: data.platform }).run();
        }
        break;
      case 'document':
        if (data.url && data.platform) {
          editor.chain().focus().setDocument({ url: data.url, type: data.platform }).run();
        }
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-1">
      <div className="flex items-center space-x-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
          aria-label="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          aria-label="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center space-x-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run() || disabled}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run() || disabled}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run() || disabled}
          aria-label="Code"
        >
          <Code className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center space-x-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          aria-label="Bullet List"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          aria-label="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          aria-label="Quote"
        >
          <Quote className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center space-x-1">
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          disabled={disabled}
          aria-label="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          disabled={disabled}
          aria-label="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          disabled={disabled}
          aria-label="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={setLink}
          disabled={disabled}
          aria-label="Insert Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertImage}
          disabled={disabled}
          aria-label="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertVideo}
          disabled={disabled}
          aria-label="Insert Video"
        >
          <Youtube className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEmbedDialog('audio')}
          disabled={disabled}
          aria-label="Insert Audio"
        >
          <Music className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEmbedDialog('social')}
          disabled={disabled}
          aria-label="Insert Social Media"
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEmbedDialog('code')}
          disabled={disabled}
          aria-label="Insert Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEmbedDialog('interactive')}
          disabled={disabled}
          aria-label="Insert Interactive"
        >
          <Map className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEmbedDialog('document')}
          disabled={disabled}
          aria-label="Insert Document"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run() || disabled}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run() || disabled}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EmbedDialog
        open={embedDialogOpen}
        onClose={() => setEmbedDialogOpen(false)}
        onInsert={handleEmbedInsert}
        type={embedType}
      />
    </div>
  );
};

export default EditorToolbar;
