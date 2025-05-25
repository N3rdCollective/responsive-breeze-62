
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ForumTopic } from '@/types/forum';
import { formatDistanceToNow } from 'date-fns';

interface TopicListItemProps {
  topic: ForumTopic;
  categorySlug: string | undefined; // categorySlug is kept for potential future use or other parts of the component, but not for this specific link.
}

const TopicListItem: React.FC<TopicListItemProps> = ({ topic }) => {
  return (
    <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7 sm:col-span-8">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={topic.profile?.profile_picture || ''} alt={topic.profile?.display_name || topic.profile?.username || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary-foreground">
                {(topic.profile?.display_name?.[0] || topic.profile?.username?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  // Corrected link: Use topic.id and the /forum/topic/:topicId route structure
                  to={`/forum/topic/${topic.id}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {topic.title}
                </Link>
                {topic.is_sticky && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Pinned</Badge>
                )}
                {topic.is_locked && (
                  <Badge variant="destructive" className="text-xs">Locked</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                by {topic.profile?.display_name || topic.profile?.username || 'Anonymous'} •{' '}
                {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
          <span className="font-medium">{(topic._count?.posts || 1) - 1}</span> {/* Display replies, not total posts */}
        </div>
        <div className="col-span-5 sm:col-span-3 flex items-center justify-end sm:justify-center">
          <span className="text-xs text-right sm:text-center text-muted-foreground">
            {formatDistanceToNow(new Date(topic.last_post_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </li>
  );
};

export default TopicListItem;
