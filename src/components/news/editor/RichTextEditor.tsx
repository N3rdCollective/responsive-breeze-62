
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Label } from "@/components/ui/label";
import { useEditorExtensions } from './editor/useEditorExtensions';
import EditorToolbar from './editor/EditorToolbar';

interface RichTextEditorProps {
  id: string;
  value: string;
  onChange: (content: string) => void;
  label?: string;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value,
  onChange,
  label,
  height = 500
}) => {
  const extensions = useEditorExtensions();
  
  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid={id}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <div className="border rounded-md bg-background">
        <EditorToolbar editor={editor} />
        
        <div 
          style={{ minHeight: height }} 
          className="p-4 prose prose-sm sm:prose max-w-none focus:outline-none overflow-y-auto 
            dark:prose-invert prose-headings:text-foreground prose-p:text-foreground 
            prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground
            dark:bg-slate-800 dark:text-slate-50"
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
