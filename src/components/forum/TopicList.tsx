
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react'; // Changed from PlusCircle
import TopicListItem from './TopicListItem';
import { ForumTopic } from '@/types/forum'; // Use imported ForumTopic type

interface TopicListProps {
  topics: ForumTopic[];
  categorySlug: string | undefined; // Kept for TopicListItem, but not for new topic link
  categoryId: string | undefined; // Add categoryId prop
}

const TopicList: React.FC<TopicListProps> = ({ topics, categorySlug, categoryId }) => {
  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 py-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7 sm:col-span-8">
            <CardTitle className="text-sm sm:text-base">Topic</CardTitle>
          </div>
          <div className="hidden sm:block sm:col-span-1">
            <CardTitle className="text-sm text-center">Replies</CardTitle>
          </div>
          <div className="col-span-5 sm:col-span-3">
            <CardTitle className="text-sm text-right sm:text-center">Latest Post</CardTitle>
          </div>
        </div>
      </CardHeader>

      {topics.length === 0 ? (
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium mb-2">No topics found</p>
          <p className="text-muted-foreground mb-4">
            Be the first to start a discussion in this category!
          </p>
          {categoryId && ( // Only show button if categoryId is available
            <Button asChild className="bg-primary hover:bg-primary/90">
              {/* FIXED: Use categoryId for the link */}
              <Link to={`/forum/new-topic/${categoryId}`}>
                <Plus className="h-4 w-4 mr-2" /> Create Topic
              </Link>
            </Button>
          )}
        </CardContent>
      ) : (
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {topics.map((topic) => (
              <TopicListItem key={topic.id} topic={topic} categorySlug={categorySlug} />
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
};

export default TopicList;
