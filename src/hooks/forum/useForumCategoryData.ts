
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ForumCategory, ForumTopic } from '@/types/forum';

const ITEMS_PER_PAGE = 10;

interface UseForumCategoryDataParams {
  categorySlug: string | undefined;
  page: number;
}

export const useForumCategoryData = ({ categorySlug, page }: UseForumCategoryDataParams) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryAndTopics = async () => {
      if (!categorySlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`[useForumCategoryData] Fetching category and topics for: ${categorySlug}, page: ${page}`);

        // Fetch category with error handling
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryError) {
          console.error('[useForumCategoryData] Category fetch error:', categoryError);
          throw categoryError;
        }

        if (!categoryData) {
          console.warn('[useForumCategoryData] Category not found, redirecting to forum index');
          navigate('/members');
          toast({
            title: "Category not found",
            description: "The forum category you're looking for doesn't exist.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        console.log('[useForumCategoryData] Category loaded:', categoryData.name);
        setCategory(categoryData);

        // Count total topics for pagination with error handling
        const { count, error: countError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryData.id);

        if (countError) {
          console.error('[useForumCategoryData] Topic count error:', countError);
          throw countError;
        }

        const totalPageCount = Math.ceil((count || 0) / ITEMS_PER_PAGE);
        setTotalPages(totalPageCount || 1);
        console.log(`[useForumCategoryData] Total topics: ${count}, pages: ${totalPageCount}`);

        // Fetch topics with comprehensive error handling
        const { data: topicsRawData, error: topicsError } = await supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            slug,
            is_sticky,
            is_locked,
            created_at,
            updated_at, 
            last_post_at,
            last_post_user_id, 
            user_id,
            category_id,
            view_count, 
            profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture)
          `)
          .eq('category_id', categoryData.id)
          .order('is_sticky', { ascending: false })
          .order('last_post_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

        if (topicsError) {
          console.error('[useForumCategoryData] Topics fetch error:', topicsError);
          throw topicsError;
        }

        console.log(`[useForumCategoryData] Raw topics loaded: ${topicsRawData?.length || 0}`);

        // Process topics with enhanced error handling
        const topicsWithCounts = await Promise.all((topicsRawData || []).map(async (topic) => {
          try {
            const { count: postCount, error: postCountError } = await supabase
              .from('forum_posts')
              .select('*', { count: 'exact', head: true })
              .eq('topic_id', topic.id);

            if (postCountError) {
              console.error(`[useForumCategoryData] Error fetching post count for topic ${topic.id}:`, postCountError);
              // Continue with 0 count instead of failing
            }
                        
            return {
              ...topic,
              _count: {
                posts: postCount || 0,
              },
            } as ForumTopic;
          } catch (topicError) {
            console.error(`[useForumCategoryData] Error processing topic ${topic.id}:`, topicError);
            // Return topic with default count instead of failing
            return {
              ...topic,
              _count: {
                posts: 0,
              },
            } as ForumTopic;
          }
        }));
        
        console.log(`[useForumCategoryData] Processed topics: ${topicsWithCounts.length}`);
        setTopics(topicsWithCounts);
      } catch (err: any) {
        console.error('[useForumCategoryData] Error in fetchCategoryAndTopics:', err);
        const errorMessage = err.message || "Failed to load forum data.";
        setError(errorMessage);
        toast({
          title: "Error loading forum",
          description: "We couldn't load the forum data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndTopics();
  }, [categorySlug, navigate, page]);

  return { category, topics, loadingData: loading, totalPages, error };
};
