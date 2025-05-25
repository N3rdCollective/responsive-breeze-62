
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ForumTopic } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, UserCircle, Tag } from 'lucide-react';

interface ForumSearchResultItemProps {
  topic: ForumTopic;
}

const ForumSearchResultItem: React.FC<ForumSearchResultItemProps> = ({ topic }) => {
  const authorDisplayName = topic.profile?.display_name || topic.profile?.username || 'Unknown Author';
  const categoryName = topic.category?.name || 'Uncategorized';

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          <Link 
            to={`/forum/topic/${topic.slug}`} 
            className="text-primary hover:underline"
          >
            {topic.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>
              In category: <Link to={`/forum/category/${topic.category?.slug}`} className="text-primary/80 hover:underline">{categoryName}</Link>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            <span>
              By: {topic.profile?.username ? (
                <Link to={`/u/${topic.profile.username}`} className="text-primary/80 hover:underline">{authorDisplayName}</Link>
              ) : (
                authorDisplayName
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>
              Posted: {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
            </span>
          </div>
           {topic._count?.posts && (
             <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-transparent fill-current" /> {/* Placeholder for icon alignment */}
                <span>Replies: {topic._count.posts -1}</span> {/* Assuming first post is the topic itself */}
             </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumSearchResultItem;
