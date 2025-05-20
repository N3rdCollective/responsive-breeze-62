import { useToast } from '@/hooks/use-toast';
import { useForumReactions } from "../actions/useForumReactions";
import { ForumTopic, ForumPost, ForumPostReaction } from "@/types/forum";
import type { User } from "@supabase/supabase-js";

interface UseForumReactionHandlerProps {
  topic: ForumTopic | null;
  user: User | null; 
  posts: ForumPost[];
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
}

export const useForumReactionHandler = ({
  topic,
  user,
  posts,
  setPosts,
}: UseForumReactionHandlerProps) => {
  const { toast } = useToast();
  const { addReaction, removeReaction, submitting: submittingReaction } = useForumReactions();

  const handleToggleReaction = async (postId: string, reactionType: 'like') => {
    if (!user) {
      toast({ title: "Login Required", description: "You need to be logged in to react.", variant: "destructive"});
      return;
    }
    if (topic?.is_locked) {
      toast({ title: "Topic Locked", description: "Cannot react to posts in a locked topic.", variant: "default" });
      return;
    }

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const currentPost = posts[postIndex];
    const existingReaction = currentPost.forum_post_reactions?.find(r => r.user_id === user.id && r.reaction_type === reactionType);

    let success = false;
    let updatedReactions: ForumPostReaction[] | undefined;

    if (existingReaction) {
      success = await removeReaction(postId, reactionType);
      if (success) {
        updatedReactions = currentPost.forum_post_reactions?.filter(r => r.id !== existingReaction.id);
      }
    } else {
      const newReactionData = await addReaction(postId, reactionType);
      if (newReactionData) {
        success = true;
        updatedReactions = [...(currentPost.forum_post_reactions || []), newReactionData];
      }
    }

    if (success) {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, forum_post_reactions: updatedReactions } : p));
    }
  };

  return {
    handleToggleReaction,
    submittingReaction,
  };
};
