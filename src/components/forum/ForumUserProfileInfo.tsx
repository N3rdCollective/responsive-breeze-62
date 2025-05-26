
import React from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { User, CalendarDays, MessageSquareText, VenetianMask } from 'lucide-react';
import { cn } from "@/lib/utils"; // Moved import to the top

interface ProfileInfo {
  username?: string | null;
  display_name?: string | null;
  profile_picture?: string | null; // Matching ForumPost/ForumTopic types
  created_at?: string | null; // User's join date
  forum_post_count?: number | null;
  forum_signature?: string | null;
}

interface ForumUserProfileInfoProps {
  profile: ProfileInfo | undefined;
  className?: string;
}

const ForumUserProfileInfo: React.FC<ForumUserProfileInfoProps> = ({ profile, className }) => {
  if (!profile) {
    return null;
  }

  const joinDate = profile.created_at ? parseISO(profile.created_at) : null;

  return (
    <div className={cn("text-xs text-muted-foreground space-y-2", className)}>
      {joinDate && (
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Joined: {formatDistanceToNow(joinDate, { addSuffix: true })}</span>
        </div>
      )}
      {profile.forum_post_count !== null && profile.forum_post_count !== undefined && (
        <div className="flex items-center gap-1.5">
          <MessageSquareText className="h-3.5 w-3.5" />
          <span>Posts: {profile.forum_post_count}</span>
        </div>
      )}
      {/* Signature display removed from here */}
    </div>
  );
};

export default ForumUserProfileInfo;
