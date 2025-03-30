
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Label } from "@/components/ui/label";
import { useEditorExtensions } from './editor/useEditorExtensions';
import EditorToolbar from './editor/EditorToolbar';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

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
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');
  
  const editor = useEditor({
    extensions,
    content: value || '',
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log("Editor content updated:", html.substring(0, 30) + "...");
      setHtmlContent(html);
      onChange(html);
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
      setHtmlContent(value || '');
    }
  }, [editor, value]);

  // Toggle between visual and HTML modes
  const toggleHtmlMode = () => {
    if (isHtmlMode && editor) {
      // When switching back to visual mode, apply HTML changes to the editor
      editor.commands.setContent(htmlContent);
      onChange(htmlContent);
    } else if (editor) {
      // When switching to HTML mode, ensure we have the latest HTML
      setHtmlContent(editor.getHTML());
    }
    setIsHtmlMode(!isHtmlMode);
  };

  // Handle HTML textarea changes
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    console.log("HTML content changed:", newHtml.substring(0, 30) + "...");
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid={id}>
      {label && <Label htmlFor={id}>{label}</Label>}
      
      <div className="border rounded-md bg-background">
        <div className="flex justify-between items-center border-b">
          <EditorToolbar editor={editor} disabled={isHtmlMode} />
          
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            onClick={toggleHtmlMode}
            className="mr-2 flex items-center gap-1"
            aria-label={isHtmlMode ? "Switch to visual editor" : "Switch to HTML editor"}
          >
            <Code size={16} />
            {isHtmlMode ? "Visual" : "HTML"}
          </Button>
        </div>
        
        {isHtmlMode ? (
          <Textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="font-mono text-sm p-4 min-h-[500px] w-full border-0 rounded-none focus-visible:ring-0 bg-slate-800 text-slate-50 dark:bg-slate-900"
            style={{ minHeight: height, height: height }}
          />
        ) : (
          <div 
            style={{ minHeight: height }} 
            className="p-4 prose prose-sm sm:prose max-w-none focus:outline-none overflow-y-auto dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground"
          >
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
