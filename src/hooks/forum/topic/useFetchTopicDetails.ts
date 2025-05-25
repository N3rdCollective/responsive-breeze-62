
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ForumTopic } from '@/types/forum';

export interface UseFetchTopicDetailsReturn {
  topic: ForumTopic | null;
  isLoadingTopic: boolean;
  topicError: string | null;
  categorySlugFromTopic: string | null;
  fetchTopicBySlug: (slug: string) => Promise<ForumTopic | null>;
  setTopic: React.Dispatch<React.SetStateAction<ForumTopic | null>>;
  setCategorySlugFromTopic: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useFetchTopicDetails = (): UseFetchTopicDetailsReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [topicError, setTopicError] = useState<string | null>(null);
  const [categorySlugFromTopic, setCategorySlugFromTopic] = useState<string | null>(null);

  const fetchTopicBySlug = useCallback(async (slugToFetch: string): Promise<ForumTopic | null> => {
    console.log('[useFetchTopicDetails] Fetching topic by slug:', slugToFetch);
    setIsLoadingTopic(true);
    setTopicError(null);
    setCategorySlugFromTopic(null); // Reset category slug on new fetch

    try {
      const { data: topicData, error: topicFetchError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          category:forum_categories!inner (slug, name),
          profile:profiles!user_id ( 
            username,
            display_name,
            profile_picture
          )
        `)
        .eq('slug', slugToFetch)
        .single();

      console.log('[useFetchTopicDetails] Supabase response for topic query:', { slugToFetch, topicData, topicFetchError });

      if (topicFetchError) {
        console.error('[useFetchTopicDetails] Topic fetch error from Supabase:', topicFetchError);
        if (topicFetchError.code === 'PGRST201') {
          toast({
            title: "Data Fetching Issue",
            description: "There's an issue specifying relationships in the data query. Please contact support. Details: " + topicFetchError.message,
            variant: "destructive",
          });
        }
        throw new Error(topicFetchError.message);
      }

      if (!topicData) {
        console.warn('[useFetchTopicDetails] Topic not found in DB for slug:', slugToFetch);
        throw new Error('Topic not found');
      }
      
      const fetchedCategorySlug = (topicData as any).category?.slug;
      if (fetchedCategorySlug) {
        setCategorySlugFromTopic(fetchedCategorySlug);
      } else {
        console.warn('[useFetchTopicDetails] Topic fetched but category slug is missing:', topicData);
      }

      console.log('[useFetchTopicDetails] Topic fetched successfully:', (topicData as any).title);
      setTopic(topicData as ForumTopic);
      return topicData as ForumTopic;

    } catch (err: any) {
      console.error('[useFetchTopicDetails] Error in fetchTopicBySlug:', err);
      setTopicError(err.message);
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
      setTopic(null); // Ensure topic is null on error
      return null;
    } finally {
      setIsLoadingTopic(false);
    }
  }, [navigate, toast]);

  return { topic, isLoadingTopic, topicError, categorySlugFromTopic, fetchTopicBySlug, setTopic, setCategorySlugFromTopic };
};
