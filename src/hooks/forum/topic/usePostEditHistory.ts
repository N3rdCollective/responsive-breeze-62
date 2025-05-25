
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumPostEditHistoryEntry } from '@/types/forum';

export const usePostEditHistory = (postId: string | null) => {
  const fetchEditHistory = async (): Promise<ForumPostEditHistoryEntry[]> => {
    if (!postId) return [];

    const { data, error } = await supabase
      .from('forum_post_edit_history')
      .select(`
        *,
        profile:profiles!forum_post_edit_history_user_id_fkey (username, display_name, profile_picture)
      `)
      .eq('post_id', postId)
      .order('edited_at', { ascending: false });

    if (error) {
      console.error('Error fetching post edit history:', error);
      throw error;
    }
    return data || [];
  };

  return useQuery<ForumPostEditHistoryEntry[], Error>({
    queryKey: ['postEditHistory', postId],
    queryFn: fetchEditHistory,
    enabled: !!postId,
  });
};
