
import React from "react";
import { NewsStatus } from "../NewsForm";
import BasicFields from "./fields/BasicFields";
import CategoryField from "./fields/CategoryField";
import TagsField from "./fields/TagsField";
import StatusToggle from "./fields/StatusToggle";

interface NewsFormBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  status: NewsStatus;
  setStatus: (status: NewsStatus) => void;
  category: string;
  setCategory: (category: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  canPublish?: boolean;
}

const NewsFormBasicFields: React.FC<NewsFormBasicFieldsProps> = ({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  status,
  setStatus,
  category,
  setCategory,
  tags,
  setTags,
  canPublish = false,
}) => {
  return (
    <div className="space-y-6 text-foreground">
      <BasicFields 
        title={title}
        setTitle={setTitle}
        excerpt={excerpt}
        setExcerpt={setExcerpt}
      />
      
      <CategoryField
        category={category}
        setCategory={setCategory}
      />
      
      <TagsField
        tags={tags}
        setTags={setTags}
      />
      
      <StatusToggle
        status={status}
        setStatus={setStatus}
        canPublish={canPublish}
      />
    </div>
  );
};

export default NewsFormBasicFields;
