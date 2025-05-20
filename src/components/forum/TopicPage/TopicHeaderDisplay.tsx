
import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon } from 'lucide-react';
import { ForumTopic } from '@/types/forum';

interface TopicHeaderDisplayProps {
  topic: ForumTopic;
  categorySlug?: string; // Make categorySlug optional as it can be derived from topic.category
}

const TopicHeaderDisplay: React.FC<TopicHeaderDisplayProps> = ({ topic, categorySlug }) => {
  const currentCategorySlug = topic.category?.slug || categorySlug;
  const categoryName = topic.category?.name || 'Category';

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {topic.title}
            {topic.is_locked && (
              <LockIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            Posted in <Link to={`/members/forum/${currentCategorySlug}`} className="text-primary hover:underline">{categoryName}</Link>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <Link to={`/members/forum/${currentCategorySlug}`} className="text-sm text-primary hover:underline">
          &larr; Back to {categoryName}
        </Link>
      </div>
    </>
  );
};

export default TopicHeaderDisplay;
