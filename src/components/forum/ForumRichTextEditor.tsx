
import React from 'react';
import RichTextEditor from '@/components/news/editor/RichTextEditor';

interface ForumRichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  id?: string;
  label?: string;
  height?: number;
  placeholder?: string;
}

const ForumRichTextEditor: React.FC<ForumRichTextEditorProps> = ({
  value,
  onChange,
  id = 'forum-editor',
  label,
  height = 250,
  placeholder,
}) => {
  return (
    <RichTextEditor
      id={id}
      value={value}
      onChange={onChange}
      label={label}
      height={height}
      placeholder={placeholder}
    />
  );
};

export default ForumRichTextEditor;
