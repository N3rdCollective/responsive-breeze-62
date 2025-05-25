
import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, MessageSquare } from 'lucide-react';
import { ForumTopic } from '@/types/forum';
import { Button } from '@/components/ui/button';

interface TopicHeaderDisplayProps {
  topic: ForumTopic;
  categorySlug?: string;
  onReplyClick?: () => void;
}

const TopicHeaderDisplay: React.FC<TopicHeaderDisplayProps> = ({ topic, categorySlug, onReplyClick }) => {
  const currentCategorySlug = topic.category?.slug || categorySlug;
  const categoryName = topic.category?.name || 'Category';

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {topic.title}
            {topic.is_locked && (
              <span title="Topic Locked">
                <LockIcon className="h-5 w-5 text-muted-foreground" aria-label="Topic Locked" />
              </span>
            )}
          </h1>
          <div className="text-sm text-muted-foreground mt-1">
            Posted in <Link to={`/members/forum/${currentCategorySlug}`} className="text-primary hover:underline">{categoryName}</Link>
          </div>
        </div>
        {!topic.is_locked && onReplyClick && (
            <Button onClick={onReplyClick} size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Post Reply
            </Button>
        )}
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
