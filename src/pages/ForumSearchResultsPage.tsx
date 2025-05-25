import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, SearchX, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumTopic } from '@/types/forum';
import ForumSearchResultItem from '@/components/forum/ForumSearchResultItem';
import { format } from 'date-fns';

interface FetchResultsParams {
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
      profile:profiles!inner(username, display_name), 
      forum_posts(count)
    `);
    // Using !inner for profile to ensure topics are only returned if they have a matching profile, especially when filtering by user.
    // If byUser is not set, this might exclude topics from users whose profiles are somehow missing, which is unlikely but possible.
    // Consider changing to profiles!user_id if byUser filtering leads to unexpected missing results for general searches.
    // For now, !inner helps ensure the byUser filter works correctly.

  if (query && query.trim() !== '') {
    queryBuilder = queryBuilder.ilike('title', `%${query.trim()}%`);
  }

  if (byUser && byUser.trim() !== '') {
    const byUserTrimmed = byUser.trim();
    // We are querying profiles table through the relationship established in the select.
    // The select is 'profile:profiles!inner(username, display_name)'
    // So we filter on the 'profiles' table's columns.
    queryBuilder = queryBuilder.or(
      `username.ilike.%${byUserTrimmed}%,display_name.ilike.%${byUserTrimmed}%`,
      { foreignTable: 'profiles' }
    );
  }

  if (categoryId && categoryId.trim() !== '') {
    queryBuilder = queryBuilder.eq('category_id', categoryId.trim());
  }

  if (startDate && startDate.trim() !== '') {
    // Ensure endDate includes the full day if only startDate is provided, or adjust time component.
    // For simplicity, we use gte for startDate.
    queryBuilder = queryBuilder.gte('created_at', startDate.trim());
  }

  if (endDate && endDate.trim() !== '') {
    // To include the entire end day, we should use the start of the next day for 'lt'
    // or ensure the timestamp includes time up to 23:59:59.
    // For simplicity, using lte. For precise day range, adjust time component or use date parts.
    const endDateObj = new Date(endDate.trim());
    endDateObj.setDate(endDateObj.getDate() + 1); // Next day for < comparison
    queryBuilder = queryBuilder.lt('created_at', endDateObj.toISOString().split('T')[0]);

  }
  
  queryBuilder = queryBuilder.order('last_post_at', { ascending: false });

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching forum search results:', error);
    throw new Error('Failed to fetch search results');
  }

  const rawResults = data || [];
  // Supabase returns count as 'foreign_table_count' if not aliased.
  // With 'forum_posts(count)', it becomes 'forum_posts_count'
  const transformedResults: ForumTopic[] = rawResults.map((rawTopic: any) => {
    const { forum_posts, ...rest } = rawTopic; // if forum_posts(count) is used, it might be nested
    
    let postCount = 0;
    if (Array.isArray(forum_posts) && forum_posts.length > 0 && typeof forum_posts[0].count === 'number') {
        postCount = forum_posts[0].count;
    } else if (rawTopic.forum_posts_count !== undefined) { // Supabase might provide it as foreign_table_count
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
      profile: rest.profile,
      _count: { posts: postCount },
    };
    return topic;
  });
  return transformedResults;
};

const ForumSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const byUser = searchParams.get('byUser');
  const categoryId = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const hasActiveFilters = !!(query?.trim() || byUser?.trim() || categoryId?.trim() || startDate?.trim() || endDate?.trim());

  const { data: results, isLoading, isError, error } = useQuery({
    queryKey: ['forumSearch', query, byUser, categoryId, startDate, endDate],
    queryFn: () => fetchForumSearchResults({ query, byUser, categoryId, startDate, endDate }),
    enabled: hasActiveFilters, 
  });

  const renderFilterSummary = () => {
    const filters = [];
    if (query) filters.push(<span key="q">Term: <strong className="text-primary">{query}</strong></span>);
    if (byUser) filters.push(<span key="user">User: <strong className="text-primary">{byUser}</strong></span>);
    if (categoryId && results?.[0]?.category?.name) { // Attempt to show category name if available
        const catName = results.find(r => r.category_id === categoryId)?.category?.name;
        filters.push(<span key="cat">Category: <strong className="text-primary">{catName || categoryId}</strong></span>);
    } else if (categoryId) {
        // Fallback if category name isn't readily available from results (e.g. no results yet, or category data structure issue)
        // This part might need a separate fetch for category name if not included in results, or rely on categories fetched in search bar
        filters.push(<span key="cat">Category ID: <strong className="text-primary">{categoryId}</strong></span>);
    }
    if (startDate) filters.push(<span key="sd">From: <strong className="text-primary">{format(new Date(startDate), "PPP")}</strong></span>);
    if (endDate) filters.push(<span key="ed">To: <strong className="text-primary">{format(new Date(endDate), "PPP")}</strong></span>);

    if (filters.length === 0) return <p className="text-gray-700 dark:text-gray-300 mb-6">Please enter search criteria by starting a new search.</p>;
    
    return (
      <div className="text-gray-700 dark:text-gray-300 mb-6">
        Showing results for: {filters.map((f,i) => <React.Fragment key={i}>{f}{i < filters.length -1 && ", "}</React.Fragment>)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" asChild>
              <Link to="/members/forum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
              </Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/forum/initiate-search">
                <Search className="mr-2 h-4 w-4" />
                New Search
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forum Search Results
          </h1>
          
          {renderFilterSummary()}

          <div className="mt-8">
            {isLoading && hasActiveFilters && (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Searching for topics...</p>
              </div>
            )}

            {isError && hasActiveFilters && (
              <div className="flex flex-col items-center justify-center p-10 text-destructive">
                <SearchX className="h-8 w-8 mb-4" />
                <p>Could not fetch search results. Error: {error?.message}</p>
              </div>
            )}

            {!isLoading && !isError && hasActiveFilters && results && results.length > 0 && (
              <div className="space-y-4">
                {results.map((topic) => (
                  <ForumSearchResultItem key={topic.id} topic={topic} />
                ))}
              </div>
            )}

            {!isLoading && !isError && hasActiveFilters && results && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <SearchX className="h-8 w-8 mb-4" />
                <p>No topics found matching your search criteria.</p>
                <p className="text-sm mt-2">Try using different keywords or filters by starting a new search.</p>
              </div>
            )}
            
            {!hasActiveFilters && !isLoading && ( // Show this if no filters are active
               <div className="p-6 bg-card rounded-lg shadow">
                <p className="text-muted-foreground text-center">
                  Please initiate a new search using the button above or by going to the search page.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumSearchResultsPage;
