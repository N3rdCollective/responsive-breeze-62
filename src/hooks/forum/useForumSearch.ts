import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumTopic } from '@/types/forum';

export interface FetchResultsParams {
  query: string | null;
  byUser: string | null;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
}

const fetchForumSearchResults = async ({ query, byUser, categoryId, startDate, endDate }: FetchResultsParams): Promise<ForumTopic[]> => {
  if (!query && !byUser && !categoryId && !startDate && !endDate) {
    return []; // No search criteria, return empty
  }

  let queryBuilder = supabase
    .from('forum_topics')
    .select(`
      id,
      title,
      slug,
      created_at,
      updated_at,
      user_id,
      category_id,
      is_sticky,
      is_locked,
      view_count,
      last_post_at,
      last_post_user_id,
      category:forum_categories (name, slug),
      profile:profiles!user_id (username, display_name, profile_picture), 
      forum_posts(count)
    `);

  if (query && query.trim() !== '') {
    queryBuilder = queryBuilder.ilike('title', `%${query.trim()}%`);
  }

  if (byUser && byUser.trim() !== '') {
    const byUserTrimmed = byUser.trim();
    queryBuilder = queryBuilder.filter('user_id', 'in', supabase.from('profiles').select('id').or(`username.ilike.%${byUserTrimmed}%,display_name.ilike.%${byUserTrimmed}%`));
  }

  if (categoryId && categoryId.trim() !== '') {
    queryBuilder = queryBuilder.eq('category_id', categoryId.trim());
  }

  if (startDate && startDate.trim() !== '') {
    queryBuilder = queryBuilder.gte('created_at', startDate.trim());
  }

  if (endDate && endDate.trim() !== '') {
    const endDateObj = new Date(endDate.trim());
    endDateObj.setDate(endDateObj.getDate() + 1); 
    queryBuilder = queryBuilder.lt('created_at', endDateObj.toISOString().split('T')[0]);
  }
  
  queryBuilder = queryBuilder.order('last_post_at', { ascending: false });

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching forum search results. Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error, // Log the full error object
    });
    // Propagate a more specific error if available, or a generic one
    throw new Error(error.message || 'Failed to fetch search results');
  }

  const rawResults = data || [];
  const transformedResults: ForumTopic[] = rawResults.map((rawTopic: any) => {
    const { forum_posts, ...rest } = rawTopic; 
    
    let postCount = 0;
    if (Array.isArray(forum_posts) && forum_posts.length > 0 && typeof forum_posts[0].count === 'number') {
        postCount = forum_posts[0].count;
    } else if (rawTopic.forum_posts_count !== undefined) { 
        postCount = rawTopic.forum_posts_count;
    }

    const topic: ForumTopic = {
      id: rest.id,
      title: rest.title,
      slug: rest.slug,
      created_at: rest.created_at,
      updated_at: rest.updated_at,
      user_id: rest.user_id,
      category_id: rest.category_id,
      is_sticky: rest.is_sticky,
      is_locked: rest.is_locked,
      view_count: rest.view_count,
      last_post_at: rest.last_post_at,
      last_post_user_id: rest.last_post_user_id,
      category: rest.category,
      profile: rest.profile, // This profile is now correctly fetched via user_id
      _count: { posts: postCount },
    };
    return topic;
  });
  return transformedResults;
};

export const useForumSearch = (params: FetchResultsParams) => {
  const { query, byUser, categoryId, startDate, endDate } = params;
  const hasActiveFilters = !!(query?.trim() || byUser?.trim() || categoryId?.trim() || startDate?.trim() || endDate?.trim());

  return useQuery({
    queryKey: ['forumSearch', query, byUser, categoryId, startDate, endDate],
    queryFn: () => fetchForumSearchResults(params),
    enabled: hasActiveFilters,
  });
};
