
import { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForumPostCreator } from "../actions/useForumPostCreator";
import { ForumTopic } from "@/types/forum";
import type { User } from "@supabase/supabase-js";

interface UseForumReplyHandlerProps {
  topic: ForumTopic | null;
  user: User | null;
  fetchTopicData: (pageToFetch?: number) => Promise<void>; // Changed Promise<boolean> to Promise<void>
  currentPage: number;
  totalPages: number;
  postsOnCurrentPage: number;
  itemsPerPage: number;
}

export const useForumReplyHandler = ({
  topic,
  user,
  fetchTopicData,
  currentPage,
  totalPages,
  postsOnCurrentPage,
  itemsPerPage,
}: UseForumReplyHandlerProps) => {
  const { toast } = useToast();
  const { createPost, submitting: submittingCreatePost } = useForumPostCreator();
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = replyContent;
    if (!replyContent.trim() || !tempDiv.textContent?.trim()) {
      toast({ title: "Empty reply", description: "Please enter a message for your reply.", variant: "destructive" });
      return;
    }

    if (!topic || !topic.id || !user) return;
    if (topic.is_locked) {
      toast({ title: "Topic is locked", description: "This topic is locked and cannot be replied to.", variant: "destructive" });
      return;
    }

    const result = await createPost({ topic_id: topic.id, content: replyContent });

    if (result) {
      setReplyContent("");
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true })
        .eq('topic_id', topic.id);

      if (countError) {
        console.error("Error fetching post count after reply:", countError);
        await fetchTopicData(currentPage); // Await the promise
        return;
      }

      const newTotalPosts = count || 0;
      const newTotalPages = Math.ceil(newTotalPosts / itemsPerPage);

      if (currentPage === totalPages && postsOnCurrentPage < itemsPerPage && newTotalPages === totalPages ) {
         await fetchTopicData(currentPage); // Await the promise
      } else {
         await fetchTopicData(newTotalPages); // Await the promise
      }
    }
  };

  return {
    replyContent,
    setReplyContent,
    handleSubmitReply,
    isSubmittingReply: submittingCreatePost,
  };
};

