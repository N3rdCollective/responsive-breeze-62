
import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Label } from "@/components/ui/label";

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
  const editorRef = useRef<any>(null);
  
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Editor
        id={id}
        apiKey="no-api-key" // For development, we'll use the no-api-key which has limitations but works
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={value}
        onEditorChange={(newContent) => onChange(newContent)}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
