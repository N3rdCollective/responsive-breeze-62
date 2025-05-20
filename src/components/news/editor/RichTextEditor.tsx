import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Extensions } from '@tiptap/react';
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
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  id,
  value,
  onChange,
  label,
  height = 500,
  placeholder
}) => {
  const getEditorExtensionsArray = useEditorExtensions({ placeholder }); // Pass placeholder to the hook
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');
  
  const editor = useEditor({
    extensions: getEditorExtensionsArray(), 
    content: value || '',
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log("Editor content updated:", html.substring(0, 30) + "...");
      setHtmlContent(html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        // The placeholder is now handled by the Placeholder extension via useEditorExtensions
      },
    }
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentEditorHTML = editor.getHTML();
      if (value !== currentEditorHTML) {
        const newContentToSet = value || '';
        editor.commands.setContent(newContentToSet);
        setHtmlContent(newContentToSet); // Keep local HTML state in sync
      }
    }
  }, [editor, value]);
  
  // No need for a separate useEffect to update placeholder via setOptions,
  // as it's now part of the extensions re-creation if placeholder prop changes.
  // Tiptap's editor should re-initialize if `extensions` array changes identity due to `placeholderText` dependency.

  // Toggle between visual and HTML modes
  const toggleHtmlMode = () => {
    if (isHtmlMode && editor) {
      // When switching back to visual mode, apply HTML changes to the editor
      editor.commands.setContent(htmlContent);
      onChange(htmlContent); // Ensure parent is notified
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
      {label && <Label htmlFor={id} >{label}</Label>}
      
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
            placeholder={"Edit HTML source..."}
          />
        ) : (
          <div 
            style={{ minHeight: height }} 
            className="p-4 prose prose-sm sm:prose max-w-none focus:outline-none overflow-y-auto dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground"
          >
            <EditorContent editor={editor} id={id} />
          </div>
        )}
      </div>

      <style>
        {`
        .video-embed {
          position: relative;
          margin: 2em 0;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        
        .video-container {
          position: relative;
          width: 100%;
          max-width: 48rem; /* 768px */
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 0.5rem;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .video-embed iframe {
          border-radius: 0.375rem;
          aspect-ratio: 16/9;
          width: 100%;
        }
        
        .dark .video-container {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        `}
      </style>
    </div>
  );
};

export default RichTextEditor;
