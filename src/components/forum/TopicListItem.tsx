
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ForumTopic } from '@/types/forum';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { CalendarDays, MessageSquareText } from 'lucide-react'; // Import icons

interface TopicListItemProps {
  topic: ForumTopic;
  categorySlug: string | undefined;
}

const TopicListItem: React.FC<TopicListItemProps> = ({ topic }) => {
  const userJoinDate = topic.profile?.created_at ? parseISO(topic.profile.created_at) : null;

  return (
    <li className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-7 lg:col-span-8"> {/* Adjusted for more space */}
          <div className="flex items-start space-x-3"> {/* Changed to items-start for multiline info */}
            <Avatar className="h-10 w-10 ring-2 ring-primary/10 flex-shrink-0">
              <AvatarImage src={topic.profile?.profile_picture || ''} alt={topic.profile?.display_name || topic.profile?.username || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary-foreground">
                {(topic.profile?.display_name?.[0] || topic.profile?.username?.[0] || 'U').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-grow"> {/* Added flex-grow */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  to={`/forum/topic/${topic.slug}`}
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
              <div className="text-xs text-muted-foreground">
                by {topic.profile?.display_name || topic.profile?.username || 'Anonymous'} •{' '}
                {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
              </div>
              {/* New user info section */}
              <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                {userJoinDate && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>Joined: {formatDistanceToNow(userJoinDate, { addSuffix: true })}</span>
                  </div>
                )}
                {topic.profile?.forum_post_count !== null && topic.profile?.forum_post_count !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    <span>Posts: {topic.profile.forum_post_count}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex md:col-span-1 items-center justify-center"> {/* Adjusted for md breakpoint */}
          <span className="font-medium">{(topic._count?.posts || 1) - 1}</span>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex items-center justify-end md:justify-center mt-2 md:mt-0"> {/* Adjusted for md breakpoint */}
          <span className="text-xs text-right sm:text-center text-muted-foreground">
            {formatDistanceToNow(new Date(topic.last_post_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </li>
  );
};

export default TopicListItem;

