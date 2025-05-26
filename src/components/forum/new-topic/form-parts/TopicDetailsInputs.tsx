
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ForumRichTextEditor from "@/components/forum/ForumRichTextEditor";

interface TopicDetailsInputsProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  submitting: boolean;
}

const TopicDetailsInputs: React.FC<TopicDetailsInputsProps> = ({
  title,
  setTitle,
  content,
  setContent,
  submitting,
}) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Topic Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your topic"
          className="mt-1 border-primary/20 focus-visible:ring-primary"
          disabled={submitting}
        />
      </div>
      <div>
        <ForumRichTextEditor
          id="content"
          value={content}
          onChange={setContent}
          label="Content"
          height={300}
          placeholder="Write your post here..."
        />
      </div>
    </>
  );
};

export default TopicDetailsInputs;
