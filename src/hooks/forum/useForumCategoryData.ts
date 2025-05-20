
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

        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();

        if (categoryError) throw categoryError;

        if (!categoryData) {
          navigate('/members'); // Redirect to forum index if category not found
          toast({
            title: "Category not found",
            description: "The forum category you're looking for doesn't exist.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        setCategory(categoryData);

        // Count total topics for pagination
        const { count, error: countError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryData.id);

        if (countError) throw countError;

        const totalPageCount = Math.ceil((count || 0) / ITEMS_PER_PAGE);
        setTotalPages(totalPageCount || 1);

        // Fetch topics
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

        if (topicsError) throw topicsError;

        const topicsWithCounts = await Promise.all((topicsRawData || []).map(async (topic) => {
          const { count: postCount, error: postCountError } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          if (postCountError) {
            console.error(`Error fetching post count for topic ${topic.id}:`, postCountError);
          }
                      
          return {
            ...topic,
            _count: {
              posts: postCount || 0,
            },
          } as ForumTopic;
        }));
        
        setTopics(topicsWithCounts);
      } catch (err: any) {
        console.error('Error fetching forum data:', err.message);
        setError(err.message || "Failed to load forum data.");
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

