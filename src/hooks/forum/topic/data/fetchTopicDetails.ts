
import { SupabaseClient } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';
import { ForumTopic } from '@/types/forum';
import { ToastProps } from '@/components/ui/toast';
import { type ToastFn } from '@/hooks/use-toast'; // Assuming ToastFn or similar type export from use-toast

export const fetchTopicDetails = async (
  paramTopicSlug: string,
  supabase: SupabaseClient,
  toast: ToastFn,
  navigate: NavigateFunction
): Promise<{topic: ForumTopic | null, categorySlug: string | null}> => {
  if (!paramTopicSlug) {
    console.warn('[fetchTopicDetails] Called without paramTopicSlug.');
    return { topic: null, categorySlug: null};
  }

  try {
    console.log('[fetchTopicDetails] Fetching topic by slug:', paramTopicSlug);
    
    const { data: topicData, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories!inner (slug, name),
        profile:profiles!user_id ( 
          username,
          display_name,
          profile_picture,
          created_at,
          forum_post_count,
          forum_signature
        )
      `)
      .eq('slug', paramTopicSlug)
      .single();

    console.log('[fetchTopicDetails] Supabase response for topic query:', { topicSlug: paramTopicSlug, topicData, topicError });

    if (topicError) {
      console.error('[fetchTopicDetails] Topic fetch error from Supabase:', topicError);
      if (topicError.code === 'PGRST201') {
          toast({
              title: "Data Fetching Issue",
              description: "There's an issue specifying relationships in the data query. Please contact support. Details: " + topicError.message,
              variant: "destructive",
          });
      }
      throw new Error(topicError.message);
    }

    if (!topicData) {
      console.warn('[fetchTopicDetails] Topic not found in DB for slug:', paramTopicSlug, '(topicData is null/undefined)');
      throw new Error('Topic not found');
    }
    
    const fetchedCategorySlug = (topicData as any).category?.slug || null;
    console.log('[fetchTopicDetails] Topic fetched successfully:', (topicData as any).title);
    return { topic: topicData as ForumTopic, categorySlug: fetchedCategorySlug };

  } catch (err: any) {
    console.error('[fetchTopicDetails] Error in fetchTopicDetails:', err);
    if (err.message === 'Topic not found' || (err.details && err.details.includes('0 rows'))) {
      toast({
        title: "Error loading topic",
        description: "The topic could not be found.",
        variant: "destructive"
      });
      navigate('/members/forum', { replace: true });
    } else if (err.code !== 'PGRST201') { 
       toast({
        title: "Error loading topic",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    // Re-throw the error to be caught by the calling function in useForumTopicData
    throw err;
  }
};
