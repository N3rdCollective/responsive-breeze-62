
import React from 'react';
import { Link } from 'react-router-dom';
import { LockIcon, MessageSquare } from 'lucide-react'; // Added MessageSquare for reply button
import { ForumTopic } from '@/types/forum';
import { Button } from '@/components/ui/button'; // Added Button

interface TopicHeaderDisplayProps {
  topic: ForumTopic;
  categorySlug?: string;
  onReplyClick?: () => void; // Added onReplyClick as optional prop
}

const TopicHeaderDisplay: React.FC<TopicHeaderDisplayProps> = ({ topic, categorySlug, onReplyClick }) => {
  const currentCategorySlug = topic.category?.slug || categorySlug;
  const categoryName = topic.category?.name || 'Category';

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4"> {/* Reduced mb-6 to mb-2 */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {topic.title}
            {topic.is_locked && (
              <LockIcon className="h-5 w-5 text-muted-foreground" title="Topic Locked" />
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
      <div className="mb-6"> {/* Kept mb-6 here for the "Back to" link */}
        <Link to={`/members/forum/${currentCategorySlug}`} className="text-sm text-primary hover:underline">
          &larr; Back to {categoryName}
        </Link>
      </div>
    </>
  );
};

export default TopicHeaderDisplay;
