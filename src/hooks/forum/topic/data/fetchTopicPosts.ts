
import { SupabaseClient } from '@supabase/supabase-js';
import { ForumPost } from '@/types/forum';
import { POSTS_PER_PAGE } from '@/config/forumConfig';
import { toast } from '@/hooks/use-toast'; // Import the toast function itself

export const fetchTopicPosts = async (
  topicId: string,
  pageToFetch: number,
  supabase: SupabaseClient,
  toastFn: typeof toast // Use typeof toast for the type
): Promise<{ posts: ForumPost[]; totalCount: number }> => {
  try {
    console.log(`[fetchTopicPosts] Fetching posts for topic ${topicId}, page ${pageToFetch}`);
    
    const startIndex = (pageToFetch - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE - 1;

    const { data: postsData, error: postsError, count } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profile:profiles!user_id ( 
          username,
          display_name,
          profile_picture,
          created_at,
          forum_post_count,
          forum_signature
        ),
        forum_post_reactions (
          id,
          user_id,
          reaction_type
        )
      `, { count: 'exact' })
      .eq('topic_id', topicId)
      .order('created_at', { ascending: true })
      .range(startIndex, endIndex);

    if (postsError) {
      console.error('[fetchTopicPosts] Posts fetch error:', postsError);
      if (postsError.code === 'PGRST201') {
          toastFn({ // Use the passed toastFn
              title: "Data Fetching Issue (Posts)",
              description: "There's an issue specifying relationships in the post data query. Details: " + postsError.message,
              variant: "destructive",
          });
      }
      throw new Error(postsError.message);
    }

    const totalCount = count || 0;
    console.log(`[fetchTopicPosts] Fetched ${postsData?.length || 0} posts, total: ${totalCount}.`);
    
    if (postsData) {
      postsData.forEach((post: any, index: number) => {
        console.log(`[fetchTopicPosts] Post ${index} profile:`, post.profile ? 'Exists' : 'Missing', post.profile?.forum_signature ? 'Has Sig' : 'No Sig');
      });
    }

    return {
      posts: postsData as unknown as ForumPost[] || [],
      totalCount
    };

  } catch (err: any) {
    console.error('[fetchTopicPosts] Error fetching posts:', err);
    if (err.code !== 'PGRST201') {
      toastFn({ // Use the passed toastFn
        title: "Error loading posts",
        description: err.message || "An unexpected error occurred while fetching posts.",
        variant: "destructive",
      });
    }
    throw err; 
  }
};
